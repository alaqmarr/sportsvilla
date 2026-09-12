import { useEffect, useRef } from "react";

export function useBarcodeScanner(onScan: (data: string) => void) {
  const bufferRef = useRef<string[]>([]);
  const timestampsRef = useRef<number[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();
      
      // If we hit Enter, check if we have a valid burst
      if (e.key === "Enter") {
        if (bufferRef.current.length > 0) {
          const timestamps = timestampsRef.current;
          let isBurst = true;
          // Check intervals between keystrokes (if they are tight, it's a scanner)
          for (let i = 1; i < timestamps.length; i++) {
            if (timestamps[i] - timestamps[i - 1] > 80) { // 80ms tolerance for scanners
              isBurst = false;
              break;
            }
          }

          if (isBurst && bufferRef.current.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            
            const rawScan = bufferRef.current.join("");
            onScan(rawScan);
            
            // Clean up if it bled into an active input
            const activeElem = document.activeElement;
            if (
              activeElem &&
              (activeElem instanceof HTMLInputElement || activeElem instanceof HTMLTextAreaElement)
            ) {
              if (activeElem.value.endsWith(rawScan)) {
                activeElem.value = activeElem.value.slice(0, -rawScan.length);
              }
            }
          }
        }
        
        // Reset
        bufferRef.current = [];
        timestampsRef.current = [];
        if (timerRef.current) clearTimeout(timerRef.current);
        return;
      }

      // Collect single characters
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        bufferRef.current.push(e.key);
        timestampsRef.current.push(now);

        // Reset buffer after 200ms of inactivity
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          bufferRef.current = [];
          timestampsRef.current = [];
        }, 200);
      }
    };

    // Use capture phase to intercept before React synthetic events or inputs
    window.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [onScan]);
}
