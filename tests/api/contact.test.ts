import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLeads, resetLeadsCache } from '@/lib/leads';
import { contactUpdates, applyContactMutations, recordContact, clearContactUpdates } from '@/lib/contact-store';

// Global cleanup before each test
beforeEach(() => {
  resetLeadsCache();
  clearContactUpdates();
  vi.resetModules();
});

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: (data: unknown, init?: { status?: number }) => ({
      status: init?.status || 200,
      json: async () => data,
      ok: (init?.status || 200) < 400,
    }),
  },
  NextRequest: vi.fn(),
}));

describe('PATCH /api/leads/:id/contact', () => {
  it('should update status to contacted and set lastContactAt with valid ISO 8601', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    
    const request = new Request('http://localhost:3000/api/leads/lead_001/contact', {
      method: 'PATCH',
    }) as any;
    
    const params = Promise.resolve({ id: 'lead_001' });
    const response = await PATCH(request, { params });
    
    expect(response.status).toBe(200);
    const lead = await response.json();
    expect(lead.id).toBe('lead_001');
    expect(lead.status).toBe('contacted');
    expect(lead.lastContactAt).toBeDefined();
    expect(lead.lastContactAt).not.toBeNull();
    
    // Validate ISO 8601 format
    const date = new Date(lead.lastContactAt);
    expect(date.toISOString()).toBe(lead.lastContactAt);
    expect(date.getTime()).not.toBeNaN();
  });

  it('should return 404 for non-existent ID', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    
    const request = new Request('http://localhost:3000/api/leads/lead_999/contact', {
      method: 'PATCH',
    }) as any;
    
    const params = Promise.resolve({ id: 'lead_999' });
    const response = await PATCH(request, { params });
    
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Lead not found');
  });

  it('should persist update in memory for subsequent GET', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    const { GET } = await import('@/app/api/leads/route');
    
    // First, contact the lead
    const patchRequest = new Request('http://localhost:3000/api/leads/lead_002/contact', {
      method: 'PATCH',
    }) as any;
    const patchParams = Promise.resolve({ id: 'lead_002' });
    const patchResponse = await PATCH(patchRequest, { params: patchParams });
    expect(patchResponse.status).toBe(200);
    
    // Then, GET all leads and verify the mutation persisted
    const getRequest = new Request('http://localhost:3000/api/leads') as any;
    const getResponse = await GET(getRequest);
    expect(getResponse.status).toBe(200);
    
    const leads = await getResponse.json();
    const updatedLead = leads.find((l: { id: string }) => l.id === 'lead_002');
    
    expect(updatedLead).toBeDefined();
    expect(updatedLead?.status).toBe('contacted');
    expect(updatedLead?.lastContactAt).toBeDefined();
    expect(updatedLead?.lastContactAt).not.toBeNull();
  });

  it('should update lastContactAt on subsequent contacts', async () => {
    const { PATCH } = await import('@/app/api/leads/[id]/contact/route');
    
    // Use a different lead ID to avoid polluting other tests
    const testLeadId = 'lead_004';
    
    // First contact
    const request1 = new Request(`http://localhost:3000/api/leads/${testLeadId}/contact`, {
      method: 'PATCH',
    }) as any;
    const params1 = Promise.resolve({ id: testLeadId });
    const response1 = await PATCH(request1, { params: params1 });
    const lead1 = await response1.json();
    const firstContactAt = lead1.lastContactAt;
    
    // Small delay to ensure different timestamp
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Second contact
    const request2 = new Request(`http://localhost:3000/api/leads/${testLeadId}/contact`, {
      method: 'PATCH',
    }) as any;
    const params2 = Promise.resolve({ id: testLeadId });
    const response2 = await PATCH(request2, { params: params2 });
    const lead2 = await response2.json();
    
    expect(lead2.lastContactAt).not.toBe(firstContactAt);
    expect(new Date(lead2.lastContactAt).getTime()).toBeGreaterThan(new Date(firstContactAt).getTime());
  });
});

describe('GET /api/leads with filtering', () => {
  it('should return all leads when no filters', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(Array.isArray(leads)).toBe(true);
    expect(leads.length).toBe(12);
  });

  it('should filter by search query (case-insensitive name)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads?q=marina') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(1);
    expect(leads[0].name).toBe('Marina Costa');
  });

  it('should filter by search query (phone)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads?q=90000-0003') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(1);
    expect(leads[0].name).toBe('Camila Nascimento');
  });

  it('should filter by source', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads?source=meta_ads') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(4);
    expect(leads.every((l: { source: string }) => l.source === 'meta_ads')).toBe(true);
  });

  it('should filter by status', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads?status=new') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(5);
    expect(leads.every((l: { status: string }) => l.status === 'new')).toBe(true);
  });

  it('should combine search + source + status (AND logic)', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    // Search for a lead that matches all three: name contains "costa", source=meta_ads, status=new
    const request = new Request('http://localhost:3000/api/leads?q=costa&source=meta_ads&status=new') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(1);
    expect(leads[0].name).toBe('Marina Costa');
    expect(leads[0].source).toBe('meta_ads');
    expect(leads[0].status).toBe('new');
  });

  it('should return empty array for no matches', async () => {
    const { GET } = await import('@/app/api/leads/route');
    
    const request = new Request('http://localhost:3000/api/leads?q=xyz123') as any;
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const leads = await response.json();
    expect(leads.length).toBe(0);
  });
});

describe('contact-store utilities', () => {
  it('recordContact should create mutation with correct status and timestamp', () => {
    // Explicit cleanup for this test group
    clearContactUpdates();
    resetLeadsCache();
    vi.resetModules();
    
    const mutation = recordContact('lead_001');
    expect(mutation.status).toBe('contacted');
    expect(mutation.lastContactAt).toBeDefined();
    
    const date = new Date(mutation.lastContactAt);
    expect(date.toISOString()).toBe(mutation.lastContactAt);
  });

  it('clearContactUpdates should remove all mutations', async () => {
    // Explicit cleanup for this test group
    clearContactUpdates();
    resetLeadsCache();
    vi.resetModules();
    
    recordContact('lead_001');
    recordContact('lead_002');
    clearContactUpdates();
    
    const { getLeads } = await import('@/lib/leads');
    const leads = await getLeads();
    const mutated = applyContactMutations(leads);
    
    const lead1 = mutated.find(l => l.id === 'lead_001');
    expect(lead1?.status).toBe('new');
    expect(lead1?.lastContactAt).toBeNull();
  });
});