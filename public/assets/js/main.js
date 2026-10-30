document.documentElement.classList.remove('no-js');

(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var html = document.documentElement;

  /* Titolo parola per parola (testo originale resta leggibile agli screen reader) */
  document.querySelectorAll('[data-split]').forEach(function (el) {
    var testo = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', testo);
    var i = 0;
    var nodi = Array.prototype.slice.call(el.childNodes);
    el.textContent = '';
    nodi.forEach(function (n) {
      var parole = n.textContent.split(/(\s+)/);
      var contenitore = n.nodeType === 1 ? document.createElement(n.tagName.toLowerCase()) : null;
      parole.forEach(function (p) {
        if (!p) return;
        if (/^\s+$/.test(p)) { (contenitore || el).appendChild(document.createTextNode(' ')); return; }
        var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
        var s = document.createElement('span'); s.textContent = p; s.style.setProperty('--i', i++);
        w.appendChild(s); (contenitore || el).appendChild(w);
      });
      if (contenitore) el.appendChild(contenitore);
    });
  });

  /* Apertura: sipario sulla foto della sala */
  function caricato() { requestAnimationFrame(function () { html.classList.add('is-loaded'); }); }
  if (document.readyState === 'complete') caricato(); else window.addEventListener('load', caricato);
  setTimeout(caricato, 2500); // rete lenta: non tenere il cliente ad aspettare

  /* Rivelazioni allo scroll */
  var rivela = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    rivela.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    rivela.forEach(function (el) { io.observe(el); });
  }

  /* Nav: vetro dopo lo scroll + pulsante Prenota fisso su telefono */
  var nav = document.querySelector('[data-nav]');
  var fab = document.querySelector('.fab');
  var hero = document.querySelector('.hero__cta');
  var tick = false;
  function aggiorna() {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('is-scrolled', y > 12);
    if (fab) {
      var oltre = hero ? hero.getBoundingClientRect().bottom < 0 : y > 500;
      var fine = (window.innerHeight + y) > (document.body.scrollHeight - 320);
      fab.classList.toggle('is-visible', oltre && !fine);
    }
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(aggiorna); } }, { passive: true });
  aggiorna();

  /* Menu mobile */
  var toggle = document.querySelector('[data-menu-toggle]');
  var pannello = document.getElementById('menu-mobile');
  function chiudi() {
    if (!toggle || !pannello) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.querySelector('.sr-only').textContent = 'Apri il menu';
    pannello.hidden = true; document.body.classList.remove('menu-open');
  }
  if (toggle && pannello) {
    toggle.addEventListener('click', function () {
      var aperto = toggle.getAttribute('aria-expanded') === 'true';
      if (aperto) { chiudi(); return; }
      toggle.setAttribute('aria-expanded', 'true');
      toggle.querySelector('.sr-only').textContent = 'Chiudi il menu';
      pannello.hidden = false; document.body.classList.add('menu-open');
    });
    pannello.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', chiudi); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') chiudi(); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 960) chiudi(); });
  }

  /* Racconto in tre tempi: cambia foto e numero secondo il paragrafo attivo */
  var passi = document.querySelectorAll('[data-step]');
  var foto = document.querySelectorAll('[data-step-img]');
  var num = document.querySelector('[data-step-num]');
  if (passi.length && 'IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var k = e.target.getAttribute('data-step');
        passi.forEach(function (p) { p.classList.toggle('is-active', p === e.target); });
        foto.forEach(function (f) { f.classList.toggle('is-active', f.getAttribute('data-step-img') === k); });
        if (num) num.textContent = '0' + (Number(k) + 1);
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    passi.forEach(function (p) { so.observe(p); });
    passi[0].classList.add('is-active');
  }

  /* Contatore cantina */
  var cnt = document.querySelector('[data-count]');
  if (cnt && !reduce && 'IntersectionObserver' in window) {
    var fine = Number(cnt.getAttribute('data-count'));
    var co = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      co.disconnect();
      var t0 = null;
      function passo(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 1600);
        cnt.textContent = Math.round(fine * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    }, { threshold: 0.6 });
    co.observe(cnt);
  }
})();
