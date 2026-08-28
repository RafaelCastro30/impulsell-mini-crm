'use client';

import { useEffect, useRef } from 'react';
import { Lead } from '@/lib/leads';
import { getSourceLabel, getStatusLabel, getStatusColor } from '@/lib/translations';
import { formatDateTime } from '@/lib/date';

interface LeadDetailModalProps {
  lead: Lead | null;
  onClose: () => void;
}

export function LeadDetailModal({ lead, onClose }: LeadDetailModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (lead && dialogRef.current) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      dialogRef.current.showModal();
      // Focus first focusable element
      const firstFocusable = dialogRef.current.querySelector<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      firstFocusable?.focus();
    } else if (!lead && dialogRef.current?.open) {
      dialogRef.current.close();
      previousFocusRef.current?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lead) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [lead, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!lead) return null;

  const fields = [
    { label: 'Nome', value: lead.name },
    { label: 'Telefone', value: lead.phone },
    { label: 'Email', value: lead.email },
    { label: 'Origem', value: getSourceLabel(lead.source) },
    {
      label: 'Status',
      value: (
        <span className={`inline-flex px-2 py-1 text-sm font-semibold rounded-full ${getStatusColor(lead.status)}`}>
          {getStatusLabel(lead.status)}
        </span>
      ),
    },
    { label: 'Campanha', value: lead.campaign },
    { label: 'Interesse', value: lead.interest },
    { label: 'Data de Entrada', value: formatDateTime(lead.createdAt) },
    { label: 'Último Contato', value: lead.lastContactAt ? formatDateTime(lead.lastContactAt) : 'Nunca contatado' },
  ];

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      className="modal-dialog"
      style={{
        border: 'none',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '480px',
        width: '90vw',
        maxHeight: '90vh',
        padding: 0,
      }}
    >
      <div className="flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-900">Detalhes do Lead</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto bg-gray-50 rounded-b-lg">
          <dl className="space-y-4">
            {fields.map((field, index) => (
              <div key={index} className="flex flex-col gap-1">
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {field.label}
                </dt>
                <dd className="text-sm text-gray-900">
                  {typeof field.value === 'string' ? field.value : field.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white rounded-b-lg">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[-1]"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }}
        onClick={onClose}
      />
    </dialog>
  );
}