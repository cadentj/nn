"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronDown, ChevronRight, Trash, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationBuilder } from "@/components/ConversationBuilder";
import { SinglePromptBuilder } from "@/components/SinglePromptBuilder";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  type: "chat" | "base";
  title: string;
  systemMessage: string;
  messages: Message[];
  prompt: string;
  isExpanded: boolean;
  lastUpdated: Date;
  isNew?: boolean;
}

interface WorkbenchProps {
  modelType: "chat" | "base";
  onSaveConversation: (conversation: Conversation) => void;
  onLoadConversation: (conversation: Conversation) => void;
  onDeleteConversation: (id: string) => void;
  initialConversation?: Conversation;
}

export function Workbench({ modelType, onSaveConversation, onLoadConversation, onDeleteConversation, initialConversation }: WorkbenchProps) {
  // Create a default conversation creator function to ensure consistency
  const createDefaultConversation = (): Conversation => ({
    id: Date.now().toString(),
    type: modelType,
    title: `New ${modelType === "chat" ? "Conversation" : "Prompt"}`,
    systemMessage: "Describe desired model behavior (tone, tool usage, response style)",
    messages: [{ role: "user", content: "" }],
    prompt: "",
    isExpanded: true,
    lastUpdated: new Date()
  });

  // Track last loaded conversation to handle replacements properly
  const [lastLoadedId, setLastLoadedId] = useState<string | null>(null);
  
  // Initialize conversations state with either initialConversation or default
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (initialConversation) {
      setLastLoadedId(initialConversation.id);
      return [initialConversation];
    }
    return [createDefaultConversation()];
  });

  // Handle changes to initialConversation
  useEffect(() => {
    if (!initialConversation) {
      // If initialConversation is null, reset to a default conversation
      if (conversations.length === 0 || lastLoadedId !== null) {
        setLastLoadedId(null);
        setConversations([createDefaultConversation()]);
      }
      return;
    }
    
    // For new conversations (from sidebar "New" button), add to existing list
    if (initialConversation.isNew) {
      // Only add if not already in the list (prevent duplicates)
      if (!conversations.some(conv => conv.id === initialConversation.id)) {
        setConversations(prev => [...prev, {
          ...initialConversation,
          isExpanded: true
        }]);
      }
      return;
    }
    
    // For loaded conversations from history, replace the whole list
    // Only if it's different from the last loaded conversation
    if (initialConversation.id !== lastLoadedId) {
      setLastLoadedId(initialConversation.id);
      setConversations([{
        ...initialConversation,
        isExpanded: true
      }]);
    }
  }, [initialConversation, lastLoadedId]);

  // Add a new conversation
  const addConversation = () => {
    setConversations(prev => [...prev, createDefaultConversation()]);
  };

  // Toggle conversation expanded/collapsed state
  const toggleConversation = (id: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, isExpanded: !conv.isExpanded } : conv
    ));
  };

  // Delete a conversation with robust handling
  const deleteConversation = (id: string) => {
    // Always notify parent first about deletion
    onDeleteConversation(id);
    
    // Handle actual deletion in the local state
    setConversations(prev => {
      // Filter out the deleted conversation
      const remaining = prev.filter(conv => conv.id !== id);
      
      // If we'd have no conversations left, create a default one
      if (remaining.length === 0) {
        return [createDefaultConversation()];
      }
      
      // Otherwise return the filtered list
      return remaining;
    });
    
    // If we deleted the last loaded conversation, clear the tracking
    if (lastLoadedId === id) {
      setLastLoadedId(null);
    }
  };

  // Save a conversation
  const saveConversation = (id: string) => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      onSaveConversation({ ...conversation, lastUpdated: new Date() });
    }
  };

  // Update a conversation
  const updateConversation = (id: string, updates: Partial<Conversation>) => {
    setConversations(prev => prev.map(conv => 
      conv.id === id ? { ...conv, ...updates, lastUpdated: new Date() } : conv
    ));
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversations.map((conv) => (
          <div key={conv.id} className="border border-zinc-800 rounded-md overflow-hidden">
            <div className="bg-zinc-900 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => toggleConversation(conv.id)}
                >
                  {conv.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </Button>
                <span className="text-sm font-medium">{conv.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => saveConversation(conv.id)}
                >
                  <Save size={16} className="mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteConversation(conv.id)}
                >
                  <Trash size={16} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            <div className="p-4">
              {conv.type === "chat" ? (
                <ConversationBuilder
                  systemMessage={conv.systemMessage}
                  onSystemMessageChange={(msg) => updateConversation(conv.id, { systemMessage: msg })}
                  messages={conv.messages}
                  onMessagesChange={(msgs) => updateConversation(conv.id, { messages: msgs })}
                  isExpanded={conv.isExpanded}
                />
              ) : (
                <SinglePromptBuilder
                  prompt={conv.prompt}
                  onPromptChange={(p) => updateConversation(conv.id, { prompt: p })}
                  isExpanded={conv.isExpanded}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 