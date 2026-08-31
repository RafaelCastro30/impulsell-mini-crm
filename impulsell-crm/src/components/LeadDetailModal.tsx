"use client"

import * as React from "react"
import {
  AlertCircle,
  Building2,
  Calendar,
  Globe,
  IdCard,
  Loader2,
  Mail,
  Megaphone,
  Phone,
  PhoneCall,
  Tag,
  TrendingUp,
} from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SOURCE_ICONS, STATUS_ICONS } from "@/components/source-icons"
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/translations"
import { formatContactDate, formatDateTime } from "@/lib/date"
import { cn } from "@/lib/utils"
import type { Lead } from "@/types/lead"

interface LeadDetailModalProps {
  lead: Lead | null
  open: boolean
  updating: boolean
  contactError: string | null
  onOpenChange: (open: boolean) => void
  onContact: () => void
  onRetry: () => void
  onClearError: () => void
}

const STATUS_BADGE: Record<Lead["status"], string> = {
  new: "bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/20 dark:text-blue-300",
  contacted:
    "bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300",
}

interface FieldProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  href?: string
  mono?: boolean
}

function Field({ icon: Icon, label, value, href, mono }: FieldProps) {
  const content = (
    <div className="group relative flex items-start gap-3 rounded-lg border border-border/40 bg-card/50 p-3 transition-colors hover:border-border hover:bg-card">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground ring-1 ring-foreground/5">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "text-sm font-medium text-foreground",
            mono && "font-mono"
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
  if (href) {
    return (
      <a href={href} className="block" target="_blank" rel="noreferrer">
        {content}
      </a>
    )
  }
  return content
}

export function LeadDetailModal({
  lead,
  open,
  updating,
  contactError,
  onOpenChange,
  onContact,
  onRetry,
  onClearError,
}: LeadDetailModalProps) {
  if (!lead) return null

  const contacted = lead.status === "contacted"
  const StatusIcon = STATUS_ICONS[lead.status]
  const SourceIcon = SOURCE_ICONS[lead.source]
  const initials = lead.name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-5 p-0">
        {/* Header com gradiente e avatar */}
        <DialogHeader className="relative gap-0 px-6 pt-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand/15 via-brand/5 to-transparent"
          />
          <div className="relative flex items-start gap-4">
            <Avatar className="size-14 ring-2 ring-background shadow-md">
              <AvatarFallback className="bg-gradient-brand text-base font-semibold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 pt-1">
              <DialogTitle className="flex flex-wrap items-center gap-2 text-lg">
                {lead.name}
                <Badge
                  className={cn(
                    STATUS_BADGE[lead.status],
                    "gap-1 px-2 py-0.5 text-xs"
                  )}
                  variant="secondary"
                >
                  <StatusIcon className="size-3" />
                  {STATUS_LABELS[lead.status]}
                </Badge>
              </DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3" />
                  Recebido em {formatDateTime(lead.createdAt)}
                </span>
                <span className="text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  <SourceIcon className="size-3" />
                  {SOURCE_LABELS[lead.source]}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Campos */}
        <div className="grid grid-cols-1 gap-3 px-6 sm:grid-cols-2">
          <Field
            icon={IdCard}
            label="ID do lead"
            value={lead.id}
            mono
          />
          <Field
            icon={Phone}
            label="Telefone"
            value={lead.phone}
            href={`tel:${lead.phone.replace(/\s/g, "")}`}
          />
          <Field
            icon={Mail}
            label="E-mail"
            value={lead.email}
            href={`mailto:${lead.email}`}
          />
          <Field
            icon={SourceIcon === Megaphone ? Megaphone : Globe}
            label="Origem"
            value={SOURCE_LABELS[lead.source]}
          />
          <Field
            icon={Tag}
            label="Campanha"
            value={lead.campaign}
          />
          <Field
            icon={Building2}
            label="Interesse"
            value={lead.interest}
          />
          <Field
            icon={Calendar}
            label="Data de entrada"
            value={formatDateTime(lead.createdAt)}
          />
          <Field
            icon={contacted ? PhoneCall : TrendingUp}
            label="Último contato"
            value={formatContactDate(lead.lastContactAt)}
          />
        </div>

        {contactError && (
          <div className="px-6">
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="flex items-center justify-between gap-2 text-xs">
                <span>{contactError}</span>
                <div className="flex gap-1">
                  <Button variant="outline" size="xs" onClick={onRetry}>
                    Tentar
                  </Button>
                  <Button variant="ghost" size="xs" onClick={onClearError}>
                    Dispensar
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <DialogFooter className="px-6 pb-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button
            onClick={onContact}
            disabled={updating || contacted}
            className="min-w-[160px]"
          >
            {updating ? (
              <>
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                Registrando...
              </>
            ) : contacted ? (
              <>
                <PhoneCall className="mr-1.5 size-3.5" />
                Já contatado
              </>
            ) : (
              <>
                <PhoneCall className="mr-1.5 size-3.5" />
                Registrar contato
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}