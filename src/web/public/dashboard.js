// Dashboard JavaScript for Content Pipeline
class ContentPipelineDashboard {
    constructor() {
        this.currentFilters = [];
        this.generatedContent = [];
        this.savedGenerations = [];
        this.engagementChart = null;
        this.selectedProcessingMethod = null;
        this.selectedStyle = null;
        this.accountCount = 0;
        this.init();
    }

    async init() {
        await this.loadDashboardData();
        this.setupEventListeners();
        this.initializeCharts();
        this.setupProcessingMethodSelection();
        this.setupThemeGeneration();
    }

    async loadDashboardData() {
        try {
            // Load metrics
            await this.loadMetrics();
            
            // Load trending data
            await this.loadTrendingData();
            
            // Load engagement chart data
            await this.loadEngagementData();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    async loadMetrics() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            
            document.getElementById('totalPosts').textContent = data.totalPosts || 0;
            document.getElementById('totalImages').textContent = data.totalImages || 0;
            document.getElementById('avgEngagement').textContent = (data.avgEngagement || 0).toFixed(1) + '%';
            document.getElementById('activeAccounts').textContent = data.activeAccounts || 0;
        } catch (error) {
            console.error('Error loading metrics:', error);
        }
    }

    async loadTrendingData() {
        try {
            const response = await fetch('/api/trending');
            const data = await response.json();
            
            this.displayAestheticTrends(data.aesthetics);
            this.displaySeasonTrends(data.seasons);
            this.displayColorTrends(data.colors);
            this.displayTopPerformingAesthetics(data.aesthetics);
            this.displayTopPerformingColors(data.colors);
        } catch (error) {
            console.error('Error loading trending data:', error);
        }
    }

    async loadEngagementData() {
        try {
            const response = await fetch('/api/engagement-trends');
            const data = await response.json();
            this.updateEngagementChart(data);
        } catch (error) {
            console.error('Error loading engagement data:', error);
        }
    }

    displayAestheticTrends(aesthetics) {
        const container = document.getElementById('aestheticTrends');
        container.innerHTML = '';
        
        aesthetics.forEach(aesthetic => {
            const trendClass = aesthetic.trend > 0 ? 'trend-up' : aesthetic.trend < 0 ? 'trend-down' : 'trend-neutral';
            const trendIcon = aesthetic.trend > 0 ? '↗' : aesthetic.trend < 0 ? '↘' : '→';
            
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2';
            div.innerHTML = `
                <span>${aesthetic.name}</span>
                <div>
                    <span class="trend-indicator ${trendClass}">
                        ${trendIcon} ${Math.abs(aesthetic.trend)}%
                    </span>
                    <small class="text-muted ms-2">${aesthetic.count} posts</small>
                </div>
            `;
            container.appendChild(div);
        });
    }

    displaySeasonTrends(seasons) {
        const container = document.getElementById('seasonTrends');
        container.innerHTML = '';
        
        seasons.forEach(season => {
            const trendClass = season.trend > 0 ? 'trend-up' : season.trend < 0 ? 'trend-down' : 'trend-neutral';
            const trendIcon = season.trend > 0 ? '↗' : season.trend < 0 ? '↘' : '→';
            
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2';
            div.innerHTML = `
                <span>${season.name}</span>
                <div>
                    <span class="trend-indicator ${trendClass}">
                        ${trendIcon} ${Math.abs(season.trend)}%
                    </span>
                    <small class="text-muted ms-2">${season.count} posts</small>
                </div>
            `;
            container.appendChild(div);
        });
    }

    displayColorTrends(colors) {
        const container = document.getElementById('colorTrends');
        container.innerHTML = '';
        
        colors.forEach(color => {
            const trendClass = color.trend > 0 ? 'trend-up' : color.trend < 0 ? 'trend-down' : 'trend-neutral';
            const trendIcon = color.trend > 0 ? '↗' : color.trend < 0 ? '↘' : '→';
            
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2';
            div.innerHTML = `
                <span style="color: ${color.name.toLowerCase()}; font-weight: bold;">${color.name}</span>
                <div>
                    <span class="trend-indicator ${trendClass}">
                        ${trendIcon} ${Math.abs(color.trend)}%
                    </span>
                    <small class="text-muted ms-2">${color.count} posts</small>
                </div>
            `;
            container.appendChild(div);
        });
    }

