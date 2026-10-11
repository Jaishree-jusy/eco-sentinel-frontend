import { useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
}

// Generic data-fetching hook used across pages to call service functions.
// Re-runs whenever `deps` changes. Guards against setting state after unmount.
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, loading: true, error: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (mounted.current) setState({ data, loading: false, error: null });
      })
      .catch((error: Error) => {
        if (mounted.current) setState({ data: undefined, loading: false, error });
      });
    return () => {
      mounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
