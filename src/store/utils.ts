import { ActiveComputed, ActiveQuery, activeComputed, activeState } from "active-store";

export function activeLocalStorage<T>(key: ActiveComputed<() => string>, defaultValue: T) {
  const version = activeState(0);
  const value = activeComputed(() => {
    version.get(); // refresh on version change
    const value = localStorage.getItem(key.get());
    return value ? (JSON.parse(value) as T) : defaultValue;
  });

  const setState = (newValue: T) => {
    localStorage.setItem(key.get(), JSON.stringify(newValue));
    version.set(version.get() + 1);
  };
  return { get: value.get, set: setState };
}

export function attachRefetchOnTabVisible<S extends ActiveQuery<any>>(source: S, minTime: number) {
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) {
        source
          .invalidate((...params) => {
            const state = source.state(...params);
            return (
              !state.isFetching &&
              (state.dataUpdatedAt ?? 0) < Date.now() - minTime &&
              (state.errorUpdatedAt ?? 0) < Date.now() - minTime
            );
          })
          .catch(() => null);
      }
    });
  }
}
