const KEY = "masz_catatan_belanja";

const $ = (q, el = document) => el.querySelector(q);
const money = n => n.toLocaleString("id-ID");

const load = () => JSON.parse(localStorage.getItem(KEY) || "[]");
const save = data => localStorage.setItem(KEY, JSON.stringify(data));

export function mount(el) {
  let items = load();

  el.innerHTML = `
  <style>
    .belanja{padding:4px 2px 30px;animation:up .25s ease}
    @keyframes up{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .add{display:grid;grid-template-columns:1fr 75px 45px;gap:7px;margin-bottom:12px}
    input,button{border:0;border-radius:12px;height:44px;box-sizing:border-box}
    input{padding:0 12px;background:#171c20;border:1px solid #292e32;color:white;outline:0}
    button{background:#1b2025;color:#aaa;font-size:18px;cursor:pointer}
    .add button{background:#d6a26f;color:#151515;font-weight:bold}
    .item{display:flex;align-items:center;gap:10px;background:#171c20;border:1px solid #292e32;padding:12px;border-radius:14px;margin-bottom:7px}
    .item input{width:20px;height:20px;accent-color:#d6a26f}
    .name{flex:1;color:#eee}.qty{color:#d6a26f;font-weight:bold}
    .done{text-decoration:line-through;color:#666}
    .del{width:35px;height:35px;font-size:14px}
    .clear{width:100%;margin-top:12px;color:#ff7d87}
    .empty{text-align:center;color:#666;padding:25px}
  </style>

  <div class="belanja">
    <div class="add">
      <input id="name" placeholder="Nama barang">
      <input id="qty" type="number" min="1" value="1" placeholder="Jumlah">
      <button id="add">+</button>
    </div>

    <div id="list"></div>
    <button class="clear" id="clear">🗑 Hapus Semua</button>
  </div>
  `;

  const render = () => {
    $("#list",el).innerHTML = items.length
      ? items.map((x,i) => `
        <div class="item">
          <input type="checkbox" data-check="${i}" ${x.done ? "checked" : ""}>
          <span class="name ${x.done ? "done" : ""}">${x.name}</span>
          <span class="qty">${x.qty}x</span>
          <button class="del" data-del="${i}">×</button>
        </div>
      `).join("")
      : `<div class="empty">Belum ada catatan belanja.</div>`;

    el.querySelectorAll("[data-check]").forEach(b => {
      b.onchange = () => {
        items[b.dataset.check].done = b.checked;
        save(items);
        render();
      };
    });

    el.querySelectorAll("[data-del]").forEach(b => {
      b.onclick = () => {
        items.splice(b.dataset.del,1);
        save(items);
        render();
      };
    });
  };

  $("#add",el).onclick = () => {
    const name = $("#name",el).value.trim();
    const qty = Math.max(1,+$("#qty",el).value || 1);

    if(!name) return;

    items.push({name,qty,done:false});
    save(items);

    $("#name",el).value = "";
    $("#qty",el).value = 1;
    $("#name",el).focus();

    render();
  };

  $("#name",el).onkeydown = e => {
    if(e.key === "Enter") $("#add",el).click();
  };

  $("#clear",el).onclick = () => {
    if(!items.length) return;
    if(confirm("Hapus semua catatan belanja?")){
      items = [];
      save(items);
      render();
    }
  };

  render();
}
