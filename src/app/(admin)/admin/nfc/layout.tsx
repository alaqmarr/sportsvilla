"use client";

import React, { ReactNode } from "react";
import { useNfc } from "@/components/nfc/NfcProvider";
import { FiRadio, FiAlertTriangle, FiHardDrive } from "react-icons/fi";
import { useAlert } from "@/components/AlertProvider";

function FloatingStatusBar() {
  const { isWebNfcSupported, isWebNfcActive, enableWebNfc, scanError } = useNfc();
  const { showAlert } = useAlert();

  React.useEffect(() => {
    if (scanError) {
      showAlert("NFC Reader Error", scanError, "error");
    }
  }, [scanError, showAlert]);

  return (
    <div className="sticky top-0 z-50 w-full">
      {/* If Web NFC is unsupported, just show a subtle banner */}
      {!isWebNfcSupported && (
        <div className="bg-sv-surface-raised border-b border-sv-border px-4 py-2 flex items-center justify-center gap-2 text-xs text-sv-text-muted">
          <FiHardDrive /> Web NFC unsupported on this device. Using USB Wedge Scanner.
        </div>
      )}

      {/* If supported but inactive, show a prominent warning to click it */}
      {isWebNfcSupported && !isWebNfcActive && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-4 py-3 flex items-center justify-center gap-3 shadow-lg backdrop-blur-md">
          <FiAlertTriangle className="text-amber-400 text-lg" />
          <span className="text-sm font-semibold text-amber-200">
            Web NFC is inactive. Mobile/Tablet scanning is disabled.
          </span>
          <button
            onClick={enableWebNfc}
            className="ml-2 px-3 py-1.5 rounded-sv-sm bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <FiRadio /> Tap to Enable NFC Permission
          </button>
        </div>
      )}

      {/* If active, show subtle success banner */}
      {isWebNfcSupported && isWebNfcActive && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center justify-center gap-2 shadow-sm backdrop-blur-md">
          <FiRadio className="text-emerald-400 text-sm animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">
            Web NFC Active & Listening. Tap card to back of device.
          </span>
        </div>
      )}
    </div>
  );
}

export default function NfcLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full relative">
      <FloatingStatusBar />
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
