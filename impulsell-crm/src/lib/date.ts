// Formatação de datas em pt-BR, sem dependências externas.
// SPEC US-007: datas como "DD/MM/AAAA HH:mm", lastContactAt null = "Nunca contatado".

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
});

/**
 * Formata uma data ISO 8601 como "DD/MM/AAAA HH:mm" no fuso de Brasília.
 * Retorna "—" se a string for vazia ou inválida.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_TIME_FORMATTER.format(date);
}

/**
 * Versão amigável para o contato:
 * - null/undefined -> "Nunca contatado"
 * - ISO válido -> "DD/MM/AAAA HH:mm"
 * - Inválido -> "—"
 */
export function formatContactDate(iso: string | null | undefined): string {
  if (iso === null || iso === undefined || iso === '') return 'Nunca contatado';
  return formatDateTime(iso);
}