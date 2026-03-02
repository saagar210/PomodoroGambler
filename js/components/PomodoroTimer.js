// Pomodoro timer component

import { timerService } from '../services/TimerService.js';
import { eventBus } from '../core/eventbus.js';
import { state } from '../core/state.js';
import { formatTime } from '../utils/formatters.js';
import { DURATIONS } from '../utils/constants.js';

class PomodoroTimer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.selectedDuration = 15;
        state.set('timer.duration', this.selectedDuration);
        this.render();
        this.attachListeners();
        this.initializeTimerState();
    }

    initializeTimerState() {
        // Check if timer is already running (resumed session)
        if (state.get('timer.isRunning')) {
            this.updateControlButton();
            this.updateDurationButtons();
            const elapsed = state.get('timer.elapsedSeconds') || 0;
            const duration = state.get('timer.duration') || 15;
            const total = duration * 60;
            this.updateTimerDisplay(elapsed, total);
        }
    }

    attachListeners() {
        // Duration selector buttons
        this.container.addEventListener('click', (e) => {
            const durationBtn = e.target.closest('.duration-btn');
            if (durationBtn && !state.get('timer.isRunning')) {
                const duration = parseInt(durationBtn.dataset.duration);
                this.selectedDuration = duration;
                state.set('timer.duration', duration);
                this.updateDurationButtons();
            }
        });

        // Start/Stop/Pause/Resume buttons
        this.container.addEventListener('click', (e) => {
            const controlBtn = e.target.closest('.timer-control-btn');
            if (controlBtn) {
                const isRunning = state.get('timer.isRunning');
                const isPaused = state.get('timer.isPaused');

                if (isPaused) {
                    timerService.resumeFromPause();
                } else if (isRunning) {
                    timerService.stopSession();
                } else {
                    timerService.startSession(this.selectedDuration);
                }
            }

            const pauseBtn = e.target.closest('.timer-pause-btn');
            if (pauseBtn) {
                timerService.pauseSession();
            }

            const stopBtn = e.target.closest('.timer-stop-btn');
            if (stopBtn) {
                timerService.stopSession();
            }
        });

        // Timer events
        eventBus.on('timer:started', () => {
            this.updateControlButton();
            this.updateDurationButtons();
        });

        eventBus.on('timer:resumed', () => {
            this.updateControlButton();
            this.updateDurationButtons();
        });

        eventBus.on('timer:tick', ({ elapsed, total }) => {
            this.updateTimerDisplay(elapsed, total);
        });

        eventBus.on('session:completed', ({ coinsEarned }) => {
            this.updateControlButton();
            this.updateDurationButtons();
            this.showCompletionMessage(coinsEarned);
        });

        eventBus.on('session:stopped', () => {
            this.updateControlButton();
            this.updateDurationButtons();
            this.resetTimerDisplay();
        });

        eventBus.on('session:interrupted', () => {
            this.resetTimerDisplay();
        });

        eventBus.on('timer:paused', () => {
            this.updateControlButton();
        });
    }

    getDurationConfig(minutes) {
        switch (minutes) {
            case 15:
                return DURATIONS.SHORT;
            case 30:
                return DURATIONS.MEDIUM;
            case 60:
                return DURATIONS.LONG;
            default:
                return DURATIONS.SHORT;
        }
    }

    updateDurationButtons() {
        const isRunning = state.get('timer.isRunning');
        const currentDuration = isRunning ? state.get('timer.duration') : this.selectedDuration;

        this.container.querySelectorAll('.duration-btn').forEach(btn => {
            const duration = parseInt(btn.dataset.duration);
            btn.classList.toggle('active', duration === currentDuration);
            btn.disabled = isRunning;
        });
    }

    updateControlButton() {
        const controlsContainer = this.container.querySelector('.timer-controls');
        if (!controlsContainer) return;

        const isRunning = state.get('timer.isRunning');
        const isPaused = state.get('timer.isPaused');

        if (isPaused) {
            // Show Resume and Stop buttons
            controlsContainer.innerHTML = `
                <button class="btn btn-success btn-lg timer-control-btn">
                    Resume Session
                </button>
                <button class="btn btn-danger btn-sm timer-stop-btn">
                    Stop
                </button>
            `;
        } else if (isRunning) {
            // Show Pause and Stop buttons
            controlsContainer.innerHTML = `
                <button class="btn btn-warning btn-sm timer-pause-btn">
                    Pause
                </button>
                <button class="btn btn-danger btn-lg timer-control-btn">
                    Stop Session
                </button>
            `;
        } else {
            // Show Start button
            controlsContainer.innerHTML = `
                <button class="btn btn-success btn-lg timer-control-btn">
                    Start Session
                </button>
            `;
        }
    }

    updateTimerDisplay(elapsed, total) {
        const remaining = Math.max(0, total - elapsed);
        const timeElement = this.container.querySelector('.timer-time');
        const timerInfo = this.container.querySelector('.timer-info');
        const progressCircle = this.container.querySelector('.timer-progress');
        const isPaused = state.get('timer.isPaused');

        if (timeElement) {
            const timeText = formatTime(remaining);
            timeElement.textContent = isPaused ? `${timeText} [PAUSED]` : timeText;
        }

        if (timerInfo && isPaused) {
            timerInfo.textContent = 'Paused';
        } else if (timerInfo) {
            timerInfo.textContent = 'Focus time';
        }

        if (progressCircle) {
            const progress = (elapsed / total) * 100;
            const circumference = 2 * Math.PI * 140;
            const offset = circumference - (progress / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
    }

    resetTimerDisplay() {
        const duration = this.selectedDuration * 60;
        this.updateTimerDisplay(0, duration);
    }

    playCompletionSound() {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.setValueAtTime(0.15, ctx.currentTime);

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.18);
            oscillator.onended = () => ctx.close();
        } catch (err) {
            console.debug('Audio not available', err);
        }
    }

    showCompletionMessage(coinsEarned) {
        // Play completion sound
        this.playCompletionSound();

        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.innerHTML = `<strong>Session Complete!</strong><br>You earned ${coinsEarned} coins!`;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);

        this.resetTimerDisplay();
    }

    render() {
        const config = this.getDurationConfig(this.selectedDuration);
        const totalSeconds = this.selectedDuration * 60;
        const circumference = 2 * Math.PI * 140;

        this.container.innerHTML = `
            <div class="timer-container">
                <div class="duration-selector">
                    <button class="duration-btn active" data-duration="15">
                        <div class="duration-time">15 min</div>
                        <div class="duration-multiplier">1x multiplier</div>
                        <div class="duration-coins">20 coins</div>
                    </button>
                    <button class="duration-btn" data-duration="30">
                        <div class="duration-time">30 min</div>
                        <div class="duration-multiplier">2x multiplier</div>
                        <div class="duration-coins">40 coins</div>
                    </button>
                    <button class="duration-btn" data-duration="60">
                        <div class="duration-time">60 min</div>
                        <div class="duration-multiplier">5x multiplier</div>
                        <div class="duration-coins">100 coins</div>
                    </button>
                </div>

                <div class="timer-display">
                    <svg class="timer-circle" viewBox="0 0 300 300">
                        <circle
                            cx="150"
                            cy="150"
                            r="140"
                            stroke="var(--color-bg-tertiary)"
                            stroke-width="10"
                            fill="none"
                        />
                        <circle
                            cx="150"
                            cy="150"
                            r="140"
                            stroke="var(--color-primary)"
                            stroke-width="10"
                            fill="none"
                            class="timer-progress"
                            style="
                                stroke-dasharray: ${circumference};
                                stroke-dashoffset: ${circumference};
                                transform: rotate(-90deg);
                                transform-origin: center;
                                transition: stroke-dashoffset 1s linear;
                            "
                        />
                    </svg>
                    <div class="timer-time">${formatTime(totalSeconds)}</div>
                    <div class="timer-info">Focus time</div>
                    <div class="timer-reward">Earn ${config.coins} coins</div>
                </div>

                <div class="timer-controls">
                    <button class="btn btn-success btn-lg timer-control-btn">
                        Start Session
                    </button>
                </div>
            </div>
        `;
    }
}

export function initPomodoroTimer() {
    return new PomodoroTimer('timer');
}
