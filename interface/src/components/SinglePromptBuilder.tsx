"use client";

import { Textarea } from "@/components/ui/textarea";
import { TokenCounter } from "@/components/TokenCounter";

interface SinglePromptBuilderProps {
    prompt: string;
    onPromptChange: (prompt: string) => void;
    isExpanded: boolean;
}

export function SinglePromptBuilder({
    prompt,
    onPromptChange,
    isExpanded,
}: SinglePromptBuilderProps) {
    return (
        <div className="flex flex-col h-full">
            {isExpanded ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-6">
                        <div>
                            <label className="text-sm text-zinc-400">Prompt</label>
                            <Textarea
                                value={prompt}
                                onChange={(e) => onPromptChange(e.target.value)}
                                className="mt-1 bg-zinc-900 border-zinc-700 text-white h-48 resize-none"
                                placeholder="Enter your prompt here..."
                            />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <TokenCounter text={!isExpanded ? prompt : null} />
                </div>
            )}
        </div>
    );
} 