const KEY = "masz_receh";

const rupiah = n =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(n);

const today = () => new Date().toLocaleDateString("en-CA");

const load = () => {
  let d;
  try { d = JSON.parse(localStorage.getItem(KEY)); } catch {}
  if (!d || d.date !== today()) {
    d = { date: today(), total: 0, items: [] };
    localStorage.setItem(KEY, JSON.stringify(d));
  }
  return d;
};

const save = d =>
  localStorage.setItem(KEY, JSON.stringify(d));

export function mount(el) {

  el.innerHTML = `
    <style>
      .receh{padding:4px 2px 30px;animation:in .25s ease}
      @keyframes in{from{opacity:0;transform:translateY(8px)}
      to{opacity:1;transform:none}}

      .r-total{
        text-align:center;
        padding:24px;
        margin-bottom:16px;
        border-radius:20px;
        background:linear-gradient(145deg,#211e1b,#17191b);
        border:1px solid rgba(214,162,111,.12)
      }

      .r-total small{color:#858c94}
      .r-total b{
        display:block;
        margin-top:5px;
        font-size:32px;
        color:#d6a26f;
        transition:.2s
      }

      .r-buttons{
        display:grid;
        grid-template-columns:repeat(2,1fr);
        gap:10px
      }

      .r-buttons button{
        height:65px;
        border:1px solid rgba(255,255,255,.07);
        border-radius:17px;
        background:#1b2025;
        color:#eee;
        font-size:20px;
        font-weight:800;
        cursor:pointer;
        transition:.15s
      }

      .r-buttons button:active{
        transform:scale(.92);
        background:#302920
      }

      .r-head{
        display:flex;
        justify-content:space-between;
        margin:25px 2px 10px
      }

      .r-head span{color:#737b83;font-size:12px}

      .r-list{
        display:flex;
        flex-direction:column;
        gap:7px
      }

      .r-item{
        display:flex;
        align-items:center;
        gap:11px;
        padding:11px;
        border-radius:14px;
        background:#171c20;
        animation:item .2s ease
      }

      @keyframes item{
        from{opacity:0;transform:translateX(-6px)}
        to{opacity:1;transform:none}
      }

      .r-icon{
        width:39px;
        height:39px;
        border-radius:11px;
        display:grid;
        place-items:center;
        background:#29251f;
        color:#d6a26f
      }

      .r-info{flex:1}
      .r-info b{display:block;font-size:14px}
      .r-info small{color:#70777f;font-size:11px}

      .r-del{
        width:29px;
        height:29px;
        border:0;
        border-radius:9px;
        background:#24292d;
        color:#777;
        cursor:pointer
      }

      .r-empty{
        text-align:center;
        padding:25px;
        border:1px dashed #343a3f;
        border-radius:15px;
        color:#70777f;
        font-size:13px
      }

      .r-reset{
        width:100%;
        height:43px;
        margin-top:12px;
        border:0;
        border-radius:13px;
        background:#191e22;
        color:#777f87;
        cursor:pointer
      }

      .r-toast{
        position:fixed;
        left:50%;
        bottom:90px;
        transform:translate(-50%,10px);
        opacity:0;
        padding:9px 14px;
        border-radius:12px;
        background:#252b30;
        color:#eee;
        font-size:12px;
        transition:.2s;
        pointer-events:none;
        z-index:9999
      }

      .r-toast.show{
        opacity:1;
        transform:translate(-50%,0)
      }
    </style>

    <div class="receh">

      <div class="r-total">
        <small>PENGELUARAN HARI INI</small>
        <b id="rTotal">Rp0</b>
      </div>

      <div class="r-buttons">
        <button data-v="1000">1K</button>
        <button data-v="2000">2K</button>
        <button data-v="3000">3K</button>
        <button data-v="5000">5K</button>
        <button data-v="10000">10K</button>
      </div>

      <div class="r-head">
        <strong>Jajan hari ini</strong>
        <span id="rCount">0 transaksi</span>
      </div>

      <div id="rList" class="r-list"></div>

      <button id="rReset" class="r-reset">
        Reset hari ini
      </button>

    </div>
  `;

  const total = el.querySelector("#rTotal");
  const list = el.querySelector("#rList");
  const count = el.querySelector("#rCount");

  let data = load();

  const toast = msg => {
    let t = document.querySelector(".r-toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "r-toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t.timer);
    t.timer = setTimeout(() => t.classList.remove("show"), 1000);
  };

  const render = () => {
    data = load();

    total.textContent = rupiah(data.total);
    count.textContent = `${data.items.length} transaksi`;

    list.innerHTML = data.items.length
      ? data.items.slice().reverse().map(x => `
        <div class="r-item">
          <div class="r-icon">Rp</div>
          <div class="r-info">
            <b>${rupiah(x.value)}</b>
            <small>${x.time}</small>
          </div>
          <button class="r-del" data-id="${x.id}">×</button>
        </div>
      `).join("")
      : `<div class="r-empty">
          Belum ada jajan hari ini 🍜
        </div>`;

    list.querySelectorAll(".r-del").forEach(btn => {
      btn.onclick = () => {
        data.items = data.items.filter(x => x.id !== btn.dataset.id);
        data.total = data.items.reduce((a, x) => a + x.value, 0);
        save(data);
        render();
        toast("Dihapus");
      };
    });
  };

  const add = value => {
    data = load();

    data.items.push({
      id: crypto.randomUUID?.() || Date.now() + Math.random(),
      value,
      time: new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
      })
    });

    data.total += value;
    save(data);
    render();

    total.animate(
      [
        {transform:"scale(1)"},
        {transform:"scale(1.12)"},
        {transform:"scale(1)"}
      ],
      {duration:180}
    );

    toast(`-${rupiah(value)}`);
  };

  el.querySelectorAll("[data-v]").forEach(btn => {
    btn.onclick = () => add(+btn.dataset.v);
  });

  el.querySelector("#rReset").onclick = () => {
    data = {
      date: today(),
      total: 0,
      items: []
    };

    save(data);
    render();
    toast("Di-reset");
  };

  render();

  const watcher = setInterval(() => {
    if (today() !== data.date) {
      data = load();
      render();
    }
  }, 15000);

  const observer = new MutationObserver(() => {
    if (!document.body.contains(el)) {
      clearInterval(watcher);
      observer.disconnect();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
