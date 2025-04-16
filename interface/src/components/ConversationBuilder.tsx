"use client";

import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TokenCounter } from "@/components/TokenCounter";
import { Message } from "@/components/workbench/conversation.types";

interface ConversationBuilderProps {
    systemMessage: string;
    onSystemMessageChange: (message: string) => void;
    messages: Message[];
    onMessagesChange: (messages: Message[]) => void;
    isExpanded: boolean;
}

export function ConversationBuilder({
    systemMessage,
    onSystemMessageChange,
    messages,
    onMessagesChange,
    isExpanded,
}: ConversationBuilderProps) {
    const addMessage = () => {
        onMessagesChange([...messages, { role: "user", content: "" }]);
    };

    const handleMessageChange = (index: number, content: string) => {
        const updatedMessages = [...messages];
        updatedMessages[index].content = content;
        onMessagesChange(updatedMessages);
    };

    const deleteMessage = (index: number) => {
        console.log('deleting message', index);
        const updatedMessages = [...messages];
        updatedMessages.splice(index, 1);
        onMessagesChange(updatedMessages);
    };

    // Chat object array for message data
    const chat = [
        { role: "system", content: systemMessage },
        ...messages
    ];

    return (
        <div className="flex flex-col h-full">
            {isExpanded ? (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        <div className="space-y-6">
                            <div>
                                <label className="text-sm text-zinc-400">System message</label>
                                <Textarea
                                    value={systemMessage}
                                    onChange={(e) => onSystemMessageChange(e.target.value)}
                                    className="mt-1 bg-zinc-900 border-zinc-700 text-white h-24 resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400">Additional messages</label>
                                <div className="space-y-2 mt-2">
                                    {messages.map((message, index) => (
                                        <div key={`message-${message.role}-${index}`} className="border border-zinc-800 rounded-md overflow-hidden">
                                            <div className="bg-zinc-900 px-3 py-1.5 flex items-center justify-between">
                                                <span className="text-sm font-medium">{message.role === "user" ? "User" : "Assistant"}</span>
                                                {message.role === "user" && (
                                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400" onClick={() => deleteMessage(index)}>
                                                        <Trash size={14} />
                                                    </Button>
                                                )}
                                            </div>
                                            <Textarea
                                                value={message.content}
                                                onChange={(e) => handleMessageChange(index, e.target.value)}
                                                placeholder={message.role === "user" ? "Empty user message" : "Empty assistant message"}
                                                className="bg-zinc-900 border-0 text-white h-20 resize-none"
                                            />
                                        </div>
                                    ))}

                                    <Button size="sm" className="w-full mt-2" onClick={addMessage}>
                                        <Plus size={14} className="mr-1" />
                                        Add message
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800">
                        <TokenCounter text={chat} />
                    </div>
                </>
            ) : (
                <TokenCounter text={chat} />
            )}
        </div>
    );
} 