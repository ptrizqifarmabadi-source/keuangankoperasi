/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'masuk' | 'keluar';
export type TransactionCategory = 'setoran' | 'belanja_karyawan';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  recordedBy?: string;
  timestamp: number;
  photo?: string; // Optional Base64 image
  trxCategory?: TransactionCategory; // 'setoran' (default) or 'belanja_karyawan'
  anggotaName?: string; // Member name for SHU calculation
}

export type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'year' | 'custom';

export interface SummaryStats {
  // Main treasury (Setoran harian) - strictly divorced from employee/member grocery budget
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  weeklyExpense: number; 
  weeklyIncome: number; 
  monthlyExpense: number;
  monthlyIncome: number;
  todayIncome: number;
  todayExpense: number;

  // Separate Member shopping ledgers (SHU Book)
  totalBelanja: number;
  weeklyBelanja: number;
  monthlyBelanja: number;
  todayBelanja: number;
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

export const BELANJA_CATEGORIES = [
  'Belanja Harian Karyawan (Konsumsi)',
  'Belanja Kebutuhan Anggota',
  'Pembelian Bahan Baku / Toko',
  'Operasional Kantor / ATK',
  'Biaya Kebersihan & Keamanan',
  'Reimbursement / Uang Bensin',
  'Lain-lain (Belanja Karyawan)'
];

export const MEMBER_LIST = [
  'Abdul Kodir',
  'Aca Iskandar',
  'Ade Rizki Pratama',
  'Ahmad Kamaluddin Afif',
  'Angga Nanda Marwan',
  'Ayim Ismail',
  'Ayu Chairunnisa',
  'Dany Wahyudi',
  'Daud Bachtiar',
  'Dede Samsudin',
  'Dina Mutia Rahmah',
  'Evi Silvia',
  'Fahmi Hidayah Subandi',
  'Farhan Insan',
  'Febriani Hasan',
  'Ferri Widiantara',
  'Firman Maulana Akhsan',
  'Fuad Habibi Siregar',
  'Ghassan Muhammadi Al-Ghazy',
  'Hana Uswatun Hasanah',
  'Hanifah',
  'Helmi Nursirwan',
  'Heri Kiswanto',
  'Heri Mulyadi',
  'Hilmi Muhammad Yusrin',
  'Iday Muhammad Yusuf',
  'Indah Febri Annisa',
  'Jenal Mutakin',
  'Kusmayanti',
  'M Reza Wawi Saputra',
  'Maulida Gita Cahyani',
  'Mohamad Roni',
  'Muhamad Azar',
  'Muhamad Dirham Nugraha',
  'Muhammad Fat Churrohman',
  'Muhammad Gilang Permana',
  'Muhammad Hajan Makbula',
  'Muhammad Hasan Tutupoho',
  'Muhammad Ibnu Hardiana',
  'Muhammad Zulqarnaen',
  'Nanang Kurnia',
  'Nur Aliman Syidik',
  'Nur Asiah',
  'Rahmat Wahyudi',
  'Revi Kurniawati',
  'Rikza Asitta Noursyamba',
  'Roseu Ratnasari',
  'Saeful Anwar',
  'Sarah Roudhotul Aulia',
  'Sihabudin',
  'Siswadi Dinianto',
  'Suci Safari Muhazirin',
  'Sumarni Putri',
  'Syifa Iftikhar',
  'Tatang Haetami',
  'Windi',
  'Wiwil Sinora',
  'Yogi Syahputra'
];
