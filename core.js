const Zuna = {
    _queue: [],

    // FUNGSI SEARCH
    search: (query) => {
        const q = query.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const content = card.innerText.toLowerCase();
            card.style.display = content.includes(q) ? 'flex' : 'none';
        });
    },

    // FUNGSI FILTER TAB
    filterCategory: (cat, btn) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.card').forEach(card => {
            const cardCat = card.getAttribute('data-cat') || 'all';
            if (cat === 'all' || cardCat === cat) card.style.display = 'flex';
            else card.style.display = 'none';
        });
    },

    fmt: (v) => {
        if (v === undefined || v === null) return '';
        let num = v.toString().replace(/[^0-9]/g, '');
        return num ? parseInt(num).toLocaleString('id-ID') : '';
    },

    val: (id) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        return parseFloat(el.value.replace(/\./g, '')) || 0;
    },

    bindFmt: (id, callback) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
            let cursor = e.target.selectionStart;
            let oldLen = e.target.value.length;
            e.target.value = Zuna.fmt(e.target.value);
            let newLen = e.target.value.length;
            cursor = cursor + (newLen - oldLen);
            e.target.setSelectionRange(cursor, cursor);
            if (callback) callback();
        });
    },

    open: (id) => {
        const target = document.getElementById(id);
        if (target) {
            target.style.display = 'block';
            history.pushState({ viewId: id }, "");
        }
    },

    close: () => {
        document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
    },

    register: (config) => {
        Zuna._queue.push(config);
        Zuna._processQueue();
    },

    _processQueue: () => {
        const grid = document.getElementById('main-dashboard');
        const container = document.getElementById('tool-container');
        if (!grid || !container) return;

        while (Zuna._queue.length > 0) {
            const config = Zuna._queue.shift();
            
            const card = document.createElement('div');
            card.className = 'card';
            card.setAttribute('data-cat', config.category || 'all');
            card.onclick = () => Zuna.open(config.id);
            card.innerHTML = `
                <div class="icon-wrapper"><i class="${config.icon}"></i></div>
                <div class="card-text">
                    <h3>${config.title}</h3>
                    <p>${config.desc}</p>
                </div>
            `;
            grid.appendChild(card);

            const view = document.createElement('div');
            view.id = config.id;
            view.className = 'view';
            view.innerHTML = `
                <span class="back-btn" onclick="history.back()">✕ KEMBALI</span>
                <div class="tool-content">
                    <h2 style="margin-bottom:20px; font-weight:800;">${config.title}</h2>
                    ${config.html}
                </div>
            `;
            container.appendChild(view);
            
            if (config.logic) config.logic();
        }
    }
};

window.onpopstate = () => Zuna.close();
document.addEventListener('DOMContentLoaded', () => {
    Zuna._processQueue();
});