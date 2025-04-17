import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { LogitLensModes } from "@/components/workbench/modes"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

interface ChartSelectorProps {
    setConfiguringPosition: (position: number | null) => void;
    isChartSelected: (index: number) => boolean;
    handleAddChart: (index: number) => void;
}

export function ChartSelector({ setConfiguringPosition, isChartSelected, handleAddChart }: ChartSelectorProps) {
    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background/50 backdrop-blur-sm"
                onClick={() => setConfiguringPosition(null)}
            ></div>
            {/* Selection Panel */}
            <Card className="relative max-w-md w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Select Visualization</CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => setConfiguringPosition(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                        {LogitLensModes.map((mode, index) => (
                            <Card
                                key={index}
                                className={cn(
                                    "flex flex-col items-center transition-colors border",
                                    isChartSelected(index)
                                        ? "opacity-50 cursor-not-allowed bg-muted/30"
                                        : "cursor-pointer hover:bg-muted/60 hover:border-muted-foreground/50"
                                )}
                                onClick={() => {
                                    if (!isChartSelected(index)) {
                                        handleAddChart(index);
                                    }
                                }}
                            >
                                <CardContent className="p-4 flex flex-col items-center">
                                    <div className="mb-2 text-muted-foreground">
                                        {mode.icon}
                                    </div>
                                    <p className="text-sm font-medium text-center">{mode.name}</p>
                                    <p className="text-xs text-muted-foreground text-center mt-1">{mode.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}