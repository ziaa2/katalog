const KEY="warungku_v1";
const defaults={products:[],customers:[],transactions:[],debts:[],categories:["Sembako","Makanan","Minuman","Rokok","Pulsa","Perawatan","Lainnya"],theme:"dark"};
let db=load(); let currentPeriod="today"; let selectedCategory="Semua"; let scanner=null;

function load(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaults}}}
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function rupiah(n){return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0)}
function dateKey(d=new Date()){return new Date(d).toISOString().slice(0,10)}
function fmtDate(s){return new Date(s).toLocaleString("id-ID",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})}
function uid(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7)}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function toast(t){let x=document.querySelector("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function openModal(html){document.querySelector("#sheet").innerHTML=html;document.querySelector("#modal").classList.remove("hidden")}
function closeModal(){document.querySelector("#modal").classList.add("hidden");stopScanner()}
function nav(page){document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.dataset.page===page));document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.pageLink===page));document.querySelector("#fab").style.display=page==="more"?"none":"block"; if(page==="home")renderHome();if(page==="products")renderProducts();if(page==="transactions")renderTransactions();if(page==="customers")renderCustomers()}

document.addEventListener("click",e=>{
 const pl=e.target.closest("[data-page-link]"); if(pl){nav(pl.dataset.pageLink);return}
 const act=e.target.closest("[data-action]"); if(act){actions(act.dataset.action);return}
 if(e.target.id==="modal")closeModal();
});
document.querySelector("#themeBtn").onclick=()=>{db.theme=db.theme==="dark"?"light":"dark";applyTheme();save()}
document.querySelector("#fab").onclick=()=>actions("sale");

function applyTheme(){document.documentElement.style.setProperty("--bg",db.theme==="light"?"#f4f6f8":"#0b0f14");document.documentElement.style.setProperty("--card",db.theme==="light"?"#fff":"#121821");document.documentElement.style.setProperty("--card2",db.theme==="light"?"#eef1f4":"#171f2a");document.documentElement.style.setProperty("--text",db.theme==="light"?"#10151b":"#f4f7fb");document.documentElement.style.setProperty("--muted",db.theme==="light"?"#68717d":"#8f9aaa");document.documentElement.style.setProperty("--line",db.theme==="light"?"#d9dee5":"#25303d");document.querySelector('meta[name="theme-color"]').content=db.theme==="light"?"#f4f6f8":"#0b0f14"}

function actions(a){
 if(a==="sale")saleForm();
 if(a==="profit")moneyForm("profit");
 if(a==="expense")moneyForm("expense");
 if(a==="product")productForm();
 if(a==="customer")customerForm();
 if(a==="scan")scanForm();
 if(a==="debt")debtForm();
 if(a==="report")reportForm();
 if(a==="backup")backup();
 if(a==="restore")document.querySelector("#restoreInput").click();
 if(a==="categories")categoryForm();
 if(a==="reset")resetData();
}

function moneyForm(type){
 openModal(`<div class="sheet-head"><h2>${type==="profit"?"Catat Laba":"Catat Pengeluaran"}</h2><button class="close" onclick="closeModal()">×</button></div>
 <form class="form" onsubmit="saveMoney(event,'${type}')">
 <div class="field"><label>Nominal</label><input id="mAmount" type="number" min="0" required placeholder="5000" inputmode="numeric"></div>
 <div class="field"><label>Keterangan</label><input id="mNote" placeholder="${type==="profit"?"Contoh: laba tambahan":"Contoh: listrik"}"></div>
 <div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form>`);
}
function saveMoney(e,type){e.preventDefault();db.transactions.unshift({id:uid(),type,amount:+document.getElementById("mAmount").value,note:document.getElementById("mNote").value,date:new Date().toISOString()});save();closeModal();refresh();toast("Tersimpan")}

