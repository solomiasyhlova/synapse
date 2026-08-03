"use client";

import { createContext, useContext, useState } from "react";

interface GlobalSearchContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

export function GlobalSearchProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <GlobalSearchContext.Provider value={{ isOpen, setOpen: setIsOpen }}>
      {children}
    </GlobalSearchContext.Provider>
  );
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("useGlobalSearch must be used within a GlobalSearchProvider");
  }
  return context;
}
