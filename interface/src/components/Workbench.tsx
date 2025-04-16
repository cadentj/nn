"use client";

import { Plus, ChevronDown, ChevronRight, Trash, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConversationBuilder } from "@/components/ConversationBuilder";
import { SinglePromptBuilder } from "@/components/SinglePromptBuilder";
import { Conversation } from "@/components/workbench/conversation.types";

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
    onDeleteConversation
}: WorkbenchProps) {
    const toggleConversation = (id: string, isExpanded: boolean) => {
        onUpdateConversation(id, { isExpanded: !isExpanded });
    };

    const handleContentUpdate = (id: string, updates: Partial<Conversation>) => {
        onUpdateConversation(id, updates);
    };

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {conversations.map((conv) => (
                <div key={conv.id} className="border rounded-md overflow-hidden">
                    <div className=" px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => toggleConversation(conv.id, conv.isExpanded)}
                            >
                                {conv.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </Button>
                            <input
                                type="text"
                                value={conv.title}
                                onChange={(e) => handleContentUpdate(conv.id, { title: e.target.value })}
                                className="bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onSaveConversation(conv.id)}
                            >
                                <Save size={16} className="mr-1" />
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteConversation(conv.id)}
                            >
                                <Trash size={16} className="mr-1" />
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* {conv.isExpanded && ( */}
                    <div >
                        {conv.type === "chat" ? (
                            <ConversationBuilder
                                systemMessage={conv.systemMessage}
                                onSystemMessageChange={(msg) => handleContentUpdate(conv.id, { systemMessage: msg })}
                                messages={conv.messages}
                                onMessagesChange={(msgs) => handleContentUpdate(conv.id, { messages: msgs })}
                                isExpanded={conv.isExpanded}
                            />
                        ) : (
                            <SinglePromptBuilder
                                prompt={conv.prompt}
                                onPromptChange={(p) => handleContentUpdate(conv.id, { prompt: p })}
                                isExpanded={conv.isExpanded}
                            />
                        )}
                    </div>
                    {/* )} */}
                </div>
            ))}
            {conversations.length === 0 && (
                <p className="text-center py-4">No active conversations. Click 'New' to start.</p>
            )}
        </div>
    );
} 