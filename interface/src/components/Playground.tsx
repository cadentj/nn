"use client";

import { useState } from "react";
import {
    Code,
    History,
    BarChart3,
    Plus,
    Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workbench } from "@/components/Workbench";
import { ChatHistory } from "@/components/ChatHistory";
import { Conversation } from "@/components/workbench/conversation.types";
import { TestChart } from "@/components/charts/TestChart";
import { ModelSelector } from "./ModelSelector";
import { LogitLensResponse } from "@/components/workbench/conversation.types";
import { ModeToggle } from "@/components/ModeToggle";

// Helper function to create default conversations (consistent IDs)
const createDefaultConversation = (type: "chat" | "base", model: string): Conversation => ({
    id: `default-${Date.now()}-${Math.random().toString(36).substring(7)}`, // More unique ID
    type: type,
    model: model,
    title: `${type === "chat" ? "Conversation" : "Prompt"}`,
    systemMessage: "",
    messages: [{ role: "user", content: "" }],
    prompt: "",
    isExpanded: true,
    lastUpdated: new Date(),
    selectedTokenIndices: [-1],
});

export function Playground() {
    const [modelType, setModelType] = useState<"chat" | "base">("base");
    const [modelName, setModelName] = useState<string>("EleutherAI/gpt-j-6b");
    const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
    // State for the conversations currently active in the workbench
    const [activeConversations, setActiveConversations] = useState<Conversation[]>(() => [createDefaultConversation(modelType, modelName)]);

    const [chartData, setChartData] = useState<LogitLensResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleRun = async () => {
        setIsLoading(true);
        setChartData(null);
        try {
            const response = await fetch('http://localhost:8000/api/lens', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ conversations: activeConversations }),
            });
            const data: LogitLensResponse = await response.json();
            setChartData(data);
        } catch (error) {
            console.error('Error sending request:', error);
            setChartData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Update handleLoadConversation to ADD to active conversations
    const handleLoadConversation = (conversationToLoad: Conversation) => {
        // Check if the conversation (by ID) is already active
        if (activeConversations.some(conv => conv.id === conversationToLoad.id)) {

            console.log("Conversation already active:", conversationToLoad.id);

            return;
        }

        const newActiveConversation = {
            ...conversationToLoad,
            // Reusing the original ID
            id: conversationToLoad.id,
            isExpanded: true, // Ensure it's expanded when loaded
            lastUpdated: new Date(),
            isNew: undefined
        };

        setActiveConversations(prev => [...prev, newActiveConversation]);
    };

    // Update handleSaveConversation to find the conversation in activeConversations
    const handleSaveConversation = (id: string) => {
        const conversationToSave = activeConversations.find(conv => conv.id === id);
        if (conversationToSave) {
            const now = new Date();
            // Create a saveable version (clean up transient flags if any)
            const savedVersion: Conversation = {
                ...conversationToSave,
                lastUpdated: now,
                isNew: undefined, // Ensure isNew is not saved
            };

            setSavedConversations(prev => {
                // Check if a conversation with the same ID already exists
                const existingIndex = prev.findIndex(conv => conv.id === savedVersion.id);
                if (existingIndex !== -1) {
                    // Update existing conversation
                    const updatedSaved = [...prev];
                    updatedSaved[existingIndex] = savedVersion;
                    return updatedSaved;
                } else {
                    // Add as new saved conversation
                    return [...prev, savedVersion];
                }
            });
            // Optionally, update the title in the active conversation to remove "(unsaved)" if applicable
            handleUpdateConversation(id, { title: savedVersion.title });
        }
    };

    // Update handleDeleteConversation to allow removing the last item
    const handleDeleteConversation = (id: string) => {
        // Remove from active list
        setActiveConversations(prev => {
            const remaining = prev.filter(conv => conv.id !== id);
            // Allow the list to become empty - DO NOT add a default one here
            // if (remaining.length === 0) {
            //     return [createDefaultConversation(modelType)];
            // }
            return remaining;
        });
    };

    // Add handler to update a specific active conversation
    const handleUpdateConversation = (id: string, updates: Partial<Conversation>) => {
        setActiveConversations(prev => prev.map(conv =>
            conv.id === id
                ? { ...conv, ...updates, lastUpdated: new Date() }
                : conv
        ));
    };

    return (
        <div className="flex flex-col h-screen">
            <header className="border-b  px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img
                        src="/images/NDIF.png"
                        alt="NDIF Logo"
                        className="h-8"
                    />
                    <div className="h-4 border-l" />
                    <div className="text-sm font-medium">Logit Lens</div>
                </div>

                <nav className="flex">
                    <Button variant="ghost" size="sm">NNsight</Button>
                    <Button variant="ghost" size="sm">API reference</Button>
                    <ModeToggle />
                </nav>
            </header>

            <div className="flex flex-1 min-h-0">
                {/* Left sidebar */}
                <div className="w-64 border-r ">
                    <ChatHistory
                        savedConversations={savedConversations}
                        onLoadConversation={handleLoadConversation}
                        // Pass currentModelType
                        currentModelType={modelType}
                        currentModel={modelName}
                    />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {/* Top bar within main content */}
                    <div className="p-4 border-b flex items-center justify-between">
                        {/* ... existing title and buttons ... */}
                        <h1 className="text-lg font-medium">Token Analyzer</h1>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Code size={16} />
                                Code
                            </Button>
                            <Button variant="ghost" size="sm">
                                <BarChart3 size={16} />
                                Compare
                            </Button>
                            <Button variant="ghost" size="sm">
                                <History size={16} />
                                History
                            </Button>
                            <Button size="sm" onClick={handleRun}>
                                <Play size={16} />
                                Run
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-1 min-h-0">
                        {/* Prompt configuration / Workbench area */}
                        <div className="w-[35%] border-r flex flex-col"> {/* Use flex-col */}
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-medium">Model</h2>
                                    <ModelSelector modelName={modelName} setModelName={setModelName} setModelType={setModelType} />
                                </div>
                                {/* Add other model config options here if needed */}
                            </div>

                            {/* Pass activeConversations and new handlers to Workbench */}
                            <Workbench
                                conversations={activeConversations}
                                onUpdateConversation={handleUpdateConversation}
                                onSaveConversation={handleSaveConversation}
                                onDeleteConversation={handleDeleteConversation}
                            // No longer need modelType or initialConversation here
                            />
                        </div>

                        {/* Token analysis area */}
                        <div className="flex-1 flex flex-col p-4 overflow-auto custom-scrollbar bg-muted">
                            <TestChart
                                title="Token Analysis"
                                description="Probability of the target token per layer."
                                data={chartData}
                                isLoading={isLoading}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
