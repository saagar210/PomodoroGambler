// Main application bootstrap

import { storage } from './core/storage.js';
import { database } from './core/database.js';
import { balanceService } from './services/BalanceService.js';
import { timerService } from './services/TimerService.js';
import { bettingService } from './services/BettingService.js';
import { initBalanceDisplay } from './components/BalanceDisplay.js';
import { initTabNavigator } from './components/TabNavigator.js';
import { initDashboard } from './components/Dashboard.js';
import { initPomodoroTimer } from './components/PomodoroTimer.js';
import { initHistory } from './components/History.js';

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
            initTabNavigator();
            initDashboard();
            initPomodoroTimer();
            initHistory();

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
