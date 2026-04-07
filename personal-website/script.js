(() => {
  "use strict";

  // ── Custom Cursor ──────────────────────────────────────────

  const cursor = {
    dot: document.querySelector(".cursor-dot"),
    ring: document.querySelector(".cursor-ring"),
    pos: { x: 0, y: 0 },
    target: { x: 0, y: 0 },
    visible: false,

    init() {
      if (window.matchMedia("(pointer: coarse)").matches) return;

      document.addEventListener("mousemove", (e) => {
        this.target.x = e.clientX;
        this.target.y = e.clientY;
        if (!this.visible) {
          this.pos.x = e.clientX;
          this.pos.y = e.clientY;
          this.visible = true;
        }
      });

      document.addEventListener("mousedown", () => document.body.classList.add("cursor-active"));
      document.addEventListener("mouseup", () => document.body.classList.remove("cursor-active"));

      const interactives = "a, button, .project-card, .skill-chip, .contact-link";
      document.querySelectorAll(interactives).forEach((el) => {
        el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
        el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
      });

      this.render();
    },

    render() {
      this.pos.x += (this.target.x - this.pos.x) * 0.15;
      this.pos.y += (this.target.y - this.pos.y) * 0.15;

      this.dot.style.transform = `translate(${this.target.x}px, ${this.target.y}px) translate(-50%, -50%)`;
      this.ring.style.transform = `translate(${this.pos.x}px, ${this.pos.y}px) translate(-50%, -50%)`;

      requestAnimationFrame(() => this.render());
    },
  };

  // ── Text Scramble Effect ───────────────────────────────────

  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = "!<>-_\\/[]{}—=+*^?#________";
      this.frameRequest = null;
    }

    setText(newText) {
      const oldText = this.el.textContent;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];

      for (let i = 0; i < length; i++) {
        const from = oldText[i] || "";
        const to = newText[i] || "";
        const start = Math.floor(Math.random() * 30);
        const end = start + Math.floor(Math.random() * 30);
        this.queue.push({ from, to, start, end });
      }

      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = "";
      let complete = 0;

      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];

        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += `<span style="color:var(--accent)">${char}</span>`;
        } else {
          output += from;
        }
      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(() => this.update());
        this.frame++;
      }
    }
  }

  // ── Counter Animation ─────────────────────────────────────

  function animateCounters() {
    document.querySelectorAll(".counter").forEach((counter) => {
      const target = parseFloat(counter.dataset.target);
      const isFloat = target % 1 !== 0;
      const duration = 1500;
      const start = performance.now();

      function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = eased * target;

        counter.textContent = isFloat ? current.toFixed(2) : Math.round(current);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    });
  }

  // ── Scroll Reveal ─────────────────────────────────────────

  function initScrollReveal() {
    const reveals = document.querySelectorAll(".reveal, .reveal-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  // ── Scroll Progress Bar ───────────────────────────────────

  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress-bar");
    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = `${progress}%`;
      },
      { passive: true }
    );
  }

  // ── Floating Nav ──────────────────────────────────────────

  function initFloatingNav() {
    const nav = document.querySelector(".floating-nav");
    const heroBottom = document.querySelector(".hero").offsetHeight;

    const navLinks = document.querySelectorAll(".nav-links a");
    const sections = Array.from(navLinks).map((link) => {
      const id = link.getAttribute("href").slice(1);
      return { id, el: document.getElementById(id), link };
    });

    window.addEventListener(
      "scroll",
      () => {
        nav.classList.toggle("visible", window.scrollY > heroBottom - 100);

        const scrollPos = window.scrollY + 200;
        let currentId = "";
        sections.forEach(({ el, id }) => {
          if (el && el.offsetTop <= scrollPos) currentId = id;
        });
        sections.forEach(({ id, link }) => {
          link.classList.toggle("active", id === currentId);
        });
      },
      { passive: true }
    );
  }

  // ── Theme Toggle ──────────────────────────────────────────

  function initThemeToggle() {
    const btn = document.querySelector(".theme-toggle");
    const html = document.documentElement;

    const saved = localStorage.getItem("theme");
    if (saved) html.dataset.theme = saved;

    btn.addEventListener("click", () => {
      const next = html.dataset.theme === "dark" ? "light" : "dark";
      html.dataset.theme = next;
      localStorage.setItem("theme", next);
      btn.style.transform = "rotate(360deg)";
      setTimeout(() => (btn.style.transform = ""), 500);
    });
  }

  // ── Magnetic Hover ────────────────────────────────────────

  function initMagnetic() {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    document.querySelectorAll(".magnetic").forEach((el) => {
      const strength = parseFloat(el.dataset.strength) || 20;

      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x / (100 / strength)}px, ${y / (100 / strength)}px)`;
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "";
        el.style.transition = "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)";
        setTimeout(() => (el.style.transition = ""), 500);
      });
    });
  }

  // ── Smooth Scroll ─────────────────────────────────────────

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // ── Staggered Reveal Delays ───────────────────────────────

  function initStagger() {
    document.querySelectorAll(".section-content").forEach((section) => {
      const items = section.querySelectorAll(".reveal-up");
      items.forEach((item, i) => {
        item.style.transitionDelay = `${i * 0.12}s`;
      });
    });
  }

  // ── Hero Scramble Sequence ────────────────────────────────

  async function initHeroScramble() {
    const els = document.querySelectorAll(".scramble");
    for (const el of els) {
      const fx = new TextScramble(el);
      await fx.setText(el.dataset.final);
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  // ── Parallax on Hero Stats ────────────────────────────────

  function initParallax() {
    const stats = document.querySelector(".hero-stats");
    if (!stats) return;

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          stats.style.transform = `translateY(${y * 0.08}px)`;
        }
      },
      { passive: true }
    );
  }

  // ── Interactive Globe ─────────────────────────────────────

  function initGlobe() {
    const canvas = document.getElementById("globe-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    const cities = [
      { name: "Seoul", lat: 37.57, lon: 126.98 },
      { name: "Hawaii", lat: 21.31, lon: -157.86 },
      { name: "California", lat: 34.05, lon: -118.24 },
      { name: "Wisconsin", lat: 43.07, lon: -89.4 },
      { name: "New York", lat: 40.71, lon: -74.01 },
      { name: "Winnipeg", lat: 49.9, lon: -97.14 },
    ];

    const TILT = 0.35;
    const RAD = Math.PI / 180;
    let rotation = Math.PI;
    let autoRotate = true;
    let isDragging = false;
    let dragStartX = 0;
    let dragRotation = 0;
    let w, h, R;
    let cachedColors = null;
    let lastTheme = null;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      R = Math.min(w, h) * 0.43;
    }

    function geo3D(lat, lon, r) {
      r = r || R;
      const p = lat * RAD,
        l = lon * RAD;
      return {
        x: r * Math.cos(p) * Math.cos(l),
        y: r * Math.sin(p),
        z: r * Math.cos(p) * Math.sin(l),
      };
    }

    function xform(p) {
      const cr = Math.cos(rotation),
        sr = Math.sin(rotation);
      const x = p.x * cr - p.z * sr;
      const z = p.x * sr + p.z * cr;
      const ct = Math.cos(TILT),
        st = Math.sin(TILT);
      return { x: -x, y: p.y * ct - z * st, z: p.y * st + z * ct };
    }

    function slerpGeo(lat1, lon1, lat2, lon2, t) {
      const p1 = lat1 * RAD,
        l1 = lon1 * RAD,
        p2 = lat2 * RAD,
        l2 = lon2 * RAD;
      const x1 = Math.cos(p1) * Math.cos(l1),
        y1 = Math.cos(p1) * Math.sin(l1),
        z1 = Math.sin(p1);
      const x2 = Math.cos(p2) * Math.cos(l2),
        y2 = Math.cos(p2) * Math.sin(l2),
        z2 = Math.sin(p2);
      const d = Math.acos(Math.max(-1, Math.min(1, x1 * x2 + y1 * y2 + z1 * z2)));
      if (d < 1e-6) return { lat: lat1, lon: lon1 };
      const sd = Math.sin(d),
        a = Math.sin((1 - t) * d) / sd,
        b = Math.sin(t * d) / sd;
      const x = a * x1 + b * x2,
        y = a * y1 + b * y2,
        z = a * z1 + b * z2;
      return {
        lat: Math.atan2(z, Math.sqrt(x * x + y * y)) / RAD,
        lon: Math.atan2(y, x) / RAD,
      };
    }

    function getColors() {
      const theme = document.documentElement.dataset.theme;
      if (theme !== lastTheme) {
        lastTheme = theme;
        const s = getComputedStyle(document.documentElement);
        cachedColors = {
          accent: s.getPropertyValue("--accent").trim(),
          fg: s.getPropertyValue("--fg").trim(),
        };
      }
      return cachedColors;
    }

    function drawGrid(cx, cy, c) {
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = c.fg + "0c";
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        let on = false;
        for (let lon = 0; lon <= 360; lon += 3) {
          const tp = xform(geo3D(lat, lon));
          if (tp.z > 0) {
            on ? ctx.lineTo(cx + tp.x, cy - tp.y) : ctx.moveTo(cx + tp.x, cy - tp.y);
            on = true;
          } else {
            on = false;
          }
        }
        ctx.stroke();
      }
      for (let lon = 0; lon < 360; lon += 30) {
        ctx.beginPath();
        let on = false;
        for (let lat = -90; lat <= 90; lat += 3) {
          const tp = xform(geo3D(lat, lon));
          if (tp.z > 0) {
            on ? ctx.lineTo(cx + tp.x, cy - tp.y) : ctx.moveTo(cx + tp.x, cy - tp.y);
            on = true;
          } else {
            on = false;
          }
        }
        ctx.stroke();
      }
    }

    function drawArcs(cx, cy, c) {
      const steps = 80;
      for (let i = 0; i < cities.length - 1; i++) {
        const a = cities[i],
          b = cities[i + 1];

        ctx.beginPath();
        ctx.setLineDash([3, 4]);
        let on = false;
        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const pt = slerpGeo(a.lat, a.lon, b.lat, b.lon, t);
          const alt = Math.sin(t * Math.PI) * 0.12;
          const tp = xform(geo3D(pt.lat, pt.lon, R * (1 + alt)));
          if (tp.z <= 0) {
            on ? ctx.lineTo(cx + tp.x, cy - tp.y) : ctx.moveTo(cx + tp.x, cy - tp.y);
            on = true;
          } else {
            on = false;
          }
        }
        ctx.strokeStyle = c.accent + "25";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.beginPath();
        on = false;
        for (let j = 0; j <= steps; j++) {
          const t = j / steps;
          const pt = slerpGeo(a.lat, a.lon, b.lat, b.lon, t);
          const alt = Math.sin(t * Math.PI) * 0.12;
          const tp = xform(geo3D(pt.lat, pt.lon, R * (1 + alt)));
          if (tp.z > 0) {
            on ? ctx.lineTo(cx + tp.x, cy - tp.y) : ctx.moveTo(cx + tp.x, cy - tp.y);
            on = true;
          } else {
            on = false;
          }
        }
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function drawCities(cx, cy, c) {
      cities.forEach((city) => {
        const p = geo3D(city.lat, city.lon);
        const tp = xform(p);
        const sx = cx + tp.x,
          sy = cy - tp.y;

        if (tp.z > 0) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, 10);
          g.addColorStop(0, c.accent + "50");
          g.addColorStop(1, c.accent + "00");
          ctx.beginPath();
          ctx.arc(sx, sy, 10, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = c.accent;
          ctx.fill();

          ctx.font = '600 9px "Helvetica Neue", Helvetica, Arial, sans-serif';
          ctx.textAlign = "left";
          ctx.fillStyle = c.fg;
          ctx.globalAlpha = Math.min(1, (tp.z / R) * 1.5);
          ctx.fillText(city.name, sx + 8, sy + 3);
          ctx.globalAlpha = 1;
        } else {
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = c.accent + "20";
          ctx.fill();
        }
      });
    }

    function draw() {
      const c = getColors();
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2,
        cy = h / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = c.fg + "06";
      ctx.fill();
      ctx.strokeStyle = c.fg + "18";
      ctx.lineWidth = 1;
      ctx.stroke();

      drawGrid(cx, cy, c);
      drawArcs(cx, cy, c);
      drawCities(cx, cy, c);
    }

    function loop() {
      if (autoRotate) rotation += 0.002;
      draw();
      requestAnimationFrame(loop);
    }

    canvas.addEventListener("mousedown", (e) => {
      isDragging = true;
      autoRotate = false;
      dragStartX = e.clientX;
      dragRotation = rotation;
    });
    window.addEventListener("mousemove", (e) => {
      if (isDragging) rotation = dragRotation + (e.clientX - dragStartX) * 0.005;
    });
    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        setTimeout(() => {
          autoRotate = true;
        }, 2000);
      }
    });

    canvas.addEventListener(
      "touchstart",
      (e) => {
        isDragging = true;
        autoRotate = false;
        dragStartX = e.touches[0].clientX;
        dragRotation = rotation;
      },
      { passive: true }
    );
    canvas.addEventListener(
      "touchmove",
      (e) => {
        if (isDragging) rotation = dragRotation + (e.touches[0].clientX - dragStartX) * 0.005;
      },
      { passive: true }
    );
    canvas.addEventListener("touchend", () => {
      isDragging = false;
      setTimeout(() => {
        autoRotate = true;
      }, 2000);
    });

    canvas.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    canvas.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));

    resize();
    window.addEventListener("resize", resize);
    loop();
  }

  // ── Init ──────────────────────────────────────────────────

  document.addEventListener("DOMContentLoaded", () => {
    cursor.init();
    initScrollProgress();
    initFloatingNav();
    initThemeToggle();
    initMagnetic();
    initSmoothScroll();
    initScrollReveal();
    initStagger();
    initParallax();
    animateCounters();
    initHeroScramble();
    initGlobe();
  });
})();
