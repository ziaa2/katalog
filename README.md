# WarungKu — Web Pribadi Offline

Aplikasi pencatatan warung pribadi yang bisa di-host di GitHub Pages dan dipakai dari HP.

## Fitur
- Dashboard dark mode
- Catat penjualan, laba, dan pengeluaran
- Produk + kategori + harga modal/jual + stok
- Scan QR/barcode melalui kamera jika browser mendukung BarcodeDetector
- Input kode manual sebagai fallback
- Data pelanggan + nomor WhatsApp
- Hutang/piutang
- Laporan ringkas
- Backup & restore JSON
- PWA / install ke layar utama
- Offline setelah aset pertama kali terbuka
- **Tanpa API, tanpa database server**

## Data
Data disimpan di `localStorage` browser pada perangkat yang dipakai. Jadi data tidak otomatis berpindah ke HP lain. Gunakan menu **Backup** secara berkala.

## GitHub Pages
1. Buat repository baru di GitHub.
2. Upload semua file di folder ini ke repository.
3. Settings → Pages.
4. Pilih `Deploy from a branch`.
5. Pilih branch `main` dan folder `/ (root)`.
6. Save.
7. Buka URL GitHub Pages.
8. Di Android Chrome pilih menu browser → **Tambahkan ke layar utama / Install app**.

## Catatan scanner
Kamera browser umumnya membutuhkan HTTPS. GitHub Pages sudah HTTPS. Jika perangkat/browser tidak menyediakan `BarcodeDetector`, tombol Scan tetap menyediakan input kode manual.

## Privasi
Aplikasi ini tidak mengirim data ke API/server. Tombol WhatsApp hanya membuka URL WhatsApp ketika kamu menekan tombol WA.
