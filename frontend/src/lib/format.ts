const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
});

export function formatCurrency(value: number | string | null | undefined): string {
  const numeric = typeof value === 'string' ? Number(value) : value;
  return currencyFormatter.format(numeric ?? 0);
}

export function formatDate(date: string | Date | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '';
  const instance = typeof date === 'string' ? new Date(date) : date;
  if (!instance || Number.isNaN(instance.getTime())) return '';

  return instance.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    ...(options ?? {}),
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '';
  const instance = typeof date === 'string' ? new Date(date) : date;
  if (!instance || Number.isNaN(instance.getTime())) return '';

  return instance.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

