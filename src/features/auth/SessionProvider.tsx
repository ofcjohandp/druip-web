import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { initializeAuthListener, useAuthStore } from './useAuthStore';

export function SessionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeAuthListener();

    // Track network state for offline notice (D-19)
    const unsubscribe = NetInfo.addEventListener((state) => {
      useAuthStore.getState().setOnline(!!state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  return <>{children}</>;
}
