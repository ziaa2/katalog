Zuna.register({
    id: 'f-harga',
    category: 'produktivitas',
    title: 'Scan Harga',
    desc: 'Scan barcode, cek & daftarkan harga',
    icon: 'ph ph-barcode',
    html: `
        <div class="tool-ui">
            <div id="h-scanner-wrap" style="display:none; margin-bottom:15px;">
                <div id="h-scanner" style="width:100%; aspect-ratio: 4/3; background:#000; border-radius:16px; overflow:hidden; position:relative; border:1px solid #222;"></div>
                <div style="text-align:center; font-size:9px; color:var(--sub); font-weight:800; margin-top:10px; letter-spacing:0.5px;">ARAHKAN KAMERA KE BARCODE</div>
                <button class="btn-calc" style="background:#1a1a1a; color:#fff; margin-top:12px;" onclick="hargaStopScan()">✕ TUTUP KAMERA</button>
            </div>

            <button class="btn-calc" id="h-scan-btn" onclick="hargaStartScan()" style="display:flex; align-items:center; justify-content:center; gap:8px;">
                <i class="ph ph-camera"></i> MULAI SCAN
            </button>

            <div style="display:flex; gap:10px; align-items:center; border-top:1px solid #222; margin-top:20px; padding-top:20px;">
                <input type="tel" id="h-manual-barcode" placeholder="Atau ketik kode barcode..." style="margin-bottom:0; font-size:14px; border-bottom:1px solid #333;">
                <button onclick="hargaCheckCode(document.getElementById('h-manual-barcode').value)" style="background:#fff; color:#000; border:none; padding:12px 16px; border-radius:10px; font-weight:800; font-size:11px; white-space:nowrap;">CEK</button>
            </div>
        </div>

        <div id="h-result" style="display:none;"></div>

        <div class="tool-ui">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                <span class="label" style="margin:0">Daftar Barang Tersimpan</span>
                <span id="h-count" style="font-size:9px; color:var(--sub); font-weight:800;">0 barang</span>
            </div>
            <input type="text" id="h-search" placeholder="Cari nama / kode barang..." oninput="hargaRenderList(this.value)" style="font-size:13px; margin-bottom:15px; border-bottom:1px solid #222;">
            <div id="h-list" style="display:flex; flex-direction:column; gap:6px;"></div>
        </div>

        <style>
            .h-item { background:#080808; border:1px solid #151515; padding:12px 15px; border-radius:14px; display:flex; justify-content:space-between; align-items:center; gap:10px; }
            .h-item .h-name { font-size:12px; font-weight:800; color:#fff; }
            .h-item .h-code { font-size:8px; color:var(--sub); font-weight:700; margin-top:2px; letter-spacing:0.5px; }
            .h-item .h-price { font-size:14px; font-weight:800; color:var(--green); font-family:'JetBrains Mono'; white-space:nowrap; }
            .h-badge-new { background:#faae2b; color:#000; font-size:8px; font-weight:800; padding:4px 10px; border-radius:50px; display:inline-block; margin-bottom:10px; }
            .h-badge-found { background:#00ff88; color:#000; font-size:8px; font-weight:800; padding:4px 10px; border-radius:50px; display:inline-block; margin-bottom:10px; }
        </style>
    `,
    logic: () => {
        const STORAGE_KEY = 'zuna_harga_v1';
        let scanning = false;

        const getDB = () => {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        };
        const saveDB = (db) => localStorage.setItem(STORAGE_KEY, JSON.stringify(db));

        const hargaOnDetected = (data) => {
            const code = data.codeResult.code;
            if (navigator.vibrate) navigator.vibrate(80);
            hargaStopScan();
            hargaCheckCode(code);
        };

        window.hargaStartScan = () => {
            if (typeof Quagga === 'undefined') { alert('Library scanner gagal dimuat. Cek koneksi internet.'); return; }
            document.getElementById('h-scanner-wrap').style.display = 'block';
            document.getElementById('h-scan-btn').style.display = 'none';
            document.getElementById('h-result').style.display = 'none';

            Quagga.init({
                inputStream: {
                    name: "Live",
                    type: "LiveStream",
                    target: document.querySelector('#h-scanner'),
                    constraints: { facingMode: "environment" }
                },
                decoder: {
                    readers: ["ean_reader", "ean_8_reader", "upc_reader", "upc_e_reader", "code_128_reader"]
                },
                locate: true
            }, (err) => {
                if (err) {
                    console.error(err);
                    alert('Tidak bisa akses kamera. Pastikan izin kamera diaktifkan.');
                    hargaStopScan();
                    return;
                }
                Quagga.start();
                scanning = true;
            });

            Quagga.onDetected(hargaOnDetected);
        };

        window.hargaStopScan = () => {
            if (scanning) {
                try { Quagga.offDetected(hargaOnDetected); Quagga.stop(); } catch (e) {}
                scanning = false;
            }
            document.getElementById('h-scanner-wrap').style.display = 'none';
            document.getElementById('h-scan-btn').style.display = 'flex';
        };

        window.hargaCheckCode = (code) => {
            code = (code || '').trim();
            if (!code) return;
            const db = getDB();
            const item = db[code];
            const box = document.getElementById('h-result');
            box.style.display = 'block';

            if (item) {
                box.innerHTML = `
                    <div class="tool-ui" style="animation: reveal 0.4s ease-out;">
                        <span class="h-badge-found">SUDAH TERDAFTAR</span>
                        <h3 style="font-size:16px; font-weight:800; color:#fff; margin-bottom:4px;">${item.nama}</h3>
                        <div style="font-size:9px; color:var(--sub); font-weight:700; margin-bottom:15px;">Kode: ${code}</div>
                        <div style="font-size:30px; font-weight:800; color:var(--green); font-family:'JetBrains Mono'; margin-bottom:20px;">Rp ${Zuna.fmt(item.harga)}</div>
                        <span class="label">Update Harga Baru (opsional)</span>
                        <input type="tel" id="h-update-harga" placeholder="Kosongkan jika tidak berubah">
                        <button class="btn-calc" onclick="hargaUpdateItem('${code}')">SIMPAN PERUBAHAN</button>
                    </div>
                `;
                Zuna.bindFmt('h-update-harga');
            } else {
                box.innerHTML = `
                    <div class="tool-ui" style="animation: reveal 0.4s ease-out;">
                        <span class="h-badge-new">BARANG BELUM TERDAFTAR</span>
                        <div style="font-size:9px; color:var(--sub); font-weight:700; margin-bottom:15px;">Kode: ${code}</div>
                        <span class="label">Nama Barang</span>
                        <input type="text" id="h-new-nama" placeholder="Contoh: Indomie Goreng" style="font-size:16px;">
                        <span class="label">Harga</span>
                        <input type="tel" id="h-new-harga" placeholder="0">
                        <button class="btn-calc" onclick="hargaSaveNew('${code}')">DAFTARKAN & SIMPAN</button>
                    </div>
                `;
                Zuna.bindFmt('h-new-harga');
                document.getElementById('h-new-nama').focus();
            }
        };

        window.hargaSaveNew = (code) => {
            const nama = document.getElementById('h-new-nama').value.trim();
            const harga = Zuna.val('h-new-harga');
            if (!nama) { alert('Nama barang belum diisi'); return; }
            if (harga <= 0) { alert('Harga belum diisi'); return; }
            const db = getDB();
            db[code] = { nama, harga, updated: Date.now() };
            saveDB(db);
            document.getElementById('h-result').innerHTML = `<div class="tool-ui" style="text-align:center; animation: reveal 0.4s ease-out;"><i class="ph ph-check-circle" style="font-size:36px; color:var(--green); margin-bottom:10px; display:block;"></i><div style="font-weight:800; color:#fff;">Barang berhasil didaftarkan</div></div>`;
            hargaRenderList();
            document.getElementById('h-manual-barcode').value = '';
        };

        window.hargaUpdateItem = (code) => {
            const newVal = Zuna.val('h-update-harga');
            const db = getDB();
            if (!db[code]) return;
            if (newVal > 0) db[code].harga = newVal;
            db[code].updated = Date.now();
            saveDB(db);
            document.getElementById('h-result').innerHTML = `<div class="tool-ui" style="text-align:center; animation: reveal 0.4s ease-out;"><i class="ph ph-check-circle" style="font-size:36px; color:var(--green); margin-bottom:10px; display:block;"></i><div style="font-weight:800; color:#fff;">Data tersimpan</div></div>`;
            hargaRenderList();
        };

        window.hargaDeleteItem = (code) => {
            if (!confirm('Hapus barang ini dari daftar?')) return;
            const db = getDB();
            delete db[code];
            saveDB(db);
            hargaRenderList(document.getElementById('h-search').value);
        };

        window.hargaRenderList = (query) => {
            const db = getDB();
            const list = document.getElementById('h-list');
            const countEl = document.getElementById('h-count');
            const q = (query || '').toLowerCase();

            const entries = Object.entries(db)
                .filter(([code, item]) => !q || item.nama.toLowerCase().includes(q) || code.includes(q))
                .sort((a, b) => (b[1].updated || 0) - (a[1].updated || 0));

            countEl.innerText = `${Object.keys(db).length} barang`;
            list.innerHTML = '';

            if (entries.length === 0) {
                list.innerHTML = `<div style="text-align:center; padding:20px 0; font-size:10px; color:var(--sub); font-weight:700;">Belum ada barang tersimpan</div>`;
                return;
            }

            entries.forEach(([code, item]) => {
                const div = document.createElement('div');
                div.className = 'h-item';
                div.innerHTML = `
                    <div>
                        <div class="h-name">${item.nama}</div>
                        <div class="h-code">${code}</div>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="h-price">Rp ${Zuna.fmt(item.harga)}</div>
                        <i class="ph ph-trash" onclick="hargaDeleteItem('${code}')" style="color:#222; font-size:16px; cursor:pointer;"></i>
                    </div>
                `;
                list.appendChild(div);
            });
        };

        window.addEventListener('popstate', () => { if (scanning) hargaStopScan(); });

        hargaRenderList();
    }
});
