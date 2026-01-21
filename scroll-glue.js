/* ============================================================
   STAGE 3.4 — FINAL SCROLL & GLUE ENGINE
   Author: Bodapati Venkat Sumanth
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. GLOBAL REFERENCES & STATE
     ============================================================ */

  const body = document.body;

  let observers = [];
  let rafId = null;

  const ScrollState = {
    lastY: 0,
    ticking: false
  };

  /* ============================================================
     2. SCROLL UTILITY FUNCTIONS
     ============================================================ */

  function getScrollY() {
    return window.pageYOffset || document.documentElement.scrollTop;
  }

  function isScrollingDown(currentY) {
    return currentY > ScrollState.lastY;
  }

  /* ============================================================
     3. DATA-ANIMATE REVEAL SYSTEM
     ============================================================ */

  function initDataAnimateReveal() {
    const animatedElements = document.querySelectorAll("[data-animate]");

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px"
      }
    );

    animatedElements.forEach(el => observer.observe(el));
    observers.push(observer);
  }

  /* ============================================================
     4. EXPERIENCE & PROJECT CARD REVEAL
     ============================================================ */

  function initCardReveal() {
    const cards = document.querySelectorAll(
      ".experience-item, .project-card"
    );

    if (!cards.length) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.25
      }
    );

    cards.forEach(card => observer.observe(card));
    observers.push(observer);
  }

  /* ============================================================
     5. NAVBAR + RESUME SCROLL SYNC
     ============================================================ */

  function onScroll() {
    const currentY = getScrollY();

    if (!ScrollState.ticking) {
      window.requestAnimationFrame(() => {
        updateScrollEffects(currentY);
        ScrollState.ticking = false;
      });
      ScrollState.ticking = true;
    }

    ScrollState.lastY = currentY;
  }

  function updateScrollEffects(scrollY) {
    // Navbar state
    if (scrollY > 60) {
      body.classList.add("scrolled");
    } else {
      body.classList.remove("scrolled");
    }

    // Resume visibility (backup safety)
    const resume = document.getElementById("resume-system");
    if (resume) {
      if (scrollY > 200) {
        resume.style.opacity = "1";
        resume.style.pointerEvents = "auto";
      } else {
        resume.style.opacity = "0";
        resume.style.pointerEvents = "none";
      }
    }
  }

  /* ============================================================
     6. SMOOTH SECTION LINK SCROLL
     ============================================================ */

  function initSmoothAnchorScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener("click", e => {
        const targetId = link.getAttribute("href");
        if (!targetId || targetId === "#") return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      });
    });
  }

  /* ============================================================
     7. PHASE CHANGE HOOKS (FINAL GLUE)
     ============================================================ */

  function initPhaseHooks() {
    document.addEventListener("phasechange", e => {
      // Placeholder for future:
      // - Sound triggers
      // - Advanced parallax
      // - Analytics
      // - Theme persistence
    });
  }

  /* ============================================================
     8. PERFORMANCE GUARDS
     ============================================================ */

  function pauseAllObservers() {
    observers.forEach(obs => obs.disconnect());
    observers.length = 0;
  }

  function resumeAllObservers() {
    initDataAnimateReveal();
    initCardReveal();
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      pauseAllObservers();
      cancelAnimationFrame(rafId);
    } else {
      resumeAllObservers();
    }
  }

  /* ============================================================
     9. CLEANUP ON PAGE UNLOAD
     ============================================================ */

  function cleanup() {
    pauseAllObservers();
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  }

  /* ============================================================
     10. INITIALIZATION
     ============================================================ */

  function init() {
    initDataAnimateReveal();
    initCardReveal();
    initSmoothAnchorScroll();
    initPhaseHooks();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", cleanup);
  }

  /* ============================================================
     11. BOOTSTRAP
     ============================================================ */

  document.addEventListener("DOMContentLoaded", init);

})();
