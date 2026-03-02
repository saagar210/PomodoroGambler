// Application constants

export const DURATIONS = {
    SHORT: { minutes: 15, multiplier: 1, coins: 20 },
    MEDIUM: { minutes: 30, multiplier: 2, coins: 40 },
    LONG: { minutes: 60, multiplier: 5, coins: 100 }
};

export const BET_AMOUNT = 40;
export const MIN_BET_AMOUNT = 10;
export const MAX_BET_AMOUNT = 1000;

export const STARTING_BALANCE = 100;

export const CATEGORIES = ['All', 'Sports', 'Tech', 'Gaming', 'Politics'];

export const SESSION_STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    INTERRUPTED: 'interrupted'
};

export const BET_STATUS = {
    PENDING: 'pending',
    WON: 'won',
    LOST: 'lost'
};

export const OUTCOME = {
    YES: 'yes',
    NO: 'no',
    PENDING: 'pending'
};

export const TABS = {
    DASHBOARD: 'dashboard',
    TIMER: 'timer',
    HISTORY: 'history'
};

export const STORAGE_KEYS = {
    DB: 'auraflow_database',
    TIMER_STATE: 'auraflow_timer_state',
    THEME_PREFERENCE: 'auraflow_theme_preference'
};

export const GRACE_PERIOD_MS = 5 * 60 * 1000; // 5 minutes

export const ITEMS_PER_PAGE = 10;
