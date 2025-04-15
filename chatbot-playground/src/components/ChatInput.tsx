"use client";

import { useState, type FormEvent } from "react";
import { SendHorizontal, SquarePen, Plus, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({ onSend, placeholder = "Enter instructions or prompt for Claude...", disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="sm" className="text-zinc-500 h-8 px-2 text-xs gap-1">
              <SquarePen size={14} />
              <span>Generate Prompt</span>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-zinc-500">
              <Plus size={16} />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-zinc-500">
              <Mic size={16} />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-24 resize-none pr-14 text-base"
          />

          <Button
            type="submit"
            disabled={!message.trim() || disabled}
            className="absolute bottom-3 right-3 p-0 h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            <SendHorizontal size={18} />
          </Button>
        </div>
      </form>
    </div>
  );
}
