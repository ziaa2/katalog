/*
  MASZ TOOLS
  Arsitektur:
  - Setiap tool berada di /tools/NAMA_TOOL.js
  - Daftar tool cukup diedit di TOOL_REGISTRY di bawah.
  - Tool belum perlu punya fungsi. Placeholder akan otomatis muncul.
*/

const TOOL_REGISTRY = [
  {
    id: "kasir-laba",
    name: "Kasir & Laba",
    description: "Catat pemasukan harian",
    icon: "💰",
    color: "orange",
    file: "./tools/kasir-laba.js"
  }
  {
  id: "receh",
  name: "Receh",
  description: "Catat pengeluaran jajan",
  icon: "🍜",
  color: "orange",
  file: "./tools/receh.js"
  }
];

const state = {
  allTools: [...TOOL_REGISTRY],
  showAll: false,
  recent: JSON.parse(localStorage.getItem("masz_recent_tools") || "[]")
};

const $ = (q) => document.querySelector(q);

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return "Good morning,";
  if (h < 15) return "Good afternoon,";
  if (h < 19) return "Good evening,";
  return "Good night,";
}

function saveRecent(id) {
  state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 8);
  localStorage.setItem("masz_recent_tools", JSON.stringify(state.recent));
}

function getTool(id) {
  return state.allTools.find(t => t.id === id);
}

function renderTools(filter = "") {
  const grid = $("#toolGrid");
  let tools = state.allTools.filter(t => {
    const text = `${t.name} ${t.description}`.toLowerCase();
    return text.includes(filter.toLowerCase());
  });

  if (!state.showAll && !filter) tools = tools.slice(0, 8);

  if (!tools.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1">Belum ada tools. Tambahkan file JS pertama kamu 🚀</div>`;
    return;
  }

  grid.innerHTML = tools.map(t => `
    <button class="tool-card" data-tool="${t.id}">
      <span class="tool-icon ${t.color || ""}">${t.icon || "✦"}</span>
      <span class="tool-info">
        <span class="tool-name">${escapeHtml(t.name)}</span>
        <span class="tool-desc">${escapeHtml(t.description || "Personal tool")}</span>
      </span>
      <span class="chevron">›</span>
    </button>
  `).join("");

  grid.querySelectorAll("[data-tool]").forEach(btn => {
    btn.addEventListener("click", () => openTool(btn.dataset.tool));
  });
}

function renderRecent() {
  const list = $("#recentList");
  const recentTools = state.recent.map(getTool).filter(Boolean);

  if (!recentTools.length) {
    list.innerHTML = `<div class="empty">Belum ada riwayat penggunaan.</div>`;
    return;
  }

  list.innerHTML = recentTools.slice(0, 5).map(t => `
    <div class="recent-item" data-tool="${t.id}">
      <div class="recent-icon">${t.icon || "✦"}</div>
      <div class="recent-main">
        <div class="recent-name">${escapeHtml(t.name)}</div>
        <div class="recent-time">Baru digunakan</div>
      </div>
      <div class="chevron">›</div>
    </div>
  `).join("");

  list.querySelectorAll("[data-tool]").forEach(item => {
    item.addEventListener("click", () => openTool(item.dataset.tool));
  });
}

async function openTool(id) {
  const tool = getTool(id);
  if (!tool) return;

  saveRecent(id);
  renderRecent();

  $("#modalTitle").textContent = tool.name;
  $("#toolModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const mount = $("#toolMount");
  mount.innerHTML = `
    <div class="tool-placeholder">
      <div class="big-icon">${tool.icon || "✦"}</div>
      <h2>${escapeHtml(tool.name)}</h2>
      <p>${escapeHtml(tool.description || "Personal tool")}</p>
      <div class="notice">Tool ini masih kosong. Tambahkan UI dan fungsi di <b>${escapeHtml(tool.file || `./tools/${tool.id}.js`)}</b>.</div>
    </div>
  `;

  if (!tool.file) return;

  try {
    const module = await import(tool.file);
    if (typeof module.mount === "function") {
      mount.innerHTML = "";
      module.mount(mount);
    }
  } catch (err) {
    console.info("Tool belum punya module:", err);
  }
}

function closeTool() {
  $("#toolModal").classList.add("hidden");
  document.body.style.overflow = "";
  $("#toolMount").innerHTML = "";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setup() {
  $("#greeting").textContent = greeting();
  renderTools();
  renderRecent();

  $("#searchInput").addEventListener("input", e => {
    state.showAll = true;
    renderTools(e.target.value);
  });

  $("#viewAllBtn").addEventListener("click", () => {
    state.showAll = !state.showAll;
    $("#viewAllBtn").innerHTML = state.showAll
      ? `Tutup <span>↑</span>`
      : `Lihat semua <span>→</span>`;
    renderTools($("#searchInput").value);
  });

  $("#recentAllBtn").addEventListener("click", () => {
    document.querySelector(".recent-section").scrollIntoView({behavior:"smooth"});
  });

  $("#closeModal").addEventListener("click", closeTool);
  $("#modalBackdrop").addEventListener("click", closeTool);

  $("#settingsBtn").addEventListener("click", () => {
    alert("Pengaturan bisa ditambahkan nanti. Struktur project sudah siap dikembangkan.");
  });

  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
      btn.classList.add("active");
      if (btn.dataset.page === "tools") {
        window.scrollTo({top: document.querySelector(".section-head").offsetTop - 20, behavior:"smooth"});
      } else if (btn.dataset.page === "home") {
        window.scrollTo({top:0, behavior:"smooth"});
      } else {
        alert("Profile bisa kamu isi nanti.");
      }
    });
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(console.warn);
  }
}

setup();
