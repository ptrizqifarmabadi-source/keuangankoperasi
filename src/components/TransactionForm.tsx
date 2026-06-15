/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Transaction, 
  TransactionType, 
  TransactionCategory, 
  INCOME_CATEGORIES, 
  EXPENSE_CATEGORIES, 
  BELANJA_CATEGORIES,
  MEMBER_LIST
} from '../types';
import { formatRupiah } from '../utils';
import { 
  PlusCircle, 
  ArrowDown, 
  ArrowUp, 
  Calendar, 
  User, 
  FileText, 
  Sparkles, 
  Camera, 
  X, 
  ShoppingBag, 
  ClipboardList 
} from 'lucide-react';
import { motion } from 'motion/react';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'timestamp'>) => void;
  userRole: 'admin' | 'kasir';
  cashierName: string;
}

export function TransactionForm({ onAddTransaction, userRole, cashierName }: TransactionFormProps) {
  // Category tab for Admins ('setoran' or 'belanja_karyawan')
  // Kasir is locked to 'belanja_karyawan'
  const [trxCategory, setTrxCategory] = useState<TransactionCategory>(
    userRole === 'kasir' ? 'belanja_karyawan' : 'setoran'
  );

  // Sync state if userRole changes
  useEffect(() => {
    setTrxCategory(userRole === 'kasir' ? 'belanja_karyawan' : 'setoran');
  }, [userRole]);

  // Input states
  const [type, setType] = useState<TransactionType>('masuk');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [recordedBy, setRecordedBy] = useState<string>('');
  const [anggotaName, setAnggotaName] = useState<string>('');
  
  // Photo local state
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom states for usability
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Force certain states based on selected trxCategory & role
  useEffect(() => {
    if (userRole === 'kasir' || trxCategory === 'belanja_karyawan') {
      setType('keluar'); // Belanja (shopping/expenses) is always a cash outflow!
      setCategory(BELANJA_CATEGORIES[0]);
    } else {
      // Admin choosing setoran harian
      setType('masuk');
      setCategory(INCOME_CATEGORIES[0]);
    }
  }, [trxCategory, userRole]);

  // Match category options when type shifts (for normal setoran harian)
  useEffect(() => {
    if (trxCategory === 'setoran') {
      if (type === 'masuk') {
        setCategory(INCOME_CATEGORIES[0]);
      } else {
        setCategory(EXPENSE_CATEGORIES[0]);
      }
    }
  }, [type, trxCategory]);

  // Handle Photo selection & base64 conversion
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar (maksimal 2MB untuk optimisasi memori).');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setPhoto(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Mohon masukkan jumlah uang yang valid (lebih dari 0).');
      return;
    }

    if (!category) {
      alert('Mohon pilih kategori.');
      return;
    }

    if (trxCategory === 'belanja_karyawan' && !anggotaName) {
      alert('Mohon pilih Anggota Penerima Belanja untuk data rekap SHU harian.');
      return;
    }

    if (!description.trim()) {
      alert('Mohon tulis keterangan detail transaksi.');
      return;
    }

    const activeRecordedBy = recordedBy.trim() || cashierName || (userRole === 'admin' ? 'Administrator' : 'Kasir Toko');

    // Call callback to add transaction
    onAddTransaction({
      date,
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      recordedBy: activeRecordedBy,
      trxCategory,
      photo, // Base64 data if available
      anggotaName: trxCategory === 'belanja_karyawan' ? anggotaName : undefined
    });

    // Reset input fields
    setAmount('');
    setDescription('');
    setRecordedBy('');
    setAnggotaName('');
    setPhoto(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    
    // Show success banner
    setSuccessMessage(
      trxCategory === 'belanja_karyawan' 
        ? 'Alhamdulillah, data belanja harian anggota berhasil disimpan!'
        : 'Alhamdulillah, data serah terima setoran berhasil disimpan!'
    );
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4500);
  };

  const getFormTitle = () => {
    if (userRole === 'kasir') {
      return 'Input Belanja Harian Karyawan';
    }
    return trxCategory === 'belanja_karyawan' 
      ? 'Input Belanja Karyawan / Anggota' 
      : 'Input Setoran Harian Kasir';
  };

  const getCategoriesToRender = () => {
    if (trxCategory === 'belanja_karyawan') {
      return BELANJA_CATEGORIES;
    }
    return type === 'masuk' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-md border p-6 transition-all duration-300 ${
      userRole === 'kasir' 
        ? 'border-amber-200 shadow-amber-950/5' 
        : 'border-slate-100 shadow-emerald-950/5'
    }`}>
      {/* Role and Mode Title block */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          {trxCategory === 'belanja_karyawan' ? (
            <ShoppingBag className="h-5 w-5 text-amber-500" />
          ) : (
            <Sparkles className="h-5 w-5 text-emerald-600 fill-emerald-100/10" />
          )}
          <h3 className="font-bold text-base text-slate-950 font-sans tracking-tight">
            {getFormTitle()}
          </h3>
        </div>
        
        <span className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-full border ${
          userRole === 'admin' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
            : 'bg-amber-50 text-amber-800 border-amber-100 animate-pulse'
        }`}>
          Sesi {userRole === 'admin' ? 'Admin' : 'Kasir'}
        </span>
      </div>

      {/* Admin Mode Switch Tab */}
      {userRole === 'admin' && (
        <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 mb-5">
          <button
            type="button"
            onClick={() => setTrxCategory('setoran')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              trxCategory === 'setoran'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Setoran Harian
          </button>
          
          <button
            type="button"
            onClick={() => setTrxCategory('belanja_karyawan')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              trxCategory === 'belanja_karyawan'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            Belanja Karyawan/Anggota
          </button>
        </div>
      )}

      {/* Form Fields container */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Toggle Aliran (only shown for Admin & setoran category) */}
        {userRole === 'admin' && trxCategory === 'setoran' && (
          <div>
            <label className="block text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Jenis Transaksi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('masuk')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'masuk'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ArrowUp className={`h-3.5 w-3.5 ${type === 'masuk' ? 'text-emerald-600' : 'text-slate-400'}`} />
                Setoran Masuk (Kasir)
              </button>
              <button
                type="button"
                onClick={() => setType('keluar')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  type === 'keluar'
                    ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <ArrowDown className={`h-3.5 w-3.5 ${type === 'keluar' ? 'text-rose-600' : 'text-slate-400'}`} />
                Kas Keluar (Bendahara)
              </button>
            </div>
          </div>
        )}

        {/* Informative Label for Kasir / locked expense */}
        {(userRole === 'kasir' || trxCategory === 'belanja_karyawan') && (
          <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-[11px] leading-relaxed text-amber-800 flex items-start gap-2">
            <ClipboardList className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Informasi:</span> Pencatatan dikonfigurasi sebagai <span className="font-bold">Kas Keluar</span> untuk belanja karyawan & anggota harian.
            </div>
          </div>
        )}

        {/* Tanggal Transaksi */}
        <div>
          <label htmlFor="date-input" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Tanggal Transaksi
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-sans font-medium"
            />
          </div>
        </div>

        {/* Jumlah Nominal */}
        <div>
          <label htmlFor="amount-input" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Jumlah Nominal Belanja / Setoran
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold text-xs">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
            />
          </div>
          {/* live rupiah preview so users feel the luxury */}
          {amount && parseFloat(amount) > 0 && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-semibold text-slate-600 mt-1.5 bg-slate-100 py-1.5 px-2.5 rounded-lg border border-slate-200"
            >
              Terbilang: <span className="font-extrabold text-emerald-800">{formatRupiah(parseFloat(amount))}</span>
            </motion.p>
          )}
        </div>

        {/* Kategori Dropdown */}
        <div>
          <label htmlFor="category-select" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Kategori
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            {getCategoriesToRender().map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Anggota Dropdown */}
        {trxCategory === 'belanja_karyawan' && (
          <div className="animate-fade-in">
            <label htmlFor="anggota-select" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Pilih Anggota (Data SHU)
            </label>
            <select
              id="anggota-select"
              required
              value={anggotaName}
              onChange={(e) => setAnggotaName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-amber-500/5 border border-amber-300 rounded-xl text-slate-850 text-xs font-bold focus:outline-hidden focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500 transition-all cursor-pointer"
            >
              <option value="">-- Pilih Nama Anggota --</option>
              {MEMBER_LIST.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Keterangan */}
        <div>
          <label htmlFor="desc-input" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Detail Keterangan Deskripsi
          </label>
          <div className="relative">
            <span className="absolute top-3 left-3 flex items-start pointer-events-none text-slate-400">
              <FileText className="h-4 w-4" />
            </span>
            <textarea
              id="desc-input"
              rows={2}
              required
              placeholder={trxCategory === 'belanja_karyawan' ? 'Contoh: Belanja teh, kopi, dan gula untuk konsumsi rapat karyawan' : 'Contoh: Setoran shift pagi lunas kasir Fatimah'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all resize-none font-medium leading-relaxed"
            />
          </div>
        </div>

        {/* Nama Pencatat */}
        <div>
          <label htmlFor="recorded-by-input" className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Nama Petugas Pencatat / Kasir <span className="text-slate-400 text-[9px] lowercase italic">(opsional)</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <User className="h-4 w-4" />
            </span>
            <input
              id="recorded-by-input"
              type="text"
              placeholder={cashierName || 'Administrator'}
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {/* OPTIONAL PHOTO ATTACHMENT WIDGET */}
        <div className="border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/50">
          <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">
            Unggah Foto / Nota Bukti Fisik <span className="text-slate-400 text-[9px] lowercase font-normal italic">(opsional, tidak harus ada)</span>
          </span>

          {!photo ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Camera className="h-4 w-4 text-slate-500" />
                <span>Pilih Foto Nota</span>
              </button>
              <span className="text-[10px] text-slate-400">Suport: JPG, PNG (Maks 2MB)</span>
              
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl border border-emerald-100"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={photo} 
                  alt="Nota Preview" 
                  className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="text-[11px] font-bold text-emerald-800">Bukti Nota Tersemat</p>
                  <p className="text-[9px] text-slate-400">Siap disimpan bersama transaksi</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemovePhoto}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-all"
                title="Hapus Bukti Foto"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-2.5 px-4 outline-hidden font-bold text-white rounded-xl shadow-xs hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-all group ${
            userRole === 'kasir' || trxCategory === 'belanja_karyawan'
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 hover:text-slate-950 font-bold'
              : 'bg-emerald-700 hover:bg-emerald-800'
          }`}
        >
          <PlusCircle className="h-4.5 w-4.5 transition-transform group-hover:scale-110" />
          <span>
            {trxCategory === 'belanja_karyawan' 
              ? 'Simpan Belanja Karyawan' 
              : 'Simpan Setoran Harian'}
          </span>
        </button>

        {/* Success Alert Banner */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-3 border rounded-xl text-xs text-center font-bold ${
              trxCategory === 'belanja_karyawan'
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {successMessage}
          </motion.div>
        )}
      </form>
    </div>
  );
}
