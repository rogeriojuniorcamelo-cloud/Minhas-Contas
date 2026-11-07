/**
 * Formatadores para padrão brasileiro (pt-BR)
 */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formata um valor numérico para Real Brasileiro (ex: R$ 1.250,50)
 */
export function formatCurrency(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return 'R$ 0,00';
  }
  return currencyFormatter.format(value);
}

/**
 * Converte string digitada pelo usuário em número
 * Aceita: "1250,50", "1.250,50", "1250.50", "R$ 1.250,50"
 */
export function parseCurrencyInput(input: string | number): number {
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  if (!input) return 0;

  // Remove caracteres que não sejam dígitos, vírgula ou ponto
  const cleaned = input.toString().replace(/[^\d.,]/g, '');
  if (!cleaned) return 0;

  // Se tem vírgula e ponto, assume que ponto é milhar e vírgula é decimal
  if (cleaned.includes(',') && cleaned.includes('.')) {
    const standardized = cleaned.replace(/\./g, '').replace(',', '.');
    const val = parseFloat(standardized);
    return isNaN(val) ? 0 : val;
  }

  // Se tem apenas vírgula, substitui por ponto
  if (cleaned.includes(',')) {
    const val = parseFloat(cleaned.replace(',', '.'));
    return isNaN(val) ? 0 : val;
  }

  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}

/**
 * Formata data YYYY-MM-DD para DD/MM/AAAA
 */
export function formatDateBR(dateStr: string | undefined | null): string {
  if (!dateStr) return '--/--/----';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/**
 * Converte YYYY-MM para "Novembro de 2026"
 */
export function formatMonthYearBR(yearMonthStr: string): string {
  if (!yearMonthStr || yearMonthStr === 'todos') return 'Todos os Meses';
  const parts = yearMonthStr.split('-');
  if (parts.length < 2) return yearMonthStr;

  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[0];

  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  const monthName = months[monthIndex] || '';
  return `${monthName} de ${year}`;
}

/**
 * Converte YYYY-MM para formato curto "Nov/2026"
 */
export function formatShortMonthYearBR(yearMonthStr: string): string {
  if (!yearMonthStr || yearMonthStr === 'todos') return 'Todos';
  const parts = yearMonthStr.split('-');
  if (parts.length < 2) return yearMonthStr;

  const monthIndex = parseInt(parts[1], 10) - 1;
  const year = parts[0];

  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  const monthName = months[monthIndex] || '';
  return `${monthName}/${year}`;
}
