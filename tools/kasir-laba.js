/*
  MASZ TOOLS
  KASIR & LABA

  Fitur:
  - Nominal cepat 1K / 2K / 5K / 10K
  - Nominal manual
  - Input laba
  - Total pemasukan hari ini
  - Total laba hari ini
  - Riwayat transaksi
  - Hapus transaksi
  - Data tersimpan di localStorage
  - Otomatis reset ketika tanggal berganti
  - Animasi smooth
*/

const STORAGE_KEY = "masz_kasir_laba";

const money = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(Number(number) || 0);
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTime = () => {
  return new Date().toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
};


/* =========================
   DATABASE
========================= */

function loadData() {
  const today = getToday();

  let data;

  try {
    data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "null"
    );
  } catch (error) {
    data = null;
  }

  /*
    Kalau tanggal berbeda,
    semua transaksi dianggap sudah selesai
    dan mulai data baru.
  */

  if (!data || data.date !== today) {
    data = {
      date: today,
      transactions: []
    };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  }

  return data;
}


function saveData(data) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(data)
  );
}


/* =========================
   STYLE
========================= */

function injectStyles() {

  if (document.getElementById("masz-kasir-style")) {
    return;
  }

  const style = document.createElement("style");

  style.id = "masz-kasir-style";

  style.textContent = `

    .kasir-app {
      padding: 4px 2px 30px;
      animation: kasirFadeIn .3s ease;
    }

    @keyframes kasirFadeIn {
      from {
        opacity: 0;
        transform: translateY(12px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }


    /* =========================
       SUMMARY
    ========================= */

    .kasir-summary {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 20px;
    }

    .kasir-stat {
      padding: 17px;
      border-radius: 19px;

      background:
        linear-gradient(
          145deg,
          #1d2226,
          #15191d
        );

      border: 1px solid rgba(255,255,255,.07);

      transition:
        transform .2s ease,
        border-color .2s ease;
    }

    .kasir-stat:hover {
      transform: translateY(-2px);
      border-color: rgba(214,162,111,.25);
    }

    .kasir-stat small {
      display: block;
      color: #858c94;
      font-size: 12px;
      margin-bottom: 8px;
    }

    .kasir-stat strong {
      display: block;
      font-size: 18px;
      letter-spacing: -.4px;
    }

    .kasir-profit strong {
      color: #d6a26f;
    }


    /* =========================
       LABEL
    ========================= */

    .kasir-label {
      display: block;
      color: #a5abb1;
      font-size: 13px;
      margin: 0 0 9px 2px;
    }


    /* =========================
       QUICK NOMINAL
    ========================= */

    .kasir-presets {
      display: grid;
      grid-template-columns:
        repeat(4, 1fr);

      gap: 9px;

      margin-bottom: 12px;
    }

    .kasir-preset {
      min-height: 49px;

      border-radius: 14px;

      background: #1b2025;

      border: 1px solid
        rgba(255,255,255,.07);

      color: #f0f1f2;

      font-weight: 750;

      cursor: pointer;

      transition:
        transform .15s ease,
        background .15s ease,
        border-color .15s ease;
    }

    .kasir-preset:hover {
      background: #24292d;

      border-color:
        rgba(214,162,111,.35);
    }

    .kasir-preset:active {
      transform: scale(.93);
    }


    /* =========================
       INPUT
    ========================= */

    .kasir-input {
      width: 100%;

      height: 53px;

      padding: 0 15px;

      border-radius: 15px;

      border: 1px solid
        rgba(255,255,255,.08);

      outline: none;

      background: #181d21;

      color: #fff;

      font-size: 16px;

      margin-bottom: 14px;

      transition:
        border-color .2s ease,
        box-shadow .2s ease,
        transform .2s ease;
    }

    .kasir-input::placeholder {
      color: #666d75;
    }

    .kasir-input:focus {

      border-color:
        rgba(214,162,111,.55);

      box-shadow:
        0 0 0 3px
        rgba(214,162,111,.08);

      transform: translateY(-1px);
    }


    /* =========================
       BUTTON TAMBAH
    ========================= */

    .kasir-add {

      width: 100%;

      height: 55px;

      border-radius: 16px;

      background:
        linear-gradient(
          135deg,
          #d6a26f,
          #b9824d
        );

      color: #151515;

      font-weight: 850;

      cursor: pointer;

      transition:
        transform .16s ease,
        filter .16s ease,
        box-shadow .16s ease;
    }

    .kasir-add:hover {

      filter: brightness(1.07);

      box-shadow:
        0 8px 25px
        rgba(185,130,77,.15);
    }

    .kasir-add:active {
      transform: scale(.97);
    }


    /* =========================
       SECTION
    ========================= */

    .kasir-section-head {

      display: flex;

      align-items: center;

      justify-content: space-between;

      margin:
        27px 0 11px;
    }

    .kasir-section-head strong {
      font-size: 17px;
    }

    .kasir-section-head span {

      color: #777f87;

      font-size: 12px;
    }


    /* =========================
       TRANSACTIONS
    ========================= */

    .kasir-list {

      display: flex;

      flex-direction: column;

      gap: 8px;
    }

    .kasir-row {

      display: flex;

      align-items: center;

      gap: 11px;

      padding: 12px;

      border-radius: 15px;

      background: #171c20;

      border: 1px solid
        rgba(255,255,255,.055);

      animation:
        kasirRowIn .22s ease both;

      transition:
        transform .15s ease,
        background .15s ease;
    }

    .kasir-row:hover {
      transform: translateX(2px);
      background: #1a2024;
    }

    @keyframes kasirRowIn {

      from {
        opacity: 0;
        transform:
          translateY(8px)
          scale(.98);
      }

      to {
        opacity: 1;
        transform:
          translateY(0)
          scale(1);
      }

    }


    .kasir-icon {

      width: 40px;
      height: 40px;

      flex: none;

      border-radius: 12px;

      display: grid;

      place-items: center;

      background: #332b24;

      color: #e6ae79;

      font-size: 14px;

      font-weight: 800;
    }


    .kasir-row-main {

      flex: 1;

      min-width: 0;
    }

    .kasir-row-main b {

      display: block;

      font-size: 15px;
    }

    .kasir-row-main small {

      display: block;

      color: #777f87;

      font-size: 12px;

      margin-top: 2px;
    }


    .kasir-row-money {

      text-align: right;
    }

    .kasir-row-money b {

      display: block;

      font-size: 14px;
    }

    .kasir-row-money small {

      display: block;

      color: #63cda9;

      font-size: 11px;

      margin-top: 2px;
    }


    /* =========================
       DELETE
    ========================= */

    .kasir-delete {

      width: 30px;
      height: 30px;

      border-radius: 10px;

      background: #252a2e;

      color: #858c94;

      cursor: pointer;

      transition:
        background .15s ease,
        color .15s ease,
        transform .15s ease;
    }

    .kasir-delete:hover {

      background: #3a2529;

      color: #ff8792;
    }

    .kasir-delete:active {
      transform: scale(.88);
    }


    /* =========================
       EMPTY
    ========================= */

    .kasir-empty {

      padding: 28px 15px;

      text-align: center;

      border:
        1px dashed #343a3f;

      border-radius: 16px;

      color: #747b83;

      font-size: 13px;

      line-height: 1.6;
    }


    /* =========================
       NOTE
    ========================= */

    .kasir-note {

      margin-top: 13px;

      color: #686f77;

      font-size: 11px;

      line-height: 1.5;

      text-align: center;
    }


    /* =========================
       TOAST
    ========================= */

    .kasir-toast {

      position: fixed;

      left: 50%;

      bottom: 92px;

      transform:
        translate(-50%, 15px);

      opacity: 0;

      z-index: 9999;

      padding:
        11px 16px;

      border-radius: 13px;

      background: #252b30;

      border: 1px solid
        rgba(255,255,255,.08);

      color: #eee;

      font-size: 13px;

      pointer-events: none;

      transition:
        opacity .2s ease,
        transform .2s ease;

      box-shadow:
        0 10px 30px
        rgba(0,0,0,.25);
    }

    .kasir-toast.show {

      opacity: 1;

      transform:
        translate(-50%, 0);
    }


    @media(max-width:380px) {

      .kasir-presets {
        grid-template-columns:
          repeat(2, 1fr);
      }

    }

  `;

  document.head.appendChild(style);
}


