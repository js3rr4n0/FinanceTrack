'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Trash2, MapPin, CreditCard, Image as ImageIcon, ChevronDown } from 'lucide-react';

import toast from 'react-hot-toast';

interface Props {
  transactions: Transaction[];
  onUpdate: () => void;
}

export default function TransactionList({ transactions, onUpdate }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta transacción?')) return;
    
    const loadingToast = toast.loading('Eliminando...');
    
    try {
      const response = await fetch(`/api/transactions?id=${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast.success('🗑️ Transacción eliminada', {
          id: loadingToast,
        });
        onUpdate();
      } else {
        toast.error('❌ Error al eliminar', {
          id: loadingToast,
        });
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('❌ Error de conexión', {
        id: loadingToast,
      });
    }
  };

  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      comida: '🍔', transporte: '🚗', entretenimiento: '🎮', 
      salud: '💊', educacion: '📚', ropa: '👕',
      hogar: '🏠', servicios: '💡', salario: '💰',
      freelance: '💻', otro: '📦'
    };
    return emojiMap[category.toLowerCase()] || '💵';
  };

  if (transactions.length === 0) {
    return (
      <div className="glass-effect p-12 rounded-2xl text-center">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-text-secondary text-lg">No hay transacciones aún</p>
        <p className="text-text-secondary text-sm mt-2">Comienza agregando tu primera transacción</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
            className="glass-effect rounded-2xl overflow-hidden card-hover"
          >
            <div
              onClick={() => setExpandedId(expandedId === transaction.id ? null : transaction.id)}
              className="p-4 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl text-2xl ${
                    transaction.type === 'income' 
                      ? 'bg-green-500/20' 
                      : 'bg-red-500/20'
                  }`}>
                    {getCategoryEmoji(transaction.category)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white truncate">{transaction.category}</h4>
                      {transaction.receipt_url && (
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-text-secondary truncate">{transaction.description}</p>
                    )}
                    <p className="text-xs text-text-secondary mt-1">
                      {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
                    </p>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(transaction.id);
                    }}
                    className="p-2 hover:bg-red-500/20 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>

                  <ChevronDown 
                    className={`w-5 h-5 text-text-secondary transition-transform ${
                      expandedId === transaction.id ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === transaction.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/10 space-y-2"
                  >
                    {transaction.payment_method && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <CreditCard className="w-4 h-4" />
                        <span className="capitalize">{transaction.payment_method}</span>
                      </div>
                    )}
                    
                    {transaction.location && (
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span>{transaction.location}</span>
                      </div>
                    )}

                    {transaction.receipt_url && (
                      <div className="mt-3">
                        <img 
                          src={transaction.receipt_url} 
                          alt="Receipt"
                          className="w-full max-w-xs rounded-xl border border-white/20"
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