function saleForm(prefill=null){
 let opts=db.products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${rupiah(p.sell)}</option>`).join("");
 openModal(`<div class="sheet-head"><h2>Tambah Penjualan</h2><button class="close" onclick="closeModal()">×</button></div>
 <form class="form" onsubmit="saveSale(event)">
 <div class="field"><label>Produk</label><select id="sProduct">${opts||"<option value=''>Belum ada produk</option>"}</select></div>
 <div class="field"><label>Jumlah</label><input id="sQty" type="number" min="1" value="1" required></div>
 <div class="field"><label>Pelanggan (opsional)</label><select id="sCustomer"><option value="">Umum</option>${db.customers.map(c=>`<option value="${c.id}">${esc(c.name)} — ${esc(c.phone)}</option>`).join("")}</select></div>
 <div class="field"><label>Catatan</label><input id="sNote" placeholder="Opsional"></div>
 <div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary" ${opts?"":"disabled"}>Simpan penjualan</button></div>
 </form>`);
}
function saveSale(e){e.preventDefault();let p=db.products.find(x=>x.id===document.getElementById("sProduct").value);if(!p)return;let q=+document.getElementById("sQty").value;let total=p.sell*q,profit=(p.sell-p.cost)*q;p.stock=Math.max(0,(+p.stock||0)-q);db.transactions.unshift({id:uid(),type:"sale",productId:p.id,customerId:document.getElementById("sCustomer").value,qty:q,amount:total,profit,note:document.getElementById("sNote").value,date:new Date().toISOString()});save();closeModal();refresh();toast("Penjualan tersimpan")}

function productForm(id=null){
 let p=id?db.products.find(x=>x.id===id):null;
 openModal(`<div class="sheet-head"><h2>${p?"Edit Produk":"Tambah Produk"}</h2><button class="close" onclick="closeModal()">×</button></div>
 <form class="form" onsubmit="saveProduct(event,'${id||""}')">
 <div class="field"><label>Nama barang</label><input id="pName" value="${esc(p?.name||"")}" required></div>
 <div class="field"><label>Kategori</label><select id="pCat">${db.categories.map(c=>`<option ${p?.cat===c?"selected":""}>${esc(c)}</option>`).join("")}</select></div>
 <div class="field"><label>Harga modal</label><input id="pCost" type="number" min="0" value="${p?.cost||0}" required inputmode="numeric"></div>
 <div class="field"><label>Harga jual</label><input id="pSell" type="number" min="0" value="${p?.sell||0}" required inputmode="numeric"></div>
 <div class="field"><label>Stok</label><input id="pStock" type="number" min="0" value="${p?.stock||0}" required></div>
 <div class="field"><label>Stok minimum</label><input id="pMin" type="number" min="0" value="${p?.min||3}"></div>
 <div class="field"><label>Kode Barcode / QR (opsional)</label><input id="pCode" value="${esc(p?.code||"")}" placeholder="Scan atau ketik kode"></div>
 <div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form>`);
}
function saveProduct(e,id){e.preventDefault();let p=id?db.products.find(x=>x.id===id):{id:uid()};Object.assign(p,{name:document.getElementById("pName").value,cat:document.getElementById("pCat").value,cost:+document.getElementById("pCost").value,sell:+document.getElementById("pSell").value,stock:+document.getElementById("pStock").value,min:+document.getElementById("pMin").value,code:document.getElementById("pCode").value.trim()});if(!id)db.products.unshift(p);save();closeModal();refresh();toast("Produk tersimpan")}
function deleteProduct(id){if(confirm("Hapus produk ini?")){db.products=db.products.filter(p=>p.id!==id);save();refresh()}}
function stockForm(id){let p=db.products.find(x=>x.id===id);openModal(`<div class="sheet-head"><h2>Tambah stok</h2><button class="close" onclick="closeModal()">×</button></div><form class="form" onsubmit="addStock(event,'${id}')"><div class="field"><label>${esc(p.name)} • stok sekarang ${p.stock}</label><input id="stockAdd" type="number" min="1" required></div><div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary">Tambah</button></div></form>`)}
function addStock(e,id){e.preventDefault();let p=db.products.find(x=>x.id===id);p.stock+=+document.getElementById("stockAdd").value;save();closeModal();refresh();toast("Stok ditambah")}

function renderProducts(){
 let q=(document.querySelector("#productSearch").value||"").toLowerCase();
 document.querySelector("#categoryChips").innerHTML=["Semua",...db.categories].map(c=>`<button class="chip ${selectedCategory===c?"active":""}" onclick="selectedCategory='${esc(c)}';renderProducts()">${esc(c)}</button>`).join("");
 let arr=db.products.filter(p=>(selectedCategory==="Semua"||p.cat===selectedCategory)&&(`${p.name} ${p.cat} ${p.code||""}`).toLowerCase().includes(q));
 document.querySelector("#productList").innerHTML=arr.length?arr.map(p=>`<div class="item"><div class="item-main"><div class="item-title">${esc(p.name)}</div><div class="item-meta">${esc(p.cat)} • Modal ${rupiah(p.cost)} • Jual ${rupiah(p.sell)} • Laba ${rupiah(p.sell-p.cost)}</div><div class="item-meta ${p.stock<=p.min?"warn":""}">Stok: <b>${p.stock}</b>${p.code?" • "+esc(p.code):""}</div></div><div class="item-actions"><button class="mini" onclick="stockForm('${p.id}')">Stok</button><button class="mini" onclick="productForm('${p.id}')">Edit</button><button class="mini danger" onclick="deleteProduct('${p.id}')">×</button></div></div>`).join(""):`<div class="item"><div class="item-main"><div class="item-title">Belum ada produk</div><div class="item-meta">Tekan + untuk menambahkan barang.</div></div></div>`;
}

function customerForm(id=null){let c=id?db.customers.find(x=>x.id===id):null;openModal(`<div class="sheet-head"><h2>${c?"Edit Pelanggan":"Tambah Pelanggan"}</h2><button class="close" onclick="closeModal()">×</button></div><form class="form" onsubmit="saveCustomer(event,'${id||""}')"><div class="field"><label>Nama</label><input id="cName" value="${esc(c?.name||"")}" required></div><div class="field"><label>Nomor WhatsApp / telepon</label><input id="cPhone" value="${esc(c?.phone||"")}" inputmode="tel"></div><div class="field"><label>Catatan</label><textarea id="cNote">${esc(c?.note||"")}</textarea></div><div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form>`)}
function saveCustomer(e,id){e.preventDefault();let c=id?db.customers.find(x=>x.id===id):{id:uid()};Object.assign(c,{name:document.getElementById("cName").value,phone:document.getElementById("cPhone").value,note:document.getElementById("cNote").value});if(!id)db.customers.unshift(c);save();closeModal();refresh();toast("Pelanggan tersimpan")}
function renderCustomers(){let q=(document.getElementById("customerSearch").value||"").toLowerCase();let arr=db.customers.filter(c=>(c.name+" "+c.phone).toLowerCase().includes(q));document.querySelector("#customerList").innerHTML=arr.length?arr.map(c=>{let total=db.transactions.filter(t=>t.customerId===c.id&&t.type==="sale").reduce((a,t)=>a+t.amount,0);let wa=c.phone.replace(/\D/g,"");return `<div class="item"><div class="item-main"><div class="item-title">${esc(c.name)}</div><div class="item-meta">${esc(c.phone||"Tanpa nomor")} • Total ${rupiah(total)}</div><div class="item-meta">${esc(c.note||"")}</div></div><div class="item-actions">${wa?`<button class="mini" onclick="location.href='https://wa.me/${wa}'">WA</button>`:""}<button class="mini" onclick="customerForm('${c.id}')">Edit</button><button class="mini danger" onclick="deleteCustomer('${c.id}')">×</button></div></div>`}).join(""):`<div class="item"><div class="item-title">Belum ada pelanggan</div></div>`}
function deleteCustomer(id){if(confirm("Hapus pelanggan?")){db.customers=db.customers.filter(x=>x.id!==id);save();refresh()}}

function periodMatch(date,p){let d=new Date(date),now=new Date();if(p==="today")return dateKey(d)===dateKey(now);let diff=(now-d)/86400000;if(p==="week")return diff>=0&&diff<7;if(p==="month")return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();return true}
function renderTransactions(){let arr=db.transactions.filter(t=>periodMatch(t.date,currentPeriod));document.querySelector("#transactionList").innerHTML=arr.length?arr.map(t=>{let p=db.products.find(x=>x.id===t.productId);let label=t.type==="sale"?(p?.name||"Penjualan"):(t.type==="profit"?"Laba":"Pengeluaran");let val=t.type==="expense"?-t.amount:(t.type==="sale"?t.profit:t.amount);return `<div class="item"><div class="item-main"><div class="item-title">${esc(label)}</div><div class="item-meta">${fmtDate(t.date)}${t.qty?" • "+t.qty+" pcs":""}${t.note?" • "+esc(t.note):""}</div></div><b class="${val>=0?"good":"danger"}">${val>=0?"+":"−"}${rupiah(Math.abs(val))}</b></div>`}).join(""):`<div class="item"><div class="item-title">Belum ada transaksi pada periode ini.</div></div>`}
document.querySelector("#productSearch").addEventListener("input",renderProducts);document.querySelector("#customerSearch").addEventListener("input",renderCustomers);document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{currentPeriod=b.dataset.period;document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderTransactions()});

