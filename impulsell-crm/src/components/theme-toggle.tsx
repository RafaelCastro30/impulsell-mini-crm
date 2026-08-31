"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"

import { useTheme, type Theme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const LABELS: Record<Theme, string> = {
  dark: "Escuro",
  light: "Claro",
  system: "Sistema",
}

const ICONS: Record<Theme, React.ComponentType<{ className?: string }>> = {
  dark: Moon,
  light: Sun,
  system: Monitor,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const Icon = ICONS[theme]

  return (
    <TooltipProvider delay={300}>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={(props) => (
              <DropdownMenuTrigger
                {...props}
                render={
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="Alternar tema"
                  />
                }
              />
            )}
          >
            <Icon className="size-4" />
            <span className="sr-only">Alternar tema</span>
          </TooltipTrigger>
          <TooltipContent>Tema: {LABELS[theme]}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent className="w-44">
          <DropdownMenuLabel>Aparência</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={theme}
            onValueChange={(v) => setTheme(v as Theme)}
          >
            <DropdownMenuRadioItem value="light">
              <Sun className="size-4" /> Claro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon className="size-4" /> Escuro
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor className="size-4" /> Sistema
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled className="text-xs text-muted-foreground">
            Padrão: escuro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}