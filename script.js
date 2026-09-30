// menu mobile
  const menuBtn = document.getElementById('menuBtn');
  const navlinks = document.getElementById('navlinks');
  menuBtn.addEventListener('click', () => navlinks.classList.toggle('open'));
  navlinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navlinks.classList.remove('open')));

  // rays generator
  const rays = document.getElementById('rays');
  for(let i=0;i<20;i++){
    const r = document.createElement('div');
    r.style.transform = `rotate(${i*18}deg)`;
    rays.appendChild(r);
  }

  // scroll reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // counter angka
  const co = new IntersectionObserver((es)=>{
    es.forEach(e=>{ if(!e.isIntersecting) return; co.unobserve(e.target);
      const to = +e.target.dataset.count, t0 = performance.now(), from = to>100 ? to-40 : 0;
      (function tick(t){ const p = Math.min((t-t0)/1400,1);
        e.target.textContent = Math.round(from + (to-from)*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick); })(t0);
    });
  },{threshold:.6});
  document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));
