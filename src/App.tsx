/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, SummaryStats } from './types';
import { getSampleTransactions, isWithinCurrentWeek } from './utils';
import { DashboardStats } from './components/DashboardStats';
import { TransactionForm } from './components/TransactionForm';
import { TransactionTable } from './components/TransactionTable';
import { VisualChart } from './components/VisualChart';
import { CsvImporter } from './components/CsvImporter';
import { Login } from './components/Login';
import { 
  Building, 
  Download, 
  Upload, 
  RefreshCw, 
  Database,
  Calendar,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Session & Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const token = localStorage.getItem('setoran_kasir_cendekia_auth_token');
    return token === 'admin' || token === 'kasir' || token === 'anggota';
  });

  const [userRole, setUserRole] = useState<'admin' | 'kasir' | 'anggota'>(() => {
    const token = localStorage.getItem('setoran_kasir_cendekia_auth_token');
    return (token === 'admin' || token === 'kasir' || token === 'anggota') ? token as 'admin' | 'kasir' | 'anggota' : 'admin';
  });

  const [cashierName, setCashierName] = useState<string>(() => {
    return localStorage.getItem('setoran_kasir_cendekia_cashier_name') || '';
  });

  const handleLoginSuccess = (role: 'admin' | 'kasir' | 'anggota', name: string) => {
    localStorage.setItem('setoran_kasir_cendekia_auth_token', role);
    localStorage.setItem('setoran_kasir_cendekia_cashier_name', name);
    setIsLoggedIn(true);
    setUserRole(role);
    setCashierName(name);
  };

  const handleLogout = () => {
    localStorage.removeItem('setoran_kasir_cendekia_auth_token');
    localStorage.removeItem('setoran_kasir_cendekia_cashier_name');
    setIsLoggedIn(false);
    setUserRole('admin');
    setCashierName('');
  };

  // User dashboard ganti sandi states for Anggota
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleMemberChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError('Mohon lengkapi seluruh kolom input sandi.');
      return;
    }

    // Retrieve customized passwords from localStorage
    const storedPasswordsJson = localStorage.getItem('setoran_kasir_cendekia_member_passwords');
    const passwordsObj = storedPasswordsJson ? JSON.parse(storedPasswordsJson) : {};
    const currentStoredPass = passwordsObj[cashierName] || '12345678';

    if (oldPassword !== currentStoredPass) {
      setPasswordError('Sandi lama yang Anda masukkan tidak sesuai.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Sandi baru harus terdiri dari minimal 8 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi sandi baru tidak cocok.');
      return;
    }

    // Update overrides in localStorage
    passwordsObj[cashierName] = newPassword;
    localStorage.setItem('setoran_kasir_cendekia_member_passwords', JSON.stringify(passwordsObj));

    setPasswordSuccess('Sandi Anda berhasil diperbarui secara aman!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Main transactions database state
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('setoran_kasir_cendekia_transactions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Robust cleanup of the exact requested transaction: '2026-05-31', sisa bulan juli
          return parsed.filter((t) => {
            const isMatch = 
              t.date === '2026-05-31' && 
              (t.description?.toLowerCase().includes('sisa bulan juli') || 
               t.description?.toLowerCase().includes('juli') ||
               t.amount === 307192);
            return !isMatch;
          });
        }
      }
    } catch (e) {
      console.error('Error loading transactions from localStorage:', e);
    }
    // Default fallback to beautiful sample transactions
    return getSampleTransactions();
  });

  // Keep localStorage in sync of all writes
  useEffect(() => {
    try {
      localStorage.setItem('setoran_kasir_cendekia_transactions_v2', JSON.stringify(transactions));
    } catch (e) {
      console.error('Error saving transactions to localStorage:', e);
    }
  }, [transactions]);

  // Real-time statistical engine for KAS UTAMA (Excluding employee/member shopping)
  const stats: SummaryStats = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    let weeklyIncome = 0;
    let weeklyExpense = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let todayIncome = 0;
    let todayExpense = 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentYearMonth = todayStr.substring(0, 7); // YYYY-MM
    const now = new Date();

    transactions.forEach((t) => {
      // Keuangan data belanja harian anggota tidak tergabung ke kas utama tapi berbeda buat sendiri!
      if (t.trxCategory === 'belanja_karyawan') {
        return;
      }

      if (t.type === 'masuk') {
        totalIncome += t.amount;
        if (isWithinCurrentWeek(t.date, now)) {
          weeklyIncome += t.amount;
        }
        if (t.date.startsWith(currentYearMonth)) {
          monthlyIncome += t.amount;
        }
        if (t.date === todayStr) {
          todayIncome += t.amount;
        }
      } else if (t.type === 'keluar') {
        totalExpense += t.amount;
        if (isWithinCurrentWeek(t.date, now)) {
          weeklyExpense += t.amount;
        }
        if (t.date.startsWith(currentYearMonth)) {
          monthlyExpense += t.amount;
        }
        if (t.date === todayStr) {
          todayExpense += t.amount;
        }
      }
    });

    const totalBalance = totalIncome - totalExpense;

    return {
      totalBalance,
      totalIncome,
      totalExpense,
      weeklyExpense,
      weeklyIncome,
      monthlyExpense,
      monthlyIncome,
      todayIncome,
      todayExpense,
    };
  }, [transactions]);

  // Real-time member shopping (SHU) statistical engine
  const employeeBelanjaStats = useMemo(() => {
    let totalSpent = 0;
    let transactionCount = 0;
    let todaySpent = 0;
    const activeNamesSet = new Set<string>();

    const todayStr = new Date().toISOString().split('T')[0];

    transactions.forEach((t) => {
      if (t.trxCategory === 'belanja_karyawan') {
        totalSpent += t.amount;
        transactionCount += 1;
        if (t.date === todayStr) {
          todaySpent += t.amount;
        }
        if (t.anggotaName) {
          activeNamesSet.add(t.anggotaName);
        }
      }
    });

    return {
      totalSpent,
      transactionCount,
      todaySpent,
      activeMembersCount: activeNamesSet.size
    };
  }, [transactions]);

  // Real-time personal member statistics engine (4 metrics calculation)
  const memberStats = useMemo(() => {
    if (userRole !== 'anggota' || !cashierName) {
      return { totalSpent: 0, todaySpent: 0, weekSpent: 0, trxCount: 0, memberName: '' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const memberTransactions = transactions.filter(
      (t) => t.trxCategory === 'belanja_karyawan' && t.anggotaName === cashierName
    );

    let totalSpent = 0;
    let todaySpent = 0;
    let weekSpent = 0;

    memberTransactions.forEach((t) => {
      totalSpent += t.amount;
      if (t.date === todayStr) {
        todaySpent += t.amount;
      }
      if (isWithinCurrentWeek(t.date, new Date())) {
        weekSpent += t.amount;
      }
    });

    return {
      totalSpent,
      todaySpent,
      weekSpent,
      trxCount: memberTransactions.length,
      memberName: cashierName
    };
  }, [transactions, userRole, cashierName]);

  // Command action helper: Add transaction
  const handleAddTransaction = (newTrx: Omit<Transaction, 'id' | 'timestamp'>) => {
    // Generate a beautiful human transaction ID
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const trxId = `TRX-${Date.now().toString().slice(-4)}${randomSuffix}`;

    const completedTrx: Transaction = {
      ...newTrx,
      id: trxId,
      timestamp: Date.now(),
    };

    setTransactions((prev) => [completedTrx, ...prev]);
  };

  // Helper action: Process and import parsed CSV records
  const handleImportCSV = (newTransactions: Transaction[], overwrite: boolean) => {
    if (overwrite) {
      setTransactions(newTransactions);
    } else {
      setTransactions((prev) => [...newTransactions, ...prev]);
    }
  };

  // Command action helper: Delete transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((item) => item.id !== id));
  };

  // Utility commands: Reset with sample simulator data
  const handleResetToSample = () => {
    setTransactions(getSampleTransactions());
  };

  // Backup Database to JSON file download
  const handleBackupJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().split('T')[0];
    link.download = `Backup_Database_Setoran_Kasir_Cendekia_${today}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore Database from JSON file upload
  const handleRestoreJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        
        if (Array.isArray(parsed)) {
          // Rudimentary shape check
          const isValid = parsed.every(t => t.id && t.date && t.amount && t.type && t.category);
          if (isValid) {
            if (window.confirm(`Yakin ingin mengimpor ${parsed.length} data setoran? Data Anda saat ini akan ditimpa.`)) {
              setTransactions(parsed);
              alert('Berhasil mengimpor database setoran kasir!');
            }
          } else {
            alert('File backup rusak atau tidak kompatibel dengan format setoran kasir.');
          }
        } else {
          alert('Format data database salah.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON backup.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input element
  };

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIDEBAR NAVIGATION SECTION */}
      <aside className="w-full lg:w-64 bg-emerald-900 text-white flex flex-col shrink-0 border-b lg:border-b-0 lg:border-r border-emerald-800">
        
        {/* Sidebar Header Block */}
        <div className="p-6 border-b border-emerald-800 flex items-center justify-between lg:block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center font-black text-emerald-900 text-xl shadow-xs">
              SK
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight font-sans text-slate-100">Setoran Kasir</h1>
              <p className="text-[10px] text-emerald-300 uppercase font-semibold tracking-wider">Kasir ke Bendahara</p>
            </div>
          </div>
          
          <span className="lg:hidden inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-950/40 text-[9px] uppercase font-mono tracking-widest text-emerald-300 rounded-full border border-emerald-800/40">
            Sistem Lokal Live
          </span>
        </div>
        
        {/* Sidebar Nav Items */}
        <nav className="flex-1 p-4 space-y-2 lg:space-y-1.5">
          <div className="bg-emerald-800/80 text-white px-4 py-3 rounded-xl flex items-center gap-3 border border-emerald-700/30">
            <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
              <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
            </svg>
            <span className="font-semibold text-sm">Dashboard Setoran</span>
          </div>

          <div className="text-emerald-200 hover:bg-emerald-800/40 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Mulai Handover</span>
          </div>

          <div className="text-emerald-200 hover:bg-emerald-800/40 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span>Arsip Buku Harian</span>
          </div>

          <div className="text-emerald-200 hover:bg-emerald-800/40 hover:text-white px-4 py-2.5 rounded-xl flex items-center gap-3 transition-colors text-xs font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Daftar Kasir / Shift</span>
          </div>
        </nav>

        {/* Active User Card & Roles Display */}
        <div className="p-6 border-t border-emerald-800 bg-emerald-950/20 space-y-3">
          <div className="bg-emerald-800/60 border border-emerald-700/20 rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-1 font-bold">Petugas Aktif</p>
            <p className="text-xs font-bold text-slate-100 truncate mb-1" title={userRole === 'admin' ? 'Administrator Utama' : cashierName}>
              {userRole === 'admin' ? 'Koperasi Cendekia' : cashierName}
            </p>
            {userRole === 'admin' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-[9px] font-bold text-emerald-300 rounded-md border border-emerald-500/20">
                <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" />
                Sesi Admin
              </span>
            ) : userRole === 'kasir' ? (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/20 text-[9px] font-extrabold text-amber-300 rounded-md border border-amber-500/25">
                <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
                Sesi Kasir
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-rose-500/20 text-[9px] font-extrabold text-rose-300 rounded-md border border-rose-500/25">
                <span className="h-1 w-1 rounded-full bg-rose-400 animate-pulse" />
                Sesi Anggota SHU
              </span>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-emerald-950/50 hover:bg-rose-900/60 text-emerald-200 hover:text-white border border-emerald-800 rounded-xl text-center text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            title="Keluar Sesi Rekap"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT CANVAS SECTION */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* MAIN MODULE HEADER */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-sans tracking-tight">
              {userRole === 'anggota' ? `Buku Sensus Belanja Koperasi • ${cashierName}` : 'Rekap Setoran Kasir ke Bendahara'}
            </h2>
            <p className="text-slate-400 text-xs font-medium">
              {userRole === 'anggota' 
                ? 'Mutasi pencatatan pembelanjaan pribadi harian Anda terkait akumulasi hak Sisa Hasil Usaha (SHU)' 
                : 'Pencatatan Handover Harian Kasir Utama ke Bendahara Koperasi'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            
            {/* Database backups */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={handleBackupJSON}
                className="px-3 py-1.5 text-xs text-slate-700 hover:text-emerald-800 hover:bg-white rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer"
                title="Unduh Cadangan"
              >
                <Download className="h-3.5 w-3.5 text-emerald-700" />
                <span>Backup</span>
              </button>

              <label 
                className="px-3 py-1.5 text-xs text-slate-700 hover:text-emerald-800 hover:bg-white rounded-lg transition-all flex items-center gap-1.5 font-bold cursor-pointer"
                title="Pulihkan Cadangan"
              >
                <Upload className="h-3.5 w-3.5 text-emerald-700" />
                <span>Restore</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestoreJSON}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </header>

        {/* INTERIOR SCROLLABLE CONTAINER AREA */}
        <div className="p-6 sm:p-8 flex-1 space-y-6">
          
          {/* STATS PREVIEW GRIDS */}
          <DashboardStats 
            stats={stats} 
            totalTransactionsCount={transactions.length} 
            userRole={userRole}
            employeeBelanjaStats={employeeBelanjaStats}
            memberStats={memberStats}
          />          {/* TWO COLUMN INTERACTION LAYER */}
          {userRole !== 'anggota' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* FORM WRAPPER COLUMN */}
              <div className="lg:col-span-1 space-y-6">
                <TransactionForm 
                  onAddTransaction={handleAddTransaction} 
                  userRole={userRole} 
                  cashierName={cashierName}
                />
                
                {userRole === 'admin' && <CsvImporter onImportSuccess={handleImportCSV} />}
                
                {/* Syariah Note info footer block */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3 text-slate-600">
                  <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-slate-800 mb-1">Serah Terima Kasir ke Bendahara</p>
                    <p>
                      Semua rekaman serah terima dana kasir harian langsung disimpan ke memori browser lokal. Gunakan tombol <strong>Backup</strong> di kanan atas untuk mengarsipkan buku ke komputer Anda secara berkala.
                    </p>
                  </div>
                </div>
              </div>

              {/* CHARTS GRAPH & DATA VISUALIZER COLUMN / SOP FOR CASHER */}
              {userRole === 'admin' ? (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base text-slate-800 font-sans tracking-tight">Penyebaran Setoran & Alokasi Kas</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Rekap visual kategori setoran masuk dan pengeluaran bendahara minggu ini</p>
                      </div>
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-[10px] font-bold text-emerald-800 rounded-lg border border-emerald-100">
                        <Layers className="h-3.5 w-3.5" />
                        Amanah & Presisi
                      </span>
                    </div>
                    <VisualChart transactions={transactions} />
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 rounded-2xl border border-amber-200 p-6 space-y-5 shadow-xs relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Building className="w-48 h-48 text-amber-900" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm sm:text-lg text-amber-950 font-sans tracking-tight">Standar Operasional (SOP) Pencatatan Kasir</h3>
                      <p className="text-amber-800 text-xs mt-1">Panduan amanah pencatatan Belanja Harian Karyawan & Anggota</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/50 leading-relaxed shadow-3xs">
                        <p className="font-bold text-amber-900 mb-1">1. Keakuratan Data SHU</p>
                        <p className="text-slate-600 font-medium">Setiap mencatat belanja harian, pastikan memilih nama Anggota yang melakukan pembelanjaan dengan benar. Data ini akan langsung diakumulasi untuk laporan Sisa Hasil Usaha (SHU) koperasi.</p>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/50 leading-relaxed shadow-3xs">
                        <p className="font-bold text-amber-900 mb-1">2. Bukti Fisik / Nota</p>
                        <p className="text-slate-600 font-medium">Unggah foto nota atau kwitansi fisik jika ada. Foto nota tidak wajib ada ketika menyimpan, namun sangat direkomendasikan untuk mempermudah proses audit oleh Bendahara Koperasi.</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/50 leading-relaxed shadow-3xs">
                        <p className="font-bold text-amber-900 mb-1">3. Buku Kas Berbeda</p>
                        <p className="text-slate-600 font-medium font-sans">Keuangan belanja harian anggota ini dipisahkan secara sistem dari kas utama (penyetoran harian kasir toko). Kasir Ikhwan & Akhwat berdiri di atas kas operasionalnya masing-masing.</p>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-4 rounded-xl border border-amber-200/50 leading-relaxed shadow-3xs">
                        <p className="font-bold text-amber-900 mb-1">4. Verifikasi & Audit</p>
                        <p className="text-slate-600 font-medium">Admin/Bendahara Utama secara berkala akan mendownload rekap sensus belanja anggota ini untuk diverifikasi silang dengan ketersediaan barang di brankas utama.</p>
                      </div>
                    </div>

                    <div className="bg-amber-950 text-amber-100 p-4 rounded-xl text-[11px] leading-relaxed font-semibold">
                      <span className="font-extrabold uppercase mr-1.5 text-amber-400">Pesan Syariah:</span>
                      "Wahai orang-orang yang beriman, penuhilah janji-janji (akad-akad) itu..." (QS. Al-Ma'idah: 1). Jalankan tugas pencatatan secara amanah, jujur, transparan, dan penuh ketelitian demi kemaslahatan bersama.
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* ANGGOTA EXCLUSIVE PROFILE & INTERACTIVE GANTI SANDI FORM */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
              {/* Profile card & information */}
              <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs relative overflow-hidden">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-[10px] uppercase text-slate-400 tracking-wider">Profil Anggota Koperasi</h3>
                    <p className="text-xl font-black text-slate-800 mt-1">{cashierName}</p>
                    <span className="inline-flex mt-1.5 px-2 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-md text-[9px] font-black uppercase tracking-wide">
                      Mutasi Terverifikasi
                    </span>
                  </div>

                  <div className="border-t border-slate-100 pt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-medium">No. Identitas / ID:</span>
                      <span className="font-extrabold text-slate-705">12345678</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-medium">Status Hak SHU:</span>
                      <span className="font-extrabold text-emerald-700">Aktif Berjalan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 font-medium">Buku Kas Belanja:</span>
                      <span className="font-extrabold text-slate-705">Belanja Anggota</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[11px] leading-relaxed font-semibold text-slate-500">
                  <span className="text-emerald-800 font-bold uppercase block mb-1">Catatan Keanggotaan</span>
                  Tampilan data di bawah murni bersifat <strong className="text-emerald-800">Lihat Saja (Read-Only)</strong>. Mutasi belanja diisi oleh petugas kasir Ikhwan / Akhwat di kasir harian koperasi. Hubungi pengelola koperasi jika ada ketidaksesuaian data.
                </div>
              </div>

              {/* Password update widget */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs relative">
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-800 font-sans tracking-tight">Ganti Sandi Akun Anggota</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Amankan sesi login anggota Anda dengan memperbarui sandi default Anda</p>
                </div>

                <form onSubmit={handleMemberChangePassword} className="mt-5 space-y-4 max-w-md">
                  {passwordError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold rounded-xl">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold rounded-xl">
                      {passwordSuccess}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Sandi Lama Sekarang</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => {
                          setOldPassword(e.target.value);
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        placeholder="contoh: 12345678"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider block">Sandi Baru (Min 8 Karakter)</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError('');
                          setPasswordSuccess('');
                        }}
                        placeholder="Sandi baru"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-405 uppercase tracking-wider block">Konfirmasi Sandi Baru</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError('');
                        setPasswordSuccess('');
                      }}
                      placeholder="Ulangi sandi baru"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-3xs"
                  >
                    Simpan Perubahan Sandi
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TABULAR BOOKS OF LEDGER */}
          <TransactionTable 
            transactions={transactions} 
            onDeleteTransaction={handleDeleteTransaction}
            onResetToSample={handleResetToSample}
            userRole={userRole}
            cashierName={cashierName}
          />

        </div>

        {/* POLISHED LOWER SYSTEM FOOTER */}
        <footer className="bg-white border-t border-slate-200 px-8 py-4 flex flex-col sm:flex-row justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest gap-2">
          <div className="flex gap-6">
            <span>Status Petugas: Aktif</span>
            <span>Database: Terenkripsi Lokal Browser</span>
          </div>
          <div>
            &copy; 2026 Cendekia Syariah Handover Management System
          </div>
        </footer>

      </main>
    </div>
  );
}
