"use client";

import { useState } from "react";
import { Plus, Clock, MessageSquare, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/components/workbench/conversation.types";

interface ChatHistoryProps {
    savedConversations: Conversation[];
    onLoadConversation: (conversation: Conversation) => void;
    currentModelType: "chat" | "base";
}

export function ChatHistory({ savedConversations, onLoadConversation, currentModelType }: ChatHistoryProps) {
    const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved");

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                    <Button
                        variant={activeTab === "saved" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved
                    </Button>
                    <Button
                        variant={activeTab === "recent" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("recent")}
                    >
                        Recent
                    </Button>
                </div>

                <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onLoadConversation({
                        id: Date.now().toString(),
                        type: currentModelType,
                        title: `${currentModelType === "chat" ? "Conversation" : "Prompt"}`,
                        systemMessage: "Describe desired model behavior (tone, tool usage, response style)",
                        messages: [{ role: "user", content: "" }],
                        prompt: "",
                        isExpanded: true,
                        lastUpdated: new Date(),
                        isNew: true,
                        selectedTokenIndices: [-1]
                    })}
                >
                    <Plus size={16} className="mr-2" />
                    New {currentModelType === "chat" ? "Conversation" : "Prompt"}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === "saved" ? (
                    <div className="space-y-2">
                        {savedConversations.map((conv) => (
                            <div
                                key={conv.id}
                                className="p-3 border border-zinc-800 rounded-md hover:bg-zinc-900 cursor-pointer"
                                onClick={() => onLoadConversation(conv)}
                            >
                                <div className="flex items-center gap-2">
                                    {conv.type === "chat" ? (
                                        <MessageSquare size={16} className="text-zinc-500" />
                                    ) : (
                                        <FileText size={16} className="text-zinc-500" />
                                    )}
                                    <div className="text-sm font-medium">{conv.title}</div>
                                </div>
                                <div className="text-xs text-zinc-500 mt-1">
                                    {conv.type === "chat" ? "Chat" : "Prompt"} • {conv.messages.length} messages
                                </div>
                                <div className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                    <Clock size={12} />
                                    {conv.lastUpdated.toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-zinc-500 text-center py-8">
                        Recent conversations will appear here
                    </div>
                )}
            </div>
        </div>
    );
} 