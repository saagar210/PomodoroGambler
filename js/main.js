// Main application bootstrap

import { storage } from './core/storage.js';
import { database } from './core/database.js';
import { eventBus } from './core/eventbus.js';
import { state } from './core/state.js';
import { balanceService } from './services/BalanceService.js';
import { timerService } from './services/TimerService.js';
import { bettingService } from './services/BettingService.js';
import { initBalanceDisplay } from './components/BalanceDisplay.js';
import { initTabNavigator } from './components/TabNavigator.js';
import { initDashboard } from './components/Dashboard.js';
import { initPomodoroTimer } from './components/PomodoroTimer.js';
import { initHistory } from './components/History.js';
import { initThemeSwitcher } from './components/ThemeSwitcher.js';
import KeyboardManager from './utils/keyboard.js';
import { TABS } from './utils/constants.js';

class App {
    constructor() {
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        try {
            // Show loading state
            this.showLoading();

            // Initialize storage layer
            await storage.init();

            // Initialize database
            await database.init();

            // Initialize services
            await balanceService.init();
            await bettingService.init();
            await timerService.init();

            // Initialize UI components
            initBalanceDisplay();
            initThemeSwitcher();
            initTabNavigator();
            initDashboard();
            initPomodoroTimer();
            initHistory();

            // Initialize keyboard shortcuts
            this.initKeyboardShortcuts();

            // Register service worker for PWA/offline support
            this.registerServiceWorker();

            // Hide loading state
            this.hideLoading();

            this.initialized = true;

            console.log('AuraFlow initialized successfully');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    showLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen) loadingScreen.style.display = 'flex';
        if (app) app.style.display = 'none';
    }

    hideLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'flex';
    }

    initKeyboardShortcuts() {
        const keyboardManager = new KeyboardManager(eventBus);

        // Timer controls
        keyboardManager.bind('Space', () => {
            const isRunning = state.get('timer.isRunning');
            const isPaused = state.get('timer.isPaused');

            if (isPaused) {
                timerService.resumeFromPause();
            } else if (isRunning) {
                timerService.pauseSession();
            } else {
                const duration = state.get('timer.duration') || 15;
                timerService.startSession(duration);
            }
        }, 'Start/Pause/Resume timer');

        // Tab navigation
        keyboardManager.bind('KeyT', () => {
            state.set('activeTab', TABS.TIMER);
        }, 'Switch to Timer tab');

        keyboardManager.bind('KeyD', () => {
            state.set('activeTab', TABS.DASHBOARD);
        }, 'Switch to Dashboard tab');

        keyboardManager.bind('KeyH', () => {
            state.set('activeTab', TABS.HISTORY);
        }, 'Switch to History tab');

        // Help
        keyboardManager.bind('Slash', () => {
            keyboardManager.showHelp();
        }, 'Show keyboard shortcuts');

        // Initialize
        keyboardManager.init();

        console.log('Keyboard shortcuts initialized');
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
            const serviceWorkerUrl = new URL('../service-worker.js', import.meta.url);
            navigator.serviceWorker.register(serviceWorkerUrl.href)
                .then((registration) => {
                    console.log('[App] Service Worker registered:', registration);

                    // Listen for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New SW ready, prompt user to refresh
                                console.log('[App] App update available. Refresh to get latest version.');
                                this.showUpdateNotification();
                            }
                        });
                    });
                })
                .catch((err) => {
                    console.warn('[App] Service Worker registration failed:', err);
                });

            // Listen for online/offline events
            window.addEventListener('online', () => {
                this.showToast('Back online!', 'success');
            });

            window.addEventListener('offline', () => {
                this.showToast('You are offline. Local data is safe.', 'warning');
            });
        }
    }

    showUpdateNotification() {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast info';
        toast.innerHTML = `
            <strong>Update Available</strong><br>
            Refresh to get the latest version.
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 8000);
    }

    showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }

    showError(message) {
        const app = document.getElementById('app');
        const loadingScreen = document.getElementById('loading-screen');

        if (loadingScreen) loadingScreen.style.display = 'none';
        if (app) app.style.display = 'none';

        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-screen';
        errorDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #0a0a0a;
            color: #ffffff;
            text-align: center;
            padding: 2rem;
        `;
        errorDiv.innerHTML = `
            <h1 style="color: #ff3366; margin-bottom: 1rem;">Error</h1>
            <p style="margin-bottom: 2rem;">${message}</p>
            <button onclick="location.reload()" style="
                padding: 0.5rem 1.5rem;
                border-radius: 8px;
                background-color: #4c9aff;
                color: white;
                border: none;
                cursor: pointer;
                font-size: 1rem;
            ">
                Reload Page
            </button>
        `;
        document.body.appendChild(errorDiv);
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const app = new App();
        app.init();
    });
} else {
    const app = new App();
    app.init();
}
