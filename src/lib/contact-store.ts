import { Lead, LeadStatus } from './leads';

// In-memory mutation store (persists across requests while server runs)
export const contactUpdates = new Map<string, { status: LeadStatus; lastContactAt: string }>();

export function applyContactMutations(leads: Lead[]): Lead[] {
  return leads.map(lead => {
    const mutation = contactUpdates.get(lead.id);
    if (mutation) {
      return {
        ...lead,
        status: mutation.status,
        lastContactAt: mutation.lastContactAt,
      };
    }
    return lead;
  });
}

export function recordContact(id: string): { status: LeadStatus; lastContactAt: string } {
  const now = new Date().toISOString();
  const mutation = { status: 'contacted' as LeadStatus, lastContactAt: now };
  contactUpdates.set(id, mutation);
  return mutation;
}

export function clearContactUpdates(): void {
  contactUpdates.clear();
}