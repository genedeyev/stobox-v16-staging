

(function(){
  /* --- notification bar. The dismissal stores the notice id, not a flag, so a
     new notice reaches somebody who dismissed the last one. --- */
  var NOTICE_ID = 'accounts-2026-09';
  var bar = document.getElementById('notice');
  if (bar) {
    var seen = null;
    try { seen = localStorage.getItem('stobox.notice'); } catch (e) {}
    if (seen === NOTICE_ID) bar.hidden = true;
    document.getElementById('notice-x').addEventListener('click', function(){
      bar.hidden = true;
      try { localStorage.setItem('stobox.notice', NOTICE_ID); } catch (e) {}
    });
  }

  /* --- menus. Hover or click opens; leaving the bar closes. Solutions is a
     link that also opens, so its click is never intercepted. --- */
  var head = document.querySelector('.site-head');
  var trigs = Array.prototype.slice.call(document.querySelectorAll('.trig'));
  function setOpen(t, on){
    t.setAttribute('data-open', on ? 'true' : 'false');
    var c = t.firstElementChild, p = t.querySelector('.panel');
    if (c) c.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (p) p.hidden = !on;
  }
  function closeAll(except){ trigs.forEach(function(t){ if (t !== except) setOpen(t, false); }); }
  trigs.forEach(function(t){
    var ctrl = t.firstElementChild;
    var justOpened = 0;
    function openNow(){ closeAll(t); setOpen(t, true); justOpened = Date.now(); }
    t.addEventListener('mouseenter', openNow);
    ctrl.addEventListener('focus', openNow);
    t.addEventListener('focusout', function(e){
      if (!t.contains(e.relatedTarget)) setOpen(t, false);
    });
    ctrl.addEventListener('click', function(e){
      var open = t.getAttribute('data-open') === 'true';
      if (ctrl.tagName !== 'BUTTON') return;
      e.preventDefault();
      /* the click that follows a hover or focus open is the same gesture, not a toggle */
      if (open && Date.now() - justOpened < 400) return;
      closeAll(t); setOpen(t, !open);
    });
    t.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { setOpen(t, false); ctrl.focus(); }
    });
  });
  if (head) head.addEventListener('mouseleave', function(){ closeAll(); });

  /* --- the mega rail: plate, name, sentence and link move together --- */
  var rail = document.querySelectorAll('.p-mega .rail a');
  Array.prototype.forEach.call(rail, function(a){
    function activate(){
      Array.prototype.forEach.call(rail, function(x){ x.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'true');
      var i = a.getAttribute('data-i');
      Array.prototype.forEach.call(document.querySelectorAll('.p-mega .pane'), function(p){
        p.hidden = p.getAttribute('data-i') !== i;
      });
    }
    a.addEventListener('mouseenter', activate);
    a.addEventListener('focus', activate);
  });

  /* --- collapsed drawer --- */
  var burger = document.getElementById('burger'), drawer = document.getElementById('drawer');
  if (burger && drawer) {
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape' && drawer.getAttribute('data-open') === 'true') { burger.click(); }
    });
    burger.addEventListener('click', function(){
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', open ? 'false' : 'true');
      drawer.setAttribute('data-open', open ? 'false' : 'true');
      document.documentElement.classList.toggle('drawer-open', !open);
      if (!open) { drawer.style.maxHeight = Math.max(240, window.innerHeight - drawer.getBoundingClientRect().top - 8) + 'px'; }
      if (!open) { var f = drawer.querySelector('a,button'); if (f) f.focus(); } else { burger.focus(); }
    });
  }

  /* --- figures that complete on scroll: seed the sweep length, then let the
         page's own reveal observer add .in and run the transition --- */
  Array.prototype.forEach.call(document.querySelectorAll('.figdraw'), function(box){
    var arc = box.querySelector('.ring circle:nth-of-type(2)');
    if (!arc) return;
    var d = (arc.getAttribute('stroke-dasharray') || '').split(' ')[0];
    if (d) box.style.setProperty('--sweep', d);
  });

  /* --- the hairline appears once the page has left the top --- */
  if (head) {
    var onScroll = function(){ head.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
})();

