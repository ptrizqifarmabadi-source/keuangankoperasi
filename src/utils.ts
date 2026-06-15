/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Transaction } from './types';

/**
 * Formats a number to Indonesian Rupiah (IDR) currency format.
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date string (YYYY-MM-DD) into Indonesian readable date.
 */
export function formatFriendlyDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Checks if a YYYY-MM-DD date is within the current calendar week (Monday to Sunday).
 */
export function isWithinCurrentWeek(dateStr: string, benchmarkDate: Date = new Date()): boolean {
  try {
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return false;

    // Normalize dateObj to midnight local time
    dateObj.setHours(0, 0, 0, 0);

    // Get current day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const currentDay = benchmarkDate.getDay();
    
    // Distance to Monday (if Sun (0), subtract 6 days. If Mon-Sat (1-6), subtract (day - 1))
    const daysSinceMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Calculate Monday of current week
    const startOfWeek = new Date(benchmarkDate);
    startOfWeek.setDate(benchmarkDate.getDate() - daysSinceMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Calculate Sunday of current week (Monday + 6 days)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Compare
    return dateObj >= startOfWeek && dateObj <= endOfWeek;
  } catch {
    return false;
  }
}

/**
 * Generates and downloads a clean Excel-compatible CSV file with BOM.
 */
export function exportToExcel(transactions: Transaction[], title: string = 'Laporan_Setoran_Kasir_Koperasi_Cendekia'): void {
  // UTF-8 BOM to force Excel to recognize UTF-8 encoding
  const BOM = '\uFEFF';
  
  // Clean headers
  const headers = [
    'ID Transaksi',
    'Tanggal',
    'Jenis Aliran',
    'Jumlah (IDR)',
    'Kategori Setoran',
    'Keterangan Deskripsi',
    'Nama Pengirim/Kasir'
  ];

  // Map transactions to row arrays
  const rows = transactions.map(t => [
    t.id,
    t.date,
    t.type === 'masuk' ? 'Uang Masuk (Setoran Kasir)' : 'Uang Keluar (Penarikan Bendahara)',
    t.amount, // Just raw number so Excel can sum it up easily
    t.category,
    `"${t.description.replace(/"/g, '""')}"`, // escape quotes for CSV
    t.recordedBy || 'Kasir Default'
  ]);

  // Join headers and rows
  const csvContent = [
    'sep=,', // Tell Excel directly that comma is the separator
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Create document blob and initiate download
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Format file name with today's date
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `${title}_${today}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates sample initial transactions so the app doesn't present a completely barren dashboard
 */
export function getSampleTransactions(): Transaction[] {
  return [];
}

/**
 * Downloads a clean, pre-filled CSV template matching our column structures.
 */
export function downloadCSVTemplate(): void {
  const BOM = '\uFEFF';
  const headers = [
    'Tanggal (YYYY-MM-DD)',
    'Jenis Aliran (masuk/keluar)',
    'Jumlah (IDR)',
    'Kategori Setoran',
    'Keterangan Deskripsi',
    'Nama Pengirim/Kasir'
  ];
  
  const sampleRows = [
    ['2026-06-14', 'masuk', '3500000', 'Setoran Shift Pagi', 'Setoran akhir shift pagi rincian amanah', 'Kasir Maryam'],
    ['2026-06-14', 'keluar', '2000000', 'Penyerahan ke Bank / Brankas Utama', 'Penyetoran ke brankas pusat PT Rizqi', 'Bendahara Zul']
  ];

  const csvContent = [
    'sep=,', // Tell Excel the separator is comma
    headers.join(','),
    ...sampleRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'Template_Pencatatan_Kasir_Cendekia.csv');
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses CSV text to robustly validated Transaction array.
 */
export function parseCSVToTransactions(csvText: string): { parsed: Transaction[], errors: string[] } {
  const lines = csvText.split(/\r?\n/);
  const parsed: Transaction[] = [];
  const errors: string[] = [];

  let startRow = 0;
  if (lines[0] && lines[0].startsWith('sep=')) {
    startRow = 1;
  }

  // Find first non-empty line as header
  let headerIndex = -1;
  for (let i = startRow; i < lines.length; i++) {
    if (lines[i].trim().length > 0) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    errors.push('File CSV kosong atau tidak ada baris header.');
    return { parsed, errors };
  }

  // Custom parser line split that respects double quotes
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (inQuotes && line[j + 1] === '"') {
          current += '"';
          j++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseCSVLine(lines[headerIndex]).map(h => h.toLowerCase().trim());

  // Find column indexes
  const getIndex = (possibleNames: string[]): number => {
    return headers.findIndex(h => possibleNames.some(name => h.includes(name.toLowerCase())));
  };

  const dateIdx = getIndex(['tanggal', 'date']);
  const typeIdx = getIndex(['jenis', 'type', 'aliran']);
  const amountIdx = getIndex(['jumlah', 'nominal', 'amount', 'idr']);
  const categoryIdx = getIndex(['kategori', 'category']);
  const descIdx = getIndex(['keterangan', 'deskripsi', 'description', 'detail']);
  const recordedIdx = getIndex(['nama', 'pengirim', 'kasir', 'staf', 'recorded']);

  if (dateIdx === -1 || typeIdx === -1 || amountIdx === -1 || descIdx === -1) {
    errors.push('Format kolom header CSV tidak dikenali. Kolom wajib: "Tanggal", "Jenis Aliran", "Jumlah", dan "Keterangan Deskripsi".');
    return { parsed, errors };
  }

  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row = parseCSVLine(line);
    // Basic verification of populated cells
    if (row.length < Math.max(dateIdx, typeIdx, amountIdx, descIdx) + 1) {
      continue;
    }

    const dateVal = row[dateIdx];
    const typeRaw = row[typeIdx].toLowerCase();
    const amountRaw = row[amountIdx];
    const categoryVal = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx] : 'Lain-lain (Setoran Masuk)';
    const descVal = row[descIdx] || 'Imported setoran';
    const recordedVal = recordedIdx !== -1 && row[recordedIdx] ? row[recordedIdx] : 'Kasir Default';

    // Validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateVal)) {
      errors.push(`Baris ${i + 1}: Format tanggal tidak valid ("${dateVal}"). Gunakan format YYYY-MM-DD.`);
      continue;
    }

    let typeVal: 'masuk' | 'keluar' = 'masuk';
    if (typeRaw.includes('keluar') || typeRaw.includes('tarikan') || typeRaw.includes('out') || typeRaw.includes('expense')) {
      typeVal = 'keluar';
    } else if (typeRaw.includes('masuk') || typeRaw.includes('setor') || typeRaw.includes('in') || typeRaw.includes('income')) {
      typeVal = 'masuk';
    } else {
      errors.push(`Baris ${i + 1}: Jenis aliran tidak dikenali ("${typeRaw}"). Gunakan "masuk" atau "keluar".`);
      continue;
    }

    const cleanAmount = amountRaw.replace(/[^0-9.-]+/g, '');
    const numericAmount = parseFloat(cleanAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      errors.push(`Baris ${i + 1}: Format jumlah/nominal salah ("${amountRaw}").`);
      continue;
    }

    const finalDate = new Date(dateVal);
    const idSeed = Math.random().toString(36).substring(3, 7).toUpperCase();
    const prefix = typeVal === 'masuk' ? 'SETOR' : 'OUT';

    parsed.push({
      id: `${prefix}-IMP-${idSeed}`,
      date: dateVal,
      type: typeVal,
      amount: numericAmount,
      category: categoryVal,
      description: descVal,
      recordedBy: recordedVal,
      timestamp: isNaN(finalDate.getTime()) ? Date.now() : finalDate.getTime()
    });
  }

  return { parsed, errors };
}
