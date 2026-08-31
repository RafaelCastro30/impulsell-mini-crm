// Teste obrigatório do backend (SPEC FR-018 / PLAN §9):
// Cobre GET /api/leads com busca + filtros combinados (caso mais complexo).
//
// Estes testes chamam o handler Next.js direto (sem servidor HTTP),
// seguindo o padrão recomendado para Route Handlers em ambiente Node.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetLeadsCache } from '@/lib/leads';
import { clearContactUpdates } from '@/lib/contact-store';

beforeEach(() => {
  resetLeadsCache();
  clearContactUpdates();
  vi.resetModules();
});

function makeRequest(url: string): NextRequest {
  return new NextRequest(url);
}

describe('GET /api/leads', () => {
  it('sem filtros retorna todos os 12 leads', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(makeRequest('http://localhost:3000/api/leads'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(12);
  });

  it('q=MARINA retorna apenas Marina Costa (case-insensitive)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(makeRequest('http://localhost:3000/api/leads?q=MARINA'));
    const body = await res.json();
    expect(body.length).toBe(1);
    expect(body[0].name).toBe('Marina Costa');
  });

  it('q com substring de telefone funciona', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(makeRequest('http://localhost:3000/api/leads?q=11'));
    const body = await res.json();
    // Todos os leads têm DDD 11 (São Paulo)
    expect(body.length).toBeGreaterThan(0);
    for (const lead of body) {
      expect(lead.phone).toContain('11');
    }
  });

  it('source=meta_ads retorna só leads com essa origem', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(makeRequest('http://localhost:3000/api/leads?source=meta_ads'));
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    for (const lead of body) {
      expect(lead.source).toBe('meta_ads');
    }
  });

  it('status=new retorna só leads novos', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(makeRequest('http://localhost:3000/api/leads?status=new'));
    const body = await res.json();
    for (const lead of body) {
      expect(lead.status).toBe('new');
    }
  });

  it('q + source combinados aplicam AND', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(
      makeRequest('http://localhost:3000/api/leads?q=joao&source=google_ads'),
    );
    const body = await res.json();
    expect(body.length).toBeGreaterThan(0);
    const stripAccents = (s: string) =>
      s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    for (const lead of body) {
      expect(lead.source).toBe('google_ads');
      const matches = stripAccents(lead.name).includes('joao');
      expect(matches).toBe(true);
    }
  });

  it('source=all e status=all equivalem a nenhum filtro', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(
      makeRequest('http://localhost:3000/api/leads?source=all&status=all'),
    );
    const body = await res.json();
    expect(body.length).toBe(12);
  });

  it('filtro inválido em source cai para "all" (sem erro)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res = await GET(
      makeRequest('http://localhost:3000/api/leads?source=invalido'),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.length).toBe(12);
  });

  it('busca ignora acentos (joão vs joao)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const res1 = await GET(
      makeRequest('http://localhost:3000/api/leads?q=joao'),
    );
    const res2 = await GET(
      makeRequest(`http://localhost:3000/api/leads?q=jo${'%C3%A3'}o`),
    );
    const body1 = await res1.json();
    const body2 = await res2.json();
    expect(body1.length).toBe(body2.length);
    expect(body1.length).toBeGreaterThan(0);
  });
});