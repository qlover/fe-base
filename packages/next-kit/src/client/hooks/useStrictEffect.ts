import {
  useEffect,
  useId,
  type DependencyList,
  type EffectCallback
} from 'react';

type StrictEffectEntry = {
  dispose?: () => void;
  timer?: ReturnType<typeof setTimeout>;
  /** Dependency list identity from the run that created this entry. */
  deps?: DependencyList;
};

const ENTRIES_KEY = '__qlover_next_kit_useStrictEffect_entries__';

type GlobalWithEntries = typeof globalThis & {
  [ENTRIES_KEY]?: Map<string, StrictEffectEntry>;
};

/**
 * Module-safe store (survives duplicate bundle copies of this hook).
 * Cleanup is deferred so Strict Mode remount can skip a second effect run.
 */
function getEntries(): Map<string, StrictEffectEntry> {
  const g = globalThis as GlobalWithEntries;
  if (!g[ENTRIES_KEY]) {
    g[ENTRIES_KEY] = new Map();
  }
  return g[ENTRIES_KEY];
}

function depsEqual(a?: DependencyList, b?: DependencyList): boolean {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (a.length !== b.length) return false;
  return a.every((dep, i) => Object.is(dep, b[i]));
}

/**
 * Like `useEffect`, but skips the extra run from React Strict Mode remount
 * when dependencies are unchanged.
 *
 * - `deps == null`: same as `useEffect(effect)` (runs every render; no dedupe).
 * - otherwise: global entry keyed by `useId()` so remount / duplicate bundles
 *   keep the first run; dependency changes use referential `Object.is`.
 */
export const useStrictEffect = (
  effect: EffectCallback,
  deps?: DependencyList
): void => {
  const effectId = useId();

  useEffect(() => {
    // Every-render semantics — do not participate in Strict dedupe.
    if (deps == null) {
      return effect();
    }

    const entries = getEntries();
    const existing = entries.get(effectId);

    // Same deps already active (Strict remount): keep first effect alive.
    if (existing && depsEqual(existing.deps, deps)) {
      if (existing.timer != null) {
        clearTimeout(existing.timer);
        existing.timer = undefined;
      }

      return () => {
        existing.timer = setTimeout(() => {
          existing.dispose?.();
          entries.delete(effectId);
        }, 0);
      };
    }

    // Real deps change: drop previous entry immediately.
    if (existing) {
      if (existing.timer != null) {
        clearTimeout(existing.timer);
      }
      existing.dispose?.();
      entries.delete(effectId);
    }

    const dispose = effect();
    const entry: StrictEffectEntry = {
      dispose: typeof dispose === 'function' ? dispose : undefined,
      deps
    };
    entries.set(effectId, entry);

    return () => {
      entry.timer = setTimeout(() => {
        entry.dispose?.();
        entries.delete(effectId);
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