function scanForm(){openModal(`<div class="sheet-head"><h2>Scan QR / Barcode</h2><button class="close" onclick="closeModal()">×</button></div><div class="scan-box"><video id="scannerVideo" playsinline></video></div><div class="scan-note" id="scanStatus">Izinkan kamera. Arahkan ke barcode/QR produk.</div><div class="form-actions"><button class="btn" onclick="closeModal()">Tutup</button><button class="btn primary" onclick="manualCode()">Input kode</button></div>`);startScanner()}
async function startScanner(){if(!("BarcodeDetector" in window)){document.querySelector("#scanStatus").textContent="Browser ini belum mendukung scanner otomatis. Gunakan Input kode.";return}try{scanner=new BarcodeDetector({formats:["qr_code","ean_13","ean_8","code_128","code_39","upc_a","upc_e"]});let stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}}});let v=document.querySelector("#scannerVideo");v.srcObject=stream;await v.play();scanLoop(v)}catch(e){document.querySelector("#scanStatus").textContent="Kamera tidak bisa dibuka. Pastikan izin kamera aktif dan situs memakai HTTPS."}}
async function scanLoop(v){if(!scanner||document.querySelector("#modal").classList.contains("hidden"))return;try{let codes=await scanner.detect(v);if(codes.length){let code=codes[0].rawValue;let p=db.products.find(x=>x.code===code);if(p){stopScanner();saleForm();setTimeout(()=>{if(document.querySelector("#sProduct"))document.getElementById("sProduct").value=p.id},100);toast("Produk ditemukan")}else{stopScanner();productForm();setTimeout(()=>{if(document.querySelector("#pCode"))document.getElementById("pCode").value=code},100);toast("Kode baru siap didaftarkan")}return}}catch(e){}requestAnimationFrame(()=>scanLoop(v))}
function stopScanner(){let v=document.querySelector("#scannerVideo");if(v?.srcObject)v.srcObject.getTracks().forEach(t=>t.stop());scanner=null}
function manualCode(){let code=prompt("Masukkan barcode / QR:");if(!code)return;let p=db.products.find(x=>x.code===code);closeModal();if(p){saleForm();setTimeout(()=>document.getElementById("sProduct").value=p.id,100)}else{productForm();setTimeout(()=>document.getElementById("pCode").value=code,100)}}

