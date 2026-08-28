import { NextRequest, NextResponse } from 'next/server';
import { getLeads, Lead, LeadStatus } from '@/lib/leads';
import { recordContact } from '@/lib/contact-store';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const allLeads = await getLeads();
    const leadIndex = allLeads.findIndex(lead => lead.id === id);

    if (leadIndex === -1) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const mutation = recordContact(id);
    const updatedLead: Lead = {
      ...allLeads[leadIndex],
      status: mutation.status,
      lastContactAt: mutation.lastContactAt,
    };

    return NextResponse.json(updatedLead);
  } catch (error) {
    console.error('PATCH /api/leads/[id]/contact error:', error);
    return NextResponse.json(
      { error: 'Falha ao registrar contato' },
      { status: 500 }
    );
  }
}