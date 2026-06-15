/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { KeyRound, User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('ID Pengguna dan Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Simulate standard authenticating delay for premium tactile feedback
    setTimeout(() => {
      if (username.trim() === 'admin' && password === '@Scbjuara1') {
        onLoginSuccess();
      } else {
        setError('ID Admin atau Kata Sandi salah!');
        setIsLoading(false);
      }
    }, 850);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden"
      >
        {/* Subtle geometric background line */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Company Identity */}
        <div className="text-center space-y-3 mb-8">
          <div className="mx-auto w-14 h-14 bg-emerald-900 rounded-2xl flex items-center justify-center shadow-md shadow-emerald-950/10">
            <ShieldCheck className="h-7 w-7 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight font-sans">
              Cendekia Syariah
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Sistem Handover Kasir ke Bendahara
            </p>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Input Field */}
          <div>
            <label 
              htmlFor="username-field" 
              className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2"
            >
              ID Pengguna (Admin)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </span>
              <input
                id="username-field"
                type="text"
                autoComplete="off"
                placeholder="Masukkan ID Admin"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label 
                htmlFor="password-field" 
                className="block text-slate-500 text-xs font-semibold uppercase tracking-wider"
              >
                Kata Sandi
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password-field"
                type={showPassword ? 'text' : 'password'}
                placeholder="Masukkan Kata Sandi"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={isLoading}
                className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                disabled={isLoading}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Message Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2.5 text-xs text-rose-700"
            >
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="font-semibold">{error}</div>
            </motion.div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 outline-hidden font-bold text-white text-sm rounded-xl shadow-md shadow-emerald-950/10 hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyerahkan Kredensial...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5 text-emerald-200" />
                Masuk Sistem Amanah
              </span>
            )}
          </button>
        </form>

        {/* Security watermark footer */}
        <div className="text-center mt-6 pt-4 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
            Sistem Dokumen Inkripsi Lokal Browser
          </p>
        </div>
      </motion.div>
    </div>
  );
}
