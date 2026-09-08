
(function(){
  // 578 KB that only a visitor who writes to us ever needs, so it is fetched on the
  // first touch of a form rather than on load - with a timer behind it, because a
  // visitor who arrives mid-scroll and submits fast must still have a widget waiting.
  var asked = false;
  function loadTurnstile(){
    if (asked) return;
    asked = true;
    // One load per page: a second one re-scans containers that already hold a widget.
    if (document.querySelector('script[src*="turnstile/v0/api.js"]')) return;
    var s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true; s.defer = true;
    document.head.appendChild(s);
  }
  document.addEventListener('focusin', function(e){
    if (e.target && e.target.form) loadTurnstile();
  }, true);
  document.addEventListener('pointerdown', function(e){
    if (e.target && e.target.closest && e.target.closest('form')) loadTurnstile();
  }, true);
  setTimeout(loadTurnstile, 4000);
  // A token minted on load is stale by the time a visitor finishes typing, so each form
  // takes a fresh one on submit and sends that.
  Array.prototype.forEach.call(document.querySelectorAll('form'), function(form){
    var box = form.querySelector('.cf-turnstile');
    if (!box) return;
    var sending = false;
    form.addEventListener('submit', function(e){
      if (sending) return;
      if (!(window.turnstile && window.turnstile.getResponse)) {
        // the script is still in flight: hold the submit until it lands
        loadTurnstile();
        e.preventDefault();
        var n = 0;
        var hold = setInterval(function(){
          if (window.turnstile && window.turnstile.getResponse) {
            clearInterval(hold);
            form.dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}));
          } else if (++n > 40) {                 // ten seconds: send it and let the
            clearInterval(hold); sending = true; // server decide
            form.submit();
          }
        }, 250);
        return;
      }
      var t = window.turnstile.getResponse(box);
      if (t) return;                       // the widget already has a live token
      e.preventDefault();
      try {
        window.turnstile.execute(box, { action: form.getAttribute('data-cf') || 'submit' });
      } catch (err) { /* the widget will render on its own */ }
      var tries = 0;
      var wait = setInterval(function(){
        var got = window.turnstile.getResponse(box);
        if (got || ++tries > 40) {
          clearInterval(wait);
          sending = true;
          form.submit();
        }
      }, 250);
    });
  });
})();
