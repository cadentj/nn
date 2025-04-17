"use client";

import { useState } from "react";
import { Plus, MessagesSquare, FileText, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Conversation } from "@/components/workbench/conversation.types";

interface ChatHistoryProps {
    savedConversations: Conversation[];
    onLoadConversation: (conversation: Conversation) => void;
}

export function ChatHistory({ savedConversations, onLoadConversation }: ChatHistoryProps) {
    const [activeTab, setActiveTab] = useState<"saved" | "recent">("saved");

    return (
        <div className="h-full flex flex-col">
            <div className="p-4 border-b ">
                <div className="flex items-center gap-2 ">
                    <Button
                        variant={activeTab === "saved" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("saved")}
                    >
                        Prompts
                    </Button>
                    <Button
                        variant={activeTab === "recent" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setActiveTab("recent")}
                    >
                        Workspaces
                    </Button>
                </div>
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
                                        <MessagesSquare size={16} />
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