    displayTopPerformingAesthetics(aesthetics) {
        const container = document.getElementById('topPerformingAesthetics');
        container.innerHTML = '';
        
        // Sort by performance score and take top 5
        const topAesthetics = aesthetics
            .sort((a, b) => (b.avgPerformance || 0) - (a.avgPerformance || 0))
            .slice(0, 5);
        
        topAesthetics.forEach(aesthetic => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2';
            div.innerHTML = `
                <span>${aesthetic.name}</span>
                <div>
                    <span class="badge bg-success">${aesthetic.avgPerformance || 0}</span>
                    <small class="text-muted ms-2">${aesthetic.avgEngagement || 0}% engagement</small>
                </div>
            `;
            container.appendChild(div);
        });
    }

    displayTopPerformingColors(colors) {
        const container = document.getElementById('topPerformingColors');
        container.innerHTML = '';
        
        // Sort by performance score and take top 5
        const topColors = colors
            .sort((a, b) => (b.avgPerformance || 0) - (a.avgPerformance || 0))
            .slice(0, 5);
        
        topColors.forEach(color => {
            const div = document.createElement('div');
            div.className = 'd-flex justify-content-between align-items-center mb-2';
            div.innerHTML = `
                <span style="color: ${color.name.toLowerCase()}; font-weight: bold;">${color.name}</span>
                <div>
                    <span class="badge bg-success">${color.avgPerformance || 0}</span>
                    <small class="text-muted ms-2">${color.avgEngagement || 0}% engagement</small>
                </div>
            `;
            container.appendChild(div);
        });
    }

    initializeCharts() {
        const ctx = document.getElementById('engagementChart').getContext('2d');
        this.engagementChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Average Engagement Rate',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    updateEngagementChart(data) {
        this.engagementChart.data.labels = data.labels;
        this.engagementChart.data.datasets[0].data = data.values;
        this.engagementChart.update();
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const target = link.getAttribute('href').substring(1);
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });
                document.getElementById(target).classList.add('show', 'active');
                
                // Load data when specific tabs are opened
                if (target === 'filtering') {
                    this.loadFilterOptions();
                } else if (target === 'owned-accounts') {
                    loadAccountProfilesList();
                } else if (target === 'scraped-accounts') {
                    this.loadScrapedAccounts();
                } else if (target === 'pipeline') {
                    this.loadPipelineStatus();
                } else if (target === 'generation') {
                    this.loadGenerationFilterOptions();
                }
            });
        });
    }

    async loadFilterOptions() {
        try {
            const response = await fetch('/api/filter-options');
            const options = await response.json();
            
            // Store options globally for use in filter builder
            window.filterOptions = options;
        } catch (error) {
            console.error('Error loading filter options:', error);
        }
    }

    async loadAccounts() {
        try {
            const response = await fetch('/api/accounts');
            const accounts = await response.json();
            
            this.displayAccounts(accounts);
        } catch (error) {
            console.error('Error loading accounts:', error);
        }
    }
    
    async loadScrapedAccounts() {
        try {
            loadScrapedAccountsList();
        } catch (error) {
            console.error('Error loading scraped accounts:', error);
        }
    }

    displayAccounts(accounts) {
        const tableBody = document.getElementById('accountsTable');
        const accountCount = document.getElementById('accountCount');
        
        tableBody.innerHTML = '';
        accountCount.textContent = `${accounts.length} accounts`;
        
        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${account.username}</strong>
                    ${account.url ? `<br><small class="text-muted">${account.url}</small>` : ''}
                </td>
                <td>${account.last_scraped ? new Date(account.last_scraped).toLocaleDateString() : 'Never'}</td>
                <td><span class="badge bg-primary">${account.totalPosts}</span></td>
                <td><span class="badge bg-info">${account.totalImages}</span></td>
                <td><span class="badge bg-success">${account.avgEngagement}%</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAccount('${account.username}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    async loadPipelineStatus() {
        try {
            const response = await fetch('/api/pipeline/status');
            const status = await response.json();
            
            this.displayPipelineStatus(status);
        } catch (error) {
            console.error('Error loading pipeline status:', error);
        }
    }

    displayPipelineStatus(status) {
        const pipelineRuns = document.getElementById('pipelineRuns');
        
        // Status overview
        const statusOverview = `
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h4>${status.totalAccounts}</h4>
                            <p class="mb-0">Total Accounts</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h4>${status.totalPosts}</h4>
                            <p class="mb-0">Total Posts</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h4>${status.totalImages}</h4>
                            <p class="mb-0">Total Images</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card bg-light">
                        <div class="card-body text-center">
                            <h4>${status.isRunning ? '🔄' : '✅'}</h4>
                            <p class="mb-0">${status.isRunning ? 'Running' : 'Idle'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Recent runs table
        let recentRunsTable = '';
        if (status.recentRuns && status.recentRuns.length > 0) {
            recentRunsTable = `
                <div class="table-responsive">
                    <table class="table table-sm">
                        <thead>
                            <tr>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Started</th>
                                <th>Duration</th>
                                <th>Processed</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${status.recentRuns.map(run => `
                                <tr>
                                    <td>
                                        <span class="badge bg-secondary">${run.type}</span>
                                    </td>
                                    <td>
                                        <span class="badge ${run.status === 'completed' ? 'bg-success' : run.status === 'failed' ? 'bg-danger' : 'bg-warning'}">
                                            ${run.status_icon} ${run.status}
                                        </span>
                                    </td>
                                    <td>${new Date(run.started_at).toLocaleString()}</td>
                                    <td>${run.duration_seconds ? Math.round(run.duration_seconds) + 's' : '-'}</td>
                                    <td>
                                        ${run.accounts_processed ? `A: ${run.accounts_processed}` : ''}
                                        ${run.posts_processed ? `P: ${run.posts_processed}` : ''}
                                        ${run.images_processed ? `I: ${run.images_processed}` : ''}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } else {
            recentRunsTable = '<p class="text-muted">No recent pipeline runs</p>';
        }
        
        pipelineRuns.innerHTML = statusOverview + recentRunsTable;
    }

    addLog(message, type = 'info') {
        const logsContainer = document.getElementById('pipelineLogs');
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = document.createElement('div');
        
        let color = 'text-light';
        if (type === 'error') color = 'text-danger';
        else if (type === 'success') color = 'text-success';
        else if (type === 'warning') color = 'text-warning';
        
        logEntry.className = color;
        logEntry.innerHTML = `[${timestamp}] ${message}`;
        
        logsContainer.appendChild(logEntry);
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    async loadGenerationFilterOptions() {
        try {
            const response = await fetch('/api/filter-options');
            const options = await response.json();
            
            // Load account profiles
            await this.loadAccountProfiles();
            
            // Helper to fill a select
            function fillSelect(id, values) {
                const select = document.getElementById(id);
                if (!select) return;
                select.innerHTML = '';
                values.forEach(val => {
                    const opt = document.createElement('option');
                    opt.value = val;
                    opt.textContent = val;
                    select.appendChild(opt);
                });
            }
            fillSelect('genColor', options.colors);
            fillSelect('genOccasion', options.occasions);
            fillSelect('genSeason', options.seasons);
            fillSelect('genAdditional', options.additional);
        } catch (error) {
            console.error('Error loading generation filter options:', error);
        }
    }
    
    async loadAccountProfiles() {
        try {
            const response = await fetch('/api/account-profiles');
            const profiles = await response.json();
            
            const targetAccountSelect = document.getElementById('targetAccount');
            if (!targetAccountSelect) return;
            
            // Clear existing options except the first one
            targetAccountSelect.innerHTML = '<option value="">Select an account...</option>';
            
            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.username;
                option.textContent = `${profile.display_name} (@${profile.username})`;
                option.dataset.profile = JSON.stringify(profile);
                targetAccountSelect.appendChild(option);
            });
            
            // Add event listener for account selection
            targetAccountSelect.addEventListener('change', this.onAccountSelected.bind(this));
            
        } catch (error) {
            console.error('Error loading account profiles:', error);
        }
    }
    
    onAccountSelected(event) {
        const selectedOption = event.target.selectedOptions[0];
        const generateBtn = document.getElementById('generateForAccountBtn');
        const profileDiv = document.getElementById('accountProfile');
        
        if (selectedOption.value === '') {
            generateBtn.disabled = true;
            profileDiv.style.display = 'none';
            return;
        }
        
        generateBtn.disabled = false;
        profileDiv.style.display = 'block';
        
        // Parse profile data
        const profile = JSON.parse(selectedOption.dataset.profile);
        
        // Display profile information
        document.getElementById('targetAudience').innerHTML = `
            <small class="text-muted">Age:</small> ${profile.target_audience.age}<br>
            <small class="text-muted">Interests:</small> ${profile.target_audience.interests.join(', ')}<br>
            <small class="text-muted">Location:</small> ${profile.target_audience.location}
        `;
        
        document.getElementById('contentFocus').innerHTML = `
            <small class="text-muted">Aesthetics:</small> ${profile.content_strategy.aestheticFocus.join(', ')}<br>
            <small class="text-muted">Colors:</small> ${profile.content_strategy.colorPalette.join(', ')}
        `;
        
        document.getElementById('performanceGoal').innerHTML = `
            <small class="text-muted">Primary:</small> ${profile.performance_goals.primaryMetric}<br>
            <small class="text-muted">Target:</small> ${(profile.performance_goals.targetRate * 100).toFixed(1)}%<br>
            <small class="text-muted">Secondary:</small> ${profile.performance_goals.secondaryMetric}
        `;
        
        document.getElementById('bestTimes').innerHTML = `
            ${profile.posting_schedule.bestTimes.join(', ')}<br>
            <small class="text-muted">Frequency:</small> ${profile.posting_schedule.frequency}
        `;
    }

    setupProcessingMethodSelection() {
        // Add click handlers for processing method cards
        document.querySelectorAll('.processing-method-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectProcessingMethod(card.dataset.method);
            });
        });

        // Load account count for smart recommendations
        this.loadAccountCount();
    }

    async loadAccountCount() {
        try {
            const response = await fetch('/api/metrics');
            const data = await response.json();
            this.accountCount = data.activeAccounts || 0;
            this.updateSmartRecommendations();
        } catch (error) {
            console.error('Error loading account count:', error);
        }
    }

    selectProcessingMethod(method) {
        // Remove previous selection
        document.querySelectorAll('.processing-method-card').forEach(card => {
            card.classList.remove('selected');
        });

        // Add selection to clicked card
        document.querySelector(`[data-method="${method}"]`).classList.add('selected');
        this.selectedProcessingMethod = method;

        // Handle auto method
        if (method === 'auto') {
            method = this.getRecommendedMethod();
        }

        // Update buttons and recommendations
        this.updateButtonStates();
        this.updateSmartRecommendations();

        console.log(`Selected processing method: ${method}`);
    }

    getRecommendedMethod() {
        // Smart algorithm to choose best method
        if (this.accountCount <= 5) {
            return 'fast'; // Few accounts = fast processing
        } else if (this.accountCount <= 50) {
            return 'fast'; // Medium accounts = still fast (user probably wants immediate results)
        } else {
            return 'batch'; // Many accounts = batch processing for cost savings
        }
    }

    updateSmartRecommendations() {
        const recommendationDiv = document.getElementById('methodRecommendation');
        const pipelineRecommendationDiv = document.getElementById('pipelineRecommendation');
        const recommendationText = document.getElementById('recommendationText');
        const pipelineRecommendationText = document.getElementById('pipelineRecommendationText');

        if (!recommendationDiv || !pipelineRecommendationDiv) return;

        let recommendation = '';
        let icon = '';

        if (this.accountCount === 0) {
            recommendation = 'Add some accounts first to get processing recommendations.';
            icon = '📝';
        } else if (this.accountCount <= 5) {
            recommendation = `With ${this.accountCount} accounts (~${this.accountCount * 50} images), Fast Processing is recommended for immediate results.`;
            icon = '⚡';
        } else if (this.accountCount <= 50) {
            recommendation = `With ${this.accountCount} accounts (~${this.accountCount * 50} images), Fast Processing will give you results in ~25 minutes.`;
            icon = '⚡';
        } else {
            const estimatedImages = this.accountCount * 50;
            const savings = (estimatedImages * 0.000025 * 0.5).toFixed(2); // 50% savings calculation
            recommendation = `With ${this.accountCount} accounts (~${estimatedImages.toLocaleString()} images), Batch Processing will save you $${savings} (50% cost reduction).`;
            icon = '💰';
        }

        if (recommendationText) {
            recommendationText.innerHTML = `${icon} ${recommendation}`;
            recommendationDiv.style.display = 'block';
        }

        if (pipelineRecommendationText) {
            pipelineRecommendationText.innerHTML = `${icon} ${recommendation}`;
            pipelineRecommendationDiv.style.display = 'block';
        }
    }

    updateButtonStates() {
        const generateBtn = document.getElementById('generateBtn');
        const runPipelineBtn = document.getElementById('runPipelineBtn');
        const runAnalysisBtn = document.getElementById('runAnalysisBtn');

        // Enable/disable content generation button
        if (generateBtn) {
            const canGenerate = this.selectedStyle; // Remove processing method requirement for traditional generation
            generateBtn.disabled = !canGenerate;
            
            const helpText = generateBtn.nextElementSibling;
            if (helpText) {
                if (!this.selectedStyle) {
                    helpText.textContent = 'Select a style category first';
                } else {
                    helpText.textContent = `Ready to generate ${this.selectedStyle} content`;
                }
            }
        }

        // Enable/disable pipeline buttons - always enabled since processing method is optional
        if (runPipelineBtn && runAnalysisBtn) {
            runPipelineBtn.disabled = false;
            runAnalysisBtn.disabled = false;

            // Update button text
            if (this.selectedProcessingMethod && this.selectedProcessingMethod !== 'auto') {
                const methodName = this.selectedProcessingMethod.charAt(0).toUpperCase() + this.selectedProcessingMethod.slice(1);
                runPipelineBtn.innerHTML = `<i class="fas fa-play me-2"></i>Run ${methodName} Pipeline`;
                runAnalysisBtn.innerHTML = `<i class="fas fa-brain me-2"></i>Run ${methodName} Analysis`;
            } else if (this.selectedProcessingMethod === 'auto') {
                const recommended = this.getRecommendedMethod();
                const methodName = recommended.charAt(0).toUpperCase() + recommended.slice(1);
                runPipelineBtn.innerHTML = `<i class="fas fa-play me-2"></i>Run ${methodName} Pipeline (Smart)`;
                runAnalysisBtn.innerHTML = `<i class="fas fa-brain me-2"></i>Run ${methodName} Analysis (Smart)`;
            } else {
                runPipelineBtn.innerHTML = `<i class="fas fa-play me-2"></i>Run Pipeline`;
                runAnalysisBtn.innerHTML = `<i class="fas fa-brain me-2"></i>Run Analysis`;
            }
        }
    }
}

// Filter Builder Functions
let filterGroupCounter = 0;

function addFilterGroup() {
    const filterGroups = document.getElementById('filterGroups');
    const groupId = `filter-group-${filterGroupCounter++}`;
    
    const groupDiv = document.createElement('div');
    groupDiv.className = 'filter-group';
    groupDiv.id = groupId;
    
    groupDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h6>Filter Group</h6>
            <button class="btn btn-sm btn-outline-danger" onclick="removeFilterGroup('${groupId}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="row">
            <div class="col-md-3">
                <label class="form-label">Field</label>
                <select class="form-select filter-field">
                    <option value="aesthetic">Aesthetic</option>
                    <option value="season">Season</option>
                    <option value="occasion">Occasion</option>
                    <option value="colors">Colors</option>
                    <option value="additional">Additional Traits</option>
                    <option value="performance_score">Performance Score</option>
                    <option value="engagement_rate">Engagement Rate</option>
                    <option value="like_count">Like Count</option>
                    <option value="view_count">View Count</option>
                    <option value="comment_count">Comment Count</option>
                    <option value="save_count">Save Count</option>
                    <option value="username">Username</option>
                    <option value="created_at">Date Created</option>
                </select>
            </div>
            <div class="col-md-3">
                <label class="form-label">Operator</label>
                <select class="form-select filter-operator">
                    <option value="equals">Equals</option>
                    <option value="contains">Contains</option>
                    <option value="greater_than">Greater Than</option>
                    <option value="less_than">Less Than</option>
                    <option value="between">Between</option>
                    <option value="in">In</option>
                </select>
            </div>
            <div class="col-md-4">
                <label class="form-label">Value</label>
                <input type="text" class="form-control filter-value" placeholder="Enter value">
            </div>
            <div class="col-md-2">
                <label class="form-label">Logic</label>
                <select class="form-select filter-logic">
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                </select>
            </div>
        </div>
    `;
    
    filterGroups.appendChild(groupDiv);
}

function removeFilterGroup(groupId) {
    document.getElementById(groupId).remove();
}

function clearFilters() {
    document.getElementById('filterGroups').innerHTML = '';
}

async function applyFilters() {
    const filterGroups = document.querySelectorAll('.filter-group');
    const filters = [];
    
    filterGroups.forEach(group => {
        const field = group.querySelector('.filter-field').value;
        const operator = group.querySelector('.filter-operator').value;
        const value = group.querySelector('.filter-value').value;
        const logic = group.querySelector('.filter-logic').value;
        
        if (value.trim()) {
            filters.push({
                field,
                operator,
                value: value.trim(),
                logic
            });
        }
    });
    
    if (filters.length === 0) {
        showError('Please add at least one filter');
        return;
    }
    
    try {
        const response = await fetch('/api/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ filters })
        });
        
        const data = await response.json();
        displayFilteredResults(data.images);
        document.getElementById('resultCount').textContent = `${data.images.length} results`;
        
    } catch (error) {
        console.error('Error applying filters:', error);
        showError('Failed to apply filters');
    }
}

function displayFilteredResults(images) {
    const container = document.getElementById('filteredResults');
    container.innerHTML = '';
    
    images.forEach(image => {
        const imageCard = createImageCard(image);
        container.appendChild(imageCard);
    });
}

function createImageCard(image) {
    const div = document.createElement('div');
    div.className = 'image-card';
    
    // Get engagement rate from either image or posts object
    const engagementRate = image.engagement_rate || (image.posts && image.posts.engagement_rate);
    
    div.innerHTML = `
        <img src="${image.image_path}" 
             alt="Fashion image" 
             data-post-id="${image.post_id || ''}"
             data-username="${image.username || ''}"
             onerror="this.src='https://via.placeholder.com/200x200?text=Image+Not+Found'">
        <div class="image-info">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <small class="text-muted">@${image.username}</small>
                    <div class="mt-1">
                        <span class="badge bg-primary">${image.aesthetic || 'N/A'}</span>
                        <span class="badge bg-secondary">${image.season || 'N/A'}</span>
                    </div>
                </div>
                <div class="text-end">
                    <small class="text-muted">${engagementRate ? engagementRate.toFixed(1) + '%' : 'N/A'}</small>
                </div>
            </div>
        </div>
    `;
    return div;
}

// Simplified Style Selection
document.addEventListener('DOMContentLoaded', function() {
    // Style button selection
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active from all buttons
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('btn-primary', 'active'));
            document.querySelectorAll('.style-btn').forEach(b => b.classList.add('btn-outline-primary'));
            
            // Add active to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary', 'active');
            
            // Update selected style display
            const style = this.dataset.style;
            document.getElementById('selectedStyle').textContent = this.textContent;
            
            // Update dashboard instance if it exists
            if (window.dashboard) {
                window.dashboard.selectedStyle = style;
                window.dashboard.updateButtonStates();
            }
        });
    });
});

