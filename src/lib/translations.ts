import { LeadSource, LeadStatus } from './leads';

export const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  referral: 'Indicação',
  organic: 'Orgânico',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  qualified: 'Qualificado',
  lost: 'Perdido',
};

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-green-100 text-green-800',
  qualified: 'bg-purple-100 text-purple-800',
  lost: 'bg-red-100 text-red-800',
};

export function getSourceLabel(source: LeadSource): string {
  return SOURCE_LABELS[source] ?? source;
}

export function getStatusLabel(status: LeadStatus): string {
  return STATUS_LABELS[status] ?? status;
}

export function getStatusColor(status: LeadStatus): string {
  return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-800';
}