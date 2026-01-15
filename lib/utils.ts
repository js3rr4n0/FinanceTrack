import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

export function getFinancialStatus(balance: number, income: number): 'healthy' | 'warning' | 'critical' {
  if (income === 0) return 'critical';
  const ratio = balance / income;
  if (ratio >= 0.3) return 'healthy';
  if (ratio >= 0.1) return 'warning';
  return 'critical';
}
