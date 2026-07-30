"use client";

import { createContext, useContext, useState } from "react";

interface ItemDrawerContextValue {
  openItemId: string | null;
  isOpen: boolean;
  openItem: (id: string) => void;
  close: () => void;
}

const ItemDrawerContext = createContext<ItemDrawerContextValue | null>(null);

export function ItemDrawerProvider({ children }: { children: React.ReactNode }) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <ItemDrawerContext.Provider
      value={{
        openItemId,
        isOpen,
        openItem: (id: string) => {
          setOpenItemId(id);
          setIsOpen(true);
        },
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </ItemDrawerContext.Provider>
  );
}

export function useItemDrawer() {
  const context = useContext(ItemDrawerContext);
  if (!context) {
    throw new Error("useItemDrawer must be used within an ItemDrawerProvider");
  }
  return context;
}
