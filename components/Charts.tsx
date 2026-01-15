'use client';

import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export default function Charts({ transactions }: Props) {
  const categoryData = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const grouped = expenses.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions]);

  const timelineData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString('es-SV', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        acc[date].income += Number(t.amount);
      } else {
        acc[date].expense += Number(t.amount);
      }
      return acc;
    }, {} as Record<string, { date: string; income: number; expense: number }>);

    return Object.values(grouped).slice(-10);
  }, [transactions]);

  const paymentMethodData = useMemo(() => {
    const grouped = transactions.reduce((acc, t) => {
      const method = t.payment_method || 'other';
      acc[method] = (acc[method] || 0) + Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  const METHOD_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-3 rounded-xl border border-white/20">
          <p className="text-sm font-semibold text-white">{payload[0].name}</p>
          <p className="text-lg font-bold text-purple-400">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-effect p-12 rounded-2xl text-center">
        <div className="text-6xl mb-4">📊</div>
        <p className="text-text-secondary text-lg">No hay datos para mostrar aún</p>
        <p className="text-text-secondary text-sm mt-2">Agrega algunas transacciones para ver tus gráficos</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Categories Bar Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-effect p-6 rounded-2xl card-hover"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold">Gastos por Categoría</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Timeline Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-effect p-6 rounded-2xl card-hover"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold">Ingresos vs Gastos</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(26, 32, 50, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10b981" 
              strokeWidth={3}
              name="Ingresos"
              dot={{ fill: '#10b981', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="Gastos"
              dot={{ fill: '#ef4444', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Payment Methods Pie Chart */}
      {paymentMethodData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-effect p-6 rounded-2xl card-hover"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <PieChartIcon className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-xl font-bold">Métodos de Pago</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
