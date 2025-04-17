"use client";

import { useState } from "react";
import {
    Code,
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
    type: type,
    model: model,
    title: `${type === "chat" ? "Conversation" : "Prompt"}`,
    messages: [{ role: "user", content: "" }],
    prompt: "",
    isExpanded: true,
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
        if (activeConversations.some(conv => conv.title === conversationToLoad.title)) {

            console.log("Conversation already active:", conversationToLoad.title);

            return;
        }

        const newActiveConversation = {
            ...conversationToLoad,
            isExpanded: true, // Ensure it's expanded when loaded
            isNew: undefined
        };

        setActiveConversations(prev => [...prev, newActiveConversation]);
    };

    // Update handleSaveConversation to find the conversation in activeConversations
    const handleSaveConversation = (id: string) => {
        const conversationToSave = activeConversations.find(conv => conv.title === id);
        if (conversationToSave) {
            const now = new Date();
            // Create a saveable version (clean up transient flags if any)
            const savedVersion: Conversation = {
                ...conversationToSave,
                isNew: undefined, // Ensure isNew is not saved
            };

            setSavedConversations(prev => {
                // Check if a conversation with the same ID already exists
                const existingIndex = prev.findIndex(conv => conv.title === savedVersion.title);
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
            const remaining = prev.filter(conv => conv.title !== id);
            return remaining;
        });
    };

    // Add handler to update a specific active conversation
    const handleUpdateConversation = (id: string, updates: Partial<Conversation>) => {
        setActiveConversations(prev => prev.map(conv =>
            conv.title === id
                ? { ...conv, ...updates }
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
                </div>

                <nav className="flex gap-2 items-center">
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
                        <h1 className="text-lg font-medium">Logit Lens</h1>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <Code size={16} />
                                Code
                            </Button>
                            <Button size="sm" onClick={handleRun}>
                                <Play size={16} />
                                Run
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-1 min-h-0">
                        <div className="w-[35%] border-r flex flex-col"> 
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium">Model</h2>
                                    <ModelSelector modelName={modelName} setModelName={setModelName} setModelType={setModelType} />
                                </div>
                            </div>

                            <Workbench
                                conversations={activeConversations}
                                onUpdateConversation={handleUpdateConversation}
                                onSaveConversation={handleSaveConversation}
                                onDeleteConversation={handleDeleteConversation}
                            />
                        </div>

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
