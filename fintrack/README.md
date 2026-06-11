# FinTrack — Sistem Manajemen Keuangan Mahasiswa

Aplikasi manajemen keuangan berbasis web yang didesain khusus untuk mahasiswa Indonesia. Dilengkapi dengan fitur pencatatan transaksi, arus kas bulanan, *auto-alert* hedon, hingga export e-statement (PDF/Excel).

## Teknologi Utama
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS + TypeScript
- **Backend**: Next.js API Routes (Serverless)
- **Database**: PostgreSQL (via Supabase) + Prisma ORM
- **Auth**: NextAuth.js (Email & Password with JWT)
- **Komponen**: Recharts (Grafik), jsPDF & SheetJS (Export), Zustand (State)

## Cara Instalasi

1. Clone repository ini.
2. Buka folder proyek:
   ```bash
   cd fintrack
   ```
3. Install semua dependencies:
   ```bash
   npm install
   ```

## Setup Database (Supabase + Prisma)

1. Buat project baru di [Supabase](https://supabase.com/).
2. Buka Database Settings untuk mendapatkan URL koneksi.
3. Copy file `.env.example` menjadi `.env` dan masukkan konfigurasi Supabase-mu:
   ```bash
   cp .env.example .env
   ```
4. Jalankan perintah Prisma untuk melakukan push schema ke Supabase:
   ```bash
   npx prisma db push
   ```
5. Isi database dengan data awal (seed):
   ```bash
   npx prisma db seed
   ```

## Menjalankan Aplikasi

Jalankan mode development:
```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat aplikasinya. Gunakan akun demo berikut jika sudah melakukan seeding:
- **Email**: demo@fintrack.com
- **Password**: password123

## Catatan Tambahan
Aplikasi ini dioptimalkan untuk deployment di Vercel. Cukup import repo ke Vercel dan tambahkan Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, dan `NEXTAUTH_URL`).
