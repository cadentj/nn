"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { modes } from "@/components/workbench/modes"

interface ToolbarProps {
    selectedModes: number[]
    setSelectedModes: React.Dispatch<React.SetStateAction<number[]>>
    isOpen: boolean
}

export function Toolbar({ selectedModes, setSelectedModes, isOpen }: ToolbarProps) {
    const openHeight = "h-[10vh]" // Adjust as needed

    const toggleMode = (index: number) => {
        setSelectedModes(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index])
    }

    return (
        // Absolute positioning container, flush left/right/bottom, z-index ensures it's above charts
        <div className="absolute bottom-0 left-0 right-0 z-10">

            {/* Panel container: Handles background, border, shadow, and height/opacity transition */}
            <div
                className={cn(
                    "mx-auto transition-all duration-300 ease-in-out transform-gpu", // Base transition classes
                    isOpen
                        ? `bg-background border-t border-border shadow-lg ${openHeight} w-full opacity-100 pointer-events-auto`
                        : "h-0 w-full opacity-0 pointer-events-none" // Collapsed state: zero height, invisible, non-interactive
                )}
            >
                {/* Content container: Padding, fades with panel */}
                {/* NOTE: Content remains in DOM when hidden for smoother transitions */}
                <div className={cn("relative h-full p-4 transition-opacity duration-300 ease-in-out", isOpen ? "opacity-100" : "opacity-0")}>
                    {/* Modes grid */}
                    <div className="flex flex-row h-full gap-4 overflow-x-auto">
                        {modes.map((mode, index) => (
                            <Card
                                key={index}
                                className={cn(
                                    "cursor-pointer shrink-0 grow-0 hover:bg-muted rounded transition-colors flex-1",
                                    selectedModes.includes(index) && "border-primary"
                                )}
                                onClick={() => toggleMode(index)}
                                tabIndex={isOpen ? 0 : -1} // Prevent tabbing when hidden
                            >
                                <CardHeader className="p-4 flex-row items-center gap-2">
                                    {mode.icon}
                                    <div>
                                        <CardTitle className="text-sm">{mode.name}</CardTitle>
                                        <CardDescription className="text-xs">{mode.description}</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
