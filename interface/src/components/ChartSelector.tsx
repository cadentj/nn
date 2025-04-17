import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { modes } from "@/components/workbench/modes"

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
                className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                onClick={() => setConfiguringPosition(null)}
            ></div>
            {/* Selection Panel */}
            <div className="relative bg-card p-6 rounded-lg shadow-lg max-w-md w-full border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-medium">Select Visualization</h2>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto"
                        onClick={() => setConfiguringPosition(null)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {modes.map((mode, index) => (
                        <div
                            key={index}
                            className={cn(
                                "flex flex-col items-center p-4 border rounded-lg transition-colors",
                                isChartSelected(index)
                                    ? "opacity-50 cursor-not-allowed bg-muted/30"
                                    : "cursor-pointer hover:bg-muted/50"
                            )}
                            onClick={() => {
                                if (!isChartSelected(index)) {
                                    handleAddChart(index);
                                }
                            }}
                        >
                            <div className="mb-2 text-muted-foreground">
                                {mode.icon}
                            </div>
                            <p className="text-sm font-medium text-center">{mode.name}</p>
                            <p className="text-xs text-muted-foreground text-center mt-1">{mode.description}</p>
                            {isChartSelected(index) && (
                                <p className="text-xs text-muted-foreground mt-1">Selected</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}