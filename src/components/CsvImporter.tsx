/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Transaction } from '../types';
import { downloadCSVTemplate, parseCSVToTransactions, formatRupiah } from '../utils';
import { 
  FileSpreadsheet, 
  Download, 
  UploadCloud, 
  CheckCircle, 
  AlertTriangle, 
  HelpCircle,
  X,
  FileText
} from 'lucide-react';

interface CsvImporterProps {
  onImportSuccess: (newTransactions: Transaction[], overwrite: boolean) => void;
}

export function CsvImporter({ onImportSuccess }: CsvImporterProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { parsed, errors } = parseCSVToTransactions(text);
      setParsedData(parsed);
      setParseErrors(errors);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        setParseErrors(['File format harus berupa .csv (Excel Comma Separated Values).']);
        setParsedData([]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleImport = (overwrite: boolean) => {
    if (parsedData.length === 0) return;
    onImportSuccess(parsedData, overwrite);
    resetImporter();
  };

  const resetImporter = () => {
    setParsedData([]);
    setParseErrors([]);
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-slate-100 p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-emerald-700" />
          <h3 className="font-bold text-sm sm:text-base text-slate-800 font-sans tracking-tight">Impor Berkas Setoran (CSV)</h3>
        </div>
        <button 
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="text-xs font-semibold text-slate-400 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <HelpCircle className="h-3.5 w-3.5" />
          <span>Panduan Format</span>
        </button>
      </div>

      {showGuide && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2 text-slate-600 animate-slide-down relative">
          <button 
            onClick={() => setShowGuide(false)}
            className="absolute top-3 right-3 text-slate-400 hover:text-rose-500"
          >
            <X className="h-4 w-4" />
          </button>
          
          <p className="font-bold text-slate-800">Spesifikasi Kolom Berkas CSV:</p>
          <p className="leading-relaxed">
            Untuk melakukan impor data eksternal, pastikan berkas CSV Anda memiliki nama kolom (header) sebagai berikut:
          </p>
          <ul className="list-disc list-inside space-y-1.5 font-sans pl-1">
            <li><strong className="text-slate-800">Tanggal:</strong> Format tanggal <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[10px]">YYYY-MM-DD</code> (contoh: 2026-06-14)</li>
            <li><strong className="text-slate-800">Jenis Aliran:</strong> Tulislah <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[10px]">masuk</code> (untuk Setoran) atau <code className="bg-slate-200/60 px-1 py-0.5 rounded font-mono text-[10px]">keluar</code> (transaksi bendahara)</li>
            <li><strong className="text-slate-800">Jumlah:</strong> Nilai moneter angka saja tanpa lambang Rp (contoh: 4000000)</li>
            <li><strong className="text-slate-800">Keterangan Deskripsi:</strong> Penjelasan singkat mengenai serah terima unit/kasir</li>
            <li><strong className="text-slate-800">Kategori Setoran:</strong> Kategori setoran atau alokasi (opsional)</li>
            <li><strong className="text-slate-800">Nama Pengirim/Kasir:</strong> Nama personel kasir yang menyerahkan (opsional)</li>
          </ul>

          <div className="pt-2">
            <button
              onClick={downloadCSVTemplate}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-100 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-emerald-600" />
              Download Template CSV Excel
            </button>
          </div>
        </div>
      )}

      {/* DRAG AND DROP ZONE */}
      {parsedData.length === 0 && parseErrors.length === 0 && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragActive 
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-inner' 
              : 'border-slate-200 hover:border-emerald-500 hover:bg-slate-50/50'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".csv"
            onChange={handleFileChange}
            className="hidden" 
          />
          <UploadCloud className="h-10 w-10 text-slate-300 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-slate-700">Pilih berkas CSV atau seret ke sini</p>
          <p className="text-[10px] text-slate-400 mt-1">Hanya mendukung format berkas (.csv)</p>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              downloadCSVTemplate();
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-emerald-700 hover:text-emerald-800 font-bold"
          >
            <Download className="h-3 w-3" />
            Ambil Contoh Template CSV
          </button>
        </div>
      )}

      {/* SUMMARY DISPLAY UPON PARSING SUCCESS */}
      {parsedData.length > 0 && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-emerald-950">Berkas Berhasil Dimuat!</p>
              <p className="text-emerald-800/80 mt-0.5 font-mono text-[10px] truncate">{fileName}</p>
              <div className="mt-2 bg-white/80 p-2.5 rounded-lg border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Total Terbaca</p>
                  <p className="text-base font-bold text-emerald-900 font-mono mt-0.5">{parsedData.length} Catatan</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Akumulasi Nominal</p>
                  <p className="text-sm font-bold text-emerald-800 font-mono mt-0.5">
                    {formatRupiah(parsedData.reduce((sum, t) => sum + t.amount, 0))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {parseErrors.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
              <div className="flex items-center gap-1 text-amber-900 font-bold text-[11px]">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Ada beberapa baris yang diabaikan / bermasalah ({parseErrors.length})</span>
              </div>
              <div className="max-h-20 overflow-y-auto pl-4 list-decimal list-outside text-[10px] text-amber-700/90 font-mono space-y-0.5">
                {parseErrors.slice(0, 5).map((err, idx) => (
                  <div key={idx}>- {err}</div>
                ))}
                {parseErrors.length > 5 && <div>- ...dan {parseErrors.length - 5} kesalahan lainnya.</div>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleImport(false)}
              className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
            >
              Gabung (Merge)
            </button>
            <button
              onClick={() => handleImport(true)}
              className="py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              title="Akan menghapus semua data transaksi saat ini dan menggantinya dengan isi berkas"
            >
              Timpa Semua (Overwrite)
            </button>
          </div>
          
          <div className="text-center pt-1">
            <button 
              onClick={resetImporter}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 cursor-pointer"
            >
              Batal & Ganti Berkas
            </button>
          </div>
        </div>
      )}

      {/* ONLY ERROR LOG DISPLAY */}
      {parsedData.length === 0 && parseErrors.length > 0 && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-rose-900">Gagal Mengimpor Berkas</p>
              <p className="text-rose-700 mt-1 font-mono text-[10px]">{fileName}</p>
              <div className="max-h-24 overflow-y-auto mt-2 p-2 bg-white rounded-lg border border-rose-100 text-[10px] font-mono text-rose-600 space-y-1">
                {parseErrors.map((err, idx) => (
                  <div key={idx}>• {err}</div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-center pt-2">
            <button 
              onClick={resetImporter}
              className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Coba Berkas Lain
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
