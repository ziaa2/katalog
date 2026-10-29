/* StockMate local database: IndexedDB with localStorage fallback. */
(function(){
  const DB_NAME = "stockmate-local-v1";
  const STORE_NAMES = ["products","history","shopping","expenses","settings"];
  let dbPromise;
  function openDB(){
    if(!("indexedDB" in window)) return Promise.resolve(null);
    if(dbPromise) return dbPromise;
    dbPromise = new Promise(resolve=>{
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{
        const db=req.result;
        STORE_NAMES.forEach(name=>{if(!db.objectStoreNames.contains(name)) db.createObjectStore(name,{keyPath:"id"});});
      };
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
    return dbPromise;
  }
  const fallbackKey = name => "stockmate:"+name;
  async function all(store){
    const db=await openDB();
    if(!db) return JSON.parse(localStorage.getItem(fallbackKey(store))||"[]");
    return new Promise(resolve=>{const req=db.transaction(store,"readonly").objectStore(store).getAll();req.onsuccess=()=>resolve(req.result||[]);req.onerror=()=>resolve([]);});
  }
  async function put(store,item){
    const db=await openDB();
    if(!db){const list=await all(store);const i=list.findIndex(x=>x.id===item.id);if(i<0)list.push(item);else list[i]=item;localStorage.setItem(fallbackKey(store),JSON.stringify(list));return item;}
    return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).put(item);tx.oncomplete=()=>resolve(item);tx.onerror=()=>reject(tx.error);});
  }
  async function remove(store,id){
    const db=await openDB();
    if(!db){localStorage.setItem(fallbackKey(store),JSON.stringify((await all(store)).filter(x=>x.id!==id)));return;}
    return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  }
  async function clear(store){
    const db=await openDB();
    if(!db){localStorage.setItem(fallbackKey(store),"[]");return;}
    return new Promise((resolve,reject)=>{const tx=db.transaction(store,"readwrite");tx.objectStore(store).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});
  }
  async function replace(store,items){await clear(store);for(const item of items) await put(store,item);}
  window.StockDB={all,put,remove,clear,replace,stores:STORE_NAMES};
})();