"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_LANGUAGE, getLanguageLabel, LANGUAGE_OPTIONS } from "@/lib/languages";

interface LanguageSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

export function LanguageSelect({ id, value, onChange }: LanguageSelectProps) {
  const normalized = value.trim().toLowerCase() || DEFAULT_LANGUAGE;
  const isKnown = LANGUAGE_OPTIONS.some((option) => option.value === normalized);
  const options = isKnown
    ? LANGUAGE_OPTIONS
    : [...LANGUAGE_OPTIONS, { value: normalized, label: getLanguageLabel(normalized) }];

  return (
    <Select value={normalized} onValueChange={(next) => onChange(next ?? DEFAULT_LANGUAGE)} items={options}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
