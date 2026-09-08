
(function(){
  var f=document.getElementById('q'), out=document.getElementById('sres'),
      cnt=document.getElementById('scount'), none=document.getElementById('snone'),
      rows=null, ready=false;
  function esc(s){return s.replace(/[&<>"]/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function mark(s,terms){
    var h=esc(s);
    terms.forEach(function(t){
      if(t.length<2)return;
      h=h.replace(new RegExp('('+t+')','ig'),'<mark>$1</mark>');
    });
    return h;
  }
  function run(){
    if(!ready)return;
    var q=f.value.trim().toLowerCase();
    if(q.length<2){out.innerHTML='';cnt.textContent='';none.hidden=true;return;}
    var terms=q.split(/\s+/).map(function(w){return w.replace(/[^a-z0-9]+/g,'');})
                            .filter(function(w){return w.length>0;});
    if(!terms.length){out.innerHTML='';cnt.textContent='';return;}
    var hits=[];
    for(var i=0;i<rows.length;i++){
      var r=rows[i], t=r.t.toLowerCase(), d=r.d.toLowerCase(), s=0;
      for(var j=0;j<terms.length;j++){
        var w=terms[j];
        var bw=new RegExp('\\b'+w);
        if(bw.test(t)){s+= t.indexOf(w)===0 ? 12 : 8;}
        else if(bw.test(d)){s+=3;}
        else if(r.u.indexOf(w)>-1){s+=2;}
        else if(w.length>4 && (t.indexOf(w)>-1 || d.indexOf(w)>-1)){s+=1;}
        else {s=-99;break;}
      }
      if(s>0)hits.push([s,r]);
    }
    hits.sort(function(a,b){return b[0]-a[0];});
    cnt.textContent=hits.length+(hits.length===1?' result':' results');
    none.hidden=hits.length>0;
    out.innerHTML=hits.slice(0,60).map(function(h){
      var r=h[1];
      return '<a href="'+r.u+'"><span class="k">'+esc(r.k)+'</span><h3>'+
             mark(r.t,terms)+'</h3><p>'+mark(r.d.slice(0,180),terms)+'</p></a>';
    }).join('');
  }
  fetch('/search-index.json').then(function(r){return r.json();}).then(function(d){
    rows=d;ready=true;run();
  });
  f.addEventListener('input',run);
  var p=new URLSearchParams(location.search).get('q');
  if(p){f.value=p;}
  f.focus();
})();
