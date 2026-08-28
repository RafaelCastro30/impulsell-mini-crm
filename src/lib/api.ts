import { Lead, LeadSource, LeadStatus } from './leads';

const API_BASE = '/api/leads';

export interface FetchLeadsParams {
  q?: string;
  source?: LeadSource | 'all';
  status?: LeadStatus | 'all';
}

export async function fetchLeads(params: FetchLeadsParams = {}): Promise<Lead[]> {
  const searchParams = new URLSearchParams();
  
  if (params.q && params.q.trim()) {
    searchParams.set('q', params.q.trim());
  }
  if (params.source && params.source !== 'all') {
    searchParams.set('source', params.source);
  }
  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status);
  }
  
  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Falha ao carregar leads');
  }
  return res.json() as Promise<Lead[]>;
}

export async function contactLead(id: string): Promise<Lead> {
  const res = await fetch(`${API_BASE}/${id}/contact`, { 
    method: 'PATCH' 
  });
  
  if (res.status === 404) {
    throw new Error('Lead não encontrado');
  }
  if (!res.ok) {
    throw new Error('Falha ao registrar contato');
  }
  
  return res.json() as Promise<Lead>;
}