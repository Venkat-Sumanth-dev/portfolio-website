/* ============================================================
   STAGE 3.1 — CORE ENGINE & STATE MANAGER
   Author: Bodapati Venkat Sumanth
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. GLOBAL STATE
     ============================================================ */

  const AppState = {
    scrollY: 0,
    lastScrollY: 0,
    scrollingDown: false,
    ticking: false,

    cursor: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    },

    phase: "designer"
  };

  /* ============================================================
     2. DOM REFERENCES
     ============================================================ */

  const body = document.body;

  const cursorDot = document.getElementById("cursor-dot");
  const cursorRing = document.getElementById("cursor-ring");

  const navbar = document.getElementById("main-navbar");
  const resumeSystem = document.getElementById("resume-system");

  const interactiveElements = document.querySelectorAll(
    "a, button, .phase-action-link, .project-card"
  );

  /* ============================================================
     3. CURSOR ENGINE
     ============================================================ */

  function initCursor() {
    if (!cursorDot || !cursorRing) return;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);

    interactiveElements.forEach(el => {
      el.addEventListener("mouseenter", () => {
        body.classList.add("cursor-hover");
      });

      el.addEventListener("mouseleave", () => {
        body.classList.remove("cursor-hover");
      });
    });

    requestAnimationFrame(updateCursor);
  }

  function onMouseMove(e) {
    AppState.cursor.targetX = e.clientX;
    AppState.cursor.targetY = e.clientY;
  }

  function onMouseDown() {
    body.classList.add("cursor-click");
  }

  function onMouseUp() {
    body.classList.remove("cursor-click");
  }

  function updateCursor() {
    AppState.cursor.x +=
      (AppState.cursor.targetX - AppState.cursor.x) * 0.18;
    AppState.cursor.y +=
      (AppState.cursor.targetY - AppState.cursor.y) * 0.18;

    const x = AppState.cursor.x;
    const y = AppState.cursor.y;

    cursorDot.style.transform = `translate(${x}px, ${y}px)`;
    cursorRing.style.transform = `translate(${x}px, ${y}px)`;

    requestAnimationFrame(updateCursor);
  }

  /* ============================================================
     4. SCROLL ENGINE (THROTTLED)
     ============================================================ */

  function onScroll() {
    AppState.scrollY = window.scrollY;
    AppState.scrollingDown = AppState.scrollY > AppState.lastScrollY;

    if (!AppState.ticking) {
      window.requestAnimationFrame(updateScrollState);
      AppState.ticking = true;
    }

    AppState.lastScrollY = AppState.scrollY;
  }

  function updateScrollState() {
    toggleNavbar();
    toggleScrolledClass();
    AppState.ticking = false;
  }

  function toggleScrolledClass() {
    if (AppState.scrollY > 40) {
      body.classList.add("scrolled");
    } else {
      body.classList.remove("scrolled");
    }
  }

  function toggleNavbar() {
    if (AppState.scrollY < 120) {
      body.classList.remove("nav-hidden");
      body.classList.add("nav-visible");
      return;
    }

    if (AppState.scrollingDown) {
      body.classList.add("nav-hidden");
      body.classList.remove("nav-visible");
    } else {
      body.classList.remove("nav-hidden");
      body.classList.add("nav-visible");
    }
  }

  /* ============================================================
     5. RESUME VISIBILITY LOGIC
     ============================================================ */

  function updateResumeVisibility() {
    if (!resumeSystem) return;

    if (AppState.scrollY > 200) {
      resumeSystem.style.opacity = "1";
      resumeSystem.style.pointerEvents = "auto";
    } else {
      resumeSystem.style.opacity = "0";
      resumeSystem.style.pointerEvents = "none";
    }
  }

  /* ============================================================
     6. PERFORMANCE SAFE EVENT BINDINGS
     ============================================================ */

  function bindEvents() {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
  }

  function onResize() {
    // Placeholder for particle resize, layout recalculation
  }

  /* ============================================================
     7. INITIALIZATION
     ============================================================ */

  function init() {
    initCursor();
    bindEvents();
    updateResumeVisibility();
  }

  /* ============================================================
     8. START APPLICATION
     ============================================================ */

  document.addEventListener("DOMContentLoaded", init);

})();
