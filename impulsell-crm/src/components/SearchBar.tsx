"use client"

import { Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Buscar por nome ou telefone...",
  className,
}: SearchBarProps) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-9 pr-9"
        aria-label="Buscar lead por nome ou telefone"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-1.5 -translate-y-1/2"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
        >
          <X className="size-3.5" />
        </Button>
      )}
    </div>
  )
}