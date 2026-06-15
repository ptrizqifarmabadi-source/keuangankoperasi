/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PeriodFilter } from '../types';
import { formatRupiah, formatFriendlyDate, isWithinCurrentWeek, exportToExcel } from '../utils';
import { Search, FileSpreadsheet, Trash2, SlidersHorizontal, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onResetToSample: () => void;
}

export function TransactionTable({ transactions, onDeleteTransaction, onResetToSample }: TransactionTableProps) {
  // Query & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & sort logic
  const filteredSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.category.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          (t.recordedBy && t.recordedBy.toLowerCase().includes(q))
      );
    }

    // 2. Type Filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // 3. Period Filter
    const todayStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    if (periodFilter === 'today') {
      result = result.filter((t) => t.date === todayStr);
    } else if (periodFilter === 'week') {
      result = result.filter((t) => isWithinCurrentWeek(t.date, now));
    } else if (periodFilter === 'month') {
      const currentYearMonth = todayStr.substring(0, 7); // "YYYY-MM"
      result = result.filter((t) => t.date.startsWith(currentYearMonth));
    } else if (periodFilter === 'year') {
      const currentYear = todayStr.substring(0, 4); // "YYYY"
      result = result.filter((t) => t.date.startsWith(currentYear));
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        // Primary sort: Date descending. Secondary sort: Timestamp descending
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.timestamp - a.timestamp;
      }
      if (sortBy === 'date-asc') {
        const dateCompare = a.date.localeCompare(b.date);
        return dateCompare !== 0 ? dateCompare : a.timestamp - b.timestamp;
      }
      if (sortBy === 'amount-desc') {
        return b.amount - a.amount;
      }
      if (sortBy === 'amount-asc') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, searchQuery, typeFilter, periodFilter, sortBy]);

  // Paginated transactions
  const totalPages = Math.ceil(filteredSortedTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSortedTransactions, currentPage]);

  // Adjust pagination page if records shrink
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleExport = () => {
    exportToExcel(filteredSortedTransactions, 'Laporan_Setoran_Kasir_Cendekia');
  };

  const confirmDelete = (id: string, description: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus catatan setoran: "${description}"?`)) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-emerald-900/5 border border-slate-100 p-6">
      {/* Header with action button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5.5 w-5.5 text-emerald-700" />
          <h3 className="font-bold text-lg text-slate-950 font-sans tracking-tight">Buku Serah Terima Setoran</h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reset to sample data if database gets empty */}
          {transactions.length === 0 && (
            <button
              onClick={onResetToSample}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin-reverse" />
              Gunakan Data Simulasi
            </button>
          )}

          <button
            onClick={handleExport}
            disabled={filteredSortedTransactions.length === 0}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              filteredSortedTransactions.length > 0
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-sm shadow-amber-500/10'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            Ekspor ke Excel (.csv)
          </button>
        </div>
      </div>

      {/* Control Rails / Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
        {/* Search */}
        <div className="relative lg:col-span-1">
          <label htmlFor="search-input" className="sr-only">Cari transaksi</label>
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="search-input"
            type="text"
            placeholder="Cari keterangan, kategori..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
          />
        </div>

        {/* Type selector */}
        <div>
          <label htmlFor="type-filter" className="sr-only">Jenis aliran harian</label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Jenis Aliran</option>
            <option value="masuk">Setoran Masuk (Kasir)</option>
            <option value="keluar">Kas Keluar (Bendahara)</option>
          </select>
        </div>

        {/* Period Selector */}
        <div>
          <label htmlFor="period-filter" className="sr-only">Rentang Periode</label>
          <select
            id="period-filter"
            value={periodFilter}
            onChange={(e) => {
              setPeriodFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">Semua Periode Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini (Sen - Min)</option>
            <option value="month">Siklus Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
        </div>

        {/* Sort selector */}
        <div>
          <label htmlFor="sort-by" className="sr-only">Urutkan berdasarkan</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="date-desc">Urut: Tanggal Terbaru</option>
            <option value="date-asc">Urut: Tanggal Terlama</option>
            <option value="amount-desc">Urut: Nominal Tertinggi</option>
            <option value="amount-asc">Urut: Nominal Terendah</option>
          </select>
        </div>
      </div>

      {/* Main Table Screen */}
      <div className="overflow-x-auto -mx-6 sm:mx-0">
        <table className="w-full min-w-[700px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl w-32">Tanggal</th>
              <th className="py-3 px-3 w-40">Jenis Aliran</th>
              <th className="py-3 px-3">Kategori</th>
              <th className="py-3 px-3">Keterangan Handover</th>
              <th className="py-3 px-3 text-right">Nominal</th>
              <th className="py-3 px-4 rounded-r-xl w-16 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((t) => (
                  <motion.tr
                    key={t.id}
                    layoutId={t.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3 px-4 font-mono font-medium text-slate-600">
                      {t.date}
                    </td>

                    {/* Flow Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          t.type === 'masuk'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-100'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${t.type === 'masuk' ? 'bg-emerald-600' : 'bg-rose-500'}`} />
                        {t.type === 'masuk' ? 'Setoran Masuk' : 'Kas Keluar'}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3 font-semibold text-slate-800 max-w-[150px] truncate">
                      {t.category}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium break-words leading-relaxed max-w-[280px]">
                        {t.description}
                      </div>
                      {t.recordedBy && (
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          Kasir: {t.recordedBy}
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className={`py-3 px-3 text-right font-bold text-sm ${
                      t.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {t.type === 'masuk' ? '+' : '-'} {formatRupiah(t.amount)}
                    </td>

                    {/* Action Block */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => confirmDelete(t.id, t.description)}
                        className="p-1 px-2 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertCircle className="h-8 w-8 text-amber-500 opacity-60" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">Tidak Ada Transaksi Setoran</p>
                        <p className="text-xs text-slate-400 max-w-[320px] mx-auto mt-1">
                          Silakan ganti filter pencarian atau buat setoran baru menggunakan formulir di sebelah kiri.
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredSortedTransactions.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
          <p className="text-slate-500 font-medium">
            Menampilkan <span className="font-semibold text-slate-800">{paginatedTransactions.length}</span> dari{' '}
            <span className="font-semibold text-slate-800">{filteredSortedTransactions.length}</span> catatan serah terima
          </p>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                currentPage === 1
                  ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Sebelumnya
            </button>
            
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg font-bold text-emerald-800">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                currentPage === totalPages
                  ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Berikutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
