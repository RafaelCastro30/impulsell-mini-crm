// PATCH /api/leads/:id/contact
// SPEC FR-007 a FR-011:
//   - Sem body
//   - ID válido -> 200 com o lead atualizado (status=contacted, lastContactAt=ISO 8601)
//   - ID inexistente -> 404
//   - Outros campos preservados

import { type NextRequest, NextResponse } from 'next/server';
import { getLeads } from '@/lib/leads';
import { applyContactMutations, recordContact } from '@/lib/contact-store';

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const base = await getLeads();
    const lead = base.find((l) => l.id === id);
    if (!lead) {
      return NextResponse.json(
        { error: 'Lead não encontrado' },
        { status: 404 },
      );
    }

    recordContact(base, id);
    const updated = applyContactMutations(base).find((l) => l.id === id);
    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}