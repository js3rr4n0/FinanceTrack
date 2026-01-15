'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, Tag, DollarSign, FileText } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export default function AddTransaction({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'cash'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type, amount: parseFloat(formData.amount) })
      });
      onSuccess();
      setFormData({ amount: '', category: '', description: '', date: new Date().toISOString().split('T')[0], payment_method: 'cash' });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full glass-effect p-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-semibold hover:bg-purple-500/20 transition-all pulse-glow"
      >
        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl">
          <Plus className="w-6 h-6" />
        </div>
        Agregar Transacción
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-6 md:p-8 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Nueva Transacción</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-3 p-1 glass-effect rounded-xl">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    type === 'expense'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                      : 'text-text-secondary'
                  }`}
                >
                  💸 Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`py-3 rounded-lg font-semibold transition-all ${
                    type === 'income'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                      : 'text-text-secondary'
                  }`}
                >
                  💰 Ingreso
                </button>
              </div>

              {/* Amount */}
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Monto"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 glass-effect rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Category */}
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="text"
                  required
                  placeholder="Categoría (ej: Comida, Transporte)"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description */}
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-5 h-5 text-text-secondary" />
                <textarea
                  placeholder="Descripción (opcional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  rows={3}
                />
              </div>

              {/* Date */}
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Payment Method */}
              <select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-full px-4 py-4 glass-effect rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="cash">💵 Efectivo</option>
                <option value="card">💳 Tarjeta</option>
                <option value="transfer">🏦 Transferencia</option>
                <option value="crypto">₿ Crypto</option>
              </select>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-bold text-lg shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transition-all"
              >
                Guardar Transacción
              </motion.button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
