import { Logger } from '../utils/logger.js';
import { SupabaseClient } from '../database/supabase-client.js';

export class TikTokAPI {
  constructor() {
    this.logger = new Logger();
    this.db = new SupabaseClient();
    
    // Configuration
    this.clientKey = process.env.TIKTOK_CLIENT_KEY;
    this.clientSecret = process.env.TIKTOK_CLIENT_SECRET;
    this.sandboxMode = process.env.TIKTOK_SANDBOX_MODE === 'true';
    this.useMockAPI = !this.clientKey || !this.clientSecret;
    
    // API endpoints - Updated to use Content Posting API v2
    this.baseUrl = 'https://open.tiktokapis.com/v2';
    this.contentPostingUrl = 'https://open.tiktokapis.com/v2/post/publish';
      
    this.logger.info(`🔧 TikTok API initialized - ${this.useMockAPI ? 'Mock Mode' : 'Real API'} ${this.sandboxMode ? '(Sandbox)' : '(Production)'}`);
  }

  /**
   * Upload generated posts to TikTok drafts for all accounts
   */
  async uploadPostsToDrafts(generatedContent) {
    this.logger.info('📤 Uploading posts to TikTok drafts...');
    
    const results = [];

    for (const accountResult of generatedContent.results) {
      if (!accountResult.success) {
        results.push({
          account: accountResult.account,
          success: false,
          error: 'Content generation failed'
        });
        continue;
      }

      try {
        const uploadResults = await this.uploadAccountPosts(accountResult);
        results.push({
          account: accountResult.account,
          success: true,
          uploads: uploadResults
        });
      } catch (error) {
        this.logger.error(`❌ Failed to upload posts for ${accountResult.account}: ${error.message}`);
        results.push({
          account: accountResult.account,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  /**
   * Upload posts for a specific account
   */
  async uploadAccountPosts(accountResult) {
    const { account, posts } = accountResult;
    const uploadResults = [];

    this.logger.info(`📱 Uploading ${posts.length} posts for @${account}...`);

    for (const post of posts) {
      try {
        let result;
        
        if (this.useMockAPI) {
          result = await this.mockUploadPost(account, post);
        } else {
          result = await this.realUploadPost(account, post);
        }

        uploadResults.push(result);
        
        // Update database with upload info
        await this.updatePostWithTikTokInfo(post, result);
        
      } catch (error) {
        this.logger.error(`❌ Failed to upload post ${post.postNumber} for ${account}: ${error.message}`);
        uploadResults.push({
          postNumber: post.postNumber,
          success: false,
          error: error.message
        });
      }
    }

    return uploadResults;
  }

  /**
   * Mock implementation for testing
   */
  async mockUploadPost(accountUsername, post) {
    this.logger.info(`🎭 [MOCK] Uploading carousel post ${post.postNumber} for @${accountUsername}...`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const mockPublishId = `publish_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      postNumber: post.postNumber,
      success: true,
      publishId: mockPublishId,
      platform: 'tiktok',
      status: 'draft',
      uploadedAt: new Date().toISOString(),
      images: post.images.length,
      caption: post.caption.substring(0, 50) + '...',
      hashtags: post.hashtags.slice(0, 5),
      mock: true,
      type: 'carousel'
    };
  }

  /**
   * Real TikTok API implementation using Content Posting API v2
   */
  async realUploadPost(accountUsername, post) {
    this.logger.info(`🎯 [REAL] Uploading carousel post ${post.postNumber} for @${accountUsername}...`);
    
    // Get account's TikTok credentials
    const credentials = await this.getAccountCredentials(accountUsername);
    
    if (!credentials || !credentials.access_token) {
      throw new Error(`No TikTok access token found for ${accountUsername}. Account needs to authorize TikTok access first.`);
    }

    try {
      // Step 1: Initialize photo post with image URLs
      const publishResponse = await this.initializePhotoPost({
        images: post.images,
        caption: this.formatCaption(post.caption, post.hashtags),
        accountCredentials: credentials
      });

      // Step 2: Check post status (optional but recommended)
      const statusResponse = await this.checkPostStatus(publishResponse.publish_id, credentials);

      return {
        postNumber: post.postNumber,
        success: true,
        publishId: publishResponse.publish_id,
        platform: 'tiktok',
        status: statusResponse.status || 'draft',
        uploadedAt: new Date().toISOString(),
        images: post.images.length,
        caption: post.caption,
        hashtags: post.hashtags,
        mock: false,
        type: 'carousel'
      };

    } catch (error) {
      throw new Error(`TikTok API error: ${error.message}`);
    }
  }

  /**
   * Initialize photo post using Content Posting API v2
   */
  async initializePhotoPost({ images, caption, accountCredentials }) {
    this.logger.info('📝 Initializing photo post with Content Posting API v2...');
    
    // Convert image paths to URLs (assuming they're stored in Supabase storage)
    const imageUrls = images.map(img => {
      // If it's already a full URL, use it; otherwise assume it's a Supabase storage path
      if (img.imagePath.startsWith('http')) {
        return img.imagePath;
      } else {
        // Convert Supabase storage path to public URL
        return `https://oxskatabfilwdufzqdzd.supabase.co/storage/v1/object/public/fashion-images/${img.imagePath}`;
      }
    });

    const payload = {
      post_info: {
        title: caption,
        privacy_level: "PRIVATE_TO_SELF" // Saves as draft, recommended for Sandbox
      },
      media_type: "PHOTO",
      post_mode: "INBOX_POST", // Sends to drafts
      source_info: {
        source: "PULL_FROM_URL",
        image_urls: imageUrls
      },
      image_cover_index: 0 // Use first image as cover
    };

    this.logger.info(`📤 Uploading ${imageUrls.length} images to TikTok drafts...`);

    const response = await fetch(`${this.contentPostingUrl}/content/init/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accountCredentials.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok || result.error) {
      throw new Error(`Photo post initialization failed: ${result.error?.message || result.error || response.statusText}`);
    }

    this.logger.info(`✅ Photo post initialized - Publish ID: ${result.data.publish_id}`);
    return result.data;
  }

  /**
   * Check post status using Content Posting API v2
   */
  async checkPostStatus(publishId, accountCredentials) {
    this.logger.info(`🔍 Checking post status for ${publishId}...`);
    
    const payload = {
      publish_id: publishId
    };

    const response = await fetch(`${this.contentPostingUrl}/status/fetch/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accountCredentials.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (!response.ok || result.error) {
      this.logger.warn(`⚠️ Failed to check post status: ${result.error?.message || result.error}`);
      return { status: 'unknown' };
    }

    this.logger.info(`📊 Post status: ${result.data.status}`);
    return result.data;
  }

  /**
   * Generate OAuth URL for account authorization
   */
  generateAuthUrl(accountUsername, redirectUri) {
    const state = `${accountUsername}_${Date.now()}`;
    // Updated scopes to include video.upload for Content Posting API
    const scopes = 'user.info.basic,video.upload';
    
    const params = new URLSearchParams({
      client_key: this.clientKey,
      scope: scopes,
      response_type: 'code',
      redirect_uri: redirectUri,
      state: state
    });

    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
    
    this.logger.info(`🔗 Generated auth URL for @${accountUsername}: ${authUrl}`);
    return { authUrl, state };
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code, redirectUri) {
    const payload = {
      client_key: this.clientKey,
      client_secret: this.clientSecret,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri
    };

    const response = await fetch(`https://open.tiktokapis.com/v2/oauth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(`OAuth error: ${result.error.description}`);
    }

    return {
      access_token: result.data.access_token,
      refresh_token: result.data.refresh_token,
      expires_in: result.data.expires_in,
      token_type: result.data.token_type,
      scope: result.data.scope
    };
  }

  /**
   * Format caption with hashtags
   */
  formatCaption(caption, hashtags) {
    const hashtagString = hashtags.map(tag => tag.startsWith('#') ? tag : `#${tag}`).join(' ');
    return `${caption}\n\n${hashtagString}`;
  }

  /**
   * Get account's TikTok credentials
   */
  async getAccountCredentials(username) {
    const { data: account, error } = await this.db.client
      .from('account_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !account) {
      return null;
    }

    // Return stored access token from account profile
    return {
      access_token: account.tiktok_access_token,
      refresh_token: account.tiktok_refresh_token,
      client_key: this.clientKey,
      expires_at: account.tiktok_expires_at
    };
  }

  /**
   * Save TikTok credentials for an account
   */
  async saveAccountCredentials(username, credentials) {
    const expiresAt = new Date(Date.now() + (credentials.expires_in * 1000));
    
    const { error } = await this.db.client
      .from('account_profiles')
      .update({
        tiktok_access_token: credentials.access_token,
        tiktok_refresh_token: credentials.refresh_token,
        tiktok_expires_at: expiresAt.toISOString(),
        tiktok_connected_at: new Date().toISOString()
      })
      .eq('username', username);

    if (error) {
      throw new Error(`Failed to save credentials: ${error.message}`);
    }

    this.logger.info(`✅ Saved TikTok credentials for @${username}`);
  }

  /**
   * Download image from Supabase storage
   */
  async downloadImage(imagePath) {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`);
      }
      return await response.arrayBuffer();
    } catch (error) {
      throw new Error(`Image download failed: ${error.message}`);
    }
  }

  /**
   * Create form data for image upload
   */
  createImageFormData(imageData, filename) {
    const formData = new FormData();
    formData.append('media', new Blob([imageData]), filename);
    formData.append('media_type', 'image');
    return formData;
  }

  /**
   * Update database with TikTok upload information
   */
  async updatePostWithTikTokInfo(post, uploadResult) {
    const { error } = await this.db.client
      .from('generated_posts')
      .update({
        platform_post_id: uploadResult.publishId,
        posted_at: uploadResult.uploadedAt
      })
      .eq('account_username', post.accountUsername)
      .eq('generation_id', `daily_${Date.now()}_${post.postNumber}`);

    if (error) {
      this.logger.error(`Failed to update post in database: ${error.message}`);
    }
  }
} 