
const listeners = {};

export function on(event, cb) {
  listeners[event] = listeners[event] || [];
  listeners[event].push(cb);
  return () => off(event, cb);
}

export function off(event, cb) {
  if (!listeners[event]) return;
  listeners[event] = listeners[event].filter((l) => l !== cb);
}

export function emit(event, payload) {
  (listeners[event] || []).forEach((cb) => cb(payload));
}

export default { on, off, emit };

// ─────────────────────────────────────────────────────
// 🔊 AudioController
// ─────────────────────────────────────────────────────
let currentSound = null;

export const AudioController = {
  // Arrête le son en cours de lecture n'importe où dans l'app
  async stopAll() {
    if (currentSound) {
      try {
        await currentSound.pauseAsync();
        currentSound = null;
      } catch (e) {
        console.log("Erreur stopAll", e);
      }
    }
  },

  // Enregistre le nouveau son qui commence à jouer
  setCurrent(sound) {
    currentSound = sound;
  },
};
