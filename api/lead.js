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
  return (
    name &&
    company &&
    topic &&
    email.includes("@") &&
    digits.length >= 9
  );
}

export async function sendLead(body) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

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
    return { ok: false, status: 502, error: "telegram" };
  }

  return { ok: true, status: 200 };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false });
    return;
  }

  const result = await sendLead(req.body || {});
  res.status(result.status).json({ ok: result.ok });
}
