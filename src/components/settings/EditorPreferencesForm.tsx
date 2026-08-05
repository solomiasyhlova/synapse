"use client";

import { useState } from "react";

import { updateEditorPreferences } from "@/actions/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  EDITOR_FONT_SIZES,
  EDITOR_TAB_SIZES,
  EDITOR_THEMES,
  type EditorPreferences,
  type EditorTheme,
} from "@/lib/editor-preferences";
import { toastManager } from "@/lib/toast";

const THEME_LABELS: Record<EditorTheme, string> = {
  "vs-dark": "VS Dark",
  monokai: "Monokai",
  "github-dark": "GitHub Dark",
};

interface EditorPreferencesFormProps {
  initialPreferences: EditorPreferences;
}

export function EditorPreferencesForm({ initialPreferences }: EditorPreferencesFormProps) {
  const [preferences, setPreferences] = useState(initialPreferences);

  async function save(next: EditorPreferences) {
    setPreferences(next);
    const result = await updateEditorPreferences(next);
    if (result.success) {
      toastManager.add({ title: "Preferences saved" });
    } else {
      toastManager.add({ title: "Failed to save preferences", description: result.error });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor="editor-font-size" className="text-sm font-medium">
          Font size
        </label>
        <Select
          value={String(preferences.fontSize)}
          onValueChange={(value) => void save({ ...preferences, fontSize: Number(value) })}
        >
          <SelectTrigger id="editor-font-size" size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITOR_FONT_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="editor-tab-size" className="text-sm font-medium">
          Tab size
        </label>
        <Select
          value={String(preferences.tabSize)}
          onValueChange={(value) => void save({ ...preferences, tabSize: Number(value) })}
        >
          <SelectTrigger id="editor-tab-size" size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITOR_TAB_SIZES.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size} spaces
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="editor-word-wrap" className="text-sm font-medium">
          Word wrap
        </label>
        <Switch
          id="editor-word-wrap"
          checked={preferences.wordWrap}
          onCheckedChange={(checked) => void save({ ...preferences, wordWrap: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="editor-minimap" className="text-sm font-medium">
          Minimap
        </label>
        <Switch
          id="editor-minimap"
          checked={preferences.minimap}
          onCheckedChange={(checked) => void save({ ...preferences, minimap: checked })}
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label htmlFor="editor-theme" className="text-sm font-medium">
          Theme
        </label>
        <Select
          value={preferences.theme}
          onValueChange={(value) => void save({ ...preferences, theme: value as EditorTheme })}
        >
          <SelectTrigger id="editor-theme" size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EDITOR_THEMES.map((theme) => (
              <SelectItem key={theme} value={theme}>
                {THEME_LABELS[theme]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
