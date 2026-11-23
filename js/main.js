/* =================================================================
   NEPO Café · main.js — vanilla ES2020, sin dependencias.
   1 Horario y estado «abierto ahora»   6 Carta en pestañas
   2 Navbar (ocultar, página actual,     7 Marquee con inercia
     menú móvil)                        8 Botones magnéticos
   3 Hero: vídeo guiado por el scroll   9 Footer (revelado en 4)
   4 Revelados (texto, imagen, grupos)  10 Cookies y mapa
   5 Parallax y claim que se rellena
   Todo el contenido está en el HTML: si este archivo no carga, la
   web se lee completa (sin animaciones).
   ================================================================= */
(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0)); return t * t * (3 - 2 * t); };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Un único bucle de scroll: los módulos se suscriben y se ejecutan
     como mucho una vez por fotograma. */
  const scrollSubs = new Set();
  let scrollQueued = false;
  const runScroll = () => { scrollQueued = false; scrollSubs.forEach((fn) => fn()); };
  const onScroll = (fn) => { scrollSubs.add(fn); fn(); };
  const queueScroll = () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(runScroll); } };
  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll);

  /* ---------------------------------------------------------------
     1. HORARIO · se calcula con la hora oficial de Madrid
     --------------------------------------------------------------- */
  const HOURS = { // 0 = domingo … 6 = sábado · minutos desde medianoche
    0: [8 * 60, 15 * 60],
    1: [7 * 60 + 30, 19 * 60 + 30], 2: [7 * 60 + 30, 19 * 60 + 30], 3: [7 * 60 + 30, 19 * 60 + 30],
    4: [7 * 60 + 30, 19 * 60 + 30], 5: [7 * 60 + 30, 19 * 60 + 30],
    6: [8 * 60, 19 * 60 + 30],
  };
  const SPECIAL = { // "MM-DD": [apertura, cierre] o null = cerrado
    "12-24": [7 * 60 + 30, 15 * 60],
    "12-25": null,
  };
  const fmt = (m) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;

  function madridNow() {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Madrid", weekday: "short", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t)?.value;
    const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
    return { day, md: `${get("month")}-${get("day")}`, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
  }
  const nextMD = (md) => {
    const d = new Date(2001, Number(md.slice(0, 2)) - 1, Number(md.slice(3)) + 1);
    return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };
  const hoursFor = (day, md) => (md in SPECIAL ? SPECIAL[md] : HOURS[day]);

  function updateStatus() {
    const el = $("[data-status]"), text = $("[data-status-text]");
    if (!el || !text) return;
    const { day, md, minutes } = madridNow();
    const today = hoursFor(day, md);
    const isOpen = !!today && minutes >= today[0] && minutes < today[1];
    el.classList.toggle("is-open", isOpen);
    el.classList.toggle("is-closed", !isOpen);

    let main, detail = "";
    if (isOpen) { main = "Abierto"; detail = `hasta las ${fmt(today[1])}`; }
    else if (today && minutes < today[0]) { main = "Cerrado"; detail = `abre a las ${fmt(today[0])}`; }
    else {
      const tomorrow = hoursFor((day + 1) % 7, nextMD(md));
      main = "Cerrado"; detail = tomorrow ? `abre mañana a las ${fmt(tomorrow[0])}` : "mañana cerrado";
    }
    text.innerHTML = `<span class="status__main">${main}</span><span class="status__detail"> · ${detail}</span>`;

    $$("[data-season]").forEach((s) => {
      const [from, to] = s.dataset.season.split(":");
      s.hidden = !(md >= from && md <= to);
    });
    $$(".hours tr").forEach((tr) => tr.classList.toggle("is-today", tr.dataset.days.split(",").map(Number).includes(day)));
  }
  updateStatus();
  setInterval(updateStatus, 30_000);

  const yearEl = $("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------------
     2. NAVBAR
     --------------------------------------------------------------- */
  const nav = $("[data-nav]");
  const toggle = $("[data-nav-toggle]");
  const sheet = $("[data-nav-sheet]");
  const toggleLabel = $("[data-nav-toggle-label]");
  let lastY = window.scrollY;

  const setMenu = (open, { focusToggle = false } = {}) => {
    if (!nav || !sheet) return;
    if (open) {
      sheet.hidden = false;
      requestAnimationFrame(() => nav.classList.add("is-open"));
      sheet.querySelector("a")?.focus({ preventScroll: true });
    } else {
      if (!nav.classList.contains("is-open")) return;
      nav.classList.remove("is-open");
      setTimeout(() => { if (!nav.classList.contains("is-open")) sheet.hidden = true; }, reduceMotion ? 0 : 600);
      if (focusToggle) toggle.focus();
    }
    toggle.setAttribute("aria-expanded", String(open));
    toggleLabel.textContent = open ? "Cerrar menú" : "Abrir menú";
  };
  toggle?.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  sheet?.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav?.classList.contains("is-open")) setMenu(false, { focusToggle: true }); });
  document.addEventListener("click", (e) => { if (nav?.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false); });

  $$("[data-scroll-top]").forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    setMenu(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  }));

  // Sombra al bajar, se oculta al hacer scroll hacia abajo y vuelve al subir
  onScroll(() => {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle("is-scrolled", y > 24);
    if (Math.abs(y - lastY) > 6) {
      nav.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * .6 && !nav.contains(document.activeElement));
      lastY = y;
    }
  });
  nav?.addEventListener("focusin", () => nav.classList.remove("is-hidden"));

  // Píldora bajo el enlace de la página actual (aria-current="page" en el HTML);
  // al pasar el ratón se desliza hasta el enlace señalado y vuelve al salir.
  const pill = $("[data-nav-pill]");
  const navLinks = $$(".nav__links a");
  const currentLink = $('.nav__links a[aria-current="page"]');
  const movePill = (link) => {
    if (!pill) return;
    if (!link || !link.offsetWidth) { pill.classList.remove("is-on"); return; }
    pill.style.setProperty("--pill-x", `${link.offsetLeft}px`);
    pill.style.setProperty("--pill-w", `${link.offsetWidth}px`);
    pill.classList.add("is-on");
  };
  if (finePointer) {
    navLinks.forEach((a) => a.addEventListener("pointerenter", () => movePill(a)));
    $(".nav__links")?.addEventListener("pointerleave", () => movePill(currentLink));
  }
  movePill(currentLink);
  window.addEventListener("resize", () => movePill(currentLink));
  document.fonts?.ready.then(() => movePill(currentLink));

  /* ---------------------------------------------------------------
     3. HERO · vídeo real del vertido guiado por el scroll
     - El póster (primer fotograma, 15 KB) es lo que se pinta primero.
     - El MP4 (≈8 MB) solo se descarga tras la primera interacción, y
       nunca con «Ahorro de datos». Se guarda como blob para que cada
       salto de fotograma sea instantáneo.
     - El bucle de animación se detiene cuando el hero no está en pantalla.
     --------------------------------------------------------------- */
  const track = $("[data-hero-track]");
  const frame = $("[data-hero-frame]");
  const video = $("[data-pour-video]");
  const steps = $$("[data-step]");
  const bar = $("[data-hero-bar]");
  const pct = $("[data-hero-pct]");
  const hint = $("[data-hero-hint]");

  if (track && frame) {
    const saveData = navigator.connection?.saveData === true;
    let target = 0, progress = 0, raf = 0, visible = true, ready = false, activeStep = -1, objectUrl = "";

    const loadVideo = async () => {
      if (!video || saveData || video.dataset.loaded) return;
      video.dataset.loaded = "1";
      const src = video.dataset.src;
      try {
        const r = await fetch(src);
        if (!r.ok) throw new Error(String(r.status));
        objectUrl = URL.createObjectURL(await r.blob());
        video.src = objectUrl;
      } catch { video.preload = "auto"; video.src = src; }
    };
    if (video) {
      video.addEventListener("loadeddata", () => { ready = true; video.pause(); frame.classList.add("is-ready"); kick(); });
      video.addEventListener("seeked", () => kick());
      video.addEventListener("error", () => frame.classList.remove("is-ready")); // se queda el póster
      const START = ["scroll", "wheel", "touchstart", "pointerdown", "keydown"];
      const start = () => { START.forEach((ev) => window.removeEventListener(ev, start)); loadVideo(); };
      START.forEach((ev) => window.addEventListener(ev, start, { passive: true, once: true }));
      if (window.scrollY > 0) start();
      // iOS Safari solo pinta fotogramas buscados tras una reproducción iniciada por gesto
      window.addEventListener("touchstart", () => { video.play().then(() => video.pause()).catch(() => {}); }, { once: true, passive: true });
    }

    const measure = () => {
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      target = total > 0 ? clamp(-r.top / total) : 0;
    };

    const render = () => {
      progress += (target - progress) * (reduceMotion ? 1 : 0.12);
      if (Math.abs(target - progress) < 0.0005) progress = target;
      const p = progress;

      frame.style.setProperty("--p", p.toFixed(4));
      frame.style.setProperty("--open", smooth(0, 0.18, p).toFixed(4));
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (pct) pct.textContent = String(Math.round(p * 100)).padStart(2, "0");
      if (hint) hint.style.opacity = (1 - smooth(0.01, 0.08, p)).toFixed(3);

      // Cada paso ocupa un tercio del recorrido
      const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
      if (idx !== activeStep) {
        activeStep = idx;
        steps.forEach((s, i) => { s.classList.toggle("is-active", i === idx); s.setAttribute("aria-hidden", String(i !== idx)); });
      }

      if (ready && video.duration && !video.seeking) {
        const t = clamp(p) * (video.duration - 0.04); // evita el último fotograma negro de algunos códecs
        if (Math.abs(video.currentTime - t) > 1 / 60) video.currentTime = t;
      }
      const pending = ready && video.duration && Math.abs(video.currentTime - clamp(progress) * (video.duration - 0.04)) > 1 / 60;
      raf = visible && (progress !== target || pending) ? requestAnimationFrame(render) : 0;
    };
    const kick = () => { if (!raf && visible) raf = requestAnimationFrame(render); };

    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(track);
    onScroll(() => { measure(); kick(); });
    measure(); progress = target; render();
  }

  /* ---------------------------------------------------------------
     4. REVELADOS
     data-split           → titulares palabra a palabra desde una máscara
     data-reveal="fade"   → párrafos
     data-reveal="image"  → la máscara de la foto se abre
     data-reveal="stagger"→ los hijos entran escalonados
     data-reveal="word"   → palabras del manifiesto
     --------------------------------------------------------------- */
  // Envuelve cada palabra (respetando <em> y demás etiquetas) en .w > span
  function splitWords(root) {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.append(" "); return; }
            const w = document.createElement("span"); w.className = "w";
            const inner = document.createElement("span"); inner.textContent = part; inner.style.setProperty("--i", i++);
            w.append(inner); frag.append(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(root);
  }
  $$("[data-split]").forEach(splitWords);
  $$('[data-reveal="stagger"]').forEach((g) => [...g.children].forEach((c, i) => c.style.setProperty("--i", i)));
  $$("[data-footer-word] span").forEach((s, i) => s.style.setProperty("--i", i));

  const revealTargets = $$("[data-split], [data-reveal], [data-footer-word]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el) => io.observe(el));
  } else revealTargets.forEach((el) => el.classList.add("is-in"));

  /* ---------------------------------------------------------------
     5. PARALLAX + CLAIM QUE SE RELLENA
     --------------------------------------------------------------- */
  if (!reduceMotion) {
    const layers = $$("[data-parallax]").map((el) => ({ el, speed: Number(el.dataset.parallax) || 0, on: false }));
    const pio = new IntersectionObserver((entries) => entries.forEach((e) => {
      const l = layers.find((x) => x.el === e.target); if (l) l.on = e.isIntersecting;
    }), { rootMargin: "10% 0px" });
    layers.forEach((l) => pio.observe(l.el));
    onScroll(() => {
      const vh = window.innerHeight;
      layers.forEach((l) => {
        if (!l.on) return;
        const r = l.el.parentElement.getBoundingClientRect();
        const d = (r.top + r.height / 2 - vh / 2);
        l.el.style.transform = `translate3d(0, ${(d * l.speed).toFixed(1)}px, 0)`;
      });
    });
  }

  const fill = $("[data-fill]");
  if (fill) {
    // Palabra a palabra, conservando el <em>
    const words = [];
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(" "); return; }
          const s = document.createElement("span"); s.className = "fw"; s.textContent = part; words.push(s); frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(fill);
    onScroll(() => {
      const r = fill.getBoundingClientRect(), vh = window.innerHeight;
      const p = reduceMotion ? 1 : clamp((vh * .85 - r.top) / (vh * .55));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-on", i < n));
    });
  }

  /* ---------------------------------------------------------------
     6. CARTA · pestañas accesibles sobre el HTML existente
     --------------------------------------------------------------- */
  const menu = $("[data-menu]");
  if (menu) {
    const section = menu.closest(".menu");
    const tabsEl = $("[data-tabs]", menu);
    const tabsPill = $("[data-tabs-pill]", menu);
    const cats = $$(".menu__cat", menu);
    const photos = $$("[data-photo-for]");

    cats.forEach((cat) => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "tab"; btn.setAttribute("role", "tab");
      btn.id = `tab-${cat.dataset.cat}`;
      btn.setAttribute("aria-controls", cat.id);
      btn.textContent = cat.dataset.label;
      tabsEl.append(btn);
      cat.setAttribute("role", "tabpanel");
      cat.setAttribute("aria-labelledby", btn.id);
      cat.tabIndex = 0;
      $$(".dish", cat).forEach((d, i) => d.style.setProperty("--i", i));
    });
    tabsEl.setAttribute("role", "tablist");
    tabsEl.setAttribute("aria-label", "Categorías de la carta");
    tabsEl.hidden = false;
    section.classList.add("is-tabbed");
    const tabs = $$(".tab", tabsEl);

    const placePill = (btn) => {
      if (!tabsPill || !btn) return;
      tabsPill.style.setProperty("--pill-x", `${btn.offsetLeft}px`);
      tabsPill.style.setProperty("--pill-y", `${btn.offsetTop}px`);
      tabsPill.style.setProperty("--pill-w", `${btn.offsetWidth}px`);
      tabsPill.style.setProperty("--pill-h", `${btn.offsetHeight}px`);
    };

    const select = (btn, { focus = false, animate = true } = {}) => {
      tabs.forEach((b) => { const on = b === btn; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
      const id = btn.id.replace("tab-", "");
      cats.forEach((c) => {
        const on = c.dataset.cat === id;
        c.hidden = !on;
        c.classList.toggle("is-entering", on && animate);
      });
      photos.forEach((ph) => {
        const on = ph.dataset.photoFor === id;
        if (ph.classList.contains("is-active") && !on) { ph.classList.add("is-leaving"); setTimeout(() => ph.classList.remove("is-leaving"), 1000); }
        ph.classList.toggle("is-active", on);
      });
      placePill(btn);
      if (focus) btn.focus();
      if (animate) btn.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
    };

    tabsEl.addEventListener("click", (e) => { const b = e.target.closest(".tab"); if (b) select(b); });
    tabsEl.addEventListener("keydown", (e) => {
      const i = tabs.indexOf(document.activeElement);
      if (i < 0) return;
      const map = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 };
      if (e.key in map) { e.preventDefault(); select(tabs[map[e.key]], { focus: true }); }
    });
    tabsEl.addEventListener("scroll", () => placePill(tabs.find((t) => t.getAttribute("aria-selected") === "true")), { passive: true });
    window.addEventListener("resize", () => placePill(tabs.find((t) => t.getAttribute("aria-selected") === "true")));
    document.fonts?.ready.then(() => placePill(tabs.find((t) => t.getAttribute("aria-selected") === "true")));

    // Enlaces directos a una categoría (#carta-tostadas)
    const fromHash = tabs.find((t) => `#${t.getAttribute("aria-controls")}` === location.hash);
    select(fromHash || tabs[0], { animate: false });
  }

  /* ---------------------------------------------------------------
     7. MARQUEE · se inclina un poco con la velocidad del scroll
     --------------------------------------------------------------- */
  const marquee = $("[data-marquee] .marquee__track");
  if (marquee && !reduceMotion) {
    let prev = window.scrollY, skew = 0, t = 0;
    const settle = () => {
      skew *= 0.88;
      marquee.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
      t = Math.abs(skew) > 0.05 ? requestAnimationFrame(settle) : 0;
    };
    onScroll(() => {
      const y = window.scrollY;
      skew = clamp((y - prev) * -0.12, -6, 6);
      prev = y;
      if (!t) t = requestAnimationFrame(settle);
    });
  }

  /* ---------------------------------------------------------------
     8. BOTONES MAGNÉTICOS (solo ratón; nunca en táctil ni con
        movimiento reducido)
     --------------------------------------------------------------- */
  if (finePointer && !reduceMotion) {
    $$(".btn--magnetic").forEach((btn) => {
      const label = btn.firstElementChild;
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width;
        const y = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = `translate(${(x * 10).toFixed(1)}px, ${(y * 8).toFixed(1)}px)`;
        if (label) label.style.transform = `translate(${(x * 6).toFixed(1)}px, ${(y * 4).toFixed(1)}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; if (label) label.style.transform = ""; });
    });
  }

  /* ---------------------------------------------------------------
     10. COOKIES + MAPA
     Única categoría opcional: Google Maps (terceros). La elección se
     guarda 12 meses en localStorage («nepo-cookies»).
     --------------------------------------------------------------- */
  const CONSENT_KEY = "nepo-cookies";
  const CONSENT_DAYS = 365;
  const banner = $("[data-cookie-banner]");
  const prefs = $("[data-cookie-prefs]");
  const cfgBtn = $("[data-cookie-config]");
  const mapsBox = $("[data-cookie-maps]");
  const mapFrame = $(".map__frame");
  const mapConsent = $("[data-map-consent]");

  const readConsent = () => {
    try {
      const c = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return c && Date.now() - c.date < CONSENT_DAYS * 864e5 ? c.value : null;
    } catch { return null; }
  };
  const saveConsent = (value) => { try { localStorage.setItem(CONSENT_KEY, JSON.stringify({ value, date: Date.now() })); } catch {} };

  let mapObserver = null;
  const loadMap = () => {
    if (!mapFrame || mapFrame.getAttribute("src")) return;
    mapConsent?.setAttribute("hidden", "");
    mapObserver = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { mapFrame.src = mapFrame.dataset.src; mapObserver.disconnect(); }
    }, { rootMargin: "400px" });
    mapObserver.observe(mapFrame);
  };
  const unloadMap = () => {
    mapObserver?.disconnect();
    if (mapFrame?.getAttribute("src")) mapFrame.removeAttribute("src");
    mapConsent?.removeAttribute("hidden");
  };

  let lastFocus = null;
  const showBanner = () => {
    if (!banner) return;
    lastFocus = document.activeElement;
    if (mapsBox) mapsBox.checked = readConsent() === "accepted";
    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add("is-visible"));
  };
  const hideBanner = () => {
    banner.classList.remove("is-visible");
    setTimeout(() => (banner.hidden = true), 450);
    if (lastFocus && banner.contains(document.activeElement)) lastFocus.focus?.();
  };
  const setConsent = (value) => { saveConsent(value); value === "accepted" ? loadMap() : unloadMap(); hideBanner(); };

  if (banner) {
    $$("[data-cookie-accept]").forEach((b) => b.addEventListener("click", () => setConsent("accepted")));
    $$("[data-cookie-reject]").forEach((b) => b.addEventListener("click", () => setConsent("rejected")));
    $$("[data-cookie-settings]").forEach((b) => b.addEventListener("click", () => { showBanner(); banner.querySelector("button")?.focus(); }));
    $("[data-cookie-save]")?.addEventListener("click", () => setConsent(mapsBox?.checked ? "accepted" : "rejected"));
    cfgBtn?.addEventListener("click", () => {
      const open = prefs.hidden;
      prefs.hidden = !open;
      cfgBtn.setAttribute("aria-expanded", String(open));
      if (open) mapsBox?.focus();
    });
    // Desde el aviso del mapa: aceptar solo Google Maps
    $$("[data-map-accept]").forEach((b) => b.addEventListener("click", () => setConsent("accepted")));

    const consent = readConsent();
    if (consent === "accepted") loadMap();
    if (!consent || location.hash === "#cookies") showBanner();
  }
})();
