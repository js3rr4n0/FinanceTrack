'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Transaction, FinancialSummary } from '@/types';
import { Sparkles, Loader2, TrendingDown, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  summary: FinancialSummary;
}

export default function AIAnalysis({ transactions = [], summary }: Props) {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions, summary })
      });

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing:', error);
      setAnalysis('Error al generar análisis. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const transactionCount = transactions?.length || 0;
  const expenseCount = transactions?.filter(t => t.type === 'expense')?.length || 0;
  const categoryCount = transactions ? new Set(transactions.map(t => t.category)).size : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-effect p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-text-secondary">Transacciones</span>
          </div>
          <p className="text-2xl font-bold">{transactionCount}</p>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-text-secondary">Gastos</span>
          </div>
          <p className="text-2xl font-bold">{expenseCount}</p>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-text-secondary">Estado</span>
          </div>
          <p className="text-2xl font-bold capitalize">
            {summary?.status === 'healthy' ? '💚' : summary?.status === 'warning' ? '⚠️' : '🚨'}
          </p>
        </div>

        <div className="glass-effect p-4 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-text-secondary">Categorías</span>
          </div>
          <p className="text-2xl font-bold">{categoryCount}</p>
        </div>
      </div>

      {/* AI Analysis Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-8 rounded-2xl"
      >
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Análisis Financiero con IA</h2>
          <p className="text-text-secondary">
            Obtén recomendaciones personalizadas basadas en tus hábitos de gasto
          </p>
        </div>

        {!analysis && !loading && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={transactionCount === 0}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generar Análisis Inteligente
          </motion.button>
        )}

        {loading && (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-lg font-semibold">Analizando tus finanzas...</p>
            <p className="text-sm text-text-secondary mt-2">Esto puede tomar unos segundos</p>
          </div>
        )}

        {analysis && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="glass-effect p-6 rounded-xl">
              <div className="prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap text-white leading-relaxed">
                  {analysis}
                </div>
              </div>
            </div>

            <button
              onClick={() => setAnalysis('')}
              className="w-full py-3 glass-effect rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              Generar Nuevo Análisis
            </button>
          </motion.div>
        )}

        {transactionCount === 0 && (
          <div className="text-center py-8">
            <p className="text-text-secondary">Agrega algunas transacciones para obtener un análisis</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
