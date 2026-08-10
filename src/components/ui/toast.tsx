"use client"

import * as React from "react"
import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { XIcon } from "lucide-react"

import { toastManager } from "@/lib/toast"

function ToastList() {
  const { toasts } = ToastPrimitive.useToastManager()

  return (
    <ToastPrimitive.Portal>
      <ToastPrimitive.Viewport className="fixed right-4 bottom-4 z-100 flex w-[calc(100vw-2rem)] flex-col gap-2 sm:w-90">
        {toasts.map((toast) => (
          <ToastPrimitive.Root
            key={toast.id}
            toast={toast}
            className="rounded-lg border border-border bg-popover bg-clip-padding text-popover-foreground shadow-lg transition duration-150 ease-in-out data-ending-style:translate-x-2 data-ending-style:opacity-0 data-starting-style:translate-x-2 data-starting-style:opacity-0"
          >
            <ToastPrimitive.Content className="flex items-start gap-3 p-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <ToastPrimitive.Title className="text-sm font-medium" />
                <ToastPrimitive.Description className="text-sm text-muted-foreground" />
              </div>
              <ToastPrimitive.Close
                aria-label="Dismiss"
                className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon className="size-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Content>
          </ToastPrimitive.Root>
        ))}
      </ToastPrimitive.Viewport>
    </ToastPrimitive.Portal>
  )
}

function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastPrimitive.Provider toastManager={toastManager}>
      {children}
      <ToastList />
    </ToastPrimitive.Provider>
  )
}

export { ToastProvider }
