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
      osc.frequency.setValueAtTime(800, context.currentTime); // Soft tap
      gainNode.gain.setValueAtTime(0.02, context.currentTime); // Very quiet
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.1);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.1);
    } else if (type === "success") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, context.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, context.currentTime + 0.1); // E5
      
      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    } else if (type === "error") {
      osc.type = "triangle"; // Softer than sawtooth
      osc.frequency.setValueAtTime(300, context.currentTime);
      osc.frequency.linearRampToValueAtTime(250, context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.03, context.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);
      osc.start(context.currentTime);
      osc.stop(context.currentTime + 0.3);
    }
  } catch (err) {
    // AudioContext might be blocked if no user gesture has occurred yet
  }
}
