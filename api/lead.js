function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isValidLead(body) {
  const name = String(body.name || "").trim();
  const company = String(body.company || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim();
  const topic = String(body.topic || "").trim();
  const digits = phone.replace(/\D/g, "");
  return name && company && topic && email.includes("@") && digits.length >= 9;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  if (typeof req.body === "string" && req.body.trim()) {
    return JSON.parse(req.body);
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

async function sendLead(body) {
  const token = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();

  if (!token || !chatId) {
    return { ok: false, status: 500, error: "missing_env" };
  }

  if (!isValidLead(body)) {
    return { ok: false, status: 400, error: "invalid" };
  }

  const text = [
    "<b>Новая заявка с сайта</b>",
    `Имя: ${escapeHtml(body.name)}`,
    `Компания: ${escapeHtml(body.company)}`,
    `Телефон: ${escapeHtml(body.phone)}`,
    `Почта: ${escapeHtml(body.email)}`,
    `Задача: ${escapeHtml(body.topic)}`,
    `Комментарий: ${escapeHtml(body.message || "—")}`,
  ].join("\n");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.ok) {
    const description = String(payload.description || "telegram");
    return { ok: false, status: 502, error: description };
  }

  return { ok: true, status: 200 };
}

async function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json({
      ok: true,
      configured: Boolean(
        String(process.env.TELEGRAM_BOT_TOKEN || "").trim() &&
          String(process.env.TELEGRAM_CHAT_ID || "").trim()
      ),
    });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method" });
    return;
  }

  let body = {};
  try {
    body = await readBody(req);
  } catch {
    res.status(400).json({ ok: false, error: "invalid" });
    return;
  }

  const result = await sendLead(body);
  res.status(result.status).json({ ok: result.ok, error: result.error || null });
}

handler.sendLead = sendLead;
module.exports = handler;
