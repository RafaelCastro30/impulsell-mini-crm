"use client"

import { LeadRow } from './LeadRow';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { Card } from '@/components/ui/card';
import type { Lead } from '@/types/lead';

interface LeadTableProps {
  leads: Lead[];
  loading: boolean;
  loadError: string | null;
  hasFilters: boolean;
  updatingId: string | null;
  contactError: { id: string; message: string } | null;
  onSelect: (id: string) => void;
  onContact: (id: string) => void;
  onRetryLoad: () => void;
  onRetryContact: (id: string) => void;
  onClearContactError: () => void;
  onClearFilters: () => void;
}

export function LeadTable({
  leads,
  loading,
  loadError,
  hasFilters,
  updatingId,
  contactError,
  onSelect,
  onContact,
  onRetryLoad,
  onRetryContact,
  onClearContactError,
  onClearFilters,
}: LeadTableProps) {
  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} onRetry={onRetryLoad} />;
  if (leads.length === 0)
    return <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-left">
              <th className="px-4 py-3 font-medium tracking-wide text-muted-foreground">
                Lead
              </th>
              <th className="hidden px-4 py-3 font-medium tracking-wide text-muted-foreground sm:table-cell">
                Telefone
              </th>
              <th className="hidden px-4 py-3 font-medium tracking-wide text-muted-foreground md:table-cell">
                Origem
              </th>
              <th className="px-4 py-3 font-medium tracking-wide text-muted-foreground">
                Status
              </th>
              <th className="hidden px-4 py-3 font-medium tracking-wide text-muted-foreground lg:table-cell">
                Recebido em
              </th>
              <th className="px-4 py-3 text-right font-medium tracking-wide text-muted-foreground">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <LeadRow
                key={lead.id}
                lead={lead}
                updating={updatingId === lead.id}
                contactError={contactError}
                onSelect={() => onSelect(lead.id)}
                onContact={() => onContact(lead.id)}
                onRetry={() => onRetryContact(lead.id)}
                onClearError={onClearContactError}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}