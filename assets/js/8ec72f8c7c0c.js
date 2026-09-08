

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
  // copy controls
  document.querySelectorAll('.copy').forEach(function(btn){
    btn.addEventListener('click', function(){
      var el = document.querySelector(btn.getAttribute('data-copy'));
      if (!el) return;
      var text = el.textContent;
      var done = function(){
        var old = btn.textContent; btn.textContent = 'Copied';
        document.getElementById('live').textContent = 'Copied to clipboard';
        window.setTimeout(function(){ btn.textContent = old;
          document.getElementById('live').textContent = ''; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function(){
          btn.textContent = 'Press Ctrl+C';
          var r = document.createRange(); r.selectNodeContents(el);
          var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        });
      } else {
        btn.textContent = 'Press Ctrl+C';
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      }
    });
  });

  // client tabs
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab){
    tabs.forEach(function(t){
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function(tab, i){
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener('click', function(){ select(tab); });
    tab.addEventListener('keydown', function(e){
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var next = tabs[(tabs.indexOf(tab) + d + tabs.length) % tabs.length];
      select(next); next.focus();
    });
  });

  // motion
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var groups = Array.prototype.slice.call(document.querySelectorAll('.reveal, .rgroup, .wipe, .reveal-rule, .hero-seq'));
  var showAll = function(){ groups.forEach(function(el){ el.classList.add('in'); }); };
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
  var head = document.querySelector('.site-head');
  if (head) {
    var onScroll = function(){ head.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll(); window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
