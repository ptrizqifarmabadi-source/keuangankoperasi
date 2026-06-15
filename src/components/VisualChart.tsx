/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Transaction } from '../types';
import { formatRupiah } from '../utils';
import { Landmark, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface VisualChartProps {
  transactions: Transaction[];
}

export function VisualChart({ transactions }: VisualChartProps) {
  // Aggregate data by categories
  const incomeBreakdown = React.useMemo(() => {
    const cats: { [key: string]: number } = {};
    let total = 0;
    transactions.forEach(t => {
      if (t.type === 'masuk') {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
        total += t.amount;
      }
    });

    return Object.entries(cats)
      .map(([name, value]) => ({ name, value, percentage: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const expenseBreakdown = React.useMemo(() => {
    const cats: { [key: string]: number } = {};
    let total = 0;
    transactions.forEach(t => {
      if (t.type === 'keluar') {
        cats[t.category] = (cats[t.category] || 0) + t.amount;
        total += t.amount;
      }
    });

    return Object.entries(cats)
      .map(([name, value]) => ({ name, value, percentage: total > 0 ? Math.round((value / total) * 100) : 0 }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
      {/* SECTION 1: BREAKDOWN UANG MASUK */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
          <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
          <h4 className="font-bold text-sm text-slate-800">Alokasi & Sumber Uang Masuk</h4>
        </div>

        {incomeBreakdown.length > 0 ? (
          <div className="space-y-4">
            {incomeBreakdown.slice(0, 5).map((item, index) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 truncate max-w-[210px]" title={item.name}>
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.value)} <span className="text-[10px] text-emerald-600 font-normal">({item.percentage}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-emerald-600 h-1.5 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center italic">Belum ada setoran masuk yang tercatat.</p>
        )}
      </div>

      {/* SECTION 2: BREAKDOWN UANG KELUAR */}
      <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-100">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-50 pb-3">
          <TrendingDown className="h-4.5 w-4.5 text-rose-600" />
          <h4 className="font-bold text-sm text-slate-800">Alokasi & Tujuan Uang Keluar</h4>
        </div>

        {expenseBreakdown.length > 0 ? (
          <div className="space-y-4">
            {expenseBreakdown.slice(0, 5).map((item, index) => (
              <div key={item.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600 truncate max-w-[210px]" title={item.name}>
                    {index + 1}. {item.name}
                  </span>
                  <span className="font-bold text-slate-900">{formatRupiah(item.value)} <span className="text-[10px] text-rose-600 font-normal font-sans">({item.percentage}%)</span></span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-rose-500 h-1.5 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-6 text-center italic">Belum ada uang keluar yang tercatat.</p>
        )}
      </div>
    </div>
  );
}
