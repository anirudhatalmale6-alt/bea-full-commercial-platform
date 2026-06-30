(function () {
  "use strict";

  const SUPPORTED = ["en", "es", "ar", "zh", "fr", "pt", "ru"];
  const RTL = new Set(["ar"]);
  const COPY = {
    en: {
      title: "BEA Guide",
      subtitle: "Voice and captions",
      play: "Play",
      mute: "Mute",
      continue: "Continue",
      open: "Open guide",
      statusReady: "Ready when you are.",
      statusAudio: "Playing guided audio.",
      landing: "Welcome to BEA! To find the perfect lessons for you, let's start by clicking 'Check your English Level' to take our short Level Test.",
      placement: "You are on the BEA Level Test. Enter your name and email, then start the free placement test.",
      postTest: "Great job! Your pathway is ready. Click below to try your free mini trial lesson before unlocking your full course.",
      trial: "Let's begin in simple English. Listen, read the short captions, and try the mini lesson step by step."
    },
    es: {
      title: "Guia BEA",
      subtitle: "Voz y subtitulos",
      play: "Escuchar",
      mute: "Silenciar",
      continue: "Continuar",
      open: "Abrir guia",
      statusReady: "Listo cuando quieras.",
      statusAudio: "Reproduciendo la guia.",
      landing: "Bienvenido a BEA. Para encontrar las mejores clases para ti, haz clic en 'Check your English Level' y empieza la prueba corta.",
      placement: "Estas en la prueba de nivel de BEA. Escribe tu nombre y correo, y empieza la prueba gratuita.",
      postTest: "Muy bien. Tu ruta esta lista. Prueba la mini leccion gratis antes de desbloquear el curso completo.",
      trial: "Ahora empezamos en ingles sencillo. Escucha, lee y prueba la mini leccion paso a paso."
    },
    ar: {
      title: "دليل BEA",
      subtitle: "صوت ونص",
      play: "استمع",
      mute: "كتم",
      continue: "متابعة",
      open: "افتح الدليل",
      statusReady: "جاهز عندما تريد.",
      statusAudio: "يتم تشغيل الدليل الصوتي.",
      landing: "مرحبا بك في BEA. للعثور على الدروس المناسبة لك، اضغط على Check your English Level وابدأ اختبار المستوى القصير.",
      placement: "أنت الآن في اختبار مستوى BEA. اكتب اسمك وبريدك الإلكتروني ثم ابدأ الاختبار المجاني.",
      postTest: "أحسنت. مسارك جاهز. جرب الدرس المصغر المجاني قبل فتح الدورة الكاملة.",
      trial: "لنبدأ الآن بإنجليزية بسيطة. استمع واقرأ النص وجرب الدرس خطوة بخطوة."
    },
    zh: {
      title: "BEA 向导",
      subtitle: "语音和字幕",
      play: "播放",
      mute: "静音",
      continue: "继续",
      open: "打开向导",
      statusReady: "准备好了就开始。",
      statusAudio: "正在播放语音向导。",
      landing: "欢迎来到 BEA。为了找到最适合你的课程，请点击 Check your English Level，开始简短的水平测试。",
      placement: "你正在 BEA 水平测试页面。输入姓名和邮箱，然后开始免费测试。",
      postTest: "做得好！你的学习路径已经准备好了。先试一节免费的迷你体验课，然后再解锁完整课程。",
      trial: "现在开始使用简单英语。请听语音，看字幕，一步一步完成迷你课程。"
    }
  };

  const FALLBACKS = {
    fr: "en",
    pt: "en",
    ru: "en"
  };

  const state = {
    config: {},
    language: "en",
    manifest: { clips: {}, basePath: "" },
    currentMessage: "landing",
    muted: false,
    audio: null,
    timer: null,
    courseId: "bea-b1-independent",
    elements: {}
  };

  function detectLanguage() {
    const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || "en"];
    const match = languages.map((value) => String(value).toLowerCase().split("-")[0]).find((code) => SUPPORTED.includes(code));
    return match || "en";
  }

  function copy() {
    return COPY[state.language] || COPY[FALLBACKS[state.language]] || COPY.en;
  }

  function routeMessage() {
    const path = window.location.pathname;
    const text = document.body ? document.body.innerText.toLowerCase() : "";

    if (sessionStorage.getItem("bea_agent_trial_started") === "true" || path.includes("/appetiser")) {
      return "trial";
    }

    if (sessionStorage.getItem("bea_agent_post_test") === "true" || text.includes("your pathway is ready")) {
      return "postTest";
    }

    if (path.includes("placement-test") || path.includes("/checkout/placement")) {
      return "placement";
    }

    return "landing";
  }

  function clipKey(message) {
    const lang = message === "trial" || message === "postTest" ? "en" : state.language;
    return `${message}.${state.manifest.clips[`${message}.${lang}`] ? lang : "en"}`;
  }

  function setCaption(text) {
    state.elements.caption.textContent = text;
    state.elements.caption.dir = RTL.has(state.language) ? "rtl" : "ltr";
  }

  function setStatus(text) {
    state.elements.status.textContent = text;
  }

  function currentText(message) {
    const langCopy = copy();
    return langCopy[message] || COPY.en[message] || COPY.en.landing;
  }

  async function loadManifest(url) {
    try {
      const result = await fetch(url, { credentials: "same-origin" });
      if (result.ok) state.manifest = await result.json();
    } catch (error) {
      state.manifest = { clips: {}, basePath: "" };
    }
  }

  function captionFromAlignment(text, alignment) {
    if (!alignment || !Array.isArray(alignment.character_start_times_seconds)) {
      return [{ start: 0, end: 10, text }];
    }

    const words = text.split(/\s+/).filter(Boolean);
    const total = alignment.character_end_times_seconds[alignment.character_end_times_seconds.length - 1] || Math.max(4, words.length * 0.45);
    const chunkSize = Math.max(4, Math.ceil(words.length / Math.max(2, Math.ceil(total / 3))));
    const chunks = [];

    for (let index = 0; index < words.length; index += chunkSize) {
      const start = (index / words.length) * total;
      const end = Math.min(total, ((index + chunkSize) / words.length) * total);
      chunks.push({ start, end, text: words.slice(index, index + chunkSize).join(" ") });
    }

    return chunks;
  }

  function syncCaptions(captions) {
    clearInterval(state.timer);
    const started = Date.now();

    state.timer = setInterval(() => {
      const elapsed = (Date.now() - started) / 1000;
      const caption = captions.find((item) => elapsed >= item.start && elapsed < item.end);
      if (caption) setCaption(caption.text);
    }, 160);
  }

  async function playDynamicAudio(message, text) {
    if (!state.config.enableDynamicTts || !state.config.apiBaseUrl) {
      return;
    }

    const result = await fetch(`${state.config.apiBaseUrl}/elevenlabs-tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, languageCode: state.language })
    });

    if (!result.ok) return;

    const data = await result.json();
    const src = `data:${data.mimeType || "audio/mpeg"};base64,${data.audioBase64}`;
    const captions = captionFromAlignment(text, data.alignment);
    state.audio = new Audio(src);
    state.audio.addEventListener("play", () => syncCaptions(captions));
    state.audio.addEventListener("ended", () => clearInterval(state.timer));
    await state.audio.play();
    setStatus(copy().statusAudio);
  }

  async function playAudio(message) {
    clearInterval(state.timer);
    if (state.audio) state.audio.pause();
    if (state.muted) return;

    const key = clipKey(message);
    const clip = state.manifest.clips[key];
    const text = clip ? clip.text : currentText(message);

    if (clip && clip.audio) {
      let fallbackStarted = false;
      const fallbackToDynamic = () => {
        if (fallbackStarted) return;
        fallbackStarted = true;
        playDynamicAudio(message, text).catch(() => {});
      };

      state.audio = new Audio(`${state.manifest.basePath || ""}${clip.audio}`);
      state.audio.addEventListener("play", () => syncCaptions(clip.captions || [{ start: 0, end: 10, text }]));
      state.audio.addEventListener("ended", () => clearInterval(state.timer));
      state.audio.addEventListener("error", fallbackToDynamic, { once: true });

      try {
        await state.audio.play();
        setStatus(copy().statusAudio);
      } catch (error) {
        fallbackToDynamic();
      }
      return;
    }

    await playDynamicAudio(message, text);
  }

  function updateMessage(message) {
    state.currentMessage = message || routeMessage();
    if (state.currentMessage === "trial") state.language = "en";
    setCaption(currentText(state.currentMessage));
    setStatus(copy().statusReady);
  }

  function clickPrimaryAction() {
    const message = state.currentMessage;

    if (message === "postTest") {
      window.location.href = `/appetiser/unlock?courseId=${encodeURIComponent(state.courseId)}`;
      return;
    }

    if (message === "trial") {
      const target = document.querySelector("[data-bea-trial-next]") || document.querySelector("main a, main button");
      if (target) target.click();
      return;
    }

    const links = Array.from(document.querySelectorAll("a"));
    const levelLink = links.find((link) => /check your english level/i.test(link.textContent || ""));
    if (levelLink) {
      levelLink.click();
      return;
    }

    window.location.href = "/checkout/placement?source=ai-agent";
  }

  function render() {
    const root = document.createElement("section");
    root.className = "bea-agent";
    root.setAttribute("aria-label", "British English Academy AI guide");
    root.innerHTML = `
      <div class="bea-agent__panel">
        <div class="bea-agent__header">
          <div class="bea-agent__mark">BEA</div>
          <div>
            <p class="bea-agent__title"></p>
            <p class="bea-agent__subtitle"></p>
          </div>
          <button class="bea-agent__close" type="button" aria-label="Close">×</button>
        </div>
        <div class="bea-agent__body">
          <p class="bea-agent__caption"></p>
          <div class="bea-agent__controls">
            <button class="bea-agent__button bea-agent__button--primary" type="button" data-action="primary"></button>
            <button class="bea-agent__button" type="button" data-action="play"></button>
            <button class="bea-agent__button" type="button" data-action="mute"></button>
          </div>
          <div class="bea-agent__status" role="status" aria-live="polite"></div>
        </div>
      </div>
      <button class="bea-agent__launcher" type="button"></button>
    `;

    document.body.appendChild(root);
    state.elements = {
      root,
      title: root.querySelector(".bea-agent__title"),
      subtitle: root.querySelector(".bea-agent__subtitle"),
      caption: root.querySelector(".bea-agent__caption"),
      status: root.querySelector(".bea-agent__status"),
      play: root.querySelector('[data-action="play"]'),
      mute: root.querySelector('[data-action="mute"]'),
      primary: root.querySelector('[data-action="primary"]'),
      close: root.querySelector(".bea-agent__close"),
      launcher: root.querySelector(".bea-agent__launcher")
    };

    state.elements.close.addEventListener("click", () => root.classList.add("bea-agent--closed"));
    state.elements.launcher.addEventListener("click", () => root.classList.remove("bea-agent--closed"));
    state.elements.play.addEventListener("click", () => playAudio(state.currentMessage).catch(() => {}));
    state.elements.mute.addEventListener("click", () => {
      state.muted = !state.muted;
      if (state.audio) state.audio.pause();
      state.elements.mute.textContent = state.muted ? copy().play : copy().mute;
    });
    state.elements.primary.addEventListener("click", clickPrimaryAction);
  }

  function applyLanguageText() {
    const strings = copy();
    state.elements.title.textContent = strings.title;
    state.elements.subtitle.textContent = strings.subtitle;
    state.elements.play.textContent = strings.play;
    state.elements.mute.textContent = strings.mute;
    state.elements.primary.textContent = strings.continue;
    state.elements.launcher.textContent = strings.open;
  }

  async function init(config) {
    state.config = Object.assign({
      apiBaseUrl: "",
      manifestUrl: "/bea-agent/audio-manifest.json",
      defaultCourseId: "bea-b1-independent",
      enableDynamicTts: false
    }, config || {});

    state.language = detectLanguage();
    state.courseId = state.config.defaultCourseId;

    render();
    applyLanguageText();
    await loadManifest(state.config.manifestUrl);
    updateMessage(routeMessage());
  }

  function event(name, payload) {
    if (payload && payload.courseId) state.courseId = payload.courseId;

    if (name === "postTest") {
      sessionStorage.setItem("bea_agent_post_test", "true");
      updateMessage("postTest");
    }

    if (name === "trialStarted") {
      sessionStorage.setItem("bea_agent_trial_started", "true");
      state.language = "en";
      applyLanguageText();
      updateMessage("trial");
    }
  }

  window.BEAAgent = { init, event };
})();
