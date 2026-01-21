/* ============================================================
   STAGE 3.3 — PARTICLE ENGINE (CANVAS TRIANGLES)
   Author: Bodapati Venkat Sumanth
   ============================================================ */

(() => {
  "use strict";

  /* ============================================================
     1. CANVAS SETUP
     ============================================================ */

  const canvas = document.getElementById("particle-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();

  /* ============================================================
     2. PHASE COLOR SYSTEM
     ============================================================ */

  const PHASE_COLORS = {
    designer: {
      stroke: "rgba(179, 92, 255, 0.55)",
      fill: "rgba(179, 92, 255, 0.08)"
    },
    developer: {
      stroke: "rgba(63, 169, 245, 0.55)",
      fill: "rgba(63, 169, 245, 0.08)"
    },
    gamer: {
      stroke: "rgba(255, 42, 42, 0.6)",
      fill: "rgba(255, 42, 42, 0.1)"
    }
  };

  let currentPhase = document.body.dataset.phase || "designer";

  function getCurrentColors() {
    return PHASE_COLORS[currentPhase];
  }

  /* ============================================================
     3. PARTICLE CONFIGURATION
     ============================================================ */

  const CONFIG = {
    density: 0.00012,        // particles per pixel
    minSize: 6,
    maxSize: 18,
    minSpeed: 0.15,
    maxSpeed: 0.6,
    rotationSpeed: 0.002,
    alphaFade: 0.0006,
    connectDistance: 140,
    maxParticles: 220
  };

  /* ============================================================
     4. PARTICLE CLASS
     ============================================================ */

  class TriangleParticle {
    constructor() {
      this.reset(true);
    }

    reset(randomY = false) {
      this.x = Math.random() * width;
      this.y = randomY ? Math.random() * height : height + Math.random() * 100;

      this.size =
        CONFIG.minSize +
        Math.random() * (CONFIG.maxSize - CONFIG.minSize);

      this.speed =
        CONFIG.minSpeed +
        Math.random() * (CONFIG.maxSpeed - CONFIG.minSpeed);

      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed =
        (Math.random() - 0.5) * CONFIG.rotationSpeed;

      this.opacity = Math.random();
      this.life = 1;
    }

    update() {
      this.y -= this.speed;
      this.rotation += this.rotationSpeed;
      this.opacity -= CONFIG.alphaFade;

      if (this.opacity <= 0 || this.y < -50) {
        this.reset();
      }
    }

    draw() {
      const { stroke, fill } = getCurrentColors();

      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      ctx.beginPath();
      ctx.moveTo(0, -this.size);
      ctx.lineTo(this.size * 0.866, this.size * 0.5);
      ctx.lineTo(-this.size * 0.866, this.size * 0.5);
      ctx.closePath();

      ctx.globalAlpha = this.opacity;

      ctx.fillStyle = fill;
      ctx.fill();

      ctx.strokeStyle = stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }

  /* ============================================================
     5. PARTICLE SYSTEM
     ============================================================ */

  let particles = [];

  function calculateParticleCount() {
    const count = Math.floor(width * height * CONFIG.density);
    return Math.min(count, CONFIG.maxParticles);
  }

  function initParticles() {
    particles.length = 0;
    const count = calculateParticleCount();

    for (let i = 0; i < count; i++) {
      particles.push(new TriangleParticle());
    }
  }

  initParticles();

  /* ============================================================
     6. CONNECTION LINES (SUBTLE)
     ============================================================ */

  function drawConnections() {
    const { stroke } = getCurrentColors();

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDistance) {
          ctx.strokeStyle = stroke;
          ctx.globalAlpha = 0.08 * (1 - dist / CONFIG.connectDistance);
          ctx.lineWidth = 0.5;

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  /* ============================================================
     7. RENDER LOOP (OPTIMIZED)
     ============================================================ */

  let lastTime = 0;
  let running = true;

  function animate(time) {
    if (!running) return;

    const delta = time - lastTime;
    lastTime = time;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update(delta);
      particles[i].draw();
    }

    drawConnections();

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  /* ============================================================
     8. PHASE CHANGE HANDLING
     ============================================================ */

  function onPhaseChange(e) {
    currentPhase = e.detail.to;
  }

  document.addEventListener("phasechange", onPhaseChange);

  /* ============================================================
     9. VISIBILITY & PERFORMANCE CONTROL
     ============================================================ */

  function onVisibilityChange() {
    running = !document.hidden;
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(animate);
    }
  }

  document.addEventListener("visibilitychange", onVisibilityChange);

  /* ============================================================
     10. RESIZE HANDLING (THROTTLED)
     ============================================================ */

  let resizeTimeout = null;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      resizeCanvas();
      initParticles();
    }, 200);
  });

  /* ============================================================
     11. DEBUG / EXTENSION HOOKS
     ============================================================ */

  window.__ParticleEngine = {
    get count() {
      return particles.length;
    },
    pause() {
      running = false;
    },
    resume() {
      if (!running) {
        running = true;
        requestAnimationFrame(animate);
      }
    }
  };

})();
