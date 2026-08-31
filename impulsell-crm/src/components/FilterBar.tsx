"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/translations"
import type { LeadSource, LeadStatus } from "@/types/lead"

interface FilterBarProps {
  sourceFilter: LeadSource | 'all';
  statusFilter: LeadStatus | 'all';
  onSourceChange: (value: LeadSource | 'all') => void;
  onStatusChange: (value: LeadStatus | 'all') => void;
}

const SOURCES: LeadSource[] = ['meta_ads', 'google_ads', 'referral', 'organic'];
const STATUSES: LeadStatus[] = ['new', 'contacted'];

export function FilterBar({
  sourceFilter,
  statusFilter,
  onSourceChange,
  onStatusChange,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={sourceFilter}
        onValueChange={(v) => onSourceChange(v as LeadSource | 'all')}
      >
        <SelectTrigger className="h-9 w-[160px]" aria-label="Filtrar por origem">
          <SelectValue placeholder="Origem" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas origens</SelectItem>
          {SOURCES.map((s) => (
            <SelectItem key={s} value={s}>
              {SOURCE_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={statusFilter}
        onValueChange={(v) => onStatusChange(v as LeadStatus | 'all')}
      >
        <SelectTrigger className="h-9 w-[160px]" aria-label="Filtrar por status">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos status</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}