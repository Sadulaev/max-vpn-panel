import { createContext, useContext } from 'react';

export type Tab = 'standard' | 'anti' | 'nodes' | 'instructions';

interface TabContextValue {
  setTab: (tab: Tab) => void;
}

export const TabContext = createContext<TabContextValue | null>(null);

export function useTabContext(): TabContextValue {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error('useTabContext must be used inside AppLayout');
  return ctx;
}
