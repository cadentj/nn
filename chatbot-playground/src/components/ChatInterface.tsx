"use client";

import { useState, useEffect, useRef } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { Info, Trash2, ArrowRightLeft, PanelRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface ChatInterfaceProps {
  initialSystemPrompt?: string;
}

export function ChatInterface({ initialSystemPrompt = "" }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSystemPrompt, setShowSystemPrompt] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial system message if provided
  useEffect(() => {
    if (initialSystemPrompt && messages.length === 0) {
      setMessages([
        {
          id: "system-1",
          role: "system",
          content: initialSystemPrompt,
          timestamp: Date.now()
        }
      ]);
    }
  }, [initialSystemPrompt, messages.length]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: Date.now()
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: `This is a simulated response to: "${content}"\n\nIn a real implementation, this would be connected to an AI backend service.`,
        timestamp: Date.now()
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const updateSystemPrompt = () => {
    // Update the system message or create if it doesn't exist
    setMessages((prev) => {
      const systemMessageIndex = prev.findIndex(msg => msg.role === "system");
      const newSystemMessage: Message = {
        id: systemMessageIndex >= 0 ? prev[systemMessageIndex].id : `system-${Date.now()}`,
        role: "system",
        content: systemPrompt,
        timestamp: Date.now()
      };

      if (systemMessageIndex >= 0) {
        const updatedMessages = [...prev];
        updatedMessages[systemMessageIndex] = newSystemMessage;
        return updatedMessages;
      } else {
        return [newSystemMessage, ...prev];
      }
    });
  };

  const clearConversation = () => {
    const systemMessages = messages.filter(msg => msg.role === "system");
    setMessages(systemMessages);
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter(msg => msg.id !== id));
  };

  return (
    <div className="flex flex-col h-full">
      {showSystemPrompt && (
        <div className="border-b border-zinc-200 dark:border-zinc-800 p-4 bg-zinc-50 dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-zinc-500" />
              <span className="text-sm font-medium">System Prompt</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={updateSystemPrompt}
              >
                Apply
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowSystemPrompt(false)}
              >
                <PanelRight size={14} />
              </Button>
            </div>
          </div>
          <Textarea
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            placeholder="Define a role, tone or context (optional)"
            className="min-h-20 text-sm"
          />
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {messages.filter(msg => msg.role !== "system" || showSystemPrompt).map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            onDelete={message.role !== "system" ? () => deleteMessage(message.id) : undefined}
          />
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Welcome to Chatbot Playground</h2>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md">
              Write a prompt in the left column, and click Run to see the response
            </p>
            <div className="flex flex-col gap-3 w-full max-w-md">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <ArrowRightLeft size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm">
                  Editing the prompt, or changing model parameters creates a new version
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Plus size={14} className="text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm">
                  Add messages using to simulate a conversation
                </span>
              </div>
            </div>
          </div>
        )}

        {/* This is for auto-scrolling */}
        <div ref={messagesEndRef} />
      </div>

      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1"
            onClick={clearConversation}
          >
            <Trash2 size={14} />
            <span>Clear conversation</span>
          </Button>
        </div>
      )}

      <ChatInput
        onSend={handleSendMessage}
        disabled={isProcessing}
        placeholder={isProcessing ? "Assistant is thinking..." : "Enter instructions or prompt..."}
      />
    </div>
  );
}
