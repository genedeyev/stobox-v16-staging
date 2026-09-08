
(function(){
  var D = {"routes":{"us|accredited":{"j":"us","x":"Reg D 506(c)","note":"General solicitation is permitted, so you can market the raise publicly, and every investor has to be verified as accredited rather than self-certifying."},"us|institutional":{"j":"us","x":"Reg D 506(b)","note":"No general solicitation, which means no public marketing, in exchange for a lighter verification burden with investors you already know."},"us|retail":{"j":"us","x":"Reg A+ or Reg CF","note":"Reaching the public in the US means a qualified offering. That is a filing and a review, not an exemption you simply rely on."},"eu|accredited":{"j":"eu","x":"The qualified-investor exemption","note":"A placement to qualified investors avoids a prospectus. Which national rules apply on top of that is the part people underestimate."},"eu|institutional":{"j":"eu","x":"The qualified-investor exemption","note":""},"eu|retail":{"j":"eu","x":"An approved prospectus, or a small-offer exemption","note":"Some member states allow a short information sheet under a national ceiling. Germany's is one of the more usable."},"uk|accredited":{"j":"uk","x":"The high-net-worth and sophisticated-investor exemptions","note":"The UK rebuilt this in 2026. The financial promotion rules bind whoever approves the communication, which is often not the issuer."},"uk|institutional":{"j":"uk","x":"The professional-investor exemption","note":""},"uk|retail":{"j":"uk","x":"A Public Offer Platform","note":"The route that replaced the prospectus for retail raises, live since January 2026."},"asia|accredited":{"j":"asia","x":"The accredited-investor exemption","note":"Singapore and Hong Kong both have one, and they are not the same exemption. The guide sets out which applies to you."},"asia|institutional":{"j":"asia","x":"The institutional-investor exemption","note":""},"asia|retail":{"j":"asia","x":"A prospectus, or an authorised platform","note":""},"gulf|accredited":{"j":"gulf","x":"A professional-investor placement","note":""},"gulf|institutional":{"j":"gulf","x":"A professional-investor placement","note":""},"gulf|retail":{"j":"gulf","x":"A regulated offer under the local regime","note":""},"mixed|accredited":{"j":"offshore","x":"A multi-jurisdiction structure","note":"Investors in more than one place usually means an issuing entity in a neutral domicile and a separate exemption in each market you actually sell into."},"mixed|institutional":{"j":"offshore","x":"A multi-jurisdiction structure","note":""},"mixed|retail":{"j":"offshore","x":"A multi-jurisdiction structure","note":"Selling to the public in more than one country is the hardest version of this. Expect a filing in each."}},"jur":{"us":{"name":"United States","href":"/guides/us"},"eu":{"name":"European Union","href":"/guides/eu"},"uk":{"name":"United Kingdom","href":"/guides/uk"},"asia":{"name":"Singapore or Hong Kong","href":"/guides/singapore"},"gulf":{"name":"The UAE","href":"/guides/uae"},"offshore":{"name":"BVI or Cayman","href":"/guides/bvi"}},"size":{"small":{"name":"Under $1M","note":"At this size the structuring cost decides whether the raise is worth doing at all. An SPV over the asset is usually cheaper than reshaping the company."},"mid":{"name":"$1M to $10M","note":"The size most of this market is built for. The exemption matters more than the jurisdiction here."},"large":{"name":"$10M to $50M","note":"Large enough that a broker-dealer route and a transfer agent stop being optional and start being the cheapest way to do it."},"xl":{"name":"Over $50M","note":"At this size you will be asked for an audited record and a governance story before anyone looks at the asset."}},"asset":{"realestate":{"name":"Real estate","href":"/guides/how-to-tokenize-real-estate"},"fund":{"name":"A fund or LP interests","href":"/learn/how-to-tokenize-lp-interests"},"credit":{"name":"Private credit","href":"/learn/how-to-tokenize-private-credit"},"equity":{"name":"Company equity","href":"/guides/how-to-tokenize-company-equity"},"commodity":{"name":"Commodities or reserves","href":"/industries/mining"},"other":{"name":"Something else","href":"/tokenization"}}};
  var a = {};
  var out = document.getElementById('out'), wait = document.getElementById('wait');
  Array.prototype.forEach.call(document.querySelectorAll('.opts button'), function(b){
    b.addEventListener('click', function(){
      var q = b.getAttribute('data-q');
      a[q] = b.getAttribute('data-v');
      Array.prototype.forEach.call(
        document.querySelectorAll('.opts button[data-q="' + q + '"]'), function(x){
          x.setAttribute('aria-pressed', x === b ? 'true' : 'false');
        });
      render();
    });
  });
  function render(){
    if (!a.where || !a.who) { return; }
    var r = D.routes[a.where + '|' + a.who];
    if (!r) { return; }
    var j = D.jur[r.j];
    document.getElementById('out-h').textContent = j.name + ' \u00b7 ' + r.x;
    document.getElementById('out-p').textContent = r.note || '';
    document.getElementById('out-p').hidden = !r.note;
    var s = a.size ? D.size[a.size] : null;
    var sz = document.getElementById('out-size');
    sz.textContent = s ? s.note : '';
    sz.hidden = !s;
    var go = document.getElementById('out-go');
    go.innerHTML = '';
    var link = document.createElement('a');
    link.className = 'btn btn-accent btn-lg';
    link.href = j.href;
    link.textContent = 'Read the ' + j.name + ' guide';
    go.appendChild(link);
    if (a.asset && D.asset[a.asset]) {
      var l2 = document.createElement('a');
      l2.className = 'btn btn-ghost btn-lg';
      l2.href = D.asset[a.asset].href;
      l2.textContent = D.asset[a.asset].name;
      go.appendChild(l2);
    }
    out.hidden = false;
    wait.hidden = true;
  }
})();
