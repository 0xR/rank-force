'use client';
import { Store } from '@/core/State';
import { useSharedStore } from '@/routes/~session/~$sessionId/store';
import { createContext, useContext } from 'react';

const SharedStoreContext = createContext<Store | null>(null);

export function StateProvider({
  children,
}: {
  children: React.ReactNode;
  defaultValue?: string;
}) {
  const store = useSharedStore(undefined, (newBytes) => {
    console.log('onChange', newBytes.length);
  });
  return (
    <SharedStoreContext.Provider value={store}>
      {children}
    </SharedStoreContext.Provider>
  );
}

export function useStoreContext() {
  const store = useContext(SharedStoreContext);
  if (!store) {
    throw new Error(
      'useStoreContext must be used within a StateProvider component',
    );
  }
  return store;
}