/* =========================
   TOAST
========================= */

function showToast(message) {

  let toast =
    document.querySelector(".kasir-toast");

  if (!toast) {

    toast =
      document.createElement("div");

    toast.className =
      "kasir-toast";

    document.body.appendChild(toast);
  }

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(
    toast._timer
  );

  toast._timer =
    setTimeout(() => {

      toast.classList.remove(
        "show"
      );

    }, 1800);
}


/* =========================
   MAIN TOOL
========================= */

export function mount(container) {

  injectStyles();

  container.innerHTML = `

    <div class="kasir-app">

      <!-- SUMMARY -->

      <div class="kasir-summary">

        <div class="kasir-stat">

          <small>
            Pemasukan hari ini
          </small>

          <strong id="kasirIncome">
            Rp0
          </strong>

        </div>


        <div class="
          kasir-stat
          kasir-profit
        ">

          <small>
            Laba hari ini
          </small>

          <strong id="kasirProfit">
            Rp0
          </strong>

        </div>

      </div>


      <!-- NOMINAL -->

      <label class="kasir-label">
        Nominal pemasukan
      </label>


      <div class="kasir-presets">

        <button
          class="kasir-preset"
          data-value="2000"
        >
          1K
        </button>

        <button
          class="kasir-preset"
          data-value="3000"
        >
          2K
        </button>

        <button
          class="kasir-preset"
          data-value="5000"
        >
          5K
        </button>

        <button
          class="kasir-preset"
          data-value="10000"
        >
          10K
        </button>

      </div>


      <input
        id="kasirNominal"
        class="kasir-input"
        type="number"
        inputmode="numeric"
        min="0"
        step="100"
        placeholder="Atau masukkan nominal manual"
      />


      <!-- LABA -->

      <label class="kasir-label">

        Laba transaksi

        <span style="
          color:#666;
        ">
          (opsional)
        </span>

      </label>


      <input
        id="kasirProfitInput"
        class="kasir-input"
        type="number"
        inputmode="numeric"
        min="0"
        step="100"
        placeholder="Contoh: 3.000"
      />


      <!-- ADD -->

      <button
        id="kasirAdd"
        class="kasir-add"
      >
        ＋ Catat Pemasukan
      </button>


      <!-- LIST -->

      <div class="kasir-section-head">

        <strong>
          Transaksi hari ini
        </strong>

        <span id="kasirCount">
          0 transaksi
        </span>

      </div>


      <div
        id="kasirList"
        class="kasir-list"
      ></div>


      <div class="kasir-note">

        Data tersimpan lokal di perangkat.
        <br>

        Saat tanggal berganti pukul 00.00,
        transaksi otomatis mulai dari nol.

      </div>

    </div>

  `;


  /* =========================
     ELEMENT
  ========================= */

  const nominal =
    container.querySelector(
      "#kasirNominal"
    );

  const profit =
    container.querySelector(
      "#kasirProfitInput"
    );

  const incomeEl =
    container.querySelector(
      "#kasirIncome"
    );

  const profitEl =
    container.querySelector(
      "#kasirProfit"
    );

  const countEl =
    container.querySelector(
      "#kasirCount"
    );

  const listEl =
    container.querySelector(
      "#kasirList"
    );


  let data = loadData();


  /* =========================
     RENDER
  ========================= */

  function render() {

    data = loadData();


    const income =
      data.transactions.reduce(
        (total, transaction) => {

          return total +
            transaction.nominal;

        },
        0
      );


    const laba =
      data.transactions.reduce(
        (total, transaction) => {

          return total +
            transaction.laba;

        },
        0
      );


    incomeEl.textContent =
      money(income);

    profitEl.textContent =
      money(laba);

    countEl.textContent =
      `${data.transactions.length} transaksi`;


    /* EMPTY */

    if (
      data.transactions.length === 0
    ) {

      listEl.innerHTML = `

        <div class="kasir-empty">

          Belum ada transaksi hari ini.

          <br>

          Pilih nominal di atas
          untuk mulai mencatat.

        </div>

      `;

      return;
    }


    /* TRANSACTIONS */

    listEl.innerHTML =
      data.transactions
        .slice()
        .reverse()
        .map(transaction => `

          <div
            class="kasir-row"
            data-id="${transaction.id}"
          >

            <div class="kasir-icon">
              Rp
            </div>


            <div class="kasir-row-main">

              <b>
                ${money(
                  transaction.nominal
                )}
              </b>

              <small>
                ${transaction.time}
              </small>

            </div>


            <div class="kasir-row-money">

              <b>
                ${money(
                  transaction.nominal
                )}
              </b>

              <small>
                +${money(
                  transaction.laba
                )}
                laba
              </small>

            </div>


            <button
              class="kasir-delete"
              data-delete="${transaction.id}"
              title="Hapus transaksi"
            >
              ×
            </button>

          </div>

        `)
        .join("");


    /* DELETE */

    listEl
      .querySelectorAll(
        "[data-delete]"
      )
      .forEach(button => {

        button.addEventListener(
          "click",
          () => {

            const id =
              button.dataset.delete;


            const row =
              button.closest(
                ".kasir-row"
              );


            row.animate(
              [
                {
                  opacity: 1,
                  transform:
                    "translateX(0)"
                },

                {
                  opacity: 0,
                  transform:
                    "translateX(25px)"
                }
              ],
              {
                duration: 180,
                easing: "ease"
              }
            );


            setTimeout(() => {

              data.transactions =
                data.transactions.filter(
                  transaction =>
                    transaction.id !== id
                );

              saveData(data);

              render();

              showToast(
                "Transaksi dihapus"
              );

            }, 160);

          }
        );

      });

  }


  /* =========================
     ADD TRANSACTION
  ========================= */

  function addTransaction() {

    data = loadData();


    const nominalValue =
      Math.floor(
        Number(
          nominal.value
        ) || 0
      );


    const profitValue =
      Math.floor(
        Number(
          profit.value
        ) || 0
      );


    /* INVALID */

    if (
      nominalValue <= 0
    ) {

      nominal.focus();


      nominal.animate(
        [
          {
            transform:
              "translateX(-5px)"
          },

          {
            transform:
              "translateX(5px)"
          },

          {
            transform:
              "translateX(-3px)"
          },

          {
            transform:
              "translateX(0)"
          }
        ],
        {
          duration: 180
        }
      );


      showToast(
        "Masukkan nominal dulu"
      );

      return;
    }


    /* CREATE */

    const transaction = {

      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`,

      nominal:
        nominalValue,

      laba:
        Math.max(
          0,
          profitValue
        ),

      time:
        getTime()

    };


    data.transactions.push(
      transaction
    );


    saveData(data);


    /* RESET INPUT */

    nominal.value = "";
    profit.value = "";


    /* ANIMATION */

    render();


    const last =
      listEl.querySelector(
        ".kasir-row"
      );


    if (last) {

      last.animate(
        [
          {
            transform:
              "scale(.94)",
            opacity: .4
          },

          {
            transform:
              "scale(1.02)",
            opacity: 1
          },

          {
            transform:
              "scale(1)",
            opacity: 1
          }
        ],
        {
          duration: 280,
          easing: "ease-out"
        }
      );

    }


    showToast(
      "Pemasukan berhasil dicatat ✓"
    );

  }


  /* =========================
     QUICK BUTTON
  ========================= */

  container
    .querySelectorAll(
      "[data-value]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          nominal.value =
            button.dataset.value;


          nominal.focus();


          button.animate(
            [
              {
                transform:
                  "scale(1)"
              },

              {
                transform:
                  "scale(.9)"
              },

              {
                transform:
                  "scale(1.04)"
              },

              {
                transform:
                  "scale(1)"
              }
            ],
            {
              duration: 200,
              easing: "ease-out"
            }
          );

        }
      );

    });


  /* =========================
     ADD BUTTON
  ========================= */

  container
    .querySelector(
      "#kasirAdd"
    )
    .addEventListener(
      "click",
      addTransaction
    );


  /* =========================
     ENTER KEY
  ========================= */

  [nominal, profit]
    .forEach(input => {

      input.addEventListener(
        "keydown",
        event => {

          if (
            event.key === "Enter"
          ) {

            addTransaction();

          }

        }
      );

    });


  /* =========================
     FIRST RENDER
  ========================= */

  render();


  /* =========================
     CHECK NEW DAY
  ========================= */

  const dayChecker =
    setInterval(() => {

      const current =
        loadData();


      /*
        Kalau tanggal berubah,
        loadData() otomatis membuat
        database baru.
      */

      if (
        current.date !== data.date
      ) {

        data = current;

        render();

        showToast(
          "Hari baru. Kasir direset ✓"
        );

      }

    }, 15000);


  /* =========================
     CLEANUP
  ========================= */

  const observer =
    new MutationObserver(() => {

      if (
        !document.body.contains(
          container
        )
      ) {

        clearInterval(
          dayChecker
        );

        observer.disconnect();

      }

    });


  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

    } 
