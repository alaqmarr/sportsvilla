import { EventEmitter } from "node:events";
import { EventPayloadMap, AppEvent } from "./event-types";
import { logger } from "@/core/logging/logger";

export type EventListener<K extends AppEvent> = (
  payload: EventPayloadMap[K]
) => void | Promise<void>;

export class TypedEventBus {
  private emitter: EventEmitter;
  private listenerWrappers: Map<string, Map<Function, Function[]>> = new Map();

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50);
    this.setupErrorBoundary();
  }

  private setupErrorBoundary(): void {
    this.emitter.on("error", (err) => {
      logger.error("[EventBus] Global event emitter error:", err);
    });
  }

  private registerWrapper(event: string, listener: Function, wrapped: Function): void {
    let eventMap = this.listenerWrappers.get(event);
    if (!eventMap) {
      eventMap = new Map();
      this.listenerWrappers.set(event, eventMap);
    }
    let wrappers = eventMap.get(listener);
    if (!wrappers) {
      wrappers = [];
      eventMap.set(listener, wrappers);
    }
    wrappers.push(wrapped);
  }

  private removeWrapper(
    event: string,
    listener: Function,
    specificWrapper?: Function
  ): Function | undefined {
    const eventMap = this.listenerWrappers.get(event);
    if (!eventMap) return undefined;

    const wrappers = eventMap.get(listener);
    if (!wrappers || wrappers.length === 0) return undefined;

    let removed: Function | undefined;
    if (specificWrapper) {
      const idx = wrappers.indexOf(specificWrapper);
      if (idx !== -1) {
        removed = wrappers.splice(idx, 1)[0];
      }
    } else {
      removed = wrappers.shift();
    }

    if (wrappers.length === 0) {
      eventMap.delete(listener);
    }
    if (eventMap.size === 0) {
      this.listenerWrappers.delete(event);
    }
    return removed;
  }

  emit<K extends AppEvent>(event: K, payload: EventPayloadMap[K]): boolean {
    logger.info(`[EventBus] Emitting "${event}"`, { event });
    return this.emitter.emit(event, payload);
  }

  on<K extends AppEvent>(event: K, listener: EventListener<K>): this {
    const wrapped = async (payload: EventPayloadMap[K]) => {
      try {
        await listener(payload);
      } catch (err) {
        logger.error(`[EventBus] Uncaught error in listener for "${event}":`, err);
      }
    };
    this.registerWrapper(event, listener, wrapped);
    this.emitter.on(event, wrapped);
    return this;
  }

  once<K extends AppEvent>(event: K, listener: EventListener<K>): this {
    const wrapped = async (payload: EventPayloadMap[K]) => {
      try {
        await listener(payload);
      } catch (err) {
        logger.error(`[EventBus] Uncaught error in once-listener for "${event}":`, err);
      } finally {
        this.removeWrapper(event, listener, wrapped);
      }
    };
    this.registerWrapper(event, listener, wrapped);
    this.emitter.once(event, wrapped);
    return this;
  }

  off<K extends AppEvent>(
    event: K,
    listener: EventListener<K> | ((...args: any[]) => void)
  ): this {
    const wrapped = this.removeWrapper(event, listener) ?? listener;
    this.emitter.off(event, wrapped as (...args: any[]) => void);
    return this;
  }

  removeAllListeners(event?: AppEvent): this {
    if (event) {
      this.emitter.removeAllListeners(event);
      this.listenerWrappers.delete(event);
    } else {
      this.emitter.removeAllListeners();
      this.listenerWrappers.clear();
      this.setupErrorBoundary();
    }
    return this;
  }

  listenerCount(event: AppEvent): number {
    return this.emitter.listenerCount(event);
  }

  listeners(event: AppEvent): Function[] {
    return this.emitter.listeners(event);
  }
}

// Global caching pattern across Webpack compilation layers (instrument, rsc, action-browser)
const globalForEvents = globalThis as unknown as {
  __sportsvilla_event_bus__?: TypedEventBus;
  __sportsvilla_listeners_registered__?: boolean;
};

export const eventBus =
  globalForEvents.__sportsvilla_event_bus__ ?? new TypedEventBus();

// Preserved unconditionally for both dev and prod
globalForEvents.__sportsvilla_event_bus__ = eventBus;
