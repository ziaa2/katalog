Zuna.register({
    id: 'f-kasir',
    category: 'keuangan',
    title: 'KASIR',
    desc: 'Laba bersih & reset otomatis',
    icon: 'ph ph-money',
    html: `
        <!-- SUMMARY ATAS -->
        <div class="tool-ui" style="text-align: center; background: var(--green); border: none; margin-bottom: 15px;">
            <span class="label" style="color: #000; opacity: 0.7;">TOTAL LABA HARI INI</span>
            <div id="b-total-laba" style="font-size: 32px; font-weight: 800; color: #000; font-family: 'JetBrains Mono';">Rp 0</div>
            <div id="b-total-transaksi" style="font-size: 10px; color: #000; font-weight: 800; margin-top: 5px; opacity: 0.6;">0 TRANSAKSI</div>
        </div>

        <div class="tool-ui">
            <!-- PILIH KATEGORI -->
            <span class="label">Kategori</span>
            <div style="display: flex; gap: 8px; overflow-x: auto; margin-bottom: 20px; padding-bottom: 5px; scrollbar-width: none;">
                <button class="b-cat-btn active" onclick="setBizCat('DANA', this)">DANA</button>
                <button class="b-cat-btn" onclick="setBizCat('TOKEN', this)">TOKEN</button>
                <button class="b-cat-btn" onclick="setBizCat('PULSA', this)">PULSA</button>
                <button class="b-cat-btn" onclick="setBizCat('BANK', this)">BANK</button>
                <button class="b-cat-btn" onclick="setBizCat('LAIN', this)">LAINNYA</button>
            </div>

            <!-- INPUT LABA (BISA MANUAL) -->
            <span class="label">Input Laba (Ketik manual / gunakan tombol)</span>
            <div style="position: relative; margin-bottom: 15px;">
                <input type="tel" id="b-input-laba" placeholder="0" style="font-size: 35px; color: var(--green); padding-right: 50px;">
                <div onclick="clearBizInput()" style="position: absolute; right: 10px; top: 50%; transform: translateY(-80%); color: var(--red); font-weight: 800; font-size: 20px; cursor: pointer; padding: 10px;">✕</div>
            </div>
            
            <!-- TOMBOL CEPAT (Sifatnya Menambah) -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <button class="b-quick-btn" onclick="addBizLaba(1000)">+1K</button>
                <button class="b-quick-btn" onclick="addBizLaba(2000)">+2K</button>
                <button class="b-quick-btn" onclick="addBizLaba(3000)">+3K</button>
                <button class="b-quick-btn" onclick="addBizLaba(5000)">+5K</button>
                <button class="b-quick-btn" onclick="addBizLaba(10000)">+10K</button>
                <button class="b-quick-btn" style="background: var(--green); color:#000" onclick="saveBiz()">SIMPAN</button>
            </div>

            <!-- RIWAYAT -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span class="label" style="margin:0">Riwayat Hari Ini</span>
                <span onclick="resetBizAll()" style="font-size: 8px; color: var(--red); font-weight: 800; cursor: pointer; letter-spacing: 1px;">HAPUS SEMUA</span>
            </div>
            <div id="b-history-list" style="display: flex; flex-direction: column; gap: 8px;">
                <!-- List data -->
            </div>
        </div>

        <style>
            .b-cat-btn { background: #111; border: 1px solid #222; color: #666; padding: 8px 16px; border-radius: 50px; font-size: 10px; font-weight: 800; cursor: pointer; white-space: nowrap; }
            .b-cat-btn.active { background: #fff; color: #000; border-color: #fff; }
            .b-quick-btn { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 15px; border-radius: 15px; font-size: 12px; font-weight: 800; cursor: pointer; }
            .b-quick-btn:active { transform: scale(0.92); }
            .b-item { background: #080808; border: 1px solid #151515; padding: 12px 15px; border-radius: 15px; display: flex; justify-content: space-between; align-items: center; }
        </style>
    `,
    logic: () => {
        const STORAGE_KEY = 'zuna_profit_v2';
        let currentCat = 'DANA';

        const getBizData = () => {
            const now = new Date();
            const dateStr = now.toLocaleDateString('id-ID');
            const raw = localStorage.getItem(STORAGE_KEY);
            let data = raw ? JSON.parse(raw) : { date: dateStr, items: [] };

            if (data.date !== dateStr) {
                data = { date: dateStr, items: [] };
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            }
            return data;
        };

        window.setBizCat = (cat, btn) => {
            currentCat = cat;
            document.querySelectorAll('.b-cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };

        // Menambah nominal ke yang sudah ada di input
        window.addBizLaba = (val) => {
            const currentVal = Zuna.val('b-input-laba');
            const newVal = currentVal + val;
            document.getElementById('b-input-laba').value = Zuna.fmt(newVal);
        };

        window.clearBizInput = () => {
            document.getElementById('b-input-laba').value = '';
        };

        window.saveBiz = () => {
            const laba = Zuna.val('b-input-laba');
            if (laba <= 0) return;

            const data = getBizData();
            data.items.unshift({
                id: Date.now(),
                cat: currentCat,
                laba: laba,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            clearBizInput();
            renderBiz();
        };

        window.delBizItem = (id) => {
            if(!confirm('Hapus transaksi ini?')) return;
            const data = getBizData();
            data.items = data.items.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderBiz();
        };

        window.resetBizAll = () => {
            if(!confirm('Hapus semua riwayat hari ini?')) return;
            const data = getBizData();
            data.items = [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderBiz();
        };

        const renderBiz = () => {
            const data = getBizData();
            const list = document.getElementById('b-history-list');
            const elTotal = document.getElementById('b-total-laba');
            const elCount = document.getElementById('b-total-transaksi');

            let totalLaba = 0;
            list.innerHTML = '';
            
            data.items.forEach(item => {
                totalLaba += item.laba;
                const div = document.createElement('div');
                div.className = 'b-item';
                div.innerHTML = `
                    <div>
                        <div style="font-size:11px; font-weight:800; color:#fff">+${Zuna.fmt(item.laba)}</div>
                        <div style="font-size:8px; color:var(--sub); margin-top:2px">${item.time} • ${item.cat}</div>
                    </div>
                    <i class="ph ph-trash" onclick="delBizItem(${item.id})" style="color:#333; font-size:18px; cursor:pointer"></i>
                `;
                list.appendChild(div);
            });

            elTotal.innerText = 'Rp ' + Zuna.fmt(totalLaba);
            elCount.innerText = data.items.length + ' TRANSAKSI BERHASIL';
        };

        Zuna.bindFmt('b-input-laba');
        renderBiz();
    }
});