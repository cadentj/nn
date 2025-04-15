"use client";

import {
  ChevronDown,
  Code,
  Save,
  PlayCircle,
  History,
  FileText,
  LucideIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface HeaderProps {
  documentTitle?: string;
  onSave?: () => void;
  onRun?: () => void;
}

export function Header({ documentTitle = "Untitled", onSave, onRun }: HeaderProps) {
  const [lastSaved, setLastSaved] = useState("Jan 10 at 8:24 PM");

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="font-medium flex items-center gap-1 text-zinc-700 dark:text-zinc-300">
          {documentTitle}
          <Button variant="ghost" size="icon" className="h-6 w-6">
            <ChevronDown size={16} />
          </Button>
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
          Last saved {lastSaved}
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={onSave}
            >
              Save changes
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ModelSelector />

        <div className="flex items-center">
          <Button variant="ghost" size="sm" className="font-medium">
            Prompt
          </Button>
          <Button variant="ghost" size="sm" className="text-zinc-500 dark:text-zinc-400">
            Evaluate
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Code size={18} />
        </Button>

        <Button
          onClick={onRun}
          variant="default"
          size="sm"
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <PlayCircle size={16} />
          Run
        </Button>
      </div>
    </header>
  );
}

function ModelSelector() {
  const [selectedModel, setSelectedModel] = useState("gpt-4.1");

  return (
    <div className="flex items-center gap-2 text-sm border rounded-md px-2 py-1 dark:border-zinc-700">
      <span className="font-medium">Model: {selectedModel}</span>
      <Button variant="ghost" size="icon" className="h-5 w-5">
        <ChevronDown size={14} />
      </Button>
    </div>
  );
}
