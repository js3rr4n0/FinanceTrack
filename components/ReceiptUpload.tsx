'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Camera, X, Loader2, CheckCircle } from 'lucide-react';

interface Props {
  onSuccess: () => void;
}

export default function ReceiptUpload({ onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      setOcrResult(data);
    } catch (error) {
      console.error('Error processing receipt:', error);
      alert('Error al procesar la factura. Intenta nuevamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!ocrResult) return;

    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'expense',
          amount: ocrResult.amount,
          category: ocrResult.category || 'Otro',
          description: ocrResult.description || '',
          date: ocrResult.date || new Date().toISOString().split('T')[0],
          location: ocrResult.location || '',
          payment_method: ocrResult.payment_method || 'cash',
          receipt_url: preview
        })
      });

      onSuccess();
      setIsOpen(false);
      setPreview(null);
      setOcrResult(null);
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(true)}
        className="w-full glass-effect p-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-semibold hover:bg-blue-500/20 transition-all"
      >
        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
          <Camera className="w-6 h-6" />
        </div>
        Escanear Factura (OCR)
      </motion.button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-effect p-6 md:p-8 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Escanear Factura</h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setPreview(null);
                  setOcrResult(null);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!preview ? (
              <label className="block cursor-pointer">
                <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-blue-400" />
                  <p className="text-lg font-semibold mb-2">Sube una foto de tu factura</p>
                  <p className="text-sm text-text-secondary">PNG, JPG hasta 10MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </label>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <img 
                    src={preview} 
                    alt="Receipt preview"
                    className="w-full rounded-2xl border border-white/20"
                  />
                  {uploading && (
                    <div className="absolute inset-0 bg-black/80 rounded-2xl flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-3" />
                        <p className="text-lg font-semibold">Procesando factura...</p>
                        <p className="text-sm text-text-secondary">Extrayendo datos con IA</p>
                      </div>
                    </div>
                  )}
                </div>

                {ocrResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-effect p-6 rounded-2xl space-y-4"
                  >
                    <div className="flex items-center gap-2 text-green-400 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Datos extraídos</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-text-secondary">Monto</label>
                        <p className="text-2xl font-bold text-white">${ocrResult.amount || '0.00'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary">Fecha</label>
                        <p className="text-lg font-semibold text-white">{ocrResult.date || 'No detectada'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary">Lugar</label>
                        <p className="text-lg font-semibold text-white">{ocrResult.location || 'No detectado'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-text-secondary">Método de pago</label>
                        <p className="text-lg font-semibold text-white capitalize">{ocrResult.payment_method || 'Efectivo'}</p>
                      </div>
                    </div>

                    {ocrResult.items && ocrResult.items.length > 0 && (
                      <div>
                        <label className="text-sm text-text-secondary mb-2 block">Items detectados</label>
                        <div className="space-y-1">
                          {ocrResult.items.map((item: string, i: number) => (
                            <p key={i} className="text-sm text-white">• {item}</p>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleConfirm}
                        className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-bold shadow-lg"
                      >
                        Confirmar y Guardar
                      </motion.button>
                      <button
                        onClick={() => {
                          setPreview(null);
                          setOcrResult(null);
                        }}
                        className="px-6 py-3 glass-effect rounded-xl font-semibold hover:bg-white/10"
                      >
                        Cancelar
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </>
  );
}