function debtForm(){openModal(`<div class="sheet-head"><h2>Hutang / Piutang</h2><button class="close" onclick="closeModal()">×</button></div><form class="form" onsubmit="saveDebt(event)"><div class="field"><label>Jenis</label><select id="dType"><option value="receivable">Pelanggan berhutang ke saya</option><option value="payable">Saya berhutang</option></select></div><div class="field"><label>Nama</label><input id="dName" required></div><div class="field"><label>Nominal</label><input id="dAmount" type="number" min="0" required></div><div class="field"><label>Catatan</label><input id="dNote"></div><div class="form-actions"><button class="btn" type="button" onclick="closeModal()">Batal</button><button class="btn primary">Simpan</button></div></form><div class="section-head"><h2>Daftar</h2></div><div class="list">${db.debts.length?db.debts.map(d=>`<div class="item"><div class="item-main"><div class="item-title">${esc(d.name)} <small>${d.type==="receivable"?"Piutang":"Hutang"}</small></div><div class="item-meta">${rupiah(d.amount)} • ${esc(d.note||"")}</div></div><button class="mini ${d.paid?"":"good"}" onclick="toggleDebt('${d.id}')">${d.paid?"Lunas":"Tandai lunas"}</button></div>`).join(""):"<div class='item'><div class='item-meta'>Belum ada.</div></div>"}</div>`)}
function saveDebt(e){e.preventDefault();db.debts.unshift({id:uid(),type:document.getElementById("dType").value,name:document.getElementById("dName").value,amount:+document.getElementById("dAmount").value,note:document.getElementById("dNote").value,paid:false,date:new Date().toISOString()});save();closeModal();actions("debt");toast("Dicatat")}
function toggleDebt(id){let d=db.debts.find(x=>x.id===id);d.paid=!d.paid;save();actions("debt")}

