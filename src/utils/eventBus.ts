/**
 * Simple Event Bus for component communication
 */

type EventCallback = (...args: any[]) => void;

class EventBus {
  private events: Map<string, EventCallback[]> = new Map();

  on(event: string, callback: EventCallback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
}

export const eventBus = new EventBus();

// Event constants
export const EVENTS = {
  WORK_ORDER_CREATED: 'workorder:created',
  WORK_ORDER_UPDATED: 'workorder:updated',
  WORK_ORDER_DELETED: 'workorder:deleted',
  EQUIPMENT_UPDATED: 'equipment:updated',
  INVENTORY_UPDATED: 'inventory:updated',
};
