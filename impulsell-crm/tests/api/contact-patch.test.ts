// Teste bônus do backend (SPEC FR-019 / PLAN §9):
// Cobre PATCH /api/leads/:id/contact — happy path + 404 + persistência.

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { resetLeadsCache } from '@/lib/leads';
import { clearContactUpdates } from '@/lib/contact-store';

beforeEach(() => {
  resetLeadsCache();
  clearContactUpdates();
  vi.resetModules();
});

function makePatchRequest(id: string): NextRequest {
  return new NextRequest(
    `http://localhost:3000/api/leads/${id}/contact`,
    { method: 'PATCH' },
  );
}

describe('PATCH /api/leads/:id/contact', () => {
  it('com ID válido retorna 200 + lead com status=contacted + lastContactAt ISO 8601', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    const res = await PATCH(
      makePatchRequest('lead_001'),
      { params: Promise.resolve({ id: 'lead_001' }) },
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe('lead_001');
    expect(body.status).toBe('contacted');
    expect(body.lastContactAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    );
  });

  it('com ID inexistente retorna 404', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    const res = await PATCH(
      makePatchRequest('nao_existe'),
      { params: Promise.resolve({ id: 'nao_existe' }) },
    );
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it('mutação persiste — GET subsequente mostra status atualizado', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    const { GET } = await import('@/app/api/leads/route');

    await PATCH(
      makePatchRequest('lead_005'),
      { params: Promise.resolve({ id: 'lead_005' }) },
    );

    const res = await GET(
      new NextRequest('http://localhost:3000/api/leads'),
    );
    const body = await res.json();
    const lead005 = body.find((l: { id: string }) => l.id === 'lead_005');
    expect(lead005.status).toBe('contacted');
    expect(lead005.lastContactAt).not.toBeNull();
  });

  it('mutação preserva outros campos (nome, telefone, etc.)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');

    // Pega lead antes da mutação
    const beforeRes = await GET(
      new NextRequest('http://localhost:3000/api/leads?q=Marina'),
    );
    const before = (await beforeRes.json())[0];

    // Aplica mutação
    await PATCH(
      makePatchRequest('lead_001'),
      { params: Promise.resolve({ id: 'lead_001' }) },
    );

    const afterRes = await GET(
      new NextRequest('http://localhost:3000/api/leads?q=Marina'),
    );
    const after = (await afterRes.json())[0];

    expect(after.name).toBe(before.name);
    expect(after.phone).toBe(before.phone);
    expect(after.email).toBe(before.email);
    expect(after.source).toBe(before.source);
    expect(after.campaign).toBe(before.campaign);
    expect(after.interest).toBe(before.interest);
    expect(after.createdAt).toBe(before.createdAt);
    expect(after.status).toBe('contacted');
  });

  it('é idempotente — chamar PATCH 2x atualiza lastContactAt', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');

    const res1 = await PATCH(
      makePatchRequest('lead_001'),
      { params: Promise.resolve({ id: 'lead_001' }) },
    );
    const body1 = await res1.json();

    // Aguardar 5ms para garantir timestamps diferentes
    await new Promise((r) => setTimeout(r, 5));

    const res2 = await PATCH(
      makePatchRequest('lead_001'),
      { params: Promise.resolve({ id: 'lead_001' }) },
    );
    const body2 = await res2.json();

    expect(body1.status).toBe('contacted');
    expect(body2.status).toBe('contacted');
    expect(body2.lastContactAt).not.toBe(body1.lastContactAt);
    expect(new Date(body2.lastContactAt).getTime()).toBeGreaterThan(
      new Date(body1.lastContactAt).getTime(),
    );
  });
});