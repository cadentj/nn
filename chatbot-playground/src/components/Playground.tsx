"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Code,
  History,
  Save,
  Settings,
  BarChart3,
  MessagesSquare,
  Plus,
  Trash,
  Mic,
  Info,
  LayoutDashboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { TokenCounter } from "@/components/TokenCounter";
import { TokenVisualizer } from "@/components/TokenVisualizer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConversationBuilder } from "@/components/ConversationBuilder";
import { SinglePromptBuilder } from "@/components/SinglePromptBuilder";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workbench } from "@/components/Workbench";
import { ChatHistory } from "@/components/ChatHistory";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TokenData {
  count: number;
  tokens: {id: number, text: string}[];
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

export function Playground() {
  const [systemMessage, setSystemMessage] = useState("Describe desired model behavior (tone, tool usage, response style)");
  const [messages, setMessages] = useState<Message[]>([
    { role: "user", content: "Example prompt to analyze token distribution patterns" },
    { role: "assistant", content: "" }
  ]);
  const [prompt, setPrompt] = useState("");
  const [modelType, setModelType] = useState<"chat" | "base">("chat");
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [isTokenizing, setIsTokenizing] = useState(false);
  const [activeTab, setActiveTab] = useState("token-stats");
  const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);

  // Combined text for tokenization
  const allText = modelType === "chat" 
    ? [systemMessage, ...messages.map(m => m.content)].join("\n\n")
    : prompt;

  const addMessage = () => {
    setMessages([...messages, { role: "user", content: "" }]);
  };

  const handleMessageChange = (index: number, content: string) => {
    const updatedMessages = [...messages];
    updatedMessages[index].content = content;
    setMessages(updatedMessages);
  };

  const deleteMessage = (index: number) => {
    const updatedMessages = [...messages];
    updatedMessages.splice(index, 1);
    setMessages(updatedMessages);
  };

  const handleLoadConversation = (conversation: Conversation) => {
    // Create a new conversation with a fresh ID
    const newConversation = {
      ...conversation,
      id: Date.now().toString(),
      isExpanded: true,
      lastUpdated: new Date()
    };
    
    // Update the model type based on the loaded conversation
    setModelType(conversation.type);
    
    // If it's a chat conversation, update the system message and messages
    if (conversation.type === "chat") {
      setSystemMessage(conversation.systemMessage);
      setMessages(conversation.messages);
    } else {
      // If it's a base conversation, update the prompt
      setPrompt(conversation.prompt);
    }

    // Set the current conversation
    setCurrentConversation(newConversation);
  };

  const handleSaveConversation = (conversation: Conversation) => {
    const savedConversation = {
      ...conversation,
      id: `saved-${Date.now()}`,
      lastUpdated: new Date()
    };
    setSavedConversations([...savedConversations, savedConversation]);
  };

  const handleDeleteConversation = (id: string) => {
    // Remove from saved conversations list
    setSavedConversations(savedConversations.filter(conv => conv.id !== id));
    
    // If we deleted the currently active conversation, set currentConversation to null
    // This forces the Workbench to reset to its default state
    if (currentConversation && currentConversation.id === id) {
      setCurrentConversation(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-xs text-white">AI</span>
            </div>
            <div className="text-sm font-medium">AI Playground</div>
          </div>
          <div className="h-4 border-l border-zinc-700" />
          <div className="text-sm font-medium">Token Analysis</div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex">
            <Button variant="ghost" size="sm" className="btn-high-contrast">Playground</Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Dashboard</Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">Docs</Button>
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">API reference</Button>
          </nav>

          <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
            <span className="text-xs text-white">U</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="w-64 border-r border-zinc-800 bg-zinc-950">
          <ChatHistory
            savedConversations={savedConversations}
            onLoadConversation={handleLoadConversation}
            currentModelType={modelType}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h1 className="text-lg font-medium">Token Analyzer</h1>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                <Code size={16} className="mr-2" />
                Code
              </Button>
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                <BarChart3 size={16} className="mr-2" />
                Compare
              </Button>
              <Button variant="ghost" size="sm" className="text-zinc-300 hover:text-white">
                <History size={16} className="mr-2" />
                History
              </Button>
            </div>
          </div>

          <div className="flex flex-1 min-h-0">
            {/* Prompt configuration */}
            <div className="w-[35%] border-r border-zinc-800 overflow-y-auto custom-scrollbar">
              <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-medium">Model</h2>
                  <Select value={modelType} onValueChange={(value: "chat" | "base") => setModelType(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chat">llama-chat</SelectItem>
                      <SelectItem value="base">llama</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Workbench
                modelType={modelType}
                onSaveConversation={handleSaveConversation}
                onLoadConversation={handleLoadConversation}
                onDeleteConversation={handleDeleteConversation}
                initialConversation={currentConversation || undefined}
              />
            </div>

            {/* Token analysis area */}
            <div className="flex-1 bg-zinc-900 flex flex-col p-4 overflow-auto custom-scrollbar">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="flex justify-between items-center mb-6">
                  <TabsList className="bg-zinc-800">
                    <TabsTrigger value="token-stats" className="data-[state=active]:bg-zinc-700">
                      <BarChart3 size={16} className="mr-2" />
                      Token Statistics
                    </TabsTrigger>
                    <TabsTrigger value="visualization" className="data-[state=active]:bg-zinc-700">
                      <BarChart3 size={16} className="mr-2" />
                      Visualization
                    </TabsTrigger>
                  </TabsList>

                  <Button
                    onClick={() => setIsTokenizing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Analyze Tokens
                  </Button>
                </div>

                <TabsContent value="token-stats" className="focus-visible:outline-none focus-visible:ring-0">
                  <div className="space-y-4">
                    <div className="p-4 border border-zinc-800 rounded-md bg-zinc-900">
                      <div className="flex items-center gap-2 mb-2">
                        <Info size={16} className="text-blue-400" />
                        <span className="text-sm font-medium">About Token Analysis</span>
                      </div>
                      <p className="text-sm text-zinc-400">
                        This tool helps you understand how your prompt text is tokenized by language models.
                        Analyze the token distribution, frequencies, and patterns to optimize your prompts.
                      </p>
                    </div>

                    <TokenVisualizer
                      text={allText}
                      tokenData={tokenData}
                      isLoading={isTokenizing}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="visualization" className="focus-visible:outline-none focus-visible:ring-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-zinc-800 rounded-md bg-zinc-900 p-4">
                      <h3 className="text-sm font-medium mb-2">Token Length Distribution</h3>
                      <div className="h-60 flex items-end">
                        {/* Simple mock bar chart */}
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div key={`bar-${i}`} className="flex-1 mx-1">
                            <div
                              className="w-full bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm"
                              style={{ height: `${Math.max(20, Math.random() * 80)}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-zinc-800 rounded-md bg-zinc-900 p-4">
                      <h3 className="text-sm font-medium mb-2">Token Type Distribution</h3>
                      <div className="flex items-center justify-center h-60">
                        {/* Mock donut chart */}
                        <div className="h-40 w-40 rounded-full border-8 border-blue-600 relative">
                          <div className="absolute inset-0 border-t-8 border-r-8 border-purple-600 rounded-full" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }}></div>
                          <div className="absolute inset-0 border-b-8 border-l-8 border-green-600 rounded-full" style={{ clipPath: 'polygon(0 50%, 0 100%, 50% 100%)' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
