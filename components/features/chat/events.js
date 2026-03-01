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
