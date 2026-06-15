/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SummaryStats } from '../types';
import { formatRupiah } from '../utils';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStatsProps {
  stats: SummaryStats;
  totalTransactionsCount: number;
  userRole?: 'admin' | 'kasir';
  employeeBelanjaStats?: {
    totalSpent: number;
    transactionCount: number;
    todaySpent: number;
    activeMembersCount: number;
  };
}

export function DashboardStats({ 
  stats, 
  totalTransactionsCount, 
  userRole = 'admin',
  employeeBelanjaStats = { totalSpent: 0, transactionCount: 0, todaySpent: 0, activeMembersCount: 0 }
}: DashboardStatsProps) {
  const todayNet = stats.todayIncome - stats.todayExpense;
  const weeklyNet = stats.weeklyIncome - stats.weeklyExpense;

  // Render KASIR specialized Member Belanja Dashboard
  if (userRole === 'kasir') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        {/* CARD 1: TOTAL BELANJA KOPERASI (SHU) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-amber-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
        >
          <div className="z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5 text-amber-600" />
                  TOTAL BELANJA ANGGOTA
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Buku SHU Harian</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Akumulasi pengeluaran belanja seluruh anggota koperasi terdaftar</p>
            </div>
            
            <div className="mt-4">
              <h3 className="text-3xl font-black text-amber-950 tracking-tight font-sans">
                {formatRupiah(employeeBelanjaStats.totalSpent)}
              </h3>
              
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] font-semibold text-slate-400 font-mono">
                <span>Rata-rata: {employeeBelanjaStats.transactionCount > 0 ? formatRupiah(employeeBelanjaStats.totalSpent / employeeBelanjaStats.transactionCount) : 'Rp 0'} / trx</span>
                <span>Frekuensi: {employeeBelanjaStats.transactionCount} kali</span>
              </div>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 text-amber-500/5 pointer-events-none">
            <Wallet className="w-36 h-36" />
          </div>
        </motion.div>

        {/* CARD 2: BELANJA HARI INI */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-2xl border border-amber-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
        >
          <div className="z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-250 flex items-center gap-1.5 font-sans">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                  BELANJA HARI INI
                </span>
                <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Hari Ini
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Pengeluaran belanja harian anggota khusus untuk sesi tanggal hari ini</p>
            </div>

            <div className="mt-4">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                Belanja Keluar
              </span>
              <p className="text-3xl font-black text-slate-900 tracking-tight font-sans mt-1">
                {formatRupiah(employeeBelanjaStats.todaySpent)}
              </p>
              
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono font-semibold text-slate-400 mt-3">
                <span>Partisipasi Hari Ini:</span>
                <span className="text-amber-800 font-extrabold">{employeeBelanjaStats.todaySpent > 0 ? 'Sesi Aktif' : 'Belum Ada Belanja'}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARD 3: FREKUENSI & PARTISIPASI ANGGOTA */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white rounded-2xl border border-amber-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
        >
          <div className="z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-orange-850 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-orange-500" />
                  STATISTIK ANGGOTA
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Sensus SHU</span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Banyaknya anggota unik yang telah berpartisipasi belanja harian</p>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Jumlah Sesi
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-sans">
                    {employeeBelanjaStats.transactionCount} Kali
                  </p>
                </div>

                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Aktif Belanja
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight font-sans">
                    {employeeBelanjaStats.activeMembersCount} Orang
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono leading-none">
                <span className="font-semibold text-slate-400">Total Karyawan Koperasi:</span>
                <span className="text-slate-700 font-extrabold">58 Anggota</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render DEFAULT ADMIN Dashboard
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
      {/* CARD 1: SALDO UTAMA HANDOVER (TOTAL SYSTEM CASH) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                <Wallet className="h-3.5 w-3.5 text-emerald-700" />
                POSISI BRANKAS UTAMA
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Verified Kas</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Akumulasi seluruh dana serah terima di bawah pengawasan Bendahara</p>
          </div>
          
          <div className="mt-4">
            <h3 className="text-3xl font-black text-emerald-950 tracking-tight font-sans">
              {formatRupiah(stats.totalBalance)}
            </h3>
            
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between text-[11px] font-semibold text-slate-400 font-mono">
              <span>Total Masuk: {formatRupiah(stats.totalIncome)}</span>
              <span>Total Keluar: {formatRupiah(stats.totalExpense)}</span>
            </div>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 text-emerald-500/5 pointer-events-none">
          <Wallet className="w-36 h-36" />
        </div>
      </motion.div>

      {/* CARD 2: REAL-TIME REKAP HARI INI */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                REKAP HARI INI
              </span>
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Hari Ini
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Ringkasan transaksi setoran kasir & pengeluaran tanggal hari ini</p>
          </div>

          <div className="mt-4 space-y-4">
            {/* Split layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                  Setor Masuk
                </span>
                <p className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight font-sans">
                  {formatRupiah(stats.todayIncome)}
                </p>
              </div>

              <div className="space-y-1 border-l border-slate-100 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" />
                  Kas Keluar
                </span>
                <p className="text-lg sm:text-xl font-bold text-rose-600 tracking-tight font-sans">
                  {formatRupiah(stats.todayExpense)}
                </p>
              </div>
            </div>

            {/* Bottom aggregate indicator */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-400 font-mono">Net Hari Ini:</span>
              <span className={`font-bold font-mono ${todayNet >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                {todayNet >= 0 ? '+' : ''}{formatRupiah(todayNet)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD 3: REKAP SIKLUS MINGGU INI */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden"
      >
        <div className="z-10 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 text-amber-700" />
                SENSUS MINGGUAL
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Minggu Berjalan</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Buku besar mingguan akumulatif penyerahan & alokasi kas</p>
          </div>

          <div className="mt-4 space-y-4">
            {/* Split layout */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <ArrowUpRight className="h-3.5 w-3.5 text-teal-500" />
                  Setor Masuk
                </span>
                <p className="text-lg sm:text-xl font-bold text-teal-800 tracking-tight font-sans">
                  {formatRupiah(stats.weeklyIncome)}
                </p>
              </div>

              <div className="space-y-1 border-l border-slate-100 pl-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-0.5">
                  <ArrowDownRight className="h-3.5 w-3.5 text-amber-600" />
                  Kas Keluar
                </span>
                <p className="text-lg sm:text-xl font-bold text-amber-600 tracking-tight font-sans">
                  {formatRupiah(stats.weeklyExpense)}
                </p>
              </div>
            </div>

            {/* Bottom aggregate indicator */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-400 font-mono">Net Mingguan:</span>
              <span className={`font-bold font-mono ${weeklyNet >= 0 ? 'text-teal-700' : 'text-amber-700'}`}>
                {weeklyNet >= 0 ? '+' : ''}{formatRupiah(weeklyNet)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
