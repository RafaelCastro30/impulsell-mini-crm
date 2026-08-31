"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <span className="relative flex size-8 items-center justify-center rounded-lg bg-gradient-brand shadow-sm ring-1 ring-foreground/10">
            <Sparkles className="size-4 text-white" aria-hidden="true" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">
              Impulsell
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Mini CRM
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="hidden text-[10px] font-medium uppercase tracking-wider sm:inline-flex"
          >
            v1.0
          </Badge>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}