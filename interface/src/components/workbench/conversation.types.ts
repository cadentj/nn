export interface Message {
    role: "user" | "assistant";
    content: string;
}

export interface Conversation {
    id: string;
    type: "chat" | "base";
    model: string;
    title: string;
    systemMessage: string;
    messages: Message[];
    prompt: string;
    isExpanded: boolean;
    lastUpdated: Date;
    isNew?: boolean;
    selectedTokenIndices: number[];
}

interface ModelResults {
    model_name: string;
    layer_results: LayerResults[];
}

interface LayerResults {
    layer_idx: number;
    pred_probs: number[];
    preds: string[];
}

export interface LogitLensResponse {
    model_results: ModelResults[];
}