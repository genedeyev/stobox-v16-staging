/**
 * PORTED, not rewritten. This is the company-brain graph from genedeyev.com
 * (site/lib/company-graph.js), copied on Gene's instruction and changed in exactly two
 * places: the five colours, and the two label inks. The structure, the deterministic
 * layout, the camera, the hover and selection behaviour and every label are his.
 *
 * Original header follows.
 */
/**
 * The example brain of a large listed company.
 *
 * Northwind Industries is invented, and the caption on the page says so, but it is shaped
 * the way a real filer is shaped: divisions, units, teams, workstreams, then the artefacts
 * a business actually keeps, down to a single line on an invoice. Nine levels, thousands of
 * pages. A company that size does not have a diagram, it has a body of records, and this is
 * what that looks like when every one of them is linked.
 *
 * There is no force simulation. The tree is placed deterministically, children on an arc
 * around their parent with the reach shrinking by depth, so the picture is the same on
 * every load and cannot drift apart while nobody is watching. It also means thousands of
 * nodes cost nothing per frame beyond drawing the ones on screen.
 */

const OWN = 'orange';       // the company's own record
const WORLD = 'graphite';   // the world it has to watch

const DIVISIONS = [
  { name: 'finance', family: OWN, units: [
    ['controlling', ['close', 'consolidation', 'intercompany', 'reporting']],
    ['treasury', ['cash', 'fx', 'debt', 'facilities']],
    ['tax', ['direct', 'indirect', 'transfer pricing']],
    ['payables', ['invoices', 'approvals', 'disputes', 'runs']],
    ['receivables', ['ageing', 'collections', 'credit notes']]] },
  { name: 'regulators', family: WORLD, units: [
    ['filings', ['annual', 'quarterly', 'current', 'ownership']],
    ['correspondence', ['comment letters', 'responses']],
    ['rules', ['guidance', 'consultations', 'deadlines']]] },
  { name: 'operations', family: OWN, units: [
    ['plants', ['line one', 'line two', 'maintenance', 'yield']],
    ['supply chain', ['suppliers', 'purchase orders', 'lead times', 'shortages']],
    ['logistics', ['shipments', 'carriers', 'customs', 'claims']],
    ['quality', ['inspections', 'deviations', 'corrective actions']],
    ['inventory', ['counts', 'write offs', 'locations']]] },
  { name: 'market', family: WORLD, units: [
    ['competitors', ['products', 'pricing', 'moves', 'filings']],
    ['customers', ['segments', 'demand', 'churn signals']],
    ['commodities', ['inputs', 'hedges', 'curves']]] },
  { name: 'commercial', family: OWN, units: [
    ['accounts', ['enterprise', 'mid market', 'channel', 'renewals']],
    ['pipeline', ['qualified', 'proposals', 'negotiation', 'closed']],
    ['pricing', ['lists', 'discounts', 'approvals']],
    ['contracts', ['master terms', 'orders', 'amendments', 'expiries']],
    ['marketing', ['campaigns', 'events', 'content']]] },
  { name: 'suppliers', family: WORLD, units: [
    ['tier one', ['terms', 'performance', 'audits']],
    ['tier two', ['terms', 'performance']],
    ['concentration', ['geography', 'substitutes', 'single source']]] },
  { name: 'legal', family: OWN, units: [
    ['corporate', ['entities', 'boards', 'resolutions', 'filings']],
    ['commercial law', ['reviews', 'templates', 'disputes']],
    ['intellectual property', ['patents', 'trademarks', 'licences']],
    ['privacy', ['registers', 'assessments', 'requests']]] },
  { name: 'sources', family: WORLD, units: [
    ['inbox', ['threads', 'attachments', 'decisions']],
    ['documents', ['scans', 'statements', 'certificates']],
    ['meetings', ['transcripts', 'actions', 'decisions']],
    ['feeds', ['news', 'filings', 'prices']]] },
  { name: 'people', family: OWN, units: [
    ['employment', ['contracts', 'changes', 'exits']],
    ['payroll', ['runs', 'benefits', 'filings']],
    ['hiring', ['roles', 'candidates', 'offers']],
    ['performance', ['reviews', 'goals', 'succession']]] },
  { name: 'technology', family: OWN, units: [
    ['platform', ['services', 'releases', 'incidents', 'runbooks']],
    ['data', ['warehouse', 'pipelines', 'quality', 'access']],
    ['security', ['controls', 'findings', 'exceptions']],
    ['vendors', ['contracts', 'renewals', 'reviews']]] },
  { name: 'risk', family: OWN, units: [
    ['internal audit', ['plans', 'findings', 'remediation']],
    ['compliance', ['policies', 'attestations', 'training']],
    ['insurance', ['policies', 'claims', 'renewals']]] },
  { name: 'investor relations', family: OWN, units: [
    ['reporting', ['quarters', 'guidance', 'decks']],
    ['shareholders', ['register', 'meetings', 'votes']],
    ['analysts', ['coverage', 'questions', 'models']]] },
];

