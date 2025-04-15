"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Hash } from "lucide-react";

import { AutoTokenizer } from '@huggingface/transformers';

interface TokenCounterProps {
    text: string;
    isLoading?: boolean;
}

interface TokenData {
    count: number;
    tokens: { id: number, text: string }[];
}

// Use dynamic import for transformers.js to avoid build errors
let tokenizer: AutoTokenizer | null = null;
let isTokenizerLoading = true;

export function TokenCounter({ text, isLoading = false }: TokenCounterProps) {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load tokenizer once (when component mounts)
    useEffect(() => {
        async function initializeTokenizer() {
            try {
                if (typeof window === 'undefined') return;

                // Only load in browser
                // const { pipeline } = await import('@xenova/transformers');
                // tokenizer = await pipeline('tokenizer', 'Xenova/gpt2');
                tokenizer = await AutoTokenizer.from_pretrained('openai-community/gpt2');
                isTokenizerLoading = false;
            } catch (err) {
                console.error('Error initializing tokenizer:', err);
                setError('Failed to initialize tokenizer');
            }
        }

        if (!tokenizer) {
            initializeTokenizer();
        }
    }, []);

    // Perform tokenization whenever text changes
    useEffect(() => {
        let isMounted = true;

        async function performTokenization() {
            if (!tokenizer) return;

            try {
                setIsLocalLoading(true);
                setError(null);

                if (text.trim()) {
                    // Process in browser only
                    if (typeof window !== 'undefined') {
                        const tokens = await tokenizer.tokenize(text, { add_special_tokens: false });

                        if (!isMounted) return;

                        // Format the tokens for display
                        // const formattedTokens = tokens.input_ids.map((id: number, index: number) => ({
                        //     id,
                        //     text: tokens.tokens[index]
                        // }));

                        setTokenData({
                            count: tokens.length,
                            tokens: tokens
                        });
                    }
                } else {
                    setTokenData({
                        count: 0,
                        tokens: []
                    });
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Error tokenizing text:', err);
                    setError('Failed to tokenize text');
                }
            } finally {
                if (isMounted) {
                    setIsLocalLoading(false);
                }
            }
        }

        // Debounce tokenization to avoid excessive processing
        const debounce = setTimeout(() => {
            performTokenization();
        }, 500);

        return () => {
            isMounted = false;
            clearTimeout(debounce);
        };
    }, [text]);

    const renderLoading = () => (
        <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-zinc-400 dark:text-zinc-600">
                {isTokenizerLoading ? 'Loading tokenizer...' : 'Tokenizing...'}
            </div>
        </div>
    );

    const renderError = () => (
        <div className="text-red-500 p-4">
            {error}
        </div>
    );

    const renderContent = () => {
        if (!tokenData) return null;

        return (
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Hash size={16} className="text-zinc-400" />
                        <span className="text-sm font-medium">Token Count</span>
                    </div>
                    <div className="text-lg font-bold">{tokenData.count}</div>
                </div>

                <Separator className="my-2" />

                <div className="max-h-40 overflow-y-auto custom-scrollbar">
                    <div className="flex flex-wrap gap-1 pt-1">
                        {tokenData.tokens.slice(0, 100).map((token, i) => (
                            <div
                                key={`token-${i}`}
                                className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700"
                                // title={`ID: ${token.id}`}
                            >
                                {token.replace(/Ġ/g, ' ')}
                            </div>
                        ))}
                        {tokenData.tokens.length > 100 && (
                            <div className="text-xs text-zinc-500 px-1.5 py-0.5">
                                + {tokenData.tokens.length - 100} more tokens
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900 text-white">
            <CardContent className="p-4">
                {isLoading || isLocalLoading || isTokenizerLoading
                    ? renderLoading()
                    : error
                        ? renderError()
                        : renderContent()
                }
            </CardContent>
        </Card>
    );
}
