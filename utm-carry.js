/* Carries ad tracking (UTMs + Facebook/Google click IDs) from the landing URL
   through to the Spiffy checkout so orders can be attributed to the ad. */
(function () {
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "fbclid", "gclid"];
  var STORE = "bpt_attrib", DAYS = 30;
  function load() {
    try { var d = JSON.parse(localStorage.getItem(STORE) || "null"); if (d && d.exp > Date.now()) return d.p; } catch (e) {}
    return null;
  }
  var params = new URLSearchParams(location.search), found = {}, any = false;
  KEYS.forEach(function (k) { var v = params.get(k); if (v) { found[k] = v; any = true; } });
  if (any) {
    try { localStorage.setItem(STORE, JSON.stringify({ p: found, exp: Date.now() + DAYS * 864e5 })); } catch (e) {}
  }
  function tag(a) {
    var p = load();
    if (!p || !a || !a.href || a.href.indexOf("spiffy.co") === -1) return;
    try {
      var u = new URL(a.href);
      Object.keys(p).forEach(function (k) { if (!u.searchParams.has(k)) u.searchParams.set(k, p[k]); });
      a.href = u.toString();
    } catch (e) {}
  }
  function tagAll() { document.querySelectorAll('a[href*="spiffy.co"]').forEach(tag); }
  ["mousedown", "touchstart", "click", "auxclick"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { var a = e.target && e.target.closest ? e.target.closest("a") : null; if (a) tag(a); }, true);
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", tagAll); else tagAll();
  setTimeout(tagAll, 1500);
})();
