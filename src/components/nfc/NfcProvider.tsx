"use client";

import React, { createContext, useContext, useRef, useCallback, ReactNode, useEffect } from "react";
import { useNfcReader, UseNfcReaderReturn } from "@/hooks/useNfcReader";
import { NfcDeviceType } from "@/types/nfc";

type ScanListener = (uid: string, deviceType: NfcDeviceType) => void;

interface NfcContextType extends UseNfcReaderReturn {
  subscribe: (listener: ScanListener) => () => void;
}

const NfcContext = createContext<NfcContextType | null>(null);

export function NfcProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef<Set<ScanListener>>(new Set());

  const handleGlobalScan = useCallback((uid: string, deviceType: NfcDeviceType) => {
    listenersRef.current.forEach((listener) => {
      try {
        listener(uid, deviceType);
      } catch (err) {
        console.error("Error in NFC listener:", err);
      }
    });
  }, []);

  const nfc = useNfcReader({
    enabled: true,
    debounceMs: 2000,
    playBeepOnScan: true,
    onScan: handleGlobalScan,
  });

  const subscribe = useCallback((listener: ScanListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  return (
    <NfcContext.Provider value={{ ...nfc, subscribe }}>
      {children}
    </NfcContext.Provider>
  );
}

export function useNfc() {
  const ctx = useContext(NfcContext);
  if (!ctx) {
    throw new Error("useNfc must be used within an NfcProvider");
  }
  return ctx;
}
