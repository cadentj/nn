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
    onTokenSelection?: (indices: number[]) => void;
}

export function ConversationBuilder({
    systemMessage,
    onSystemMessageChange,
    messages,
    onMessagesChange,
    isExpanded,
    onTokenSelection,
}: ConversationBuilderProps) {
    const addMessage = () => {
        const lastMessage = messages[messages.length - 1];
        const nextRole = lastMessage?.role === "user" ? "assistant" : "user";
        onMessagesChange([...messages, { role: nextRole, content: "" }]);
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
        ...(systemMessage ? [{ role: "system", content: systemMessage }] : []),
        ...messages
    ];

    // Only create chat array when needed for tokenization
    const tokenCounterContent = !isExpanded ? chat : null;

    return (
        <div className="flex flex-col h-full">
            {isExpanded ? (

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-6">
                        {/* <div>
                            <label className="text-sm">System message</label>
                            <Textarea
                                value={systemMessage}
                                onChange={(e) => onSystemMessageChange(e.target.value)}
                                className="mt-1 h-24 resize-none"
                            />
                        </div> */}

                        <div>
                            <label className="text-sm ">Messages</label>
                            <div className="space-y-2 mt-2">
                                {messages.map((message, index) => (
                                    <div key={`message-${message.role}-${index}`} className="border  rounded-md overflow-hidden">
                                        <div className="px-3 py-1.5 flex items-center justify-between">
                                            <span className="text-sm font-medium">{message.role === "user" ? "User" : "Assistant"}</span>
                                            {message.role === "user" && (
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteMessage(index)}>
                                                    <Trash size={14} />
                                                </Button>
                                            )}
                                        </div>
                                        <Textarea
                                            value={message.content}
                                            onChange={(e) => handleMessageChange(index, e.target.value)}
                                            placeholder={message.role === "user" ? "Empty user message" : "Empty assistant message"}
                                            className=" border-0 h-20 resize-none focus-visible:ring-0"
                                        />
                                    </div>
                                ))}

                                <Button size="sm" variant="outline" className="w-full mt-2" onClick={addMessage}>
                                    <Plus size={14} className="mr-1" />
                                    Add message
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <TokenCounter text={tokenCounterContent} onTokenSelection={onTokenSelection} />
            )}
        </div>
    );
} 