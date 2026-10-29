/* Uses native BarcodeDetector where available. Manual entry remains available on all browsers. */
(function(){
  let stream=null, timer=null, detector=null, onFound=null, busy=false;
  const video=()=>document.getElementById("scannerVideo");
  function stop(){
    if(timer) cancelAnimationFrame(timer); timer=null; busy=false;
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
    const v=video(); if(v){v.pause();v.srcObject=null;v.style.display="none";}
  }
  async function start(callback){
    onFound=callback;
    const status=document.getElementById("scannerStatus");
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){status.textContent="Browser ini belum mendukung akses kamera. Masukkan kode barcode secara manual.";return false;}
    if(!("BarcodeDetector" in window)){status.textContent="Scanner otomatis belum didukung browser ini. Coba Chrome terbaru atau masukkan kode manual.";return false;}
    try{
      detector=new BarcodeDetector({formats:["ean_13","ean_8","upc_a","upc_e","code_128","code_39","qr_code","itf","codabar"]});
      stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      const v=video();v.srcObject=stream;v.style.display="block";await v.play();
      status.textContent="Kamera aktif. Arahkan barcode ke kamera.";
      const loop=async()=>{
        if(!stream||busy)return;
        if(v.readyState>=2){try{const codes=await detector.detect(v);if(codes.length&&codes[0].rawValue){busy=true;const value=codes[0].rawValue;stop();if(onFound)onFound(value);return;}}catch(e){}}
        timer=requestAnimationFrame(loop);
      };loop();return true;
    }catch(e){status.textContent="Kamera tidak bisa dibuka. Pastikan izin kamera diberikan dan situs memakai HTTPS.";stop();return false;}
  }
  window.StockScanner={start,stop};
})();