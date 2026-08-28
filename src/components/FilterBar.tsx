'use client';

import { useCallback } from 'react';
import { LeadSource, LeadStatus } from '@/lib/leads';

interface FilterBarProps {
  sourceFilter: LeadSource | 'all';
  statusFilter: LeadStatus | 'all';
  onSourceChange: (source: LeadSource | 'all') => void;
  onStatusChange: (status: LeadStatus | 'all') => void;
}

const SOURCE_OPTIONS: { value: LeadSource | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas as origens' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'referral', label: 'Indicação' },
  { value: 'organic', label: 'Orgânico' },
];

const STATUS_OPTIONS: { value: LeadStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os status' },
  { value: 'new', label: 'Novo' },
  { value: 'contacted', label: 'Contatado' },
  { value: 'qualified', label: 'Qualificado' },
  { value: 'lost', label: 'Perdido' },
];

export function FilterBar({ sourceFilter, statusFilter, onSourceChange, onStatusChange }: FilterBarProps) {
  const handleSourceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onSourceChange(e.target.value as LeadSource | 'all');
  }, [onSourceChange]);

  const handleStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onStatusChange(e.target.value as LeadStatus | 'all');
  }, [onStatusChange]);

  return (
    <div className="flex flex-wrap gap-3">
      <div>
        <label htmlFor="source-filter" className="sr-only">
          Filtrar por origem
        </label>
        <select
          id="source-filter"
          value={sourceFilter}
          onChange={handleSourceChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white"
        >
          {SOURCE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="status-filter" className="sr-only">
          Filtrar por status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={handleStatusChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm bg-white"
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}