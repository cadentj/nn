"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Hash } from "lucide-react";

import { AutoTokenizer } from '@huggingface/transformers';

interface TokenCounterProps {
    text: string | { role: string; content: string }[] | null;
    isLoading?: boolean;
    onTokenSelection?: (indices: number[]) => void;
}

interface TokenData {
    count: number;
    tokens: { id: number, text: string }[];
}

// Use dynamic import for transformers.js to avoid build errors
let tokenizer: AutoTokenizer | null = null;
let isTokenizerLoading = true;

export function TokenCounter({ text, isLoading = false, onTokenSelection }: TokenCounterProps) {
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
                tokenizer = await AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct");
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
        if (onTokenSelection) {
            onTokenSelection(highlightedTokens.length > 0 ? highlightedTokens : [-1]);
        }
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
        token = token.replace("Ġ", ' ');
        token = token.replace("<0x0A>", '\\n');
        token = token.replace("Ċ", '\\n');
        return token;
    }

    const renderLoading = () => (
        <div className="flex items-center justify-center h-32">
            <div className="animate-pulse ">
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
            <>
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
                        {tokenData.tokens.map((token, i) => {
                            const fixedText = fixToken(token.text);
                            const isHighlighted = highlightedTokens.includes(i);
                            const highlightStyle = 'bg-primary/50 border-primary/50';
                            const hoverStyle = 'hover:bg-primary/50 hover:border-primary/50';
                            const key = `token-${i}`;
                            const commonProps = {
                                'data-token-id': i,
                                style: { userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties,
                            };

                            if (fixedText === '\\n') {
                                // Render a full-width div for newline tokens, displaying '\\n' and forcing a break
                                return (
                                    <div
                                        key={key}
                                        {...commonProps}
                                        // Use w-full for line break, adjust styles to match other tokens
                                        className={`text-xs w-full rounded whitespace-pre border select-none ${isHighlighted ? highlightStyle : 'border-transparent'
                                            } ${hoverStyle}`}
                                        // Ensure flex-basis is 100% to force wrap
                                        style={{ ...commonProps.style, flexBasis: '100%' }}
                                    >
                                        {fixedText}
                                    </div>
                                );
                            } else {
                                return (
                                    <div
                                        key={key}
                                        {...commonProps}
                                        className={`text-xs w-fit rounded whitespace-pre border select-none ${isHighlighted ? highlightStyle : 'border-transparent'
                                            } ${hoverStyle}`}
                                    >
                                        {fixedText}
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                <Separator className="my-2" />

                <div className="flex items-center justify-between">
                    <span className="text-xs ">Token Count</span>
                    <div className="text-sm ">
                        {tokenData.count}
                        {highlightedTokens.length > 0 && (
                            <span className="text-xs  ml-1">
                                ({highlightedTokens.length} selected)
                            </span>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className=" p-4">
            {isLoading || isLocalLoading || isTokenizerLoading
                ? renderLoading()
                : error
                    ? renderError()
                    : renderContent()
            }
        </div>
    );
}
