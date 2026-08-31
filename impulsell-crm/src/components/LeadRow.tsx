"use client"

import * as React from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SOURCE_ICONS } from '@/components/source-icons';
import { SOURCE_LABELS, STATUS_LABELS } from '@/lib/translations';
import { formatDateTime } from '@/lib/date';
import { cn } from '@/lib/utils';
import type { Lead } from '@/types/lead';

interface LeadRowProps {
  lead: Lead;
  updating: boolean;
  contactError: { id: string; message: string } | null;
  onSelect: () => void;
  onContact: () => void;
  onRetry: () => void;
  onClearError: () => void;
}

const STATUS_BADGE: Record<Lead['status'], string> = {
  new: 'bg-blue-500/15 text-blue-700 ring-1 ring-inset ring-blue-500/20 dark:text-blue-300',
  contacted: 'bg-emerald-500/15 text-emerald-700 ring-1 ring-inset ring-emerald-500/20 dark:text-emerald-300',
};

export function LeadRow({
  lead,
  updating,
  contactError,
  onSelect,
  onContact,
  onRetry,
  onClearError,
}: LeadRowProps) {
  const hasError = contactError?.id === lead.id;
  const SourceIcon = SOURCE_ICONS[lead.source];
  const initials = lead.name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <>
      <tr
        className={cn(
          'group cursor-pointer border-b border-border/40 transition-colors',
          'hover:bg-muted/40',
          hasError && 'bg-destructive/5'
        )}
        onClick={(e) => {
          // Não disparar quando o clique vem dos botões de ação.
          const target = e.target as HTMLElement;
          if (target.closest('button')) return;
          onSelect();
        }}
      >
        {/* Nome + Avatar */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-brand text-xs font-semibold text-white ring-1 ring-foreground/10">
              {initials}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                {lead.name}
              </span>
              <span className="text-xs text-muted-foreground sm:hidden">
                {lead.phone}
              </span>
            </div>
          </div>
        </td>

        {/* Telefone */}
        <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
          {lead.phone}
        </td>

        {/* Origem */}
        <td className="hidden px-4 py-3 md:table-cell">
          <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
            <SourceIcon className="size-3.5" aria-hidden="true" />
            {SOURCE_LABELS[lead.source]}
          </div>
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <Badge className={STATUS_BADGE[lead.status]} variant="secondary">
            {STATUS_LABELS[lead.status]}
          </Badge>
        </td>

        {/* Data */}
        <td className="hidden px-4 py-3 text-muted-foreground tabular-nums lg:table-cell">
          {formatDateTime(lead.createdAt)}
        </td>

        {/* Ações */}
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onSelect}
              className="hidden sm:inline-flex"
              aria-label={`Ver detalhes de ${lead.name}`}
            >
              Detalhes
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onContact();
              }}
              disabled={updating || lead.status === 'contacted'}
              className="min-w-[140px]"
              aria-label={`Registrar contato com ${lead.name}`}
            >
              {updating ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Registrando...
                </>
              ) : lead.status === 'contacted' ? (
                'Já contatado'
              ) : (
                'Registrar contato'
              )}
            </Button>
            <ChevronDown
              className="size-4 -rotate-90 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
        </td>
      </tr>

      {hasError && (
        <tr className="border-b border-border/40 bg-destructive/5">
          <td colSpan={6} className="px-4 py-2">
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertDescription className="flex items-center justify-between gap-2 text-xs">
                <span>{contactError!.message}</span>
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
          </td>
        </tr>
      )}
    </>
  );
}