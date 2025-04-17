"use client";

import { useState } from "react";
import {
    Code,
    Play,
    Plus,
    BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workbench } from "@/components/Workbench";
import { ChatHistory } from "@/components/ChatHistory";
import { Conversation } from "@/components/workbench/conversation.types";
import { TestChart } from "@/components/charts/TestChart";
import { ModelSelector } from "./ModelSelector";
import { LogitLensResponse } from "@/components/workbench/conversation.types";
import { ModeToggle } from "@/components/ModeToggle";
import { Toolbar } from "@/components/Toolbar";
import { Toggle } from "@/components/ui/toggle";
import { modes } from "@/components/workbench/modes";

// Helper function to create default conversations (consistent IDs)
const createDefaultConversation = (type: "chat" | "base", model: string): Conversation => ({
    name: "Untitled",
    type: type,
    model: model,
    id: "Untitled",
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

    const [selectedModes, setSelectedModes] = useState<number[]>([0])
    const [isOpen, setIsOpen] = useState<boolean>(true)

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

    const handleIDChange = (id: string, newID: string) => {
        setActiveConversations(prev => prev.map(conv =>
            conv.id === id
                ? { ...conv, id: newID }
                : conv
        ));
    }

    // Update handleLoadConversation to ADD to active conversations
    const handleLoadConversation = (conversationToLoad: Conversation) => {
        // Check if the conversation (by ID) is already active
        if (activeConversations.some(conv => conv.id === conversationToLoad.id)) {

            console.log("Conversation already active:", conversationToLoad.id);

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
        const conversationToSave = activeConversations.find(conv => conv.id === id);
        if (conversationToSave) {
            // Create a saveable version (clean up transient flags if any)
            const savedVersion: Conversation = {
                ...conversationToSave,
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
            handleUpdateConversation(id, { name: savedVersion.id });
        }
    };

    // Update handleDeleteConversation to allow removing the last item
    const handleDeleteConversation = (id: string) => {
        // Remove from active list
        setActiveConversations(prev => {
            const remaining = prev.filter(conv => conv.id !== id);
            return remaining;
        });
    };

    // Add handler to update a specific active conversation
    const handleUpdateConversation = (id: string, updates: Partial<Conversation>) => {
        setActiveConversations(prev => prev.map(conv =>
            conv.id === id
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
                            <Toggle variant="ghost" size="sm" pressed={isOpen} onClick={() => setIsOpen(!isOpen)} className="mr-2">
                                <BarChart size={16} />
                                {isOpen ? "Hide" : "Show"} Options
                            </Toggle>
                            <Button size="sm" onClick={handleRun}>
                                <Play size={16} />
                                Run
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-1 min-h-0">
                        <div className="w-[40%] border-r flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium">Model</h2>

                                    <div className="flex items-center gap-2">
                                        <ModelSelector modelName={modelName} setModelName={setModelName} setModelType={setModelType} />

                                        <Button
                                            size="sm"
                                            className="w-100"
                                            onClick={() => handleLoadConversation({
                                                name: "Untitled",
                                                type: modelType,
                                                model: modelName,
                                                id: "Untitled",
                                                messages: [{ role: "user", content: "" }],
                                                prompt: "",
                                                isExpanded: true,
                                                isNew: true,
                                                selectedTokenIndices: [-1]
                                            })}
                                        >
                                            New
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <Workbench
                                conversations={activeConversations}
                                onUpdateConversation={handleUpdateConversation}
                                onSaveConversation={handleSaveConversation}
                                onDeleteConversation={handleDeleteConversation}
                                onIDChange={handleIDChange}
                            />
                        </div>

                        {/* Container for charts and toolbar, relative positioning needed for absolute toolbar */}
                        <div className="flex-1 flex flex-col overflow-hidden custom-scrollbar bg-muted relative">
                            {/* Padded container for charts only */}
                            <div className="flex-1 overflow-auto p-4">
                                <div className={`grid gap-4 ${
                                    selectedModes.length === 1 ? 'grid-cols-1 items-center' :
                                    selectedModes.length === 2 ? 'grid-cols-2 items-center' :
                                    selectedModes.length >= 3 ? 'grid-cols-2' : ''
                                }`}>
                                    {selectedModes.map((mode) => (
                                        <TestChart
                                            key={mode}
                                            title={modes[mode].name}
                                            description={modes[mode].description}
                                            data={chartData}
                                            isLoading={isLoading}
                                        />
                                    ))}
                                </div>
                            </div> {/* End padded container for charts */}
                            <Toolbar selectedModes={selectedModes} setSelectedModes={setSelectedModes} isOpen={isOpen} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
