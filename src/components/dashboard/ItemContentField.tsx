"use client";

import { CodeEditor } from "@/components/dashboard/CodeEditor";
import { MarkdownEditor } from "@/components/dashboard/MarkdownEditor";
import { Textarea } from "@/components/ui/textarea";
import { LANGUAGE_TYPES, MARKDOWN_TYPES } from "@/lib/item-type-kinds";
import { cn } from "@/lib/utils";

interface ItemContentFieldProps {
  id?: string;
  typeName: string;
  value: string;
  language?: string | null;
  onChange: (value: string) => void;
  textareaClassName?: string;
}

export function ItemContentField({
  id,
  typeName,
  value,
  language,
  onChange,
  textareaClassName,
}: ItemContentFieldProps) {
  if (LANGUAGE_TYPES.includes(typeName)) {
    return <CodeEditor value={value} language={language} onChange={onChange} />;
  }

  if (MARKDOWN_TYPES.includes(typeName)) {
    return <MarkdownEditor value={value} onChange={onChange} />;
  }

  return (
    <Textarea
      id={id}
      className={cn("min-h-20 font-mono text-xs", textareaClassName)}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
