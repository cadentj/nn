"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ChatInterface } from "@/components/ChatInterface";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Info, HelpCircle, MessagesSquare, PanelLeft, PanelRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Workbench() {
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("Define desired model behavior (tone, tool usage, response style)");

  const handleRunPrompt = () => {
    setRunning(true);
    // In a real application, this would send the prompt to an AI model
    setTimeout(() => {
      setRunning(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-zinc-950">
      <Sidebar />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header
          documentTitle="claude-3-5-sonnet-20241022"
          onRun={handleRunPrompt}
        />

        <div className="flex-1 grid grid-cols-2 h-full overflow-hidden">
          {/* Left panel - Prompt editing */}
          <div className="flex flex-col border-r border-zinc-200 dark:border-zinc-800">
            <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-zinc-500" />
                  <span className="text-sm font-medium">System Prompt</span>
                </div>
                <div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <HelpCircle size={14} />
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

            <div className="flex-1 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">User</div>
                <div>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <PanelRight size={14} />
                  </Button>
                </div>
              </div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter instructions or prompt for Claude..."
                className="min-h-[calc(100%-2.5rem)] text-sm resize-none"
              />
            </div>
          </div>

          {/* Right panel - Chat interface */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 p-2 px-4">
              <Tabs defaultValue="assistant" className="w-full">
                <TabsList className="bg-zinc-100 dark:bg-zinc-900">
                  <TabsTrigger value="assistant" className="data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800">
                    <MessagesSquare size={16} className="mr-2" />
                    Assistant
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 overflow-hidden">
              <ChatInterface initialSystemPrompt={systemPrompt} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
