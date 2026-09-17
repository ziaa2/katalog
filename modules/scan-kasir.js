Zuna.register({
    id: 'f-scan-kasir',
    category: 'keuangan',
    title: 'SCAN KASIR',
    desc: 'Scan barcode, otomatis kenali barang & harga',
    icon: 'ph ph-barcode',
    html: `
        <!-- SUMMARY ATAS -->
        <div class="tool-ui" style="text-align: center; background: var(--green); border: none; margin-bottom: 15px;">
            <span class="label" style="color: #000; opacity: 0.7;">TOTAL PENJUALAN HARI INI</span>
            <div id="sk-total-jual" style="font-size: 32px; font-weight: 800; color: #000; font-family: 'JetBrains Mono';">Rp 0</div>
            <div id="sk-total-transaksi" style="font-size: 10px; color: #000; font-weight: 800; margin-top: 5px; opacity: 0.6;">0 TRANSAKSI</div>
        </div>

        <!-- KAMERA / SCANNER -->
        <div class="tool-ui">
            <span class="label">Scan Barcode</span>
            <div id="sk-reader" style="width:100%; border-radius:15px; overflow:hidden; display:none; margin-bottom:10px;"></div>

            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <button id="sk-scan-toggle" class="b-quick-btn" style="flex:1; background:var(--green); color:#000;" onclick="toggleSkScan()">MULAI SCAN</button>
            </div>

            <!-- FALLBACK INPUT MANUAL -->
            <span class="label">Atau Ketik Manual Barcode</span>
            <div style="display:flex; gap:8px; margin-bottom:10px;">
                <input type="tel" id="sk-manual-input" placeholder="Ketik nomor barcode..." style="font-size:16px;">
                <button class="b-quick-btn" onclick="skProcessManual()">CARI</button>
            </div>
            <div id="sk-scan-status" style="font-size:10px; color:var(--sub); text-align:center; min-height:14px;"></div>
        </div>

        <!-- HASIL SCAN: BARANG DIKENALI -->
        <div class="tool-ui" id="sk-known-card" style="display:none;">
            <span class="label">Barang Dikenali</span>
            <div id="sk-known-name" style="font-size:18px; font-weight:800; color:#fff; margin-bottom:2px;"></div>
            <div id="sk-known-price" style="font-size:22px; font-weight:800; color:var(--green); font-family:'JetBrains Mono'; margin-bottom:12px;"></div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
                <button class="b-quick-btn" onclick="skChangeQty(-1)" style="width:44px;">-</button>
                <div id="sk-qty-display" style="flex:1; text-align:center; font-size:20px; font-weight:800;">1</div>
                <button class="b-quick-btn" onclick="skChangeQty(1)" style="width:44px;">+</button>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="b-quick-btn" style="flex:1; background:var(--green); color:#000;" onclick="skAddToCart()">TAMBAH KE KERANJANG</button>
                <button class="b-quick-btn" onclick="skCancelResult()">✕</button>
            </div>
        </div>

        <!-- HASIL SCAN: BARANG BELUM TERDAFTAR -->
        <div class="tool-ui" id="sk-new-card" style="display:none;">
            <span class="label">Barang Belum Terdaftar — Daftarkan Dulu</span>
            <div id="sk-new-barcode" style="font-size:10px; color:var(--sub); margin-bottom:8px; font-family:'JetBrains Mono';"></div>
            <span class="label">Nama Barang</span>
            <input type="text" id="sk-new-name" placeholder="Nama barang..." style="font-size:16px; margin-bottom:10px;">
            <span class="label">Harga Jual</span>
            <input type="tel" id="sk-new-price" placeholder="0" style="font-size:22px; color:var(--green); margin-bottom:12px;">
            <div style="display:flex; gap:8px;">
                <button class="b-quick-btn" style="flex:1; background:var(--green); color:#000;" onclick="skRegisterProduct()">DAFTARKAN & TAMBAH</button>
                <button class="b-quick-btn" onclick="skCancelResult()">✕</button>
            </div>
        </div>

        <!-- KERANJANG -->
        <div class="tool-ui">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="label" style="margin:0">Keranjang</span>
                <span onclick="skClearCart()" style="font-size: 8px; color: var(--red); font-weight: 800; cursor: pointer; letter-spacing: 1px;">KOSONGKAN</span>
            </div>
            <div id="sk-cart-list" style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;"></div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <span style="font-size:11px; color:var(--sub); font-weight:800;">TOTAL KERANJANG</span>
                <span id="sk-cart-total" style="font-size:18px; font-weight:800; color:#fff; font-family:'JetBrains Mono';">Rp 0</span>
            </div>
            <button class="b-quick-btn" style="width:100%; background:var(--green); color:#000; padding:16px;" onclick="skFinalizeSale()">SELESAIKAN TRANSAKSI</button>
        </div>

        <!-- RIWAYAT -->
        <div class="tool-ui">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="label" style="margin:0">Riwayat Hari Ini</span>
                <span onclick="skResetSalesAll()" style="font-size: 8px; color: var(--red); font-weight: 800; cursor: pointer; letter-spacing: 1px;">HAPUS SEMUA</span>
            </div>
            <div id="sk-history-list" style="display: flex; flex-direction: column; gap: 8px;"></div>
        </div>

        <style>
            .b-item { background: #080808; border: 1px solid #151515; padding: 12px 15px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; }
        </style>
    `,
    logic: () => {
        const PRODUCT_DB_KEY = 'zuna_scan_products_v1';
        const SALES_KEY = 'zuna_scan_sales_v1';

        let html5QrCode = null;
        let scanning = false;
        let currentCart = [];
        let pendingCode = null;
        let pendingQty = 1;

        // --- anti-misfire: butuh kode sama 2x berturut sebelum diterima ---
        let lastSeenCode = null;
        let lastSeenTime = 0;
        let seenCount = 0;
        let cooldownUntil = 0;
        const CONFIRM_WINDOW_MS = 1200;
        const COOLDOWN_MS = 1500;

        // ---------- STORAGE HELPERS ----------
        const getProductDB = () => {
            const raw = localStorage.getItem(PRODUCT_DB_KEY);
            return raw ? JSON.parse(raw) : {};
        };
        const saveProductDB = (db) => localStorage.setItem(PRODUCT_DB_KEY, JSON.stringify(db));

        const getSalesData = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID');
            const raw = localStorage.getItem(SALES_KEY);
            let data = raw ? JSON.parse(raw) : { date: dateStr, items: [] };
            if (data.date !== dateStr) {
                data = { date: dateStr, items: [] };
                localStorage.setItem(SALES_KEY, JSON.stringify(data));
            }
            return data;
        };
        const saveSalesData = (data) => localStorage.setItem(SALES_KEY, JSON.stringify(data));

        // ---------- SCANNER ----------
        window.toggleSkScan = async () => {
            if (scanning) {
                stopSkScan();
                return;
            }
            if (typeof Html5Qrcode === 'undefined') {
                document.getElementById('sk-scan-status').innerText = 'Library scanner belum dimuat (cek index.html).';
                return;
            }
            const readerEl = document.getElementById('sk-reader');
            readerEl.style.display = 'block';
            document.getElementById('sk-scan-toggle').innerText = 'STOP SCAN';
            document.getElementById('sk-scan-status').innerText = 'Arahkan kamera ke barcode...';
            scanning = true;

            html5QrCode = new Html5Qrcode('sk-reader');
            try {
                await html5QrCode.start(
                    { facingMode: 'environment' },
                    { fps: 12, qrbox: { width: 260, height: 140 } },
                    (decodedText) => handleRawScan(decodedText),
                    () => {} // abaikan error per-frame (normal, terjadi tiap frame gagal decode)
                );
            } catch (err) {
                document.getElementById('sk-scan-status').innerText = 'Gagal buka kamera: ' + err;
                scanning = false;
                document.getElementById('sk-scan-toggle').innerText = 'MULAI SCAN';
            }
        };

        const stopSkScan = () => {
            if (html5QrCode) {
                html5QrCode.stop().then(() => html5QrCode.clear()).catch(() => {});
            }
            document.getElementById('sk-reader').style.display = 'none';
            document.getElementById('sk-scan-toggle').innerText = 'MULAI SCAN';
            document.getElementById('sk-scan-status').innerText = '';
            scanning = false;
        };

        // Validasi anti-misfire sebelum barcode dianggap sah
        const handleRawScan = (code) => {
            const now = Date.now();
            if (now < cooldownUntil) return; // masih cooldown dari scan sebelumnya

            if (code === lastSeenCode && (now - lastSeenTime) < CONFIRM_WINDOW_MS) {
                seenCount++;
            } else {
                lastSeenCode = code;
                seenCount = 1;
            }
            lastSeenTime = now;

            if (seenCount >= 2) {
                // valid, terima
                seenCount = 0;
                lastSeenCode = null;
                cooldownUntil = now + COOLDOWN_MS;
                document.getElementById('sk-scan-status').innerText = 'Terbaca: ' + code;
                skProcessCode(code);
            } else {
                document.getElementById('sk-scan-status').innerText = 'Membaca... (konfirmasi ulang)';
            }
        };

        window.skProcessManual = () => {
            const val = document.getElementById('sk-manual-input').value.trim();
            if (!val) return;
            skProcessCode(val);
            document.getElementById('sk-manual-input').value = '';
        };

        // ---------- LOOKUP PRODUK ----------
        async function lookupOpenFoodFacts(code) {
            try {
                const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
                const data = await res.json();
                if (data.status === 1 && data.product) {
                    return data.product.product_name || data.product.product_name_id || '';
                }
            } catch (e) { /* offline / tidak ketemu, biarkan kosong */ }
            return '';
        }

        window.skProcessCode = async (code) => {
            pendingCode = code;
            pendingQty = 1;
            const db = getProductDB();

            if (db[code]) {
                showKnownCard(db[code]);
            } else {
                document.getElementById('sk-scan-status').innerText = 'Mencari nama barang...';
                const autoName = await lookupOpenFoodFacts(code);
                document.getElementById('sk-scan-status').innerText = '';
                showNewCard(code, autoName);
            }
        };

        const showKnownCard = (product) => {
            document.getElementById('sk-new-card').style.display = 'none';
            document.getElementById('sk-known-card').style.display = 'block';
            document.getElementById('sk-known-name').innerText = product.name;
            document.getElementById('sk-known-price').innerText = 'Rp ' + Zuna.fmt(product.price);
            pendingQty = 1;
            document.getElementById('sk-qty-display').innerText = '1';
        };

        const showNewCard = (code, autoName) => {
            document.getElementById('sk-known-card').style.display = 'none';
            document.getElementById('sk-new-card').style.display = 'block';
            document.getElementById('sk-new-barcode').innerText = 'Barcode: ' + code;
            document.getElementById('sk-new-name').value = autoName || '';
            document.getElementById('sk-new-price').value = '';
        };

        window.skCancelResult = () => {
            document.getElementById('sk-known-card').style.display = 'none';
            document.getElementById('sk-new-card').style.display = 'none';
            pendingCode = null;
        };

        window.skChangeQty = (delta) => {
            pendingQty = Math.max(1, pendingQty + delta);
            document.getElementById('sk-qty-display').innerText = pendingQty;
        };

        window.skRegisterProduct = () => {
            const name = document.getElementById('sk-new-name').value.trim();
            const price = Zuna.val('sk-new-price');
            if (!name || price <= 0) return;

            const db = getProductDB();
            db[pendingCode] = { name, price };
            saveProductDB(db);

            showKnownCard(db[pendingCode]);
        };

        // ---------- KERANJANG ----------
        window.skAddToCart = () => {
            const db = getProductDB();
            const product = db[pendingCode];
            if (!product) return;

            const existing = currentCart.find(i => i.barcode === pendingCode);
            if (existing) {
                existing.qty += pendingQty;
            } else {
                currentCart.push({ barcode: pendingCode, name: product.name, price: product.price, qty: pendingQty });
            }
            skCancelResult();
            renderCart();
        };

        window.skRemoveFromCart = (barcode) => {
            currentCart = currentCart.filter(i => i.barcode !== barcode);
            renderCart();
        };

        window.skClearCart = () => {
            if (currentCart.length && !confirm('Kosongkan keranjang?')) return;
            currentCart = [];
            renderCart();
        };

        const renderCart = () => {
            const list = document.getElementById('sk-cart-list');
            list.innerHTML = '';
            let total = 0;
            currentCart.forEach(item => {
                const subtotal = item.price * item.qty;
                total += subtotal;
                const div = document.createElement('div');
                div.className = 'b-item';
                div.innerHTML = `
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#fff">${item.name} x${item.qty}</div>
                        <div style="font-size:8px; color:var(--sub); margin-top:2px">Rp ${Zuna.fmt(subtotal)}</div>
                    </div>
                    <i class="ph ph-trash" onclick="skRemoveFromCart('${item.barcode}')" style="color:#333; font-size:18px; cursor:pointer"></i>
                `;
                list.appendChild(div);
            });
            document.getElementById('sk-cart-total').innerText = 'Rp ' + Zuna.fmt(total);
        };

        // ---------- TRANSAKSI / RIWAYAT ----------
        window.skFinalizeSale = () => {
            if (!currentCart.length) return;
            const data = getSalesData();
            const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            currentCart.forEach(item => {
                data.items.unshift({
                    id: Date.now() + Math.random(),
                    barcode: item.barcode,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    time
                });
            });
            saveSalesData(data);
            currentCart = [];
            renderCart();
            renderSalesHistory();
        };

        window.skDelSaleItem = (id) => {
            if (!confirm('Hapus transaksi ini?')) return;
            const data = getSalesData();
            data.items = data.items.filter(i => i.id !== id);
            saveSalesData(data);
            renderSalesHistory();
        };

        window.skResetSalesAll = () => {
            if (!confirm('Hapus semua riwayat hari ini?')) return;
            const data = getSalesData();
            data.items = [];
            saveSalesData(data);
            renderSalesHistory();
        };

        const renderSalesHistory = () => {
            const data = getSalesData();
            const list = document.getElementById('sk-history-list');
            const elTotal = document.getElementById('sk-total-jual');
            const elCount = document.getElementById('sk-total-transaksi');

            let totalJual = 0;
            list.innerHTML = '';

            data.items.forEach(item => {
                const subtotal = item.price * item.qty;
                totalJual += subtotal;
                const div = document.createElement('div');
                div.className = 'b-item';
                div.innerHTML = `
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#fff">${item.name} x${item.qty} — Rp ${Zuna.fmt(subtotal)}</div>
                        <div style="font-size:8px; color:var(--sub); margin-top:2px">${item.time}</div>
                    </div>
                    <i class="ph ph-trash" onclick="skDelSaleItem(${item.id})" style="color:#333; font-size:18px; cursor:pointer"></i>
                `;
                list.appendChild(div);
            });

            elTotal.innerText = 'Rp ' + Zuna.fmt(totalJual);
            elCount.innerText = data.items.length + ' TRANSAKSI';
        };

        renderCart();
        renderSalesHistory();
    }
});
