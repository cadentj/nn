"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Hash } from "lucide-react";

import { AutoTokenizer } from '@huggingface/transformers';

interface TokenCounterProps {
    text: string | { role: string; content: string }[];
    isLoading?: boolean;
}

interface TokenData {
    count: number;
    tokens: { id: number, text: string }[];
}

// Use dynamic import for transformers.js to avoid build errors
let tokenizer: any | null = null;
let isTokenizerLoading = true;

export function TokenCounter({ text, isLoading = false }: TokenCounterProps) {
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [isLocalLoading, setIsLocalLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [highlightedTokens, setHighlightedTokens] = useState<number[]>([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [startToken, setStartToken] = useState<number | null>(null);
    const [endToken, setEndToken] = useState<number | null>(null);

    // Load tokenizer once (when component mounts)
    useEffect(() => {
        async function initializeTokenizer() {
            try {
                if (typeof window === 'undefined') return;

                // Only load in browser
                // const { pipeline } = await import('@xenova/transformers');
                // tokenizer = await pipeline('tokenizer', 'Xenova/gpt2');
                tokenizer = await AutoTokenizer.from_pretrained("HuggingFaceH4/zephyr-7b-beta");
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

                let textToTokenize = '';
                if (Array.isArray(text)) {
                    // If text is an array of message objects, apply chat template
                    textToTokenize = await tokenizer.apply_chat_template(text, { tokenize: false });
                } else {
                    textToTokenize = text;
                }

                if (textToTokenize.trim()) {
                    // Process in browser only
                    if (typeof window !== 'undefined') {
                        const tokens = await tokenizer.tokenize(textToTokenize, { add_special_tokens: false });

                        console.log('tokens', tokens);

                        if (!isMounted) return;

                        setTokenData({
                            count: tokens.length,
                            tokens: tokens.map((token: string, index: number) => ({
                                id: index,
                                text: token
                            }))
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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only handle left mouse button
        setIsSelecting(true);
        const tokenId = getTokenIdFromEvent(e);
        if (tokenId !== null) {
            setStartToken(tokenId);
            setEndToken(tokenId);
            setHighlightedTokens([tokenId]);
        }
    };

    const handleMouseUp = () => {
        setIsSelecting(false);
        setStartToken(null);
        setEndToken(null);
    };

    const getTokenIdFromEvent = (e: React.MouseEvent): number | null => {
        const target = e.target as HTMLElement;
        const tokenElement = target.closest('[data-token-id]');
        if (tokenElement) {
            return parseInt(tokenElement.getAttribute('data-token-id') || '0', 10);
        }
        return null;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isSelecting || startToken === null) return;

        const currentToken = getTokenIdFromEvent(e);
        if (currentToken === null) return;

        setEndToken(currentToken);

        // Calculate the range of tokens to highlight
        const start = Math.min(startToken, currentToken);
        const end = Math.max(startToken, currentToken);
        const newHighlightedTokens = Array.from({ length: end - start + 1 }, (_, i) => start + i);
        setHighlightedTokens(newHighlightedTokens);
    };

    const fixToken = (token: string) => {
        token = token.replace(/Ġ/g, ' ');
        token = token.replace("<0x0A>", '\\n');
        return token;
    }

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
                    <div className="text-lg font-bold">
                        {tokenData.count}
                        {highlightedTokens.length > 0 && (
                            <span className="text-sm text-zinc-400 ml-2">
                                ({highlightedTokens.length} selected)
                            </span>
                        )}
                    </div>
                </div>

                <Separator className="my-2" />

                <div 
                    className="max-h-40 overflow-y-auto custom-scrollbar select-none"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseUp}
                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                >
                    <div className="flex flex-wrap pt-1">
                        {tokenData.tokens.slice(0, 100).map((token, i) => {
                            const fixedText = fixToken(token.text);
                            return (
                                <div
                                    key={`token-${i}`}
                                    data-token-id={i}
                                    className={`text-xs w-fit rounded text-zinc-300 whitespace-pre border border-transparent hover:bg-zinc-800 hover:border-zinc-700 select-none ${
                                        highlightedTokens.includes(i) ? 'bg-zinc-800 border-zinc-700' : ''
                                    }`}
                                    style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
                                >
                                    {fixedText}
                                </div>
                            );
                        })}
                        {tokenData.tokens.length > 100 && (
                            <div className="text-xs text-zinc-500 px-1.5 py-0.5 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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
