"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Code2,
  Layers,
  FileText,
  Key,
  Settings,
  ChevronRight,
  ChevronDown,
  Plus,
  MessagesSquare,
  Mic,
  Users,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const mainNavItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", href: "/" },
    { icon: <Code2 size={20} />, label: "Workbench", href: "/workbench", active: true },
    { icon: <Layers size={20} />, label: "Batches", href: "/batches" },
  ];

  const secondaryNavItems = [
    { icon: <FileText size={20} />, label: "Documentation", href: "/docs" },
    { icon: <Key size={20} />, label: "API keys", href: "/api-keys" },
    { icon: <Settings size={20} />, label: "Settings", href: "/settings" },
  ];

  const playgroundItems = [
    { icon: <Zap size={20} />, label: "Playground", href: "/playground" },
    { icon: <MessagesSquare size={20} />, label: "Prompts", href: "/prompts", active: true },
    { icon: <Zap size={20} />, label: "Realtime", href: "/realtime" },
    { icon: <Users size={20} />, label: "Assistants", href: "/assistants" },
    { icon: <Mic size={20} />, label: "TTS", href: "/tts" },
  ];

  return (
    <div className={`h-screen bg-zinc-900 text-white border-r border-zinc-800 flex flex-col ${collapsed ? "w-16" : "w-56"} transition-all duration-200`}>
      <div className="p-4 flex justify-between items-center">
        {!collapsed && <span className="text-xl font-bold">ANTHROPIC</span>}
        {collapsed && <span className="text-xl font-bold">A</span>}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="hover:bg-zinc-800"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <div className="px-3 py-2">
          {mainNavItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                item.active ? "bg-zinc-800" : "hover:bg-zinc-800"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <Separator className="my-2 bg-zinc-800" />

        <div className="px-3 py-2">
          {!collapsed && <h3 className="text-xs text-zinc-500 font-medium px-3 py-2">PLAYGROUND</h3>}
          {playgroundItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                item.active ? "bg-zinc-800" : "hover:bg-zinc-800"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="mt-auto px-3 py-2">
          {secondaryNavItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors"
            >
              {item.icon}
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center">
            CJ
          </div>
          {!collapsed && (
            <div>
              <div className="text-sm font-medium">Caden Juang</div>
              <div className="text-xs text-zinc-500">MATS Program</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
