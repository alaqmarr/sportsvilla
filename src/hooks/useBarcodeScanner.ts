import { useEffect, useRef } from "react";

export function useBarcodeScanner(onScan: (data: string) => void) {
  const bufferRef = useRef<string>("");
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if the user is typing in a text input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTimeRef.current;

      if (e.key === "Enter") {
        if (bufferRef.current.length > 0) {
          // If a bunch of characters were typed quickly and ended in Enter, it's a scan.
          onScan(bufferRef.current);
          bufferRef.current = "";
        }
        return;
      }

      // If time between keystrokes is more than 100ms, it's probably a human typing, reset buffer.
      // Barcode scanners typically send keys with < 20ms delay.
      if (timeDiff > 100) {
        bufferRef.current = "";
      }

      // Only add single characters to the buffer
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      lastKeyTimeRef.current = currentTime;
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onScan]);
}
