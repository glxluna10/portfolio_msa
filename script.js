(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tema terang/gelap (kunci sama dengan B/L Control)
  var tb = document.getElementById("themeBtn");
  function label() {
    var gelap = root.getAttribute("data-theme") === "dark";
    tb.setAttribute("aria-label", gelap ? "Ganti ke tema terang" : "Ganti ke tema gelap");
    tb.setAttribute("title", gelap ? "Tema terang" : "Tema gelap");
  }
  label();
  tb.addEventListener("click", function () {
    var baru = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", baru);
    try { localStorage.setItem("bl-theme", baru); } catch (e) {}
    label();
  });

  // Menu mobile
  var menuBtn = document.getElementById("menuBtn");
  var navlinks = document.getElementById("navlinks");
  function toggleMenu(buka) {
    navlinks.classList.toggle("open", buka);
    menuBtn.setAttribute("aria-expanded", buka ? "true" : "false");
  }
  menuBtn.addEventListener("click", function () { toggleMenu(!navlinks.classList.contains("open")); });
  navlinks.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { toggleMenu(false); }); });

  // Hero: titik menyusuri rute Surabaya -> Jakarta -> Belawan -> Medan, satu kali
  var path = document.getElementById("routePath");
  var trail = document.getElementById("routeTrail");
  var dot = document.getElementById("routeDot");
  var nodes = Array.prototype.slice.call(document.querySelectorAll(".node"));
  var len = path.getTotalLength();
  trail.style.strokeDasharray = len;

  var at = nodes.map(function (n) {
    var cx = +n.getAttribute("cx"), cy = +n.getAttribute("cy"), best = 0, bd = Infinity;
    for (var l = 0; l <= len; l += 2) {
      var p = path.getPointAtLength(l), d = (p.x - cx) * (p.x - cx) + (p.y - cy) * (p.y - cy);
      if (d < bd) { bd = d; best = l; }
    }
    return best;
  });

  function draw(l) {
    var p = path.getPointAtLength(l);
    dot.setAttribute("cx", p.x);
    dot.setAttribute("cy", p.y);
    trail.style.strokeDashoffset = len - l;
    nodes.forEach(function (n, i) { n.classList.toggle("on", l >= at[i] - 1); });
  }

  if (reduce) {
    draw(len);
  } else {
    draw(0);
    var t0 = null, DUR = 5200;
    setTimeout(function () {
      requestAnimationFrame(function step(t) {
        if (!t0) t0 = t;
        var k = Math.min((t - t0) / DUR, 1);
        var e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        draw(len * e);
        if (k < 1) requestAnimationFrame(step);
      });
    }, 500);
  }

  // Alur pengiriman: garis terisi mengikuti scroll
  var route = document.getElementById("route");
  var rl = route.querySelector(".rl");
  var rf = route.querySelector(".rf");
  var steps = Array.prototype.slice.call(route.querySelectorAll(".step"));
  var ticking = false;

  function update() {
    ticking = false;
    var total = steps[steps.length - 1].offsetTop;
    rl.style.height = total + "px";
    var h = reduce ? total : Math.max(0, Math.min(total, window.innerHeight * 0.6 - route.getBoundingClientRect().top - 14));
    rf.style.height = h + "px";
    steps.forEach(function (s) { s.classList.toggle("on", s.offsetTop <= h); });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
})();
