// GET /api/leads
// Retorna a lista de leads aplicando busca (q), filtro de origem (source)
// e filtro de status (status) — todos opcionais, combinados com AND.
//
// SPEC FR-001 a FR-006 / CONSTITUTION III: backend é a fonte da verdade
// da busca/filtros; o frontend apenas dispara refetch.

import { type NextRequest, NextResponse } from 'next/server';
import { getLeads } from '@/lib/leads';
import { applyContactMutations } from '@/lib/contact-store';
import type { LeadSource, LeadStatus } from '@/types/lead';

const VALID_SOURCES: ReadonlyArray<LeadSource | 'all'> = [
  'meta_ads',
  'google_ads',
  'referral',
  'organic',
  'all',
];

const VALID_STATUSES: ReadonlyArray<LeadStatus | 'all'> = [
  'new',
  'contacted',
  'all',
];

/**
 * Normaliza string para comparação case-insensitive e ignorando acentos.
 * "Marina" e "marina" retornam o mesmo; "São" e "sao" retornam o mesmo.
 */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const sp = request.nextUrl.searchParams;
    const rawQ = sp.get('q') ?? '';
    const rawSource = sp.get('source') ?? 'all';
    const rawStatus = sp.get('status') ?? 'all';

    const q = rawQ.trim();
    const source: LeadSource | 'all' = (VALID_SOURCES as readonly string[]).includes(
      rawSource,
    )
      ? (rawSource as LeadSource | 'all')
      : 'all';
    const status: LeadStatus | 'all' = (VALID_STATUSES as readonly string[]).includes(
      rawStatus,
    )
      ? (rawStatus as LeadStatus | 'all')
      : 'all';

    const base = await getLeads();
    let result = applyContactMutations(base);

    if (q !== '') {
      const needle = normalize(q);
      result = result.filter((lead) => {
        if (normalize(lead.name).includes(needle)) return true;
        if (lead.phone.includes(q)) return true; // telefone: substring exata (DDI/DDD)
        return false;
      });
    }
    if (source !== 'all') {
      result = result.filter((lead) => lead.source === source);
    }
    if (status !== 'all') {
      result = result.filter((lead) => lead.status === status);
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}