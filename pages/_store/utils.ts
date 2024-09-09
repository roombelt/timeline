import { ActiveQuery, ActiveState, activeExternalState } from "active-store";
import { useEffect, useRef } from "react";

export function activeLocalStorage<T>(key: string, defaultValue: T): ActiveState<T> {
  let lastValue: string | null = null;
  let lastParsedValue: T = defaultValue;

  const state = activeExternalState(
    () => {
      const value = localStorage.getItem(key);
      if (value !== lastValue) {
        lastValue = value;
        lastParsedValue = value ? JSON.parse(value) : defaultValue;
      }
      return lastParsedValue;
    },
    () => () => null
  );
  const setState = (value: T) => {
    lastParsedValue = value;
    lastValue = JSON.stringify(value);
    localStorage.setItem(key, lastValue);
    state.notify();
  };
  return { type: "active-state", get: state.get, subscribe: state.subscribe, set: setState };
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
