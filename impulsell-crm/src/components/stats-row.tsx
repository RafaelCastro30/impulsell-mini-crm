"use client"

import * as React from "react"
import {
  ArrowUpRight,
  CheckCircle2,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { Lead } from "@/types/lead"

interface StatsRowProps {
  leads: Lead[]
  loading: boolean
  hasFilters: boolean
}

interface StatCardProps {
  label: string
  value: number | string
  hint?: string
  icon: LucideIcon
  trend?: { value: string; positive?: boolean }
  variant?: "default" | "primary" | "success" | "warning"
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  variant = "default",
}: StatCardProps) {
  const isPrimary = variant === "primary"
  const isSuccess = variant === "success"
  const isWarning = variant === "warning"

  return (
    <Card
      className={cn(
        "relative overflow-hidden p-5 transition-all hover:shadow-md",
        isPrimary &&
          "ring-2 ring-brand/30 dark:bg-gradient-brand/5 dark:ring-brand/40"
      )}
    >
      {/* Subtle background gradient */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 opacity-30",
          isPrimary &&
            "bg-[radial-gradient(circle_at_top_right,var(--brand)_0%,transparent_60%)]"
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="font-heading text-3xl font-semibold tracking-tight tabular-nums">
              {value}
            </p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                  trend.positive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                )}
              >
                <ArrowUpRight
                  className={cn(
                    "size-3",
                    !trend.positive && "rotate-180"
                  )}
                />
                {trend.value}
              </span>
            )}
          </div>
          {hint && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
        </div>

        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1 ring-foreground/5",
            isPrimary &&
              "bg-gradient-brand text-white ring-transparent",
            isSuccess &&
              "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
            isWarning &&
              "bg-amber-500/15 text-amber-600 dark:text-amber-400",
            !isPrimary &&
              !isSuccess &&
              !isWarning &&
              "bg-muted text-muted-foreground"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  )
}

function StatSkeleton() {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="size-9 rounded-lg" />
      </div>
    </Card>
  )
}

export function StatsRow({ leads, loading, hasFilters }: StatsRowProps) {
  const total = leads.length
  const contacted = leads.filter((l) => l.status === "contacted").length
  const newLeads = total - contacted
  const conversion =
    total === 0 ? 0 : Math.round((contacted / total) * 100)

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        label={hasFilters ? "Visíveis" : "Total de leads"}
        value={total}
        hint={hasFilters ? "Após filtros aplicados" : "Na sua carteira"}
        icon={Users}
        variant="primary"
      />
      <StatCard
        label="Novos"
        value={newLeads}
        hint="Aguardando primeiro contato"
        icon={Phone}
        variant="warning"
      />
      <StatCard
        label="Contatados"
        value={contacted}
        hint="Atendimento iniciado"
        icon={CheckCircle2}
        variant="success"
      />
      <StatCard
        label="Conversão"
        value={`${conversion}%`}
        hint="Leads contatados"
        icon={ArrowUpRight}
        trend={conversion > 0 ? { value: `${conversion}%`, positive: true } : undefined}
      />
    </div>
  )
}