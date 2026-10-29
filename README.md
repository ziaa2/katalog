# StockMate

Aplikasi manajemen stok offline untuk warung dan konter. Dibuat dengan HTML, CSS, JavaScript, IndexedDB, dan PWA; cocok di-host lewat GitHub Pages.

## Fitur
- Dashboard ringkasan omzet, modal stok, jenis barang, stok menipis, serta ringkasan Warung/Konter per kategori.\n- Dashboard menampilkan maksimal 5 aktivitas terbaru; riwayat lengkap tersedia di menu Riwayat.
- Tambah/edit/hapus barang; kategori Warung/Konter; harga modal/jual; barcode; batas minimum.
- Stok masuk melalui form barang atau pencarian nama.
- Tombol **Terjual** di setiap barang: masukkan jumlah terjual, stok otomatis berkurang, dan aktivitas masuk ke riwayat.
- Scan barcode menggunakan `BarcodeDetector` jika didukung browser/perangkat; input kode manual selalu tersedia.
- Riwayat pergerakan stok.
- Daftar kulakan terpisah dari inventaris.
- Tools terpisah dari modul stok: kalkulator laba, kalkulator harga jual, catatan pengeluaran, banding harga per unit.
- Backup/pemulihan JSON, ekspor riwayat CSV.
- PWA dan cache offline.
- Dark mode dengan aksen teal, layout mobile-first, sidebar desktop dan menu geser di HP.

## Cara upload ke GitHub Pages
1. Buat repository baru, misalnya `stockmate`.
2. Upload seluruh isi folder ini ke root repository (pastikan `index.html` berada di root).
3. Buka **Settings → Pages**.
4. Di **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main`, folder `/ (root)`, lalu klik **Save**.
6. Tunggu deployment selesai dan buka URL GitHub Pages yang ditampilkan.
7. Di Android, buka URL menggunakan Chrome. Pilih menu `⋮` → **Instal aplikasi** atau **Tambahkan ke layar utama**.

## Tes awal
1. Masuk **Pengaturan → Muat contoh** untuk mengisi data contoh.
2. Coba cari dan edit barang, ubah stok, dan hapus satu barang contoh.
3. Coba kalkulator laba di menu **Tools**.
4. Ekspor JSON sebagai backup, lalu uji impor pada kondisi data yang sudah dibackup.
5. Uji offline setelah website dibuka online setidaknya sekali.

## Catatan penting
- Data inventaris disimpan di browser/perangkat lokal melalui IndexedDB (fallback ke localStorage bila IndexedDB tidak tersedia). Tidak ada sinkronisasi antarperangkat.
- Ekspor JSON secara rutin. Menghapus data situs/browser dapat menghapus data lokal.
- Kamera hanya bisa dipakai pada HTTPS (misalnya GitHub Pages) dan memerlukan izin kamera.
- Pemindaian otomatis bergantung dukungan `BarcodeDetector` pada browser. Bila tidak tersedia, gunakan input kode manual. Untuk dukungan lebih luas, integrasikan library barcode lokal yang vendored ke repo.
- Service worker/PWA perlu dijalankan dari HTTPS atau localhost; tidak bisa diuji penuh jika file dibuka langsung dengan `file://`.
- Ikon menggunakan SVG. Jika perangkat/browser tidak menerima SVG sebagai ikon instalasi, ganti manifest dengan ikon PNG 192×192 dan 512×512.
- Versi awal ini tidak melakukan transaksi kasir/penjualan otomatis; pengurangan stok dapat ditambahkan pada pengembangan berikutnya.


## Backup otomatis lokal (update tahap 2)
StockMate membuat cadangan lokal setelah perubahan data penting dan menyimpan beberapa versi terakhir di perangkat/browser yang sama. Buka Pengaturan untuk melihat waktu cadangan, membuat backup sekarang, atau memulihkan cadangan terakhir. Backup lokal bukan pengganti Ekspor JSON: cadangan lokal tetap dapat hilang jika data situs/browser dihapus atau perangkat rusak. Simpan file Ekspor JSON di tempat lain secara berkala.
