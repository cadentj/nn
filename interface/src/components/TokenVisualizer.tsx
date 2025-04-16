"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BarChart2, BarChart, Sigma, Hash } from "lucide-react";

interface TokenVisualizerProps {
    text: string;
    tokenData?: {
        count: number;
        tokens: { id: number, text: string }[];
    } | null;
    isLoading?: boolean;
}

export function TokenVisualizer({ text, tokenData, isLoading = false }: TokenVisualizerProps) {
    const [tokenStats, setTokenStats] = useState<{
        uniqueCount: number;
        frequencyMap: Record<string, number>;
        topTokens: { text: string, count: number }[];
        avgIdValue: number;
    } | null>(null);

    useEffect(() => {
        // This effect runs on client-side only
        if (typeof window === 'undefined') return;

        if (tokenData && tokenData.tokens.length > 0) {
            // Calculate statistics from token data
            const frequencyMap: Record<string, number> = {};
            let totalId = 0;

            // Count frequency of each token using for...of instead of forEach
            for (const token of tokenData.tokens) {
                const tokenText = token.text.replace(/Ġ/g, ' ');
                if (frequencyMap[tokenText]) {
                    frequencyMap[tokenText]++;
                } else {
                    frequencyMap[tokenText] = 1;
                }
                totalId += token.id;
            }

            // Get unique token count
            const uniqueCount = Object.keys(frequencyMap).length;

            // Find most frequent tokens
            const topTokens = Object.entries(frequencyMap)
                .map(([text, count]) => ({ text, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            // Calculate average token ID
            const avgIdValue = Math.round(totalId / tokenData.tokens.length);

            setTokenStats({
                uniqueCount,
                frequencyMap,
                topTokens,
                avgIdValue
            });
        } else {
            setTokenStats(null);
        }
    }, [tokenData]);

    const renderLoading = () => (
        <div className="flex items-center justify-center h-32">
            <div className="animate-pulse text-zinc-400 dark:text-zinc-600">
                Analyzing tokens...
            </div>
        </div>
    );

    // Calculate the max frequency for normalized bar heights
    const maxFrequency = tokenStats?.topTokens[0]?.count || 1;

    const renderContent = () => {
        if (!tokenStats) return (
            <div className="text-center text-zinc-500 py-8">
                No token data available
            </div>
        );

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-zinc-800 p-3 rounded-md">
                        <div className="text-xs text-zinc-400 mb-1">Total Tokens</div>
                        <div className="text-xl font-bold flex items-center gap-1">
                            <Hash size={16} className="text-blue-400" />
                            {tokenData?.count || 0}
                        </div>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-md">
                        <div className="text-xs text-zinc-400 mb-1">Unique Tokens</div>
                        <div className="text-xl font-bold flex items-center gap-1">
                            <Hash size={16} className="text-green-400" />
                            {tokenStats.uniqueCount}
                        </div>
                    </div>
                    <div className="bg-zinc-800 p-3 rounded-md">
                        <div className="text-xs text-zinc-400 mb-1">Avg. Token ID</div>
                        <div className="text-xl font-bold flex items-center gap-1">
                            <Sigma size={16} className="text-purple-400" />
                            {tokenStats.avgIdValue}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex items-center mb-2">
                        <BarChart size={16} className="text-zinc-400 mr-2" />
                        <h3 className="text-sm font-medium">Most Frequent Tokens</h3>
                    </div>

                    <div className="space-y-2">
                        {tokenStats.topTokens.map((token, i) => (
                            <div key={`frequent-${token.text}-${i}`} className="flex items-center">
                                <div className="w-28 text-xs truncate" title={token.text}>
                                    "{token.text}"
                                </div>
                                <div className="flex-1 mx-2">
                                    <div
                                        className="h-5 bg-blue-600 rounded-sm"
                                        style={{
                                            width: `${(token.count / maxFrequency) * 100}%`,
                                            opacity: 0.3 + ((token.count / maxFrequency) * 0.7)
                                        }}
                                    />
                                </div>
                                <div className="text-xs text-zinc-400 w-10 text-right">
                                    {token.count}×
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <BarChart2 size={16} className="text-zinc-400 mr-2" />
                            <h3 className="text-sm font-medium">Distribution</h3>
                        </div>
                        <div className="text-xs text-zinc-500">
                            {tokenStats.uniqueCount} unique / {tokenData?.count || 0} total
                        </div>
                    </div>

                    <div className="h-24 flex items-end">
                        {/* Simple visualization of token ID distribution in buckets */}
                        {tokenData && tokenData.tokens.length > 0 && Array.from({ length: 20 }).map((_, i) => {
                            const bucketSize = 1000; // Each bucket represents tokens with IDs in a range of 1000
                            const bucketStart = i * bucketSize;
                            const bucketEnd = (i + 1) * bucketSize;

                            // Count tokens in this ID range
                            const tokensInBucket = tokenData.tokens.filter(
                                token => token.id >= bucketStart && token.id < bucketEnd
                            ).length;

                            // Calculate height as percentage of total tokens
                            const heightPercentage = (tokensInBucket / tokenData.tokens.length) * 100;

                            return (
                                <div
                                    key={`bucket-${bucketStart}-${bucketEnd}`}
                                    className="flex-1 mx-0.5"
                                    title={`IDs ${bucketStart}-${bucketEnd}: ${tokensInBucket} tokens`}
                                >
                                    <div
                                        className="bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-sm w-full"
                                        style={{
                                            height: `${Math.max(heightPercentage * 2, tokensInBucket > 0 ? 5 : 0)}%`,
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="text-xs text-zinc-500 mt-1 flex justify-between">
                        <span>ID: 0</span>
                        <span>ID: 20000</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Card className="border-zinc-800 bg-zinc-900 text-white">
            <CardContent className="p-4">
                {isLoading ? renderLoading() : renderContent()}
            </CardContent>
        </Card>
    );
}