(function(){
  /* eight kinds of asset: one integer, wrapping at both ends */
  var C = [["Property", "The work is title, encumbrances and the entity that actually holds the building. Once that is settled, a floor sold to forty investors stops being forty side letters and becomes forty positions in one register. Rent reaches holders of record without anyone rebuilding the list first, and a sale of part of the building does not require reopening the whole structure.", "/assets/mega/sector-issuers.webp"], ["Funds and private equity", "Subscription terms and transfer consent are where the paperwork gets long. Written into the token, consent becomes a check the contract runs rather than an email chain, and a transfer that would breach the terms does not settle. The cap table is current at the moment of the transfer, so the administrator reports from the register instead of reconciling to it.", "/assets/mega/sector-funds-private-equity.webp"], ["Private credit", "The commitment lasts years after issuance: servicing, reporting and the covenants somebody has to check. Payments run from the register to the holders of record on the date they are owed, and each one is written down as it happens. A participation can change hands inside the rules the loan already carries, without renegotiating the facility.", "/assets/mega/plate-distribution.webp"], ["Commodities and gold", "The work is custody, assay and who attests that the metal is where it is said to be. Those attestations sit in the passport with dates against them, so a buyer reads the evidence rather than taking your word for it. Ownership can move in small amounts against a bar that never moves, and every claim on it stays traceable to the same record.", "/assets/mega/plate-settlement.webp"], ["Energy", "Offtake agreements, licenses and the entity holding the concession decide what an investor is actually buying. With those structured, a project can be funded by many holders whose rights are enforced by the contract rather than by a schedule in an appendix. Revenue reaches them on the cadence the offtake sets, and each distribution is recorded against the same register.", "/assets/mega/plate-scale.webp"], ["Manufacturing", "Plant, equipment and inventory have to agree with the books before anything is issued against them. Once they do, the instrument can be sized to a line or a site instead of the whole company, and the rules restrict who may hold it. Later financing rounds read the same record, so the second raise does not start with a fresh audit of the first.", "/assets/mega/plate-aggregation.webp"], ["Operating company equity", "Shareholder agreements have to be reconciled with what the token will do, because the contract will enforce whichever one is written into it. After that, the register is the cap table: it is current, it is inspectable, and it does not drift from the spreadsheet somebody keeps locally. Employees, angels and a later institution can all hold the same instrument under different limits.", "/assets/mega/sector-investors-liquidity.webp"], ["Revenue and royalty rights", "The work is defining precisely what share of what, and how it is calculated and paid. Written as a rule, the share is paid from the register on schedule rather than by somebody remembering to run a report. A right that used to be one contract with one counterparty can be held by many, and each holder can see what they are owed against the same numbers.", "/assets/mega/plate-distribution.webp"]], i = 0;
  var idx = document.getElementById('ax-index');
  var plate = document.getElementById('ax-plate'), name = document.getElementById('ax-name'),
      body = document.getElementById('ax-body'), count = document.getElementById('ax-count');
  // The plates live in one directory. Take it from the first plate's own src rather than
  // hard-coding the site root, so a build served from a sub-path (the staging Pages site
  // lives under /stobox-v16-staging/) switches plates instead of switching to a 404.
  var dir = (plate.getAttribute('src') || '').replace(/[^\/]*$/, '');
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  function go(n){
    i = (n + C.length) % C.length;
    plate.src = dir + C[i][2].split('/').pop(); name.textContent = C[i][0]; body.textContent = C[i][1];
    count.textContent = pad(i + 1) + ' / ' + pad(C.length);
    Array.prototype.forEach.call(idx.querySelectorAll('button'), function(b, k){
      b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
  }
  idx.addEventListener('click', function(e){
    var b = e.target.closest('button'); if (b) go(parseInt(b.getAttribute('data-i'), 10));
  });
  document.getElementById('ax-prev').addEventListener('click', function(){ go(i - 1); });
  document.getElementById('ax-next').addEventListener('click', function(){ go(i + 1); });

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = Array.prototype.slice.call(document.querySelectorAll('.reveal, .rgroup, .wipe, .hero-seq'));
  function showAll(){ groups.forEach(function(el){ el.classList.add('in'); }); }
  var hero = document.querySelector('.hero-seq');
  if (hero) requestAnimationFrame(function(){ hero.classList.add('in'); });
  if (reduce || !('IntersectionObserver' in window)) { showAll(); }
  else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    groups.forEach(function(el){ io.observe(el); });
    window.setTimeout(showAll, 3000);
  }
  var hd = document.querySelector('.site-head');
  if (hd) {
    var onScroll = function(){ hd.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