// Theme Generation Setup and Functions
async function setupThemeGeneration() {
    try {
        // Load accounts for target account dropdown
        await loadAccountsForThemeGeneration();
        
        // Load available themes
        await loadAvailableThemes();
        
        // Load hook slide stats
        await loadHookSlideStats();
        
        // Setup event listeners for theme generation
        setupThemeGenerationEventListeners();
        
    } catch (error) {
        console.error('Error setting up theme generation:', error);
    }
}

async function loadAccountsForThemeGeneration() {
    try {
        // Load from account profiles instead of scraped accounts
        const response = await fetch('/api/account-profiles');
        const data = await response.json();
        
        const select = document.getElementById('targetAccount');
        select.innerHTML = '<option value="">Select account...</option>';
        
        if (data && data.length > 0) {
            data.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.username;
                option.textContent = `@${profile.username} - ${profile.content_strategy || 'No strategy'}`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No accounts found - add accounts in Owned Accounts tab first</option>';
        }
    } catch (error) {
        console.error('Error loading accounts:', error);
        const select = document.getElementById('targetAccount');
        select.innerHTML = '<option value="">Error loading accounts</option>';
    }
}

async function loadAvailableThemes() {
    try {
        const response = await fetch('/api/available-themes');
        const data = await response.json();
        
        const select = document.getElementById('specificThemeSelect');
        select.innerHTML = '<option value="">Select theme...</option>';
        
        if (data.success && data.themes && data.themes.length > 0) {
            data.themes.forEach(theme => {
                const option = document.createElement('option');
                option.value = theme.theme;
                option.textContent = `${theme.theme} (${theme.target_vibe}) - ${theme.count} slides`;
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No themes available - run hook slide detection first</option>';
            
            // Show a helpful message if no themes are available
            if (data.success && (!data.themes || data.themes.length === 0)) {
                showError('No theme data available yet. Please go to Pipeline Management tab and run "Hook Slide Detection" first to analyze your existing images for text overlays that can be used as themes.');
            }
        }
    } catch (error) {
        console.error('Error loading themes:', error);
        document.getElementById('specificThemeSelect').innerHTML = '<option value="">Error loading themes - check if enhanced pipeline has been run</option>';
        
        // Show a helpful error message
        showError('Unable to load themes. This usually means the hook slide detection hasn\'t been run yet. Please go to Pipeline Management tab and run "Hook Slide Detection" first.');
    }
}

async function loadHookSlideStats() {
    try {
        const response = await fetch('/api/hook-slides');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('hookSlidesCount').textContent = data.stats.totalHookSlides || 0;
            document.getElementById('availableThemes').textContent = data.stats.availableThemes || 0;
            
            // Show stats preview if we have data
            if (data.stats.totalHookSlides > 0) {
                document.getElementById('themeStatsPreview').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error loading hook slide stats:', error);
    }
}

function setupThemeGenerationEventListeners() {
    // Target account selection
    document.getElementById('targetAccount').addEventListener('change', function() {
        const selected = this.value;
        const generateBtn = document.getElementById('generateThemeBtn');
        const hint = generateBtn.nextElementSibling;
        
        if (selected) {
            generateBtn.disabled = false;
            hint.textContent = 'Ready to generate theme-based content';
            
            // Update account compatibility
            updateAccountCompatibility(selected);
        } else {
            generateBtn.disabled = true;
            hint.textContent = 'Select a target account first';
        }
    });
    
    // Generation mode toggle
    document.querySelectorAll('input[name="generationMode"]').forEach(radio => {
        radio.addEventListener('change', function() {
            const themeRow = document.getElementById('themeSelectionRow');
            if (this.value === 'specific') {
                themeRow.style.display = 'block';
            } else {
                themeRow.style.display = 'none';
            }
        });
    });
}

async function updateAccountCompatibility(accountUsername) {
    try {
        // This would ideally check how well the account matches available themes
        // For now, show a simple compatibility indicator
        document.getElementById('accountCompatibility').textContent = 'Analyzing...';
        
        // Simulate analysis
        setTimeout(() => {
            const compatibilities = ['Excellent', 'Good', 'Fair', 'Needs More Data'];
            const randomCompatibility = compatibilities[Math.floor(Math.random() * compatibilities.length)];
            document.getElementById('accountCompatibility').textContent = randomCompatibility;
        }, 1000);
        
    } catch (error) {
        console.error('Error updating account compatibility:', error);
        document.getElementById('accountCompatibility').textContent = 'Unknown';
    }
}

async function generateThemeContent() {
    const targetAccount = document.getElementById('targetAccount').value;
    if (!targetAccount) {
        showError('Please select a target account first');
        return;
    }
    
    const generationMode = document.querySelector('input[name="generationMode"]:checked').value;
    const imageCount = parseInt(document.getElementById('themeImageCount').value);
    const colorCoordination = document.getElementById('colorCoordination').value;
    const aestheticOverride = document.getElementById('aestheticOverride').value;
    const contentStrategy = document.getElementById('contentStrategy').value;
    
    let preferredTheme = null;
    if (generationMode === 'specific') {
        preferredTheme = document.getElementById('specificThemeSelect').value;
        if (!preferredTheme) {
            showError('Please select a specific theme');
            return;
        }
    }
    
    try {
        // Show loading state
        const generateBtn = document.getElementById('generateThemeBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating Theme Content...';
        generateBtn.disabled = true;
        
        const requestBody = {
            accountUsername: targetAccount,
            imageCount,
            aestheticPreference: aestheticOverride || null,
            preferredTheme: preferredTheme
        };
        
        // Handle color scheme
        if (colorCoordination !== 'auto' && colorCoordination !== 'mixed') {
            requestBody.colorScheme = {
                primary_bg_color: colorCoordination,
                bg_brightness: colorCoordination === 'white' ? 'light' : 'medium'
            };
        }
        
        const response = await fetch('/api/generate-theme-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            displayThemeGeneratedContent(data);
            document.getElementById('generationPreview').style.display = 'block';
            showSuccess(`Generated ${data.images.length} ${data.theme || 'themed'} images for @${targetAccount}!`);
        } else {
            showError(data.error || 'Failed to generate theme content');
        }
        
        // Restore button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating theme content:', error);
        showError('Failed to generate theme content: ' + error.message);
        
        // Restore button
        const generateBtn = document.getElementById('generateThemeBtn');
        generateBtn.innerHTML = '<i class="fas fa-sparkles me-2"></i>Generate Theme-Based Content';
        generateBtn.disabled = false;
    }
}

function displayThemeGeneratedContent(data) {
    const container = document.getElementById('generatedContent');
    container.innerHTML = '';
    
    // Add theme information header
    if (data.theme) {
        const themeHeader = document.createElement('div');
        themeHeader.className = 'alert alert-success mb-3';
        themeHeader.innerHTML = `
            <div class="row">
                <div class="col-md-8">
                    <h6><i class="fas fa-sparkles me-2"></i>Theme: ${data.theme}</h6>
                    <small>Target Vibe: ${data.targetVibe || 'Mixed'} • Account: @${data.accountAdaptation?.targetAudience || 'General'}</small>
                </div>
                <div class="col-md-4 text-end">
                    <small>
                        ${data.colorScheme ? `Color: ${data.colorScheme.primary_bg_color}` : 'Mixed Colors'}<br>
                        Strategy: ${data.accountAdaptation?.aestheticFocus?.join(', ') || 'Balanced'}
                    </small>
                </div>
            </div>
        `;
        container.appendChild(themeHeader);
    }
    
    // Display images
    displayGeneratedContent(data.images);
}

// Add this to the ContentPipelineDashboard class
if (typeof ContentPipelineDashboard !== 'undefined') {
    ContentPipelineDashboard.prototype.setupThemeGeneration = setupThemeGeneration;
}

// Simplified Content Generation Function
async function generateSimpleContent() {
    const selectedStyleBtn = document.querySelector('.style-btn.active');
    if (!selectedStyleBtn) {
        showError('Please select a style category first');
        return;
    }
    
    const style = selectedStyleBtn.dataset.style;
    const imageCount = parseInt(document.getElementById('imageCount').value);
    const performanceMetric = document.getElementById('performanceMetric').value;
    const diversityLevel = document.getElementById('diversityLevel').value;
    const maxPerPost = parseInt(document.getElementById('maxPerPost').value);
    
    // Map style categories to aesthetic filters
    const styleMapping = {
        'streetwear': ['streetwear', 'urban', 'street style'],
        'casual': ['casual', 'everyday', 'relaxed'],
        'elegant': ['elegant', 'chic', 'sophisticated', 'elevated'],
        'vintage': ['vintage', 'retro', 'classic'],
        'y2k': ['y2k', '2000s', 'nostalgic'],
        'all': [] // Empty means all aesthetics
    };
    
    const filters = {
        aesthetics: styleMapping[style] || [],
        colors: [],
        occasions: [],
        seasons: [],
        additional: [],
        usernames: []
    };
    
    try {
        // Show loading state
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.innerHTML;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Generating...';
        generateBtn.disabled = true;
        
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                imageCount,
                performanceMetric,
                diversityLevel,
                maxPerPost,
                filters
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayGeneratedContent(data.images);
            document.getElementById('generationPreview').style.display = 'block';
            showSuccess(`Generated ${data.images.length} ${style === 'all' ? 'mixed style' : style} images!`);
        } else {
            showError(data.error || 'Failed to generate content');
        }
        
        // Restore button
        generateBtn.innerHTML = originalText;
        generateBtn.disabled = false;
        
    } catch (error) {
        console.error('Error generating content:', error);
        showError('Failed to generate content: ' + error.message);
        
        // Restore button
        const generateBtn = document.getElementById('generateBtn');
        generateBtn.innerHTML = '<i class="fas fa-magic me-2"></i>Generate Content';
        generateBtn.disabled = false;
    }
}

function displayGeneratedContent(images) {
    const container = document.getElementById('generatedContent');
    container.innerHTML = '';
    
    images.forEach(image => {
        const imageCard = createImageCard(image);
        container.appendChild(imageCard);
    });
}

async function saveGeneration() {
    const images = Array.from(document.querySelectorAll('#generatedContent .image-card img')).map(img => ({
        image_path: img.src,
        post_id: img.dataset.postId,
        username: img.dataset.username
    }));
    
    const generation = {
        id: Date.now(),
        name: `Generation ${new Date().toLocaleDateString()}`,
        images,
        settings: {
            imageCount: document.getElementById('imageCount').value,
            performanceMetric: document.getElementById('performanceMetric').value,
            diversityLevel: document.getElementById('diversityLevel').value,
            maxPerPost: document.getElementById('maxPerPost').value
        },
        createdAt: new Date().toISOString()
    };
    
    try {
        await fetch('/api/save-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(generation)
        });
        
        showSuccess('Generation saved successfully!');
        loadSavedGenerations();
        
    } catch (error) {
        console.error('Error saving generation:', error);
        showError('Failed to save generation');
    }
}

async function exportGeneration() {
    const images = Array.from(document.querySelectorAll('#generatedContent .image-card img'));
    
    try {
        const response = await fetch('/api/export-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                images: images.map(img => ({
                    image_path: img.src,
                    post_id: img.dataset.postId
                }))
            })
        });
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `generated-content-${new Date().toISOString().split('T')[0]}.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            showSuccess('Images exported successfully!');
        }
        
    } catch (error) {
        console.error('Error exporting generation:', error);
        showError('Failed to export images');
    }
}

async function loadSavedGenerations() {
    try {
        const response = await fetch('/api/saved-generations');
        const generations = await response.json();
        
        const container = document.getElementById('savedGenerations');
        container.innerHTML = '';
        
        generations.forEach(generation => {
            const div = document.createElement('div');
            div.className = 'card mb-3';
            div.innerHTML = `
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <h6>${generation.name}</h6>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="loadGeneration(${generation.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteGeneration(${generation.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <small class="text-muted">${generation.images.length} images • ${new Date(generation.createdAt).toLocaleDateString()}</small>
                </div>
            `;
            container.appendChild(div);
        });
        
    } catch (error) {
        console.error('Error loading saved generations:', error);
    }
}

// Account Management Functions
async function addAccount() {
    const username = document.getElementById('newUsername').value.trim();
    const url = document.getElementById('newAccountUrl').value.trim();
    
    if (!username) {
        showError('Username is required');
        return;
    }
    
    try {
        const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, url })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Account added successfully');
            document.getElementById('newUsername').value = '';
            document.getElementById('newAccountUrl').value = '';
            dashboard.loadAccounts(); // Refresh the list
        } else {
            showError(result.error || 'Failed to add account');
        }
    } catch (error) {
        showError('Failed to add account: ' + error.message);
    }
}

async function deleteAccount(username) {
    if (!confirm(`Are you sure you want to delete account "${username}" and all its data?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/accounts/${username}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Account deleted successfully');
            dashboard.loadAccounts(); // Refresh the list
        } else {
            const result = await response.json();
            showError(result.error || 'Failed to delete account');
        }
    } catch (error) {
        showError('Failed to delete account: ' + error.message);
    }
}

