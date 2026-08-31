// Tradução dos enums técnicos para a interface da atendente.
// SPEC US-001: traduzir `meta_ads` -> "Meta Ads", `new` -> "Novo", etc.

import type { LeadSource, LeadStatus } from '@/types/lead';

export const SOURCE_LABELS: Record<LeadSource, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  referral: 'Indicação',
  organic: 'Orgânico',
};

export const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
};

// Cores Tailwind para badges de status (background + text).
export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  contacted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};