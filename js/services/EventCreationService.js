// Create and manage custom betting events

import { database } from '../core/database.js';
import { eventBus } from '../core/eventbus.js';

class EventCreationService {
    /**
     * Create new custom event
     * @param {string} title Event title
     * @param {string} category Category (Sports/Tech/Gaming/Politics/Custom)
     * @param {string} description Event description
     * @param {number} yesOdds YES odds (0-1)
     * @param {number} noOdds NO odds (0-1)
     * @returns {Promise<number>} eventId
     */
    async createEvent(title, category, description, yesOdds, noOdds) {
        // Validate inputs
        if (!title || title.trim().length === 0) {
            throw new Error('Event title required');
        }

        const validCategories = ['Sports', 'Tech', 'Gaming', 'Politics', 'Custom'];
        if (!validCategories.includes(category)) {
            throw new Error('Invalid category');
        }

        if (yesOdds <= 0 || yesOdds >= 1 || noOdds <= 0 || noOdds >= 1) {
            throw new Error('Odds must be between 0 and 1');
        }

        if (Math.abs((yesOdds + noOdds) - 1) > 0.01) {
            throw new Error('Odds must sum to ~1.0');
        }

        try {
            // Insert into betting_events with is_custom=1
            database.run(
                `INSERT INTO betting_events (title, description, category, odds_yes, odds_no, is_custom)
                 VALUES (?, ?, ?, ?, ?, 1)`,
                [title, description || '', category, yesOdds, noOdds]
            );

            await database.save();

            // Get the inserted ID
            const result = database.queryOne('SELECT last_insert_rowid() as id');
            const eventId = result.id;

            eventBus.emit('event:created', { eventId, title });

            return eventId;
        } catch (err) {
            throw new Error(`Failed to create event: ${err.message}`);
        }
    }

    /**
     * Delete custom event (only if no bets placed)
     * @param {number} eventId
     * @returns {Promise<void>}
     */
    async deleteEvent(eventId) {
        // Check if any bets exist
        const bets = database.query(
            'SELECT COUNT(*) as count FROM betting_transactions WHERE event_id = ?',
            [eventId]
        );

        if (bets[0].count > 0) {
            throw new Error('Cannot delete event with existing bets');
        }

        // Check if it's a custom event
        const event = database.queryOne(
            'SELECT is_custom FROM betting_events WHERE id = ?',
            [eventId]
        );

        if (!event || !event.is_custom) {
            throw new Error('Can only delete custom events');
        }

        database.run('DELETE FROM betting_events WHERE id = ?', [eventId]);
        await database.save();

        eventBus.emit('event:deleted', { eventId });
    }
}

export const eventCreationService = new EventCreationService();
