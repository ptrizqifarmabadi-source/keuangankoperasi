/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SummaryStats } from '../types';
import { formatRupiah } from '../utils';
import { Wallet, TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStatsProps {
  stats: SummaryStats;
  totalTransactionsCount: number;
}

export function DashboardStats({ stats, totalTransactionsCount }: DashboardStatsProps) {
  // Let's calculate nice percentages
  const inflowSecured = stats.totalIncome > 0;
  const ratioExpenseToIncome = inflowSecured 
    ? Math.min(100, Math.round((stats.totalExpense / stats.totalIncome) * 100)) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* CARD 1: SALDO UTAMA HANDOVER */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Kas di Bendahara</p>
          <p className="text-xs text-emerald-600 font-semibold mb-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Dana Terverifikasi (Bebas Riba)
          </p>
          <h3 className="text-3xl font-bold text-emerald-700 tracking-tight font-sans">
            {formatRupiah(stats.totalBalance)}
          </h3>
        </div>
        <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-15 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z"></path>
            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd"></path>
          </svg>
        </div>
      </motion.div>

      {/* CARD 2: TOTAL PENGELUARAN MINGGUAN */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Kas Keluar Minggu Ini</p>
          <p className="text-xs text-rose-600 font-semibold mb-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Setoran ke Bank / Koreksi Kurang
          </p>
          <h3 className="text-3xl font-bold text-amber-600 tracking-tight font-sans">
            {formatRupiah(stats.weeklyExpense)}
          </h3>
        </div>
        <div className="absolute -right-4 -bottom-4 text-amber-50 opacity-15 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd"></path>
          </svg>
        </div>
      </motion.div>

      {/* CARD 3: RINGKASAN SETORAN / PENERIMAAN */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10">
          <p className="text-sm text-slate-500 font-semibold uppercase tracking-wider mb-1">Setoran Kasir Minggu Ini</p>
          <p className="text-xs text-teal-600 font-semibold mb-2 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Penerimaan Setoran Harian
          </p>
          <h3 className="text-3xl font-bold text-emerald-800 tracking-tight font-sans">
            {formatRupiah(stats.weeklyIncome)}
          </h3>
        </div>
        <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-15 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
