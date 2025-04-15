"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessagesSquare, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-100 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 px-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">AI Playground</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            An enhanced interface for experimenting with prompts and tokens
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 px-8">
        <div className="container mx-auto max-w-3xl">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessagesSquare className="h-5 w-5 text-blue-500" />
                OpenAI Style Playground
              </CardTitle>
              <CardDescription>
                A modern playground interface with tokenization and analysis tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 overflow-hidden">
                <div className="text-center text-zinc-500 dark:text-zinc-400">Playground Preview</div>
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/playground" className="w-full">
                <Button variant="default" className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  Open Playground
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="py-6 px-8 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="container mx-auto text-center text-sm text-zinc-500 dark:text-zinc-400">
          <p>Built with Next.js, Tailwind CSS, and transformers.js</p>
        </div>
      </footer>
    </div>
  );
}