const DOC_KINDS = ['memos', 'schedules', 'statements', 'reports', 'notes', 'logs', 'registers', 'letters'];
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const REGIONS = ['emea', 'americas', 'apac', 'group'];

// the shapes a company's own filenames actually take, so a page feels like the visitor's
const DOC_FORMS = [
  (m, n) => `invoice ${4000 + n}`,
  (m, n) => `PO-2026-${String(n).padStart(4, '0')}`,
  (m, n) => `${m} close pack`,
  (m, n) => `amendment ${(n % 5) + 1}`,
  (m, n) => `${m} statement`,
  (m, n) => `audit ${1000 + n}`,
  (m, n) => `minutes, ${m} ${(n % 28) + 1}`,
  (m, n) => `ticket ${2000 + n}`,
  (m, n) => `contract ${800 + n}`,
  (m, n) => `report, ${m}`,
];
const ITEM_FORMS = [
  (n) => `line ${n}`,
  (n) => `attachment ${n}`,
  (n) => `clause ${n}`,
  (n) => `annex ${n}`,
  (n) => `entry ${n}`,
];

export function buildGraph() {
  const nodes = [];
  const links = [];
  let seed = 20260901;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };

  const REACH = [0, 560, 210, 108, 64, 38, 23, 14, 9];
  const SPREAD = [0, Math.PI * 2, Math.PI * 2, Math.PI * 2, 2.8, 2.3, 2.0, 1.9, 2.0];
  const RADIUS = [11, 8.5, 6, 4.4, 3.4, 2.8, 2.3, 1.9, 1.6];

  const node = (label, depth, family, x, y) => {
    const n = {
      label, depth, family, x, y, r: RADIUS[depth] ?? 1.5,
      // a private phase and a tiny radius: the whole field drifts, nothing travels
      ph: rnd() * Math.PI * 2, amp: (depth < 2 ? 1.2 : 2.2 + rnd() * 2.6),
      bx: x, by: y,
    };
    nodes.push(n);
    return n;
  };
  const link = (a, b, family, depth) => links.push({ a, b, family, depth });

  const grow = (parent, facing, depth, labels, family) => {
    parent.kids = parent.kids || [];
    const spread = SPREAD[depth] ?? 1.8;
    const reach = REACH[depth] ?? 12;
    return labels.map((label, i) => {
      const t = labels.length === 1 ? 0 : i / (labels.length - 1) - 0.5;
      const ang = facing + t * spread + (rnd() - 0.5) * 0.14;
      const d = reach * (0.84 + rnd() * 0.32);
      const n = node(label, depth, family, parent.x + Math.cos(ang) * d, parent.y + Math.sin(ang) * d);
      n.parent = parent;
      parent.kids.push(n);
      link(parent, n, family, depth);
      return { n, facing: ang };
    });
  };

  const root = node('Northwind Industries', 0, OWN, 0, 0);

  // Divisions are spread inside a disc by the sunflower rule, which gives even coverage
  // with no rows, no ring and no hole, so the whole record reads as one round mass. The
  // disc is a true circle: the visitor opens on the whole of it and cannot pan or zoom
  // out past its edge, so the map always reads as one complete thing.
  const DISC = 560;
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));

  DIVISIONS.forEach((div, di) => {
    const t = (di + 0.5) / DIVISIONS.length;
    const rad = DISC * Math.sqrt(t) * (0.92 + rnd() * 0.16);
    const ang = di * GOLDEN + rnd() * 0.25;
    const dx = Math.cos(ang) * rad;
    const dy = Math.sin(ang) * rad;
    const divisionNode = node(div.name, 1, div.family, dx, dy);
    divisionNode.parent = root;
    (root.kids = root.kids || []).push(divisionNode);
    link(root, divisionNode, div.family, 1);
    // each division spreads in its own direction rather than away from the centre, so the
    // mass fills its cell evenly and the middle of the field is as busy as the edges
    const facing = rnd() * Math.PI * 2;
    const division = { n: divisionNode, facing };

    grow(division.n, division.facing, 2, div.units.map((u) => u[0]), div.family)
      .forEach(({ n: unit, facing: uf }, ui) => {
        grow(unit, uf, 3, div.units[ui][1], div.family).forEach(({ n: team, facing: tf }) => {
          const streams = Array.from({ length: 3 + Math.floor(rnd() * 3) }, (_, i) =>
            rnd() < 0.5 ? `q${(i % 4) + 1}` : REGIONS[i % REGIONS.length]);

          grow(team, tf, 4, streams, div.family).forEach(({ n: stream, facing: sf }) => {
            const groups = Array.from({ length: 2 + Math.floor(rnd() * 3) },
              () => DOC_KINDS[Math.floor(rnd() * DOC_KINDS.length)]);

            grow(stream, sf, 5, groups, div.family).forEach(({ n: group, facing: gf }) => {
              const docs = Array.from({ length: 3 + Math.floor(rnd() * 4) }, () => {
                const form = DOC_FORMS[Math.floor(rnd() * DOC_FORMS.length)];
                return form(MONTHS[Math.floor(rnd() * 12)], Math.floor(rnd() * 900));
              });

              grow(group, gf, 6, docs, div.family).forEach(({ n: doc, facing: df }) => {
                if (rnd() > 0.28) return;
                const form = ITEM_FORMS[Math.floor(rnd() * ITEM_FORMS.length)];
                const items = Array.from({ length: 2 + Math.floor(rnd() * 3) }, (_, i) => form(i + 1));
                grow(doc, df, 7, items, div.family).forEach(({ n: item, facing: itf }) => {
                  if (rnd() > 0.3) return;
                  grow(item, itf, 8,
                    Array.from({ length: 2 + Math.floor(rnd() * 2) }, (_, i) => `note ${i + 1}`),
                    div.family);
                });
              });
            });
          });
        });
      });
  });

  // a company is not a tree: the record cross-references itself and the world it watches
  const cross = nodes.filter((n) => n.depth >= 2 && n.depth <= 4);
  for (let i = 0; i < cross.length; i++) {
    if (rnd() < 0.05) {
      const j = Math.floor(rnd() * cross.length);
      if (i !== j) link(cross[i], cross[j], cross[i].family === cross[j].family ? cross[i].family : 'mixed', 2);
    }
  }

  // how many pages sit beneath each node. Children are always created after their parent,
  // so one pass backwards accumulates the whole subtree without recursion.
  for (const n of nodes) n.below = 0;
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n = nodes[i];
    if (n.parent) n.parent.below += n.below + 1;
  }

  const neighbours = new Map();
  nodes.forEach((n) => neighbours.set(n, new Set()));
  links.forEach((l) => { neighbours.get(l.a).add(l.b); neighbours.get(l.b).add(l.a); });

  return { nodes, links, neighbours, root };
}


