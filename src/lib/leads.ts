import { promises as fs } from 'fs';
import path from 'path';

export type LeadSource = 'meta_ads' | 'google_ads' | 'referral' | 'organic';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'lost';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  source: LeadSource;
  status: LeadStatus;
  campaign: string;
  interest: string;
  createdAt: string;
  lastContactAt: string | null;
}

let leadsCache: Lead[] | null = null;

export async function getLeads(): Promise<Lead[]> {
  if (!leadsCache) {
    const filePath = path.join(process.cwd(), 'dados', 'leads.json');
    const file = await fs.readFile(filePath, 'utf-8');
    leadsCache = JSON.parse(file) as Lead[];
  }
  return leadsCache;
}

export function resetLeadsCache(): void {
  leadsCache = null;
}

export function getCachedLeads(): Lead[] | null {
  return leadsCache;
}