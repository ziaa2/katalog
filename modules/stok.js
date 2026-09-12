Zuna.register({
    id: 'f-stok',
    category: 'keuangan',
    title: 'Manajemen Stok',
    desc: 'Pantau modal, harga jual & sisa stok barang',
    icon: 'ph ph-package',
    html: `
        <div class="tool-ui">
            <div style="margin-bottom:20px">
                <span class="label">Nama Barang</span>
                <input type="text" id="stok-name" placeholder="Contoh: Kopi Susu" style="font-size:16px; border-bottom: 2px solid #222">
                
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px">
                    <div>
                        <span class="label">Harga Modal (Beli)</span>
                        <input type="text" id="stok-modal" placeholder="0" style="font-size:16px; border-bottom: 2px solid #222">
                    </div>
                    <div>
                        <span class="label">Harga Jual</span>
                        <input type="text" id="stok-jual" placeholder="0" style="font-size:16px; border-bottom: 2px solid #222">
                    </div>
                </div>

                <span class="label">Stok Awal</span>
                <input type="number" id="stok-qty" value="0" style="font-size:16px; border-bottom: 2px solid #222">

                <button class="btn-calc" onclick="app_stok_add()" style="background:var(--green); color:#000; margin-top:10px">
                    + TAMBAH BARANG KE GUDANG
                </button>
            </div>

            <!-- Ringkasan Nilai Aset -->
            <div id="stok-summary" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-bottom:20px">
                <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:12px">
                    <span style="font-size:9px; color:var(--sub); display:block">TOTAL MODAL ASET</span>
                    <span id="total-aset-modal" style="font-size:13px; font-weight:800; color:#fff">Rp 0</span>
                </div>
                <div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:12px">
                    <span style="font-size:9px; color:var(--sub); display:block">POTENSI PROFIT</span>
                    <span id="total-aset-profit" style="font-size:13px; font-weight:800; color:var(--green)">Rp 0</span>
                </div>
            </div>

            <div id="stok-list-container" style="display:flex; flex-direction:column; gap:10px">
                <!-- List barang muncul di sini -->
            </div>
        </div>
    `,
    logic: () => {
        const STORAGE_KEY = 'zuna_inventory_data';

        // Format Input Mata Uang
        Zuna.bindFmt('stok-modal');
        Zuna.bindFmt('stok-jual');

        const getItems = () => {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        };

        const saveItems = (items) => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        };

        window.app_stok_render = () => {
            const items = getItems();
            const container = document.getElementById('stok-list-container');
            const summaryModal = document.getElementById('total-aset-modal');
            const summaryProfit = document.getElementById('total-aset-profit');
            
            container.innerHTML = "";
            let grandTotalModal = 0;
            let grandTotalProfit = 0;

            items.forEach((item, index) => {
                const totalModal = item.modal * item.stok;
                const profitPerItem = item.jual - item.modal;
                const totalProfit = profitPerItem * item.stok;

                grandTotalModal += totalModal;
                grandTotalProfit += totalProfit;

                const div = document.createElement('div');
                div.className = 'animate-reveal';
                div.style = `background:#111; padding:15px; border-radius:18px; border:1px solid #1a1a1a;`;
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px">
                        <div>
                            <h4 style="font-size:15px; font-weight:800; color:white; margin-bottom:4px">${item.name}</h4>
                            <p style="font-size:10px; color:var(--sub)">
                                Modal: Rp ${item.modal.toLocaleString('id-ID')} | 
                                Jual: Rp ${item.jual.toLocaleString('id-ID')}
                            </p>
                        </div>
                        <i class="ph ph-trash" onclick="app_stok_delete(${index})" style="color:var(--red); font-size:18px; opacity:0.5"></i>
                    </div>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:#000; padding:10px; border-radius:12px">
                        <div style="display:flex; align-items:center; gap:10px">
                            <button onclick="app_stok_update(${index}, -1)" style="width:30px; height:30px; border-radius:8px; border:none; background:#222; color:white; font-weight:800">-</button>
                            <span style="font-family:'JetBrains Mono'; font-weight:800; font-size:16px; min-width:30px; text-align:center">${item.stok}</span>
                            <button onclick="app_stok_update(${index}, 1)" style="width:30px; height:30px; border-radius:8px; border:none; background:var(--green); color:black; font-weight:800">+</button>
                        </div>
                        <div style="text-align:right">
                            <span style="display:block; font-size:8px; color:var(--sub)">POTENSI PROFIT</span>
                            <span style="font-size:12px; font-weight:800; color:var(--green)">Rp ${totalProfit.toLocaleString('id-ID')}</span>
                        </div>
                    </div>
                `;
                container.appendChild(div);
            });

            summaryModal.innerText = "Rp " + grandTotalModal.toLocaleString('id-ID');
            summaryProfit.innerText = "Rp " + grandTotalProfit.toLocaleString('id-ID');
        };

        window.app_stok_add = () => {
            const name = document.getElementById('stok-name').value;
            const modal = Zuna.val('stok-modal');
            const jual = Zuna.val('stok-jual');
            const stok = parseInt(document.getElementById('stok-qty').value) || 0;

            if (!name) return alert('Nama barang harus diisi');

            const items = getItems();
            items.unshift({ name, modal, jual, stok });
            saveItems(items);

            // Reset Form
            document.getElementById('stok-name').value = "";
            document.getElementById('stok-modal').value = "";
            document.getElementById('stok-jual').value = "";
            document.getElementById('stok-qty').value = "0";
            
            app_stok_render();
        };

        window.app_stok_update = (index, change) => {
            const items = getItems();
            items[index].stok = Math.max(0, items[index].stok + change);
            saveItems(items);
            app_stok_render();
        };

        window.app_stok_delete = (index) => {
            if(confirm('Hapus data barang ini?')) {
                const items = getItems();
                items.splice(index, 1);
                saveItems(items);
                app_stok_render();
            }
        };

        app_stok_render();
    }
});