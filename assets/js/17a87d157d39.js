
(function(){
  var ITEMS = [{"c":"Corporate","t":"Certificate of incorporation","k":["incorporat","certificate of formation","articles of association","memorandum of association"]},{"c":"Corporate","t":"Current cap table","k":["cap table","capitalization table","shareholder register","share register","ownership table"]},{"c":"Corporate","t":"Register of directors and officers","k":["register of directors","board of directors","directors and officers","officer list"]},{"c":"Corporate","t":"Shareholder agreement","k":["shareholder agreement","shareholders agreement","sha","subscription agreement"]},{"c":"Corporate","t":"Group structure chart","k":["group structure","org chart","structure chart","subsidiar","holding company"]},{"c":"Corporate","t":"Beneficial ownership","k":["beneficial owner","ubo","ultimate beneficial"]},{"c":"Corporate","t":"Board minutes authorising the raise","k":["board minute","board resolution","written resolution","consent of the board"]},{"c":"Corporate","t":"Good standing","k":["good standing","certificate of good standing","tax clearance"]},{"c":"Asset","t":"What the asset actually is","k":["asset description","the asset is","property description","underlying asset"]},{"c":"Asset","t":"Title or ownership evidence","k":["title deed","land registry","certificate of title","proof of ownership","bill of sale"]},{"c":"Asset","t":"Third-party valuation","k":["valuation","appraisal","appraised","valuer","fair market value"]},{"c":"Asset","t":"Encumbrances and liens","k":["lien","encumbrance","mortgage","charge over","security interest","pledge"]},{"c":"Asset","t":"Insurance","k":["insurance","insured","policy number","coverage limit"]},{"c":"Asset","t":"Custody or physical control","k":["custody","custodian","vault","storage","safekeeping"]},{"c":"Asset","t":"Operating or management agreement","k":["management agreement","operating agreement","property management","service agreement"]},{"c":"Asset","t":"Permits and licences on the asset","k":["permit","licence","license","concession","zoning","planning permission"]},{"c":"Financials","t":"Historical statements","k":["balance sheet","income statement","profit and loss","cash flow statement","financial statements"]},{"c":"Financials","t":"Audited or reviewed","k":["audited","auditor","independent review","audit report"]},{"c":"Financials","t":"Revenue and its sources","k":["revenue","turnover","gross income","sales for the"]},{"c":"Financials","t":"Debt and obligations","k":["loan","debt","note payable","credit facility","outstanding obligations"]},{"c":"Financials","t":"Projections and the assumptions behind them","k":["projection","forecast","pro forma","assumptions"]},{"c":"Financials","t":"Bank confirmation","k":["bank statement","bank confirmation","account balance","proof of funds"]},{"c":"Financials","t":"Tax filings","k":["tax return","tax filing","vat","corporate tax"]},{"c":"Legal","t":"Counsel of record","k":["counsel","law firm","legal adviser","attorney","solicitor"]},{"c":"Legal","t":"Regulatory status","k":["regulated","licence from","authorised by","registration number","regulator"]},{"c":"Legal","t":"Litigation and disputes","k":["litigation","dispute","claim against","proceedings","arbitration"]},{"c":"Legal","t":"Material contracts","k":["material contract","key contract","offtake","lease agreement","supply agreement"]},{"c":"Legal","t":"Intellectual property","k":["trademark","patent","intellectual property","copyright"]},{"c":"Legal","t":"Sanctions and AML position","k":["sanctions","aml","anti-money laundering","kyc policy","screening"]},{"c":"Legal","t":"Jurisdiction of the issuing entity","k":["jurisdiction","incorporated in","domicile","registered office"]},{"c":"Offering","t":"How much and at what price","k":["raise","offering size","price per","valuation cap","subscription price"]},{"c":"Offering","t":"The exemption relied on","k":["reg d","reg s","reg a","reg cf","506(c)","506(b)","prospectus exemption","private placement"]},{"c":"Offering","t":"Use of proceeds","k":["use of proceeds","proceeds will","funds will be used"]},{"c":"Offering","t":"Investor eligibility","k":["accredited","qualified investor","professional investor","eligible investor"]},{"c":"Offering","t":"Transfer restrictions","k":["transfer restriction","lock-up","lockup","resale restriction","restricted securities"]},{"c":"Offering","t":"Risk factors","k":["risk factor","risks","material risk"]}];
  var CATS = ["Corporate", "Asset", "Financials", "Legal", "Offering"];
  var box = document.getElementById('paste'), out = document.getElementById('out');
  var count = document.getElementById('count'), t;
  box.addEventListener('input', function(){
    count.textContent = box.value.length.toLocaleString() + ' characters \u00b7 200 minimum';
    clearTimeout(t); t = setTimeout(run, 260);
  });
  function run(){
    var v = box.value.toLowerCase();
    if (v.length < 200) { out.hidden = true; return; }
    var found = {}, missing = [];
    CATS.forEach(function(c){ found[c] = 0; });
    var totals = {};
    CATS.forEach(function(c){ totals[c] = 0; });
    ITEMS.forEach(function(it){
      totals[it.c] += 1;
      var hit = it.k.some(function(k){ return v.indexOf(k) > -1; });
      if (hit) { found[it.c] += 1; } else { missing.push(it); }
    });
    var have = ITEMS.length - missing.length;
    document.getElementById('out-h').textContent =
      have + ' of ' + ITEMS.length + ' referred to. ' + missing.length + ' not mentioned.';
    CATS.forEach(function(c){
      document.querySelector('[data-sc="' + c + '"]').textContent =
        found[c] + '/' + totals[c];
      document.querySelector('[data-bar="' + c + '"]').style.width =
        Math.round(found[c] / totals[c] * 100) + '%';
    });
    var m = document.getElementById('miss');
    m.innerHTML = '';
    missing.forEach(function(it){
      var row = document.createElement('div');
      var c = document.createElement('span'); c.className = 'c'; c.textContent = it.c;
      var s = document.createElement('span'); s.className = 't'; s.textContent = it.t;
      row.appendChild(c); row.appendChild(s); m.appendChild(row);
    });
    out.hidden = false;
  }
})();
