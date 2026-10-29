/* Separate tools module: independent from stock inventory. */
(function(){
  const fmt=n=>"Rp"+Math.round(Number(n)||0).toLocaleString("id-ID");
  const safe=n=>Math.max(0,Number(n)||0);
  function field(label,id,placeholder,type="number"){return `<label class="field">${label}<input id="${id}" type="${type}" ${type==="number"?'min="0" step="any"':''} placeholder="${placeholder}"></label>`;}
  function render(name){
    const host=document.getElementById("toolWorkspace");
    const configs={
      profit:{title:"Kalkulator laba",desc:"Hitung laba dari modal dan harga jual.",fields:field("Harga modal (Rp)","tCost","Contoh: 1800")+field("Harga jual (Rp)","tSell","Contoh: 2500")+field("Jumlah barang","tQty","1"),button:"Hitung laba",run:()=>{let c=safe(document.getElementById("tCost").value),s=safe(document.getElementById("tSell").value),q=Math.max(1,safe(document.getElementById("tQty").value)||1);return `Laba per barang: ${fmt(s-c)}<br>Total laba: <b>${fmt((s-c)*q)}</b>`;}},
      price:{title:"Kalkulator harga jual",desc:"Tentukan harga jual berdasarkan target laba per barang.",fields:field("Harga modal (Rp)","tCost","Contoh: 1800")+field("Target laba (Rp)","tTarget","Contoh: 500"),button:"Hitung harga",run:()=>fmt(safe(document.getElementById("tCost").value)+safe(document.getElementById("tTarget").value))},
      expense:{title:"Catatan pengeluaran",desc:"Simpan pengeluaran usaha secara lokal di perangkat ini.",fields:field("Nama pengeluaran","tExpenseName","Contoh: ongkos kulakan","text")+field("Nominal (Rp)","tExpenseAmount","Contoh: 10000"),button:"Simpan pengeluaran",run:async()=>{const name=document.getElementById("tExpenseName").value.trim(),amount=safe(document.getElementById("tExpenseAmount").value);if(!name||!amount)throw Error("Isi nama dan nominal pengeluaran.");await StockDB.put("expenses",{id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name,amount,createdAt:new Date().toISOString()});return `Pengeluaran ${name} sebesar ${fmt(amount)} tersimpan.`;}},
      converter:{title:"Banding harga",desc:"Bandingkan harga per satuan untuk memilih yang lebih hemat.",fields:field("Harga barang A (Rp)","tPriceA","Contoh: 12000")+field("Isi barang A","tQtyA","Contoh: 1000")+field("Harga barang B (Rp)","tPriceB","Contoh: 15000")+field("Isi barang B","tQtyB","Contoh: 1500"),button:"Bandingkan",run:()=>{let a=safe(document.getElementById("tPriceA").value)/safe(document.getElementById("tQtyA").value),b=safe(document.getElementById("tPriceB").value)/safe(document.getElementById("tQtyB").value);if(!Number.isFinite(a)||!Number.isFinite(b)||!safe(document.getElementById("tQtyA").value)||!safe(document.getElementById("tQtyB").value))throw Error("Isi harga dan jumlah dengan benar.");return `Harga per unit A: ${fmt(a)}<br>Harga per unit B: ${fmt(b)}<br><b>${a<b?"Barang A lebih hemat":b<a?"Barang B lebih hemat":"Harga per unit sama"}</b>`;}}
    };
    const c=configs[name];if(!c)return;
    host.innerHTML=`<div class="tool-panel"><h3>${c.title}</h3><p class="muted">${c.desc}</p><div class="tool-fields">${c.fields}</div><button class="primary-btn" id="runTool" style="margin-top:15px">${c.button}</button><div id="toolResult" class="tool-result hidden"></div></div>`;
    document.getElementById("runTool").addEventListener("click",async()=>{const result=document.getElementById("toolResult");try{const value=await c.run();result.innerHTML=String(value);result.classList.remove("hidden");}catch(e){result.textContent=e.message||"Terjadi kesalahan.";result.classList.remove("hidden");}});
  }
  window.StockTools={render};
})();