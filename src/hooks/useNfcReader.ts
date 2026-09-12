"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { NfcDeviceType } from "@/types/nfc";
import { playNfcSound } from "@/lib/soundUtils";

export interface UseNfcReaderOptions {
  onScan?: (cardUid: string, deviceType: NfcDeviceType) => void | Promise<void>;
  enabled?: boolean;
  debounceMs?: number;
  playBeepOnScan?: boolean;
}

export interface UseNfcReaderReturn {
  isListening: boolean;
  isWebNfcSupported: boolean;
  isWebNfcActive: boolean;
  lastScannedUid: string | null;
  lastDeviceType: NfcDeviceType | null;
  enableWebNfc: () => Promise<boolean>;
  scanError: string | null;
  triggerSimulatedScan: (cardUid: string, deviceType?: NfcDeviceType) => void;
}

/**
 * Normalizes physical card UID string:
 * Removes non-alphanumeric characters, strips whitespace, converts to uppercase hex.
 */
export function normalizeCardUid(raw: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  
  // 1. JSON Payload (e.g. from QR Codes)
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }
  
  // 2. UUID format (with or without hyphens)
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
    return trimmed;
  }
  
  // 3. Cuid format (starts with 'c' or 'cl', 24-32 chars alphanumeric lowercase)
  if (/^c[a-z0-9]{23,31}$/.test(trimmed)) {
    return trimmed;
  }
  
  // 4. Fallback for physical NFC cards (uppercase, alphanumeric only)
  return trimmed.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

/**
 * Unified NFC Hardware Hook for SportsVilla.
 * Orchestrates:
 * 1. USB Keyboard Wedge scanner via global capture-phase keydown analysis (<50ms inter-character interval).
 * 2. Web NFC API (NDEFReader) for Android Chrome tablets.
 * 3. DOM CustomEvent simulation bus ('nfc:tap' / 'nfc-card-tap').
 * 4. 3-second per-card hardware debounce protection.
 * 5. Audio feedback on hardware capture.
 */
