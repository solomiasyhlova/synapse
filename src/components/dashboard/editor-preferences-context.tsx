"use client";

import { createContext, useContext } from "react";

import type { EditorPreferences } from "@/lib/editor-preferences";

const EditorPreferencesContext = createContext<EditorPreferences | null>(null);

export function EditorPreferencesProvider({
  preferences,
  children,
}: {
  preferences: EditorPreferences;
  children: React.ReactNode;
}) {
  return (
    <EditorPreferencesContext.Provider value={preferences}>
      {children}
    </EditorPreferencesContext.Provider>
  );
}

export function useEditorPreferences() {
  const context = useContext(EditorPreferencesContext);
  if (!context) {
    throw new Error("useEditorPreferences must be used within an EditorPreferencesProvider");
  }
  return context;
}
