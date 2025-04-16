import * as React from "react"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Dispatch, SetStateAction, useState } from "react";

interface ModelSelectorProps {
    name: string;
    setModelType: Dispatch<SetStateAction<"base" | "chat">>;
}


const BASE_MODELS = [
    "EleutherAI/gpt-j-6b",
    "meta-llama/Meta-Llama-3.1-8B",
]

const CHAT_MODELS = [
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
]

export function ModelSelector({ name, setModelType }: ModelSelectorProps) {

    const [modelName, setModelName] = useState(name);

    const handleModelTypeChange = (value: string) => {
        setModelName(value);
        if (BASE_MODELS.includes(value)) {
            setModelType("base");
        } else if (CHAT_MODELS.includes(value)) {
            setModelType("chat");
        }
    }

    return (
        <Select value={modelName} onValueChange={handleModelTypeChange}>
            <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Base Models</SelectLabel>
                    {BASE_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Chat Models</SelectLabel>
                    {CHAT_MODELS.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
