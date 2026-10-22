// New-order chime (Web Audio, no files) and the persisted on/off preference.

import { getItem, setItem } from '../../shared/storage.js';
import { KEYS } from '../state.js';

export function isSoundEnabled() {
  return getItem(KEYS.soundAlerts) !== 'off';
}

/** Flips the preference and returns the new state. */
export function toggleSound() {
  const enabled = !isSoundEnabled();
  setItem(KEYS.soundAlerts, enabled ? 'on' : 'off');
  return enabled;
}

let audioCtx = null;

/** Plays a short D5 → A5 → D6 chime when alerts are enabled. */
export function playChime() {
  if (!isSoundEnabled()) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = audioCtx || new AudioCtx();
    const ctx = audioCtx;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    [587.33, 880, 1174.66].forEach((freq, idx) => {
      const start = ctx.currentTime + idx * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
  } catch {}
}