export function useNfcReader(options: UseNfcReaderOptions = {}): UseNfcReaderReturn {
  const {
    onScan,
    enabled = true,
    debounceMs = 3000,
    playBeepOnScan = true,
  } = options;

  const [isListening, setIsListening] = useState<boolean>(enabled);
  const [isWebNfcSupported, setIsWebNfcSupported] = useState<boolean>(false);
  const [isWebNfcActive, setIsWebNfcActive] = useState<boolean>(false);
  const [lastScannedUid, setLastScannedUid] = useState<string | null>(null);
  const [lastDeviceType, setLastDeviceType] = useState<NfcDeviceType | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const lastTapMap = useRef<Map<string, number>>(new Map());
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  // Keyboard wedge buffer state
  const wedgeBuffer = useRef<string[]>([]);
  const wedgeTimestamps = useRef<number[]>([]);
  const wedgeTimer = useRef<NodeJS.Timeout | null>(null);
  const ndefControllerRef = useRef<AbortController | null>(null);

  // Check Web NFC availability on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const supported = "NDEFReader" in window;
      setIsWebNfcSupported(supported);
    }
  }, []);

  /**
   * Central processor for incoming card UIDs across all hardware sources.
   * Enforces 3s debounce cooldown and triggers sound feedback.
   */
  const processCardCapture = useCallback(
    (rawUid: string, deviceType: NfcDeviceType) => {
      const normalized = normalizeCardUid(rawUid);
      if (!normalized || normalized.length < 4) return;

      const now = Date.now();
      const lastTap = lastTapMap.current.get(normalized) || 0;

      // Double-tap debounce guard
      if (now - lastTap < debounceMs) {
        return;
      }

      lastTapMap.current.set(normalized, now);
      setLastScannedUid(normalized);
      setLastDeviceType(deviceType);
      setScanError(null);

      if (playBeepOnScan) {
        playNfcSound("beep");
      }

      if (onScanRef.current) {
        try {
          onScanRef.current(normalized, deviceType);
        } catch (err) {
          console.error("NFC onScan callback exception:", err);
        }
      }
    },
    [debounceMs, playBeepOnScan]
  );

  /**
   * USB Keyboard Wedge Listener:
   * Captures rapid sequential keystrokes (<50ms inter-character interval) ending in 'Enter'.
   * Runs in capture phase so it functions without explicit input focus.
   * Protects active input/textarea elements from hardware burst corruption.
   */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setIsListening(false);
      return;
    }

    setIsListening(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      const isEnter = e.key === "Enter";
      const isSingleChar = e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey;

      if (isEnter) {
        if (wedgeBuffer.current.length >= 4) {
          // Check intervals between keystrokes
          const timestamps = wedgeTimestamps.current;
          let isBurst = true;
          for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i] - timestamps[i - 1] > 65) {
              isBurst = false;
              break;
            }
          }

          if (isBurst) {
            e.preventDefault();
            e.stopPropagation();

            const rawCardUid = wedgeBuffer.current.join("");
            const normalized = normalizeCardUid(rawCardUid);

            // Revert active input field if contaminated by wedge burst
            const activeElem = document.activeElement;
            if (
              activeElem &&
              (activeElem instanceof HTMLInputElement || activeElem instanceof HTMLTextAreaElement)
            ) {
              if (activeElem.value.endsWith(rawCardUid)) {
                activeElem.value = activeElem.value.slice(0, -rawCardUid.length);
              }
            }

            processCardCapture(normalized, "KEYBOARD_WEDGE");
          }
        }

        // Reset buffer on Enter
        wedgeBuffer.current = [];
        wedgeTimestamps.current = [];
        if (wedgeTimer.current) clearTimeout(wedgeTimer.current);
        return;
      }

      if (isSingleChar) {
        const lastTime =
          wedgeTimestamps.current.length > 0
            ? wedgeTimestamps.current[wedgeTimestamps.current.length - 1]
            : 0;
        const delta = now - lastTime;

        if (wedgeTimestamps.current.length > 0 && delta < 50) {
          // Rapid keystroke burst detected
          wedgeBuffer.current.push(e.key);
          wedgeTimestamps.current.push(now);

          // Prevent active input from capturing characters of the hardware burst
          const activeElem = document.activeElement;
          if (
            activeElem &&
            (activeElem instanceof HTMLInputElement || activeElem instanceof HTMLTextAreaElement)
          ) {
            e.preventDefault();
            e.stopPropagation();
          }
        } else {
          // New potential sequence
          wedgeBuffer.current = [e.key];
          wedgeTimestamps.current = [now];
        }

        // Reset buffer after 180ms of inactivity
        if (wedgeTimer.current) clearTimeout(wedgeTimer.current);
        wedgeTimer.current = setTimeout(() => {
          wedgeBuffer.current = [];
          wedgeTimestamps.current = [];
        }, 180);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      if (wedgeTimer.current) clearTimeout(wedgeTimer.current);
    };
  }, [enabled, processCardCapture]);

  /**
   * DOM CustomEvent Simulator Listener:
   * Listens for 'nfc:tap' or 'nfc-card-tap' dispatched on window.
   */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleSimulatorTap = (e: Event) => {
      const customEvent = e as CustomEvent<{ cardUid?: string; uid?: string; deviceType?: NfcDeviceType }>;
      const uid = customEvent.detail?.cardUid || customEvent.detail?.uid;
      const device = customEvent.detail?.deviceType || "SIMULATOR";

      if (uid) {
        processCardCapture(uid, device);
      }
    };

    window.addEventListener("nfc:tap", handleSimulatorTap);
    window.addEventListener("nfc-card-tap", handleSimulatorTap);

    return () => {
      window.removeEventListener("nfc:tap", handleSimulatorTap);
      window.removeEventListener("nfc-card-tap", handleSimulatorTap);
    };
  }, [enabled, processCardCapture]);

  /**
   * Safe Web NFC (NDEFReader) Activation:
   * Invoked via user gesture (button tap) on supported browsers (Android Chrome).
   */
  const enableWebNfc = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined" || !("NDEFReader" in window)) {
      setScanError("Web NFC is not supported on this browser or platform.");
      return false;
    }

    try {
      const NDEFReaderClass = (window as unknown as { NDEFReader: new () => any }).NDEFReader;
      const ndef = new NDEFReaderClass();

      if (ndefControllerRef.current) {
        ndefControllerRef.current.abort();
      }

      const controller = new AbortController();
      ndefControllerRef.current = controller;

      await ndef.scan({ signal: controller.signal });
      setIsWebNfcActive(true);
      setScanError(null);

      ndef.addEventListener("reading", (event: any) => {
        const serialNumber = event.serialNumber;
        if (serialNumber) {
          processCardCapture(serialNumber, "WEB_NFC");
        }
      });

      ndef.addEventListener("readingerror", (event: any) => {
        // Some browser implementations might leak the serial number on error
        if (event && event.serialNumber) {
          processCardCapture(event.serialNumber, "WEB_NFC");
          setScanError(null);
        } else {
          setScanError("Unrecognized Card Format. The Web NFC API requires standard NDEF-formatted tags. For preprogrammed/proprietary cards, please use an external USB USB/Bluetooth wedge scanner.");
        }
      });

      return true;
    } catch (error: any) {
      console.error("Web NFC initialization failed:", error);
      setIsWebNfcActive(false);
      setScanError(error?.message || "Web NFC permission denied or activation failed.");
      return false;
    }
  }, [processCardCapture]);

  // Clean up Web NFC reader on unmount
  useEffect(() => {
    return () => {
      if (ndefControllerRef.current) {
        ndefControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Helper to manually trigger a simulated scan (e.g. for developer buttons)
   */
  const triggerSimulatedScan = useCallback(
    (cardUid: string, deviceType: NfcDeviceType = "SIMULATOR") => {
      processCardCapture(cardUid, deviceType);
    },
    [processCardCapture]
  );

  return {
    isListening,
    isWebNfcSupported,
    isWebNfcActive,
    lastScannedUid,
    lastDeviceType,
    enableWebNfc,
    scanError,
    triggerSimulatedScan,
  };
}
