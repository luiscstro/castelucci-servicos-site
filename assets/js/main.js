(function () {
  "use strict";

  if (window.__castelucciMainInit) return;
  window.__castelucciMainInit = true;

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Top load progress bar ---------- */
  (function progressBar() {
    var bar = document.getElementById("load-progress");
    if (!bar) return;

    function finish() {
      bar.style.width = "100%";
      setTimeout(function () {
        bar.classList.add("done");
      }, 180);
    }

    // Page just loaded: run the bar to completion once.
    bar.style.width = "40%";
    if (document.readyState === "complete") {
      finish();
    } else {
      window.addEventListener("load", finish);
    }

    // Internal navigation: start the bar immediately so a full page load
    // (this is a static multi-page site, not an SPA) still feels responsive.
    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      var url;
      try {
        url = new URL(href, window.location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      bar.classList.remove("done");
      bar.style.width = "12%";
      setTimeout(function () {
        bar.style.width = "72%";
      }, 60);
    });
  })();

  /* ---------- Header shadow on scroll ---------- */
  var header = document.getElementById("site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    var backToTop = document.getElementById("back-to-top");
    if (backToTop) backToTop.classList.toggle("show", window.scrollY > 480);
  }
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var backToTopBtn = document.getElementById("back-to-top");
  backToTopBtn &&
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });

  /* ---------- Mobile drawer ---------- */
  var navToggle = document.getElementById("nav-toggle");
  var drawer = document.getElementById("mobile-drawer");
  var drawerClose = document.getElementById("drawer-close");
  var drawerScrim = document.getElementById("drawer-scrim");

  function openDrawer() {
    if (!drawer) return;
    drawer.classList.add("open");
    drawerScrim && drawerScrim.classList.add("open");
    document.body.classList.add("no-scroll");
    navToggle && navToggle.setAttribute("aria-expanded", "true");
  }
  function closeDrawer() {
    if (!drawer) return;
    drawer.classList.remove("open");
    drawerScrim && drawerScrim.classList.remove("open");
    document.body.classList.remove("no-scroll");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
  }
  navToggle && navToggle.addEventListener("click", openDrawer);
  drawerClose && drawerClose.addEventListener("click", closeDrawer);
  drawerScrim && drawerScrim.addEventListener("click", closeDrawer);
  drawer &&
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeDrawer);
    });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ---------- Scroll reveal (single elements + staggered groups) ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal], [data-reveal-group]"));
  if (revealEls.length) {
    if ("IntersectionObserver" in window && !prefersReducedMotion) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        revealObserver.observe(el);
      });
    } else {
      revealEls.forEach(function (el) {
        el.classList.add("in-view");
      });
    }
  }

  /* ---------- Progressive images: skeleton -> blur-up crossfade ---------- */
  (function initMedia() {
    var mediaEls = Array.prototype.slice.call(document.querySelectorAll(".media"));
    mediaEls.forEach(function (wrap) {
      var img = wrap.querySelector("img");
      if (!img) return;
      function markLoaded() {
        wrap.classList.add("is-loaded");
      }
      if (img.complete && img.naturalWidth > 0) {
        markLoaded();
      } else {
        img.addEventListener("load", markLoaded);
        img.addEventListener("error", markLoaded);
      }
    });
  })();

  /* ---------- Stat counters: count up once revealed ---------- */
  (function initCounters() {
    var counters = Array.prototype.slice.call(document.querySelectorAll(".stat-number[data-count-to]"));
    if (!counters.length) return;

    function animateCounter(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReducedMotion || !target) {
        el.textContent = target + suffix;
        return;
      }
      var duration = 1100;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    } else {
      counters.forEach(animateCounter);
    }
  })();

  /* ---------- Timeline vertical animada pelo scroll ---------- */
  (function initTimeline() {
    var tl = document.querySelector(".timeline");
    if (!tl) return;
    var progress = tl.querySelector(".timeline__progress");
    var items = Array.prototype.slice.call(tl.querySelectorAll(".timeline__item"));
    if (!progress || !items.length) return;

    if (prefersReducedMotion) {
      progress.style.height = "100%";
      items.forEach(function (item) {
        item.classList.add("is-active");
      });
      return;
    }

    var ticking = false;
    function update() {
      ticking = false;
      var rect = tl.getBoundingClientRect();
      var anchor = window.innerHeight * 0.72;
      var fill = Math.min(Math.max(anchor - rect.top, 0), rect.height);
      progress.style.height = fill + "px";
      items.forEach(function (item) {
        var dotY = item.getBoundingClientRect().top - rect.top + 10;
        item.classList.toggle("is-active", fill >= dotY);
      });
    }
    function onScrollTl() {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }
    update();
    window.addEventListener("scroll", onScrollTl, { passive: true });
    window.addEventListener("resize", onScrollTl, { passive: true });
  })();

  /* ---------- Hero cube: pointer-follow 3D tilt (desktop pointers only) ----------
     Gated to hover+fine-pointer devices so touch/mobile never pays for this: no
     listeners are attached at all there, keeping the hero fluid on phones. */
  (function initCubeTilt() {
    var stage = document.querySelector(".cube-stage");
    var wrap = document.getElementById("cube-mark-wrap");
    if (!stage || !wrap || prefersReducedMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    var maxTilt = 15;
    var bounds = stage.getBoundingClientRect();
    var ticking = false;
    var pending = null;

    function updateBounds() {
      bounds = stage.getBoundingClientRect();
    }

    function apply() {
      ticking = false;
      if (!pending) return;
      var relX = Math.min(Math.max((pending.x - bounds.left) / bounds.width, 0), 1);
      var relY = Math.min(Math.max((pending.y - bounds.top) / bounds.height, 0), 1);
      var rotY = (relX - 0.5) * maxTilt * 2;
      var rotX = (0.5 - relY) * maxTilt * 2;
      wrap.style.transform =
        "perspective(1200px) rotateX(" + rotX.toFixed(2) + "deg) rotateY(" + rotY.toFixed(2) + "deg) scale(1.04)";
    }

    function onMove(e) {
      pending = { x: e.clientX, y: e.clientY };
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(apply);
      }
    }

    function reset() {
      wrap.style.transform = "";
    }

    stage.addEventListener("mouseenter", updateBounds);
    stage.addEventListener("mousemove", onMove);
    stage.addEventListener("mouseleave", reset);
    window.addEventListener("resize", updateBounds, { passive: true });
  })();

  /* ---------- Floating WhatsApp widget ---------- */
  var floatingWidget = document.getElementById("floating-widget");
  var floatingToggle = document.getElementById("floating-toggle");
  var lastScrollY = window.scrollY;
  floatingToggle &&
    floatingToggle.addEventListener("click", function () {
      var isOpen = floatingWidget.classList.toggle("open");
      floatingToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  document.addEventListener("click", function (e) {
    if (floatingWidget && !floatingWidget.contains(e.target)) {
      floatingWidget.classList.remove("open");
      floatingToggle && floatingToggle.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener(
    "scroll",
    function () {
      if (!floatingWidget) return;
      var currentY = window.scrollY;
      var delta = currentY - lastScrollY;
      if (currentY > 80 && delta > 4) {
        floatingWidget.classList.add("is-hidden");
        floatingWidget.classList.remove("open");
      } else if (delta < -4 || currentY <= 80) {
        floatingWidget.classList.remove("is-hidden");
      }
      lastScrollY = currentY;
    },
    { passive: true }
  );

  /* ---------- Cookie / LGPD consent banner ---------- */
  var COOKIE_KEY = "castelucci_lgpd_consent";
  var cookieBanner = document.getElementById("cookie-banner");
  if (cookieBanner) {
    try {
      if (!localStorage.getItem(COOKIE_KEY)) {
        setTimeout(function () {
          cookieBanner.classList.add("show");
        }, 900);
      }
    } catch (err) {
      cookieBanner.classList.add("show");
    }
    cookieBanner.querySelectorAll("[data-consent]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        try {
          localStorage.setItem(COOKIE_KEY, btn.getAttribute("data-consent"));
        } catch (err) {}
        cookieBanner.classList.remove("show");
      });
    });
  }

  /* ---------- Contact form validation + submit feedback ---------- */
  var form = document.getElementById("contact-form");
  var statusBox = document.getElementById("form-status");
  var statusText = document.getElementById("form-status-text");

  function setFieldError(field, hasError) {
    var wrap = field.closest(".form-field");
    if (!wrap) return;
    wrap.classList.toggle("has-error", hasError);
  }

  function showStatus(type, message) {
    if (!statusBox || !statusText) return;
    statusBox.classList.remove("success", "error");
    statusBox.classList.add("show", type);
    statusText.textContent = message;
  }

  form &&
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var honeypot = form.querySelector("input[name='website']");
      if (honeypot && honeypot.value) return;

      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var message = form.querySelector("#message");
      var isValid = true;

      if (!name.value.trim()) {
        setFieldError(name, true);
        isValid = false;
      } else {
        setFieldError(name, false);
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setFieldError(email, true);
        isValid = false;
      } else {
        setFieldError(email, false);
      }

      if (!message.value.trim()) {
        setFieldError(message, true);
        isValid = false;
      } else {
        setFieldError(message, false);
      }

      if (!isValid) {
        showStatus("error", "Verifique os campos destacados e tente novamente.");
        var firstError = form.querySelector(".form-field.has-error input, .form-field.has-error textarea");
        firstError && firstError.focus();
        return;
      }

      var endpoint = form.getAttribute("data-formspree-endpoint");
      var successUrl = form.getAttribute("data-success-url") || "obrigado/";
      var submitBtn = document.getElementById("form-submit");

      if (!endpoint || endpoint.indexOf("SEU_ID_FORMSPREE") !== -1) {
        showStatus(
          "error",
          "Formulário ainda não conectado. Fale pelo WhatsApp ou e-mail enquanto isso — veja os contatos ao lado."
        );
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add("is-loading");
      }

      fetch(endpoint, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      })
        .then(function (response) {
          if (response.ok) {
            window.location.href = successUrl;
            return;
          }
          throw new Error("form-submit-failed");
        })
        .catch(function () {
          showStatus(
            "error",
            "Não foi possível enviar sua mensagem agora. Tente novamente ou fale direto pelo WhatsApp."
          );
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove("is-loading");
          }
        });
    });
})();
