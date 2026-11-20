/* Agency Bootcamp pop-up: shows 3 seconds after page load and sends visitors to /agency-bootcamp.
   Loaded on every page by netlify/edge-functions/bootcamp-popup.js. */
(function () {
  var TARGET = "/agency-bootcamp";
  var DELAY_MS = 3000;
  var KEY = "bpt_bootcamp_popup";
  var HIDE_DAYS_CLOSED = 7;   // after the X, wait a week before showing again
  var HIDE_DAYS_CLICKED = 30; // after Yes or Tell me more, wait a month

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
    ".bptp-wrap{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(5,7,14,.72);opacity:0;transition:opacity .25s ease;font-family:'Figtree',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif}" +
    ".bptp-wrap.bptp-in{opacity:1}" +
    ".bptp-card{position:relative;box-sizing:border-box;width:100%;max-width:520px;max-height:calc(100vh - 32px);overflow:auto;background:#0B0E1A;color:#fff;border:1px solid #23293d;border-top:5px solid #F7C600;border-radius:16px;padding:44px 40px 36px;box-shadow:0 40px 90px -30px rgba(0,0,0,.8);transform:translateY(16px);transition:transform .25s ease;text-align:left}" +
    ".bptp-in .bptp-card{transform:none}" +
    ".bptp-card:focus{outline:none}" +
    ".bptp-x{position:absolute;top:10px;right:10px;width:44px;height:44px;display:flex;align-items:center;justify-content:center;border:0;border-radius:999px;background:rgba(255,255,255,.08);color:#fff;cursor:pointer;padding:0}" +
    ".bptp-x:hover{background:rgba(255,255,255,.18)}" +
    ".bptp-x:focus-visible,.bptp-btn:focus-visible{outline:3px solid #4A9FD5;outline-offset:3px}" +
    ".bptp-eyebrow{margin:0 0 14px;padding-right:48px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:16px;letter-spacing:.14em;text-transform:uppercase;color:#F7C600}" +
    ".bptp-h{margin:0 0 14px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:800;font-size:40px;line-height:1.02;text-transform:uppercase;color:#fff}" +
    ".bptp-p{margin:0 0 10px;font-size:17px;line-height:1.5;color:#c9d2e3}" +
    ".bptp-p b{color:#fff}" +
    ".bptp-q{margin:22px 0 14px;font-size:19px;font-weight:700;color:#fff}" +
    ".bptp-row{display:flex;gap:12px}" +
    ".bptp-btn{flex:1;display:flex;align-items:center;justify-content:center;min-height:54px;box-sizing:border-box;padding:12px 18px;border-radius:10px;font-family:'Barlow Condensed','Arial Narrow',sans-serif;font-weight:700;font-size:22px;letter-spacing:.04em;text-transform:uppercase;text-decoration:none;cursor:pointer;white-space:nowrap}" +
    ".bptp-yes{background:#F7C600;color:#0B0E1A;border:2px solid #F7C600}" +
    ".bptp-yes:hover{background:#ffd52e;border-color:#ffd52e}" +
    ".bptp-more{background:transparent;color:#fff;border:2px solid #5b6480}" +
    ".bptp-more:hover{border-color:#fff}" +
    "@media (max-width:480px){.bptp-card{padding:40px 22px 24px}.bptp-h{font-size:32px}.bptp-p{font-size:16px}.bptp-row{flex-direction:column}}" +
    "@media (prefers-reduced-motion:reduce){.bptp-wrap,.bptp-card{transition:none}}";

  var html = "" +
    '<div class="bptp-card" tabindex="-1" role="dialog" aria-modal="true" aria-labelledby="bptp-h" aria-describedby="bptp-d">' +
      '<button type="button" class="bptp-x" aria-label="Close">' +
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      "</button>" +
      '<p class="bptp-eyebrow">Live bootcamp · Starts Mon, Nov 30</p>' +
      '<h2 class="bptp-h" id="bptp-h">AI is killing the traditional SEO agency.</h2>' +
      '<div id="bptp-d">' +
        '<p class="bptp-p">The One-Person Agency Program is a 10-day live bootcamp that gives you the full roadmap to run a lean, AI-powered agency.</p>' +
        '<p class="bptp-p"><b>Free for Blueprint members.</b> $599 early bird for everyone else.</p>' +
      "</div>" +
      '<p class="bptp-q">Want to save your seat?</p>' +
      '<div class="bptp-row">' +
        '<a class="bptp-btn bptp-yes" data-bptp="yes" href="' + TARGET + '#pricing">Yes</a>' +
        '<a class="bptp-btn bptp-more" data-bptp="more" href="' + TARGET + '">Tell me more</a>' +
      "</div>" +
    "</div>";

  function show() {
    if (document.querySelector(".bptp-wrap")) return;
    if (!document.querySelector('link[href*="Barlow+Condensed"]')) {
      var f = document.createElement("link");
      f.rel = "stylesheet";
      f.href = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&family=Figtree:wght@400;700&display=swap";
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
    var focusables = wrap.querySelectorAll("button, a[href]");
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
