// Carregamento e cache dos leads do JSON em disco.
// CONSTITUTION IV: estado em memória durante runtime (sem DB).
// O JSON é lido UMA VEZ por processo; mutações de contato ficam
// em src/lib/contact-store.ts e são aplicadas sobre esta lista base.

import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Lead } from '@/types/lead';

let leadsCache: Lead[] | null = null;

/**
 * Retorna a lista base de leads (do JSON).
 * Na primeira chamada, lê do disco; chamadas subsequentes usam o cache do módulo.
 *
 * O `as Lead[]` é seguro porque o JSON é commitado no repo e validado pelo build;
 * em runtime confiamos no formato conhecido.
 */
export async function getLeads(): Promise<Lead[]> {
  if (leadsCache !== null) return leadsCache;

  const filePath = join(process.cwd(), 'dados', 'leads.json');
  const raw = await readFile(filePath, 'utf-8');
  leadsCache = JSON.parse(raw) as Lead[];
  return leadsCache;
}

/**
 * Limpa o cache. Usado em testes para isolar o estado entre casos.
 */
export function resetLeadsCache(): void {
  leadsCache = null;
}