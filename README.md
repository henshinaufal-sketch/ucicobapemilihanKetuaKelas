# Pemilihan Ketua Kelas — Prototipe E-Voting

Uji coba sebelum dipakai untuk pemilihan ketua RT. Dibuat dengan Next.js dan siap di-deploy ke Vercel.

## Fitur
- **Publik (`/`)** — hasil voting live (otomatis diperbarui tiap 3 detik), jumlah partisipasi.
- **Pemilih (`/vote`)** — masukkan token (atau buka link `/vote?t=TOKEN`), pilih kandidat, kirim.
- **Admin (`/admin`)** — login dengan password, buat/reset token (default 20), lihat status tiap token, salin link token.

## Keamanan suara
- **Token sekali pakai**: pemakaian token dan penambahan suara terjadi dalam **satu operasi atomik** (skrip Lua di Redis). Sudah diuji: 10 request bersamaan dengan token yang sama → hanya 1 yang diterima.
- **Suara rahasia**: sistem hanya mencatat *kapan* token dipakai, **tidak** mencatat token itu memilih siapa.
- Halaman & API admin dilindungi password (`ADMIN_PASSWORD`) dengan cookie httpOnly.

## Deploy ke Vercel
1. Import repo ini di Vercel.
2. Di tab **Storage** project Vercel → tambahkan **Upstash for Redis** (Marketplace, ada paket gratis) dan hubungkan ke project. Env `KV_REST_API_URL` & `KV_REST_API_TOKEN` akan terisi otomatis.
3. Di **Settings → Environment Variables** tambahkan `ADMIN_PASSWORD`.
4. Redeploy, buka `/admin`, login, klik **Reset & Buat Token**.
5. Bagikan satu token/link ke tiap pemilih secara pribadi.

> Tanpa Redis, aplikasi memakai penyimpanan in-memory — cocok untuk coba lokal saja (di Vercel data bisa hilang/terpisah antar instance).

## Jalankan lokal
```bash
npm install
ADMIN_PASSWORD=rahasia npm run dev
```

## Mengganti kandidat
Edit `lib/candidates.ts` dan taruh fotonya di `public/candidates/`.