function reportForm(){let sales=db.transactions.filter(t=>t.type==="sale").reduce((a,t)=>a+t.amount,0),profit=db.transactions.reduce((a,t)=>a+(t.type==="sale"?t.profit:t.type==="profit"?t.amount:-t.amount),0),exp=db.transactions.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);openModal(`<div class="sheet-head"><h2>Laporan</h2><button class="close" onclick="closeModal()">×</button></div><div class="report-grid"><div class="report-box"><small>Total penjualan</small><b>${rupiah(sales)}</b></div><div class="report-box"><small>Total laba</small><b class="good">${rupiah(profit)}</b></div><div class="report-box"><small>Pengeluaran</small><b class="danger">${rupiah(exp)}</b></div><div class="report-box"><small>Transaksi</small><b>${db.transactions.filter(t=>t.type==="sale").length}</b></div></div><div class="section-head"><h2>Produk</h2></div><div class="list">${db.products.slice(0,10).map(p=>`<div class="item"><span>${esc(p.name)}</span><b>${p.stock} stok</b></div>`).join("")||"<div class='item'>Belum ada produk.</div>"}</div>`)}
function categoryForm(){openModal(`<div class="sheet-head"><h2>Kategori produk</h2><button class="close" onclick="closeModal()">×</button></div><form class="form" onsubmit="addCategory(event)"><div class="field"><label>Kategori baru</label><input id="newCat" required></div><button class="btn primary">Tambah kategori</button></form><div class="section-head"><h2>Kategori</h2></div><div class="list">${db.categories.map(c=>`<div class="item"><span>${esc(c)}</span><button class="mini danger" onclick="deleteCategory('${esc(c)}')">Hapus</button></div>`).join("")}</div>`)}
function addCategory(e){e.preventDefault();let x=document.getElementById("newCat").value.trim();if(x&&!db.categories.includes(x))db.categories.push(x);save();closeModal();actions("categories")}
function deleteCategory(c){if(db.products.some(p=>p.cat===c)){toast("Kategori masih dipakai produk");return}db.categories=db.categories.filter(x=>x!==c);save();actions("categories")}

