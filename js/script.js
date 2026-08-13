(function(){
  "use strict";

  /* ============================================================
     PRELOADER
     ============================================================ */
  var body = document.body;
  body.classList.add('no-scroll');
  var minDelay = new Promise(function(res){ setTimeout(res, 2000); });
  var pageReady = new Promise(function(res){
    if (document.readyState === 'complete') res();
    else window.addEventListener('load', res);
  });
  Promise.all([minDelay, pageReady]).then(function(){
    body.classList.add('loaded');
    body.classList.remove('no-scroll');
    setTimeout(function(){ body.classList.add('loaded-done'); }, 1300);
  });

  /* ============================================================
     HEADER SOLID ON SCROLL
     ============================================================ */
  var header = document.getElementById('siteHeader');
  function onScrollHeader(){
    if (window.scrollY > 40) header.classList.add('is-solid');
    else header.classList.remove('is-solid');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ============================================================
     HEADER HEIGHT -> CSS VAR
     Measures the real rendered header (brand text can wrap to a
     different height depending on font metrics/screen size), so the
     hero always clears it exactly instead of relying on a guessed
     padding value that could let the title collide with the nav.
     ============================================================ */
  function syncHeaderHeight(){
    if (!header) return;
    var h = header.getBoundingClientRect().height;
    if (h > 0) document.documentElement.style.setProperty('--header-h', h + 'px');
  }
  syncHeaderHeight();
  window.addEventListener('resize', syncHeaderHeight);
  window.addEventListener('load', syncHeaderHeight);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncHeaderHeight);
  }

  /* ============================================================
     MOBILE NAV
     ============================================================ */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function(){
      navToggle.classList.toggle('is-active');
      mobileNav.classList.toggle('is-open');
      body.classList.toggle('no-scroll');
    });
    mobileNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        navToggle.classList.remove('is-active');
        mobileNav.classList.remove('is-open');
        body.classList.remove('no-scroll');
      });
    });
  }

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* ============================================================
     COUNTERS
     ============================================================ */
  var counters = document.querySelectorAll('[data-count]');
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var duration = 1600;
    var start = null;
    function step(ts){
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + suffix;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && counters.length) {
    var cio = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function(c){ cio.observe(c); });
  }

  /* ============================================================
     HERO TITLE — WORD-BY-WORD REVEAL
     ============================================================ */
  var twEl = document.querySelector('[data-typewriter]');
  if (twEl) {
    var original = twEl.innerHTML;
    var container = document.createElement('span');
    container.innerHTML = original;
    var frag = document.createDocumentFragment();

    function wrapWords(node, targetFrag){
      node.childNodes.forEach(function(child){
        if (child.nodeType === Node.TEXT_NODE) {
          var words = child.textContent.split(/(\s+)/);
          words.forEach(function(w){
            if (w.trim() === '') { targetFrag.appendChild(document.createTextNode(w)); return; }
            var span = document.createElement('span');
            span.className = 'tw-word';
            span.textContent = w;
            targetFrag.appendChild(span);
          });
        } else {
          var clone = child.cloneNode(false);
          wrapWords(child, clone);
          targetFrag.appendChild(clone);
        }
      });
    }
    wrapWords(container, frag);
    twEl.innerHTML = '';
    twEl.appendChild(frag);

    var wordEls = twEl.querySelectorAll('.tw-word');
    wordEls.forEach(function(w, i){
      w.style.animationDelay = (0.15 + i * 0.055) + 's';
    });
  }

  /* ============================================================
     SERVICE CARD BACKGROUNDS
     ============================================================ */
  document.querySelectorAll('[data-bg]').forEach(function(el){
    var absoluteUrl = new URL(el.getAttribute('data-bg'), document.baseURI).href;
    el.style.setProperty('--card-bg', 'url("' + absoluteUrl + '")');
  });

  /* ============================================================
     WHATSAPP FLOATING MENU
     ============================================================ */
  var waToggle = document.getElementById('waToggle');
  var waMenu = document.getElementById('waMenu');
  if (waToggle && waMenu) {
    waToggle.addEventListener('click', function(){
      waMenu.classList.toggle('is-open');
    });
    document.addEventListener('click', function(e){
      if (!waMenu.contains(e.target) && !waToggle.contains(e.target)) {
        waMenu.classList.remove('is-open');
      }
    });
  }

  /* ============================================================
     BACK TO TOP
     ============================================================ */
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function(){
      if (window.scrollY > 600) toTop.classList.add('is-visible');
      else toTop.classList.remove('is-visible');
    }, { passive: true });
    toTop.addEventListener('click', function(){
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============================================================
     CONTACT FORM -> WHATSAPP
     ============================================================ */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var nombre = document.getElementById('nombre').value.trim();
      var telefono = document.getElementById('telefono').value.trim();
      var area = document.getElementById('area').value.trim();
      var mensaje = document.getElementById('mensaje').value.trim();

      var texto = 'Hola, mi nombre es ' + nombre + '. ' +
        'Necesito asesoría en ' + area + '. ' +
        'Mi teléfono es ' + telefono + '.' +
        (mensaje ? ' Detalle de mi caso: ' + mensaje : '');

      var url = 'https://wa.me/527225985693?text=' + encodeURIComponent(texto);
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ============================================================
     PARTICLES CANVAS (hero)
     ============================================================ */
  var canvas = document.getElementById('heroParticles');
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize(){
      var rect = canvas.parentElement.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles(){
      var count = Math.max(24, Math.min(60, Math.floor((W * H) / 26000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.8 + 0.6,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -Math.random() * 0.25 - 0.05,
          a: Math.random() * 0.5 + 0.15,
          tw: Math.random() * Math.PI * 2
        });
      }
    }

    function draw(){
      ctx.clearRect(0, 0, W, H);
      particles.forEach(function(p){
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        var alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(203,170,125,' + alpha.toFixed(3) + ')';
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', function(){
      resize();
      createParticles();
    });
  }

  /* ============================================================
     GENERIC PARTICLE LAYER FOR OTHER SECTIONS (why us / process)
     ============================================================ */
  function initSectionParticles(container, opts){
    if (!container) return;
    var c = document.createElement('canvas');
    c.className = 'section-particles';
    c.style.position = 'absolute';
    c.style.inset = '0';
    c.style.pointerEvents = 'none';
    c.style.zIndex = '-1';
    container.style.position = container.style.position || 'relative';
    container.prepend(c);
    var ctx = c.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, dots = [];
    var color = (opts && opts.color) || '203,170,125';
    var density = (opts && opts.density) || 32000;

    function resize(){
      var rect = container.getBoundingClientRect();
      W = rect.width; H = rect.height;
      c.width = W * dpr; c.height = H * dpr;
      c.style.width = W + 'px'; c.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.max(14, Math.min(38, Math.floor((W * H) / density)));
      dots = [];
      for (var i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.6 + 0.5,
          vy: -Math.random() * 0.15 - 0.03,
          a: Math.random() * 0.4 + 0.1, tw: Math.random() * Math.PI * 2
        });
      }
    }

    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function draw(){
      ctx.clearRect(0, 0, W, H);
      dots.forEach(function(p){
        p.y += p.vy; p.tw += 0.015;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        var alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + color + ',' + alpha.toFixed(3) + ')';
        ctx.fill();
      });
      if (!reduceMotion) requestAnimationFrame(draw);
    }
    resize();
    draw();
    window.addEventListener('resize', resize);
  }

  initSectionParticles(document.getElementById('porque'), { color: '203,170,125', density: 42000 });
  initSectionParticles(document.getElementById('galeria'), { color: '203,170,125', density: 42000 });

})();
