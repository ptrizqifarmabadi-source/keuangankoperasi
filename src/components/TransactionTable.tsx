/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, PeriodFilter, MEMBER_LIST } from '../types';
import { formatRupiah, formatFriendlyDate, isWithinCurrentWeek, exportToExcel } from '../utils';
import { 
  Search, 
  FileSpreadsheet, 
  Trash2, 
  BookOpen, 
  AlertCircle, 
  RefreshCw, 
  Camera, 
  X, 
  Eye, 
  ShoppingBag, 
  Layers, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onResetToSample: () => void;
  userRole: 'admin' | 'kasir' | 'anggota';
  cashierName?: string;
}

export function TransactionTable({ 
  transactions, 
  onDeleteTransaction, 
  onResetToSample,
  userRole,
  cashierName = ''
}: TransactionTableProps) {
  // Query & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryTab, setCategoryTab] = useState<'all' | 'setoran' | 'belanja_karyawan'>(
    userRole === 'kasir' || userRole === 'anggota' ? 'belanja_karyawan' : 'all'
  );
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  
  // Photo modal viewer state
  const [activePhotoTrx, setActivePhotoTrx] = useState<Transaction | null>(null);

  const [activeViewTab, setActiveViewTab] = useState<'records' | 'shu'>('records');

  // Compute live SHU statistics per member representing their separate harian bookkeeping
  const memberSHUStats = useMemo(() => {
    const statsMap: Record<string, { totalAmount: number; trxCount: number }> = {};
    
    // Initialize all existing members
    MEMBER_LIST.forEach((name) => {
      statsMap[name] = { totalAmount: 0, trxCount: 0 };
    });

    // Populate actual records
    transactions.forEach((t) => {
      if (t.trxCategory === 'belanja_karyawan' && t.anggotaName) {
        if (!statsMap[t.anggotaName]) {
          statsMap[t.anggotaName] = { totalAmount: 0, trxCount: 0 };
        }
        statsMap[t.anggotaName].totalAmount += t.amount;
        statsMap[t.anggotaName].trxCount += 1;
      }
    });

    // Convert map to view array
    let list = Object.entries(statsMap).map(([name, stat]) => ({
      name,
      totalAmount: stat.totalAmount,
      trxCount: stat.trxCount,
    }));

    if (activeViewTab === 'shu' && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q));
    }

    // Sort by total belanja descending so top shopper shows first
    list.sort((a, b) => b.totalAmount - a.totalAmount);

    return list;
  }, [transactions, activeViewTab, searchQuery]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter & sort logic
  const filteredSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Role / Tab Filter
    if (userRole === 'kasir') {
      // Kasir is locked to ONLY viewing/editing employee shopping
      result = result.filter((t) => t.trxCategory === 'belanja_karyawan');
    } else {
      // Admin filter based on current tab selector
      if (categoryTab === 'setoran') {
        result = result.filter((t) => !t.trxCategory || t.trxCategory === 'setoran');
      } else if (categoryTab === 'belanja_karyawan') {
        result = result.filter((t) => t.trxCategory === 'belanja_karyawan');
      }
    }

    // 2. Search Query
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

    // 3. Type Filter (Only meaningful if showing setoran or all)
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // 4. Period Filter
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

    // 5. Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
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
  }, [transactions, searchQuery, typeFilter, categoryTab, periodFilter, sortBy, userRole]);

  // Paginated elements depending on Active View Tab
  const totalPages = useMemo(() => {
    const listLength = activeViewTab === 'records' 
      ? filteredSortedTransactions.length 
      : memberSHUStats.length;
    return Math.ceil(listLength / itemsPerPage) || 1;
  }, [activeViewTab, filteredSortedTransactions, memberSHUStats]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSortedTransactions, currentPage]);

  const paginatedMembers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return memberSHUStats.slice(startIndex, startIndex + itemsPerPage);
  }, [memberSHUStats, currentPage]);

  // Adjust pagination page if records shrink
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const handleExport = () => {
    if (activeViewTab === 'shu') {
      handleExportSHUPriority();
    } else {
      exportToExcel(filteredSortedTransactions, `Laporan_${userRole === 'kasir' ? 'Belanja' : 'Keuangan'}_Cendekia`);
    }
  };

  const handleExportSHUPriority = () => {
    // Generate and download a clean Excel-compatible CSV file with BOM
    const BOM = '\uFEFF';
    const headers = [
      'No',
      'Nama Anggota',
      'Total Belanja (IDR)',
      'Frekuensi Belanja (Sesi Transaksi)',
      'Status Keaktifan'
    ];

    const rows = memberSHUStats.map((item, index) => [
      index + 1,
      item.name,
      item.totalAmount,
      item.trxCount,
      item.totalAmount > 1000000 ? 'Sangat Aktif' : item.totalAmount > 0 ? 'Aktif' : 'Belum Ada Belanja'
    ]);

    const csvContent = [
      'sep=,',
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Rekap_SHU_Belanja_Anggota_Cendekia_${today}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = (id: string, description: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus catatan ini: "${description}"?`)) {
      onDeleteTransaction(id);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md border p-6 transition-all duration-300 ${
      userRole === 'kasir' ? 'border-amber-200 shadow-amber-900/5' : 'border-slate-100 shadow-emerald-900/5'
    }`}>
      {/* Table Header block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {userRole === 'kasir' ? (
            <ShoppingBag className="h-5.5 w-5.5 text-amber-500" />
          ) : (
            <BookOpen className="h-5.5 w-5.5 text-emerald-700" />
          )}
          <h3 className="font-bold text-lg text-slate-950 font-sans tracking-tight">
            {userRole === 'kasir' ? 'Buku Belanja Karyawan & Anggota' : 'Buku Rekap & Seluruh Transaksi'}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reset button only for Admin if empty */}
          {userRole === 'admin' && transactions.length === 0 && (
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
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filteredSortedTransactions.length > 0
                ? userRole === 'kasir'
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs'
                  : 'bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-xs shadow-amber-500/10'
                : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Ekspor ke Excel (.csv)</span>
          </button>
        </div>
      </div>

      {/* Admin Central Tabs Segment */}
      {userRole === 'admin' && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => {
              setCategoryTab('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              categoryTab === 'all'
                ? 'bg-emerald-800 border-emerald-800 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Semua Data Buku Besar
          </button>
          <button
            onClick={() => {
              setCategoryTab('setoran');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              categoryTab === 'setoran'
                ? 'bg-emerald-800 border-emerald-800 text-white'
                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            Buku Setoran Kasir (Arsip Setor)
          </button>
          <button
            onClick={() => {
              setCategoryTab('belanja_karyawan');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
              categoryTab === 'belanja_karyawan'
                ? 'bg-amber-600 border-amber-600 text-white'
                : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            Buku Belanja Karyawan & Anggota
          </button>
        </div>
      )}

      {/* Interactive Mode Toggles representing target SHU vs General Ledger */}
      {userRole !== 'anggota' && (
        <div className="flex border-b border-slate-100 mb-6 font-sans">
          <button
            type="button"
            onClick={() => {
              setActiveViewTab('records');
              setCurrentPage(1);
            }}
            className={`py-2.5 px-5 -mb-px text-xs font-bold transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider border-b-2 ${
              activeViewTab === 'records'
                ? 'border-emerald-700 text-emerald-800 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Buku Jurnal Pencatatan</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveViewTab('shu');
              setCurrentPage(1);
            }}
            className={`py-2.5 px-5 -mb-px text-xs font-bold transition-all cursor-pointer flex items-center gap-2 uppercase tracking-wider border-b-2 ${
              activeViewTab === 'shu'
                ? 'border-amber-600 text-amber-600 font-extrabold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span>Sensus Belanja SHU ({MEMBER_LIST.length} Anggota)</span>
          </button>
        </div>
      )}

      {/* Control Rails / Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200/50">
        {/* Search Input bar */}
        <div className="relative">
          <label htmlFor="search-input" className="sr-only">Cari transaksi</label>
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="search-input"
            type="text"
            placeholder="Cari keterangan, staf..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-all font-medium"
          />
        </div>

        {/* Type selector (Only shown for Admin, and relevant if she isn't forced to expenses) */}
        <div>
          <label htmlFor="type-filter" className="sr-only">Jenis aliran harian</label>
          <select
            id="type-filter"
            value={typeFilter}
            disabled={userRole === 'kasir' || categoryTab === 'belanja_karyawan'}
            onChange={(e) => {
              setTypeFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed font-medium"
          >
            <option value="all">Semua Aliran (Masuk/Keluar)</option>
            <option value="masuk">Uang Masuk (Setoran)</option>
            <option value="keluar">Uang Keluar (Kas/Belanja)</option>
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
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden cursor-pointer font-medium"
          >
            <option value="all">Semua Waktu Rekap</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Berjalan (Sen - Min)</option>
            <option value="month">Format Bulan Berjalan</option>
            <option value="year">Format Tahun Berjalan</option>
          </select>
        </div>

        {/* Sort selector */}
        <div>
          <label htmlFor="sort-by" className="sr-only">Urutkan berdasarkan</label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden cursor-pointer font-medium"
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
            {activeViewTab === 'records' ? (
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50">
                <th className="py-3 px-4 rounded-l-xl w-28">Tanggal</th>
                <th className="py-3 px-3 w-32">Kategori Buku</th>
                <th className="py-3 px-3">Kategori & Bukti</th>
                <th className="py-3 px-3">Deskripsi / Detail Handover</th>
                <th className="py-3 px-3 text-right font-bold">Nominal</th>
                {userRole !== 'anggota' && <th className="py-3 px-4 rounded-r-xl w-16 text-center">Aksi</th>}
              </tr>
            ) : (
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider bg-slate-100/50">
                <th className="py-3 px-4 rounded-l-xl w-16">No</th>
                <th className="py-3 px-3">Nama Lengkap Anggota</th>
                <th className="py-3 px-3">Status Partisipasi</th>
                <th className="py-3 px-3">Frekuensi Belanja</th>
                <th className="py-3 px-3 text-right font-bold">Total Akumulasi Belanja</th>
                {userRole !== 'anggota' && <th className="py-3 px-4 rounded-r-xl w-16 text-center">Aksi</th>}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            <AnimatePresence mode="popLayout">
              {activeViewTab === 'records' ? (
                paginatedTransactions.length > 0 ? (
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
                      <td className="py-3 px-4 font-mono font-bold text-slate-600">
                        {t.date}
                      </td>

                      {/* Book Category Badge */}
                      <td className="py-3 px-3">
                        {t.trxCategory === 'belanja_karyawan' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                            Belanja Anggota
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[9px] font-extrabold uppercase tracking-wide">
                            Setor Kasir
                          </span>
                        )}
                      </td>

                      {/* Category Detail & Photo Thumbnail Trigger */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800">{t.category}</span>
                          
                          {/* Optional photo layout badge */}
                          {t.photo && (
                            <button
                              type="button"
                              onClick={() => setActivePhotoTrx(t)}
                              className="p-1 rounded-md bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-150 inline-flex items-center gap-0.5 cursor-pointer text-[9px] font-bold"
                              title="Tampilkan Nota Fisik"
                            >
                              <Camera className="h-3 w-3" />
                              <span>Nota</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Description & metadata */}
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium break-words leading-relaxed max-w-[280px]">
                          {t.description}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-1 items-center">
                          {t.recordedBy && (
                            <span className="text-[9px] text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm">
                              Kasir: <span className="font-bold text-slate-500">{t.recordedBy}</span>
                            </span>
                          )}
                          {t.anggotaName && (
                            <span className="text-[9px] text-amber-850 font-bold bg-amber-100/60 border border-amber-200 px-1.5 py-0.5 rounded-sm">
                              Anggota SHU: <span className="font-extrabold text-amber-950">{t.anggotaName}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Amount formatted */}
                      <td className={`py-3 px-3 text-right font-black text-xs ${
                        t.type === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {t.type === 'masuk' ? '+' : '-'} {formatRupiah(t.amount)}
                      </td>

                      {/* Actions panel */}
                      {userRole !== 'anggota' && (
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => confirmDelete(t.id, t.description)}
                            disabled={userRole === 'kasir' && t.recordedBy !== cashierName && cashierName !== ''}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-all cursor-pointer inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                            title={userRole === 'kasir' && t.recordedBy !== cashierName ? "Hanya bisa menghapus inputan Anda sendiri" : "Hapus Catatan"}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-7 w-7 text-amber-500 opacity-60" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs">Pencarian / Buku Buku Kosong</p>
                          <p className="text-[11px] text-slate-400 max-w-[320px] mx-auto mt-0.5">
                            {userRole === 'kasir' 
                              ? 'Belum ada input belanja harian karyawan hari ini. Silakan input menggunakan form di kiri.'
                              : 'Silakan ganti tab kategori buku atau rentang periode filter di atas.'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ) : (
                paginatedMembers.length > 0 ? (
                  paginatedMembers.map((m, index) => (
                    <tr key={m.name} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100">
                      {/* No */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-500">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      {/* Anggota Name */}
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 text-xs">{m.name}</span>
                      </td>

                      {/* Partisipasi Badge */}
                      <td className="py-3 px-3">
                        {m.totalAmount > 1000000 ? (
                          <span className="inline-flex px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[9px] font-black uppercase tracking-wide">
                            Sangat Aktif
                          </span>
                        ) : m.totalAmount > 0 ? (
                          <span className="inline-flex px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[9px] font-black uppercase tracking-wide">
                            Aktif Belanja
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-md text-[9px] font-bold uppercase tracking-wide">
                            Belum Ada SHU
                          </span>
                        )}
                      </td>

                      {/* Sesi count */}
                      <td className="py-3 px-3 font-semibold text-slate-600">
                        {m.trxCount} Sesi Transaksi
                      </td>

                      {/* Total accumulated */}
                      <td className="py-3 px-3 text-right font-black text-amber-700 text-xs">
                        {formatRupiah(m.totalAmount)}
                      </td>

                      {/* Empty action column */}
                      {userRole !== 'anggota' && (
                        <td className="py-3 px-4 text-center text-slate-300">
                          -
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <AlertCircle className="h-7 w-7 text-amber-500 opacity-60" />
                        <div>
                          <p className="font-bold text-slate-800 text-xs font-sans">Nama Anggota Tidak Ditemukan</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Coba periksa kata kunci pencarian nama anggota Anda.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination indicators under */}
      {(activeViewTab === 'records' ? filteredSortedTransactions.length : memberSHUStats.length) > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs">
          <p className="text-slate-500 font-medium">
            Menampilkan <span className="font-semibold text-slate-800">
              {activeViewTab === 'records' ? paginatedTransactions.length : paginatedMembers.length}
            </span> dari{' '}
            <span className="font-semibold text-slate-800">
              {activeViewTab === 'records' ? filteredSortedTransactions.length : memberSHUStats.length}
            </span> {activeViewTab === 'records' ? 'catatan' : 'anggota'}
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
            
            <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800">
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

      {/* 5. INTERACTIVE FULLSCREEN PHOTO VIEWER MODAL */}
      <AnimatePresence>
        {activePhotoTrx && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-55 flex items-center justify-center p-4"
            onClick={() => setActivePhotoTrx(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header with close button */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <span className="text-[9px] bg-sky-100 text-sky-800 font-extrabold uppercase px-2 py-0.5 rounded-md border border-sky-200">
                    ID: {activePhotoTrx.id}
                  </span>
                  <h4 className="font-extrabold text-sm text-slate-800 font-sans mt-1">Audit Bukti Fisik / Nota</h4>
                </div>
                
                <button
                  type="button"
                  onClick={() => setActivePhotoTrx(null)}
                  className="p-1 px-2 rounded-lg bg-white border border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Photo Area */}
              <div className="p-5 flex flex-col items-center bg-slate-900 border-b border-slate-100">
                <img
                  src={activePhotoTrx.photo}
                  alt="Audit Receipt"
                  className="max-h-[350px] w-auto object-contain rounded-xl border border-slate-800 bg-black shadow-lg"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Meta details footer inside modal */}
              <div className="p-5 space-y-3 font-sans">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Tanggal Transaksi:</span>
                    <p className="font-bold text-slate-700">{activePhotoTrx.date}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-medium">Penginput / Kasir:</span>
                    <p className="font-bold text-slate-700">{activePhotoTrx.recordedBy || 'Tidak tercatat'}</p>
                  </div>
                </div>

                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Keterangan Handover / Belanja:</span>
                  <p className="font-medium text-slate-700 mt-0.5 text-xs inline-block bg-slate-50 p-2.5 rounded-lg border border-slate-100 w-full">
                    {activePhotoTrx.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-500 uppercase">Nilai Audit:</span>
                  <span className={`text-base font-black ${
                    activePhotoTrx.type === 'masuk' ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {activePhotoTrx.type === 'masuk' ? '+' : '-'} {formatRupiah(activePhotoTrx.amount)}
                  </span>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
