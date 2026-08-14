import type { KeyboardEvent } from "react";

export function useOpenItemProps(openItem: (itemId: string) => void, itemId: string) {
  return {
    role: "button" as const,
    tabIndex: 0,
    onClick: () => openItem(itemId),
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openItem(itemId);
      }
    },
  };
}
