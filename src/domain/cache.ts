/**
 * Tiny bounded memo cache for pure, deterministic domain computations.
 * Keys must fully describe the inputs. Results must be treated as immutable.
 */
const stores = new Map<string, Map<string, unknown>>();
const LIMIT = 400;

export function memo<T>(namespace: string, key: string, compute: () => T): T {
  let store = stores.get(namespace);
  if (!store) {
    store = new Map();
    stores.set(namespace, store);
  }
  if (store.has(key)) {
    const v = store.get(key) as T;
    // Refresh recency.
    store.delete(key);
    store.set(key, v);
    return v;
  }
  const v = compute();
  store.set(key, v);
  if (store.size > LIMIT) store.delete(store.keys().next().value as string);
  return v;
}

export function clearMemo(): void {
  stores.clear();
}
