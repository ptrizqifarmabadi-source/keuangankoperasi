/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'masuk' | 'keluar';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  recordedBy?: string;
  timestamp: number;
}

export type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface SummaryStats {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  weeklyExpense: number; // current week's total expenses
  weeklyIncome: number; // current week's total income
  monthlyExpense: number;
  monthlyIncome: number;
}

export const INCOME_CATEGORIES = [
  'Setoran Shift Pagi',
  'Setoran Shift Sore',
  'Setoran Kasir Toko / Kantin',
  'Setoran Kasir Utama',
  'Titipan ZISWAF Kasir',
  'Koreksi Selisih Lebih Kasir',
  'Lain-lain (Setoran Masuk)'
];

export const EXPENSE_CATEGORIES = [
  'Penyerahan ke Bank / Brankas Utama',
  'Koreksi Selisih Kurang Kasir',
  'Pengembalian Modal Awal Shift',
  'Biaya Operasional Handover',
  'Penyaluran Dana Sosial Kasir',
  'Lain-lain (Uang Keluar)'
];
