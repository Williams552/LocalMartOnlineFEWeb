// Simple event emitter for cross-component communication
class EventService {
    constructor() {
        this.listeners = {};
    }

    // Subscribe to an event
    on(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        this.listeners[eventName].push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners[eventName] = this.listeners[eventName].filter(
                listener => listener !== callback
            );
        };
    }

    // Emit an event
    emit(eventName, data) {
        if (this.listeners[eventName]) {
            this.listeners[eventName].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in event listener for ${eventName}:`, error);
                }
            });
        }
    }

    // Remove all listeners for an event
    off(eventName) {
        delete this.listeners[eventName];
    }

    // Remove all listeners
    clear() {
        this.listeners = {};
    }
}

// Create and export a singleton instance
const eventService = new EventService();

// Define common event names
eventService.EVENTS = {
    REVIEW_CREATED: 'review:created',
    REVIEW_UPDATED: 'review:updated',
    REVIEW_DELETED: 'review:deleted',
    REVIEWS_REFRESH: 'reviews:refresh'
};

export default eventService;
