(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;

  // Tema terang/gelap (kunci sama dengan B/L Control)
  var tb = document.getElementById('themeBtn');
  function label() {
    var gelap = root.getAttribute('data-theme') === 'dark';
    tb.setAttribute('aria-label', gelap ? 'Ganti ke tema terang' : 'Ganti ke tema gelap');
    tb.setAttribute('title', gelap ? 'Tema terang' : 'Tema gelap');
  }
  label();
  tb.addEventListener('click', function () {
    var baru = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', baru);
    try {
      localStorage.setItem('bl-theme', baru);
    } catch (e) {}
    label();
  });

  // Menu mobile
  var menuBtn = document.getElementById('menuBtn');
  var navlinks = document.getElementById('navlinks');
  function toggleMenu(buka) {
    navlinks.classList.toggle('open', buka);
    menuBtn.setAttribute('aria-expanded', buka ? 'true' : 'false');
  }
  menuBtn.addEventListener('click', function () {
    toggleMenu(!navlinks.classList.contains('open'));
  });
  navlinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      toggleMenu(false);
    });
  });

  // Judul hero: kata naik satu per satu
  if (!reduce) {
    var h1 = document.querySelector('.hero h1');
    h1.innerHTML = h1.textContent
      .trim()
      .split(/\s+/)
      .map(function (w, i) {
        return '<span class="w"><span style="--i:' + i + '">' + w + '</span></span>';
      })
      .join(' ');
  }

  // Grid + cahaya mengikuti kursor di hero
  var hero = document.querySelector('.hero');
  if (fine && !reduce) {
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', e.clientX - r.left + 'px');
      hero.style.setProperty('--my', e.clientY - r.top + 'px');
    });
  }

  // Sorotan kartu mengikuti kursor
  document.querySelectorAll('.svc,.kontak-card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--x', e.clientX - r.left + 'px');
      c.style.setProperty('--y', e.clientY - r.top + 'px');
    });
  });

  // Muncul bertahap saat di-scroll
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          io.unobserve(el);
          el.classList.add('in');
          setTimeout(function () {
            el.removeAttribute('data-r');
            el.classList.remove('in');
            el.style.removeProperty('--d');
          }, 1400);
        });
      },
      { threshold: 0.15 },
    );
    document.querySelectorAll('.sec h2,.sec .lead,.field,.svc,.kontak-card,.step').forEach(function (el) {
      el.setAttribute('data-r', '');
      el.style.setProperty('--d', Math.min(Array.prototype.indexOf.call(el.parentNode.children, el), 6));
      io.observe(el);
    });
  }

  // Hero: titik menyusuri rute, berulang, dengan cincin ping dan pembacaan posisi
  var path = document.getElementById('routePath');
  var trail = document.getElementById('routeTrail');
  var dot = document.getElementById('routeDot');
  var ro = document.getElementById('readout');
  var nodes = Array.prototype.slice.call(document.querySelectorAll('.node'));
  var names = ['Surabaya', 'Jakarta', 'Belawan', 'Medan'];
  var len = path.getTotalLength();
  trail.style.strokeDasharray = len;

  var at = nodes.map(function (n) {
    var cx = +n.getAttribute('cx'),
      cy = +n.getAttribute('cy'),
      best = 0,
      bd = Infinity;
    for (var l = 0; l <= len; l += 2) {
      var p = path.getPointAtLength(l),
        d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d < bd) {
        bd = d;
        best = l;
      }
    }
    return best;
  });

  var pings = nodes.map(function (n) {
    var c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('class', 'ping');
    c.setAttribute('cx', n.getAttribute('cx'));
    c.setAttribute('cy', n.getAttribute('cy'));
    c.setAttribute('r', 6);
    n.parentNode.insertBefore(c, n);
    return c;
  });
  var fired = [];
  function ping(i) {
    var c = pings[i];
    c.classList.remove('go');
    void c.getBoundingClientRect();
    c.classList.add('go');
  }

  function draw(l, live) {
    var p = path.getPointAtLength(l);
    dot.setAttribute('cx', p.x);
    dot.setAttribute('cy', p.y);
    trail.style.strokeDashoffset = len - l;
    nodes.forEach(function (n, i) {
      var on = l >= at[i] - 1;
      n.classList.toggle('on', on);
      if (on && !fired[i]) {
        fired[i] = true;
        if (live) ping(i);
      }
      if (!on) fired[i] = false;
    });
    var i = 0;
    while (i < at.length - 1 && l >= at[i + 1] - 1) i++;
    var pct = Math.round((l / len) * 100);
    ro.textContent = (l >= len - 1 ? 'Tiba di ' + names[names.length - 1] : names[i] + ' > ' + names[i + 1]) + ' | ' + pct + '%';
  }

  function run() {
    var t0 = null,
      DUR = 5200;
    fired = [];
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var k = Math.min((t - t0) / DUR, 1);
      var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      draw(len * e, true);
      if (k < 1) requestAnimationFrame(step);
      else
        setTimeout(function () {
          draw(0, false);
          setTimeout(run, 600);
        }, 3200);
    });
  }

  if (reduce) {
    draw(len, false);
  } else {
    draw(0, false);
    setTimeout(run, 900);
  }

  // Scroll: bar progres, menu aktif, garis alur pengiriman
  var bar = document.getElementById('progress');
  var links = Array.prototype.slice.call(navlinks.querySelectorAll('a'));
  var secs = links.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });
  var route = document.getElementById('route');
  var rl = route.querySelector('.rl');
  var rf = route.querySelector('.rf');
  var steps = Array.prototype.slice.call(route.querySelectorAll('.step'));
  var ticking = false;

  function update() {
    ticking = false;
    var max = root.scrollHeight - window.innerHeight;
    bar.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';

    var cur = -1;
    secs.forEach(function (s, i) {
      if (s.getBoundingClientRect().top <= window.innerHeight * 0.35) cur = i;
    });
    links.forEach(function (a, i) {
      a.classList.toggle('act', i === cur);
    });

    var total = steps[steps.length - 1].offsetTop;
    rl.style.height = total + 'px';
    var h = reduce ? total : Math.max(0, Math.min(total, window.innerHeight * 0.6 - route.getBoundingClientRect().top - 14));
    rf.style.height = h + 'px';
    var last = -1;
    steps.forEach(function (s, i) {
      var on = s.offsetTop <= h;
      s.classList.toggle('on', on);
      if (on) last = i;
    });
    steps.forEach(function (s, i) {
      s.classList.toggle('cur', i === last && !reduce);
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  document.getElementById('footLogo').src = document.querySelector('.brand img').src;
})();
