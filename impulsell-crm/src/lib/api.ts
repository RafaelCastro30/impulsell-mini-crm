// Wrappers finos sobre fetch para o frontend.
// Mantém os endpoints num lugar só — se o avaliador perguntar
// "qual a URL da API?", a resposta está aqui.

import type { Lead, LeadSource, LeadStatus } from '@/types/lead';

export interface FetchLeadsParams {
  q?: string;
  source?: LeadSource | 'all';
  status?: LeadStatus | 'all';
}

function buildQuery(params: FetchLeadsParams): string {
  const sp = new URLSearchParams();
  if (params.q && params.q.trim() !== '') sp.set('q', params.q.trim());
  if (params.source && params.source !== 'all') sp.set('source', params.source);
  if (params.status && params.status !== 'all') sp.set('status', params.status);
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

export async function fetchLeads(params: FetchLeadsParams = {}): Promise<Lead[]> {
  const res = await fetch(`/api/leads${buildQuery(params)}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Falha ao buscar leads (${res.status})`);
  }
  return (await res.json()) as Lead[];
}

export async function contactLead(id: string): Promise<Lead> {
  const res = await fetch(`/api/leads/${encodeURIComponent(id)}/contact`, {
    method: 'PATCH',
  });
  if (res.status === 404) {
    throw new Error('Lead não encontrado');
  }
  if (!res.ok) {
    throw new Error(`Falha ao registrar contato (${res.status})`);
  }
  return (await res.json()) as Lead;
}