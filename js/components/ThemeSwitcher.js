// Theme switcher component with persisted preference.

import { STORAGE_KEYS } from '../utils/constants.js';

class ThemeSwitcher {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
        this.currentTheme = this.getStoredTheme();

        if (!this.container) return;

        this.render();
        this.applyTheme(this.currentTheme);
        this.attachListeners();
    }

    getStoredTheme() {
        const saved = localStorage.getItem(STORAGE_KEYS.THEME_PREFERENCE);
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
            return saved;
        }
        return 'system';
    }

    setStoredTheme(theme) {
        localStorage.setItem(STORAGE_KEYS.THEME_PREFERENCE, theme);
    }

    getSystemTheme() {
        return this.mediaQuery.matches ? 'light' : 'dark';
    }

    applyTheme(theme) {
        if (theme === 'system') {
            document.documentElement.setAttribute('data-theme', this.getSystemTheme());
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    attachListeners() {
        this.container.addEventListener('change', (e) => {
            if (e.target.id !== 'theme-select') return;
            this.currentTheme = e.target.value;
            this.setStoredTheme(this.currentTheme);
            this.applyTheme(this.currentTheme);
        });

        this.mediaQuery.addEventListener('change', () => {
            if (this.currentTheme === 'system') {
                this.applyTheme('system');
            }
        });
    }

    render() {
        this.container.innerHTML = `
            <label class="theme-control" for="theme-select">
                Theme
                <select id="theme-select" aria-label="Theme">
                    <option value="system" ${this.currentTheme === 'system' ? 'selected' : ''}>System</option>
                    <option value="dark" ${this.currentTheme === 'dark' ? 'selected' : ''}>Dark</option>
                    <option value="light" ${this.currentTheme === 'light' ? 'selected' : ''}>Light</option>
                </select>
            </label>
        `;
    }
}

export function initThemeSwitcher(containerId = 'theme-switcher') {
    return new ThemeSwitcher(containerId);
}
