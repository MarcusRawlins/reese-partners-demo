(() => {
  const nav = document.querySelector('.nav');
  const btn = document.querySelector('.menu-btn');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    btn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => { document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded', false); }));

  const targets = document.querySelectorAll('.section-head, .card, .step, .tier, .metric, .person, .compare, .pillars li, .stack-wrap, .cta-inner');
  targets.forEach(el => el.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) { targets.forEach(el => el.classList.add('in-view')); return; }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(el => io.observe(el));
  document.getElementById('yr').textContent = new Date().getFullYear();
})();

/* Atom diagram: electrons orbit tilted elliptical rings, with depth + parallax */
(() => {
  const svg = document.querySelector('.atom-svg');
  if (!svg) return;
  const atom = svg.closest('.atom');
  const back = svg.querySelector('#atomBack'), front = svg.querySelector('#atomFront');
  const RX = 185, RY = 56, TRAIL_GAP = 0.07;
  const els = [...svg.querySelectorAll('.e')].map(g => {
    const a = (+g.dataset.ring) * Math.PI / 180;
    return { g, chip: g.querySelector('.e-chip'), trail: [...g.querySelectorAll('.e-trail circle')],
      cos: Math.cos(a), sin: Math.sin(a), speed: +g.dataset.speed, phase: +g.dataset.phase, behind: null };
  });
  const pos = (e, t) => { const x = RX * Math.cos(t), y = RY * Math.sin(t);
    return [x * e.cos - y * e.sin, x * e.sin + y * e.cos, Math.sin(t)]; };

  const render = time => {
    for (const e of els) {
      const t = e.phase + time * e.speed;
      const [x, y, d] = pos(e, t);              // d: -1 = far side, +1 = near side
      const k = (d + 1) / 2, s = 0.8 + 0.2 * k;
      e.chip.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${s.toFixed(3)})`);
      e.g.style.opacity = (0.5 + 0.5 * k).toFixed(3);
      e.trail.forEach((c, i) => { const [tx, ty] = pos(e, t - (i + 1) * TRAIL_GAP);
        c.setAttribute('cx', tx.toFixed(2)); c.setAttribute('cy', ty.toFixed(2)); });
      const behind = d < 0;
      if (behind !== e.behind) { (behind ? back : front).appendChild(e.g); e.behind = behind; }
    }
  };

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { render(0); return; }

  let visible = true, last = performance.now(), clock = 0;
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; last = performance.now(); }).observe(svg);

  // parallax tilt (desktop pointers only)
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (matchMedia('(pointer: fine)').matches) {
    const zone = atom.closest('section') || atom;
    zone.addEventListener('pointermove', ev => { const r = atom.getBoundingClientRect();
      tx = ((ev.clientX - r.left) / r.width - 0.5) * 2; ty = ((ev.clientY - r.top) / r.height - 0.5) * 2; });
    zone.addEventListener('pointerleave', () => { tx = ty = 0; });
  }

  const loop = now => {
    if (visible) {
      clock += Math.min(now - last, 50) / 1000;
      render(clock);
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      atom.style.transform = `rotateY(${(cx * 9).toFixed(2)}deg) rotateX(${(-cy * 9).toFixed(2)}deg)`;
    }
    last = now; requestAnimationFrame(loop);
  };
  render(0); requestAnimationFrame(loop);
})();
