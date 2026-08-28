'use client';

import { Lead } from '@/lib/leads';
import { LeadRow } from './LeadRow';

interface LeadTableProps {
  leads: Lead[];
  onViewDetails: (lead: Lead) => void;
  onContact: (id: string) => void;
  updatingId: string | null;
}

export function LeadTable({ leads, onViewDetails, onContact, updatingId }: LeadTableProps) {
  if (leads.length === 0) {
    return null; // EmptyState handles this
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Nome
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Telefone
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Origem
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Data de Entrada
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {leads.map(lead => (
            <LeadRow
              key={lead.id}
              lead={lead}
              onViewDetails={onViewDetails}
              onContact={onContact}
              isUpdating={updatingId === lead.id}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}