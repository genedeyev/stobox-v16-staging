

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

/* ============================================================
   The AXIS assessment. Arithmetic transcribed from the engine:
   axis = mean(answered weights) * 10, overall = mean of axes present.
   A skipped question is unanswered, never a zero.
   ============================================================ */
(function(){
  var QS = JSON.parse(document.getElementById('axis-25').textContent);
  var AXES = {"legal":"Legal and Compliance","asset":"Asset Quality","tech":"Technology and Protocol","transparency":"Transparency","liquidity":"Liquidity and Markets","governance":"Governance","risk":"Risk Mitigation"};
  var ORDER = Object.keys(AXES);
  var ROUTES = {"legal":"Whether the entity, the exemption and the investor rules are settled, or still a plan.","asset":"Whether the thing itself is worth what you say, and whether anyone independent has checked.","tech":"Whether the contract and the custody arrangement would survive somebody looking at them properly.","transparency":"Whether your numbers can be produced on demand, in a form somebody outside the company can read.","liquidity":"Whether there is a route to a buyer, or only a hope of one.","governance":"Whether the rules that bind the asset are written down and enforceable by someone other than you.","risk":"What happens when something goes wrong, decided before it does."};
  var KEY = 'stobox.axis25.bank-2026.09';
  var REGISTER = 'https://app.stobox.io/register';
  var READIMG = '/assets/mega/readiness-read.webp';
  var app = document.getElementById('axapp');
  if (!app) return;
  var panes = document.getElementById('axpanes');
  var stepEl = document.getElementById('axstep');
  var countEl = document.getElementById('axcount');
  var backEl = document.getElementById('axback');
  var nextEl = document.getElementById('axnext');
  var hintEl = document.getElementById('axhint');
  backEl.addEventListener('click', function(){ advancing = false; step7(step - 1); });
  nextEl.addEventListener('click', function(){ advancing = false; step7(step + 1); });
  var progEl = document.getElementById('axprog');
  var bodyEl = document.getElementById('axbody');
  var answers = {}, step = 0, lastFocus = null, advancing = false;

  try { var raw = localStorage.getItem(KEY); if (raw) answers = JSON.parse(raw) || {}; }
  catch (e) { answers = {}; }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(answers)); } catch (e) {} }

  function weightOf(q, v){
    if (v === undefined || v === null || v === 'skip') return null;
    var idx = Array.isArray(v) ? v : [v];
    idx = idx.filter(function(i){ return typeof i === 'number' && i >= 0 && i < q.w.length; });
    if (!idx.length) return null;
    var sum = 0; idx.forEach(function(i){ sum += q.w[i]; });
    return sum / idx.length;
  }
  function computeScore(){
    var byAxis = {}, answered = 0;
    QS.forEach(function(q){
      var w = weightOf(q, answers[q.k]);
      if (w === null) return;
      (byAxis[q.a] = byAxis[q.a] || []).push(w);
      answered += 1;
    });
    var dims = {};
    ORDER.forEach(function(ax){
      if (byAxis[ax]) {
        var a = byAxis[ax], sum = 0;
        a.forEach(function(x){ sum += x; });
        dims[ax] = Math.round((sum / a.length) * 10);
      }
    });
    var present = ORDER.filter(function(ax){ return dims[ax] !== undefined; });
    var overall = 0;
    if (present.length) {
      var t = 0; present.forEach(function(ax){ t += dims[ax]; });
      overall = Math.round(t / present.length);
    }
    return { overall: overall, dims: dims, present: present, answered: answered,
      band: overall >= 70 ? 'High Readiness' : overall >= 50 ? 'Moderate Readiness' : 'Early Stage' };
  }
  function answeredCount(){
    var n = 0;
    QS.forEach(function(q){ if (weightOf(q, answers[q.k]) !== null) n += 1; });
    return n;
  }
  /* every question on the axis has been dealt with: answered, or marked Not sure yet */
  function axisTouched(ax){
    return QS.filter(function(q){ return q.a === ax; })
             .every(function(q){ return answers[q.k] !== undefined; });
  }
  function axisComplete(ax){
    return QS.filter(function(q){ return q.a === ax; })
             .every(function(q){ return weightOf(q, answers[q.k]) !== null; });
  }

  var BAND_SAY = {
    'High Readiness': 'The structure holds. What is left is packaging and venue fit, which is a narrower problem than the one you started with.',
    'Moderate Readiness': 'Real structure, specific gaps. Usually one or two axes carry the shortfall while the rest hold, which makes the work a list rather than a rebuild.',
    'Early Stage': 'The groundwork has not been done yet, which is a statement about paperwork and not about the business. Most companies start here.'
  };
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  function questionHtml(q, n){
    var v = answers[q.k], multi = q.m;
    var opts = q.o.map(function(text, i){
      var on = multi ? (Array.isArray(v) && v.indexOf(i) > -1) : v === i;
      return '<button class="opt' + (multi ? ' multi' : '') + '" type="button" aria-pressed="' +
        (on ? 'true' : 'false') + '" data-k="' + q.k + '" data-i="' + i +
        '"><i aria-hidden="true"></i><span>' + esc(text) + '</span>' +
        '<span class="w" title="published weight">' + q.w[i] + '</span></button>';
    }).join('');
    opts += '<button class="opt opt-unsure" type="button" aria-pressed="' +
      (v === 'skip' ? 'true' : 'false') + '" data-k="' + q.k + '" data-i="skip">' +
      '<i aria-hidden="true"></i><span>Not sure yet. This one is left unanswered.</span></button>';
    var picked = weightOf(q, answers[q.k]) !== null;
    return '<div class="q' + (picked ? ' done' : '') + '" role="group" aria-labelledby="lbl-' + q.k + '">' +
      '<p class="q-n">' + n + '<u>of 25</u></p>' +
      '<div><p class="q-p" id="lbl-' + q.k + '">' + esc(q.p) + '</p>' +
      (q.n ? '<p class="q-note">' + esc(q.n) + '</p>' : '') +
      '<div class="q-opts">' + opts + '</div></div></div>';
  }

  function build(){
    var html = '', n = 0;
    ORDER.forEach(function(ax, i){
      var qs = QS.filter(function(q){ return q.a === ax; });
      var first = n + 1;
      var body = '';
      qs.forEach(function(q){ n += 1; body += questionHtml(q, ('0' + n).slice(-2)); });
      html += '<section class="ax-pane" data-step="' + i + '" hidden>' +
        '<div class="ax-lede"><div class="rail"><p class="lab">Axis ' + (i + 1) + ' of 7</p>' +
        '<p class="range">Questions ' + first + ' to ' + n + ' of 25</p></div>' +
        '<div><h2>' + esc(AXES[ax]) + '</h2><p>' + esc(ROUTES[ax]) + '</p></div></div>' +
        '<div class="qs">' + body + '</div></section>';
    });
    html += '<section class="ax-pane" data-step="7" hidden id="axres"></section>';
    panes.innerHTML = html;
    panes.addEventListener('click', onClick);
  }

  function onClick(e){
    var go = e.target.closest('[data-go]');
    if (go) { advancing = false; return step7(parseInt(go.getAttribute('data-go'), 10)); }
    var b = e.target.closest('.opt');
    if (!b) return;
    var k = b.getAttribute('data-k'), raw = b.getAttribute('data-i');
    var q = QS.filter(function(x){ return x.k === k; })[0];
    var wasComplete = axisComplete(q.a);
    if (raw === 'skip') { answers[k] = 'skip'; }
    else if (q.m) {
      var i = parseInt(raw, 10);
      var cur = Array.isArray(answers[k]) ? answers[k] : [];
      cur = cur.indexOf(i) > -1 ? cur.filter(function(x){ return x !== i; }) : cur.concat([i]);
      answers[k] = cur.length ? cur : undefined;
      if (answers[k] === undefined) delete answers[k];
    } else { answers[k] = parseInt(raw, 10); }
    save();
    /* repaint just this question, so the tick is visible before anything moves */
    var group = b.closest('.q');
    Array.prototype.forEach.call(group.querySelectorAll('.opt'), function(x){
      var xi = x.getAttribute('data-i'), v = answers[k], on;
      if (xi === 'skip') on = v === 'skip';
      else if (q.m) on = Array.isArray(v) && v.indexOf(parseInt(xi, 10)) > -1;
      else on = v === parseInt(xi, 10);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    group.classList.toggle('done', weightOf(q, answers[k]) !== null);
    setCount();
    /* auto-advance, with the three guards: only when the axis BECOMES complete,
       never on Not sure yet, and a multi-select only once something is ticked */
    if (!wasComplete && axisComplete(q.a) && raw !== 'skip' && step < 7 && !advancing) {
      advancing = true;
      setTimeout(function(){ if (advancing) { advancing = false; step7(step + 1); } }, 420);
    }
  }

  function setCount(){
    var done = answeredCount();
    stepEl.textContent = 'Axis ' + Math.min(step + 1, 7) + ' of 7 · ' + done +
      ' of 25 answered';
    progEl.style.transform = 'scaleX(' + (done / QS.length) + ')';
    var first = 1, last = 0;
    ORDER.forEach(function(ax, i){
      var c = QS.filter(function(q){ return q.a === ax; }).length;
      if (i < step) first += c;
      if (i <= step) last += c;
    });
    countEl.textContent = step === 7 ? (done + ' of 25 answered')
      : ('Questions ' + first + ' to ' + last + ' of 25');
    backEl.hidden = step === 0;
    nextEl.hidden = step === 7;
    nextEl.textContent = step === 6 ? 'See my score' : 'Next axis';
    /* Next stays locked until every question on this axis has an answer or an explicit Not sure yet */
    var ok = step === 7 || axisTouched(ORDER[step]);
    nextEl.disabled = !ok;
    hintEl.hidden = ok;
  }

  function step7(i){
    step = Math.max(0, Math.min(7, i));
    Array.prototype.forEach.call(panes.children, function(sec){
      sec.hidden = parseInt(sec.getAttribute('data-step'), 10) !== step;
    });
    if (step === 7) renderResult();
    setCount();
    bodyEl.scrollTop = 0;
    var tier = document.querySelector('#axres .res-tier');
    if (step === 7 && tier) { tier.setAttribute('tabindex', '-1'); tier.focus(); } else bodyEl.focus();
  }

  function renderResult(){
    var r = computeScore();
    var res = ORDER.map(function(ax){
      return { key: ax, name: AXES[ax],
               score: r.dims[ax] === undefined ? null : r.dims[ax] };
    });
    var present = res.filter(function(a){ return a.score !== null; });
    var ranked = present.slice().sort(function(x, y){ return x.score - y.score; });
    var worst = ranked.slice(0, 2).map(function(a){ return a.key; });
    var tierMeans = r.overall >= 70
      ? 'High Readiness. You are ready to take this to a licensed firm and expect questions ' +
        'about detail rather than about structure.'
      : (r.overall >= 50
        ? 'Moderate Readiness. Fix the two axes in cobalt below and the number moves more than ' +
          'anything else you could do.'
        : 'Early Stage. Start with the structure rather than the token. The two axes in cobalt ' +
          'are where to begin.');
    var worstLine = ranked.length >= 2
      ? 'The two in cobalt are your weakest: ' + esc(ranked[0].name) + ' and ' +
        esc(ranked[1].name) + '. They carry most of the deficit, so they are where a change ' +
        'moves the number.'
      : 'Answer at least two axes and the weakest two are marked here.';
    var bars = res.map(function(a){
      var cls = a.score === null ? ' none' : (worst.indexOf(a.key) > -1 ? ' weak' : '');
      return '<div class="bar' + cls + '"><div class="top"><span>' + esc(a.name) + '</span><b>' +
        (a.score === null ? 'not answered' : a.score) + '</b></div>' +
        '<u><i style="width:' + (a.score === null ? 0 : a.score) + '%"></i></u></div>';
    }).join('');
    /* the working is per axis, which is how the score is actually built */
    var rows = present.map(function(a){
      var ws = QS.filter(function(q){ return q.a === a.key; })
                 .map(function(q){ return weightOf(q, answers[q.k]); })
                 .filter(function(w){ return w !== null; })
                 .map(function(w){ return Math.round(w * 10) / 10; });
      var sum = Math.round(ws.reduce(function(t, w){ return t + w; }, 0) * 10) / 10;
      return '<div class="wline"><span>' + esc(a.name) + '</span><em>' + ws.join(' + ') +
        ' = ' + sum + ', over ' + ws.length + '</em><b>' + a.score + '</b></div>';
    }).join('');
    var overallWorking = present.length
      ? present.map(function(a){ return a.score; }).join(' + ') + ' = ' +
        present.reduce(function(t, a){ return t + a.score; }, 0) + '\n÷ ' +
        present.length + ' = ' + r.overall + ', ' + r.band
      : 'Answer a question and the working appears here.';

    document.getElementById('axres').innerHTML =
      '<div class="res-head">' +
        '<div><p class="lab">Your result &middot; bank-2026.09</p>' +
        '<h2 class="res-tier">' + esc(r.band) + '</h2>' +
        '<div class="res-figs">' +
          '<div class="res-score"><b>' + r.overall + '</b><span>Readiness, out of 100</span></div>' +
          '<div class="res-means"><p class="answered">' + r.answered +
          ' of 25 questions answered</p><p class="says">' + esc(tierMeans) + '</p></div>' +
        '</div>' +
        '<p class="res-legal">Self-reported and unverified. This does not replace diligence, it ' +
        'is not an AXIS asset rating, and listing decisions rest solely with the venue.</p></div>' +
        '<div class="res-axes"><p class="lab">Seven axes</p><div class="bars">' + bars + '</div>' +
        '<p class="res-worst">' + worstLine + '</p></div>' +
      '</div>' +
      '<details class="res-math"><summary>Check the numbers yourself</summary>' +
      '<div class="in-math"><p>Your own numbers, in the order they were used. Every weight below ' +
      'is the published weight of the option you picked.</p>' +
      '<div class="wlines">' + rows + '</div>' +
      '<div class="res-sum">' + esc(overallWorking) + '</div></div></details>' +
      '<div class="res-gate">' +
        '<div><h3>Save this score to a Stobox account</h3>' +
        '<p>Registering saves this AXIS score to your account, with the written report and the ' +
        'version of the bank it was scored under. Come back in three months, run it again and see ' +
        'what moved. No email typed here &ndash; you register once and the score follows you.</p>' +
        '<figure><img src="' + READIMG + '" alt="" loading="lazy" decoding="async"></figure>' +
        '<div class="hero-acts"><a class="btn btn-blue btn-lg" href="' + REGISTER +
        '">Register with Stobox</a>' +
        '<a class="tlink" href="/stobox-v16-staging/contact?score=' + (r && typeof r.overall === 'number' ? Math.round(r.overall) : '') + '#book">Bring this score to a call <span aria-hidden="true">&rarr;</span></a></div>' +
        '<button class="res-check" type="button" id="ax-mgr" aria-pressed="false">' +
        '<i aria-hidden="true"></i><span>Have a Stobox manager look at this score and get in ' +
        'touch.</span></button>' +
        '<p class="fine">Leave it unticked and nobody reads your score. Registering alone stores ' +
        'it against your account and puts the report there &ndash; a manager sees it only if you ' +
        'ask for that here.</p>' +
        '<p class="fine">Nothing has left your browser so far. Your answers are in this browser ' +
        'only, under the key stobox.axis25.v1, and you can close the tab and come back to them.</p>' +
        '</div>' +
        '<div><h3>Change an answer</h3>' +
        '<p>If one of those options was nearly right, go back and pick the other one. The score ' +
        'recalculates and you can watch how much it moves, which is the point of publishing the ' +
        'weights.</p>' +
        '<div class="res-acts">' +
        '<button class="btn btn-quiet btn-sm" type="button" data-go="0">Change an answer</button>' +
        '<button class="res-clear" type="button" id="ax-clear">Clear everything and start ' +
        'again</button></div></div>' +
      '</div>';

    var mgr = document.getElementById('ax-mgr');
    if (mgr) mgr.addEventListener('click', function(){
      var on = mgr.getAttribute('aria-pressed') !== 'true';
      mgr.setAttribute('aria-pressed', on ? 'true' : 'false');
      mgr.querySelector('i').textContent = on ? '✓' : '';
    });
    var clr = document.getElementById('ax-clear');
    if (clr) clr.addEventListener('click', function(){
      answers = {};
      try { localStorage.removeItem(KEY); } catch (e) {}
      panes.innerHTML = ''; build(); step7(0);
    });
    requestAnimationFrame(function(){
      var bs = document.querySelectorAll('#axres .bar');
      Array.prototype.forEach.call(bs, function(el, i){
        setTimeout(function(){ el.classList.add('in'); }, 40 * i);
      });
    });
  }

  var behind = ['#main', '.site-head', '.site-foot', '#notice', '.skip'];
  function setInert(on){
    behind.forEach(function(sel){
      var el = document.querySelector(sel);
      if (!el) return;
      if (on) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  }
  function open(){
    lastFocus = document.activeElement;
    if (!panes.children.length) build();
    app.setAttribute('data-open', 'true');
    document.documentElement.classList.add('axl');
    document.body.classList.add('axl');
    setInert(true);
    step7(step);
  }
  function close(){
    app.setAttribute('data-open', 'false');
    document.documentElement.classList.remove('axl');
    document.body.classList.remove('axl');
    setInert(false);
    if (lastFocus) lastFocus.focus();
  }
  document.getElementById('axclose').addEventListener('click', close);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && app.getAttribute('data-open') === 'true') close();
  });
  var starts = Array.prototype.slice.call(document.querySelectorAll('[data-start]'));
  starts.forEach(function(a){
    a.addEventListener('click', function(){ open(); });
  });
  if (answeredCount() > 0) starts.forEach(function(a){
    a.textContent = 'Continue the score';
  });
})();
(function(){
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
