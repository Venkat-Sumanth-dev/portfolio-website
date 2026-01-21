/* ============================================================
   STAGE 3.2 — PHASE MANAGER
   Controls identity transitions:
   DESIGNER → DEVELOPER → GAMER
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. PHASE CONFIGURATION
     ============================================================ */

  const PHASES = [
    {
      id: "phase-designer",
      name: "DESIGNER",
      key: "designer",
      accent: "designer",
      threshold: 0.55
    },
    {
      id: "phase-developer",
      name: "DEVELOPER",
      key: "developer",
      accent: "developer",
      threshold: 0.55
    },
    {
      id: "phase-gamer",
      name: "GAMER",
      key: "gamer",
      threshold: 0.55
    }
  ];

  let currentPhase = null;

  /* ============================================================
     2. DOM REFERENCES
     ============================================================ */

  const body = document.body;
  const phaseIndicator = document.querySelector(
    "[data-phase-indicator]"
  );

  const phaseSections = PHASES.map(phase =>
    document.getElementById(phase.id)
  );

  /* ============================================================
     3. UTILITIES
     ============================================================ */

  function isSamePhase(phaseKey) {
    return body.dataset.phase === phaseKey;
  }

  function setBodyPhase(phaseKey) {
    body.dataset.phase = phaseKey;
  }

  function updatePhaseIndicator(text) {
    if (!phaseIndicator) return;
    phaseIndicator.textContent = text;
  }

  function logPhaseChange(oldPhase, newPhase) {
    // Debug hook (disable in production if needed)
    // console.log(`[PHASE] ${oldPhase} → ${newPhase}`);
  }

  /* ============================================================
     4. PHASE ACTIVATION / DEACTIVATION
     ============================================================ */

  function activatePhase(phase) {
    if (!phase || isSamePhase(phase.key)) return;

    const previousPhase = body.dataset.phase || "none";

    // Update body dataset (CSS reacts)
    setBodyPhase(phase.key);

    // Update navbar indicator
    updatePhaseIndicator(phase.name);

    // Activate section class
    phaseSections.forEach(section => {
      section?.classList.remove("is-active");
    });

    const activeSection = document.getElementById(phase.id);
    if (activeSection) {
      activeSection.classList.add("is-active");
    }

    // Dispatch custom event for other engines
    dispatchPhaseEvent(previousPhase, phase.key);

    logPhaseChange(previousPhase, phase.key);

    currentPhase = phase.key;
  }

  function dispatchPhaseEvent(from, to) {
    const event = new CustomEvent("phasechange", {
      detail: {
        from,
        to
      }
    });
    document.dispatchEvent(event);
  }

  /* ============================================================
     5. INTERSECTION OBSERVER SETUP
     ============================================================ */

  function createObserver() {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: buildThresholdList()
    };

    const observer = new IntersectionObserver(
      onIntersection,
      observerOptions
    );

    phaseSections.forEach(section => {
      if (section) observer.observe(section);
    });

    return observer;
  }

  function buildThresholdList() {
    const thresholds = [];
    for (let i = 0; i <= 100; i += 5) {
      thresholds.push(i / 100);
    }
    return thresholds;
  }

  /* ============================================================
     6. INTERSECTION HANDLER
     ============================================================ */

  function onIntersection(entries) {
    let mostVisible = null;
    let highestRatio = 0;

    entries.forEach(entry => {
      if (entry.intersectionRatio > highestRatio) {
        highestRatio = entry.intersectionRatio;
        mostVisible = entry;
      }
    });

    if (!mostVisible) return;

    const phase = PHASES.find(
      p => p.id === mostVisible.target.id
    );

    if (!phase) return;

    if (mostVisible.intersectionRatio >= phase.threshold) {
      activatePhase(phase);
    }
  }

  /* ============================================================
     7. TRANSITION SECTIONS (TEXT FADE-IN)
     ============================================================ */

  function initTransitions() {
    const transitions = document.querySelectorAll(
      ".phase-transition"
    );

    const transitionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      {
        threshold: 0.3
      }
    );

    transitions.forEach(t => transitionObserver.observe(t));
  }

  /* ============================================================
     8. REVEAL SYSTEM (GENERIC)
     ============================================================ */

  function initRevealSystem() {
    const revealItems = document.querySelectorAll(
      "[data-animate], .experience-item, .project-card"
    );

    const revealObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    revealItems.forEach(el => revealObserver.observe(el));
  }

  /* ============================================================
     9. INITIALIZATION
     ============================================================ */

  function initPhaseManager() {
    // Default phase
    setBodyPhase("designer");
    updatePhaseIndicator("DESIGNER");

    createObserver();
    initTransitions();
    initRevealSystem();
  }

  /* ============================================================
     10. BOOTSTRAP
     ============================================================ */

  document.addEventListener(
    "DOMContentLoaded",
    initPhaseManager
  );

})();
