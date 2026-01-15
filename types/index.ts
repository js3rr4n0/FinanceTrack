export interface Transaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  payment_method?: string;
  location?: string;
  receipt_url?: string;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  count: number;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  status: 'healthy' | 'warning' | 'critical';
}
