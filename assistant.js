const knowledge = [
  {
    keys: ["услуг", "делаете", "помог", "направлен"],
    answer:
      "Берём запуск линии, экспорт и байеров, сертификацию GOTS / OEKO-TEX / BCI, эффективность цеха, инвестиции и обучение команд. Напишите, что тормозит площадку — подскажу, с чего начать.",
    href: "services.html",
  },
  {
    keys: ["сертиф", "gots", "oeko", "oeko-tex", "bci", "аудит"],
    answer:
      "Готовим к GOTS, OEKO-TEX, BCI и социальным аудитам: закрываем разрывы до визита, а не после замечаний. Обычно первый отчёт — за 10–14 рабочих дней.",
    href: "services.html",
  },
  {
    keys: ["экспорт", "байер", "европ", "ес", "польш", "рынок"],
    answer:
      "Собираем коммерческий пакет, выравниваем качество под ритейл и ведём первые отгрузки. Переписка с европейскими закупщиками — на английском.",
    href: "cases.html",
  },
  {
    keys: ["процесс", "как работ", "этап", "срок", "шаг"],
    answer:
      "Четыре шага: диагностика, дорожная карта, сопровождение, закрепление. На площадке нужен ответственный со стороны завода.",
    href: "process.html",
  },
  {
    keys: ["цен", "стоим", "сколько", "бюджет"],
    answer:
      "Стоимость зависит от объёма: короткий разбор документов или полный аудит цеха. Оставьте заявку — ответим в рабочий день с форматом и ориентиром.",
    href: "contact.html",
  },
  {
    keys: ["контакт", "телефон", "почт", "адрес", "где", "заявк", "встреч"],
    answer:
      "Ташкент, ул. Бабура, 42. Телефон +998 90 123 45 67, почта hello@uztextile.consulting. Заявку можно отправить с страницы контактов.",
    href: "contact.html",
  },
  {
    keys: ["язык", "английск", "узбек"],
    answer:
      "Работаем на русском, узбекском и английском. Коммерческие пакеты для ЕС готовим на английском.",
  },
  {
    keys: ["кластер", "маленьк", "средн", "завод"],
    answer:
      "Работаем не только с крупными кластерами. Берём средние фабрики, если есть понятный запрос и человек, который ведёт проект на площадке.",
  },
];

function replyTo(text) {
  const q = text.toLowerCase();
  const hit = knowledge.find((item) => item.keys.some((key) => q.includes(key)));
  if (hit) return hit;
  return {
    answer:
      "Могу рассказать про услуги, сертификацию, экспорт, процесс работы и контакты. Если нужна встреча с консультантом — напишите «заявка».",
  };
}

function createAssistant() {
  const root = document.createElement("aside");
  root.className = "assistant";
  root.innerHTML = `
    <div class="assistant__panel glass" role="dialog" aria-label="Ассистент бюро" hidden>
      <div class="assistant__head">
        <div>
          <h2>Нить</h2>
          <p>Ассистент UZ Textile Consulting</p>
        </div>
        <button class="assistant__close" type="button">Закрыть</button>
      </div>
      <div class="assistant__log" id="assistant-log"></div>
      <div class="assistant__chips">
        <button class="assistant__chip" type="button">Какие услуги?</button>
        <button class="assistant__chip" type="button">Сертификация</button>
        <button class="assistant__chip" type="button">Контакты</button>
      </div>
      <form class="assistant__form">
        <label class="visually-hidden" for="assistant-input">Сообщение</label>
        <input id="assistant-input" name="q" autocomplete="off" placeholder="Спросите про цех, экспорт или сертификат" />
        <button class="assistant__send" type="submit">Спросить</button>
      </form>
    </div>
    <button class="assistant__btn" type="button" aria-expanded="false">AI</button>
  `;
  document.body.appendChild(root);

  const panel = root.querySelector(".assistant__panel");
  const toggle = root.querySelector(".assistant__btn");
  const closeBtn = root.querySelector(".assistant__close");
  const log = root.querySelector("#assistant-log");
  const form = root.querySelector(".assistant__form");
  const input = root.querySelector("#assistant-input");

  const addMsg = (text, who, href) => {
    const el = document.createElement("p");
    el.className = `assistant__msg assistant__msg--${who}`;
    el.textContent = text;
    if (href && who === "bot") {
      el.appendChild(document.createTextNode(" "));
      const link = document.createElement("a");
      link.href = href;
      link.textContent = "Открыть страницу";
      el.appendChild(link);
    }
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  };

  const ask = (text) => {
    const clean = text.trim();
    if (!clean) return;
    addMsg(clean, "user");
    const result = replyTo(clean);
    window.setTimeout(() => addMsg(result.answer, "bot", result.href), 180);
  };

  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open) input.focus();
  };

  toggle.addEventListener("click", () => setOpen(!root.classList.contains("is-open")));
  closeBtn.addEventListener("click", () => setOpen(false));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    ask(input.value);
    input.value = "";
  });
  root.querySelectorAll(".assistant__chip").forEach((chip) => {
    chip.addEventListener("click", () => ask(chip.textContent));
  });

  addMsg(
    "Здравствуйте. Я Нить — подскажу по услугам бюро, сертификации и заявке. Спросите, что нужно заводу.",
    "bot"
  );
}

createAssistant();
