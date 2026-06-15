/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { formatRupiah } from '../utils';
import { PlusCircle, ArrowDown, ArrowUp, Calendar, User, FileText, DollarSign, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  // Input states
  const [type, setType] = useState<TransactionType>('masuk');
  // Default date to today's local date
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  
  // Custom states for usability
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Automatically switch default category when type transitions
  useEffect(() => {
    if (type === 'masuk') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Mohon masukkan jumlah uang yang valid (lebih dari 0).');
      return;
    }

    if (!category) {
      alert('Mohon pilih kategori setoran.');
      return;
    }

    if (!description.trim()) {
      alert('Mohon tulis keterangan detail serah terima.');
      return;
    }

    // Call callback to add transaction
    onAddTransaction({
      date,
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      recordedBy: recordedBy.trim() || 'Kasir Fatimah'
    });

    // Reset fields
    setAmount('');
    setDescription('');
    setRecordedBy('');
    
    // Show success banner
    setSuccessMessage('Alhamdulillah, setoran kasir berhasil dicatat!');
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  const currentCategories = type === 'masuk' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-slate-100 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500/10" />
        <h3 className="font-bold text-lg text-slate-950 font-sans tracking-tight">Input Setoran Kasir</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Aliran */}
        <div>
          <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Jenis Transaksi</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('masuk')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                type === 'masuk'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm shadow-emerald-700/5'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowUp className={`h-4 w-4 ${type === 'masuk' ? 'text-emerald-600' : 'text-slate-400'}`} />
              Setoran Masuk (Kasir)
            </button>
            <button
              type="button"
              onClick={() => setType('keluar')}
              className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-semibold transition-all duration-200 cursor-pointer ${
                type === 'keluar'
                  ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-sm shadow-rose-700/5'
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              <ArrowDown className={`h-4 w-4 ${type === 'keluar' ? 'text-rose-600' : 'text-slate-400'}`} />
              Kas Keluar (Bendahara)
            </button>
          </div>
        </div>

        {/* Tanggal Transaksi */}
        <div>
          <label htmlFor="date-input" className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Tanggal Serah Terima
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="h-4 w-4" />
            </span>
            <input
              id="date-input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-sans"
            />
          </div>
        </div>

        {/* Jumlah Nominal */}
        <div>
          <label htmlFor="amount-input" className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Jumlah Nominal Handover
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-sm">
              Rp
            </span>
            <input
              id="amount-input"
              type="number"
              required
              min="1"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
          </div>
          {/* live rupiah preview format so users do not type extra or missing zeros */}
          {amount && parseFloat(amount) > 0 && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium text-emerald-600 mt-1 bg-emerald-50/50 py-1.5 px-2 rounded-lg border border-emerald-100"
            >
              Terbaca: <span className="font-bold">{formatRupiah(parseFloat(amount))}</span>
            </motion.p>
          )}
        </div>

        {/* Kategori */}
        <div>
          <label htmlFor="category-select" className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Kategori Setoran/Aliran
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Keterangan */}
        <div>
          <label htmlFor="desc-input" className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Keterangan Serah Terima
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
              <FileText className="h-4 w-4" />
            </span>
            <textarea
              id="desc-input"
              rows={2}
              required
              placeholder="Contoh: Setoran shift pagi lunas kasir Fatimah"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
            />
          </div>
        </div>

        {/* recordedBy */}
        <div>
          <label htmlFor="staf-pencatat" className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
            Nama Kasir / Pengirim Setoran <span className="text-slate-400 text-[10px] lowercase italic">(opsional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <input
              id="staf-pencatat"
              type="text"
              placeholder="Nama Kasir (default: Kasir Fatimah)"
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 outline-hidden font-semibold text-white rounded-xl shadow-md hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer flex items-center justify-center gap-2 transition-all group"
        >
          <PlusCircle className="h-4.5 w-4.5 text-emerald-200 group-hover:scale-110 transition-transform" />
          Simpan Setoran Harian
        </button>

        {/* Success Alert Banner */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 bg-emerald-550/10 border border-emerald-500/20 text-emerald-800 rounded-xl text-xs text-center font-semibold"
          >
            {successMessage}
          </motion.div>
        )}
      </form>
    </div>
  );
}
