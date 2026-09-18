const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".nav-toggle");
const links = [...document.querySelectorAll(".nav a")];
const cards = [...document.querySelectorAll(".card")];
const filters = [...document.querySelectorAll(".filters__btn")];
const form = document.getElementById("lead-form");
const formError = document.getElementById("form-error");
const formOk = document.getElementById("form-ok");
const canvas = document.getElementById("loom");
const page = document.body.dataset.page || "";

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
});

links.forEach((link) => {
  const href = link.getAttribute("href");
  if (href && href.includes(`${page}.html`)) {
    link.classList.add("is-active");
  }
  if (page === "home" && href === "index.html") {
    link.classList.add("is-active");
  }
  link.addEventListener("click", () => {
    nav.classList.remove("is-open");
    toggle?.setAttribute("aria-expanded", "false");
  });
});

filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    const value = btn.dataset.filter;
    filters.forEach((item) => {
      item.classList.toggle("is-active", item === btn);
      item.setAttribute("aria-selected", String(item === btn));
    });
    cards.forEach((card) => {
      const show = value === "all" || card.dataset.cat === value;
      card.classList.toggle("is-dim", !show);
    });
  });
});

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  formOk.hidden = true;
  formError.hidden = true;
  const data = new FormData(form);
  const required = ["name", "company", "phone", "email", "topic"];
  const missing = required.some((key) => !String(data.get(key) || "").trim());
  const email = String(data.get("email") || "");
  const phone = String(data.get("phone") || "");

  if (missing || !email.includes("@") || phone.replace(/\D/g, "").length < 9) {
    formError.hidden = false;
    formError.textContent =
      "Проверьте имя, компанию, телефон и почту — без них заявку не отправим.";
    return;
  }

  const payload = Object.fromEntries(data.entries());
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.ok) {
      const reason = result.error || "";
      if (reason === "missing_env") {
        throw new Error("env");
      }
      throw new Error("send");
    }
    formOk.hidden = false;
    form.reset();
  } catch (err) {
    formError.hidden = false;
    formError.textContent =
      err.message === "env"
        ? "На Vercel не заданы TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID. Добавьте их и сделайте Redeploy."
        : "Не удалось отправить в Telegram. Откройте личку с ботом и нажмите Start.";
  }
});

function drawLoom(highlight = -1) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "rgba(255,250,243,0.35)";
  ctx.fillRect(0, 0, width, height);
  const cols = 42;
  const gap = width / cols;
  for (let i = 0; i < cols; i += 1) {
    ctx.strokeStyle = i === highlight ? "#2a241c" : "rgba(42,36,28,0.28)";
    ctx.lineWidth = i % 5 === 0 ? 1.6 : 1;
    ctx.beginPath();
    ctx.moveTo(i * gap + 8, 12);
    ctx.lineTo(i * gap + 8, height - 12);
    ctx.stroke();
  }
  for (let y = 18; y < height - 10; y += 10) {
    ctx.strokeStyle = "rgba(42,36,28,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(6, y);
    ctx.lineTo(width - 6, y);
    ctx.stroke();
  }
}

drawLoom();

canvas?.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const col = Math.floor((x / rect.width) * 42);
  drawLoom(col);
});

canvas?.addEventListener("mouseleave", () => drawLoom());
