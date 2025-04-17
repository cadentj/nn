"use client";

import { Trash, Save, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationBuilder } from "@/components/ConversationBuilder";
import { SinglePromptBuilder } from "@/components/SinglePromptBuilder";
import { Conversation } from "@/components/workbench/conversation.types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WorkbenchProps {
    conversations: Conversation[];
    onUpdateConversation: (id: string, updates: Partial<Conversation>) => void;
    onSaveConversation: (id: string) => void;
    onDeleteConversation: (id: string) => void;
}

export function Workbench({
    conversations,
    onUpdateConversation,
    onSaveConversation,
    onDeleteConversation,
}: WorkbenchProps) {
    const toggleConversation = (id: string, isExpanded: boolean) => {
        onUpdateConversation(id, { isExpanded: !isExpanded });
    };

    const handleContentUpdate = (id: string, updates: Partial<Conversation>) => {
        onUpdateConversation(id, updates);
    };

    const handleTokenSelection = (id: string, indices: number[]) => {
        onUpdateConversation(id, { selectedTokenIndices: indices });
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {conversations.map((conv) => (
                <Card key={conv.title} className="border overflow-hidden">
                    <div className=" px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                                <Input
                                    value={conv.title}
                                    onChange={(e) => handleContentUpdate(conv.title, { title: e.target.value })}
                                    className="border-none shadow-none px-1 py-0 font-bold"
                                />
                                <span className="text-xs px-1">{conv.model}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onSaveConversation(conv.title)}
                            >
                                <Save size={16}/>
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onDeleteConversation(conv.title)}
                            >
                                <Trash size={16}/>
                            </Button>
                            <Button
                                size="icon"
                                onClick={() => toggleConversation(conv.title, conv.isExpanded)}
                            >
                                <Sparkle size={16}/>
                            </Button>
                        </div>
                    </div>

                    <div >
                        {conv.type === "chat" ? (
                            <ConversationBuilder
                                messages={conv.messages}
                                onMessagesChange={(msgs) => handleContentUpdate(conv.title, { messages: msgs })}
                                isExpanded={conv.isExpanded}
                                onTokenSelection={(indices) => handleTokenSelection(conv.title, indices)}
                                modelName={conv.model}
                            />
                        ) : (
                            <SinglePromptBuilder
                                prompt={conv.prompt}
                                onPromptChange={(p) => handleContentUpdate(conv.title, { prompt: p })}
                                isExpanded={conv.isExpanded}
                                onTokenSelection={(indices) => handleTokenSelection(conv.title, indices)}
                                modelName={conv.model}
                            />
                        )}
                    </div>
                </Card>
            ))}
            {conversations.length === 0 && (
                <p className="text-center py-4">No active conversations. Click 'New' to start.</p>
            )}
        </div>
    );
} 