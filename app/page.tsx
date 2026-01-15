'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import AddTransaction from '@/components/AddTransaction';
import TransactionList from '@/components/TransactionList';
import Charts from '@/components/Charts';
import FinancialStatus from '@/components/FinancialStatus';
import ReceiptUpload from '@/components/ReceiptUpload';
import AIAnalysis from '@/components/AIAnalysis';
import { Transaction, FinancialSummary } from '@/types';
import { Wallet, TrendingUp, BarChart3, Sparkles } from 'lucide-react';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<FinancialSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    status: 'healthy'
  });
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'year'>('month');
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'analysis'>('overview');

  const calculateSummary = useCallback((txns: Transaction[]) => {
    const income = txns.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = txns.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    const balance = income - expenses;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (income === 0) status = 'critical';
    else {
      const ratio = balance / income;
      if (ratio < 0.1) status = 'critical';
      else if (ratio < 0.3) status = 'warning';
    }

    setSummary({ totalIncome: income, totalExpenses: expenses, balance, status });
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch(`/api/transactions?filter=${filter}`);
      const data = await response.json();
      const txns = data.transactions || [];
      setTransactions(txns);
      calculateSummary(txns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  }, [filter, calculateSummary]);

  const initializeDB = useCallback(async () => {
    try {
      await fetch('/api/transactions?init=true');
    } catch (error) {
      console.error('Error initializing DB:', error);
    }
  }, []);

  useEffect(() => {
    initializeDB();
    fetchTransactions();
  }, [filter, fetchTransactions, initializeDB]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shine-effect">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                Finance Tracker
              </h1>
              <p className="text-text-secondary text-sm md:text-base">Controla tu economía con estilo</p>
            </div>
          </div>
        </motion.header>

        {/* Financial Status */}
        <FinancialStatus summary={summary} />

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 mb-6 overflow-x-auto pb-2"
        >
          {[
            { value: 'all', label: 'Todo', icon: BarChart3 },
            { value: 'week', label: 'Semana', icon: TrendingUp },
            { value: 'month', label: 'Mes', icon: BarChart3 },
            { value: 'year', label: 'Año', icon: Sparkles }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value as typeof filter)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all whitespace-nowrap ${
                filter === item.value
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/50'
                  : 'glass-effect text-text-secondary hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-6 glass-effect p-2 rounded-2xl">
          {[
            { id: 'overview', label: 'General' },
            { id: 'transactions', label: 'Movimientos' },
            { id: 'analysis', label: 'Análisis IA' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 rounded-xl font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : 'text-text-secondary hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid gap-6">
              <AddTransaction onSuccess={fetchTransactions} />
              <ReceiptUpload onSuccess={fetchTransactions} />
              <Charts transactions={transactions} />
            </div>
          )}

          {activeTab === 'transactions' && (
            <TransactionList 
              transactions={transactions}
              onUpdate={fetchTransactions}
            />
          )}

          {activeTab === 'analysis' && (
            <AIAnalysis 
              transactions={transactions}
              summary={summary}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
