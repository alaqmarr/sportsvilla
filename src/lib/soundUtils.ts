/**
 * Browser Web Audio API sound synthesizer for NFC taps and hardware scanning events.
 * Matches the audio profile used in CheckinScanner.tsx with zero external audio assets.
 */

export type NfcSoundType = "beep" | "success" | "error";

export function playNfcSound(type: NfcSoundType = "beep"): void {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.connect(gainNode);
    gainNode.connect(context.destination);

    if (type === "beep") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(1000, context.currentTime);
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.1);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, context.currentTime); // A5
      osc.frequency.setValueAtTime(1108.73, context.currentTime + 0.1); // C#6
      osc.frequency.setValueAtTime(1318.51, context.currentTime + 0.2); // E6

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.4);
    } else if (type === "error") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, context.currentTime);
      osc.frequency.linearRampToValueAtTime(150, context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    }
  } catch (err) {
    // AudioContext might be blocked if no user gesture has occurred yet
  }
}
