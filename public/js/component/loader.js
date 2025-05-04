/**
 * Global Loader Component
 * A reusable loading overlay with progress bar
 */
const Loader = (function() {
    // Private variables
    let loadingOverlay;
    let progressBar;
    let loadingText;
    let loadingStages = [];
    let currentStage = 0;
    let progressTimer = null;

    // Create the loading overlay if it doesn't exist
    function ensureOverlay() {
        if (!loadingOverlay) {
            loadingOverlay = document.getElementById('loading-overlay');
            if (!loadingOverlay) {
                const overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.className = 'loading-overlay';
                overlay.style.display = 'none';
                overlay.innerHTML = `
                    <div class="progress-container">
                        <h5 class="mb-2">Đang tải dữ liệu...</h5>
                        <div class="progress" style="height: 10px; width: 300px;">
                            <div id="loading-progress-bar" class="progress-bar progress-bar-striped progress-bar-animated"
                                role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"
                                style="width: 0%"></div>
                        </div>
                        <p id="loading-text" class="mt-2 text-muted small">Khởi tạo...</p>
                    </div>
                `;
                document.body.appendChild(overlay);
                loadingOverlay = overlay;
            }

            progressBar = document.getElementById('loading-progress-bar');
            loadingText = document.getElementById('loading-text');
        }

        return loadingOverlay;
    }

    // Public API
    return {
        // Show the loading overlay with optional custom settings
        show: function(options = {}) {
            const overlay = ensureOverlay();

            // Reset progress
            this.setProgress(0);
            currentStage = 0;

            // Apply custom options
            if (options.title) {
                overlay.querySelector('h5').textContent = options.title;
            }

            if (options.stages) {
                loadingStages = options.stages;
            } else {
                // Default loading stages
                loadingStages = [
                    { progress: 10, text: "Khởi tạo dữ liệu..." },
                    { progress: 30, text: "Đang tải thông tin..." },
                    { progress: 50, text: "Đang chuẩn bị nội dung..." },
                    { progress: 70, text: "Đang tải cấu trúc..." },
                    { progress: 90, text: "Hoàn thiện..." },
                    { progress: 100, text: "Hoàn tất!" }
                ];
            }

            // Show the overlay
            overlay.style.display = 'flex';
            overlay.style.opacity = '1';

            // Start auto progress if not manual
            if (options.autoProgress !== false) {
                this.startAutoProgress();
            }

            return this;
        },

        // Start automatic progress through stages
        startAutoProgress: function(minDelay = 600, maxDelay = 1400) {
            // Clear any existing timer
            if (progressTimer) clearTimeout(progressTimer);

            const updateProgress = () => {
                if (currentStage < loadingStages.length) {
                    const stage = loadingStages[currentStage];

                    // Update progress bar
                    this.setProgress(stage.progress, stage.text);

                    currentStage++;

                    // Schedule next update with random delay
                    progressTimer = setTimeout(updateProgress, minDelay + Math.random() * (maxDelay - minDelay));
                } else {
                    // Complete - wait a bit then hide
                    setTimeout(() => this.hide(), 500);
                }
            };

            // Start progress updates
            progressTimer = setTimeout(updateProgress, 500);

            return this;
        },

        // Manually set progress percentage
        setProgress: function(percent, text) {
            ensureOverlay();
            progressBar.style.width = percent + '%';
            progressBar.setAttribute('aria-valuenow', percent);

            if (text) {
                loadingText.textContent = text;
            }

            return this;
        },

        // Hide the loading overlay
        hide: function() {
            const overlay = ensureOverlay();
            overlay.style.opacity = '0';

            // Clear any progress timer
            if (progressTimer) {
                clearTimeout(progressTimer);
                progressTimer = null;
            }

            // Hide completely after transition
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);

            return this;
        }
    };
})();