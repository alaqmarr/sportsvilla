import { registerWhatsAppListeners } from "@/modules/whatsapp/whatsapp.listeners";
import { registerNotificationListeners } from "@/modules/notifications/notifications.listeners";
import { eventBus } from "@/core/events/event-bus";
import { logger } from "@/core/logging/logger";

const globalForEvents = globalThis as unknown as {
  __sportsvilla_listeners_registered__?: boolean;
};

export function registerAllListeners(options: { force?: boolean } = {}): void {
  if (globalForEvents.__sportsvilla_listeners_registered__ && !options.force) {
    logger.info("[EventBus] Listeners already registered, skipping duplicate attachment.");
    return;
  }

  if (options.force) {
    eventBus.removeAllListeners();
  }

  registerWhatsAppListeners();
  registerNotificationListeners();

  globalForEvents.__sportsvilla_listeners_registered__ = true;
  logger.info("[EventBus] All domain event listeners registered successfully.");
}