const KIND = ['the company', 'division', 'unit', 'team', 'workstream', 'group', 'document', 'item', 'line'];
const OWNERS = ['A. Reiner', 'M. Osei', 'K. Lindqvist', 'P. Valente', 'S. Nakamura', 'T. Brennan', 'L. Fontaine'];
const SOURCES = ['the bank statement', 'the signed contract', 'the meeting recording', 'the supplier portal',
  'the filing', 'the invoice email', 'the payroll export', 'the audit workpaper'];

/** what the page carries, assembled for the card the visitor sees on a click */
function describe(n) {
  const path = [];
  for (let p = n; p; p = p.parent) path.unshift(p.label);
  const pick = (arr, seedStr) => {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) h = (h * 31 + seedStr.charCodeAt(i)) % 100000;
    return arr[h % arr.length];
  };
  return {
    label: n.label,
    kind: KIND[n.depth] ?? 'page',
    family: n.family === 'orange' ? 'the company record' : 'the world it watches',
    below: n.below,
    children: (n.kids || []).slice(0, 6).map((k) => k.label),
    childCount: (n.kids || []).length,
    path,
    owner: pick(OWNERS, n.label + n.depth),
    source: pick(SOURCES, n.label + 'src'),
    updated: `${['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'][n.label.length % 12]} ${(n.label.length * 7) % 28 + 1}`,
  };
}

