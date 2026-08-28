import { NextRequest, NextResponse } from 'next/server';
import { getLeads, Lead, LeadSource, LeadStatus } from '@/lib/leads';
import { applyContactMutations, contactUpdates } from '@/lib/contact-store';

function filterLeads(leads: Lead[], q: string, source: string, status: string): Lead[] {
  let filtered = leads;

  // Search: case-insensitive name or phone contains
  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    filtered = filtered.filter(lead =>
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query)
    );
  }

  // Source filter: exact match
  if (source && source !== 'all') {
    filtered = filtered.filter(lead => lead.source === source);
  }

  // Status filter: exact match
  if (status && status !== 'all') {
    filtered = filtered.filter(lead => lead.status === status);
  }

  return filtered;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const source = searchParams.get('source') || '';
    const status = searchParams.get('status') || '';

    const allLeads = await getLeads();
    const leadsWithMutations = applyContactMutations(allLeads);
    const filtered = filterLeads(leadsWithMutations, q, source, status);

    return NextResponse.json(filtered);
  } catch (error) {
    console.error('GET /api/leads error:', error);
    return NextResponse.json(
      { error: 'Falha ao carregar leads' },
      { status: 500 }
    );
  }
}

// Export for testing
export { contactUpdates, applyContactMutations };