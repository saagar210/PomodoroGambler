// Keyboard binding registry and handler

class KeyboardManager {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.bindings = new Map();
    }

    // Register a key binding
    bind(key, handler, description = '') {
        this.bindings.set(key, { handler, description });
    }

    // Initialize listeners
    init() {
        document.addEventListener('keydown', (e) => {
            // Ignore if user is typing in input
            if (e.target.matches('input, textarea, select')) return;

            const handler = this.bindings.get(e.code);
            if (handler) {
                e.preventDefault();
                handler.handler();
            }
        });
    }

    // Get all bindings (for help UI)
    getBindings() {
        return Array.from(this.bindings.entries()).map(([key, { description }]) => ({
            key,
            description
        }));
    }

    // Show keyboard shortcuts help
    showHelp() {
        const bindings = this.getBindings();
        const helpText = bindings
            .map(b => `  ${b.key.replace('Key', '').replace('Digit', '')}: ${b.description}`)
            .join('\n');

        alert(`⌨️ Keyboard Shortcuts:\n\n${helpText}\n\nNote: Shortcuts don't work in input fields.`);
    }
}

export default KeyboardManager;
