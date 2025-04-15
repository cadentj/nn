"use client";

import { Trash2, Copy, Image } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  onDelete?: () => void;
}

export function ChatMessage({ role, content, onDelete }: ChatMessageProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className={`
      py-6 px-6 border-b border-zinc-200 dark:border-zinc-800
      ${role === "user" ? "bg-white dark:bg-zinc-950" : ""}
      ${role === "assistant" ? "bg-white dark:bg-zinc-950" : ""}
      ${role === "system" ? "bg-zinc-100 dark:bg-zinc-900" : ""}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 w-full max-w-[95%]">
          <div className="w-6 h-6 flex items-center justify-center shrink-0">
            {role === "user" && (
              <div className="h-6 w-6 bg-zinc-200 dark:bg-zinc-700 rounded-sm flex items-center justify-center text-xs font-medium">
                U
              </div>
            )}
            {role === "assistant" && (
              <div className="h-6 w-6 bg-purple-100 dark:bg-purple-900 rounded-sm flex items-center justify-center text-xs font-medium text-purple-700 dark:text-purple-300">
                A
              </div>
            )}
            {role === "system" && (
              <div className="h-6 w-6 bg-blue-100 dark:bg-blue-900 rounded-sm flex items-center justify-center text-xs font-medium text-blue-700 dark:text-blue-300">
                S
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
              {role === "user" && "User"}
              {role === "assistant" && "Assistant"}
              {role === "system" && "System Prompt"}
            </div>
            <div className="text-sm whitespace-pre-wrap">{content}</div>
          </div>
        </div>

        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={copyToClipboard} className="h-8 w-8 text-zinc-500">
            <Copy size={16} />
          </Button>
          {onDelete && (
            <Button size="icon" variant="ghost" onClick={onDelete} className="h-8 w-8 text-zinc-500">
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
