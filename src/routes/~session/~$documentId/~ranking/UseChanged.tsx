import { useEffect, useRef } from 'react';

export function useChanged<T>(value: T): boolean {
  const ref = useRef<T>(value);
  const isFirstRender = useRef(true);
  const changed = ref.current !== value;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      ref.current = value;
    }
  }, [value]);

  return changed;
}
