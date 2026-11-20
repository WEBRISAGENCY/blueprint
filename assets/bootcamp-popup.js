/* Agency Bootcamp pop-up: shows 3 seconds after page load and sends visitors to /agency-bootcamp.
   Loaded on every page by netlify/edge-functions/bootcamp-popup.js. */
(function () {
  var TARGET = "/agency-bootcamp";
  var DELAY_MS = 3000;
  var KEY = "bpt_bootcamp_popup";
  var HIDE_DAYS_CLOSED = 7;   // after the X, wait a week before showing again
  var HIDE_DAYS_CLICKED = 30; // after clicking through, wait a month

  // Pages where the pop-up would get in the way (funnels, checkout, internal docs)
  var SKIP = [/^\/agency-bootcamp/, /^\/sign-up/, /^\/thank-you/, /^\/get-started/, /^\/presale/,
    /^\/proposal/i, /^\/lp-/, /watch/i, /^\/future-of-seo-agencies/, /^\/agency-ai-optin/,
    /^\/webinar/, /^\/chatgpt(live|webby|webinar|workshop)/, /^\/discoverchatgpt/, /^\/ai-vsl/,
    /^\/agency-os-vsl/, /^\/one-person-agency-/, /^\/BPT_/, /^\/style-guide/, /^\/_/, /^\/404/];
  var path = location.pathname;
  for (var i = 0; i < SKIP.length; i++) if (SKIP[i].test(path)) return;
  if (/[?&]nopopup\b/.test(location.search)) return;

  function store(get, val) {
    try { if (get) return localStorage.getItem(KEY); localStorage.setItem(KEY, val); } catch (e) {}
    return null;
  }
  var until = parseInt(store(true), 10);
  if (until && Date.now() < until) return;
  function snooze(days) { store(false, String(Date.now() + days * 864e5)); }

  var css = "" +
    ".bptp-wrap{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(11,14,26,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;transition:opacity .3s ease;font-family:'Figtree',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".bptp-wrap.bptp-in{opacity:1}" +
    ".bptp-card{position:relative;box-sizing:border-box;width:100%;max-width:820px;max-height:calc(100vh - 32px);overflow:auto;display:grid;grid-template-columns:44% 1fr;background:#fff;color:#0B0E1A;border-radius:18px;box-shadow:0 30px 80px -20px rgba(11,14,26,.45);transform:translateY(12px) scale(.98);transition:transform .3s ease;text-align:left}" +
    ".bptp-in .bptp-card{transform:none}" +
    ".bptp-card:focus{outline:none}" +
    ".bptp-media{position:relative;display:block;min-height:100%;background:#0B0E1A url('/assets/bootcamp-popup.webp') 38% center/cover no-repeat}" +
    ".bptp-play{position:absolute;left:50%;top:50%;width:68px;height:68px;margin:-34px 0 0 -34px;border-radius:999px;background:rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform .2s ease}" +
    ".bptp-media:hover .bptp-play{transform:scale(1.07)}" +
    ".bptp-body{padding:48px 44px 40px;display:flex;flex-direction:column}" +
    ".bptp-x{position:absolute;top:12px;right:12px;z-index:2;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:0;border-radius:999px;background:#f1f2f5;color:#4b5263;cursor:pointer;padding:0;transition:background .15s ease,color .15s ease}" +
    ".bptp-x:hover{background:#e4e6eb;color:#0B0E1A}" +
    ".bptp-x:focus-visible,.bptp-btn:focus-visible,.bptp-media:focus-visible{outline:3px solid #2868d5;outline-offset:3px}" +
    ".bptp-tag{display:inline-flex;align-items:center;gap:8px;align-self:flex-start;margin:0 0 18px;font-size:13px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#5f6368}" +
    ".bptp-dot{width:8px;height:8px;border-radius:999px;background:#e5484d;box-shadow:0 0 0 4px rgba(229,72,77,.15)}" +
    ".bptp-h{margin:0 0 14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:800;font-size:44px;line-height:.98;text-transform:uppercase;letter-spacing:.005em;color:#0B0E1A}" +
    ".bptp-h span{box-shadow:inset 0 -.32em 0 #F7C600}" +
    ".bptp-p{margin:0 0 28px;font-size:17px;line-height:1.55;color:#4b5263}" +
    ".bptp-p b{color:#0B0E1A;font-weight:700}" +
    ".bptp-btn{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px;box-sizing:border-box;padding:14px 22px;border-radius:12px;background:#0B0E1A;color:#fff;font-size:17px;font-weight:700;text-decoration:none;cursor:pointer;transition:background .15s ease}" +
    ".bptp-btn:hover{background:#1e2538;color:#fff}" +
    ".bptp-btn svg{color:#F7C600;transition:transform .15s ease}" +
    ".bptp-btn:hover svg{transform:translateX(3px)}" +
    "@media (max-width:680px){.bptp-card{grid-template-columns:1fr;max-width:420px}.bptp-media{min-height:0;aspect-ratio:16/9;background-position:center 30%}.bptp-body{padding:26px 24px 24px}.bptp-h{font-size:36px}.bptp-p{font-size:16px;margin-bottom:22px}.bptp-x{background:rgba(255,255,255,.92)}}" +
    "@media (prefers-reduced-motion:reduce){.bptp-wrap,.bptp-card,.bptp-play,.bptp-btn svg{transition:none}}";

  var html = "" +
    '<div class="bptp-card" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="bptp-h" aria-describedby="bptp-d">' +
      '<button type="button" class="bptp-x" aria-label="Close">' +
        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      '<a class="bptp-media" data-bptp="image" href="' + TARGET + '" aria-label="Watch the bootcamp overview" tabindex="-1">' +
        '<span class="bptp-play" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z" fill="#0B0E1A"/></svg></span>' +
      "</a>" +
      '<div class="bptp-body">' +
        '<p class="bptp-tag"><span class="bptp-dot" aria-hidden="true"></span>Live bootcamp · Starts Nov 30</p>' +
        '<h2 class="bptp-h" id="bptp-h">Your agency needs a <span>new playbook.</span></h2>' +
        '<p class="bptp-p" id="bptp-d">10 live sessions on running a lean, AI-powered agency, taught by Ryan Stewart and the WEBRIS team. <b>Free for Blueprint members.</b></p>' +
        '<a class="bptp-btn" data-bptp="cta" href="' + TARGET + '">See the bootcamp<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
      "</div>" +
    "</div>";

  function show() {
    if (document.querySelector(".bptp-wrap")) return;
    if (!document.querySelector('link[href*="Barlow+Condensed"]')) {
      var f = document.createElement("link");
      f.rel = "stylesheet";
      f.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@800&family=Figtree:wght@400;700&display=swap";
      document.head.appendChild(f);
    }
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);

    var wrap = document.createElement("div");
    wrap.className = "bptp-wrap";
    wrap.innerHTML = html;
    document.body.appendChild(wrap);
    var lastFocus = document.activeElement;
    var prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(function () { wrap.classList.add("bptp-in"); });

    var closeBtn = wrap.querySelector(".bptp-x");
    var focusables = wrap.querySelectorAll(".bptp-x, .bptp-btn");
    wrap.querySelector(".bptp-card").focus({ preventScroll: true });

    function close() {
      snooze(HIDE_DAYS_CLOSED);
      document.removeEventListener("keydown", onKey, true);
      document.documentElement.style.overflow = prevOverflow;
      wrap.classList.remove("bptp-in");
      setTimeout(function () { wrap.remove(); st.remove(); }, 260);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      else if (e.key === "Tab") { // keep focus inside the pop-up
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKey, true);
    closeBtn.addEventListener("click", close);
    wrap.addEventListener("click", function (e) { if (e.target === wrap) close(); });
    wrap.querySelectorAll("[data-bptp]").forEach(function (a) {
      a.addEventListener("click", function () {
        snooze(HIDE_DAYS_CLICKED);
        try { (window.dataLayer = window.dataLayer || []).push({ event: "bootcamp_popup_click", button: a.getAttribute("data-bptp") }); } catch (e) {}
      });
    });
    try { (window.dataLayer = window.dataLayer || []).push({ event: "bootcamp_popup_view" }); } catch (e) {}
  }

  function start() { setTimeout(show, DELAY_MS); }
  if (document.readyState === "complete") start();
  else window.addEventListener("load", start);
})();
