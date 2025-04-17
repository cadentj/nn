"use client";

import { useState, useEffect } from "react";
import {
    Code,
    Play,
    Plus,
    BarChart,
    LayoutGrid,
    X,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workbench } from "@/components/Workbench";
import { ChatHistory } from "@/components/ChatHistory";
import { Conversation } from "@/components/workbench/conversation.types";
import { TestChart } from "@/components/charts/TestChart";
import { ModelSelector } from "./ModelSelector";
import { LogitLensResponse } from "@/components/workbench/conversation.types";
import { ModeToggle } from "@/components/ModeToggle";
import { modes } from "@/components/workbench/modes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ChartSelector } from "./ChartSelector";

type Layout = "1x1" | "1x2" | "2x2";

type ModelLoadStatus = 'loading' | 'success' | 'error';

export function Playground() {
    const [modelType, setModelType] = useState<"chat" | "base">("base");
    const [modelName, setModelName] = useState<string>("EleutherAI/gpt-j-6b");
    const [savedConversations, setSavedConversations] = useState<Conversation[]>([]);
    const [activeConversations, setActiveConversations] = useState<Conversation[]>([]);

    const [chartData, setChartData] = useState<LogitLensResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [selectedModes, setSelectedModes] = useState<(number | undefined)[]>([])
    const [layout, setLayout] = useState<Layout>("1x1")
    const [configuringPosition, setConfiguringPosition] = useState<number | null>(null)
    const [modelLoadStatus, setModelLoadStatus] = useState<ModelLoadStatus>('loading');
    
    const getLayoutGrid = () => {
        switch (layout) {
            case "1x1":
                return "grid-cols-1";
            case "1x2":
                return "grid-cols-2";
            case "2x2":
                return "grid-cols-2 grid-rows-2";
            default:
                return "grid-cols-1";
        }
    }

    const getBoxCount = () => {
        switch (layout) {
            case "1x1":
                return 1;
            case "1x2":
                return 2;
            case "2x2":
                return 4;
            default:
                return 1;
        }
    }

    const handleAddChart = (modeIndex: number) => {
        if (configuringPosition === null) return;

        setSelectedModes(prev => {
            const newModes = [...prev];
            newModes[configuringPosition] = modeIndex;
            return newModes;
        });
        setConfiguringPosition(null);
    }

    const isChartSelected = (modeIndex: number) => {
        return selectedModes.includes(modeIndex);
    }

    const handleRun = async () => {
        setIsLoading(true);
        setChartData(null);
        try {
            const response = await fetch('https://cadentj--nnsight-backend-fastapi-app.modal.run/api/lens', {
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

    const handleRemoveChart = (position: number) => {
        setSelectedModes(prev => {
            const newModes = [...prev];
            newModes[position] = undefined;
            return newModes;
        });
    }

    // Handler to update model load status based on boolean from child
    const handleModelLoadStatusUpdate = (success: boolean) => {
        setModelLoadStatus(success ? 'success' : 'error');
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
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn("text-white", {
                            "bg-yellow-500 hover:bg-yellow-600": modelLoadStatus === 'loading',
                            "bg-green-600 hover:bg-green-700": modelLoadStatus === 'success',
                            "bg-red-600 hover:bg-red-700": modelLoadStatus === 'error',
                        })}
                        disabled={modelLoadStatus === 'loading'}
                    >
                        {modelLoadStatus === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {modelLoadStatus === 'loading' ? 'Loading Models...' : modelLoadStatus === 'success' ? 'Models Ready' : 'Model Load Error'}
                    </Button>
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
                        <div className="w-[40%] border-r flex flex-col">
                            <div className="p-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-sm font-medium">Model</h2>

                                    <div className="flex items-center gap-2">
                                        <ModelSelector
                                            modelName={modelName}
                                            setModelName={setModelName}
                                            setModelType={setModelType}
                                            setLoaded={handleModelLoadStatusUpdate}
                                        />

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

                        {/* Container for charts */}
                        <div className="flex-1 flex flex-col overflow-hidden custom-scrollbar bg-muted relative">
                            {/* Padded container for charts only */}
                            <div className="flex-1 overflow-auto p-4">
                                <div className={`grid ${getLayoutGrid()} gap-4 h-full`}>
                                    {Array.from({ length: getBoxCount() }).map((_, index) => (
                                        <div key={index} className="h-full relative">
                                            {selectedModes[index] !== undefined ? (
                                                <div className="h-full">
                                                    <button
                                                        onClick={() => handleRemoveChart(index)}
                                                        className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors z-10"
                                                    >
                                                        <X className="h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                    <TestChart
                                                        title={modes[selectedModes[index]!].name}
                                                        description={modes[selectedModes[index]!].description}
                                                        data={chartData}
                                                        isLoading={isLoading}
                                                    />
                                                </div>
                                            ) : (
                                                <div 
                                                    className="flex flex-col items-center justify-center h-full border border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/50 transition-colors"
                                                    onClick={() => {
                                                        setConfiguringPosition(index);
                                                    }}
                                                >
                                                    <div className="flex items-center gap-1">
                                                        <p className="text-sm font-medium text-muted-foreground">Add a chart</p>
                                                        <Plus className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Layout selector */}
                            <div className="absolute bottom-4 right-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <LayoutGrid className="h-4 w-4" />
                                            Layout
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => setLayout("1x1")}>
                                            1x1
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLayout("1x2")}>
                                            1x2
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setLayout("2x2")}>
                                            2x2
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* Inline Chart Selector Overlay */}
                            {configuringPosition !== null && (
                                <ChartSelector
                                    setConfiguringPosition={setConfiguringPosition}
                                    isChartSelected={isChartSelected}
                                    handleAddChart={handleAddChart}
                                />
                            )}
                        </div>  
                    </div>
                </div>
            </div>
        </div>
    );
}
