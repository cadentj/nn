"use client";

import { useState } from "react";
import {
    Code,
    History,
    BarChart3,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workbench } from "@/components/Workbench";
import { ChatHistory } from "@/components/ChatHistory";
import { Conversation } from "@/components/workbench/conversation.types";

// Helper function to create default conversations (consistent IDs)
const createDefaultConversation = (type: "chat" | "base"): Conversation => ({
    id: `default-${Date.now()}-${Math.random().toString(36).substring(7)}`, // More unique ID
    type: type,
    title: `${type === "chat" ? "Conversation" : "Prompt"}`,
    systemMessage: "Describe desired model behavior (tone, tool usage, response style)",
    messages: [{ role: "user", content: "" }],
    prompt: "",
    isExpanded: true,
    lastUpdated: new Date()
});

export function Playground() {
    const [modelType, setModelType] = useState<"chat" | "base">("base");
    const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
    // State for the conversations currently active in the workbench
    const [activeConversations, setActiveConversations] = useState<Conversation[]>(() => [createDefaultConversation(modelType)]);

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
                // Potentially assign a different ID for the saved state if needed
                // id: `saved-${conversationToSave.id}-${now.getTime()}`
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
        // Optionally mark as unsaved here if significant changes occurred
        // e.g., if updates.content || updates.messages || etc.
    };

    // Add handler to add a new default conversation to the workbench
    const handleAddConversation = () => {
        setActiveConversations(prev => [...prev, createDefaultConversation(modelType)]);
    };

    // Handler for changing model type - also updates default for new conversations
     const handleModelTypeChange = (newModelType: "chat" | "base") => {
        setModelType(newModelType);
        // Optionally, clear or update existing active conversations based on the new type,
        // or just let the user manage them. For now, just set the type for future adds.
        // If you want to reset the workbench on type change:
        // setActiveConversations([createDefaultConversation(newModelType)]);
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
                        // Pass currentModelType
                        currentModelType={modelType}
                    />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                     {/* Top bar within main content */}
                    <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                        {/* ... existing title and buttons ... */}
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
                             {/* Add button for New Conversation */}
                             <Button variant="outline" size="sm" onClick={handleAddConversation}>
                                <Plus size={16} className="mr-1" />
                                New
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-1 min-h-0">
                        {/* Prompt configuration / Workbench area */}
                        <div className="w-[35%] border-r border-zinc-800 flex flex-col"> {/* Use flex-col */}
                            <div className="p-4 border-b border-zinc-800">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-medium">Model</h2>
                                    {/* Use the updated model type change handler */}
                                    <Select value={modelType} onValueChange={handleModelTypeChange}>
                                        {/* ... Select options ... */}
                                         <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="chat">llama-chat</SelectItem>
                                            <SelectItem value="base">llama</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                        <div className="flex-1 bg-zinc-900 flex flex-col p-4 overflow-auto custom-scrollbar">
                             <p className="text-zinc-400">Token analysis view (coming soon)</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
