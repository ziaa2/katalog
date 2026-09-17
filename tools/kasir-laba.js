/*
  MASZ TOOLS
  KASIR & LABA

  Konsep:
  - Tombol 2K
  - Tombol 3K
  - Tombol 5K
  - Tombol 10K
  - Setiap pencet langsung menambah
  - Bisa pencet tombol yang sama berkali-kali
  - Total laba otomatis dihitung
  - Reset otomatis setiap hari
  - Data tersimpan lokal
*/

const STORAGE_KEY = "masz_kasir_laba";


/* =========================
   FORMAT UANG
========================= */

function money(number) {

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number || 0);

}


/* =========================
   TANGGAL
========================= */

function today() {

  const d = new Date();

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0")
  ].join("-");

}


/* =========================
   DATABASE
========================= */

function loadData() {

  const currentDate = today();

  let data = null;

  try {

    data = JSON.parse(
      localStorage.getItem(STORAGE_KEY)
    );

  } catch (error) {

    data = null;

  }


  /*
    Kalau sudah ganti hari,
    otomatis mulai dari Rp0.
  */

  if (
    !data ||
    data.date !== currentDate
  ) {

    data = {

      date: currentDate,

      total: 0,

      transactions: []

    };

    saveData(data);

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

function injectStyle() {

  if (
    document.getElementById(
      "masz-kasir-style"
    )
  ) {

    return;

  }


  const style =
    document.createElement("style");

  style.id =
    "masz-kasir-style";


  style.textContent = `

    .kasir {

      padding: 5px 2px 30px;

      animation:
        kasirIn .3s ease;

    }


    @keyframes kasirIn {

      from {

        opacity: 0;

        transform:
          translateY(10px);

      }

      to {

        opacity: 1;

        transform:
          translateY(0);

      }

    }


    /* TOTAL */

    .kasir-total {

      padding: 25px 20px;

      margin-bottom: 18px;

      text-align: center;

      border-radius: 22px;

      background:
        linear-gradient(
          145deg,
          #211e1b,
          #17191b
        );

      border:
        1px solid
        rgba(214,162,111,.15);

    }


    .kasir-total-label {

      color: #858c94;

      font-size: 13px;

      margin-bottom: 7px;

    }


    .kasir-total-value {

      font-size: 34px;

      font-weight: 850;

      letter-spacing: -1px;

      color: #d6a26f;

      transition:
        transform .2s ease;

    }


    /* BUTTONS */

    .kasir-buttons {

      display: grid;

      grid-template-columns:
        1fr 1fr;

      gap: 11px;

    }


    .kasir-button {

      height: 75px;

      border-radius: 19px;

      border:
        1px solid
        rgba(255,255,255,.07);

      background:
        linear-gradient(
          145deg,
          #1d2226,
          #171b1f
        );

      color: #f1f2f3;

      font-size: 22px;

      font-weight: 800;

      cursor: pointer;

      transition:
        transform .14s ease,
        background .14s ease,
        border-color .14s ease;

    }


    .kasir-button:hover {

      background: #24292d;

      border-color:
        rgba(214,162,111,.35);

    }


    .kasir-button:active {

      transform:
        scale(.91);

    }


    /* RESET */

    .kasir-reset {

      width: 100%;

      height: 47px;

      margin-top: 14px;

      border-radius: 15px;

      background: #1b2024;

      border:
        1px solid
        rgba(255,255,255,.06);

      color: #858c94;

      cursor: pointer;

      transition:
        .15s ease;

    }


    .kasir-reset:hover {

      color: #ff858f;

      background: #292023;

    }


    /* HISTORY */

    .kasir-head {

      display: flex;

      justify-content:
        space-between;

      align-items: center;

      margin:
        27px 0 11px;

    }


    .kasir-head strong {

      font-size: 17px;

    }


    .kasir-head span {

      color: #777f87;

      font-size: 12px;

    }


    .kasir-list {

      display: flex;

      flex-direction: column;

      gap: 8px;

    }


    .kasir-row {

      display: flex;

      align-items: center;

      gap: 12px;

      padding: 13px;

      border-radius: 15px;

      background: #171c20;

      border:
        1px solid
        rgba(255,255,255,.05);

      animation:
        rowIn .2s ease;

    }


    @keyframes rowIn {

      from {

        opacity: 0;

        transform:
          translateY(7px)
          scale(.97);

      }

      to {

        opacity: 1;

        transform:
          translateY(0)
          scale(1);

      }

    }


    .kasir-row-icon {

      width: 40px;

      height: 40px;

      border-radius: 12px;

      display: grid;

      place-items: center;

      background: #332b24;

      color: #e6ae79;

      font-size: 13px;

      font-weight: 800;

    }


    .kasir-row-main {

      flex: 1;

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


    .kasir-empty {

      padding: 28px;

      text-align: center;

      border:
        1px dashed #343a3f;

      border-radius: 16px;

      color: #747b83;

      font-size: 13px;

      line-height: 1.6;

    }


    /* TOAST */

    .kasir-toast {

      position: fixed;

      left: 50%;

      bottom: 90px;

      z-index: 9999;

      padding:
        10px 15px;

      border-radius: 13px;

      background: #252b30;

      color: #eee;

      font-size: 13px;

      opacity: 0;

      transform:
        translate(-50%, 12px);

      pointer-events: none;

      transition:
        .2s ease;

    }


    .kasir-toast.show {

      opacity: 1;

      transform:
        translate(-50%, 0);

    }


    @media(max-width:380px) {

      .kasir-button {

        height: 68px;

        font-size: 20px;

      }

    }

  `;


  document.head.appendChild(style);

}


/* =========================
   TOAST
========================= */

function toast(text) {

  let element =
    document.querySelector(
      ".kasir-toast"
    );


  if (!element) {

    element =
      document.createElement("div");

    element.className =
      "kasir-toast";

    document.body.appendChild(
      element
    );

  }


  element.textContent = text;

  element.classList.add(
    "show"
  );


  clearTimeout(
    element._timer
  );


  element._timer =
    setTimeout(() => {

      element.classList.remove(
        "show"
      );

    }, 1200);

}


/* =========================
   TOOL
========================= */

export function mount(container) {

  injectStyle();


  container.innerHTML = `

    <div class="kasir">


      <!-- TOTAL -->

      <div class="kasir-total">

        <div class="kasir-total-label">

          LABA HARI INI

        </div>


        <div
          id="kasirTotal"
          class="kasir-total-value"
        >

          Rp0

        </div>

      </div>


      <!-- BUTTON -->

      <div class="kasir-buttons">


        <button
          class="kasir-button"
          data-value="2000"
        >

          2K

        </button>


        <button
          class="kasir-button"
          data-value="3000"
        >

          3K

        </button>


        <button
          class="kasir-button"
          data-value="5000"
        >

          5K

        </button>


        <button
          class="kasir-button"
          data-value="10000"
        >

          10K

        </button>


      </div>


      <!-- RESET -->

      <button
        id="kasirReset"
        class="kasir-reset"
      >

        Reset Hari Ini

      </button>


      <!-- HISTORY -->

      <div class="kasir-head">

        <strong>
          Riwayat
        </strong>

        <span id="kasirCount">
          0 transaksi
        </span>

      </div>


      <div
        id="kasirList"
        class="kasir-list"
      ></div>


    </div>

  `;


  const total =
    container.querySelector(
      "#kasirTotal"
    );


  const list =
    container.querySelector(
      "#kasirList"
    );


  const count =
    container.querySelector(
      "#kasirCount"
    );


  let data =
    loadData();


  /* =========================
     RENDER
  ========================= */

  function render() {

    data =
      loadData();


    total.textContent =
      money(data.total);


    count.textContent =
      `${data.transactions.length} transaksi`;


    if (
      data.transactions.length === 0
    ) {

      list.innerHTML = `

        <div class="kasir-empty">

          Belum ada transaksi.

          <br>

          Tekan nominal untuk
          mulai menghitung laba.

        </div>

      `;

      return;

    }


    list.innerHTML =
      data.transactions
        .slice()
        .reverse()
        .map(transaction => `

          <div
            class="kasir-row"
          >

            <div
              class="kasir-row-icon"
            >

              +Rp

            </div>


            <div
              class="kasir-row-main"
            >

              <b>

                ${money(
                  transaction.value
                )}

              </b>


              <small>

                ${transaction.time}

              </small>

            </div>

          </div>

        `)
        .join("");

  }


  /* =========================
     ADD
========================= */

  function add(value) {

    data =
      loadData();


    data.total += value;


    data.transactions.push({

      value: value,

      time:
        new Date()
          .toLocaleTimeString(
            "id-ID",
            {
              hour: "2-digit",
              minute: "2-digit"
            }
          )

    });


    saveData(data);


    render();


    /* TOTAL ANIMATION */

    total.animate(

      [
        {
          transform:
            "scale(1)"
        },

        {
          transform:
            "scale(1.12)"
        },

        {
          transform:
            "scale(1)"
        }

      ],

      {

        duration: 220,

        easing: "ease-out"

      }

    );


    toast(
      `+${money(value)}`
    );

  }


  /* =========================
     BUTTON
========================= */

  container
    .querySelectorAll(
      "[data-value]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const value =
            Number(
              button.dataset.value
            );


          add(value);


          button.animate(

            [

              {
                transform:
                  "scale(1)"
              },

              {
                transform:
                  "scale(.88)"
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

              duration: 220,

              easing: "ease-out"

            }

          );

        }
      );

    });


  /* =========================
     RESET
========================= */

  container
    .querySelector(
      "#kasirReset"
    )
    .addEventListener(
      "click",
      () => {

        data = {

          date: today(),

          total: 0,

          transactions: []

        };


        saveData(data);

        render();

        toast(
          "Kasir direset"
        );

      }
    );


  /* =========================
     INITIAL
========================= */

  render();


  /* =========================
     AUTO RESET NEW DAY
========================= */

  const checker =
    setInterval(() => {

      const current =
        loadData();


      if (
        current.date !== data.date
      ) {

        data = current;

        render();

        toast(
          "Hari baru dimulai"
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
          checker
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
