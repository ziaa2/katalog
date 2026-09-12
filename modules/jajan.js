Zuna.register({
    id: 'f-jajan',
    category: 'keuangan',
    title: 'Catat Jajan',
    desc: 'Sekali klik langsung catat',
    icon: 'ph ph-cookie',
    html: `
        <!-- SUMMARY ATAS -->
        <div class="tool-ui" style="text-align: center; background: #1a1a1a; border: 1px solid #333; margin-bottom: 15px;">
            <span class="label" style="opacity: 0.7;">TOTAL PENGELUARAN HARI INI</span>
            <div id="j-total" style="font-size: 32px; font-weight: 800; color: #ff4444; font-family: 'JetBrains Mono';">Rp 0</div>
        </div>

        <div class="tool-ui">
            <!-- LABEL -->
            <span class="label" style="text-align:center; margin-bottom:15px">Klik nominal untuk mencatat:</span>
            
            <!-- TOMBOL INSTAN -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
                <button class="j-btn" onclick="addJajanInstan(1000)">+1K</button>
                <button class="j-btn" onclick="addJajanInstan(2000)">+2K</button>
                <button class="j-btn" onclick="addJajanInstan(3000)">+3K</button>
                <button class="j-btn" onclick="addJajanInstan(5000)">+5K</button>
                <button class="j-btn" onclick="addJajanInstan(10000)">+10K</button>
                <button class="j-btn" onclick="addJajanInstan(20000)">+20K</button>
            </div>

            <!-- INPUT MANUAL (TETAP DISEDIAKAN) -->
            <div style="display:flex; gap:10px; align-items:center; border-top:1px solid #222; padding-top:20px">
                <input type="tel" id="j-manual" placeholder="Nominal lain..." style="margin-bottom:0; font-size:16px; border-bottom:1px solid #333">
                <button onclick="saveJajanManual()" style="background:#fff; color:#000; border:none; padding:10px 15px; border-radius:10px; font-weight:800; font-size:11px">OK</button>
            </div>

            <!-- RIWAYAT -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin: 25px 0 10px;">
                <span class="label" style="margin:0">Riwayat Hari Ini</span>
                <span onclick="clearJajanAll()" style="font-size: 8px; color: var(--sub); font-weight: 800; cursor: pointer;">HAPUS SEMUA</span>
            </div>
            <div id="j-list" style="display: flex; flex-direction: column; gap: 5px;"></div>
        </div>

        <style>
            .j-btn { background: #111; border: 1px solid #222; color: #fff; padding: 18px 5px; border-radius: 15px; font-size: 13px; font-weight: 800; cursor: pointer; transition: 0.1s; }
            .j-btn:active { transform: scale(0.9); background: #ff4444; color: #fff; border-color: #ff4444; }
            .j-item { background: #080808; border: 1px solid #151515; padding: 10px 15px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
        </style>
    `,
    logic: () => {
        const STORAGE_KEY = 'zuna_jajan_v1';

        const getJajanData = () => {
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

        window.addJajanInstan = (val) => {
            const data = getJajanData();
            data.items.unshift({
                id: Date.now(),
                val: val,
                time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
            });

            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderJajan();
            
            // Efek feedback getar/suara (opsional di browser tertentu)
            if (navigator.vibrate) navigator.vibrate(50);
        };

        window.saveJajanManual = () => {
            const val = Zuna.val('j-manual');
            if (val <= 0) return;
            addJajanInstan(val);
            document.getElementById('j-manual').value = '';
        };

        window.delJajanItem = (id) => {
            const data = getJajanData();
            data.items = data.items.filter(i => i.id !== id);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderJajan();
        };

        window.clearJajanAll = () => {
            if(!confirm('Hapus semua?')) return;
            const data = getJajanData();
            data.items = [];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            renderJajan();
        };

        const renderJajan = () => {
            const data = getJajanData();
            const list = document.getElementById('j-list');
            const elTotal = document.getElementById('j-total');

            let total = 0;
            list.innerHTML = '';
            
            data.items.forEach(item => {
                total += item.val;
                const div = document.createElement('div');
                div.className = 'j-item';
                div.innerHTML = `
                    <div>
                        <div style="font-size:12px; font-weight:800; color:#fff">Rp ${Zuna.fmt(item.val)}</div>
                        <div style="font-size:8px; color:var(--sub); margin-top:2px">${item.time}</div>
                    </div>
                    <i class="ph ph-trash" onclick="delJajanItem(${item.id})" style="color:#222; font-size:16px; cursor:pointer"></i>
                `;
                list.appendChild(div);
            });

            elTotal.innerText = 'Rp ' + Zuna.fmt(total);
        };

        Zuna.bindFmt('j-manual');
        renderJajan();
    }
});