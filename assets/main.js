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
