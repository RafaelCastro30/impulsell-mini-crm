'use client';

import { Lead } from '@/lib/leads';
import { getSourceLabel, getStatusLabel, getStatusColor } from '@/lib/translations';
import { formatDateTime } from '@/lib/date';

interface LeadRowProps {
  lead: Lead;
  onViewDetails: (lead: Lead) => void;
  onContact: (id: string) => void;
  isUpdating: boolean;
}

export function LeadRow({ lead, onViewDetails, onContact, isUpdating }: LeadRowProps) {
  const handleContact = () => {
    onContact(lead.id);
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
        {lead.name}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {lead.phone}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {getSourceLabel(lead.source)}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
          {getStatusLabel(lead.status)}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {formatDateTime(lead.createdAt)}
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(lead)}
            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          >
            Ver detalhes
          </button>
          <button
            onClick={handleContact}
            disabled={isUpdating || lead.status === 'contacted'}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              isUpdating
                ? 'bg-gray-200 text-gray-500 cursor-wait'
                : lead.status === 'contacted'
                ? 'bg-green-100 text-green-700 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isUpdating ? (
              <span className="flex items-center gap-1">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Atualizando...
              </span>
            ) : lead.status === 'contacted' ? (
              'Já contatado'
            ) : (
              'Registrar contato'
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}