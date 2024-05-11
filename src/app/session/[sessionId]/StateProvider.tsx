'use client';
import { useSharedStore } from '@/app/session/[sessionId]/store';
import { Store } from '@/core/State';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

function useServerData(
  defaultValue: string | undefined,
  getServerData: () => Promise<string | undefined>,
) {
  const [serverData, setServerData] = useState<string | undefined>(
    defaultValue,
  );

  useEffect(() => {
    const interval = setInterval(async () => {
      const newServerData = await getServerData();
      if (!newServerData) {
        return;
      }
      if (serverData !== newServerData) {
        console.log('got new server data');
        setServerData(newServerData);
      }
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!serverData) {
      return;
    }
    return new Uint8Array(Array.from(atob(serverData), (c) => c.charCodeAt(0)));
  }, [serverData]);
}

const SharedStoreContext = createContext<Store | null>(null);

export function StateProvider({
  children,
  defaultValue,
  getServerData,
  onChange,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  getServerData: () => Promise<string | undefined>;
  onChange?: (data: string) => void;
}) {
  const serverData = useServerData(defaultValue, getServerData);

  const store = useSharedStore(serverData, (data) => {
    if (!onChange) {
      return;
    }
    const base64 = btoa(
      data.reduce(
        (dataString, byte) => dataString + String.fromCharCode(byte),
        '',
      ),
    );
    onChange(base64);
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
