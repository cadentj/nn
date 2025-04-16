export interface Message {
    role: "user" | "assistant";
    content: string;
}

export interface Conversation {
    id: string;
    type: "chat" | "base";
    title: string;
    systemMessage: string;
    messages: Message[];
    prompt: string;
    isExpanded: boolean;
    lastUpdated: Date;
    isNew?: boolean;
    selectedTokenIndices: number[];
}