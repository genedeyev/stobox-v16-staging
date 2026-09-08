
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var mobile = window.matchMedia('(max-width: 640px)');

  /* section heads and swipe tracks join the reveal */
  var io = ('IntersectionObserver' in window) ? new IntersectionObserver(function(es){
    es.forEach(function(e){
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      if (e.target.classList.contains('swipe') && !reduce && mobile.matches && !e.target.dataset.nudged) {
        e.target.dataset.nudged = '1'; e.target.classList.add('nudge');
        e.target.addEventListener('animationend', function(){ e.target.classList.remove('nudge'); }, { once: true });
      }
      if (e.target.classList.contains('count')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 }) : null;

  Array.prototype.forEach.call(document.querySelectorAll('.sec-head, .swipe, .count'), function(el){
    if (io) io.observe(el); else el.classList.add('in');
  });
  window.setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll('.sec-head, .swipe'), function(el){ el.classList.add('in'); }); }, 3000);

  /* the ledger under each track: dots and a count, kept in step with the scroll */
  function trackNav(track){
    var kids = Array.prototype.filter.call(track.children, function(c){ return c.tagName !== 'SCRIPT'; });
    if (kids.length < 2) return;
    var nav = document.createElement('div'); nav.className = 'swipe-nav'; nav.setAttribute('aria-hidden', 'true');
    var dots = document.createElement('div'); dots.className = 'dots';
    if (kids.length <= 10) kids.forEach(function(){ dots.appendChild(document.createElement('i')); });
    var n = document.createElement('span'); n.className = 'n';
    nav.appendChild(dots); nav.appendChild(n);
    track.parentNode.insertBefore(nav, track.nextSibling);
    var set = function(i){
      Array.prototype.forEach.call(dots.children, function(d, k){ d.classList.toggle('on', k === i); });
      n.innerHTML = (i + 1) + ' <b>/ ' + kids.length + '</b>';
    };
    set(0);
    var raf = null;
    track.addEventListener('scroll', function(){
      if (raf) return;
      raf = requestAnimationFrame(function(){
        raf = null;
        var x = track.scrollLeft + track.clientWidth * 0.2, best = 0;
        kids.forEach(function(c, k){ if (c.offsetLeft - track.offsetLeft <= x) best = k; });
        if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 2) best = kids.length - 1;
        set(best);
      });
    }, { passive: true });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.swipe'), trackNav);

  /* figures count from zero to what they are, keeping their own formatting */
  function countUp(el){
    if (reduce || el.dataset.counted) return;
    el.dataset.counted = '1';
    var raw = el.textContent, m = raw.match(/[\d][\d,\.]*/);
    if (!m) return;
    var num = parseFloat(m[0].replace(/,/g, '')), dec = (m[0].split('.')[1] || '').length;
    if (!isFinite(num)) return;
    // a year is a name, not a quantity: 2018 does not count up from zero
    if (dec === 0 && m[0].indexOf(',') < 0 && num >= 1900 && num <= 2100) return;
    var pre = raw.slice(0, m.index), post = raw.slice(m.index + m[0].length), t0 = null, dur = 900;
    var fmt = function(v){ var s = v.toFixed(dec); return m[0].indexOf(',') > -1 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : s; };
    var step = function(t){
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = pre + fmt(num * e) + post;
      if (k < 1) requestAnimationFrame(step); else el.textContent = raw;
    };
    requestAnimationFrame(step);
  }

  /* the hero plate drifts a few pixels against the scroll */
  var plate = document.querySelector('.hero-plate');
  if (plate && !reduce) {
    var tick = null;
    var drift = function(){
      tick = null;
      var y = window.scrollY;
      if (y > 900) return;
      plate.style.transform = 'translateY(' + (y * 0.06).toFixed(1) + 'px)';
    };
    window.addEventListener('scroll', function(){ if (!tick) tick = requestAnimationFrame(drift); }, { passive: true });
  }
})();
