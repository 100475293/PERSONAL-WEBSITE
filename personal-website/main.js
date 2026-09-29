/* ==========================================================================
   Shared behaviour
   --------------------------------------------------------------------------
   No scroll listeners anywhere. Header state uses a sentinel observer,
   reveals use IntersectionObserver.
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Theme -------------------------------------------------------- */

  function readTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }

  function writeTheme(value) {
    try { localStorage.setItem("theme", value); } catch (e) { /* private mode */ }
  }

  function currentTheme() {
    var set = document.documentElement.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function initTheme() {
    var stored = readTheme();
    if (stored === "dark" || stored === "light") {
      document.documentElement.setAttribute("data-theme", stored);
    }

    var toggle = document.querySelector("[data-theme-toggle]");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      writeTheme(next);
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
  }

  /* ---- Sticky header state ------------------------------------------ */

  function initMasthead() {
    var head = document.querySelector(".masthead");
    if (!head || !("IntersectionObserver" in window)) return;

    var sentinel = document.createElement("div");
    sentinel.setAttribute("aria-hidden", "true");
    sentinel.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
    document.body.prepend(sentinel);

    new IntersectionObserver(function (entries) {
      head.setAttribute("data-stuck", String(!entries[0].isIntersecting));
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---- Reveal on scroll --------------------------------------------- */

  function initReveals() {
    var targets = document.querySelectorAll("[data-reveal]");
    if (!targets.length) return;

    if (reduced || !("IntersectionObserver" in window)) {
      targets.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(function (el, i) {
      // Stagger only within a shared parent, so unrelated blocks do not queue.
      var order = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.setProperty("--reveal-delay", Math.min(order, 6) * 55 + "ms");
      io.observe(el);
    });
  }

  /* ---- Page exit fade ----------------------------------------------- */

  function initPageExit() {
    if (reduced) return;

    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      var link = e.target.closest("a");
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.origin !== window.location.origin) return;
      if (/\.(pdf|png|jpe?g|svg|webp|zip|mp4)$/i.test(link.pathname)) return;
      if (link.pathname === window.location.pathname) return;

      e.preventDefault();
      document.body.setAttribute("data-exiting", "true");
      window.setTimeout(function () { window.location.href = link.href; }, 200);
    });

    // Restore on back/forward navigation out of bfcache.
    window.addEventListener("pageshow", function () {
      document.body.removeAttribute("data-exiting");
    });
  }

  /* ---- Ticker duplication ------------------------------------------- */

  function initTicker() {
    var track = document.querySelector("[data-ticker]");
    if (!track) return;
    // The CSS animation translates by -50%, so the content must be doubled.
    track.innerHTML += track.innerHTML;
    track.setAttribute("aria-hidden", "true");
  }

  /* ---- Boot ---------------------------------------------------------- */

  function boot() {
    initTheme();
    initMasthead();
    initTicker();
    initReveals();
    initPageExit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
