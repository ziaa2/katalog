const KEY = "masz_stok_v2";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const money = n => new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0
}).format(n || 0);

const getDB = () => JSON.parse(localStorage.getItem(KEY) || "{}");
const saveDB = db => localStorage.setItem(KEY, JSON.stringify(db));

export function mount(el) {
  let db = getDB(), scanner, stream;

  el.innerHTML = `
  <style>
    .stok{padding:4px 2px 30px;animation:up .25s ease}
    @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .tabs,.grid{display:grid;gap:8px}
    .tabs{grid-template-columns:repeat(3,1fr);margin-bottom:12px}
    .tabs button,.btn{border:0;border-radius:13px;padding:12px;background:#1b2025;color:#aaa;cursor:pointer}
    .tabs .active{background:#352c24;color:#d6a26f}
    .card,.product{background:#171c20;border:1px solid #292e32;border-radius:17px;padding:14px}
    .camera{height:220px;background:#090c0e;border-radius:14px;overflow:hidden;position:relative}
    video{width:100%;height:100%;object-fit:cover}
    .scanline{position:absolute;left:10%;right:10%;top:50%;height:2px;background:#d6a26f;box-shadow:0 0 12px #d6a26f;animation:scan 1.5s infinite}
    @keyframes scan{0%,100%{transform:translateY(-70px)}50%{transform:translateY(70px)}}
    .msg{text-align:center;color:#777f87;font-size:12px;padding:9px}
    input{width:100%;height:46px;box-sizing:border-box;margin:5px 0 8px;padding:0 12px;border-radius:12px;background:#101519;border:1px solid #30363b;color:#fff;outline:0}
    input:focus{border-color:#d6a26f}
    .save{width:100%;height:47px;border:0;border-radius:13px;background:#d6a26f;color:#151515;font-weight:800}
    .grid{grid-template-columns:1fr 1fr}
    .product b{display:block}.product small{color:#737b83}.product strong{display:block;color:#d6a26f;margin:7px 0}
    .actions{display:flex;gap:6px}.actions button{flex:1}
    .danger{color:#ff818c}.empty{text-align:center;color:#737b83;padding:25px;border:1px dashed #343a3f;border-radius:15px}
    .hide{display:none}
  </style>

  <div class="stok">
    <div class="tabs">
      <button class="active" data-page="scan">📷 Scan</button>
      <button data-page="stock">📦 Stok</button>
      <button data-page="search">🔎 Cari</button>
    </div>

    <section id="scan">
      <div class="card">
        <div class="camera">
          <video id="video" autoplay muted playsinline></video>
          <div class="scanline"></div>
        </div>
        <div id="msg" class="msg">Arahkan barcode ke kamera</div>
        <input id="barcode" inputmode="numeric" placeholder="Ketik barcode manual">
        <button class="btn" id="manual" style="width:100%">Cari Barcode</button>
      </div>
    </section>

    <section id="form" class="hide">
      <div class="card">
        <b id="productName">Barang baru</b>
        <input id="name" placeholder="Nama barang">
        <input id="modal" type="number" inputmode="numeric" placeholder="Harga modal">
        <input id="jual" type="number" inputmode="numeric" placeholder="Harga jual">
        <input id="qty" type="number" inputmode="numeric" min="1" value="1" placeholder="Jumlah stok">
        <button class="save" id="save">Simpan Barang</button>
      </div>
    </section>

    <section id="stock" class="hide">
      <div id="list"></div>
    </section>

    <section id="search" class="hide">
      <input id="find" placeholder="Cari barang atau barcode...">
      <div id="results"></div>
    </section>
  </div>
  `;

  const page = id => ["scan","form","stock","search"].forEach(x =>
    $("#" + x,el).classList.toggle("hide", x !== id)
  );

  const render = (target, query="") => {
    const items = Object.values(db).filter(x =>
      !query || `${x.name} ${x.barcode}`.toLowerCase().includes(query.toLowerCase())
    );

    $(target,el).innerHTML = items.length
      ? `<div class="grid">${items.map(x => `
          <div class="product">
            <b>${x.name}</b>
            <small>${x.barcode}</small>
            <strong>Stok ${x.stock} · ${money(x.jual)}</strong>
            <div class="actions">
              <button class="btn" data-add="${x.barcode}">+1</button>
              <button class="btn danger" data-del="${x.barcode}">Hapus</button>
            </div>
          </div>
        `).join("")}</div>`
      : `<div class="empty">Belum ada barang.</div>`;

    $$("[data-add]",el).forEach(b => b.onclick = () => {
      db[b.dataset.add].stock++;
      saveDB(db);
      render(target,query);
    });

    $$("[data-del]",el).forEach(b => b.onclick = () => {
      if(confirm("Hapus barang ini?")) {
        delete db[b.dataset.del];
        saveDB(db);
        render(target,query);
      }
    });
  };

  const stop = () => {
    if(scanner) cancelAnimationFrame(scanner);
    if(stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  };

  const lookup = async raw => {
    const code = String(raw || "").replace(/\D/g,"");
    if(!code) return;

    if(db[code]) {
      db[code].stock++;
      saveDB(db);
      render("#list");
      $("#msg",el).textContent = `${db[code].name} · stok +1`;
      return;
    }

    $("#msg",el).textContent = "Mencari nama produk...";

    let name = "";

    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v3/product/${code}?fields=product_name`
      );
      const json = await res.json();
      name = json.product?.product_name || "";
    } catch {}

    $("#productName",el).textContent = name || "Barang baru";
    $("#name",el).value = name;
    $("#modal",el).value = "";
    $("#jual",el).value = "";
    $("#qty",el).value = 1;
    $("#save",el).dataset.code = code;

    stop();
    page("form");
  };

  const start = async () => {
    if(!("BarcodeDetector" in window)) {
      $("#msg",el).textContent =
        "Scanner tidak didukung. Ketik barcode manual.";
      return;
    }

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video:{facingMode:{ideal:"environment"}}
      });

      $("#video",el).srcObject = stream;

      const detector = new BarcodeDetector({
        formats:["ean_13","ean_8","upc_a","upc_e"]
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const scan = async () => {
        if(!stream) return;

        const video = $("#video",el);

        if(video.readyState >= 2) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video,0,0);

          try {
            const result = await detector.detect(canvas);
            if(result[0]?.rawValue) {
              stop();
              lookup(result[0].rawValue);
              return;
            }
          } catch {}
        }

        scanner = requestAnimationFrame(scan);
      };

      scan();

    } catch {
      $("#msg",el).textContent =
        "Kamera tidak tersedia. Ketik barcode manual.";
    }
  };

  $$("[data-page]",el).forEach(btn => btn.onclick = () => {
    $$(".tabs button",el).forEach(x => x.classList.remove("active"));
    btn.classList.add("active");

    stop();

    const p = btn.dataset.page;
    page(p);

    if(p === "scan") start();
    if(p === "stock") render("#list");
    if(p === "search") render("#results");
  });

  $("#manual",el).onclick = () =>
    lookup($("#barcode",el).value);

  $("#save",el).onclick = () => {
    const code = $("#save",el).dataset.code;
    const name = $("#name",el).value.trim();
    const modal = +$("#modal",el).value;
    const jual = +$("#jual",el).value;
    const qty = Math.max(1,+$("#qty",el).value || 1);

    if(!code || !name || modal < 0 || jual < 0)
      return alert("Lengkapi data barang.");

    db[code] = {
      barcode:code,
      name,
      modal,
      jual,
      stock:(db[code]?.stock || 0) + qty
    };

    saveDB(db);
    $("#barcode",el).value = "";
    $("#msg",el).textContent = `${name} tersimpan ✓`;

    page("scan");
    start();
  };

  $("#find",el).oninput = e =>
    render("#results",e.target.value);

  render("#list");
  start();

  new MutationObserver(() => {
    if(!document.body.contains(el)) stop();
  }).observe(document.body,{childList:true,subtree:true});
}
