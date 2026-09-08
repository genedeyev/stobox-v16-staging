
(function(){
  var back = document.getElementById('book');
  if (!back) return;
  var last = null;
  function open(e){
    window.setTimeout(function(){ var f = back.querySelector('input,textarea,select'); if (f) f.focus(); }, 60);
    if (e) e.preventDefault();
    last = document.activeElement;
    back.hidden = false;
    requestAnimationFrame(function(){ back.classList.add('on'); });
    var f = back.querySelector('input'); if (f) f.focus();
  }
  function close(){
    back.classList.remove('on');
    window.setTimeout(function(){ back.hidden = true; }, 200);
    if (last) last.focus();
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-book], a[href="#book"]'),
    function(a){ a.addEventListener('click', open); });
  back.querySelector('.bk-x').addEventListener('click', close);
  back.addEventListener('click', function(e){ if (e.target === back) close(); });
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape' && !back.hidden) close();
  });
  /* arriving with #book opens the sheet; a score in the query is written into the message */
  var q = new URLSearchParams(location.search), sc = q.get('score');
  if (sc && /^\d{1,3}$/.test(sc)) {
    var msg = back.querySelector('textarea, [name="message"]');
    if (msg && !msg.value) msg.value = 'My AXIS readiness score is ' + sc + '. I would like to talk it through.';
  }
  if (location.hash === '#book') { window.setTimeout(open, 120); }
})();
