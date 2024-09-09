import { ActiveQuery, ActiveState, activeExternalState } from "active-store";
import { useState } from "react";

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

type UseMutationOptions<S extends (...args: any) => Promise<any>> = {
  onSuccess?: (...props: Parameters<S>) => void;
  onError?: (...props: Parameters<S>) => void;
  onSettled?: (...props: Parameters<S>) => void;
};

type UseMutationState<S extends (...args: any) => Promise<any>> = {
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data?: Awaited<ReturnType<S>>;
  error?: any;
  mutate: (...props: Parameters<S>) => Promise<void>;
  mutateAsync: S;
};

export function useMutation<S extends (...args: any) => Promise<any>>(fn: S, options: UseMutationOptions<S> = {}) {
  const [state, setState] = useState<UseMutationState<S>>(() => {
    function mutate(...args: any) {
      return mutateAsync(...args).catch(() => null);
    }

    async function mutateAsync(...args: any) {
      try {
        setState({ ...defaultFields, isIdle: false, isPending: true });
        const data = await fn(...args);
        setState({ ...defaultFields, isIdle: false, isSuccess: true, data });
        options.onSuccess?.(...args);
        return data;
      } catch (error) {
        setState({ ...defaultFields, isIdle: false, isError: true, error });
        options.onError?.(...args);
        throw error;
      } finally {
        options.onSettled?.(...args);
      }
    }

    const defaultFields: UseMutationState<S> = {
      isIdle: true,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: undefined,
      mutate,
      mutateAsync: mutateAsync as S,
    };

    return { ...defaultFields };
  });

  return state;
}
