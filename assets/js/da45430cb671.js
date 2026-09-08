

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
  /* the reason chips name the desk as you pick, which is what the routing table used to do */
  var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
  var desk = document.getElementById('desk');
  chips.forEach(function(c){
    c.addEventListener('click', function(){
      chips.forEach(function(x){ x.setAttribute('aria-checked', 'false'); });
      c.setAttribute('aria-checked', 'true');
      desk.textContent = c.getAttribute('data-desk');
      document.getElementById('c-reason').value = c.textContent.trim();
    });
  });

  /* the country field: the native list is the one place the brand chrome breaks down */
  var btn = document.getElementById('c-country');
  var list = btn.parentElement.querySelector('.clist');
  function close(){ list.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  btn.addEventListener('click', function(e){
    e.stopPropagation();
    var open = btn.getAttribute('aria-expanded') === 'true';
    list.hidden = open; btn.setAttribute('aria-expanded', open ? 'false' : 'true');
  });
  list.addEventListener('click', function(e){
    var o = e.target.closest('[role="option"]');
    if (!o) return;
    Array.prototype.forEach.call(list.children, function(x){ x.setAttribute('aria-selected','false'); });
    o.setAttribute('aria-selected', 'true');
    btn.innerHTML = '<span>' + o.firstChild.textContent.trim() + '</span>';
    document.getElementById('c-country-v').value = o.firstChild.textContent.trim();
    close();
  });
  document.addEventListener('click', close);
  btn.setAttribute('aria-labelledby', 'c-country-l c-country');
  function opts(){ return Array.prototype.slice.call(list.querySelectorAll('[role="option"]')); }
  btn.parentElement.addEventListener('keydown', function(e){
    var os = opts(), cur = os.indexOf(document.activeElement);
    if (e.key === 'Escape') { close(); btn.focus(); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (list.hidden) { list.hidden = false; btn.setAttribute('aria-expanded', 'true'); }
      var next = e.key === 'ArrowDown' ? Math.min(cur + 1, os.length - 1) : Math.max(cur - 1, 0);
      (os[next] || os[0]).focus();
    }
    if (e.key === 'Home' && !list.hidden) { e.preventDefault(); os[0].focus(); }
    if (e.key === 'End' && !list.hidden) { e.preventDefault(); os[os.length - 1].focus(); }
  });

  /* the form validates in the page and posts as JSON; nothing ever lands in the URL */
  var form = document.getElementById('c-form');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var bad = Array.prototype.filter.call(form.querySelectorAll('[required]'), function(f){
      var ok = f.type === 'checkbox' ? f.checked : f.value.trim().length > 0;
      if (f.type === 'email' && ok) ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value);
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      return !ok;
    });
    var note = document.getElementById('c-msg');
    if (bad.length) {
      if (note) { note.hidden = false;
        note.textContent = bad.length === 1 ? 'One field still needs an answer.'
          : bad.length + ' fields still need an answer.'; }
      bad[0].focus(); return;
    }
    if (note) note.hidden = true;
    var data = {};
    new FormData(form).forEach(function(v, k){ data[k] = v; });
    var sub = form.querySelector('[type="submit"]');
    sub.disabled = true; sub.textContent = 'Sending';
    fetch(form.getAttribute('action'), { method: 'POST',
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    .then(function(r){ if (!r.ok) throw new Error(String(r.status)); return r; })
    .then(function(){ sub.textContent = 'Sent. A reply within two working days.'; })
    .catch(function(){
      sub.disabled = false; sub.textContent = 'Send message';
      var n = document.getElementById('c-fail') || document.createElement('p');
      n.id = 'c-fail'; n.className = 'sec-note'; n.setAttribute('role', 'alert');
      n.textContent = 'That did not go through. Write to info@stobox.io and it reaches the same desk.';
      sub.parentNode.appendChild(n);
    });
  });

  var groups = Array.prototype.slice.call(
    document.querySelectorAll('.reveal, .rgroup, .hero-seq'));
  function show(el){ el.classList.add('in'); }
  function showAll(){ groups.forEach(show); }
  var hero = document.querySelectorAll('.hero-seq');
  requestAnimationFrame(function(){
    Array.prototype.forEach.call(hero, function(el, i){
      setTimeout(function(){ show(el); }, 60 * i);
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    groups.forEach(function(el){ io.observe(el); });
  } else { showAll(); }
  setTimeout(showAll, 3000);
})();
