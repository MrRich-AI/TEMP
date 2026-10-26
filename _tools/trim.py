#!/usr/bin/env python3
"""Make a TEMP copy of a source build that shows only the named slides, in the given order.

usage: trim.py SOURCE.html OUT.html "Slide title 1" "Slide title 2" ...

The copy is the source file unchanged except for one small script, placed just before the first
script after the slides: slides not on the list (and any the build adds while loading, e.g.
"Words from today") are set aside in a hidden box before the build's engine collects its slides,
and the kept slides are put in the order given. Titles are the build's data-title / data-t.
"""
import json, re, sys

src, out, titles = sys.argv[1], sys.argv[2], sys.argv[3:]
html = open(src, encoding='utf-8').read()
last = max(m.start() for m in re.finditer(r'<section class="slide', html))
pos = html.index('<script', last)
js = r"""<script>
/* ===== TEMP cover deck copy: only these slides, in this order (see TEMP/_tools/trim.py) ===== */
(function(){
  var KEEP = %s;
  var park = document.createElement('div'); park.id = 'tempParked'; park.style.display = 'none';
  document.body.appendChild(park);
  function title(s){ return s.dataset.title || s.dataset.t || ''; }
  /* scripts for set-aside slides still run: inside the hidden box, closest('.slide') finds the set-aside slide */
  var closest = Element.prototype.closest;
  Element.prototype.closest = function(sel){
    var r = closest.call(this, sel);
    if (r === null && /\.slide\b/.test(sel) && park.contains(this)) r = closest.call(this, '.tempParkedSlide');
    return r;
  };
  function setAside(s){ s.classList.remove('slide'); s.classList.add('tempParkedSlide'); park.appendChild(s); }
  function tidy(){
    var all = [].slice.call(document.querySelectorAll('section.slide')), k = 0;
    return all.every(function(s){ return title(s) === KEEP[k++]; });
  }
  function trim(){
    if (tidy()) return;
    var all = [].slice.call(document.querySelectorAll('section.slide')); if (!all.length) return;
    var keep = [];
    KEEP.forEach(function(k){ var s = all.filter(function(x){ return title(x) === k && keep.indexOf(x) < 0; })[0]; if (s) keep.push(s); });
    all.forEach(function(s){ if (keep.indexOf(s) < 0) setAside(s); });
    if (!keep.length) return;
    var first = keep.slice().sort(function(a, b){ return a.compareDocumentPosition(b) & 4 ? -1 : 1; })[0];
    var mark = document.createComment('slides'); first.parentNode.insertBefore(mark, first);
    keep.forEach(function(s){ mark.parentNode.insertBefore(s, mark); });
    mark.remove();
  }
  trim();
  /* slides the build adds while loading (before its engine starts) */
  var mo = new MutationObserver(function(recs){
    var added = recs.some(function(r){ return [].some.call(r.addedNodes, function(n){ return n.nodeType === 1 && n.matches && n.matches('section.slide'); }); });
    if (added) trim();
  });
  mo.observe(document.documentElement, { childList:true, subtree:true });
  addEventListener('DOMContentLoaded', function(){ mo.disconnect(); });
})();
</script>
""" % json.dumps(titles, ensure_ascii=False)
open(out, 'w', encoding='utf-8').write(html[:pos] + js + html[pos:])
print(out, 'keeps', len(titles), 'slides')
