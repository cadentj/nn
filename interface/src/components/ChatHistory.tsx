"use client";

import { useState } from "react";
import { Plus, MessageSquare, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/components/workbench/conversation.types";

interface ChatHistoryProps {
    savedConversations: Conversation[];
    onLoadConversation: (conversation: Conversation) => void;
    currentModelType: "chat" | "base";
    currentModel: string;
}

export function ChatHistory({ savedConversations, onLoadConversation, currentModelType, currentModel }: ChatHistoryProps) {
    const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved");

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b ">
                <div className="flex items-center gap-2 mb-4">
                    <Button
                        variant={activeTab === "saved" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("saved")}
                    >
                        Saved
                    </Button>
                    <Button
                        variant={activeTab === "recent" ? "secondary" : "ghost"}
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
                        name: `${currentModelType === "chat" ? "Conversation" : "Prompt"}`,
                        type: currentModelType,
                        model: currentModel,
                        id: `${currentModelType === "chat" ? "Conversation" : "Prompt"}`,
                        messages: [{ role: "user", content: "" }],
                        prompt: "",
                        isExpanded: true,
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
                                className="p-3 border rounded cursor-pointer"
                                onClick={() => onLoadConversation(conv)}
                            >
                                <div className="flex items-center gap-2">
                                    {conv.type === "chat" ? (
                                        <MessageSquare size={16} />
                                    ) : (
                                        <FileText size={16}  />
                                    )}
                                    <div className="text-sm font-medium">{conv.id}</div>
                                </div>
                                <div className="text-xs mt-1">
                                    {conv.type === "chat" ? "Chat" : "Prompt"} • {conv.messages.length} messages
                                </div>
                                <div className="text-xs mt-1 flex items-center gap-1">
                                    <Bot size={12} />
                                    {conv.model}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm  text-center py-8">
                        Recent conversations will appear here
                    </div>
                )}
            </div>
        </div>
    );
} 