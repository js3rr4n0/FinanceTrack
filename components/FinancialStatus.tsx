'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { FinancialSummary } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface Props {
  summary: FinancialSummary;
}

export default function FinancialStatus({ summary }: Props) {
  const statusConfig = {
    healthy: { color: 'from-green-500 to-emerald-500', text: 'Saludable', icon: '💚' },
    warning: { color: 'from-yellow-500 to-orange-500', text: 'Atención', icon: '⚠️' },
    critical: { color: 'from-red-500 to-pink-500', text: 'Crítico', icon: '🚨' }
  };

  const config = statusConfig[summary.status];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
    >
      {/* Total Income */}
      <div className="glass-effect p-6 rounded-2xl card-hover group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6 text-green-400" />
          </div>
          <span className="text-sm font-medium text-green-400">Ingresos</span>
        </div>
        <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalIncome)}</p>
      </div>

      {/* Total Expenses */}
      <div className="glass-effect p-6 rounded-2xl card-hover group">
        <div className="flex items-center justify-between mb-3">
          <div className="p-3 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform">
            <TrendingDown className="w-6 h-6 text-red-400" />
          </div>
          <span className="text-sm font-medium text-red-400">Gastos</span>
        </div>
        <p className="text-3xl font-bold text-white">{formatCurrency(summary.totalExpenses)}</p>
      </div>

      {/* Balance */}
      <div className={`glass-effect p-6 rounded-2xl card-hover relative overflow-hidden`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-10`} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-white/10 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              <span className={`text-sm font-bold bg-gradient-to-r ${config.color} bg-clip-text text-transparent`}>
                {config.text}
              </span>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{formatCurrency(summary.balance)}</p>
          <p className="text-xs text-text-secondary mt-1">Balance disponible</p>
        </div>
      </div>
    </motion.div>
  );
}