// Account Profile Management Functions
async function createAccountProfile() {
    const formData = {
        username: document.getElementById('profileUsername').value.trim(),
        displayName: document.getElementById('profileDisplayName').value.trim(),
        platform: 'TikTok', // Default platform
        accountType: 'personal', // Default account type
        targetAudience: {
            age: document.getElementById('targetAge').value,
            interests: document.getElementById('targetInterests').value.split(',').map(i => i.trim()),
            location: document.getElementById('targetLocation').value.trim(),
            demographics: 'General' // Default demographics
        },
        contentStrategy: {
            aestheticFocus: document.getElementById('aestheticFocus').value.split(',').map(a => a.trim()),
            colorPalette: document.getElementById('colorPalette').value.split(',').map(c => c.trim()),
            contentTypes: ['fashion', 'outfit'], // Default content types
            postingStyle: 'casual', // Default posting style
            brandVoice: 'authentic' // Default brand voice
        },
        performanceGoals: {
            primaryMetric: document.getElementById('primaryMetric').value,
            targetRate: parseFloat(document.getElementById('targetRate').value) / 100,
            secondaryMetric: document.getElementById('secondaryMetric').value,
            benchmarkData: '' // No benchmark data field in current form
        },
        postingSchedule: {
            frequency: document.getElementById('postingFrequency').value,
            bestTimes: document.getElementById('bestTimes').value.split(',').map(t => t.trim()),
            timezone: 'America/New_York' // Default timezone
        }
    };

    if (!formData.username || !formData.displayName) {
        showError('Username and display name are required');
        return;
    }

    try {
        const response = await fetch('/api/account-profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Account profile created successfully');
            document.getElementById('profileForm').reset();
            loadAccountProfilesList();
        } else {
            showError(result.error || 'Failed to create account profile');
        }
    } catch (error) {
        showError('Failed to create account profile: ' + error.message);
    }
}

