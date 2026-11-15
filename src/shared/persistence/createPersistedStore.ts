export type StorageAccess = () => Pick<Storage, 'getItem' | 'setItem'>;

/** A single in-memory snapshot remains authoritative if browser storage is denied.
 * Storage access is lazy, so importing a domain module never requires a browser.
 * Existing storage keys are retained; decoders migrate/validate the old payloads.
 */
export function createPersistedStore<T>({
  key, initial, decode, storage = () => localStorage, legacyStorage,
}: {
  key: string;
  initial: () => T;
  decode: (value: unknown) => T | undefined;
  storage?: StorageAccess;
  legacyStorage?: StorageAccess;
}) {
  let initialized = false;
  let current: T;
  const listeners = new Set<() => void>();
  function getSnapshot(): T {
    if (!initialized) {
      initialized = true;
      current = initial();
      for (const access of [storage, legacyStorage]) {
        if (!access) continue;
        try {
          const raw = access().getItem(key);
          if (raw === null) continue;
          const value = decode(JSON.parse(raw));
          if (value !== undefined) { current = value; break; }
        } catch { /* Invalid or unavailable storage must not stop the game. */ }
      }
    }
    return current;
  }
  function set(next: T) {
    getSnapshot();
    current = next;
    try { storage().setItem(key, JSON.stringify(next)); } catch { /* Keep the snapshot in memory. */ }
    listeners.forEach(listener => listener());
  }
  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }
  return { getSnapshot, set, subscribe };
}
