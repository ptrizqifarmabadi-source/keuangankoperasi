/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle, 
  ShoppingBag, 
  ArrowLeft, 
  ChevronRight,
  ClipboardList,
  Users
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (role: 'admin' | 'kasir', cashierName: string) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'portal' | 'admin_login' | 'kasir_ikhwan_login' | 'kasir_akhwat_login'>('portal');
  
  // Form states
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  
  const [cashierId, setCashierId] = useState('');
  const [cashierPassword, setCashierPassword] = useState('');
  const [cashierNameInput, setCashierNameInput] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showCashierPassword, setShowCashierPassword] = useState(false);
  
  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!adminPassword) {
      setError('Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (adminUsername.trim() === 'admin' && adminPassword === '@Scbjuara1') {
        setIsLoading(false);
        onLoginSuccess('admin', 'Administrator Utama');
      } else {
        setError('ID Admin atau Kata Sandi salah!');
        setIsLoading(false);
      }
    }, 800);
  };

  const handleKasirSubmit = (e: React.FormEvent, type: 'ikhwan' | 'akhwat') => {
    e.preventDefault();
    setError(null);

    const name = cashierNameInput.trim();
    if (!name) {
      setError('Nama Petugas Kasir wajib diisi demi transparansi SHU.');
      return;
    }

    if (!cashierPassword) {
      setError('Kata Sandi Kasir wajib diisi.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const expectedId = type === 'ikhwan' ? 'kasir_ikhwan' : 'kasir_akhwat';
      const expectedPassword = type === 'ikhwan' ? '@IkhwanCendekia' : '@AkhwatCendekia';

      if (cashierId.trim() !== expectedId) {
        setError(`ID Kasir salah! Gunakan: ${expectedId}`);
        setIsLoading(false);
        return;
      }

      if (cashierPassword !== expectedPassword) {
        setError('Kata Sandi Kasir salah!');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      const genderDisplay = type === 'ikhwan' ? 'Ikhwan' : 'Akhwat';
      onLoginSuccess('kasir', `${name} (${genderDisplay})`);
    }, 700);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <motion.div
        layout
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden"
      >
        {/* Decorative background visual elements */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-8 relative">
          <div className="mx-auto w-14 h-14 bg-emerald-950 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-950/20">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Cendekia Syariah
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Buku Handover Setoran & Belanja SHU
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* 1. PORTAL LEVEL - SELECT ROLE */}
          {mode === 'portal' && (
            <motion.div
              key="portal"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 15 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <p className="text-stone-500 text-xs font-bold uppercase tracking-wider mb-2 text-center">
                Pilih Sesi Akses Anda:
              </p>

              <div className="space-y-3">
                {/* ADMIN CARD BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('admin_login');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/20 transition-all flex items-start gap-4 cursor-pointer group animate-fade-in"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <KeyRound className="h-5 w-5 text-emerald-800 group-hover:text-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-emerald-950 transition-colors">Sesi Admin Utama</p>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Akses rekap setoran kasir, kelola buku besar kas utama, dan ekspor data finansial.
                    </p>
                  </div>
                </button>

                {/* KASIR IKHWAN CARD BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCashierId('kasir_ikhwan');
                    setCashierPassword('');
                    setCashierNameInput('');
                    setMode('kasir_ikhwan_login');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/20 transition-all flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Users className="h-5 w-5 text-amber-800 group-hover:text-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-amber-950 transition-colors">Sesi Kasir Ikhwan (Putra)</p>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pencatatan data belanja harian anggota SHU khusus untuk petugas Ikhwan.
                    </p>
                  </div>
                </button>

                {/* KASIR AKHWAT CARD BUTTON */}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setCashierId('kasir_akhwat');
                    setCashierPassword('');
                    setCashierNameInput('');
                    setMode('kasir_akhwat_login');
                  }}
                  className="w-full text-left p-4 rounded-2xl bg-white border border-slate-200 hover:border-sky-500 hover:bg-sky-50/20 transition-all flex items-start gap-4 cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Users className="h-5 w-5 text-sky-800 group-hover:text-white" />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-800 group-hover:text-sky-950 transition-colors">Sesi Kasir Akhwat (Putri)</p>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Pencatatan data belanja harian anggota SHU khusus untuk petugas Akhwat.
                    </p>
                  </div>
                </button>
              </div>

              {/* Informational Footer */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Buku belanja anggota SHU dan brankas utama dipisah secara syirkah amanah.
                </p>
              </div>
            </motion.div>
          )}

          {/* 2. ADMIN FORM */}
          {mode === 'admin_login' && (
            <motion.div
              key="admin_form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setMode('portal')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </button>

              <div className="mb-4">
                <h3 className="text-base font-bold text-slate-800">Masuk Sesi Admin</h3>
                <p className="text-xs text-slate-400">Gunakan id admin koperasi untuk melihat total brankas utama</p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label htmlFor="admin-id" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Nama Akun (Admin)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="admin-id"
                      type="text"
                      disabled
                      value={adminUsername}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="admin-pw" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="admin-pw"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan Kata Sandi"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        setError(null);
                      }}
                      disabled={isLoading}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>Memverifikasi...</span>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 text-emerald-200" />
                      <span>Masuk Sesi Admin</span>
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* 3. KASIR IKHWAN FORM */}
          {mode === 'kasir_ikhwan_login' && (
            <motion.div
              key="ikhwan_form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setMode('portal')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </button>

              <div className="mb-4">
                <h3 className="text-base font-bold text-amber-800 flex items-center gap-1">
                  <span>Masuk Sesi Kasir Ikhwan</span>
                </h3>
                <p className="text-xs text-slate-400">Gunakan ID dan Kata Sandi khas Ikhwan untuk menyalurkan belanja SHU</p>
              </div>

              <form onSubmit={(e) => handleKasirSubmit(e, 'ikhwan')} className="space-y-4">
                <div>
                  <label htmlFor="ik-id" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    ID Kasir Ikhwan
                  </label>
                  <input
                    id="ik-id"
                    type="text"
                    value={cashierId}
                    onChange={(e) => setCashierId(e.target.value)}
                    placeholder="kasir_ikhwan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="ik-pw" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Kata Sandi Ikhwan
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="ik-pw"
                      type={showCashierPassword ? 'text' : 'password'}
                      placeholder="Masukkan Kata Sandi Ikhwan"
                      value={cashierPassword}
                      onChange={(e) => {
                        setCashierPassword(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCashierPassword(!showCashierPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCashierPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 italic mt-1 block">Sandi standar: @IkhwanCendekia</span>
                </div>

                <div>
                  <label htmlFor="ik-name" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Nama Petugas (Ikhwan)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="ik-name"
                      type="text"
                      placeholder="Contoh: Abdul Kodir, Ahmad Kamal"
                      value={cashierNameInput}
                      onChange={(e) => {
                        setCashierNameInput(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? <span>Menghubungkan Sesi...</span> : <span>Masuk Sesi Ikhwan</span>}
                </button>
              </form>
            </motion.div>
          )}

          {/* 4. KASIR AKHWAT FORM */}
          {mode === 'kasir_akhwat_login' && (
            <motion.div
              key="akhwat_form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => setMode('portal')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-800 mb-6 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Kembali
              </button>

              <div className="mb-4">
                <h3 className="text-base font-bold text-sky-800 flex items-center gap-1">
                  <span>Masuk Sesi Kasir Akhwat</span>
                </h3>
                <p className="text-xs text-slate-400">Gunakan ID dan Kata Sandi khas Akhwat untuk menyalurkan belanja SHU</p>
              </div>

              <form onSubmit={(e) => handleKasirSubmit(e, 'akhwat')} className="space-y-4">
                <div>
                  <label htmlFor="ak-id" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    ID Kasir Akhwat
                  </label>
                  <input
                    id="ak-id"
                    type="text"
                    value={cashierId}
                    onChange={(e) => setCashierId(e.target.value)}
                    placeholder="kasir_akhwat"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label htmlFor="ak-pw" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Kata Sandi Akhwat
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      id="ak-pw"
                      type={showCashierPassword ? 'text' : 'password'}
                      placeholder="Masukkan Kata Sandi Akhwat"
                      value={cashierPassword}
                      onChange={(e) => {
                        setCashierPassword(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCashierPassword(!showCashierPassword)}
                      tabIndex={-1}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCashierPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[9px] text-slate-400 italic mt-1 block">Sandi standar: @AkhwatCendekia</span>
                </div>

                <div>
                  <label htmlFor="ak-name" className="block text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                    Nama Petugas (Akhwat)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      id="ak-name"
                      type="text"
                      placeholder="Contoh: Ayu Chairunnisa, Dina Mutia"
                      value={cashierNameInput}
                      onChange={(e) => {
                        setCashierNameInput(e.target.value);
                        setError(null);
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-sky-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500 transition-all font-semibold"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                    <span className="font-semibold">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isLoading ? <span>Menghubungkan Sesi...</span> : <span>Masuk Sesi Akhwat</span>}
                </button>
              </form>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Security watermark footer */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Sistem Dokumen Inkripsi Lokal Browser • Cendekia Syariah
          </p>
        </div>
      </motion.div>
    </div>
  );
}
