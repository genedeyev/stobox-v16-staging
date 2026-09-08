
(function(){
  var btns = Array.prototype.slice.call(document.querySelectorAll('.btags button'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('.blist a'));
  var lead = document.querySelector('.blead');
  var list = document.getElementById('blist');
  var more = document.getElementById('bmore');
  var count = document.getElementById('bcount');
  /* the whole library is in the page. Show more stops hiding the tail, and any filter
     opens it too, because a section can have all of its posts past the fold */
  function openAll(){ if (list) list.classList.add('open'); if (more) more.hidden = true; }
  if (more) more.addEventListener('click', openAll);
  var live = document.getElementById('live');
  if (!btns.length) return;
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      var t = b.getAttribute('data-t'), n = 0;
      cards.forEach(function(c){
        var on = t === 'all' || (' ' + c.getAttribute('data-tags') + ' ').indexOf(' ' + t + ' ') > -1;
        c.hidden = !on; if (on) n += 1;
      });
      openAll();
      // the lead is the newest post, which is only the right answer for the whole set
      if (lead) lead.hidden = t !== 'all';
      btns.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      count.textContent = t === 'all' ? ('Showing all ' + (n + 1))
        : ('Showing ' + n + ' in ' + b.childNodes[0].textContent.trim());
      live.textContent = count.textContent;
    });
  });
})();
