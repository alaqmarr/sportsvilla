import { NfcSimulatorPreset, NfcDeviceType } from "@/types/nfc";
import { normalizeCardUid } from "@/hooks/useNfcReader";

/**
 * Generates an uppercase hex NFC UID string.
 * Standard Mifare Classic / Ultralight UIDs are 4 bytes (8 hex chars) or 7 bytes (14 hex chars).
 */
export function generateRandomHexUid(length = 8): string {
  const chars = "0123456789ABCDEF";
  let result = "04"; // Common Mifare manufacturer prefix
  for (let i = 2; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Creates a cross-environment synthetic keydown event.
 * Compatible with standard browser DOM as well as Node.js test environments.
 */
export function createSyntheticKeyEvent(key: string): Event {
  if (typeof window !== "undefined" && typeof KeyboardEvent !== "undefined") {
    try {
      return new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
      });
    } catch {
      // Fallback if browser throws on KeyboardEvent constructor
    }
  }

  const event = new Event("keydown", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "key", { value: key, writable: false, configurable: true });
  return event;
}

/**
 * Dispatches simulated tap CustomEvents ('nfc:tap' and 'nfc-card-tap') on the target.
 * Matches the hardware bus contract specified in PROJECT.md.
 */
export function simulateCustomEventTap(
  cardUid: string,
  target?: EventTarget,
  deviceType: NfcDeviceType = "SIMULATOR"
): { success: boolean; cardUid: string; dispatchedAt: number } {
  const normalized = normalizeCardUid(cardUid);
  if (!normalized) {
    throw new Error("Cannot simulate tap with empty card UID");
  }

  const eventTarget =
    target ||
    (typeof window !== "undefined"
      ? window
      : typeof globalThis !== "undefined"
      ? (globalThis as unknown as EventTarget)
      : null);

  if (!eventTarget || typeof eventTarget.dispatchEvent !== "function") {
    throw new Error("No valid EventTarget available to dispatch simulation event");
  }

  const now = Date.now();
  const detail = {
    cardUid: normalized,
    uid: normalized,
    deviceType,
    timestamp: now,
  };

  const tapEvent = new CustomEvent("nfc:tap", {
    detail,
    bubbles: true,
    cancelable: true,
  });

  const cardTapEvent = new CustomEvent("nfc-card-tap", {
    detail,
    bubbles: true,
    cancelable: true,
  });

  eventTarget.dispatchEvent(tapEvent);
  eventTarget.dispatchEvent(cardTapEvent);

  return {
    success: true,
    cardUid: normalized,
    dispatchedAt: now,
  };
}

/**
 * Simulates rapid USB Keyboard Wedge scanner input.
 * Emits sequential keydown events (<15ms per char) ending in 'Enter'.
 * Tests the hardware buffer capture without requiring focused inputs.
 */
export async function simulateKeyboardWedgeKeystrokes(
  cardUid: string,
  target?: EventTarget,
  delayMs = 6
): Promise<{ success: boolean; cardUid: string; charCount: number; durationMs: number }> {
  const normalized = normalizeCardUid(cardUid);
  if (!normalized) {
    throw new Error("Cannot simulate wedge keystrokes with empty card UID");
  }

  const eventTarget =
    target ||
    (typeof window !== "undefined"
      ? window
      : typeof globalThis !== "undefined"
      ? (globalThis as unknown as EventTarget)
      : null);

  if (!eventTarget || typeof eventTarget.dispatchEvent !== "function") {
    throw new Error("No valid EventTarget available to dispatch keystrokes");
  }

  const startTime = Date.now();

  // Emit each character with <15ms delay
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    const keyEvent = createSyntheticKeyEvent(char);
    eventTarget.dispatchEvent(keyEvent);

    if (delayMs > 0 && i < normalized.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  // Brief pause before terminator
  if (delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  // Emit final Enter key
  const enterEvent = createSyntheticKeyEvent("Enter");
  eventTarget.dispatchEvent(enterEvent);

  return {
    success: true,
    cardUid: normalized,
    charCount: normalized.length + 1,
    durationMs: Date.now() - startTime,
  };
}

/**
 * Default preset definitions used when database does not have seeded cards.
 */
export const DEFAULT_PRESET_CARDS: NfcSimulatorPreset[] = [
  {
    id: "preset-active-booking",
    name: "Active Member with Booking",
    category: "ACTIVE_BOOKING",
    cardUid: "04A1B2C301",
    memberName: "Rahul Sharma (Booking)",
    memberMobile: "+91 98765 43210",
    walletBalanceRupees: 1250,
    description: "Has confirmed court booking for today with valid ticket. Triggers BOOKING_CHECKIN.",
  },
  {
    id: "preset-active-membership",
    name: "Active Member with Membership Plan",
    category: "ACTIVE_MEMBERSHIP",
    cardUid: "04D4E5F602",
    memberName: "Ananya Patel (Member)",
    memberMobile: "+91 98123 45678",
    walletBalanceRupees: 850,
    description: "Has active monthly membership plan. Triggers MEMBERSHIP_ATTENDANCE.",
  },
  {
    id: "preset-member-wallet",
    name: "Member with Wallet Balance",
    category: "MEMBER_WALLET",
    cardUid: "0499A8B703",
    memberName: "Vikram Malhotra (Wallet)",
    memberMobile: "+91 97654 32109",
    walletBalanceRupees: 500,
    description: "Has sufficient wallet balance. Triggers payment or drop-in fee deduction.",
  },
  {
    id: "preset-low-balance",
    name: "Low/Zero Balance Member",
    category: "LOW_BALANCE",
    cardUid: "0455667704",
    memberName: "Pooja Verma (Low Bal)",
    memberMobile: "+91 96543 21098",
    walletBalanceRupees: 5,
    description: "Has only ₹5 balance. Fails payment or drop-in check-in with INSUFFICIENT_FUNDS.",
  },
  {
    id: "preset-blocked-card",
    name: "Blocked/Suspended Card",
    category: "BLOCKED_CARD",
    cardUid: "04DEADBEEF",
    memberName: "Sameer Joshi (Suspended)",
    memberMobile: "+91 95432 10987",
    walletBalanceRupees: 0,
    description: "Card marked as BLOCKED in database. Rejection with CARD_BLOCKED.",
  },
  {
    id: "preset-unregistered-card",
    name: "Unregistered Card",
    category: "UNREGISTERED_CARD",
    cardUid: "04FFAA0099",
    memberName: "Unknown Visitor",
    description: "UID not found in database. Rejection with UNREGISTERED_CARD.",
  },
];
