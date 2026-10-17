document.addEventListener('DOMContentLoaded', () => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Tema gelap/terang (tersimpan di browser) */
  const root = document.documentElement, themeBtn = $('#themeToggle');
  const applyTheme = (t) => {
    root.dataset.theme = t;
    themeBtn.innerHTML = `<i class="fas fa-${t === 'dark' ? 'sun' : 'moon'}"></i>`;
    try { localStorage.setItem('theme', t); } catch (e) {}
  };
  let saved = null;
  try { saved = localStorage.getItem('theme'); } catch (e) {}
  applyTheme(saved || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* Menu mobile */
  const toggle = $('.menu-toggle'), nav = $('#mainNav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', open);
  });
  $$('.main-nav a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
  }));

  /* Scroll: progress bar, header, tombol ke atas, link aktif */
  const header = $('#header'), bar = $('#progress'), toTop = $('#toTop');
  const sections = $$('main section[id]'), links = $$('.main-nav a');
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    header.classList.toggle('scrolled', y > 10);
    toTop.classList.toggle('show', y > 500);
    const pos = y + 140;
    sections.forEach(s => {
      const on = pos >= s.offsetTop && pos < s.offsetTop + s.offsetHeight;
      links.forEach(l => { if (l.getAttribute('href') === '#' + s.id) l.classList.toggle('active', on); });
    });
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* Efek mengetik */
  const roles = ['Web Developer', 'UI/UX Designer'];
  const typed = $('#typed');
  if (reduce) typed.textContent = roles[0];
  else {
    let r = 0, c = 0, del = false;
    const tick = () => {
      const w = roles[r];
      typed.textContent = w.slice(0, del ? --c : ++c);
      let t = del ? 40 : 90;
      if (!del && c === w.length) { del = true; t = 1400; }
      else if (del && c === 0) { del = false; r = (r + 1) % roles.length; t = 400; }
      setTimeout(tick, t);
    };
    tick();
  }

  /* Animasi saat terlihat: angka, progress skill, reveal */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el);
      if (el.matches('[data-count]')) {
        const end = +el.dataset.count, suf = el.dataset.suffix || '';
        if (reduce) { el.textContent = end + suf; return; }
        const t0 = performance.now();
        const step = (t) => {
          const p = Math.min((t - t0) / 1200, 1);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else if (el.matches('.bar')) {
        el.firstElementChild.style.width = el.dataset.level + '%';
      } else el.classList.add('in');
    });
  }, { threshold: .3 });
  $$('[data-count], .bar, .reveal').forEach(el => io.observe(el));

  /* Form kontak -> WhatsApp (dengan validasi) */
  const form = $('#contactForm'), msg = $('#formMsg');
  const NOMOR = '6281514397312'; // format internasional: tanpa +, tanpa 0 di depan
  form.addEventListener('submit', e => {
    e.preventDefault();
    const f = { nama: form.nama, email: form.email, pesan: form.pesan };
    let ok = true;
    Object.values(f).forEach(i => {
      const bad = !i.value.trim() || (i.type === 'email' && !/^\S+@\S+\.\S+$/.test(i.value.trim()));
      i.classList.toggle('invalid', bad); if (bad) ok = false;
    });
    msg.className = 'form-msg';
    if (!ok) { msg.textContent = 'Lengkapi semua kolom dengan benar, ya.'; return; }
    const text = `Halo, saya ${f.nama.value.trim()}\nEmail: ${f.email.value.trim()}\nPesan: ${f.pesan.value.trim()}`;
    window.open(`https://wa.me/${NOMOR}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    msg.textContent = 'Membuka WhatsApp...'; msg.classList.add('ok');
    form.reset();
  });
});