async function loadAccountProfilesList() {
    try {
        const response = await fetch('/api/account-profiles');
        const profiles = await response.json();
        
        const profilesTable = document.getElementById('profilesTable');
        if (!profilesTable) return;
        
        profilesTable.innerHTML = '';
        
        // Update profile count
        const profileCount = document.getElementById('profileCount');
        if (profileCount) {
            profileCount.textContent = `${profiles.length} profiles`;
        }
        
        profiles.forEach(profile => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>@${profile.username}</td>
                <td>${profile.display_name || 'N/A'}</td>
                <td>${profile.target_audience?.age || 'N/A'}, ${profile.target_audience?.location || 'N/A'}</td>
                <td>${profile.content_strategy?.aestheticFocus?.join(', ') || 'N/A'}</td>
                <td>${profile.performance_goals?.primaryMetric || 'N/A'} ${profile.performance_goals?.targetRate ? (profile.performance_goals.targetRate * 100).toFixed(1) + '%' : 'N/A'}</td>
                <td id="tiktok-status-${profile.username}">
                    <span class="badge bg-secondary">Checking...</span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editAccountProfile('${profile.username}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger me-1" onclick="deleteAccountProfile('${profile.username}')">
                        <i class="fas fa-trash"></i>
                    </button>
                    <div class="btn-group" role="group">
                        <button id="tiktok-connect-btn-${profile.username}" class="btn btn-sm btn-outline-success" 
                                onclick="connectTikTokAccount('${profile.username}')" style="display: none;">
                            <i class="fas fa-link"></i> Connect
                        </button>
                        <button id="tiktok-disconnect-btn-${profile.username}" class="btn btn-sm btn-outline-warning" 
                                onclick="disconnectTikTokAccount('${profile.username}')" style="display: none;">
                            <i class="fas fa-unlink"></i> Disconnect
                        </button>
                        <button id="tiktok-test-btn-${profile.username}" class="btn btn-sm btn-outline-info" 
                                onclick="testCarouselUpload('${profile.username}')" style="display: none;">
                            <i class="fas fa-upload"></i> Test Upload
                        </button>
                    </div>
                </td>
            `;
            profilesTable.appendChild(row);
            
            // Check TikTok status for this profile
            checkTikTokStatus(profile.username);
        });
    } catch (error) {
        console.error('Error loading account profiles:', error);
    }
}

async function editAccountProfile(username) {
    try {
        const response = await fetch(`/api/account-profiles/${username}`);
        const profile = await response.json();
        
        if (!response.ok) {
            showError('Failed to load profile for editing');
            return;
        }
        
        // Fill the form with existing data
        document.getElementById('profileUsername').value = profile.username;
        document.getElementById('profileDisplayName').value = profile.display_name;
        document.getElementById('profilePlatform').value = profile.platform;
        document.getElementById('profileAccountType').value = profile.account_type;
        document.getElementById('profileAge').value = profile.target_audience.age;
        document.getElementById('profileInterests').value = profile.target_audience.interests.join(', ');
        document.getElementById('profileLocation').value = profile.target_audience.location;
        document.getElementById('profileDemographics').value = profile.target_audience.demographics;
        document.getElementById('profilePostingStyle').value = profile.content_strategy.postingStyle;
        document.getElementById('profileBrandVoice').value = profile.content_strategy.brandVoice;
        document.getElementById('profilePrimaryMetric').value = profile.performance_goals.primaryMetric;
        document.getElementById('profileTargetRate').value = profile.performance_goals.targetRate * 100;
        document.getElementById('profileSecondaryMetric').value = profile.performance_goals.secondaryMetric;
        document.getElementById('profileBenchmark').value = profile.performance_goals.benchmarkData;
        document.getElementById('profileFrequency').value = profile.posting_schedule.frequency;
        document.getElementById('profileBestTimes').value = profile.posting_schedule.bestTimes.join(', ');
        document.getElementById('profileTimezone').value = profile.posting_schedule.timezone;
        
        // Set multi-select fields
        setSelectedValues('profileAesthetics', profile.content_strategy.aestheticFocus);
        setSelectedValues('profileColors', profile.content_strategy.colorPalette);
        setSelectedValues('profileContentTypes', profile.content_strategy.contentTypes);
        
        // Change submit button to update mode
        const submitBtn = document.querySelector('#profileForm button[type="submit"]');
        submitBtn.textContent = 'Update Profile';
        submitBtn.onclick = () => updateAccountProfile(username);
        
        // Scroll to form
        document.getElementById('profileForm').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        showError('Failed to load profile for editing: ' + error.message);
    }
}

async function updateAccountProfile(originalUsername) {
    const formData = {
        username: document.getElementById('profileUsername').value.trim(),
        displayName: document.getElementById('profileDisplayName').value.trim(),
        platform: document.getElementById('profilePlatform').value,
        accountType: document.getElementById('profileAccountType').value,
        targetAudience: {
            age: document.getElementById('profileAge').value,
            interests: document.getElementById('profileInterests').value.split(',').map(i => i.trim()),
            location: document.getElementById('profileLocation').value.trim(),
            demographics: document.getElementById('profileDemographics').value.trim()
        },
        contentStrategy: {
            aestheticFocus: getSelectedValues('profileAesthetics'),
            colorPalette: getSelectedValues('profileColors'),
            contentTypes: getSelectedValues('profileContentTypes'),
            postingStyle: document.getElementById('profilePostingStyle').value,
            brandVoice: document.getElementById('profileBrandVoice').value
        },
        performanceGoals: {
            primaryMetric: document.getElementById('profilePrimaryMetric').value,
            targetRate: parseFloat(document.getElementById('profileTargetRate').value) / 100,
            secondaryMetric: document.getElementById('profileSecondaryMetric').value,
            benchmarkData: document.getElementById('profileBenchmark').value.trim()
        },
        postingSchedule: {
            frequency: document.getElementById('profileFrequency').value,
            bestTimes: document.getElementById('profileBestTimes').value.split(',').map(t => t.trim()),
            timezone: document.getElementById('profileTimezone').value
        }
    };

    try {
        const response = await fetch(`/api/account-profiles/${originalUsername}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            showSuccess('Account profile updated successfully');
            
            // Reset form and button
            document.getElementById('profileForm').reset();
            const submitBtn = document.querySelector('#profileForm button[type="submit"]');
            submitBtn.textContent = 'Create Profile';
            submitBtn.onclick = createAccountProfile;
            
            loadAccountProfilesList();
        } else {
            showError(result.error || 'Failed to update account profile');
        }
    } catch (error) {
        showError('Failed to update account profile: ' + error.message);
    }
}

async function deleteAccountProfile(username) {
    if (!confirm(`Are you sure you want to delete the profile for "${username}"?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/account-profiles/${username}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showSuccess('Account profile deleted successfully');
            loadAccountProfilesList();
        } else {
            const result = await response.json();
            showError(result.error || 'Failed to delete account profile');
        }
    } catch (error) {
        showError('Failed to delete account profile: ' + error.message);
    }
}

// Helper functions for multi-select fields
function getSelectedValues(selectId) {
    const select = document.getElementById(selectId);
    return Array.from(select.selectedOptions).map(option => option.value);
}

function setSelectedValues(selectId, values) {
    const select = document.getElementById(selectId);
    Array.from(select.options).forEach(option => {
        option.selected = values.includes(option.value);
    });
}

// Scraped Account Management Functions
async function addScrapedAccount() {
    const username = document.getElementById('newScrapedUsername').value.trim();
    const url = document.getElementById('newScrapedAccountUrl').value.trim();
    
    if (!username) {
        showError('Username is required');
        return;
    }
    
    try {
        const response = await fetch('/api/accounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, url })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showSuccess('Scraped account added successfully');
            document.getElementById('newScrapedUsername').value = '';
            document.getElementById('newScrapedAccountUrl').value = '';
            loadScrapedAccountsList();
        } else {
            showError(result.error || 'Failed to add scraped account');
        }
    } catch (error) {
        showError('Failed to add scraped account: ' + error.message);
    }
}

async function loadScrapedAccountsList() {
    try {
        const response = await fetch('/api/accounts');
        const accounts = await response.json();
        
        const accountsList = document.getElementById('scrapedAccountsList');
        if (!accountsList) return;
        
        accountsList.innerHTML = '';
        
        if (accounts.length === 0) {
            accountsList.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-users fa-2x mb-3"></i>
                    <p>No scraped accounts added yet</p>
                </div>
            `;
            return;
        }
        
        const accountsGrid = document.createElement('div');
        accountsGrid.className = 'row';
        
        accounts.forEach(account => {
            const accountCard = document.createElement('div');
            accountCard.className = 'col-md-6 col-lg-4 mb-3';
            accountCard.innerHTML = `
                <div class="card h-100">
                    <div class="card-body">
                        <h5 class="card-title">@${account.username}</h5>
                        <p class="card-text">
                            <small class="text-muted">Last Updated:</small> ${new Date(account.updated_at).toLocaleDateString()}<br>
                            <small class="text-muted">Posts Scraped:</small> ${account.posts_count || 0}<br>
                            <small class="text-muted">Last Scraped:</small> ${account.last_scraped ? new Date(account.last_scraped).toLocaleDateString() : 'Never'}
                        </p>
                        ${account.url ? `<p class="card-text"><a href="${account.url}" target="_blank" class="text-decoration-none"><i class="fas fa-external-link-alt"></i> View Profile</a></p>` : ''}
                    </div>
                    <div class="card-footer">
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteScrapedAccount('${account.username}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
            accountsGrid.appendChild(accountCard);
        });
        
        accountsList.appendChild(accountsGrid);
    } catch (error) {
        console.error('Error loading scraped accounts:', error);
        showError('Failed to load scraped accounts');
    }
}

async function deleteScrapedAccount(username) {
    if (!confirm(`Are you sure you want to delete scraped account "${username}" and all its scraped data?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/accounts/${username}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            showSuccess('Scraped account deleted successfully');
            loadScrapedAccountsList();
        } else {
            const result = await response.json();
            showError(result.error || 'Failed to delete scraped account');
        }
    } catch (error) {
        showError('Failed to delete scraped account: ' + error.message);
    }
}

async function refreshScrapedAccounts() {
    loadScrapedAccountsList();
}

// Bulk account management functions
async function addBulkScrapedAccounts() {
    const textarea = document.getElementById('bulkScrapedUsernames');
    const rawText = textarea.value.trim();
    
    if (!rawText) {
        showError('Please enter usernames or URLs');
        return;
    }
    
    // Extract usernames from the input
    const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const usernames = [];
    
    lines.forEach(line => {
        const username = extractUsernameFromLine(line);
        if (username && !usernames.includes(username)) {
            usernames.push(username);
        }
    });
    
    if (usernames.length === 0) {
        showError('No valid usernames found');
        return;
    }
    
    // Show progress
    const progressDiv = document.getElementById('bulkProgress');
    const progressBar = progressDiv.querySelector('.progress-bar');
    const progressText = document.getElementById('progressText');
    
    progressDiv.style.display = 'block';
    progressBar.style.width = '0%';
    progressText.textContent = `Starting bulk add of ${usernames.length} accounts...`;
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Add accounts one by one
    for (let i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        const progress = ((i + 1) / usernames.length) * 100;
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `Adding ${username} (${i + 1}/${usernames.length})...`;
        
        try {
            const response = await fetch('/api/accounts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, url: '' })
            });
            
            if (response.ok) {
                successCount++;
            } else {
                const result = await response.json();
                errorCount++;
                errors.push(`${username}: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            errorCount++;
            errors.push(`${username}: ${error.message}`);
        }
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Hide progress and show results
    progressDiv.style.display = 'none';
    
    if (successCount > 0) {
        showSuccess(`Successfully added ${successCount} accounts!`);
        textarea.value = '';
        loadScrapedAccountsList();
    }
    
    if (errorCount > 0) {
        console.warn('Bulk add errors:', errors);
        showError(`${errorCount} accounts failed to add. Check console for details.`);
    }
}

function extractUsernameFromLine(line) {
    // Remove any leading/trailing whitespace
    line = line.trim();
    
    // If it's a URL, extract username
    if (line.includes('http')) {
        // Instagram: https://instagram.com/username or https://www.instagram.com/username
        if (line.includes('instagram.com/')) {
            const match = line.match(/instagram\.com\/([^/?#]+)/);
            return match ? match[1] : null;
        }
        
        // TikTok: https://tiktok.com/@username or https://www.tiktok.com/@username
        if (line.includes('tiktok.com/')) {
            const match = line.match(/tiktok\.com\/@?([^/?#]+)/);
            return match ? match[1] : null;
        }
        
        // Twitter/X: https://twitter.com/username or https://x.com/username
        if (line.includes('twitter.com/') || line.includes('x.com/')) {
            const match = line.match(/(?:twitter|x)\.com\/([^/?#]+)/);
            return match ? match[1] : null;
        }
        
        // Generic URL - try to extract last path segment
        try {
            const url = new URL(line);
            const pathSegments = url.pathname.split('/').filter(segment => segment);
            if (pathSegments.length > 0) {
                let username = pathSegments[pathSegments.length - 1];
                // Remove @ symbol if present
                username = username.replace(/^@/, '');
                return username;
            }
        } catch (e) {
            // Invalid URL, continue
        }
    }
    
    // If it's just a username, clean it up
    line = line.replace(/^@/, ''); // Remove @ symbol
    line = line.replace(/[^a-zA-Z0-9._-]/g, ''); // Remove invalid characters
    
    return line.length > 0 ? line : null;
}

function clearBulkForm() {
    document.getElementById('bulkScrapedUsernames').value = '';
    document.getElementById('bulkProgress').style.display = 'none';
}

// Toggle between single and bulk mode
document.addEventListener('DOMContentLoaded', function() {
    const singleModeRadio = document.getElementById('singleMode');
    const bulkModeRadio = document.getElementById('bulkMode');
    const singleForm = document.getElementById('singleAccountForm');
    const bulkForm = document.getElementById('bulkAccountForm');
    
    if (singleModeRadio && bulkModeRadio) {
        singleModeRadio.addEventListener('change', function() {
            if (this.checked) {
                singleForm.style.display = 'block';
                bulkForm.style.display = 'none';
            }
        });
        
        bulkModeRadio.addEventListener('change', function() {
            if (this.checked) {
                singleForm.style.display = 'none';
                bulkForm.style.display = 'block';
            }
        });
    }
});

// Pipeline Management Functions
async function runPipeline() {
    // Processing method is now optional - use default if not selected
    let method = window.dashboard?.selectedProcessingMethod || 'fast';

    // Handle auto method selection
    if (method === 'auto') {
        method = window.dashboard.getRecommendedMethod();
    }
    
    const methodName = method.charAt(0).toUpperCase() + method.slice(1);
    
    if (!confirm(`Run the ${methodName} pipeline? This will scrape all accounts and analyze all content.`)) {
        return;
    }
    
    try {
        dashboard.addLog(`Starting ${methodName} pipeline...`, 'info');
        
        const response = await fetch('/api/pipeline/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                type: 'full',
                method: method
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            dashboard.addLog('Pipeline started successfully', 'success');
            showSuccess('Pipeline started successfully');
        } else {
            dashboard.addLog('Failed to start pipeline: ' + (result.error || 'Unknown error'), 'error');
            showError(result.error || 'Failed to start pipeline');
        }
    } catch (error) {
        dashboard.addLog('Pipeline error: ' + error.message, 'error');
        showError('Failed to start pipeline: ' + error.message);
    }
}

// Enhanced Pipeline Functions
async function runHookSlideDetection() {
    if (!confirm('Run hook slide detection on existing images? This will identify images with text overlays that can be used for theme generation.')) {
        return;
    }
    
    try {
        dashboard.addLog('Starting hook slide detection...', 'info');
        
        const response = await fetch('/api/run-enhanced-pipeline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                type: 'hook-slides'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            dashboard.addLog('Hook slide detection started successfully', 'success');
            showSuccess('Hook slide detection started successfully');
            
            // Refresh hook slide stats after a delay
            setTimeout(async () => {
                await loadHookSlideStats();
                await loadAvailableThemes();
            }, 5000);
        } else {
            dashboard.addLog('Failed to start hook slide detection: ' + (result.error || 'Unknown error'), 'error');
            showError(result.error || 'Failed to start hook slide detection');
        }
    } catch (error) {
        dashboard.addLog('Hook slide detection error: ' + error.message, 'error');
        showError('Failed to start hook slide detection: ' + error.message);
    }
}

async function runBackgroundColorAnalysis() {
    showError('Background color analysis will be available in a future update. Currently available through the full enhanced pipeline.');
}

async function runFullEnhancedPipeline() {
    if (!confirm('Run the full enhanced pipeline? This will scrape new content, analyze images, detect hook slides, and analyze background colors. This may take 1-2 hours.')) {
        return;
    }
    
    try {
        dashboard.addLog('Starting full enhanced pipeline...', 'info');
        
        const response = await fetch('/api/run-enhanced-pipeline', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                type: 'full-enhanced'
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            dashboard.addLog('Enhanced pipeline started successfully', 'success');
            showSuccess('Enhanced pipeline started successfully');
        } else {
            dashboard.addLog('Failed to start enhanced pipeline: ' + (result.error || 'Unknown error'), 'error');
            showError(result.error || 'Failed to start enhanced pipeline');
        }
    } catch (error) {
        dashboard.addLog('Enhanced pipeline error: ' + error.message, 'error');
        showError('Failed to start enhanced pipeline: ' + error.message);
    }
}

async function runAnalysisOnly() {
    // Processing method is now optional - use default if not selected
    let method = window.dashboard?.selectedProcessingMethod || 'fast';

    // Handle auto method selection
    if (method === 'auto') {
        method = window.dashboard.getRecommendedMethod();
    }
    
    const methodName = method.charAt(0).toUpperCase() + method.slice(1);
    
    if (!confirm(`Run ${methodName} analysis only? This will analyze existing images without scraping new content.`)) {
        return;
    }
    
    try {
        dashboard.addLog(`Starting ${methodName} analysis pipeline...`, 'info');
        
        const response = await fetch('/api/pipeline/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                type: 'analysis',
                method: method
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            dashboard.addLog('Analysis pipeline started successfully', 'success');
            showSuccess('Analysis pipeline started successfully');
        } else {
            dashboard.addLog('Failed to start analysis: ' + (result.error || 'Unknown error'), 'error');
            showError(result.error || 'Failed to start analysis');
        }
    } catch (error) {
        dashboard.addLog('Analysis error: ' + error.message, 'error');
        showError('Failed to start analysis: ' + error.message);
    }
}

async function refreshAccounts() {
    try {
        dashboard.addLog('Refreshing account data...', 'info');
        
        // This would typically trigger a refresh of account metadata
        // For now, we'll just reload the accounts list
        await dashboard.loadAccounts();
        dashboard.addLog('Account data refreshed', 'success');
        showSuccess('Account data refreshed');
    } catch (error) {
        dashboard.addLog('Failed to refresh accounts: ' + error.message, 'error');
        showError('Failed to refresh accounts: ' + error.message);
    }
}

function clearLogs() {
    const logsContainer = document.getElementById('pipelineLogs');
    logsContainer.innerHTML = '';
    dashboard.addLog('Logs cleared', 'info');
}

// Utility Functions
function showSuccess(message) {
    // You can implement a toast notification system here
    alert(message);
}

function showError(message) {
    // You can implement a toast notification system here
    alert('Error: ' + message);
}

function showInfo(message) {
    // You can implement a toast notification system here
    alert('Info: ' + message);
}

// Initialize dashboard when page loads
let dashboard;
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new ContentPipelineDashboard();
    window.dashboard = dashboard; // Make globally available
    
    // Set up profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            createAccountProfile();
        });
    }
}); 

// Aesthetic counts for live preview
const AESTHETIC_COUNTS = {
    streetwear: 285,
    casual: 112,
    urban: 108,
    vintage: 33,
    chic: 15,
    y2k: 8,
    athleisure: 5,
    grunge: 4,
    floral: 4,
    minimalist: 4,
    preppy: 3,
    lingerie: 3,
    glamorous: 2,
    coastal: 2
};

// Function to select aesthetic combinations
function selectAestheticCombo(aesthetics) {
    // Clear all checkboxes first
    document.querySelectorAll('.aesthetic-selector input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Check the selected aesthetics
    aesthetics.forEach(aesthetic => {
        const checkbox = document.getElementById(`aes-${aesthetic}`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
    
    // Update the live preview
    updateAestheticPreview();
}

// Function to update the live preview
function updateAestheticPreview() {
    const selectedCheckboxes = document.querySelectorAll('.aesthetic-selector input[type="checkbox"]:checked');
    const selectedAesthetics = Array.from(selectedCheckboxes).map(cb => cb.value);
    
    // Update selected display
    const selectedDisplay = document.getElementById('selectedAesthetics');
    if (selectedAesthetics.length === 0) {
        selectedDisplay.textContent = 'None';
    } else {
        selectedDisplay.textContent = selectedAesthetics.join(', ');
    }
    
    // Calculate estimated images (sum of individual counts)
    const estimatedImages = selectedAesthetics.reduce((sum, aesthetic) => {
        return sum + (AESTHETIC_COUNTS[aesthetic] || 0);
    }, 0);
    
    document.getElementById('estimatedImages').textContent = estimatedImages;
}

// Add event listeners for aesthetic checkboxes
document.addEventListener('DOMContentLoaded', () => {
    // Add change listeners to all aesthetic checkboxes
    document.querySelectorAll('.aesthetic-selector input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', updateAestheticPreview);
    });
}); 

// Account-specific generation function
async function generateForAccount() {
    const targetAccountSelect = document.getElementById('targetAccount');
    const generationType = document.getElementById('generationType').value;
    
    if (!targetAccountSelect.value) {
        showError('Please select an account first');
        return;
    }
    
    const selectedOption = targetAccountSelect.selectedOptions[0];
    const profile = JSON.parse(selectedOption.dataset.profile);
    
    try {
        const response = await fetch('/api/generate-for-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountUsername: profile.username,
                generationType: generationType,
                imageCount: 10, // Fixed for account-specific generation
                profile: profile
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayGeneratedContent(data.images);
            document.getElementById('generationPreview').style.display = 'block';
            showSuccess(`Generated ${data.images.length} optimized images for @${profile.username}`);
        } else {
            showError(data.error || 'Failed to generate content for account');
        }
    } catch (error) {
        console.error('Error generating content for account:', error);
        showError('Failed to generate content for account: ' + error.message);
    }
}

// TikTok OAuth Functions
async function connectTikTokAccount(username) {
    try {
        showInfo('Generating TikTok authorization URL...');
        
        const response = await fetch(`/api/tiktok/auth-url/${username}`);
        const data = await response.json();
        
        if (response.ok) {
            // Open TikTok authorization in new window
            const authWindow = window.open(data.authUrl, 'tiktok-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
            
            // Check for completion
            const checkClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkClosed);
                    setTimeout(() => {
                        checkTikTokStatus(username);
                        loadAccountProfilesList();
                    }, 2000);
                }
            }, 1000);
            
            showSuccess('TikTok authorization window opened. Please complete the authorization process.');
        } else {
            showError(data.error || 'Failed to generate TikTok authorization URL');
        }
    } catch (error) {
        console.error('Error connecting TikTok account:', error);
        showError('Failed to connect TikTok account: ' + error.message);
    }
}

async function checkTikTokStatus(username) {
    try {
        const response = await fetch(`/api/accounts/${username}/tiktok-status`);
        const data = await response.json();
        
        const statusElement = document.getElementById(`tiktok-status-${username}`);
        if (!statusElement) return;
        
        if (data.connected) {
            if (data.expired) {
                statusElement.innerHTML = `
                    <span class="badge bg-warning text-dark">
                        <i class="fas fa-exclamation-triangle"></i> Token Expired
                    </span>
                    <br>
                    <small class="text-muted">Reconnect required</small>
                `;
            } else {
                const expiresAt = new Date(data.expiresAt).toLocaleDateString();
                statusElement.innerHTML = `
                    <span class="badge bg-success">
                        <i class="fas fa-check"></i> Connected
                    </span>
                    <br>
                    <small class="text-muted">Expires: ${expiresAt}</small>
                `;
            }
            
            // Show/hide buttons for connected accounts
            const connectBtn = document.getElementById(`tiktok-connect-btn-${username}`);
            const disconnectBtn = document.getElementById(`tiktok-disconnect-btn-${username}`);
            const testBtn = document.getElementById(`tiktok-test-btn-${username}`);
            
            if (connectBtn) connectBtn.style.display = 'none';
            if (disconnectBtn) disconnectBtn.style.display = 'inline-block';
            if (testBtn) testBtn.style.display = 'inline-block';
            
        } else {
            statusElement.innerHTML = `
                <span class="badge bg-secondary">
                    <i class="fas fa-times"></i> Not Connected
                </span>
                <br>
                <button class="btn btn-sm btn-outline-primary mt-1" onclick="connectTikTokAccount('${username}')">
                    <i class="fab fa-tiktok"></i> Connect
                </button>
            `;
            
            // Show/hide buttons for disconnected accounts
            const connectBtn = document.getElementById(`tiktok-connect-btn-${username}`);
            const disconnectBtn = document.getElementById(`tiktok-disconnect-btn-${username}`);
            const testBtn = document.getElementById(`tiktok-test-btn-${username}`);
            
            if (connectBtn) connectBtn.style.display = 'inline-block';
            if (disconnectBtn) disconnectBtn.style.display = 'none';
            if (testBtn) testBtn.style.display = 'none';
        }
    } catch (error) {
        console.error('Error checking TikTok status:', error);
    }
}

async function disconnectTikTokAccount(username) {
    if (!confirm(`Are you sure you want to disconnect @${username} from TikTok?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/accounts/${username}/tiktok-disconnect`, {
            method: 'POST'
        });
        
        if (response.ok) {
            showSuccess(`@${username} disconnected from TikTok`);
            checkTikTokStatus(username);
            loadAccountProfilesList();
        } else {
            const data = await response.json();
            showError(data.error || 'Failed to disconnect TikTok account');
        }
    } catch (error) {
        console.error('Error disconnecting TikTok account:', error);
        showError('Failed to disconnect TikTok account: ' + error.message);
    }
}

async function testCarouselUpload(username) {
    if (!confirm(`Test carousel upload for @${username}? This will create a real carousel draft in your TikTok account.`)) {
        return;
    }
    
    try {
        showInfo('Testing carousel upload...');
        
        const response = await fetch(`/api/test-carousel-upload/${username}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess(`🎉 Carousel uploaded successfully!`);
            console.log('Upload details:', data);
            
            // Show detailed success message
            const details = `
                📝 Publish ID: ${data.publishId}
                📱 Status: ${data.status}
                🖼️ Type: ${data.type}
                🖼️ Images: ${data.images}
                📅 Uploaded: ${new Date(data.uploadedAt).toLocaleString()}
                📄 Caption: ${data.caption}
                🏷️ Hashtags: ${data.hashtags.join(', ')}
                
                🎯 Check your TikTok app → Profile → Drafts to see the carousel!
            `;
            
            alert(`✅ Carousel Upload Successful!\n\n${details}`);
        } else {
            showError(data.error || 'Failed to test carousel upload');
        }
    } catch (error) {
        console.error('Error testing carousel upload:', error);
        showError('Failed to test carousel upload: ' + error.message);
    }
}

// Complete Workflow Functions
async function runCompleteWorkflow() {
    const account = document.getElementById('workflowAccount').value;
    const postCount = parseInt(document.getElementById('workflowPostCount').value);
    const imageCount = parseInt(document.getElementById('workflowImageCount').value);
    
    if (!account) {
        showError('Please select an account first');
        return;
    }
    
    if (!confirm(`Generate ${postCount} posts with ${imageCount} images each for @${account} and upload to TikTok drafts?`)) {
        return;
    }
    
    try {
        // Show progress
        document.getElementById('workflowProgress').style.display = 'block';
        document.getElementById('workflowResults').style.display = 'none';
        document.getElementById('completeWorkflowBtn').disabled = true;
        
        updateWorkflowProgress(0, 'Starting workflow...');
        
        // Step 1: Generate content
        updateWorkflowProgress(20, 'Generating AI-optimized content...');
        const generationResult = await generateContentForWorkflow(account, postCount, imageCount);
        
        if (!generationResult.success) {
            throw new Error(`Content generation failed: ${generationResult.error}`);
        }
        
        updateWorkflowProgress(40, 'Content generated successfully!');
        
        // Step 2: Save generation
        updateWorkflowProgress(60, 'Saving generation to library...');
        const saveResult = await saveWorkflowGeneration(generationResult.generation);
        
        if (!saveResult.success) {
            throw new Error(`Failed to save generation: ${saveResult.error}`);
        }
        
        updateWorkflowProgress(80, 'Generation saved! Uploading to TikTok...');
        
        // Step 3: Upload to TikTok drafts
        const uploadResult = await uploadWorkflowToTikTok(account, generationResult.posts);
        
        if (!uploadResult.success) {
            throw new Error(`TikTok upload failed: ${uploadResult.error}`);
        }
        
        updateWorkflowProgress(100, 'Workflow completed successfully!');
        
        // Show results
        showWorkflowResults(generationResult, saveResult, uploadResult);
        
        showSuccess(`🎉 Complete workflow successful! Generated ${postCount} posts and uploaded to TikTok drafts.`);
        
    } catch (error) {
        console.error('Workflow error:', error);
        showError('Workflow failed: ' + error.message);
        updateWorkflowProgress(0, 'Workflow failed');
    } finally {
        document.getElementById('completeWorkflowBtn').disabled = false;
    }
}

async function generateContentForWorkflow(account, postCount, imageCount) {
    try {
        const response = await fetch('/api/generate-workflow-content', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountUsername: account,
                postCount: postCount,
                imageCount: imageCount
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, generation: data.generation, posts: data.posts };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function saveWorkflowGeneration(generation) {
    try {
        const response = await fetch('/api/save-workflow-generation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ generation })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, savedId: data.savedId };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

async function uploadWorkflowToTikTok(account, posts) {
    try {
        const response = await fetch('/api/upload-workflow-to-tiktok', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accountUsername: account,
                posts: posts
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, uploads: data.uploads };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function updateWorkflowProgress(percentage, status) {
    const progressBar = document.querySelector('#workflowProgress .progress-bar');
    const statusDiv = document.getElementById('workflowStatus');
    
    progressBar.style.width = percentage + '%';
    progressBar.textContent = percentage + '%';
    statusDiv.textContent = status;
}

function showWorkflowResults(generationResult, saveResult, uploadResult) {
    const resultsDiv = document.getElementById('workflowResultsContent');
    
    resultsDiv.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="card border-success">
                    <div class="card-body">
                        <h6 class="text-success"><i class="fas fa-magic me-2"></i>Content Generation</h6>
                        <p class="mb-1">✅ Generated ${generationResult.posts.length} posts</p>
                        <p class="mb-1">🖼️ ${generationResult.posts[0]?.images?.length || 0} images per post</p>
                        <p class="mb-0">📝 AI-optimized captions & hashtags</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-info">
                    <div class="card-body">
                        <h6 class="text-info"><i class="fas fa-save me-2"></i>Saved to Library</h6>
                        <p class="mb-1">✅ Generation saved</p>
                        <p class="mb-1">📁 ID: ${saveResult.savedId}</p>
                        <p class="mb-0">💾 Available for future use</p>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card border-warning">
                    <div class="card-body">
                        <h6 class="text-warning"><i class="fab fa-tiktok me-2"></i>TikTok Upload</h6>
                        <p class="mb-1">✅ ${uploadResult.uploads?.length || 0} posts uploaded</p>
                        <p class="mb-1">📱 Status: Draft</p>
                        <p class="mb-0">🎯 Check TikTok app → Drafts</p>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="mt-3">
            <h6>Upload Details:</h6>
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Post</th>
                            <th>Draft ID</th>
                            <th>Images</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${uploadResult.uploads?.map((upload, index) => `
                            <tr>
                                <td>Post ${index + 1}</td>
                                <td><code>${upload.draftId}</code></td>
                                <td>${upload.images} images</td>
                                <td><span class="badge bg-success">${upload.status}</span></td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">No uploads</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    document.getElementById('workflowResults').style.display = 'block';
}

// Initialize workflow account dropdown
async function loadWorkflowAccounts() {
    try {
        const response = await fetch('/api/account-profiles');
        const profiles = await response.json();
        
        const workflowAccountSelect = document.getElementById('workflowAccount');
        if (!workflowAccountSelect) return;
        
        // Clear existing options except the first one
        workflowAccountSelect.innerHTML = '<option value="">Select an account...</option>';
        
        profiles.forEach(profile => {
            const option = document.createElement('option');
            option.value = profile.username;
            option.textContent = `${profile.display_name} (@${profile.username})`;
            workflowAccountSelect.appendChild(option);
        });
        
        // Add event listener for account selection
        workflowAccountSelect.addEventListener('change', function() {
            const completeWorkflowBtn = document.getElementById('completeWorkflowBtn');
            completeWorkflowBtn.disabled = !this.value;
        });
        
    } catch (error) {
        console.error('Error loading workflow accounts:', error);
    }
}

// Handle URL parameters for OAuth callback messages
function handleOAuthMessages() {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const success = urlParams.get('success');
    const type = urlParams.get('type');
    
    if (type === 'tiktok_auth') {
        if (error) {
            showError('TikTok Authorization Error: ' + error);
        } else if (success) {
            showSuccess(success);
        }
        
        // Clean up URL parameters
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// Initialize OAuth message handling
document.addEventListener('DOMContentLoaded', () => {
    handleOAuthMessages();
    loadWorkflowAccounts();
}); 