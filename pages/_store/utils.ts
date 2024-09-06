import { ActiveState, activeExternalState } from "active-store";

export function activeLocalStorage<T>(key: string, defaultValue: T): ActiveState<T> {
  const state = activeExternalState(
    () => JSON.parse(localStorage.getItem(key) ?? JSON.stringify(defaultValue)),
    () => () => null
  );
  const setState = (value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
    state.notify();
  };
  return { ...state, set: setState };
}
