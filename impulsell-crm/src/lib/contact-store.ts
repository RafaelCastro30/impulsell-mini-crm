// Armazenamento em memória das mutações de contato.
// CONSTITUTION IV: estado em memória durante runtime (sem DB).
//
// Estrutura: Map<id do lead, mutação aplicada>
// Aplicado por applyContactMutations() sobre a lista base retornada por getLeads().

import type { Lead, LeadMutation } from '@/types/lead';

export const contactUpdates = new Map<string, LeadMutation>();

/**
 * Mescla as mutações registradas sobre a lista base.
 * Para cada lead com mutação, retorna uma cópia com status e lastContactAt atualizados.
 */
export function applyContactMutations(leads: Lead[]): Lead[] {
  return leads.map((lead) => {
    const mutation = contactUpdates.get(lead.id);
    if (!mutation) return lead;
    return {
      ...lead,
      status: mutation.status,
      lastContactAt: mutation.lastContactAt,
    };
  });
}

/**
 * Registra a mutação de contato para um lead e retorna o registro aplicado.
 * Lança erro se o lead não existir.
 */
export function recordContact(leads: Lead[], id: string): LeadMutation {
  const lead = leads.find((l) => l.id === id);
  if (!lead) {
    throw new Error(`Lead não encontrado: ${id}`);
  }
  const mutation: LeadMutation = {
    status: 'contacted',
    lastContactAt: new Date().toISOString(),
  };
  contactUpdates.set(id, mutation);
  return mutation;
}

/**
 * Limpa todas as mutações. Usado em testes.
 */
export function clearContactUpdates(): void {
  contactUpdates.clear();
}