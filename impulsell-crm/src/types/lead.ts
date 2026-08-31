// Tipos compartilhados entre backend e frontend
// Reflete a estrutura de dados/leads.json

export type LeadSource = 'meta_ads' | 'google_ads' | 'referral' | 'organic';
export type LeadStatus = 'new' | 'contacted';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  campaign: string;
  interest: string;
  createdAt: string;            // ISO 8601 (ex: "2026-08-19T10:15:00.000Z")
  lastContactAt: string | null; // ISO 8601 ou null
}

export interface LeadMutation {
  status: LeadStatus;
  lastContactAt: string;        // ISO 8601 gerado no momento do PATCH
}