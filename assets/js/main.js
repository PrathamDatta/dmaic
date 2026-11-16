/* =========================================================
   dMaic Innovations: interactions & animation
   GSAP + ScrollTrigger + Flip, Lenis, SplitType, Three.js, VanillaTilt
   ========================================================= */
(() => {
  "use strict";
  gsap.registerPlugin(ScrollTrigger, Flip);

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const PRODUCTS = window.DMAIC_PRODUCTS || [];

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const scrollTo = (target) => {
    const el = typeof target === "string" ? $(target) : target;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.6 });
    else el.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  // anchor links
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener("click", e => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      e.preventDefault();
      closeMobile();
      scrollTo(id);
      if (a.dataset.open) setTimeout(() => openDrawer(a.dataset.open), lenis ? 900 : 300);
    });
  });

  /* ---------------- Preloader ---------------- */
  const pre = $("#preloader");
  document.body.classList.add("loading");
  if (lenis) lenis.stop();
  const plGr = $("#plGrains");
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.style.left = Math.random() * 100 + "%";
    plGr.appendChild(s);
    gsap.to(s, { y: innerHeight + 40, rotation: gsap.utils.random(-360, 360), duration: gsap.utils.random(1.2, 2.6), delay: gsap.utils.random(0, 1.6), repeat: -1, ease: "power1.in" });
  }
  const counter = { v: 0 };
  const plTl = gsap.timeline({ paused: true });
  plTl.to(counter, {
      v: 100, duration: reduce ? .2 : 2, ease: "power2.inOut",
      onUpdate: () => { $("#plNum").textContent = Math.round(counter.v); $("#plBar").style.width = counter.v + "%"; }
    })
    .to(".pl-inner", { opacity: 0, y: -30, duration: .5, ease: "power2.in" })
    .to(".pl-shutter", { scaleY: 1, duration: .6, ease: "expo.inOut" }, "<.1")
    .set(".pl-inner, .pl-grains", { display: "none" })
    .set(pre, { background: "transparent" })
    .to(".pl-shutter--a", { yPercent: -100, duration: .9, ease: "expo.inOut" })
    .to(".pl-shutter--b", { yPercent: 100, duration: .9, ease: "expo.inOut" }, "<")
    .add(() => heroIntro(), "<.2")
    .add(() => { pre.remove(); document.body.classList.remove("loading"); if (lenis) lenis.start(); ScrollTrigger.refresh(); });
  const startPre = () => plTl.play();
  if (document.readyState === "complete") startPre(); else addEventListener("load", startPre);
  setTimeout(startPre, 5000); // safety

  /* ---------------- Cursor ---------------- */
  if (fine && !reduce) {
    const c = $("#cursor"), d = $("#cursorDot"), label = $("#cursorLabel");
    const cx = gsap.quickTo(c, "x", { duration: .45, ease: "power3" }), cy = gsap.quickTo(c, "y", { duration: .45, ease: "power3" });
    const dx = gsap.quickTo(d, "x", { duration: .08 }), dy = gsap.quickTo(d, "y", { duration: .08 });
    addEventListener("mousemove", e => { cx(e.clientX); cy(e.clientY); dx(e.clientX); dy(e.clientY); });
    document.addEventListener("mouseover", e => {
      const t = e.target.closest("[data-cursor]");
      if (t) { label.textContent = t.dataset.cursor; c.classList.add("big"); }
    });
    document.addEventListener("mouseout", e => {
      const t = e.target.closest("[data-cursor]");
      if (t && !t.contains(e.relatedTarget)) c.classList.remove("big");
    });
  } else { $("#cursor")?.remove(); $("#cursorDot")?.remove(); }

  /* ---------------- Magnetic ---------------- */
  const magnetize = el => {
    if (!fine || reduce) return;
    const xT = gsap.quickTo(el, "x", { duration: .6, ease: "elastic.out(1,.4)" });
    const yT = gsap.quickTo(el, "y", { duration: .6, ease: "elastic.out(1,.4)" });
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      xT((e.clientX - r.left - r.width / 2) * .3); yT((e.clientY - r.top - r.height / 2) * .4);
    });
    el.addEventListener("mouseleave", () => { xT(0); yT(0); });
  };
  $$(".magnetic").forEach(magnetize);

  /* ---------------- Nav ---------------- */
  const nav = $("#nav");
  let lastY = 0;
  const onScroll = y => {
    nav.classList.toggle("solid", y > innerHeight * .6);
    nav.classList.toggle("hide", y > lastY && y > 300 && !document.body.classList.contains("menu-open"));
    lastY = y;
  };
  if (lenis) lenis.on("scroll", e => onScroll(e.scroll)); else addEventListener("scroll", () => onScroll(scrollY), { passive: true });

  const burger = $("#burger"), mm = $("#mobileMenu");
  function closeMobile() { burger.classList.remove("open"); mm.classList.remove("open"); document.body.classList.remove("menu-open"); burger.setAttribute("aria-expanded", "false"); }
  burger.addEventListener("click", () => {
    const open = !mm.classList.contains("open");
    burger.classList.toggle("open", open); mm.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open); burger.setAttribute("aria-expanded", open);
    if (open) gsap.from("#mobileMenu a", { yPercent: 100, opacity: 0, stagger: .06, duration: .7, ease: "expo.out", delay: .2 });
  });

  // progress bar
  gsap.to("#scrollProgress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: .3 } });

  /* ---------------- Hero ---------------- */
  const heroSplit = new SplitType(".hero-title .split", { types: "words,chars" });
  gsap.set(heroSplit.chars, { yPercent: 115, rotate: 8 });
  gsap.set([".eyebrow", ".hero-sub", ".hero-actions", ".hero-hud", ".scroll-cue"], { opacity: 0, y: 30 });

  function heroIntro() {
    const tl = gsap.timeline();
    tl.to(heroSplit.chars, { yPercent: 0, rotate: 0, duration: 1.2, stagger: .028, ease: "expo.out" })
      .to(".hero-img.active", { scale: 1.02, duration: 2.4, ease: "expo.out" }, 0)
      .to([".eyebrow", ".hero-sub", ".hero-actions", ".hero-hud", ".scroll-cue"], { opacity: 1, y: 0, stagger: .1, duration: 1, ease: "expo.out" }, .4);
    startSlides();
  }

  // hero slideshow with Ken Burns
  const slides = $$(".hero-img");
  let si = 0;
  function startSlides() {
    if (reduce) return;
    const meter = $("#heroMeter");
    const cycle = () => {
      gsap.fromTo(meter, { width: "0%" }, { width: "100%", duration: 6, ease: "none", onComplete: next });
    };
    const next = () => {
      const cur = slides[si]; si = (si + 1) % slides.length; const nx = slides[si];
      $("#heroSlideNo").textContent = `0${si + 1} / 0${slides.length}`;
      gsap.set(nx, { opacity: 0, scale: 1.18, zIndex: 1 }); gsap.set(cur, { zIndex: 0 });
      gsap.to(nx, { opacity: 1, scale: 1.02, duration: 2.2, ease: "power2.out" });
      gsap.to(cur, { opacity: 0, duration: 2.2, delay: .4 });
      cycle();
    };
    cycle();
  }

  // hero parallax out
  gsap.to(".hero-content", { yPercent: 30, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
  gsap.to(".hero-bg", { yPercent: 18, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });

  // keep one continuous gradient across split characters
  function gradChars() {
    $$(".grad").forEach(g => {
      const chars = $$(".char", g); if (!chars.length) return;
      const gr = g.getBoundingClientRect();
      chars.forEach(c => {
        c.style.backgroundImage = "var(--grad)"; c.style.webkitBackgroundClip = "text"; c.style.backgroundClip = "text"; c.style.color = "transparent";
        c.style.backgroundSize = gr.width + "px 100%"; c.style.backgroundPosition = -(c.getBoundingClientRect().left - gr.left) + "px 0";
      });
    });
  }
  if (document.fonts) document.fonts.ready.then(gradChars);
  addEventListener("resize", gradChars);

  /* ---------------- Three.js grain field ---------------- */
  (function grainField() {
    const canvas = $("#grainCanvas");
    if (!window.THREE || !canvas) return;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false }); } catch (e) { return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, .1, 100);
    camera.position.z = 14;

    const N = innerWidth < 700 ? 1400 : 3200;
    const pos = new Float32Array(N * 3), seed = new Float32Array(N * 4), col = new Float32Array(N * 3);
    const palette = [[.95, .70, .24], [1, .85, .48], [.96, .94, .89], [.10, .70, .94], [.85, .62, .25]];
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - .5) * 34;
      pos[i * 3 + 1] = (Math.random() - .5) * 22;
      pos[i * 3 + 2] = (Math.random() - .5) * 14;
      seed[i * 4] = Math.random(); seed[i * 4 + 1] = Math.random() * 6.28; seed[i * 4 + 2] = .4 + Math.random(); seed[i * 4 + 3] = Math.random();
      const r = Math.random();
      const p = palette[r < .12 ? 3 : r < .45 ? 0 : r < .7 ? 1 : r < .85 ? 4 : 2];
      col.set(p, i * 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
    geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));

    const uniforms = { uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(99, 99) }, uScroll: { value: 0 }, uPR: { value: renderer.getPixelRatio() } };
    const mat = new THREE.ShaderMaterial({
      uniforms, transparent: true, depthWrite: false,
      vertexShader: `
        attribute vec4 aSeed; attribute vec3 aColor;
        uniform float uTime, uScroll, uPR; uniform vec2 uMouse;
        varying vec3 vColor; varying float vRot; varying float vAlpha;
        void main(){
          vec3 p = position;
          float sp = aSeed.z;
          // stream: flow diagonally like grain pouring through the line
          p.x = mod(p.x + uTime * 1.2 * sp + 17.0, 34.0) - 17.0;
          p.y += sin(uTime * .6 * sp + aSeed.y + p.x * .25) * 1.2 - uScroll * 6.0 * (aSeed.w + .3);
          p.z += cos(uTime * .4 + aSeed.y) * .6;
          // mouse repulsion (in view-plane units)
          vec2 d = p.xy - uMouse;
          float dist = length(d);
          p.xy += normalize(d + 1e-4) * smoothstep(3.5, 0.0, dist) * 2.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (10.0 + aSeed.x * 16.0) * uPR * (8.0 / -mv.z);
          vColor = aColor;
          vRot = aSeed.y + uTime * (aSeed.x - .5) * 2.0;
          vAlpha = smoothstep(-8.0, 4.0, p.z) * .9;
        }`,
      fragmentShader: `
        varying vec3 vColor; varying float vRot; varying float vAlpha;
        void main(){
          vec2 uv = gl_PointCoord - .5;
          float c = cos(vRot), s = sin(vRot);
          uv = mat2(c, -s, s, c) * uv;
          uv.x *= 2.1;               // grain-shaped ellipse
          float d = length(uv);
          float a = smoothstep(.5, .38, d);
          if (a < .01) discard;
          float crease = smoothstep(.04, .0, abs(uv.y)) * .25; // seed crease
          float shade = .75 + .35 * (.5 - uv.y);
          gl_FragColor = vec4(vColor * shade - crease, a * vAlpha);
        }`
    });
    scene.add(new THREE.Points(geo, mat));

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize(); addEventListener("resize", resize);

    const target = new THREE.Vector2(99, 99);
    addEventListener("mousemove", e => {
      const r = canvas.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      target.set(nx * hh * camera.aspect, ny * hh);
    });

    let visible = true;
    ScrollTrigger.create({ trigger: ".hero", start: "top bottom", end: "bottom top", onToggle: s => visible = s.isActive,
      onUpdate: s => uniforms.uScroll.value = s.progress });
    const clock = new THREE.Clock();
    gsap.ticker.add(() => {
      if (!visible) return;
      uniforms.uTime.value = reduce ? 0 : clock.getElapsedTime();
      uniforms.uMouse.value.lerp(target, .08);
      camera.position.x += (target.x * .03 - camera.position.x) * .05;
      camera.position.y += (target.y * .03 - camera.position.y) * .05;
      renderer.render(scene, camera);
    });
  })();

  /* ---------------- Stats ---------------- */
  $$(".stat").forEach((st, i) => {
    const num = $(".stat-num", st), ring = $(".prog", st);
    const to = +num.dataset.count, from = +(num.dataset.start || 0), suf = num.dataset.suffix || "";
    const o = { v: from };
    num.textContent = from + suf;
    const tl = gsap.timeline({ scrollTrigger: { trigger: st, start: "top 85%", once: true } });
    tl.from(st, { y: 60, opacity: 0, duration: 1, ease: "expo.out", delay: i * .08 })
      .to(o, { v: to, duration: 2, ease: "power3.out", onUpdate: () => num.textContent = Math.round(o.v) + suf }, "<.2")
      .to(ring, { strokeDashoffset: 327 * (1 - +ring.dataset.p), duration: 2, ease: "power3.out" }, "<");
  });

  /* ---------------- Line-reveal titles ---------------- */
  $$(".reveal-title").forEach(h => {
    h.innerHTML = h.innerHTML.split(/<br\s*\/?>/i).map(l => `<span class="line-wrap"><span class="line-in" style="display:inline-block">${l}</span></span>`).join("");
    gsap.from($$(".line-in", h), { yPercent: 110, rotate: 3, duration: 1.2, stagger: .12, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
  });
  $$(".section-head.light h2").forEach(h => gsap.from(h, { y: 60, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } }));
  $$(".kicker").forEach(k => gsap.from(k, { x: -30, opacity: 0, duration: 1, ease: "expo.out", scrollTrigger: { trigger: k, start: "top 90%" } }));
  $$(".fade-up").forEach(el => gsap.from(el, { y: 40, opacity: 0, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

  // scrubbed word highlight
  $$(".scrub-words").forEach(p => {
    const s = new SplitType(p, { types: "words", wordClass: "w" });
    gsap.to(s.words, { opacity: 1, stagger: .1, ease: "none", scrollTrigger: { trigger: p, start: "top 80%", end: "bottom 45%", scrub: true } });
  });

  // clip reveals with inner parallax
  $$(".clip-reveal").forEach(w => {
    const img = $("img", w);
    gsap.to(w, { clipPath: "inset(0% 0 0 0 round 22px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: w, start: "top 85%" } });
    gsap.to(img, { scale: 1, ease: "none", scrollTrigger: { trigger: w, start: "top bottom", end: "bottom top", scrub: true } });
  });
  gsap.from(".about-badge", { scale: 0, rotate: -180, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: ".about-badge", start: "top 90%" } });

  // pillars
  gsap.from(".pillar", { y: 80, opacity: 0, stagger: .12, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".pillars", start: "top 85%" } });
  const tiltOpts = { max: 8, speed: 800, perspective: 1000, scale: 1.02, glare: false };
  if (fine && !reduce && window.VanillaTilt) VanillaTilt.init($$(".tilt"), tiltOpts);
  $$(".pillar").forEach(p => p.addEventListener("mousemove", e => {
    const r = p.getBoundingClientRect();
    p.style.setProperty("--mx", (e.clientX - r.left) + "px"); p.style.setProperty("--my", (e.clientY - r.top) + "px");
  }));

  /* ---------------- Grain Journey ---------------- */
  (function journey() {
    const fill = $("#pipeFill"), base = $("#pipeBase");
    if (!fill) return;
    const L = fill.getTotalLength();
    fill.style.strokeDasharray = L; fill.style.strokeDashoffset = L;
    const stations = $$(".station");
    // station coordinates in SVG units (match CSS --x/--y percentages)
    const pts = stations.map(s => ({ x: parseFloat(s.style.getPropertyValue("--x")) / 100 * 1400, y: parseFloat(s.style.getPropertyValue("--y")) / 100 * 420 }));
    const fracs = pts.map(p => {
      let best = 0, bd = 1e9;
      for (let l = 0; l <= L; l += 4) { const q = fill.getPointAtLength(l); const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (d < bd) { bd = d; best = l; } }
      return best / L;
    });
    const labels = ["Raw", "Lifted", "Pre-cleaned", "Graded", "Destoned", "Separated", "Clean seed"];
    const state = { p: 0 };
    const apply = () => {
      fill.style.strokeDashoffset = L * (1 - state.p);
      let last = -1;
      stations.forEach((s, i) => { const on = state.p >= fracs[i] - .005; s.classList.toggle("on", on); if (on) last = i; });
      stations.forEach((s, i) => s.classList.toggle("current", i === last));
      $("#purityBar").style.width = (state.p * 100) + "%";
      $("#purityLabel").textContent = labels[Math.max(0, last)];
    };

    // flowing grains inside the filled pipe
    const g = $("#pipeGrains"), NS = "http://www.w3.org/2000/svg", grains = [];
    for (let i = 0; i < 46; i++) {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("r", 3 + Math.random() * 3);
      c.style.fill = i % 5 === 0 ? "#19b4f0" : i % 7 === 0 ? "#7cf2c4" : "#f2b33d";
      g.appendChild(c); grains.push({ el: c, o: Math.random(), sp: .05 + Math.random() * .06, j: (Math.random() - .5) * 10 });
    }
    let tt = 0;
    gsap.ticker.add((time, dt) => {
      tt += dt / 1000;
      grains.forEach(gr => {
        const f = ((gr.o + tt * gr.sp) % 1) * state.p;
        const q = fill.getPointAtLength(f * L);
        gr.el.setAttribute("cx", q.x); gr.el.setAttribute("cy", q.y + gr.j * Math.sin(tt * 3 + gr.o * 10));
        gr.el.style.opacity = state.p > .01 ? 1 : 0;
      });
    });

    const mm = gsap.matchMedia();
    mm.add("(min-width: 861px)", () => {
      gsap.to(state, { p: 1, ease: "none", onUpdate: apply, scrollTrigger: { trigger: ".journey", start: "top top", end: "+=2200", scrub: .6, pin: ".journey-pin", anticipatePin: 1 } });
      return () => { state.p = 0; apply(); };
    });
    mm.add("(max-width: 860px)", () => {
      stations.forEach((s, i) => ScrollTrigger.create({ trigger: s, start: "top 80%", onEnter: () => { s.classList.add("on"); state.p = Math.max(state.p, fracs[i]); $("#purityBar").style.width = (state.p * 100) + "%"; $("#purityLabel").textContent = labels[i]; } }));
    });
  })();

  /* ---------------- Products ---------------- */
  const grid = $("#productGrid");
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="p-card" data-cat="${p.cat}" data-id="${p.id}" data-cursor="View" tabindex="0" role="button" aria-label="View ${p.name.replace(/"/g, "&quot;")}">
      <div class="p-media"><span class="p-code">${p.code}</span><span class="p-fam mono">${p.family}</span><img src="${p.img}" alt="${p.name.replace(/"/g, "&quot;")}" loading="lazy"></div>
      <div class="p-body">
        <h3>${p.name}</h3>
        <p>${p.short}</p>
        <div class="p-tags">${p.tags.map(t => `<span>${t}</span>`).join("")}</div>
        <div class="p-more"><span>View specifications</span><i></i></div>
      </div>
    </article>`).join("");
  const cards = $$(".p-card", grid);
  gsap.from(cards, { y: 100, opacity: 0, rotateX: -20, stagger: .07, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: grid, start: "top 85%" } });
  if (fine && !reduce && window.VanillaTilt) VanillaTilt.init(cards, { max: 6, speed: 900, perspective: 1200, glare: true, "max-glare": .15 });
  cards.forEach(c => {
    c.addEventListener("click", () => openDrawer(c.dataset.id));
    c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openDrawer(c.dataset.id); } });
  });

  // filters with Flip
  $$(".chip").forEach(ch => ch.addEventListener("click", () => {
    $$(".chip").forEach(c => c.classList.toggle("active", c === ch));
    const f = ch.dataset.filter;
    const state = Flip.getState(cards);
    cards.forEach(c => c.classList.toggle("hidden", f !== "all" && c.dataset.cat !== f));
    Flip.from(state, {
      duration: .8, ease: "expo.inOut", absolute: true, scale: true,
      onEnter: el => gsap.fromTo(el, { opacity: 0, scale: .8 }, { opacity: 1, scale: 1, duration: .6 }),
      onLeave: el => gsap.to(el, { opacity: 0, scale: .8, duration: .4 }),
      onComplete: () => ScrollTrigger.refresh()
    });
  }));

  /* ---------------- Drawer ---------------- */
  const drawer = $("#drawer"), dc = $("#drawerContent");
  const specList = arr => `<ul class="d-specs">${arr.map(s => `<li>${s}</li>`).join("")}</ul>`;
  function openDrawer(id) {
    const p = PRODUCTS.find(x => x.id === id);
    if (!p) return;
    let html = `<div class="d-hero">${p.img2 ? `<div class="d-imgs"><img src="${p.img}" alt=""><img src="${p.img2}" alt=""></div>` : `<img src="${p.img}" alt="">`}</div>
      <p class="d-fam mono">${p.family} &middot; Model ${p.code}</p>
      <h3 class="d-title" id="drawerTitle">${p.name}</h3>
      <p class="d-desc">${p.desc}</p>`;
    if (p.controls) html += `<h4 class="d-h">The following controls are provided</h4><div class="d-controls">${p.controls.map((c, i) => `<div><b>${i + 1}</b><span>${c}</span></div>`).join("")}</div>`;
    if (p.specs) html += `<h4 class="d-h">${p.controls ? "Highlights" : "Standard Construction"}</h4>${specList(p.specs)}`;
    if (p.subs) html += p.subs.map(s => `<div class="d-sub"><div class="d-sub-head"><img src="${s.img}" alt=""><div><h4>${s.name}</h4>${s.text ? `<p>${s.text}</p>` : ""}</div></div><h4 class="d-h">Standard Construction</h4>${specList(s.specs)}</div>`).join("");
    html += `<p class="disclaimer mono">Disclaimer: dMaic Innovations reserves the rights to change the specifications of the equipment time to time depending on the market requirements and trend.</p>
      <a href="mailto:sales@dmaicinnovations.com?subject=${encodeURIComponent("Enquiry: " + p.name)}" class="btn btn-primary d-cta"><span>Enquire about this machine</span><i class="arrow"></i></a>`;
    dc.innerHTML = html;
    $(".drawer-panel").scrollTop = 0;
    drawer.classList.add("open"); drawer.setAttribute("aria-hidden", "false");
    if (lenis) lenis.stop();
    gsap.from($$(".d-fam, .d-title, .d-desc, .d-h, .d-controls div, .d-specs li, .d-sub", dc), { y: 30, opacity: 0, stagger: .035, duration: .8, ease: "expo.out", delay: .35 });
    gsap.from(".d-hero img", { scale: .85, opacity: 0, duration: 1.2, ease: "expo.out", delay: .25 });
    $(".drawer-close").focus({ preventScroll: true });
  }
  function closeDrawer() {
    drawer.classList.remove("open"); drawer.setAttribute("aria-hidden", "true");
    if (lenis) lenis.start();
  }
  $$("[data-close]", drawer).forEach(b => b.addEventListener("click", closeDrawer));
  addEventListener("keydown", e => { if (e.key === "Escape") { closeDrawer(); closeMobile(); } });

  /* ---------------- Bento ---------------- */
  gsap.from(".bento-card", { y: 80, opacity: 0, stagger: .08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: ".bento", start: "top 85%" } });
  ScrollTrigger.create({ trigger: ".b-fan", start: "top 80%", onEnter: () => $(".b-fan").classList.add("in") });

  // gravity deck: heavy grains climb to one side, light grains drift to the other
  (function deck() {
    const box = $("#deckGrains");
    if (!box || reduce) return;
    for (let i = 0; i < 34; i++) {
      const heavy = i % 2 === 0, el = document.createElement("i");
      el.className = heavy ? "h" : "l"; box.appendChild(el);
      const tl = gsap.timeline({ repeat: -1, delay: i * .18 });
      tl.set(el, { left: "4%", top: gsap.utils.random(35, 65) + "%", opacity: 0 })
        .to(el, { opacity: 1, duration: .2 })
        .to(el, { left: "30%", top: (heavy ? gsap.utils.random(8, 30) : gsap.utils.random(70, 90)) + "%", duration: 1.6, ease: "sine.inOut" })
        .to(el, { left: "94%", top: (heavy ? gsap.utils.random(6, 26) : gsap.utils.random(72, 92)) + "%", duration: 2.4, ease: "none" })
        .to(el, { opacity: 0, duration: .3 });
    }
  })();

  /* ---------------- Crops ---------------- */
  gsap.from(".orbit-wrap", { scale: .6, opacity: 0, rotate: -40, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".crops", start: "top 75%" } });

  /* ---------------- Turnkey horizontal ---------------- */
  const hTrack = $("#hTrack"), hCards = $$(".h-card");
  const mmT = gsap.matchMedia();
  mmT.add("(min-width: 901px)", () => {
    const dist = () => hTrack.scrollWidth - innerWidth;
    const tween = gsap.to(hTrack, { x: () => -dist(), ease: "none", scrollTrigger: { trigger: "#hScroll", start: "top top", end: () => "+=" + dist(), scrub: .8, pin: true, invalidateOnRefresh: true, anticipatePin: 1 } });
    hCards.forEach(c => ScrollTrigger.create({ trigger: c, containerAnimation: tween, start: "left 85%", onEnter: () => c.classList.add("in") }));
    hCards.forEach((c, i) => gsap.from(c, { rotate: i % 2 ? 4 : -4, y: 60, ease: "none", scrollTrigger: { trigger: c, containerAnimation: tween, start: "left right", end: "left 60%", scrub: true } }));
  });
  mmT.add("(max-width: 900px)", () => { hCards.forEach(c => c.classList.add("in")); });

  /* ---------------- Gallery ---------------- */
  gsap.to(".gal-row:not(.rev)", { xPercent: -14, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.to(".gal-row.rev", { xPercent: 14, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });
  gsap.fromTo(".gal-type", { xPercent: 10 }, { xPercent: -25, ease: "none", scrollTrigger: { trigger: ".gallery", start: "top bottom", end: "bottom top", scrub: true } });
  $$(".gal-item img").forEach(img => gsap.to(img, { scale: 1, ease: "none", scrollTrigger: { trigger: img, start: "top bottom", end: "bottom top", scrub: true } }));

  /* ---------------- Contact ---------------- */
  const cSplit = new SplitType(".split-c", { types: "words,chars" });
  gradChars();
  gsap.from(cSplit.chars, { yPercent: 120, opacity: 0, rotate: 12, stagger: .03, duration: 1, ease: "back.out(1.7)", scrollTrigger: { trigger: ".contact-title", start: "top 85%" } });
  gsap.from(".c-card", { y: 50, opacity: 0, stagger: .1, duration: 1, ease: "expo.out", scrollTrigger: { trigger: ".contact-cards", start: "top 88%" } });
  gsap.from(".radar", { scale: .3, opacity: 0, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".radar", start: "top 85%" } });

  /* ---------------- Footer ---------------- */
  gsap.from(".foot-giant", { yPercent: 60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: true } });

  addEventListener("load", () => ScrollTrigger.refresh());
})();