function backup(){let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`warungku-backup-${dateKey()}.json`;a.click();URL.revokeObjectURL(a.href);toast("Backup dibuat")}
document.querySelector("#restoreInput").onchange=e=>{let f=e.target.files[0];if(!f)return;let r=new FileReader();r.onload=()=>{try{let x=JSON.parse(r.result);if(!x.products||!x.transactions)throw 0;if(confirm("Ganti data sekarang dengan backup ini?")){db={...defaults,...x};save();refresh();toast("Backup dipulihkan")}}catch{alert("File backup tidak valid")}};r.readAsText(f);e.target.value=""}
function resetData(){if(confirm("Hapus SEMUA data? Pastikan sudah backup.")){localStorage.removeItem(KEY);db=load();refresh();toast("Data direset")}}

function renderHome(){
 let today=db.transactions.filter(t=>dateKey(t.date)===dateKey());
 let sales=today.filter(t=>t.type==="sale").reduce((a,t)=>a+t.amount,0), profit=today.reduce((a,t)=>a+(t.type==="sale"?t.profit:t.type==="profit"?t.amount:-t.amount),0),expense=today.filter(t=>t.type==="expense").reduce((a,t)=>a+t.amount,0);
 document.getElementById("todayProfit").textContent=rupiah(profit);document.getElementById("todaySales").textContent="Penjualan "+rupiah(sales);document.getElementById("todayExpense").textContent="Pengeluaran "+rupiah(expense);document.getElementById("todayTx").textContent=today.filter(t=>t.type==="sale").length;document.getElementById("productCount").textContent=db.products.length;document.getElementById("customerCount").textContent=db.customers.length;document.getElementById("lowStock").textContent=db.products.filter(p=>p.stock<=p.min).length;
 let low=db.products.filter(p=>p.stock<=p.min).slice(0,5);document.getElementById("lowStockList").innerHTML=low.length?low.map(p=>`<div class="item"><div><b>${esc(p.name)}</b><div class="item-meta">${esc(p.cat)}</div></div><b class="warn">${p.stock} tersisa</b></div>`).join(""):"<div class='item'><div class='item-meta'>Semua stok masih aman 🎉</div></div>";drawChart();
}
function drawChart(){let c=document.querySelector("#profitChart"),ctx=c.getContext("2d"),w=c.width=c.clientWidth*devicePixelRatio,h=c.height=c.clientHeight*devicePixelRatio;ctx.clearRect(0,0,w,h);let vals=[];for(let i=6;i>=0;i--){let d=new Date();d.setDate(d.getDate()-i);let k=dateKey(d);vals.push(db.transactions.filter(t=>dateKey(t.date)===k).reduce((a,t)=>a+(t.type==="sale"?t.profit:t.type==="profit"?t.amount:-t.amount),0))}let max=Math.max(1,...vals.map(Math.abs)),pad=18;ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--line");ctx.beginPath();ctx.moveTo(pad,h-pad);ctx.lineTo(w-pad,h-pad);ctx.stroke();ctx.strokeStyle=getComputedStyle(document.documentElement).getPropertyValue("--accent");ctx.lineWidth=3;ctx.beginPath();vals.forEach((v,i)=>{let x=pad+i*(w-pad*2)/6,y=h-pad-(Math.max(0,v)/max)*(h-pad*2);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke();ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue("--muted");ctx.font=`${11*devicePixelRatio}px sans-serif`;ctx.fillText("6h",pad,h-4);ctx.fillText("Hari ini",w-48*devicePixelRatio,h-4)}

function refresh(){renderHome();renderProducts();renderTransactions();renderCustomers()}
applyTheme();refresh();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