export function startCompanyGraph(canvas, viewRef, rafRef, signal, onSelect, onViewport) {
  const ctx = canvas.getContext('2d');
  const { nodes, links, neighbours } = buildGraph();

  // Recoloured for Stobox: the accent, the navy, a quiet mixed line, paper and ink.
  const COL = { orange: '#0a55a0', graphite: '#2b4369', mixed: '#878e9e', paper: '#ffffff', ink: '#0c1427' };

  // the circle's own bounds: the visitor moves inside it and never outside it
  let bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
  for (const n of nodes) {
    if (n.x < bx0) bx0 = n.x; if (n.x > bx1) bx1 = n.x;
    if (n.y < by0) by0 = n.y; if (n.y > by1) by1 = n.y;
  }
  const worldCx = (bx0 + bx1) / 2, worldCy = (by0 + by1) / 2;
  let minK = 0.05;

  /**
   * The camera is a point in the world and a zoom, and it always chases a goal rather than
   * jumping to it. Zoom is chased in log space, which is what makes an approach feel like
   * approaching: the same wheel notch covers the same visual distance at every scale.
   */
  const cam = { cx: worldCx, cy: worldCy, k: 0.3 };
  const goal = { cx: worldCx, cy: worldCy, k: 0.3 };
  let chase = 0.10;                     // gentle by default, quicker while dragging
  viewRef.current = cam;                // exposed so the panel can read the zoom

  let hover = null, panning = null, fitted = false, frames = 0;
  let downAt = null, visible = true, selected = null;
  let dim = 0, drift = 0;

  const clampGoal = (W, H) => {
    goal.k = Math.min(40, Math.max(minK, goal.k));
    const halfW = W / 2 / goal.k, halfH = H / 2 / goal.k;
    const spanX = Math.max(0, (bx1 - bx0) / 2 - halfW);
    const spanY = Math.max(0, (by1 - by0) / 2 - halfH);
    goal.cx = Math.max(worldCx - spanX, Math.min(worldCx + spanX, goal.cx));
    goal.cy = Math.max(worldCy - spanY, Math.min(worldCy + spanY, goal.cy));
  };

  // On a touch screen the graph starts inert: a picture the page scrolls past.
  // It takes gestures only after the visitor asks it to, and it animates only
  // while it is allowed to move.
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  const quiet = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)');
  let interactive = !coarse;
  let needsPaint = true;
  const animates = () => interactive && !(quiet && quiet.matches);

  // the rect is read once per gesture rather than once per pointer event
  let rect = null;
  const freshRect = () => { rect = canvas.getBoundingClientRect(); return rect; };
  const toWorld = (e) => {
    const r = rect || freshRect();
    const sx = e.clientX - r.left - r.width / 2;
    const sy = e.clientY - r.top - r.height / 2;
    return { x: cam.cx + sx / cam.k, y: cam.cy + sy / cam.k, sx, sy };
  };

  const pick = (p) => {
    let best = null, bd = 1e9;
    for (const n of nodes) {
      const dx = n.x - p.x, dy = n.y - p.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      const hit = Math.max(n.r + 4, 8 / cam.k);
      if (d < hit && d < bd) { bd = d; best = n; }
    }
    return best;
  };

  /** fly to a page: close enough to read it, slowly enough to see where you went */
  const focus = (n) => {
    goal.k = Math.min(30, Math.max(minK * 3, 74 / Math.max(n.r, 1.1)));
    goal.cx = n.x;
    goal.cy = n.y;
    chase = 0.055;                      // a long, calm approach
  };

  canvas.addEventListener('wheel', (e) => {
    if (!interactive) return;             // the page keeps its scroll
    e.preventDefault();
    freshRect();
    const p = toWorld(e);
    const k = Math.min(40, Math.max(minK, goal.k * (e.deltaY < 0 ? 1.22 : 0.82)));
    // keep the point under the cursor where it is, so zoom follows the pointer
    goal.cx = p.x - (p.sx / k);
    goal.cy = p.y - (p.sy / k);
    goal.k = k;
    chase = 0.16;
    needsPaint = true;
  }, { passive: false, signal });

  canvas.addEventListener('pointerdown', (e) => {
    if (!interactive) return;
    freshRect();
    const p = toWorld(e);
    downAt = { sx: p.sx, sy: p.sy, wx: p.x, wy: p.y, node: pick(p), t: performance.now() };
    canvas.setPointerCapture(e.pointerId);
    panning = { wx: p.x, wy: p.y };
    if (e.pointerType !== 'touch') canvas.style.cursor = 'grabbing';
    chase = 0.42;                       // dragging should feel attached to the hand
    needsPaint = true;
  }, { signal });

  canvas.addEventListener('pointermove', (e) => {
    if (!interactive) return;
    const p = toWorld(e);
    if (panning) {
      goal.cx += panning.wx - p.x;
      goal.cy += panning.wy - p.y;
      needsPaint = true;
      return;
    }
    // A finger has no hover, and picking scans every page in the company: on
    // touch that would run twenty two thousand distance checks per move event
    // to decide the shape of a cursor nobody can see.
    if (e.pointerType === 'touch') return;
    hover = pick(p);
    canvas.style.cursor = hover ? 'pointer' : 'grab';
    needsPaint = true;
  }, { signal });

  const up = (e) => {
    if (!interactive) return;
    if (downAt && downAt.node) {
      const moved = e && e.clientX !== undefined
        ? Math.hypot(toWorld(e).sx - downAt.sx, toWorld(e).sy - downAt.sy) : 0;
      if (moved < 4 && performance.now() - downAt.t < 600) {
        selected = downAt.node;
        focus(selected);
        if (onSelect) onSelect(describe(selected));
      }
    }
    if (panning) chase = 0.12;
    downAt = null; panning = null; rect = null;
    if (!coarse) canvas.style.cursor = 'grab';
    needsPaint = true;
  };
  canvas.addEventListener('pointerup', up, { signal });
  canvas.addEventListener('pointercancel', up, { signal });
  canvas.addEventListener('pointerleave', () => { hover = null; }, { signal });

  const io = new IntersectionObserver((es) => {
    visible = es[0].isIntersecting;
    if (visible) needsPaint = true;
    if (onViewport) onViewport(visible);
  }, { rootMargin: '200px' });
  io.observe(canvas);

  let cw = 0, ch = 0;
  const ro = new ResizeObserver(() => { cw = canvas.clientWidth; ch = canvas.clientHeight; needsPaint = true; });
  ro.observe(canvas);
  const onQuiet = () => { needsPaint = true; };
  if (quiet) quiet.addEventListener('change', onQuiet);
  const onVis = () => { if (document.visibilityState === 'visible') needsPaint = true; };
  document.addEventListener('visibilitychange', onVis);
  if (signal) signal.addEventListener('abort', () => {
    io.disconnect(); ro.disconnect();
    if (quiet) quiet.removeEventListener('change', onQuiet);
    document.removeEventListener('visibilitychange', onVis);
  });

  // an unhurried spotlight: a different branch is lit and released every few seconds
  const spotCandidates = nodes.filter((n) => n.depth === 2);
  let spot = null, spotW = 0, spotAt = 0, spotIdx = 3;
  const spotMembers = new Set();
  const lightSubtree = (n) => {
    spotMembers.clear();
    const stack = [n];
    while (stack.length) {
      const c = stack.pop();
      spotMembers.add(c);
      if (c.kids) for (const k of c.kids) stack.push(k);
    }
    for (let p = n.parent; p; p = p.parent) spotMembers.add(p);
  };

  const stats = { drawnNodes: 0, drawnLinks: 0 };

  const tick = () => {
    if (signal && signal.aborted) return;
    rafRef.current = requestAnimationFrame(tick);
    if (!visible) return;

    if (document.visibilityState === 'hidden') return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = cw || (cw = canvas.clientWidth), H = ch || (ch = canvas.clientHeight);
    if (!W || !H) return;

    // Nothing is moving and nothing is allowed to move: the last frame is still
    // correct, so the phone keeps its battery instead of redrawing it.
    const moving = Math.abs(Math.log(goal.k / cam.k)) > 0.0004
      || Math.abs(goal.cx - cam.cx) > 0.4 || Math.abs(goal.cy - cam.cy) > 0.4;
    if (!animates() && !moving && !needsPaint && fitted && frames > 3) return;
    needsPaint = false;
    // height alone changes when a phone is rotated, so both are checked
    if (canvas.width !== Math.round(W * dpr) || canvas.height !== Math.round(H * dpr)) {
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
    }

    frames++;
    if (!fitted && frames > 2) {
      fitted = true;
      // the whole circle is the default view, and the furthest out anyone can go
      minK = Math.min(W / (bx1 - bx0 + 90), H / (by1 - by0 + 90));
      cam.k = goal.k = minK;
      cam.cx = goal.cx = worldCx;
      cam.cy = goal.cy = worldCy;
    }

    clampGoal(W, H);

    // the approach itself: distance in log space for zoom, plain space for the centre,
    // and the same easing for both so they arrive together
    const kRatio = goal.k / cam.k;
    cam.k *= Math.pow(kRatio, chase);
    if (Math.abs(Math.log(kRatio)) < 0.0004) cam.k = goal.k;
    cam.cx += (goal.cx - cam.cx) * chase;
    cam.cy += (goal.cy - cam.cy) * chase;
    // once the move has landed, drift back to the calm default speed
    chase += (0.10 - chase) * 0.05;

    // A slow, soft sway. Nothing travels: each page moves a little around where
    // it was put. It stops entirely when the graph is inert or motion is not
    // wanted, which is also what lets the frame above be skipped.
    if (animates()) {
      drift += 0.0016;
      for (const n of nodes) {
        n.x = n.bx + Math.cos(drift + n.ph) * n.amp;
        n.y = n.by + Math.sin(drift * 0.83 + n.ph) * n.amp * 0.8;
      }
    }

    const now = animates() ? performance.now() : spotAt;
    if (!spot || now - spotAt > 8200) {
      spotAt = now;
      spotIdx = (spotIdx + 7) % spotCandidates.length;
      spot = spotCandidates[spotIdx];
      lightSubtree(spot);
    }
    const phase = (now - spotAt) / 8200;
    const wanted = hover || selected ? 0 : Math.sin(Math.min(1, Math.max(0, phase)) * Math.PI);
    spotW += (wanted - spotW) * 0.035;

    dim += ((hover ? 1 : 0) - dim) * 0.16;
    const soft = dim < 0.01;
    const near = hover ? neighbours.get(hover) : null;
    const k = cam.k;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.translate(W / 2, H / 2);
    ctx.scale(k, k);
    ctx.translate(-cam.cx, -cam.cy);

    const padW = W / 2 / k + 80 / k, padH = H / 2 / k + 80 / k;
    const left = cam.cx - padW, right = cam.cx + padW;
    const top = cam.cy - padH, bottom = cam.cy + padH;
    const on = (n) => n.x > left && n.x < right && n.y > top && n.y < bottom;

    let dl = 0, dn = 0;
    ctx.lineWidth = Math.max(0.3, 0.7 / k);
    for (const l of links) {
      if (!on(l.a) && !on(l.b)) continue;
      if (l.depth >= 7 && k < 0.85) continue;
      if (l.depth >= 8 && k < 1.6) continue;
      dl++;
      const base = l.depth === 1 ? 0.16 : Math.max(0.18, 0.62 - l.depth * 0.045);
      const hot = hover && (l.a === hover || l.b === hover);
      let a = soft ? base : base + (hot ? (0.9 - base) : (0.34 - base)) * dim;
      if (spotW > 0.01) {
        const inSpot = spotMembers.has(l.a) && spotMembers.has(l.b);
        a += (inSpot ? (0.92 - a) : (base * 0.55 - a)) * spotW * 0.8;
      }
      ctx.globalAlpha = a;
      ctx.strokeStyle = COL[l.family] || COL.mixed;
      ctx.beginPath();
      ctx.moveTo(l.a.x, l.a.y);
      if (l.depth >= 2) {
        const mx = (l.a.x + l.b.x) / 2, my = (l.a.y + l.b.y) / 2;
        const dx = l.b.x - l.a.x, dy = l.b.y - l.a.y;
        const bow = (l.depth % 2 ? 0.08 : -0.08);
        ctx.quadraticCurveTo(mx - dy * bow, my + dx * bow, l.b.x, l.b.y);
      } else {
        ctx.lineTo(l.b.x, l.b.y);
      }
      ctx.stroke();
    }

    for (const n of nodes) {
      if (!on(n) || n.r * k < 0.55) continue;
      if (n.depth >= 7 && k < 0.85) continue;
      if (n.depth >= 8 && k < 1.6) continue;
      dn++;
      const hot = n === hover || (near && near.has(n));
      let a = soft ? 1 : 1 + (hot ? 0 : -0.55) * dim;
      if (spotW > 0.01) a += (spotMembers.has(n) ? 1 - a : 0.45 - a) * spotW * 0.8;
      ctx.globalAlpha = a;
      const col = COL[n.family] || COL.mixed;
      if (n === selected) {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.6 / k;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 2.6 + 3 / k, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * (n === hover ? 1.6 : 1), 0, Math.PI * 2);
      if (n.depth <= 1) { ctx.fillStyle = col; ctx.fill(); }
      else {
        ctx.fillStyle = COL.paper; ctx.fill();
        ctx.lineWidth = Math.max(0.35, (n.depth <= 3 ? 1.1 : 0.85) / k);
        ctx.strokeStyle = col; ctx.stroke();
      }
    }

    for (const n of nodes) {
      if (!on(n)) continue;
      const need = [0, 0, 0.35, 0.9, 2.0, 4.0, 7.0, 12.0, 18.0][n.depth] ?? 22;
      const lifted = spotW > 0.2 && spotMembers.has(n) && n.depth <= 5;
      const la = n === hover || n === selected ? 1
        : Math.max(lifted ? spotW * 0.85 : 0, Math.min(1, (k - need) / (need * 0.45 + 0.3)));
      if (la <= 0.04) continue;
      const lit = n === hover || n === selected || (near && near.has(n));
      ctx.globalAlpha = la * (soft || lit ? 1 : 1 - 0.6 * dim);
      const size = (n.depth === 0 ? 15 : n.depth === 1 ? 13 : n.depth === 2 ? 11 : 9) / k;
      ctx.font = `${n.depth <= 1 ? '600 ' : ''}${size}px Lora, Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = n.depth <= 1 ? COL.ink : (n.family === OWN ? '#084278' : '#5c6373');
      ctx.fillText(n.label, n.x, n.y + n.r + size * 1.05);
    }
    ctx.globalAlpha = 1;
    stats.drawnNodes = dn; stats.drawnLinks = dl;
  };
  tick();

  return {
    count: nodes.length,
    links: links.length,
    stats,
    clear: () => { selected = null; },
    /** the panel's buttons steer the same camera, so they glide too */
    zoomBy: (f) => { goal.k = Math.min(40, Math.max(minK, goal.k * f)); chase = 0.07; needsPaint = true; },
    reset: () => { goal.k = minK; goal.cx = worldCx; goal.cy = worldCy; chase = 0.05; selected = null; needsPaint = true; },
    /** on a touch screen the graph is a picture until the visitor asks for it */
    needsInvite: coarse,
    setActive: (on) => {
      interactive = on || !coarse;
      needsPaint = true;
      if (!on) { hover = null; panning = null; downAt = null; }
    },
  };
}
