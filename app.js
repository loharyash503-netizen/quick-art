/* quickart prototype: app shell, state and screens (React 18 + htm, no build step). */
const { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } = React;
const html = htm.bind(React.createElement);
const Ctx = createContext(null);
const useApp = () => useContext(Ctx);

/* ---------- Rules and helpers ---------- */
const KEY = 'quickart-proto-v1';
const SPEED = 12; // prototype clock: 1 real second = 12 simulated seconds
const FREE_OVER = 499;
const DELIVERY_FEE = 25;
const STAGES = [
  ['placed', 'Order placed', 'We have your order'],
  ['packed', 'Packed', 'Packed at the Paldi store'],
  ['out', 'Out for delivery', 'Rider is on the way'],
  ['delivered', 'Delivered', 'Handed over at your door'],
];
const STAGE_MIN = { placed: 0, packed: 2, out: 5 };
const SLOTS = { now: 'Now', eve: 'Today, 6–7 PM', tmr: 'Tomorrow, 9–10 AM' };
const PAYS = {
  upi: { label: 'UPI', icon: 'upi' },
  card: { label: 'Card', icon: 'card' },
  cod: { label: 'Pay on delivery', icon: 'cash' },
};
const PRICE_BANDS = {
  u250: { label: 'Under ₹250', range: [0, 249] },
  m500: { label: '₹250 – ₹500', range: [250, 500] },
  m1000: { label: '₹501 – ₹1,000', range: [501, 1000] },
  o1000: { label: 'Over ₹1,000', range: [1001, 1e9] },
};
const SORTS = [['rel', 'Relevance'], ['low', 'Price: low to high'], ['high', 'Price: high to low'], ['off', 'Biggest discount'], ['rating', 'Top rated']];
const EXPLORE_FILTERS = [['foryou', 'For you'], ['field', 'Your field'], ['painting', 'Painting'], ['drawing', 'Drawing'], ['model', 'Model-making'], ['studio', 'Studio']];
const PLACEHOLDERS = ['Paint Brush', 'Fineliner', 'A3 Sketchbook', 'Foam Board', 'Post-it Notes'];
const POPULAR = ['paint brush', 'alcohol markers', 'sketchbook', 'cutting mat', 'fineliner', 'canvas'];
const SYN = [[/paint ?brush(es)?/g, 'brush'], [/\bcolou?rs?\b/g, 'colour'], [/sketch ?book/g, 'sketchbook'], [/post ?it|sticky/g, 'post-it'], [/\bpens?\b/g, 'pen'], [/water ?colou?r/g, 'watercolour'], [/fine ?liner/g, 'fineliner']];

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const pctOff = (v) => Math.round(((v.mrp - v.price) / v.mrp) * 100);
const dvOf = (p) => p.variants[p.dv];
const kfmt = (n) => (n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace('.0', '') + 'k' : String(n));
const fieldName = (id) => (FIELDS.find((f) => f.id === id) || {}).name || id;
const catOf = (id) => CATS.find((c) => c.id === id);
const clock = (t) => new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
const dayTime = (t) => new Date(t).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

function lineSnap(pid, vi, qty) {
  const v = P[pid].variants[vi];
  return { pid, vi, qty, price: v.price, mrp: v.mrp, label: v.label };
}
function billOf(lines) {
  const items = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const mrp = lines.reduce((a, l) => a + l.mrp * l.qty, 0);
  const delivery = items === 0 || items >= FREE_OVER ? 0 : DELIVERY_FEE;
  return { mrp, items, discount: mrp - items, delivery, total: items + delivery, gap: Math.max(0, FREE_OVER - items) };
}
function cartLinesOf(S) {
  return Object.entries(S.cart)
    .map(([key, qty]) => {
      const [pid, vi] = key.split(':');
      const p = P[pid];
      if (!p || !p.variants[+vi] || qty <= 0) return null;
      return { key, ...lineSnap(pid, +vi, qty), p, v: p.variants[+vi] };
    })
    .filter(Boolean);
}
function orderStage(o, now) {
  if (o.cancelled) return { key: 'cancelled', idx: -1 };
  if (o.slot && o.slot !== 'now') return { key: 'scheduled', idx: 0 };
  const m = (((now - o.placedAt) / 1000) * SPEED) / 60;
  if (m >= o.eta) return { key: 'delivered', idx: 3 };
  const left = Math.max(1, Math.ceil(o.eta - m));
  if (m >= STAGE_MIN.out) return { key: 'out', idx: 2, left };
  if (m >= STAGE_MIN.packed) return { key: 'packed', idx: 1, left };
  return { key: 'placed', idx: 0, left };
}
const ADDRS = [
  { id: 'a1', label: 'Hostel', line: 'Room 214, Block C, Boys Hostel', area: 'NID Campus, Paldi, Ahmedabad', eta: 12 },
  { id: 'a2', label: 'Studio', line: '2nd floor, 14 Law Garden Road', area: 'Navrangpura, Ahmedabad', eta: 18 },
];
function freshState() {
  const items = [lineSnap('p19', 1, 1), lineSnap('p14', 0, 1), lineSnap('p12', 0, 2)];
  return {
    v: 1,
    user: { name: 'Yash', phone: '', loggedIn: false, guest: false, onboarded: false, fields: [] },
    addresses: ADDRS, addressId: 'a1',
    cart: {}, saved: [], savedReels: [], liked: [], notify: [], recent: [],
    searches: ['acrylic paint', 'fineliner'],
    orders: [{ id: 'QA20417', items, bill: billOf(items), address: ADDRS[0], pay: 'upi', slot: 'now', placedAt: Date.now() - 3 * 864e5, eta: 14, cancelled: false, sample: true }],
    pay: 'upi', upi: 'yash@okaxis', slot: 'now',
    notif: { orders: true, offers: false, reels: true },
    failNext: false,
  };
}
function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === 1) return { ...freshState(), ...s };
    }
  } catch (e) { /* storage unavailable: start fresh */ }
  return freshState();
}
function useNow(ms) {
  const [n, setN] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setN(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return n;
}

/* ---------- Search and filtering ---------- */
function haystack(p) {
  return [p.name, p.brand, p.sub, (catOf(p.cat) || {}).name, p.fields.map(fieldName).join(' '), p.variants.map((v) => v.label).join(' ')].join(' ').toLowerCase();
}
const HAY = Object.fromEntries(PRODUCTS.map((p) => [p.id, haystack(p)]));
function normalise(q) {
  let s = q.toLowerCase().trim();
  SYN.forEach(([re, to]) => (s = s.replace(re, to)));
  return s.split(/[^a-z0-9.\-]+/).filter(Boolean).map((t) => (t.length > 4 ? t.replace(/(es|s)$/, '') : t));
}
function searchProducts(q) {
  const toks = normalise(q);
  if (!toks.length) return { list: [], exact: true };
  const score = (p) => {
    const name = p.name.toLowerCase(), brand = p.brand.toLowerCase(), hay = HAY[p.id];
    let s = 0, hits = 0;
    toks.forEach((t) => {
      if (name.includes(t)) { s += 3; hits++; } else if (brand.includes(t)) { s += 2; hits++; } else if (hay.includes(t)) { s += 1; hits++; }
    });
    return { s, hits };
  };
  const scored = PRODUCTS.map((p) => ({ p, ...score(p) }));
  const exact = scored.filter((x) => x.hits === toks.length).sort((a, b) => b.s - a.s).map((x) => x.p);
  if (exact.length) return { list: exact, exact: true };
  return { list: scored.filter((x) => x.hits > 0).sort((a, b) => b.s - a.s).map((x) => x.p), exact: false };
}
const NO_FILTERS = { brands: [], price: null, inStock: false, deal: false };
function applyFilters(list, f, sort) {
  let r = list.filter((p) => {
    const v = dvOf(p);
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.price) {
      const [lo, hi] = PRICE_BANDS[f.price].range;
      if (v.price < lo || v.price > hi) return false;
    }
    if (f.inStock && !p.variants.some((x) => x.stock > 0)) return false;
    if (f.deal && pctOff(v) < 15) return false;
    return true;
  });
  const by = {
    low: (a, b) => dvOf(a).price - dvOf(b).price,
    high: (a, b) => dvOf(b).price - dvOf(a).price,
    off: (a, b) => pctOff(dvOf(b)) - pctOff(dvOf(a)),
    rating: (a, b) => b.rating - a.rating,
  }[sort];
  return by ? [...r].sort(by) : r;
}
const filterCount = (f) => f.brands.length + (f.price ? 1 : 0) + (f.inStock ? 1 : 0) + (f.deal ? 1 : 0);

/* ---------- Small building blocks ---------- */
function I(name, opts = {}) {
  return html`<span className=${'ic ' + (opts.cls || '')} dangerouslySetInnerHTML=${{ __html: iconSvg(name, opts.fill) }}></span>`;
}
function Art({ art, bg, cls, zoom }) {
  if (art.photo) {
    return html`<span className=${'art photo ' + (cls || '') + (zoom ? ' zoom' : '')} style=${bg ? { background: bg } : null}><${Photo} src=${asset(art.photo)} /></span>`;
  }
  return html`<span className=${'art ' + (cls || '') + (zoom ? ' zoom' : '')} style=${bg ? { background: bg } : null} dangerouslySetInnerHTML=${{ __html: artSvg(art) }}></span>`;
}
function Photo({ src }) {
  const ref = useRef();
  const [ok, setOk] = useState(false);
  useEffect(() => { if (ref.current && ref.current.complete) setOk(true); }, [src]);
  return html`<img ref=${ref} src=${src} className=${ok ? 'in' : ''} alt="" loading="lazy" decoding="async" draggable="false" onLoad=${() => setOk(true)} onError=${() => setOk(true)} />`;
}
/* 3D icon (Microsoft Fluent Emoji, MIT) */
function Emo({ k, cls }) {
  return html`<img className=${'emo ' + (cls || '')} src=${asset('icons/' + k + '.png')} alt="" draggable="false" />`;
}
/* Bold the part of a suggestion that matches what was typed */
function Hl({ text, q }) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase().trim()) : -1;
  if (i < 0 || !q.trim()) return text;
  const n = q.trim().length;
  return html`${text.slice(0, i)}<mark>${text.slice(i, i + n)}</mark>${text.slice(i + n)}`;
}
function Price({ v, big }) {
  return html`<span className=${'price' + (big ? ' big' : '')}>
    <b>${inr(v.price)}</b>${v.mrp > v.price && html`<s aria-label=${'MRP ' + inr(v.mrp)}>${inr(v.mrp)}</s>`}
  </span>`;
}
function Stepper({ q, onChange, max, label, soft }) {
  return html`<div className=${'stepper' + (soft ? ' soft' : '')} role="group" aria-label=${'Quantity' + (label ? ' of ' + label : '')}>
    <button type="button" aria-label=${q === 1 ? 'Remove' : 'Decrease'} onClick=${() => onChange(q - 1)}>${I('minus')}</button>
    <span key=${q} className="tick" aria-live="polite">${q}</span>
    <button type="button" aria-label="Increase" disabled=${max != null && q >= max} onClick=${() => onChange(q + 1)}>${I('plus')}</button>
  </div>`;
}
function Avatar({ size, onClick }) {
  const { S } = useApp();
  const ch = (S.user.name || 'Y').trim().charAt(0).toUpperCase() || 'Y';
  const inner = html`<span className="avatar" style=${size ? { width: size, height: size, fontSize: size * 0.42 } : null} aria-hidden="true">${ch}</span>`;
  return onClick ? html`<button className="avatar-btn" aria-label="Profile" onClick=${onClick}>${inner}</button>` : inner;
}
function CartBtn({ dark, tone }) {
  const { cart, nav } = useApp();
  return html`<button className=${'round-btn js-cart ' + (dark ? 'on-dark' : tone || '')} aria-label=${`Cart, ${cart.count} item${cart.count === 1 ? '' : 's'}`} onClick=${() => nav.push('cart')}>
    ${I('cart')}${cart.count > 0 && html`<span key=${cart.count} className="badge pop-badge">${cart.count}</span>`}
  </button>`;
}
function TopBar({ title, sub, right, onBack, tone }) {
  const { nav } = useApp();
  return html`<header className=${'topbar ' + (tone || '')}>
    <button className="round-btn" aria-label="Back" onClick=${onBack || nav.pop}>${I('left')}</button>
    <div className="topbar-t"><h1>${title}</h1>${sub && html`<p>${sub}</p>`}</div>
    <div className="topbar-r">${right}</div>
  </header>`;
}
function SecHead({ title, sub, action, onAction }) {
  return html`<div className="sec-head">
    <div><h2>${title}</h2>${sub && html`<p>${sub}</p>`}</div>
    ${action && html`<button className="link" onClick=${onAction}>${action} ${I('right')}</button>`}
  </div>`;
}
function Sheet({ title, onClose, children, tall }) {
  const ref = useRef();
  const drag = useRef(null);
  const down = (e) => {
    if (e.target.closest('button')) return;
    drag.current = { y: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    ref.current.style.transition = 'none';
  };
  const move = (e) => {
    if (!drag.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    ref.current.style.transform = `translateY(${drag.current.dy}px)`;
  };
  const up = () => {
    if (!drag.current) return;
    const dy = drag.current.dy;
    drag.current = null;
    ref.current.style.transition = 'transform .2s ease';
    if (dy > 90) { ref.current.style.transform = 'translateY(100%)'; setTimeout(onClose, 170); }
    else ref.current.style.transform = '';
  };
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return html`<div className="sheet-wrap" onClick=${onClose}>
    <div ref=${ref} className=${'sheet' + (tall ? ' tall' : '')} role="dialog" aria-modal="true" aria-label=${title} onClick=${(e) => e.stopPropagation()}>
      <div className="sheet-drag" onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
        <div className="sheet-grab" aria-hidden="true"></div>
        <div className="sheet-head"><h3>${title}</h3><button className="round-btn ghost" aria-label="Close" onClick=${onClose}>${I('x')}</button></div>
      </div>
      <div className="sheet-body">${children}</div>
    </div>
  </div>`;
}
const EMPTY_EMO = { cart: 'cart', search: 'magnifier', sliders: 'magnifier', orders: 'package', heart: 'heart', video: 'clapper', bookmark: 'clapper' };
function Empty({ icon, title, text, cta, onCta, children }) {
  return html`<div className="empty">
    ${EMPTY_EMO[icon] ? html`<span className="empty-emo"><${Emo} k=${EMPTY_EMO[icon]} /></span>` : html`<span className="empty-ic">${I(icon)}</span>`}
    <h3>${title}</h3>
    ${text && html`<p>${text}</p>`}
    ${children}
    ${cta && html`<button className="btn primary" onClick=${onCta}>${cta}</button>`}
  </div>`;
}
function Skeleton({ n = 4 }) {
  return html`<div className="grid2" aria-busy="true" aria-label="Loading products">
    ${Array.from({ length: n }, (_, i) => html`<div key=${i} className="skel-card"><span className="skel sq"></span><span className="skel ln"></span><span className="skel ln short"></span></div>`)}
  </div>`;
}

/* ---------- Product UI ---------- */
function AddBtn({ p, vi }) {
  const { qty, setQty, addToCart, S, act, toast } = useApp();
  const v = p.variants[vi];
  const q = qty(p.id, vi);
  if (v.stock === 0) {
    const k = p.id + ':' + vi, on = S.notify.includes(k);
    return html`<button className=${'add-btn ghost' + (on ? ' on' : '')} aria-pressed=${on} onClick=${() => {
      act((s) => { s.notify = on ? s.notify.filter((x) => x !== k) : [...s.notify, k]; });
      toast(on ? 'Restock alert removed' : "Out of stock. We'll alert you when it's back.");
    }}>${I(on ? 'check' : 'bell')} ${on ? 'Alert set' : 'Notify me'}</button>`;
  }
  if (q > 0) return html`<${Stepper} q=${q} max=${v.stock} label=${p.name} onChange=${(n) => setQty(p.id, vi, n)} />`;
  return html`<button className="add-btn" onClick=${() => addToCart(p.id, vi)}>${I('cart')} Add to cart</button>`;
}
function QuickAdd({ p }) {
  const { qty, addToCart } = useApp();
  const n = qty(p.id, p.dv);
  return html`<button className=${'quick-add' + (n ? ' on' : '')} aria-label=${n ? `${p.name}: ${n} in cart, add one more` : `Add ${p.name} to cart`} onClick=${() => addToCart(p.id, p.dv)}>${n ? html`<b>${n}</b>` : I('plus')}</button>`;
}
function HeartBtn({ pid, cls }) {
  const { S, toggleSaved } = useApp();
  const on = S.saved.includes(pid);
  return html`<button className=${'heart ' + (cls || '') + (on ? ' on' : '')} aria-pressed=${on} aria-label=${on ? 'Remove from saved' : 'Save for later'} onClick=${() => toggleSaved(pid)}>${I('heart', { fill: on })}</button>`;
}
function ProductCard({ p, wide }) {
  const { viewProduct } = useApp();
  const v = dvOf(p), pct = pctOff(v);
  return html`<article className=${'pcard' + (wide ? ' wide' : '')}>
    <button className="pcard-hit" onClick=${() => viewProduct(p.id)} aria-label=${`${p.name} by ${p.brand}, ${inr(v.price)}`}>
      <span className="pcard-img"><${Art} art=${p.art} />${pct >= 5 && html`<span className="off">${pct}% OFF</span>`}</span>
      <span className="pcard-brand">${p.brand}</span>
      <span className="pcard-name">${p.name}</span>
      <span className="pcard-meta">${p.variants.length > 1 ? `${v.label} · +${p.variants.length - 1} more` : v.label}</span>
      <${Price} v=${v} />
    </button>
    <${HeartBtn} pid=${p.id} />
    <${AddBtn} p=${p} vi=${p.dv} />
  </article>`;
}
function MiniCard({ p }) {
  const { viewProduct, addToCart, qty } = useApp();
  const v = dvOf(p), inCart = qty(p.id, p.dv) > 0;
  return html`<article className="mini" style=${{ background: p.bg }}>
    <button className="mini-hit" onClick=${() => viewProduct(p.id)} aria-label=${p.name}>
      <span className="mini-img"><${Art} art=${p.art} /></span>
      <span className="mini-name">${p.brand}</span>
      <b className="mini-price">${inr(v.price)}</b>
    </button>
    <button className=${'mini-add' + (inCart ? ' on' : '')} disabled=${v.stock === 0} aria-label=${inCart ? `${p.name} is in your cart, add one more` : `Add ${p.name} to cart`} onClick=${() => addToCart(p.id, p.dv)}>${I(inCart ? 'check' : 'plus')}</button>
  </article>`;
}
function Rail({ items, two }) {
  return html`<div className=${two ? 'rail2' : 'rail'}>${items.map((p) => html`<${ProductCard} key=${p.id} p=${p} />`)}</div>`;
}
function CartBar({ inStack }) {
  const { cart, nav } = useApp();
  if (!cart.count) return null;
  const b = cart.bill;
  return html`<button className=${'cartbar js-cart' + (inStack ? ' in-stack' : '')} onClick=${() => nav.push('cart')}>
    <span className="cartbar-thumbs" aria-hidden="true">${cart.lines.slice(0, 3).map((l) => html`<${Art} key=${l.key} art=${l.p.art} bg="#fff" />`)}</span>
    <span className="cartbar-txt"><b>${cart.count} item${cart.count === 1 ? '' : 's'} · ${inr(b.total)}</b><small>${b.gap > 0 ? `Add ${inr(b.gap)} for free delivery` : 'Free delivery unlocked'}</small></span>
    <span className="cartbar-cta">View cart ${I('right')}</span>
  </button>`;
}
function BillCard({ b }) {
  return html`<section className="card bill" aria-label="Bill details">
    <h3>Bill details</h3>
    <div className="bill-row"><span>Item total (MRP)</span><span>${inr(b.mrp)}</span></div>
    <div className="bill-row good"><span>Discount on MRP</span><span>− ${inr(b.discount)}</span></div>
    <div className="bill-row"><span>Delivery fee ${b.delivery === 0 && b.items > 0 && html`<em className="tag-free">Free over ${inr(FREE_OVER)}</em>`}</span><span>${b.delivery ? inr(b.delivery) : html`<s>${inr(DELIVERY_FEE)}</s> ₹0`}</span></div>
    <div className="bill-row"><span>Platform or handling fee</span><span>₹0</span></div>
    <div className="bill-row total"><span>To pay</span><span>${inr(b.total)}</span></div>
    <p className="bill-note">${I('shield')} Prices include GST. This is the final amount. Nothing is added at payment.</p>
  </section>`;
}
function FreeDelivery({ b }) {
  const pct = Math.min(100, (b.items / FREE_OVER) * 100);
  return html`<div className="freebar">
    <p>${I('truck')} ${b.gap > 0 ? html`Add <b>${inr(b.gap)}</b> more for free delivery` : html`<b>Free delivery</b> on this order`}</p>
    <div className="freebar-track" role="progressbar" aria-valuemin="0" aria-valuemax=${FREE_OVER} aria-valuenow=${Math.min(b.items, FREE_OVER)} aria-label="Progress to free delivery"><i style=${{ width: pct + '%' }}></i></div>
  </div>`;
}

/* ---------- Auth and onboarding ---------- */
function Keypad({ onKey, onDel }) {
  const keys = [['1', ''], ['2', 'ABC'], ['3', 'DEF'], ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'], ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ']];
  const keep = (e) => e.preventDefault();
  return html`<div className="keypad" role="group" aria-label="Number pad" onMouseDown=${keep}>
    ${keys.map(([n, l]) => html`<button key=${n} type="button" className="key" onClick=${() => onKey(n)}><span>${n}</span><small>${l}</small></button>`)}
    <span></span>
    <button type="button" className="key" onClick=${() => onKey('0')}><span>0</span></button>
    <button type="button" className="key key-del" aria-label="Delete" onClick=${onDel}>${I('backspace')}</button>
  </div>`;
}
function Login({ params }) {
  const { nav, act } = useApp();
  const mode = params.mode || 'onboard';
  const [ph, setPh] = useState('');
  const [kb, setKb] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef();
  const submit = () => {
    if (!/^[6-9]\d{9}$/.test(ph)) {
      setErr(ph.length < 10 ? 'Enter your 10-digit mobile number.' : 'Mobile numbers start with 6, 7, 8 or 9.');
      return;
    }
    setKb(false);
    nav.push('otp', { phone: ph, mode });
  };
  const skip = () => {
    if (mode === 'onboard') {
      act((s) => { s.user.guest = true; });
      nav.reset([['fields', { mode: 'onboard' }]]);
    } else nav.pop();
  };
  const type = (d) => { setErr(''); setPh((x) => (x + d).slice(0, 10)); };
  return html`<div className=${'auth' + (kb ? ' kb' : '')}>
    <div className="auth-top">
      ${mode !== 'onboard' && html`<button className="round-btn dark" aria-label="Back" onClick=${nav.pop}>${I('back')}</button>`}
      <span></span>
      <button className="pill-dark" onClick=${skip}>${mode === 'onboard' ? 'Skip' : 'Not now'} ${I('chev')}</button>
    </div>
    <div className="auth-main" onClick=${(e) => { if (!e.target.closest('.phone-field')) setKb(false); }}>
      <div className="brandmark" aria-hidden="true"><span>quick</span>art</div>
      <h1 className="auth-title">Art Supplies<br />Delivered in Minutes</h1>
      ${mode === 'checkout' && html`<p className="auth-sub">Log in to place your order. Your cart is saved.</p>`}
      <label className=${'phone-field' + (err ? ' err' : '')} onClick=${() => { setKb(true); inputRef.current && inputRef.current.focus(); }}>
        <span className="cc">+91</span>
        <input id="phone" ref=${inputRef} type="tel" inputMode="none" autoComplete="tel-national" placeholder="Enter Phone Number" aria-label="Mobile number" aria-invalid=${!!err} aria-describedby="phone-err"
          value=${ph.replace(/^(\d{5})(\d)/, '$1 $2')} onFocus=${() => setKb(true)}
          onChange=${(e) => { setErr(''); setPh(e.target.value.replace(/\D/g, '').slice(0, 10)); }}
          onKeyDown=${(e) => e.key === 'Enter' && submit()} />
      </label>
      <p id="phone-err" className="field-err" role="alert">${err}</p>
      <button className="btn coral" onClick=${submit}>Continue</button>
    </div>
    ${kb ? html`<${Keypad} onKey=${type} onDel=${() => setPh((x) => x.slice(0, -1))} />`
      : html`<p className="terms">By continuing, you agree to our<br /><a href="#terms" onClick=${(e) => e.preventDefault()}>Terms of Use</a> & <a href="#privacy" onClick=${(e) => e.preventDefault()}>Privacy Policy</a></p>`}
  </div>`;
}
function PaperPlane() {
  return html`<svg className="plane" viewBox="0 0 80 64" aria-hidden="true"><path d="M8 58c10-2 14-10 20-16" fill="none" stroke="#191747" stroke-width="1.6" stroke-dasharray="3 4" stroke-linecap="round"/><path d="M28 34 76 6 60 50 44 40z" fill="#fff" stroke="#191747" stroke-width="2" stroke-linejoin="round"/><path d="M44 40 76 6 36 38l4 12z" fill="#F0E9FF" stroke="#191747" stroke-width="2" stroke-linejoin="round"/></svg>`;
}
function Otp({ params }) {
  const { nav, act, toast, setStackDirect } = useApp();
  const [code, setCode] = useState('');
  const [kb, setKb] = useState(true);
  const [err, setErr] = useState('');
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(left - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  const verify = () => {
    if (code.length < 6) { setErr('Enter all 6 digits.'); return; }
    if (code === '000000') { setErr("That code didn't match. Check the SMS or resend it."); return; }
    act((s) => { s.user.loggedIn = true; s.user.guest = false; s.user.phone = params.phone; });
    if (params.mode === 'onboard') nav.reset([['fields', { mode: 'onboard' }]]);
    else if (params.mode === 'checkout') setStackDirect((st) => [...st.slice(0, -2), mkRoute('checkout')]);
    else { nav.popN(2); toast('Logged in'); }
  };
  const type = (d) => { setErr(''); setCode((x) => (x + d).slice(0, 6)); };
  return html`<div className=${'auth otp' + (kb ? ' kb' : '')}>
    <div className="auth-top">
      <button className="round-btn dark" aria-label="Back" onClick=${nav.pop}>${I('back')}</button>
      <${PaperPlane} />
    </div>
    <div className="auth-main">
      <h1 className="auth-title caps">OTP<br />Verification</h1>
      <p className="auth-sub">OTP has been sent to +91 ${params.phone.replace(/^(\d{5})/, '$1 ')}</p>
      <p className="otp-label" id="otp-label">Enter 6 Digit OTP</p>
      <label className="otp-boxes" onClick=${() => setKb(true)}>
        <input className="sr-only" id="otp" inputMode="none" autoComplete="one-time-code" aria-labelledby="otp-label" value=${code}
          onChange=${(e) => { setErr(''); setCode(e.target.value.replace(/\D/g, '').slice(0, 6)); }} onKeyDown=${(e) => e.key === 'Enter' && verify()} autoFocus />
        ${[0, 1, 2, 3, 4, 5].map((i) => html`<span key=${i} className=${'otp-dot' + (code[i] ? ' full' : '') + (i === code.length ? ' cur' : '') + (err ? ' err' : '')}>${code[i] || ''}</span>`)}
      </label>
      <p className="field-err" role="alert">${err}</p>
      <p className="otp-resend">${left > 0 ? `Resend OTP in 0:${String(left).padStart(2, '0')}` : html`<button className="link" onClick=${() => { setLeft(30); toast('New OTP sent'); }}>Resend OTP</button>`}</p>
      <button className="btn coral" onClick=${verify}>Continue</button>
      <p className="proto-note">Prototype: any 6 digits work. Try 000000 to see the error.</p>
    </div>
    ${kb && html`<${Keypad} onKey=${type} onDel=${() => setCode((x) => x.slice(0, -1))} />`}
  </div>`;
}
function FieldsScreen({ params }) {
  const { S, act, nav, toast } = useApp();
  const onboard = params.mode === 'onboard';
  const [sel, setSel] = useState(S.user.fields);
  const [name, setName] = useState(S.user.name || '');
  const toggle = (id) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const save = (fields) => {
    act((s) => {
      s.user.fields = fields;
      if (onboard) { s.user.onboarded = true; s.user.name = name.trim() || 'there'; }
    });
    if (onboard) nav.tab('home');
    else { nav.pop(); toast('Your fields are updated'); }
  };
  return html`<div className="screen-col">
    ${onboard ? html`<div className="fields-top"><p className="eyebrow">Last step</p></div>` : html`<${TopBar} title="Your fields" sub="Choose all that apply" />`}
    <div className="stack-body pad">
      ${onboard && html`<h1 className="h-xl">What do you create?</h1>
        <p className="muted">We'll suggest materials for your field. Pick more than one if your work overlaps. You can change this anytime in Profile.</p>
        <label className="text-field"><span>What should we call you?</span><input id="first-name" value=${name} onChange=${(e) => setName(e.target.value)} placeholder="Your first name" autoComplete="given-name" /></label>`}
      <div className="field-grid" role="group" aria-label="Creative fields">
        ${FIELDS.map((f) => {
          const on = sel.includes(f.id);
          return html`<button key=${f.id} className=${'field-tile' + (on ? ' on' : '')} aria-pressed=${on} onClick=${() => toggle(f.id)} style=${{ '--tile': f.bg }}>
            <span className="field-emoji" aria-hidden="true"><${Emo} k=${f.icon} /></span>
            <span className="field-name">${f.name}</span>
            <span className="field-blurb">${f.blurb}</span>
            <span className="field-check" aria-hidden="true">${on && I('check')}</span>
          </button>`;
        })}
      </div>
    </div>
    <div className="bottom-bar col">
      <button className="btn primary" disabled=${!sel.length} onClick=${() => save(sel)}>${onboard ? (sel.length ? `Show my materials (${sel.length} field${sel.length > 1 ? 's' : ''})` : 'Pick at least one field') : 'Save'}</button>
      ${onboard && html`<button className="btn text" onClick=${() => save([])}>Skip for now</button>`}
    </div>
  </div>`;
}

/* ---------- Home ---------- */
function Home() {
  const { S, nav, openSheet, addMany, jumpToReel } = useApp();
  const addr = S.addresses.find((a) => a.id === S.addressId) || S.addresses[0];
  const fields = S.user.fields;
  const [fi, setFi] = useState(0);
  const [ph, setPh] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setPh((x) => (x + 1) % PLACEHOLDERS.length), 2600);
    return () => clearInterval(t);
  }, []);
  const field = FIELDS.find((f) => f.id === fields[Math.min(fi, fields.length - 1)]);
  const kit = field ? field.kit.map((id) => P[id]) : [];
  const essentials = kit.filter((p) => dvOf(p).stock > 0).slice(0, 4);
  const essTotal = essentials.reduce((a, p) => a + dvOf(p).price, 0);
  const deals = useMemo(() => [...PRODUCTS].filter((p) => dvOf(p).stock > 0).sort((a, b) => pctOff(dvOf(b)) - pctOff(dvOf(a))).slice(0, 10), []);
  const buyAgain = [...new Set(S.orders.filter((o) => !o.cancelled).flatMap((o) => o.items.map((i) => i.pid)))].slice(0, 8).map((id) => P[id]);
  const recent = S.recent.filter((id) => P[id]).slice(0, 8).map((id) => P[id]);
  const reels = [...REELS].sort((a, b) => b.fields.filter((f) => fields.includes(f)).length - a.fields.filter((f) => fields.includes(f)).length).slice(0, 6);
  const name = S.user.guest && !S.user.loggedIn && (!S.user.name || S.user.name === 'there') ? 'there' : S.user.name;

  return html`<div className="scroll has-nav">
    <header className="home-head">
      <div className="home-top">
        <div className="hello"><h1>Hey ${name}! <${Emo} k="wave" cls="wave" /></h1><p>Get your art supplies, faster!</p></div>
        <div className="row-gap"><${CartBtn} tone="white" /><${Avatar} onClick=${() => nav.tab('profile')} /></div>
      </div>
      <button className="loc" onClick=${() => openSheet({ type: 'address' })} aria-label=${`Delivering to ${addr.label}, ${addr.line}. Change address`}>
        ${I('pin')}<span className="loc-txt"><b>${addr.label}</b> · ${addr.line}</span>${I('chevd')}
        <span className="eta-pill">${I('bolt')} ${addr.eta} min</span>
      </button>
      <div className="search-bar">
        <button className="search-fake" onClick=${() => nav.push('search')}>${I('search')}<span>Search for “${PLACEHOLDERS[ph]}”</span></button>
        <button className="mic" aria-label="Search by voice" onClick=${() => nav.push('search', { voice: true })}>${I('mic')}</button>
      </div>
      <div className="quick-row">
        ${CATS.slice(0, 8).map((c) => html`<button key=${c.id} className="quick" onClick=${() => nav.push('plp', { cat: c.id })}><span className="quick-emoji" aria-hidden="true"><${Emo} k=${c.icon} /></span><span className="quick-label">${c.short || c.name}</span></button>`)}
      </div>
    </header>

    <section className="banner">
      <div className="banner-txt">
        <h2>Your daily art materials, buy it now!</h2>
        <p>From paints to brushes, get everything at your fingertips.</p>
        <button className="pill-btn" onClick=${() => nav.push('plp', { collection: 'deals' })}>Shop now ${I('right')}</button>
      </div>
      <div className="banner-art" aria-hidden="true"><${Art} art=${P.p1.art} /><${Art} art=${P.p13.art} /></div>
    </section>

    ${field ? html`<section className="sec">
      <${SecHead} title="Made for your field" sub="Picked for what you study and make" action="Edit" onAction=${() => nav.push('fields', { mode: 'edit' })} />
      ${fields.length > 1 && html`<div className="chips scroll-x" role="tablist" aria-label="Your fields">
        ${fields.map((id, i) => html`<button key=${id} role="tab" aria-selected=${i === fi} className=${'chip' + (i === fi ? ' on' : '')} onClick=${() => setFi(i)}>${fieldName(id)}</button>`)}
      </div>`}
      <div className="kit-card" style=${{ '--tile': field.bg }}>
        <div className="kit-txt"><span className="kit-emoji" aria-hidden="true"><${Emo} k=${field.icon} /></span><div><b>${field.name} essentials</b><p>${essentials.map((p) => p.name.split(',')[0]).join(' · ')}</p></div></div>
        <button className="btn primary sm" onClick=${() => addMany(essentials.map((p) => [p.id, p.dv, 1]), `Added ${essentials.length} essentials`)}>Add all ${essentials.length} · ${inr(essTotal)}</button>
      </div>
      <${Rail} items=${kit} />
      <button className="link pad-x" onClick=${() => nav.push('plp', { field: field.id })}>See everything for ${field.name} ${I('right')}</button>
    </section>` : html`<section className="sec pad-x">
      <button className="nudge" onClick=${() => nav.push('fields', { mode: 'edit' })}>
        <${Emo} k="target" /><span><b>Tell us what you create</b><small>Get kits for UI/UX, fashion, architecture, fine arts and more.</small></span>${I('chev')}
      </button>
    </section>`}

    <section className="sec">
      <${SecHead} title="Popular Categories" action="View all" onAction=${() => nav.tab('categories')} />
      <div className="rail cats">
        ${CATS.map((c) => html`<button key=${c.id} className="cat-tile" style=${{ background: c.bg }} onClick=${() => nav.push('plp', { cat: c.id })}><span className="cat-emoji" aria-hidden="true"><${Emo} k=${c.icon} /></span><span>${c.short || c.name}</span></button>`)}
      </div>
    </section>

    <section className="sec">
      <${SecHead} title="Best Deals" action="View all" onAction=${() => nav.push('plp', { collection: 'deals' })} />
      <${Rail} items=${deals} two />
    </section>

    ${buyAgain.length > 0 && html`<section className="sec">
      <${SecHead} title="Buy again" sub="From your past orders" action="Orders" onAction=${() => nav.tab('orders')} />
      <${Rail} items=${buyAgain} />
    </section>`}

    <section className="sec">
      <${SecHead} title="Watch before you buy" sub="Short demos of real materials" action="Explore" onAction=${() => nav.tab('explore')} />
      <div className="rail">
        ${reels.map((r) => html`<button key=${r.id} className="reel-thumb" onClick=${() => jumpToReel(r.id)} aria-label=${`Watch: ${r.title}`}>
          <span className="reel-thumb-art" dangerouslySetInnerHTML=${{ __html: sceneSvg(r.scene) }}></span>
          <span className="reel-thumb-play" aria-hidden="true">${I('play')}</span>
          <span className="reel-thumb-cap">${r.title}</span>
        </button>`)}
      </div>
    </section>

    ${recent.length > 0 && html`<section className="sec">
      <${SecHead} title="Recently viewed" />
      <${Rail} items=${recent} />
    </section>`}

    <${CartBar} />
  </div>`;
}
const _sceneCache = {};
function sceneSvg(scene) {
  if (!_sceneCache[scene]) _sceneCache[scene] = `<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">${SCENES[scene]()}</svg>`;
  return _sceneCache[scene];
}

/* ---------- Categories ---------- */
function Categories() {
  const { S, nav } = useApp();
  const [seg, setSeg] = useState('materials');
  const fieldsSorted = [...FIELDS].sort((a, b) => S.user.fields.includes(b.id) - S.user.fields.includes(a.id));
  return html`<div className="scroll has-nav">
    <header className="plain-head">
      <h1>Categories</h1>
      <div className="row-gap"><button className="round-btn" aria-label="Search" onClick=${() => nav.push('search')}>${I('search')}</button><${CartBtn} /></div>
    </header>
    <div className="seg pad-x" role="tablist" aria-label="Browse by">
      <button role="tab" aria-selected=${seg === 'materials'} className=${seg === 'materials' ? 'on' : ''} onClick=${() => setSeg('materials')}>Materials</button>
      <button role="tab" aria-selected=${seg === 'fields'} className=${seg === 'fields' ? 'on' : ''} onClick=${() => setSeg('fields')}>By field</button>
    </div>
    ${seg === 'materials' ? html`<div className="cat-grid pad-x">
      ${CATS.map((c) => html`<button key=${c.id} className="cat-cell" onClick=${() => nav.push('plp', { cat: c.id })}>
        <span className="cat-cell-ic" style=${{ background: c.bg }} aria-hidden="true"><${Emo} k=${c.icon} /></span>
        <span className="cat-cell-name">${c.name}</span>
        <span className="cat-cell-n">${PRODUCTS.filter((p) => p.cat === c.id).length} items</span>
      </button>`)}
    </div>` : html`<div className="field-list pad-x">
      ${fieldsSorted.map((f) => {
        const mine = S.user.fields.includes(f.id);
        return html`<button key=${f.id} className="field-row" onClick=${() => nav.push('plp', { field: f.id })}>
          <span className="field-row-ic" style=${{ background: f.bg }} aria-hidden="true"><${Emo} k=${f.icon} /></span>
          <span className="field-row-txt"><b>${f.name} ${mine && html`<em className="tag-mine">Your field</em>`}</b><small>${f.blurb} · ${f.kit.length} items</small></span>
          <span className="field-row-thumbs" aria-hidden="true">${f.kit.slice(0, 3).map((id) => html`<${Art} key=${id} art=${P[id].art} bg="#fff" />`)}</span>
        </button>`;
      })}
      <button className="link" onClick=${() => nav.push('fields', { mode: 'edit' })}>Change your fields ${I('right')}</button>
    </div>`}
    <${CartBar} />
  </div>`;
}

/* ---------- Filters ---------- */
function FilterBar({ f, setF, sort, setSort, brands }) {
  const [sheet, setSheet] = useState(null);
  const n = filterCount(f);
  return html`<div className="filterbar">
    <div className="chips scroll-x">
      <button className=${'chip' + (sort !== 'rel' ? ' on' : '')} onClick=${() => setSheet('sort')}>${I('sort')} ${sort === 'rel' ? 'Sort' : SORTS.find((s) => s[0] === sort)[1]} ${I('chevd')}</button>
      <button className=${'chip' + (n ? ' on' : '')} onClick=${() => setSheet('filter')}>${I('sliders')} Filters${n ? ` (${n})` : ''}</button>
      <button className=${'chip' + (f.inStock ? ' on' : '')} aria-pressed=${f.inStock} onClick=${() => setF({ ...f, inStock: !f.inStock })}>${f.inStock && I('check')} In stock</button>
      <button className=${'chip' + (f.deal ? ' on' : '')} aria-pressed=${f.deal} onClick=${() => setF({ ...f, deal: !f.deal })}>${f.deal && I('check')} 15%+ off</button>
      ${Object.entries(PRICE_BANDS).slice(0, 2).map(([k, b]) => html`<button key=${k} className=${'chip' + (f.price === k ? ' on' : '')} aria-pressed=${f.price === k} onClick=${() => setF({ ...f, price: f.price === k ? null : k })}>${b.label}</button>`)}
    </div>
    ${sheet === 'sort' && html`<${Sheet} title="Sort by" onClose=${() => setSheet(null)}>
      <div className="radio-list">${SORTS.map(([k, l]) => html`<label key=${k} className="radio-row"><input type="radio" name="sort" checked=${sort === k} onChange=${() => { setSort(k); setSheet(null); }} /><span>${l}</span></label>`)}</div>
    <//>`}
    ${sheet === 'filter' && html`<${FilterSheet} f=${f} brands=${brands} onApply=${(nf) => { setF(nf); setSheet(null); }} onClose=${() => setSheet(null)} />`}
  </div>`;
}
function FilterSheet({ f, brands, onApply, onClose }) {
  const [d, setD] = useState(f);
  const tb = (b) => setD({ ...d, brands: d.brands.includes(b) ? d.brands.filter((x) => x !== b) : [...d.brands, b] });
  return html`<${Sheet} title="Filters" onClose=${onClose} tall>
    <h4 className="sheet-sub">Price</h4>
    <div className="chips wrap">${Object.entries(PRICE_BANDS).map(([k, b]) => html`<button key=${k} className=${'chip' + (d.price === k ? ' on' : '')} aria-pressed=${d.price === k} onClick=${() => setD({ ...d, price: d.price === k ? null : k })}>${b.label}</button>`)}</div>
    <h4 className="sheet-sub">Brand</h4>
    <div className="chips wrap">${brands.map((b) => html`<button key=${b} className=${'chip' + (d.brands.includes(b) ? ' on' : '')} aria-pressed=${d.brands.includes(b)} onClick=${() => tb(b)}>${d.brands.includes(b) && I('check')} ${b}</button>`)}</div>
    <h4 className="sheet-sub">Availability and offers</h4>
    <label className="switch-row"><span>Hide out-of-stock items</span><input type="checkbox" role="switch" checked=${d.inStock} onChange=${(e) => setD({ ...d, inStock: e.target.checked })} /></label>
    <label className="switch-row"><span>Only 15% off or more</span><input type="checkbox" role="switch" checked=${d.deal} onChange=${(e) => setD({ ...d, deal: e.target.checked })} /></label>
    <div className="sheet-actions">
      <button className="btn ghost" onClick=${() => setD(NO_FILTERS)}>Clear all</button>
      <button className="btn primary" onClick=${() => onApply(d)}>Show results</button>
    </div>
  <//>`;
}
function useLoading(deps) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 380);
    return () => clearTimeout(t);
  }, deps);
  return loading;
}
function ResultsGrid({ list, loading, onClear, filtered }) {
  if (loading) return html`<${Skeleton} n=${4} />`;
  if (!list.length) return html`<${Empty} icon="sliders" title="Nothing matches these filters" text="Try removing a filter or two." cta=${filtered ? 'Clear filters' : null} onCta=${onClear} />`;
  return html`<div className="grid2">${list.map((p) => html`<${ProductCard} key=${p.id} p=${p} wide />`)}</div>`;
}

/* ---------- Product list (category, field, collection) ---------- */
function PLP({ params }) {
  const { nav, addMany } = useApp();
  const { cat, field, collection } = params;
  const c = cat && catOf(cat), fd = field && FIELDS.find((x) => x.id === field);
  const base = useMemo(() => {
    if (c) return PRODUCTS.filter((p) => p.cat === cat);
    if (fd) return fd.kit.map((id) => P[id]).concat(PRODUCTS.filter((p) => !fd.kit.includes(p.id) && p.fields.includes(field)));
    return [...PRODUCTS].filter((p) => pctOff(dvOf(p)) >= 15).sort((a, b) => pctOff(dvOf(b)) - pctOff(dvOf(a)));
  }, [cat, field, collection]);
  const subs = c ? ['All', ...new Set(base.map((p) => p.sub))] : [];
  const [sub, setSub] = useState('All');
  const [f, setF] = useState(NO_FILTERS);
  const [sort, setSort] = useState('rel');
  const loading = useLoading([sub, JSON.stringify(f), sort]);
  const list = applyFilters(sub === 'All' ? base : base.filter((p) => p.sub === sub), f, sort);
  const title = c ? c.name : fd ? fd.name : 'Best deals';
  const essentials = fd ? fd.kit.map((id) => P[id]).filter((p) => dvOf(p).stock > 0).slice(0, 4) : [];
  return html`<div className="screen-col">
    <${TopBar} title=${title} sub=${`${base.length} items`} right=${html`<button className="round-btn" aria-label="Search" onClick=${() => nav.push('search')}>${I('search')}</button><${CartBtn} />`} />
    <div className="stack-body">
      ${fd && html`<div className="kit-card pad-m" style=${{ '--tile': fd.bg }}>
        <div className="kit-txt"><span className="kit-emoji" aria-hidden="true"><${Emo} k=${fd.icon} /></span><div><b>Starter kit</b><p>${essentials.map((p) => p.name.split(',')[0]).join(' · ')}</p></div></div>
        <button className="btn primary sm" onClick=${() => addMany(essentials.map((p) => [p.id, p.dv, 1]), `Added the ${fd.name} starter kit`)}>Add all ${essentials.length} · ${inr(essentials.reduce((a, p) => a + dvOf(p).price, 0))}</button>
      </div>`}
      ${subs.length > 2 && html`<div className="chips scroll-x sub-chips" role="tablist" aria-label="Type">
        ${subs.map((s) => html`<button key=${s} role="tab" aria-selected=${sub === s} className=${'chip' + (sub === s ? ' on' : '')} onClick=${() => setSub(s)}>${s}</button>`)}
      </div>`}
      <${FilterBar} f=${f} setF=${setF} sort=${sort} setSort=${setSort} brands=${[...new Set(base.map((p) => p.brand))].sort()} />
      <p className="count-line pad-x" aria-live="polite">${loading ? 'Loading…' : `${list.length} result${list.length === 1 ? '' : 's'}`}</p>
      <${ResultsGrid} list=${list} loading=${loading} filtered=${filterCount(f) > 0 || sub !== 'All'} onClear=${() => { setF(NO_FILTERS); setSub('All'); }} />
      <div className="spacer"></div>
    </div>
    <${CartBar} inStack />
  </div>`;
}

/* ---------- Search ---------- */
function Search({ params }) {
  const { S, act, nav, viewProduct, toast } = useApp();
  const [q, setQ] = useState(params.q || '');
  const [done, setDone] = useState(params.q || null);
  const [voice, setVoice] = useState(!!params.voice);
  const [f, setF] = useState(NO_FILTERS);
  const [sort, setSort] = useState('rel');
  const inputRef = useRef();
  useEffect(() => { if (!params.voice && inputRef.current) inputRef.current.focus(); }, []);
  const submit = (term) => {
    const t = term.trim();
    if (!t) return;
    setQ(t); setDone(t); setF(NO_FILTERS); setSort('rel');
    act((s) => { s.searches = [t, ...s.searches.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6); });
    inputRef.current && inputRef.current.blur();
  };
  const typing = q.trim() && q !== done;
  const sugg = useMemo(() => {
    if (!typing) return null;
    const ql = q.toLowerCase().trim();
    return {
      cats: CATS.filter((c) => c.name.toLowerCase().includes(ql)).slice(0, 2),
      brands: BRANDS.filter((b) => b.toLowerCase().includes(ql)).slice(0, 2),
      prods: searchProducts(q).list.slice(0, 5),
    };
  }, [q, done]);
  const res = useMemo(() => (done ? searchProducts(done) : null), [done]);
  const loading = useLoading([done, JSON.stringify(f), sort]);
  const list = res ? applyFilters(res.list, f, sort) : [];

  return html`<div className="screen-col">
    <header className="search-head">
      <button className="round-btn" aria-label="Back" onClick=${nav.pop}>${I('left')}</button>
      <form className="search-input" role="search" onSubmit=${(e) => { e.preventDefault(); submit(q); }}>
        ${I('search')}
        <input id="search-q" ref=${inputRef} type="search" enterKeyHint="search" placeholder="Search paints, brands, tools…" aria-label="Search products" value=${q} onChange=${(e) => setQ(e.target.value)} autoComplete="off" />
        ${q && html`<button type="button" className="clear-x" aria-label="Clear search" onClick=${() => { setQ(''); setDone(null); inputRef.current && inputRef.current.focus(); }}>${I('x')}</button>`}
        <button type="button" className="mic" aria-label="Search by voice" onClick=${() => setVoice(true)}>${I('mic')}</button>
      </form>
    </header>
    <div className="stack-body">
      ${sugg ? html`<ul className="sugg" role="listbox" aria-label="Suggestions">
        ${sugg.cats.map((c) => html`<li key=${c.id}><button onClick=${() => nav.push('plp', { cat: c.id })}><span className="sugg-ic" style=${{ background: c.bg }} aria-hidden="true"><${Emo} k=${c.icon} /></span><span><b><${Hl} text=${c.name} q=${q} /></b><small>Category</small></span>${I('chev')}</button></li>`)}
        ${sugg.brands.map((b) => html`<li key=${b}><button onClick=${() => submit(b)}><span className="sugg-ic" aria-hidden="true">${I('tag')}</span><span><b><${Hl} text=${b} q=${q} /></b><small>Brand</small></span>${I('chev')}</button></li>`)}
        ${sugg.prods.map((p) => html`<li key=${p.id} className="sugg-prod"><button onClick=${() => viewProduct(p.id)}><span className="sugg-ic img"><${Art} art=${p.art} bg=${p.bg} /></span><span><b><${Hl} text=${p.name} q=${q} /></b><small>${p.brand} · ${inr(dvOf(p).price)}</small></span></button>
          ${dvOf(p).stock > 0 ? html`<${QuickAdd} p=${p} />` : html`<span className="sugg-oos">Out of stock</span>`}</li>`)}
        <li><button className="sugg-all" onClick=${() => submit(q)}>${I('search')}<span>See all results for “${q.trim()}”</span></button></li>
      </ul>` : done ? html`<div>
        ${res.list.length ? html`
          ${!res.exact && html`<p className="notice pad-x">${I('info')} No exact match for “${done}”. Showing related items.</p>`}
          <${FilterBar} f=${f} setF=${setF} sort=${sort} setSort=${setSort} brands=${[...new Set(res.list.map((p) => p.brand))].sort()} />
          <p className="count-line pad-x" aria-live="polite">${loading ? 'Searching…' : `${list.length} result${list.length === 1 ? '' : 's'} for “${done}”`}</p>
          <${ResultsGrid} list=${list} loading=${loading} filtered=${filterCount(f) > 0} onClear=${() => setF(NO_FILTERS)} />` : html`
          <${Empty} icon="search" title=${`No results for “${done}”`} text="Check the spelling, or try a broader word like “marker” or “paper”.">
            <div className="chips wrap center">${POPULAR.slice(0, 4).map((t) => html`<button key=${t} className="chip" onClick=${() => submit(t)}>${t}</button>`)}</div>
            <button className="btn ghost" onClick=${() => toast(`Request noted. We'll tell you if we stock “${done}”.`)}>Ask us to stock it</button>
          <//>`}
        <div className="spacer"></div>
      </div>` : html`<div className="search-idle pad-x">
        ${S.searches.length > 0 && html`<div className="idle-block">
          <div className="idle-head"><h3>Recent searches</h3><button className="link" onClick=${() => act((s) => { s.searches = []; })}>Clear</button></div>
          <div className="chips wrap">${S.searches.map((t) => html`<button key=${t} className="chip" onClick=${() => submit(t)}>${I('clock')} ${t}</button>`)}</div>
        </div>`}
        <div className="idle-block"><h3>Popular right now</h3>
          <div className="chips wrap">${POPULAR.map((t) => html`<button key=${t} className="chip" onClick=${() => submit(t)}>${t}</button>`)}</div></div>
        <div className="idle-block"><h3>Shop by brand</h3>
          <div className="chips wrap">${BRANDS.filter((b) => b !== 'quickart Basics').map((b) => html`<button key=${b} className="chip" onClick=${() => submit(b)}>${b}</button>`)}</div></div>
      </div>`}
    </div>
    ${!typing && done && html`<${CartBar} inStack />`}
    ${voice && html`<${Sheet} title="Voice search" onClose=${() => setVoice(false)}>
      <div className="voice">
        <div className="voice-bars" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
        <p className="muted">This prototype doesn't use your microphone. Tap a phrase to try the flow.</p>
        <div className="chips wrap center">${['paint brush', 'A3 sketchbook', 'cutting mat', 'Staedtler fineliner'].map((t) => html`<button key=${t} className="chip" onClick=${() => { setVoice(false); submit(t); }}>“${t}”</button>`)}</div>
      </div>
    <//>`}
  </div>`;
}

/* ---------- Product details ---------- */
function PDP({ params }) {
  const { S, nav, qty, setQty, addToCart, openSheet, buyNow, jumpToReel } = useApp();
  const p = P[params.pid];
  const [vi, setVi] = useState(params.vi != null ? params.vi : p.dv);
  const [q, setQ] = useState(1);
  const [view, setView] = useState(0);
  const [specs, setSpecs] = useState(false);
  const v = p.variants[vi];
  const inCart = qty(p.id, vi);
  const pct = pctOff(v);
  const addr = S.addresses.find((a) => a.id === S.addressId) || S.addresses[0];
  const reels = REELS.filter((r) => r.products.includes(p.id));
  const related = PRODUCTS.filter((x) => x.id !== p.id && (x.cat === p.cat || x.fields.some((f) => p.fields.includes(f)))).slice(0, 8);
  const views = [{ label: 'Product' }, { label: 'Close-up', zoom: true }, ...(reels.length ? [{ label: 'Demo video', reel: reels[0].id }] : [{ label: 'On white', white: true }])];
  const stockLine = v.stock === 0 ? ['bad', 'x', 'Out of stock'] : v.stock <= 5 ? ['warn', 'clock', `Only ${v.stock} left`] : ['good', 'check', 'In stock'];
  const [compact, setCompact] = useState(false);

  return html`<div className="screen-col">
    <header className=${'pdp-compact' + (compact ? ' show' : '')} aria-hidden=${!compact}>
      <button className="round-btn" aria-label="Back" tabIndex=${compact ? 0 : -1} onClick=${nav.pop}>${I('left')}</button>
      <${Art} art=${p.art} bg=${p.bg} cls="pdp-compact-img" />
      <div className="topbar-t"><h1>${p.name}</h1><p>${inr(v.price)} · ${v.label}</p></div>
      <${CartBtn} />
    </header>
    <div className="stack-body" onScroll=${(e) => { const c = e.currentTarget.scrollTop > 300; if (c !== compact) setCompact(c); }}>
      <div className="pdp-hero" style=${{ background: views[view].white ? '#fff' : 'var(--cream)' }}>
        <div className="pdp-hero-bar">
          <button className="round-btn lav" aria-label="Back" onClick=${nav.pop}>${I('left')}</button>
          <div className="row-gap"><${HeartBtn} pid=${p.id} cls="static" /><${CartBtn} tone="lav" /></div>
        </div>
        <${Art} art=${p.art} cls="pdp-art" zoom=${views[view].zoom} />
        ${pct >= 5 && html`<span className="off big">${pct}% OFF</span>`}
      </div>
      <div className="thumbs pad-x" role="tablist" aria-label="Product images">
        ${views.map((x, i) => html`<button key=${i} role="tab" aria-selected=${view === i} className=${'thumb' + (view === i ? ' on' : '')} aria-label=${x.label}
          onClick=${() => (x.reel ? jumpToReel(x.reel, true) : setView(i))}>
          ${x.reel ? html`<span className="thumb-reel" dangerouslySetInnerHTML=${{ __html: sceneSvg(R[x.reel].scene) }}></span><span className="thumb-play">${I('play')}</span>`
            : html`<${Art} art=${p.art} zoom=${x.zoom} bg=${x.white ? '#fff' : 'var(--cream)'} />`}
        </button>`)}
      </div>

      <div className="pdp-body pad-x">
        <button className="brand-link" onClick=${() => nav.push('search', { q: p.brand })}>${p.brand} ${I('chev')}</button>
        <h1 className="pdp-title">${p.name}</h1>
        <div className="pdp-price"><${Price} v=${v} big />${pct >= 5 && html`<span className="save">Save ${inr(v.mrp - v.price)}</span>`}</div>
        <p className="tax">Inclusive of all taxes</p>
        <p className="rating">${I('star', { fill: true, cls: 'star' })} <b>${p.rating}</b> <span>(${p.reviews.toLocaleString('en-IN')} reviews)</span></p>

        ${p.variants.length > 1 && html`<div className="variants">
          <h3 className="mini-h">Choose an option</h3>
          <div className="var-list" role="radiogroup" aria-label="Options">
            ${p.variants.map((x, i) => html`<button key=${i} role="radio" aria-checked=${vi === i} className=${'var' + (vi === i ? ' on' : '') + (x.stock === 0 ? ' oos' : '')} onClick=${() => { setVi(i); setQ(1); }}>
              <span>${x.label}</span><b>${inr(x.price)}</b>${x.stock === 0 && html`<small>Out of stock</small>`}
            </button>`)}
          </div>
        </div>`}

        <p className=${'stock ' + stockLine[0]}>${I(stockLine[1])} ${stockLine[2]}</p>

        <div className="deliv card">
          <div className="deliv-row">${I('bolt')}<div><b>Arrives in about ${addr.eta} min</b><small>to ${addr.label}, ${addr.line}</small></div>
            <button className="link" onClick=${() => openSheet({ type: 'address' })}>Change</button></div>
          <div className="deliv-row">${I('receipt')}<div><b>Delivery ${inr(DELIVERY_FEE)}, free above ${inr(FREE_OVER)}</b><small>No platform or handling fee</small></div></div>
        </div>

        <p className="desc">${p.desc}</p>

        <div className="accordion">
          <button className="acc-head" aria-expanded=${specs} onClick=${() => setSpecs(!specs)}><span>Product details</span>${I(specs ? 'minus' : 'plus')}</button>
          ${specs && html`<dl className="specs">
            <div><dt>Brand</dt><dd>${p.brand}</dd></div>
            <div><dt>Option</dt><dd>${v.label}</dd></div>
            ${Object.entries(p.specs).map(([k, val]) => html`<div key=${k}><dt>${k}</dt><dd>${val}</dd></div>`)}
          </dl>`}
        </div>

        ${p.fields.length > 0 && html`<div className="good-for"><h3 className="mini-h">Good for</h3>
          <div className="chips wrap">${p.fields.map((id) => html`<button key=${id} className=${'chip' + (S.user.fields.includes(id) ? ' on' : '')} onClick=${() => nav.push('plp', { field: id })}>${fieldName(id)}</button>`)}</div></div>`}
      </div>

      ${reels.length > 0 && html`<section className="sec">
        <${SecHead} title="See it in use" />
        <div className="rail">${reels.map((r) => html`<button key=${r.id} className="reel-thumb" onClick=${() => jumpToReel(r.id, true)} aria-label=${`Watch: ${r.title}`}>
          <span className="reel-thumb-art" dangerouslySetInnerHTML=${{ __html: sceneSvg(r.scene) }}></span><span className="reel-thumb-play" aria-hidden="true">${I('play')}</span><span className="reel-thumb-cap">${r.title}</span>
        </button>`)}</div>
      </section>`}
      <section className="sec">
        <${SecHead} title="Pairs well with" />
        <${Rail} items=${related} />
      </section>
      <div className="spacer"></div>
    </div>

    <div className="bottom-bar">
      ${v.stock === 0 ? html`<${AddBtn} p=${p} vi=${vi} />`
        : inCart ? html`<div className="qty-col"><span className="qty-label">In cart</span><${Stepper} q=${inCart} max=${v.stock} soft label=${p.name} onChange=${(n) => setQty(p.id, vi, n)} /></div>
          <button className="btn primary grow" onClick=${() => nav.push('cart')}>${I('cart')} Go to cart</button>`
        : html`<div className="qty-col"><span className="qty-label">Quantity</span><${Stepper} q=${q} max=${v.stock} soft onChange=${(n) => setQ(Math.max(1, n))} /></div>
          <button className="btn lav grow" onClick=${() => addToCart(p.id, vi, q)}>${I('cart')} Add to cart</button>
          <button className="btn primary" onClick=${() => buyNow(p.id, vi, q)}>Buy now</button>`}
    </div>
  </div>`;
}

/* ---------- Explore (reels) ---------- */
function filterReels(filter, fields) {
  if (filter === 'foryou') return [...REELS].sort((a, b) => b.fields.filter((f) => fields.includes(f)).length - a.fields.filter((f) => fields.includes(f)).length);
  if (filter === 'field') return REELS.filter((r) => r.fields.some((f) => fields.includes(f)));
  return REELS.filter((r) => r.tags.includes(filter));
}
function Reel({ r, playing, paused, onTap, onShop }) {
  const { S, act, openSheet, qty, addToCart } = useApp();
  const liked = S.liked.includes(r.id), saved = S.savedReels.includes(r.id);
  const [more, setMore] = useState(false);
  const [burst, setBurst] = useState(null);
  const tapT = useRef(null);
  const p = P[r.products[0]], v = dvOf(p), inCart = qty(p.id, p.dv) > 0;
  const toggle = (key) => act((s) => { s[key] = s[key].includes(r.id) ? s[key].filter((x) => x !== r.id) : [...s[key], r.id]; });
  const onStage = (e) => {
    const b = e.currentTarget.getBoundingClientRect();
    const pt = { x: e.clientX - b.left, y: e.clientY - b.top };
    if (tapT.current) {
      clearTimeout(tapT.current); tapT.current = null;
      if (!liked) toggle('liked');
      setBurst({ ...pt, k: Date.now() });
      return;
    }
    tapT.current = setTimeout(() => { tapT.current = null; onTap(); }, 260);
  };
  useEffect(() => () => clearTimeout(tapT.current), []);
  return html`<section className=${'reel' + (playing ? '' : ' paused')} aria-label=${`Video: ${r.title}`}>
    <div className="reel-stage" role="button" tabIndex="0" aria-label=${playing ? 'Pause video. Double-tap to like' : 'Play video'} onClick=${onStage} onKeyDown=${(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onTap())}
      style=${{ background: r.bg }} dangerouslySetInnerHTML=${{ __html: sceneSvg(r.scene) }}></div>
    <div className="reel-shade" aria-hidden="true"></div>
    <div className="reel-progress" aria-hidden="true"><i></i></div>
    ${paused && html`<div className="reel-paused" aria-hidden="true">${I('play')}</div>`}
    ${burst && html`<span key=${burst.k} className="burst" style=${{ left: burst.x, top: burst.y }} aria-hidden="true">${I('heart', { fill: true })}</span>`}
    <div className="reel-rail">
      <button className=${'rail-btn' + (liked ? ' on' : '')} aria-pressed=${liked} aria-label=${liked ? 'Unlike' : 'Like'} onClick=${() => toggle('liked')}>${I('heart', { fill: liked })}<span>${kfmt(r.likes + (liked ? 1 : 0))}</span></button>
      <button className=${'rail-btn' + (saved ? ' on' : '')} aria-pressed=${saved} aria-label=${saved ? 'Remove from saved videos' : 'Save video'} onClick=${() => toggle('savedReels')}>${I('bookmark', { fill: saved })}<span>${saved ? 'Saved' : 'Save'}</span></button>
      <button className="rail-btn" aria-label="Share" onClick=${() => openSheet({ type: 'share', rid: r.id })}>${I('share')}<span>Share</span></button>
    </div>
    <div className="reel-info">
      <p className="reel-by"><b>@${r.creator}</b> <span className="reel-field">${fieldName(r.fields[0])}</span></p>
      <p className=${'reel-cap' + (more ? ' open' : '')}>${r.title}. <span className="sim">Simulated demo clip.</span></p>
      ${!more && html`<button className="reel-more" onClick=${() => setMore(true)}>more</button>`}
      <div className="reel-prod">
        <button className="reel-prod-hit" onClick=${() => onShop(p.id)} aria-label=${`Shop ${p.name}, ${inr(v.price)}`}>
          <${Art} art=${p.art} bg=${p.bg} />
          <span className="reel-prod-txt"><b>${p.name}</b><small>${p.brand} · <strong>${inr(v.price)}</strong>${r.products.length > 1 ? ` · +${r.products.length - 1} more in video` : ''}</small></span>
        </button>
        <button className=${'reel-add' + (inCart ? ' on' : '')} onClick=${() => (inCart ? onShop(p.id) : addToCart(p.id, p.dv))} aria-label=${inCart ? 'In cart. See options' : `Add ${p.name} to cart`}>${I(inCart ? 'check' : 'plus')} ${inCart ? 'In cart' : 'Add'}</button>
      </div>
    </div>
  </section>`;
}
function ReelShopSheet({ rid, pid, onClose }) {
  const { nav, qty, setQty, addToCart } = useApp();
  const r = R[rid];
  const [cur, setCur] = useState(pid);
  const p = P[cur];
  const [vi, setVi] = useState(p.dv);
  const [q, setQ] = useState(1);
  useEffect(() => { setVi(P[cur].dv); setQ(1); }, [cur]);
  const v = p.variants[vi], inCart = qty(p.id, vi);
  return html`<${Sheet} title="Shop this video" onClose=${onClose}>
    ${r.products.length > 1 && html`<div className="shop-tabs" role="tablist" aria-label="Products in this video">
      ${r.products.map((id) => html`<button key=${id} role="tab" aria-selected=${cur === id} className=${'shop-tab' + (cur === id ? ' on' : '')} onClick=${() => setCur(id)} aria-label=${P[id].name}><${Art} art=${P[id].art} bg=${P[id].bg} /></button>`)}
    </div>`}
    <div className="shop-main">
      <${Art} art=${p.art} bg=${p.bg} cls="shop-art" />
      <div className="shop-txt"><small>${p.brand}</small><b>${p.name}</b><${Price} v=${v} /><span className="rating sm">${I('star', { fill: true, cls: 'star' })} ${p.rating}</span></div>
    </div>
    ${p.variants.length > 1 && html`<div className="var-list compact" role="radiogroup" aria-label="Options">${p.variants.map((x, i) => html`<button key=${i} role="radio" aria-checked=${vi === i} className=${'var' + (vi === i ? ' on' : '') + (x.stock === 0 ? ' oos' : '')} onClick=${() => setVi(i)}><span>${x.label}</span><b>${inr(x.price)}</b>${x.stock === 0 && html`<small>Out of stock</small>`}</button>`)}</div>`}
    <div className="shop-actions">
      ${v.stock === 0 ? html`<${AddBtn} p=${p} vi=${vi} />` : inCart ? html`<${Stepper} q=${inCart} max=${v.stock} soft onChange=${(n) => setQty(p.id, vi, n)} /><button className="btn primary grow" onClick=${() => { onClose(); nav.push('cart'); }}>Go to cart</button>`
        : html`<${Stepper} q=${q} max=${v.stock} soft onChange=${(n) => setQ(Math.max(1, n))} /><button className="btn primary grow" onClick=${() => addToCart(p.id, vi, q)}>${I('cart')} Add to cart · ${inr(v.price * q)}</button>`}
    </div>
    <button className="btn text" onClick=${() => { onClose(); nav.push('pdp', { pid: p.id, vi }); }}>View full details ${I('right')}</button>
  <//>`;
}
const HINT_KEY = 'quickart-reel-hint';
function Feed({ reels, active, start, onStarted }) {
  const ref = useRef();
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [shop, setShop] = useState(null);
  const [hint, setHint] = useState(() => { try { return !localStorage.getItem(HINT_KEY); } catch (e) { return true; } });
  const hideHint = () => { if (!hint) return; setHint(false); try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* ignore */ } };
  useEffect(() => {
    if (!active || !hint) return;
    const t = setTimeout(hideHint, 5000);
    return () => clearTimeout(t);
  }, [active, hint]);
  useEffect(() => {
    if (!active || shop) return;
    const k = (e) => {
      if (e.target.closest('input, textarea') || !ref.current) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        ref.current.scrollBy({ top: (e.key === 'ArrowDown' ? 1 : -1) * ref.current.clientHeight, behavior: 'smooth' });
      }
    };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [active, shop]);
  useEffect(() => {
    if (!start || !ref.current) return;
    const i = reels.findIndex((r) => r.id === start.rid);
    if (i >= 0) { ref.current.scrollTop = i * ref.current.clientHeight; setIdx(i); setPaused(false); }
    onStarted && onStarted();
  }, [start]);
  const onScroll = () => {
    const el = ref.current;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== idx) { setIdx(i); setPaused(false); hideHint(); }
  };
  return html`<div className="feed" ref=${ref} onScroll=${onScroll}>
    ${hint && active && html`<button className="reel-hint" onClick=${hideHint}><span className="reel-hint-arrow">${I('chevd')}</span><b>Swipe up for the next demo</b><small>Double-tap to like · Tap to pause</small></button>`}
    ${reels.map((r, i) => html`<${Reel} key=${r.id} r=${r} playing=${active && i === idx && !paused && !shop} paused=${paused && i === idx}
      onTap=${() => setPaused((x) => !x)} onShop=${(pid) => setShop({ rid: r.id, pid })} />`)}
    ${shop && html`<${ReelShopSheet} rid=${shop.rid} pid=${shop.pid} onClose=${() => setShop(null)} />`}
  </div>`;
}
function Explore({ active }) {
  const { S, jump, clearJump, nav } = useApp();
  const [filter, setFilter] = useState('foryou');
  useEffect(() => { if (jump) setFilter('foryou'); }, [jump]);
  const fkey = S.user.fields.join();
  const list = useMemo(() => filterReels(filter, S.user.fields), [filter, fkey]);
  return html`<div className="explore">
    ${list.length ? html`<${Feed} key=${filter} reels=${list} active=${active} start=${filter === 'foryou' ? jump : null} onStarted=${clearJump} />`
      : html`<div className="feed-empty"><${Empty} icon="video" title="Pick your field to see videos for it" text="We'll show demos of materials used in your discipline." cta="Choose fields" onCta=${() => nav.push('fields', { mode: 'edit' })} /></div>`}
    <div className="explore-top">
      <div className="explore-title"><h1>Explore</h1><${CartBtn} dark /></div>
      <div className="chips scroll-x dark" role="tablist" aria-label="Video topics">
        ${EXPLORE_FILTERS.map(([k, l]) => html`<button key=${k} role="tab" aria-selected=${filter === k} className=${'chip' + (filter === k ? ' on' : '')} onClick=${() => setFilter(k)}>${l}</button>`)}
      </div>
    </div>
  </div>`;
}
function ReelsScreen({ params }) {
  const { nav } = useApp();
  const [start, setStart] = useState({ rid: params.rid });
  const reels = useMemo(() => [R[params.rid], ...REELS.filter((r) => r.id !== params.rid)], [params.rid]);
  return html`<div className="screen-col dark-screen">
    <div className="explore stacked">
      <${Feed} reels=${reels} active=${true} start=${start} onStarted=${() => setStart(null)} />
      <div className="explore-top"><div className="explore-title"><button className="round-btn on-dark" aria-label="Back" onClick=${nav.pop}>${I('left')}</button><${CartBtn} dark /></div></div>
    </div>
  </div>`;
}

/* ---------- Cart and checkout ---------- */
function Cart() {
  const { S, act, nav, cart, setQty, toast, proceed } = useApp();
  const [confirmClear, setConfirmClear] = useState(false);
  const inCartIds = cart.lines.map((l) => l.pid);
  const fieldsPool = S.user.fields.length ? FIELDS.filter((f) => S.user.fields.includes(f.id)).flatMap((f) => f.kit) : [];
  const also = [...new Set([...fieldsPool, ...cart.lines.flatMap((l) => PRODUCTS.filter((x) => x.cat === l.p.cat).map((x) => x.id)), 'p12', 'p29', 'p19'])]
    .filter((id) => !inCartIds.includes(id) && dvOf(P[id]).stock > 0).slice(0, 8).map((id) => P[id]);
  const remove = (l) => { setQty(l.pid, l.vi, 0); toast(`Removed ${l.p.name}`, { label: 'Undo', fn: () => setQty(l.pid, l.vi, l.qty) }); };
  const saveForLater = (l) => {
    act((s) => { delete s.cart[l.key]; if (!s.saved.includes(l.pid)) s.saved.push(l.pid); });
    toast('Moved to saved items', { label: 'Undo', fn: () => act((s) => { s.cart[l.key] = l.qty; }) });
  };
  return html`<div className="screen-col">
    <header className="lav-head">
      <button className="round-btn white" aria-label="Back" onClick=${nav.pop}>${I('left')}</button>
      <div className="topbar-t"><h1>My Cart</h1><p>${cart.count ? 'Almost there!' : 'Nothing here yet'}</p></div>
      ${cart.count > 0 && html`<button className="pill-outline" onClick=${() => setConfirmClear(true)}>${I('trash')} Clear Cart</button>`}
      <${Avatar} />
    </header>
    <div className="stack-body">
      ${confirmClear && html`<div className="confirm pad-m" role="alertdialog" aria-label="Clear cart">
        <p>Remove all ${cart.count} items from your cart?</p>
        <div className="row-gap"><button className="btn ghost sm" onClick=${() => setConfirmClear(false)}>Keep items</button><button className="btn danger sm" onClick=${() => { act((s) => { s.cart = {}; }); setConfirmClear(false); toast('Cart cleared'); }}>Clear cart</button></div>
      </div>`}
      ${!cart.count ? html`<${Empty} icon="cart" title="Your cart is empty" text="Add paints, paper or tools and they'll show up here." cta="Browse best deals" onCta=${() => nav.replace('plp', { collection: 'deals' })} />` : html`
        <div className="cart-list pad-x">
          ${cart.lines.map((l) => html`<article key=${l.key} className="cart-item">
            <button className="cart-img" style=${{ background: l.p.bg }} onClick=${() => nav.push('pdp', { pid: l.pid, vi: l.vi })} aria-label=${`Open ${l.p.name}`}><${Art} art=${l.p.art} /></button>
            <div className="cart-info">
              <b className="cart-name">${l.p.brand}</b>
              <span className="cart-sub">${l.p.name}</span>
              <span className="cart-var">${l.v.label}</span>
              <${Price} v=${l.v} />
              <div className="cart-row">
                <${Stepper} q=${l.qty} max=${l.v.stock} soft label=${l.p.name} onChange=${(n) => (n <= 0 ? remove(l) : setQty(l.pid, l.vi, n))} />
                ${l.qty > 1 && html`<span className="line-total">${inr(l.price * l.qty)}</span>`}
              </div>
            </div>
            <div className="cart-acts">
              <button className="mini-round" aria-label=${`Save ${l.p.name} for later`} onClick=${() => saveForLater(l)}>${I('heart')}</button>
              <button className="mini-round dark" aria-label=${`Remove ${l.p.name}`} onClick=${() => remove(l)}>${I('x')}</button>
            </div>
          </article>`)}
        </div>
        <div className="pad-x"><${FreeDelivery} b=${cart.bill} /></div>
        ${also.length > 0 && html`<section className="sec"><${SecHead} title="You may also like" /><div className="rail">${also.map((p) => html`<${MiniCard} key=${p.id} p=${p} />`)}</div></section>`}
        <div className="pad-x"><${BillCard} b=${cart.bill} /></div>
        <div className="spacer"></div>`}
    </div>
    ${cart.count > 0 && html`<div className="bottom-bar col">
      <div className="sum-bar">
        <div className="sum-cell"><span className="sum-ic">${I('cart')}<span className="badge">${cart.count}</span></span><div><b>${cart.count} item${cart.count === 1 ? '' : 's'}</b><small>Total items</small></div></div>
        <div className="sum-cell end"><div><small>Total amount</small><b>${inr(cart.bill.total)}</b></div></div>
      </div>
      <button className="btn primary" onClick=${proceed}>Proceed to pay ${I('right')}</button>
    </div>`}
  </div>`;
}
function AddressForm({ onSave, onCancel }) {
  const [d, setD] = useState({ label: 'Home', line: '', area: '' });
  const [err, setErr] = useState({});
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (d.line.trim().length < 4) er.line = 'Add your flat, room or house number.';
    if (d.area.trim().length < 3) er.area = 'Add an area or landmark so the rider can find you.';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...d, id: 'a' + Date.now(), eta: 10 + Math.floor(Math.random() * 10) });
  };
  return html`<form className="addr-form" onSubmit=${save} noValidate>
    <div className="chips wrap" role="radiogroup" aria-label="Save as">${['Home', 'Hostel', 'Studio', 'College', 'Other'].map((l) => html`<button type="button" key=${l} role="radio" aria-checked=${d.label === l} className=${'chip' + (d.label === l ? ' on' : '')} onClick=${() => setD({ ...d, label: l })}>${l}</button>`)}</div>
    <label className="text-field"><span>Flat, room or house no.</span><input id="addr-line" value=${d.line} onChange=${(e) => setD({ ...d, line: e.target.value })} aria-invalid=${!!err.line} placeholder="e.g. Room 12, Girls Hostel B" />${err.line && html`<em className="field-err">${err.line}</em>`}</label>
    <label className="text-field"><span>Area and landmark</span><input id="addr-area" value=${d.area} onChange=${(e) => setD({ ...d, area: e.target.value })} aria-invalid=${!!err.area} placeholder="e.g. Near CEPT gate, Navrangpura" />${err.area && html`<em className="field-err">${err.area}</em>`}</label>
    <div className="row-gap end">${onCancel && html`<button type="button" className="btn ghost sm" onClick=${onCancel}>Cancel</button>`}<button type="submit" className="btn primary sm">Save address</button></div>
  </form>`;
}
function AddressPicker({ onPicked }) {
  const { S, act, toast } = useApp();
  const [adding, setAdding] = useState(false);
  return html`<div className="addr-list">
    ${S.addresses.map((a) => html`<label key=${a.id} className=${'radio-card' + (S.addressId === a.id ? ' on' : '')}>
      <input type="radio" name="addr" checked=${S.addressId === a.id} onChange=${() => { act((s) => { s.addressId = a.id; }); onPicked && onPicked(); }} />
      <span className="rc-ic">${I('pin')}</span>
      <span className="rc-txt"><b>${a.label}</b><small>${a.line}, ${a.area}</small></span>
      <span className="rc-eta">${a.eta} min</span>
    </label>`)}
    ${adding ? html`<${AddressForm} onCancel=${() => setAdding(false)} onSave=${(a) => { act((s) => { s.addresses.push(a); s.addressId = a.id; }); setAdding(false); toast('Address saved'); onPicked && onPicked(); }} />`
      : html`<button className="add-row" onClick=${() => setAdding(true)}>${I('plus')} Add a new address</button>`}
  </div>`;
}
function Checkout() {
  const { S, act, nav, cart } = useApp();
  const [items, setItems] = useState(false);
  const [upiErr, setUpiErr] = useState('');
  const addr = S.addresses.find((a) => a.id === S.addressId) || S.addresses[0];
  if (!cart.count) return html`<div className="screen-col"><${TopBar} title="Checkout" /><${Empty} icon="cart" title="Your cart is empty" cta="Go to home" onCta=${() => nav.tab('home')} /></div>`;
  const pay = () => {
    if (S.pay === 'upi' && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(S.upi.trim())) { setUpiErr('Enter a UPI ID like name@bank.'); return; }
    nav.push('paying');
  };
  const slotOpts = [['now', `Now, in about ${addr.eta} min`], ['eve', SLOTS.eve], ['tmr', SLOTS.tmr]];
  return html`<div className="screen-col">
    <${TopBar} title="Checkout" sub=${`${cart.count} items · ${inr(cart.bill.total)}`} />
    <div className="stack-body pad-x">
      <section className="co-sec"><h2>${I('pin')} Deliver to</h2><${AddressPicker} /></section>
      <section className="co-sec"><h2>${I('clock')} When</h2>
        <div className="radio-list">${slotOpts.map(([k, l]) => html`<label key=${k} className=${'radio-card slim' + (S.slot === k ? ' on' : '')}><input type="radio" name="slot" checked=${S.slot === k} onChange=${() => act((s) => { s.slot = k; })} /><span className="rc-txt"><b>${l}</b>${k === 'now' && html`<small>Same price at any time of day</small>`}</span></label>`)}</div>
      </section>
      <section className="co-sec"><h2>${I('card')} Pay with</h2>
        <div className="radio-list">
          <label className=${'radio-card' + (S.pay === 'upi' ? ' on' : '')}><input type="radio" name="pay" checked=${S.pay === 'upi'} onChange=${() => act((s) => { s.pay = 'upi'; })} /><span className="rc-ic">${I('upi')}</span><span className="rc-txt"><b>UPI</b><small>GPay, PhonePe, Paytm or any UPI app</small></span></label>
          ${S.pay === 'upi' && html`<label className="text-field inset"><span>UPI ID</span><input id="upi-id" value=${S.upi} onChange=${(e) => { setUpiErr(''); act((s) => { s.upi = e.target.value; }); }} aria-invalid=${!!upiErr} autoComplete="off" />${upiErr && html`<em className="field-err" role="alert">${upiErr}</em>`}</label>`}
          <label className=${'radio-card' + (S.pay === 'card' ? ' on' : '')}><input type="radio" name="pay" checked=${S.pay === 'card'} onChange=${() => act((s) => { s.pay = 'card'; })} /><span className="rc-ic">${I('card')}</span><span className="rc-txt"><b>Card</b><small>Saved Visa ending 4242 (sample)</small></span></label>
          <label className=${'radio-card' + (S.pay === 'cod' ? ' on' : '')}><input type="radio" name="pay" checked=${S.pay === 'cod'} onChange=${() => act((s) => { s.pay = 'cod'; })} /><span className="rc-ic">${I('cash')}</span><span className="rc-txt"><b>Pay on delivery</b><small>Cash or UPI at your door. No extra fee.</small></span></label>
        </div>
      </section>
      <section className="co-sec">
        <button className="acc-head" aria-expanded=${items} onClick=${() => setItems(!items)}><span>${cart.count} items in this order</span>${I(items ? 'minus' : 'plus')}</button>
        ${items && html`<ul className="co-items">${cart.lines.map((l) => html`<li key=${l.key}><${Art} art=${l.p.art} bg=${l.p.bg} /><span>${l.p.name}<small>${l.v.label} × ${l.qty}</small></span><b>${inr(l.price * l.qty)}</b></li>`)}</ul>`}
      </section>
      <${BillCard} b=${cart.bill} />
      <div className="spacer"></div>
    </div>
    <div className="bottom-bar">
      <div className="pay-total"><small>To pay</small><b>${inr(cart.bill.total)}</b></div>
      <button className="btn primary grow" onClick=${pay}>${I('lock')} ${S.pay === 'cod' ? 'Place order' : `Pay ${inr(cart.bill.total)}`}</button>
    </div>
  </div>`;
}
function Paying() {
  const { S, act, nav, placeOrder } = useApp();
  const [st, setSt] = useState('wait');
  const [run, setRun] = useState(0);
  useEffect(() => {
    setSt('wait');
    const t = setTimeout(() => {
      if (S.failNext && S.pay !== 'cod') { act((s) => { s.failNext = false; }); setSt('fail'); }
      else { const oid = placeOrder(); nav.go('home', [['confirm', { oid }]]); }
    }, 1900);
    return () => clearTimeout(t);
  }, [run]);
  const msg = { upi: 'Approve the request in your UPI app.', card: 'Confirming with your bank.', cod: 'Confirming your order with the store.' }[S.pay];
  if (st === 'fail') return html`<div className="screen-col center-col pad-x">
    <span className="result-ic bad">${I('x')}</span>
    <h1 className="h-xl">Payment didn't go through</h1>
    <p className="muted">Your bank declined the payment. No money was taken and your cart is saved. If an amount was debited, it returns within 3 to 5 working days.</p>
    <div className="col-gap"><button className="btn primary" onClick=${() => setRun(run + 1)}>Try again</button><button className="btn ghost" onClick=${nav.pop}>Change payment method</button></div>
  </div>`;
  return html`<div className="screen-col center-col pad-x" aria-busy="true">
    <span className="spinner" aria-hidden="true"></span>
    <h1 className="h-l">${S.pay === 'cod' ? 'Placing your order' : 'Processing payment'}</h1>
    <p className="muted">${msg}</p>
    <p className="proto-note">Prototype: no real payment is made.</p>
    <button className="btn text" onClick=${nav.pop}>Cancel</button>
  </div>`;
}
function Confirm({ params }) {
  const { S, nav } = useApp();
  const o = S.orders.find((x) => x.id === params.oid);
  if (!o) return html`<div className="screen-col"><${Empty} icon="orders" title="Order not found" cta="Go home" onCta=${() => nav.tab('home')} /></div>`;
  return html`<div className="screen-col">
    <div className="stack-body pad-x confirm-body">
      <span className="result-ic good pop-in">${I('check')}</span>
      <h1 className="h-xl">Order placed!</h1>
      <p className="muted">${o.slot === 'now' ? `Arriving in about ${o.eta} minutes` : `Scheduled for ${SLOTS[o.slot]}`} at ${o.address.label}.</p>
      <div className="card receipt">
        <div className="bill-row"><span>Order ID</span><b>#${o.id}</b></div>
        <div className="bill-row"><span>Items</span><span>${o.items.reduce((a, i) => a + i.qty, 0)}</span></div>
        <div className="bill-row"><span>Paid via</span><span>${PAYS[o.pay].label}</span></div>
        <div className="bill-row total"><span>${o.pay === 'cod' ? 'To pay on delivery' : 'Amount paid'}</span><span>${inr(o.bill.total)}</span></div>
      </div>
      <div className="thumb-strip">${o.items.map((i) => html`<${Art} key=${i.pid + i.vi} art=${P[i.pid].art} bg=${P[i.pid].bg} />`)}</div>
    </div>
    <div className="bottom-bar col">
      <button className="btn primary" onClick=${() => nav.go('orders', [['order', { oid: o.id }]])}>Track order</button>
      <button className="btn text" onClick=${() => nav.tab('home')}>Continue shopping</button>
    </div>
  </div>`;
}

/* ---------- Live tracking map ----------
   A schematic map drawn in-app: the artifact sandbox blocks map tiles, so a real map
   (Google Maps, Mapbox) would need an API key and backend in production. 1 unit ≈ 6 m. */
const MAP = {
  store: [115, 104],
  home: [276, 255],
  route: [[115, 104], [115, 120], [230, 120], [230, 255], [276, 255]],
  frame: [92, 76, 296, 272], // route plus marker labels, framed on load
  bounds: [-40, -40, 440, 440],
};
const RIDER = { name: 'Ravi Kumar', initial: 'R', rating: 4.8, vehicle: 'Electric scooter', plate: 'GJ 01 EV 4412', masked: '+91 •••• ••4412' };
function routeLen(pts) {
  let L = 0;
  for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return L;
}
const ROUTE_LEN = routeLen(MAP.route);
function routeAt(pts, f) {
  let d = Math.max(0, Math.min(1, f)) * ROUTE_LEN;
  const done = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const seg = Math.hypot(x1 - x0, y1 - y0);
    if (d <= seg) {
      const t = seg ? d / seg : 0, p = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
      done.push(p);
      return { pt: p, done };
    }
    d -= seg;
    done.push(pts[i]);
  }
  return { pt: pts[pts.length - 1], done };
}
function riderFrac(o, now) {
  const m = (((now - o.placedAt) / 1000) * SPEED) / 60;
  return Math.max(0, Math.min(1, (m - STAGE_MIN.out) / Math.max(1, o.eta - STAGE_MIN.out)));
}
const kmLeft = (frac) => ((1 - frac) * ROUTE_LEN * 0.006).toFixed(1);
const MAP_BASE = (() => {
  const xs = [-200, 80, 150, 230, 300], ys = [-200, 120, 210, 300, 640];
  let s = '<rect x="-300" y="-300" width="1000" height="1000" fill="#F3EFFB"/>';
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const x0 = xs[i] + 10, x1 = xs[i + 1] - 10, y0 = ys[j] + 10, y1 = ys[j + 1] - 10;
    if (i === 1 && j === 2) { // park
      s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="6" fill="#DCEFD8"/>`;
      [[96, 236], [118, 248], [134, 230], [104, 270], [130, 276], [114, 288]].forEach(([cx, cy]) => (s += `<circle cx="${cx}" cy="${cy}" r="6" fill="#C3E2BC"/>`));
      continue;
    }
    if (i === 3 && j === 2) { // campus
      s += `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" rx="6" fill="#E6EBFB"/>`;
      s += `<rect x="248" y="226" width="20" height="16" rx="2" fill="#D3DBF6"/><rect x="250" y="266" width="28" height="18" rx="2" fill="#D3DBF6"/>`;
      continue;
    }
    const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
    [[x0, y0, mx - 4, my - 4], [mx + 4, y0, x1, my - 4], [x0, my + 4, mx - 4, y1], [mx + 4, my + 4, x1, y1]].forEach(([a, b, c, d]) => {
      if (c - a > 6 && d - b > 6) s += `<rect x="${a}" y="${b}" width="${c - a}" height="${d - b}" rx="3" fill="#E8E1F7"/>`;
    });
  }
  s += '<path d="M336 -300 C 316 40, 352 220, 322 640" fill="none" stroke="#CFE0F7" stroke-width="54"/>';
  s += '<path d="M336 -300 C 316 40, 352 220, 322 640" fill="none" stroke="#C2D6F4" stroke-width="2" stroke-dasharray="6 10"/>';
  const road = (d, w) => `<path d="${d}" fill="none" stroke="#DDD3F2" stroke-width="${w + 3}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#FFFFFF" stroke-width="${w}" stroke-linecap="round"/>`;
  s += road('M-300 120 H640', 14) + road('M230 -300 V640', 14) + road('M80 -300 V640', 12) + road('M-300 300 H300', 12);
  s += road('M150 120 V640', 8) + road('M-300 210 H300', 8) + road('M115 96 V120', 6) + road('M230 255 H290', 6);
  const label = (x, y, t, rot, size) => `<text x="${x}" y="${y}" ${rot ? `transform="rotate(${rot} ${x} ${y})"` : ''} font-family="Inter, sans-serif" font-size="${size || 8}" fill="#8E8AB5" text-anchor="middle" paint-order="stroke" stroke="#F3EFFB" stroke-width="3">${t}</text>`;
  s += label(176, 116.5, 'Main Road') + label(226.5, 180, 'Riverside Road', -90) + label(115, 258, 'Park') + label(352, 120, 'Sabarmati River', -84, 9) + label(46, 300.5, 'Station Road');
  return s;
})();
function MapPinIcon({ name, size = 14, color = '#fff', x = 0, y = 0 }) {
  return html`<svg x=${x - size / 2} y=${y - size / 2} width=${size} height=${size} viewBox="0 0 24 24" fill="none" stroke=${color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML=${{ __html: ICON_PATHS[name] }}></svg>`;
}
function TrackMap({ o, st, now, compact }) {
  const out = st.key === 'out';
  const frac = out ? riderFrac(o, now) : 0;
  const { pt, done } = routeAt(MAP.route, frac);
  const rider = out ? pt : [MAP.store[0] + 14, MAP.store[1] + 2];
  const boxRef = useRef();
  const [size, setSize] = useState(compact ? { w: 330, h: 132 } : { w: 390, h: 400 });
  useEffect(() => {
    if (!boxRef.current || !window.ResizeObserver) return;
    const ro = new ResizeObserver(([e]) => { const r = e.contentRect; if (r.width && r.height) setSize({ w: r.width, h: r.height }); });
    ro.observe(boxRef.current);
    return () => ro.disconnect();
  }, []);
  // Screen area left visible around the floating header, controls and bottom sheet (px)
  const pad = compact ? { t: 10, r: 10, b: 10, l: 10 } : { t: 112, r: 64, b: 44, l: 14 };
  const availW = size.w - pad.l - pad.r, availH = size.h - pad.t - pad.b;
  const cx = pad.l + availW / 2, cy = pad.t + availH / 2; // visible centre in px
  const fit = () => {
    const [x0, y0, x1, y1] = MAP.frame;
    const s = Math.min(availW / (x1 - x0), availH / (y1 - y0));
    return [(x0 + x1) / 2 - cx / s, (y0 + y1) / 2 - cy / s, size.w / s, size.h / s];
  };
  const [vb, setVb] = useState(null); // null = fit the whole route
  const [follow, setFollow] = useState(false);
  const svgRef = useRef();
  const drag = useRef(null);
  const base = vb || fit();
  const scaleNow = size.w / base[2];
  const view = follow && out ? [rider[0] - cx / scaleNow, rider[1] - cy / scaleNow, base[2], base[3]] : base;
  const clampV = ([x, y, w, h]) => {
    const [bx0, by0, bx1, by1] = MAP.bounds;
    return [Math.min(Math.max(x, bx0), Math.max(bx0, bx1 - w)), Math.min(Math.max(y, by0), Math.max(by0, by1 - h)), w, h];
  };
  const down = (e) => {
    if (compact || e.target.closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, v: view };
    setFollow(false);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const r = svgRef.current.getBoundingClientRect(), v = drag.current.v;
    const k = 1 / Math.max(r.width / v[2], r.height / v[3]);
    setVb(clampV([v[0] - (e.clientX - drag.current.x) * k, v[1] - (e.clientY - drag.current.y) * k, v[2], v[3]]));
  };
  const up = () => { drag.current = null; };
  const zoom = (f) => {
    const v = view, s0 = size.w / v[2];
    const s1 = Math.min(4, Math.max(0.6, s0 / f));
    const fx = v[0] + cx / s0, fy = v[1] + cy / s0; // keep the visible centre fixed
    setVb(clampV([fx - cx / s1, fy - cy / s1, size.w / s1, size.h / s1]));
  };
  const locate = () => {
    if (out && !follow) {
      const s = Math.max(scaleNow, 1.9);
      setVb([0, 0, size.w / s, size.h / s]);
      setFollow(true);
    } else { setFollow(false); setVb(null); }
  };
  const pts = (arr) => arr.map((p) => p.join(',')).join(' ');
  const [hx, hy] = MAP.home, [sx, sy] = MAP.store;
  const label = out ? `Delivery partner is ${st.left} minutes and ${kmLeft(frac)} km away` : st.key === 'placed' ? 'Order confirmed at the store' : 'Order packed at the store';
  return html`<div ref=${boxRef} className=${'track-map' + (compact ? ' compact' : '')} onPointerDown=${down} onPointerMove=${move} onPointerUp=${up} onPointerCancel=${up}>
    <svg ref=${svgRef} viewBox=${view.map((n) => n.toFixed(1)).join(' ')} preserveAspectRatio="xMidYMid slice" role="img" aria-label=${'Map. ' + label}>
      <g dangerouslySetInnerHTML=${{ __html: MAP_BASE }}></g>
      <polyline points=${pts(MAP.route)} fill="none" stroke="#B9A6F5" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="0.1 9" />
      ${out && html`<polyline points=${pts(done)} fill="none" stroke="#6842D8" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />`}
      <g>
        <circle cx=${sx} cy=${sy} r="11" fill="#fff" stroke="#6842D8" strokeWidth="2.5" />
        <${MapPinIcon} name="bag" size=${12} color="#6842D8" x=${sx} y=${sy} />
        ${!compact && html`<text x=${sx} y=${sy - 17} className="map-label" textAnchor="middle">quickart store</text>`}
      </g>
      <g>
        <circle className="map-pulse" cx=${hx} cy=${hy} r="10" fill="#6842D8" opacity=".35" />
        <path d=${`M${hx} ${hy} l-10 -13 a13 13 0 1 1 20 0 z`} fill="#4921C9" stroke="#fff" strokeWidth="2" />
        <${MapPinIcon} name="home" size=${11} x=${hx} y=${hy - 21} />
        ${!compact && out && html`<g transform=${`translate(${hx} ${hy - 48})`}>
          <rect x="-22" y="-11" width="44" height="20" rx="10" fill="#191747" />
          <text x="0" y="3" className="map-eta" textAnchor="middle">${st.left} min</text>
        </g>`}
        ${!compact && !out && html`<text x=${hx} y=${hy + 14} className="map-label" textAnchor="middle">${o.address.label}</text>`}
      </g>
      <g className="map-rider" style=${{ transform: `translate(${rider[0].toFixed(2)}px, ${rider[1].toFixed(2)}px)` }}>
        <ellipse cx="0" cy="12" rx="10" ry="3" fill="#191747" opacity=".15" />
        <circle r="13" fill="#D94A9A" stroke="#fff" strokeWidth="3" />
        <${MapPinIcon} name="bike" size=${15} />
      </g>
    </svg>
    ${!compact && html`
      <span className="map-live"><i aria-hidden="true"></i>${out ? 'Live tracking' : st.key === 'placed' ? 'Assigning partner' : 'Packing your order'}</span>
      <div className="map-ctrl">
        <button aria-label="Zoom in" onClick=${() => zoom(0.75)}>${I('plus')}</button>
        <button aria-label="Zoom out" onClick=${() => zoom(1.33)}>${I('minus')}</button>
        <button aria-label=${out && !follow ? 'Follow delivery partner' : 'Show full route'} aria-pressed=${follow} className=${follow ? 'on' : ''} onClick=${locate}>${I(follow ? 'nav' : 'locate')}</button>
      </div>`}
  </div>`;
}
function RiderCard({ st, onCall, onChat }) {
  if (st.key === 'placed') {
    return html`<div className="rider-card pending"><span className="spinner sm" aria-hidden="true"></span><div className="rider-txt"><b>Assigning a delivery partner</b><small>Usually takes under a minute</small></div></div>`;
  }
  return html`<div className="rider-card">
    <span className="rider-av" aria-hidden="true">${RIDER.initial}<i>${I('bike')}</i></span>
    <div className="rider-txt">
      <b>${RIDER.name}</b>
      <small>${I('star', { fill: true, cls: 'star' })} ${RIDER.rating} · ${RIDER.vehicle}</small>
      <small className="rider-plate">${RIDER.plate}</small>
    </div>
    <button className="round-btn lav" aria-label="Call delivery partner" onClick=${onCall}>${I('phone')}</button>
    <button className="round-btn lav" aria-label="Message delivery partner" onClick=${onChat}>${I('chat')}</button>
  </div>`;
}
function RiderChat({ o, st, onClose }) {
  const [msgs, setMsgs] = useState([{ me: false, t: `Hi, I'm ${RIDER.name.split(' ')[0]}, delivering your quickart order. Anything I should know?` }]);
  const [typing, setTyping] = useState(false);
  const opts = [`Leave it at the ${o.address.label.toLowerCase()} reception`, 'Call me when you arrive', "I'm coming down now", 'Please hurry, I have a submission'];
  const replies = ['Okay, I will leave it there and send you a photo.', 'Sure, I will call you once I reach.', 'Great, see you at the gate.', 'Understood, I am on the fastest route.'];
  const pick = (i) => {
    setMsgs((m) => [...m, { me: true, t: opts[i] }]);
    setTyping(true);
    setTimeout(() => { setTyping(false); setMsgs((m) => [...m, { me: false, t: replies[i] }]); }, 1100);
  };
  return html`<${Sheet} title=${`Chat with ${RIDER.name.split(' ')[0]}`} onClose=${onClose}>
    <div className="chat" aria-live="polite">
      ${msgs.map((m, i) => html`<p key=${i} className=${'bubble' + (m.me ? ' me' : '')}>${m.t}</p>`)}
      ${typing && html`<p className="bubble typing" aria-label="Typing"><i></i><i></i><i></i></p>`}
    </div>
    <div className="chips wrap">${opts.map((t, i) => html`<button key=${i} className="chip" onClick=${() => pick(i)}>${t}</button>`)}</div>
    <p className="proto-note">Chat is simulated in this prototype.</p>
  <//>`;
}
function CallSheet({ onClose }) {
  const { toast } = useApp();
  return html`<${Sheet} title=${`Call ${RIDER.name.split(' ')[0]}`} onClose=${onClose}>
    <div className="call-sheet">
      <span className="rider-av lg" aria-hidden="true">${RIDER.initial}</span>
      <b>${RIDER.name}</b>
      <p className="muted">${RIDER.masked}</p>
      <p className="call-note">${I('shield')} Calls go through a masked number, so neither of you sees the other's real number.</p>
      <button className="btn primary" onClick=${() => { onClose(); toast('Calling is simulated in this prototype'); }}>${I('phone')} Call now</button>
    </div>
  <//>`;
}

/* ---------- Orders ---------- */
function StageDots({ idx }) {
  return html`<ol className="stage-dots" aria-label="Order progress">
    ${STAGES.map(([k, l], i) => html`<li key=${k} className=${i < idx ? 'done' : i === idx ? 'now' : ''}><span className="dot">${i <= idx && I('check')}</span><small>${l}</small></li>`)}
  </ol>`;
}
function StatusPill({ st }) {
  const map = { delivered: ['good', 'check', 'Delivered'], cancelled: ['bad', 'x', 'Cancelled'], scheduled: ['info', 'calendar', 'Scheduled'], placed: ['info', 'clock', 'Placed'], packed: ['info', 'bag', 'Packed'], out: ['info', 'truck', 'On the way'] };
  const [tone, ic, l] = map[st.key];
  return html`<span className=${'status ' + tone}>${I(ic)} ${l}</span>`;
}
function Orders() {
  const { S, nav, reorder } = useApp();
  const now = useNow(1000);
  const all = [...S.orders].sort((a, b) => b.placedAt - a.placedAt).map((o) => ({ o, st: orderStage(o, now) }));
  const active = all.filter((x) => !['delivered', 'cancelled'].includes(x.st.key));
  const past = all.filter((x) => ['delivered', 'cancelled'].includes(x.st.key));
  return html`<div className="scroll has-nav">
    <header className="plain-head"><h1>Your orders</h1><${CartBtn} /></header>
    ${!all.length && html`<${Empty} icon="orders" title="No orders yet" text="Your orders and their live status will show up here." cta="Start shopping" onCta=${() => nav.tab('home')} />`}
    ${active.length > 0 && html`<section className="sec pad-x"><h2 className="h-s">On the way</h2>
      ${active.map(({ o, st }) => html`<button key=${o.id} className="track-card" onClick=${() => nav.push('order', { oid: o.id })}>
        ${st.key !== 'scheduled' && html`<${TrackMap} o=${o} st=${st} now=${now} compact />`}
        <div className="track-top"><div><b className="track-eta">${st.key === 'scheduled' ? SLOTS[o.slot] : `${st.left} min`}</b><small>${st.key === 'scheduled' ? 'Scheduled delivery' : STAGES[st.idx][2]}</small></div><${StatusPill} st=${st} /></div>
        ${st.key !== 'scheduled' && html`<${StageDots} idx=${st.idx} />`}
        <div className="track-foot"><span className="thumb-strip sm">${o.items.slice(0, 4).map((i) => html`<${Art} key=${i.pid + i.vi} art=${P[i.pid].art} bg=${P[i.pid].bg} />`)}</span><span className="link">Track ${I('right')}</span></div>
      </button>`)}
    </section>`}
    ${past.length > 0 && html`<section className="sec pad-x"><h2 className="h-s">Past orders</h2>
      <div className="order-list">${past.map(({ o, st }) => html`<article key=${o.id} className="order-row">
        <button className="order-hit" onClick=${() => nav.push('order', { oid: o.id })}>
          <span className="order-top"><b>#${o.id}</b><${StatusPill} st=${st} /></span>
          <span className="order-meta">${dayTime(o.placedAt)} · ${o.items.reduce((a, i) => a + i.qty, 0)} items · ${inr(o.bill.total)}${o.sample ? ' · sample' : ''}</span>
          <span className="thumb-strip sm">${o.items.slice(0, 5).map((i) => html`<${Art} key=${i.pid + i.vi} art=${P[i.pid].art} bg=${P[i.pid].bg} />`)}</span>
        </button>
        <button className="btn lav sm" onClick=${() => reorder(o)}>${I('refresh')} Reorder</button>
      </article>`)}</div>
    </section>`}
    <p className="proto-note pad-x">Prototype: order time runs ${SPEED}× faster so you can watch an order move through each step.</p>
  </div>`;
}
function OrderDetail({ params }) {
  const { S, act, nav, toast, openSheet, reorder } = useApp();
  const now = useNow(1000);
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState('');
  const [sheet, setSheet] = useState(null);
  const o = S.orders.find((x) => x.id === params.oid);
  if (!o) return html`<div className="screen-col"><${TopBar} title="Order" /><${Empty} icon="orders" title="Order not found" /></div>`;
  const st = orderStage(o, now);
  const live = !['delivered', 'cancelled'].includes(st.key);
  const canCancel = ['placed', 'packed', 'scheduled'].includes(st.key);
  const doCancel = () => {
    act((s) => { const x = s.orders.find((y) => y.id === o.id); x.cancelled = true; x.cancelReason = reason; });
    setCancelling(false);
    toast(o.pay === 'cod' ? 'Order cancelled' : `Order cancelled. ${inr(o.bill.total)} will be refunded in 3 to 5 working days.`);
  };
  const tracking = live && st.key !== 'scheduled';
  const first = RIDER.name.split(' ')[0];
  const etaText = { placed: 'Order confirmed. Assigning a delivery partner.', packed: `Packed at the store. ${first} is picking it up.`, out: `${first} is on the way to you.` }[st.key];
  const rate = (n) => { act((s) => { s.orders.find((y) => y.id === o.id).rating = n; }); toast(n >= 4 ? 'Thanks for rating your delivery' : 'Thanks. We will share this with the delivery team.'); };
  return html`<div className="screen-col">
    ${tracking ? html`<div className="track-hero">
      <${TrackMap} o=${o} st=${st} now=${now} />
      <div className="track-hero-bar">
        <button className="round-btn white" aria-label="Back" onClick=${nav.pop}>${I('left')}</button>
        <div className="track-hero-title"><b>Order #${o.id}</b><small>${dayTime(o.placedAt)}</small></div>
        <${StatusPill} st=${st} />
      </div>
    </div>` : html`<${TopBar} title=${`Order #${o.id}`} sub=${dayTime(o.placedAt)} right=${html`<${StatusPill} st=${st} />`} />`}
    <div className=${'stack-body pad-x' + (tracking ? ' track-sheet' : '')}>
      ${tracking && html`<div className="eta-block">
        <div><b className="track-eta">Arriving in ${st.left} min</b><small>${etaText}</small></div>
        <span className="eta-dist">${I('nav')} ${kmLeft(st.key === 'out' ? riderFrac(o, now) : 0)} km</span>
      </div>
      <${StageDots} idx=${st.idx} />
      <${RiderCard} st=${st} onCall=${() => setSheet('call')} onChat=${() => setSheet('chat')} />
      <p className="proto-note map-note">Map, rider and timings are simulated. A live app would use GPS from the rider's phone and a maps service.</p>`}
      ${st.key === 'delivered' && html`<div className="rate card">
        <b>${o.rating ? 'Thanks for your rating' : 'How was your delivery?'}</b>
        <div className="stars" role="radiogroup" aria-label="Rate your delivery">
          ${[1, 2, 3, 4, 5].map((n) => html`<button key=${n} role="radio" aria-checked=${o.rating === n} aria-label=${`${n} star${n > 1 ? 's' : ''}`} className=${'star-btn' + (o.rating >= n ? ' on' : '')} onClick=${() => rate(n)}>${I('star', { fill: o.rating >= n })}</button>`)}
        </div>
        <small>Delivered by ${RIDER.name} (sample)</small>
      </div>`}
      ${st.key === 'cancelled' && html`<p className="notice bad">${I('info')} This order was cancelled${o.pay !== 'cod' ? `. ${inr(o.bill.total)} is being refunded to your ${PAYS[o.pay].label} within 3 to 5 working days` : ''}.</p>`}
      ${st.key === 'scheduled' && html`<p className="notice">${I('calendar')} Scheduled for ${SLOTS[o.slot]}. You can cancel until it is packed.</p>`}
      ${st.key !== 'cancelled' && st.key !== 'scheduled' && html`<ol className="timeline">
        ${STAGES.map(([k, l, d], i) => html`<li key=${k} className=${i <= st.idx ? 'done' : ''}>
          <span className="tl-dot">${i <= st.idx ? I('check') : ''}</span>
          <div><b>${l}</b><small>${i <= st.idx ? `${d} · ${clock(o.placedAt + (k === 'delivered' ? o.eta : STAGE_MIN[k]) * 60000)}` : 'Waiting'}</small></div>
        </li>`)}
      </ol>`}
      <h2 className="h-s">Items</h2>
      <ul className="co-items">${o.items.map((i) => html`<li key=${i.pid + i.vi}><${Art} art=${P[i.pid].art} bg=${P[i.pid].bg} /><span>${P[i.pid].name}<small>${i.label} × ${i.qty}</small></span><b>${inr(i.price * i.qty)}</b></li>`)}</ul>
      <${BillCard} b=${o.bill} />
      <div className="card info-card">
        <div className="deliv-row">${I('pin')}<div><b>${o.address.label}</b><small>${o.address.line}, ${o.address.area}</small></div></div>
        <div className="deliv-row">${I(PAYS[o.pay].icon)}<div><b>${PAYS[o.pay].label}</b><small>${o.pay === 'cod' ? 'Pay at your door' : 'Paid'}</small></div></div>
      </div>
      ${cancelling && html`<div className="confirm" role="alertdialog" aria-label="Cancel order">
        <p><b>Why are you cancelling?</b></p>
        <div className="chips wrap">${['Ordered by mistake', 'Found it elsewhere', 'Delivery time too long', 'Other'].map((r) => html`<button key=${r} className=${'chip' + (reason === r ? ' on' : '')} aria-pressed=${reason === r} onClick=${() => setReason(r)}>${r}</button>`)}</div>
        <div className="row-gap"><button className="btn ghost sm" onClick=${() => setCancelling(false)}>Keep order</button><button className="btn danger sm" disabled=${!reason} onClick=${doCancel}>Cancel order</button></div>
      </div>`}
      <div className="col-gap">
        <button className="btn ghost" onClick=${() => openSheet({ type: 'help', oid: o.id })}>${I('chat')} Get help with this order</button>
        ${canCancel && !cancelling && html`<button className="btn text danger-text" onClick=${() => setCancelling(true)}>Cancel order</button>`}
        ${!live && html`<button className="btn lav" onClick=${() => reorder(o)}>${I('refresh')} Reorder these items</button>`}
      </div>
      <div className="spacer"></div>
    </div>
    ${sheet === 'chat' && html`<${RiderChat} o=${o} st=${st} onClose=${() => setSheet(null)} />`}
    ${sheet === 'call' && html`<${CallSheet} onClose=${() => setSheet(null)} />`}
  </div>`;
}

/* ---------- Profile and settings ---------- */
function Row({ icon, label, value, onClick }) {
  return html`<button className="row" onClick=${onClick}><span className="row-ic">${I(icon)}</span><span className="row-label">${label}</span>${value != null && html`<span className="row-val">${value}</span>`}${I('chev')}</button>`;
}
const fmtPhone = (ph) => '+91 ' + ph.replace(/^(\d{5})/, '$1 ');
function EditProfileSheet({ onClose }) {
  const { S, act, nav, toast } = useApp();
  const u = S.user;
  const [name, setName] = useState(u.name && u.name !== 'there' ? u.name : '');
  const [email, setEmail] = useState(u.email || '');
  const [err, setErr] = useState({});
  const save = (e) => {
    e.preventDefault();
    const n = name.trim(), m = email.trim(), er = {};
    if (!n) er.name = 'Enter your name.';
    else if (n.length > 30) er.name = 'Keep your name under 30 characters.';
    if (m && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)) er.email = 'Enter an email like name@example.com.';
    setErr(er);
    if (Object.keys(er).length) return;
    act((s) => { s.user.name = n; s.user.email = m; });
    onClose();
    toast('Profile updated');
  };
  const initial = (name.trim().charAt(0) || 'Y').toUpperCase();
  return html`<${Sheet} title="Edit profile" onClose=${onClose}>
    <form className="profile-form" onSubmit=${save} noValidate>
      <span className="avatar profile-form-av" aria-hidden="true">${initial}</span>
      <label className="text-field"><span>Name</span>
        <input id="profile-name" value=${name} maxLength="40" autoComplete="given-name" aria-invalid=${!!err.name} onChange=${(e) => { setName(e.target.value); setErr({ ...err, name: null }); }} />
        ${err.name && html`<em className="field-err" role="alert">${err.name}</em>`}</label>
      <label className="text-field"><span>Email <small>(optional, for order receipts)</small></span>
        <input id="profile-email" type="email" inputMode="email" autoComplete="email" placeholder="name@example.com" value=${email} aria-invalid=${!!err.email} onChange=${(e) => { setEmail(e.target.value); setErr({ ...err, email: null }); }} />
        ${err.email && html`<em className="field-err" role="alert">${err.email}</em>`}</label>
      <div className="text-field"><span>Mobile number</span>
        <div className="readonly-field">
          <span>${u.loggedIn ? fmtPhone(u.phone) : 'Not added yet'}</span>
          <button type="button" className="link" onClick=${() => { onClose(); nav.push('login', { mode: 'profile' }); }}>${u.loggedIn ? 'Change' : 'Add'}</button>
        </div>
        <small className="field-help">${u.loggedIn ? 'Changing your number needs a one-time password sent to the new number.' : "We'll send a one-time password to verify your number."}</small>
      </div>
      <button type="submit" className="btn primary">Save changes</button>
    </form>
  <//>`;
}
function Profile() {
  const { S, act, nav, toast, resetAll } = useApp();
  const [paySheet, setPaySheet] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const u = S.user;
  return html`<div className="scroll has-nav">
    <header className="lav-head profile-head">
      <${Avatar} size=${56} />
      <div className="topbar-t"><h1>${u.name && u.name !== 'there' ? u.name : 'Guest'}</h1><p>${u.loggedIn ? fmtPhone(u.phone) : 'Not logged in'}</p>${u.email && html`<p>${u.email}</p>`}</div>
      <button className="pill-outline edit-profile" onClick=${() => setEditing(true)}>${I('edit')} Edit</button>
    </header>
    ${editing && html`<${EditProfileSheet} onClose=${() => setEditing(false)} />`}
    ${!u.loggedIn && html`<div className="pad-m"><button className="nudge" onClick=${() => nav.push('login', { mode: 'profile' })}><${Emo} k="key" /><span><b>Log in with your phone</b><small>Check out faster and track your orders.</small></span>${I('chev')}</button></div>`}
    <section className="sec pad-x">
      <div className="idle-head"><h2 className="h-s">Your fields</h2><button className="link" onClick=${() => nav.push('fields', { mode: 'edit' })}>Edit</button></div>
      <div className="chips wrap">${u.fields.length ? u.fields.map((id) => html`<span key=${id} className="chip on static">${fieldName(id)}</span>`) : html`<span className="muted">None picked yet. Add one to get material kits for your discipline.</span>`}</div>
    </section>
    <section className="list-sec pad-x">
      <${Row} icon="heart" label="Saved items" value=${S.saved.length} onClick=${() => nav.push('saved', { tab: 'items' })} />
      <${Row} icon="bookmark" label="Saved videos" value=${S.savedReels.length} onClick=${() => nav.push('saved', { tab: 'videos' })} />
      <${Row} icon="orders" label="Order history" value=${S.orders.length} onClick=${() => nav.tab('orders')} />
      <${Row} icon="pin" label="Saved addresses" value=${S.addresses.length} onClick=${() => nav.push('addresses')} />
      <${Row} icon="card" label="Payment preference" value=${PAYS[S.pay].label} onClick=${() => setPaySheet(true)} />
    </section>
    <section className="list-sec pad-x"><h2 className="h-s">Notifications</h2>
      ${[['orders', 'Order updates', 'Packed, out for delivery, delivered'], ['offers', 'Offers and price drops', 'On items you saved'], ['reels', 'New videos for your field', 'At most one a day']].map(([k, l, d]) => html`<label key=${k} className="switch-row"><span><b>${l}</b><small>${d}</small></span><input type="checkbox" role="switch" checked=${S.notif[k]} onChange=${(e) => act((s) => { s.notif[k] = e.target.checked; })} /></label>`)}
    </section>
    <section className="list-sec pad-x">
      <${Row} icon="help" label="Help and support" onClick=${() => nav.push('help')} />
      <${Row} icon="receipt" label="How our pricing works" onClick=${() => nav.push('pricing')} />
    </section>
    <section className="list-sec pad-x proto"><h2 className="h-s">Prototype controls</h2>
      <label className="switch-row"><span><b>Fail the next online payment</b><small>Shows the payment error screen once</small></span><input type="checkbox" role="switch" checked=${S.failNext} onChange=${(e) => act((s) => { s.failNext = e.target.checked; })} /></label>
      <button className="row" onClick=${() => setConfirm('reset')}><span className="row-ic">${I('refresh')}</span><span className="row-label">Reset prototype data</span>${I('chev')}</button>
    </section>
    ${u.loggedIn && html`<div className="pad-m"><button className="btn ghost" onClick=${() => setConfirm('logout')}>${I('logout')} Log out</button></div>`}
    ${confirm && html`<div className="pad-m"><div className="confirm" role="alertdialog" aria-label="Confirm">
      <p>${confirm === 'reset' ? 'Reset cart, orders, saved items and onboarding to the starting sample data?' : 'Log out of quickart on this device?'}</p>
      <div className="row-gap"><button className="btn ghost sm" onClick=${() => setConfirm(null)}>Cancel</button>
        <button className="btn danger sm" onClick=${() => { setConfirm(null); if (confirm === 'reset') resetAll(); else { act((s) => { s.user.loggedIn = false; s.user.phone = ''; }); toast('Logged out'); } }}>${confirm === 'reset' ? 'Reset' : 'Log out'}</button></div>
    </div></div>`}
    <p className="proto-note pad-x">quickart prototype · sample catalogue, prices, stock and delivery times</p>
    ${paySheet && html`<${Sheet} title="Payment preference" onClose=${() => setPaySheet(false)}>
      <div className="radio-list">${Object.entries(PAYS).map(([k, x]) => html`<label key=${k} className=${'radio-card' + (S.pay === k ? ' on' : '')}><input type="radio" name="paypref" checked=${S.pay === k} onChange=${() => { act((s) => { s.pay = k; }); setPaySheet(false); toast(`${x.label} will be selected at checkout`); }} /><span className="rc-ic">${I(x.icon)}</span><span className="rc-txt"><b>${x.label}</b></span></label>`)}</div>
    <//>`}
  </div>`;
}
function Saved({ params }) {
  const { S, nav, jumpToReel } = useApp();
  const [tab, setTab] = useState(params.tab || 'items');
  const items = S.saved.map((id) => P[id]).filter(Boolean);
  const vids = S.savedReels.map((id) => R[id]).filter(Boolean);
  return html`<div className="screen-col">
    <${TopBar} title="Saved" right=${html`<${CartBtn} />`} />
    <div className="seg pad-x" role="tablist"><button role="tab" aria-selected=${tab === 'items'} className=${tab === 'items' ? 'on' : ''} onClick=${() => setTab('items')}>Items (${items.length})</button><button role="tab" aria-selected=${tab === 'videos'} className=${tab === 'videos' ? 'on' : ''} onClick=${() => setTab('videos')}>Videos (${vids.length})</button></div>
    <div className="stack-body">
      ${tab === 'items' ? (items.length ? html`<div className="grid2">${items.map((p) => html`<${ProductCard} key=${p.id} p=${p} wide />`)}</div>` : html`<${Empty} icon="heart" title="No saved items" text="Tap the heart on any product to keep it here." cta="Browse categories" onCta=${() => nav.tab('categories')} />`)
        : vids.length ? html`<div className="vid-grid pad-x">${vids.map((r) => html`<button key=${r.id} className="reel-thumb" onClick=${() => jumpToReel(r.id, true)} aria-label=${`Watch: ${r.title}`}><span className="reel-thumb-art" dangerouslySetInnerHTML=${{ __html: sceneSvg(r.scene) }}></span><span className="reel-thumb-play" aria-hidden="true">${I('play')}</span><span className="reel-thumb-cap">${r.title}</span></button>`)}</div>`
        : html`<${Empty} icon="bookmark" title="No saved videos" text="Save demos in Explore to watch them again." cta="Open Explore" onCta=${() => nav.tab('explore')} />`}
      <div className="spacer"></div>
    </div>
  </div>`;
}
function Addresses() {
  const { S, act, toast } = useApp();
  return html`<div className="screen-col"><${TopBar} title="Saved addresses" />
    <div className="stack-body pad-x">
      <${AddressPicker} />
      ${S.addresses.length > 1 && html`<div className="col-gap top-gap">${S.addresses.filter((a) => a.id !== S.addressId).map((a) => html`<button key=${a.id} className="btn text danger-text" onClick=${() => { act((s) => { s.addresses = s.addresses.filter((x) => x.id !== a.id); }); toast(`${a.label} address removed`); }}>${I('trash')} Remove ${a.label}</button>`)}</div>`}
    </div></div>`;
}
const FAQ = [
  ['How fast is delivery?', 'Most orders arrive in 10 to 20 minutes from our nearest store. You see the estimate for your address before you pay. You can also schedule delivery for this evening or tomorrow morning.'],
  ['What will I pay for delivery?', `Delivery is ${inr(DELIVERY_FEE)} on orders under ${inr(FREE_OVER)} and free above that. There is no platform fee, handling fee, small-cart fee or late-night surge.`],
  ['Something arrived damaged or missing', 'Report it from the order within 48 hours with a photo. We replace it or refund you, whichever you choose.'],
  ['Can I cancel an order?', 'Yes, until it is out for delivery. Online payments are refunded to the same method within 3 to 5 working days.'],
  ['Do prices include GST?', 'Yes. Every price you see already includes GST.'],
];
function Help() {
  const { openSheet } = useApp();
  const [open, setOpen] = useState(0);
  return html`<div className="screen-col"><${TopBar} title="Help and support" />
    <div className="stack-body pad-x">
      <button className="nudge" onClick=${() => openSheet({ type: 'help' })}><${Emo} k="chat" /><span><b>Chat with us</b><small>Usually replies in under 5 minutes</small></span>${I('chev')}</button>
      <h2 className="h-s top-gap">Common questions</h2>
      ${FAQ.map(([q, a], i) => html`<div key=${i} className="accordion"><button className="acc-head" aria-expanded=${open === i} onClick=${() => setOpen(open === i ? -1 : i)}><span>${q}</span>${I(open === i ? 'minus' : 'plus')}</button>${open === i && html`<p className="acc-body">${a}</p>`}</div>`)}
    </div></div>`;
}
function Pricing() {
  const ex = billOf([lineSnap('p19', 1, 1), lineSnap('p12', 0, 1)]);
  return html`<div className="screen-col"><${TopBar} title="How our pricing works" />
    <div className="stack-body pad-x prose">
      <p className="lead">The price in your cart is the price you pay. Nothing new appears at checkout.</p>
      <ul className="checks">
        <li>${I('check')} <span><b>GST is included</b> in every price.</span></li>
        <li>${I('check')} <span><b>Delivery is ${inr(DELIVERY_FEE)}</b> on orders under ${inr(FREE_OVER)}, and free above.</span></li>
        <li>${I('check')} <span><b>No platform, handling, packaging, small-cart or surge fees.</b></span></li>
        <li>${I('check')} <span><b>Pay on delivery costs the same</b> as paying online.</span></li>
        <li>${I('check')} <span><b>The struck-out price is the MRP</b> printed on the pack, so you can check the discount.</span></li>
      </ul>
      <h2 className="h-s">Example: a sketchbook and an eraser pack</h2>
      <${BillCard} b=${ex} />
    </div></div>`;
}

/* ---------- Global sheets ---------- */
function AddressSheet({ onClose }) {
  return html`<${Sheet} title="Deliver to" onClose=${onClose}><${AddressPicker} onPicked=${onClose} /><//>`;
}
function ShareSheet({ rid, onClose }) {
  const { toast } = useApp();
  const link = `https://quickart.example/reel/${rid}`;
  const ref = useRef();
  const copy = () => {
    const done = () => { toast('Link copied'); onClose(); };
    try {
      navigator.clipboard.writeText(link).then(done, () => { ref.current.select(); toast('Select and copy the link'); });
    } catch (e) { ref.current.select(); toast('Select and copy the link'); }
  };
  return html`<${Sheet} title="Share this video" onClose=${onClose}>
    <label className="text-field"><span>Link (sample)</span><input id="share-link" ref=${ref} readOnly value=${link} onFocus=${(e) => e.target.select()} /></label>
    <button className="btn primary" onClick=${copy}>${I('copy')} Copy link</button>
  <//>`;
}
function HelpChat({ oid, onClose }) {
  const [msgs, setMsgs] = useState([{ me: false, t: oid ? `Hi! What went wrong with order #${oid}?` : 'Hi! How can we help?' }]);
  const opts = oid ? ['An item is missing', 'An item is damaged', 'Payment issue', 'Something else'] : ['Track my order', 'Delivery fees', 'Returns', 'Something else'];
  const pick = (o) => setMsgs((m) => [...m, { me: true, t: o }, { me: false, t: 'Thanks. A support person will reply here within 5 minutes. (Simulated in this prototype.)' }]);
  return html`<${Sheet} title="Support chat" onClose=${onClose}>
    <div className="chat" aria-live="polite">${msgs.map((m, i) => html`<p key=${i} className=${'bubble' + (m.me ? ' me' : '')}>${m.t}</p>`)}</div>
    ${msgs.length === 1 && html`<div className="chips wrap">${opts.map((o) => html`<button key=${o} className="chip" onClick=${() => pick(o)}>${o}</button>`)}</div>`}
  <//>`;
}

/* ---------- Navigation shell ---------- */
const TABS = [
  { id: 'home', label: 'Home', icon: 'home', C: Home },
  { id: 'categories', label: 'Categories', icon: 'grid', C: Categories },
  { id: 'explore', label: 'Explore', icon: 'explore', C: Explore },
  { id: 'orders', label: 'Orders', icon: 'orders', C: Orders },
  { id: 'profile', label: 'Profile', icon: 'user', C: Profile },
];
const SCREENS = { login: Login, otp: Otp, fields: FieldsScreen, search: Search, plp: PLP, pdp: PDP, cart: Cart, checkout: Checkout, paying: Paying, confirm: Confirm, order: OrderDetail, saved: Saved, addresses: Addresses, help: Help, pricing: Pricing, reels: ReelsScreen };
let _rk = 0;
function mkRoute(name, params) { return { name, params: params || {}, k: ++_rk }; }

function useWide() {
  const q = '(min-width: 1024px)';
  const [wide, setWide] = useState(() => !!(window.matchMedia && matchMedia(q).matches));
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = matchMedia(q), f = () => setWide(m.matches);
    m.addEventListener('change', f);
    return () => m.removeEventListener('change', f);
  }, []);
  return wide;
}
function BottomNav({ hidden }) {
  const { tab, nav, S } = useApp();
  const now = useNow(5000);
  const live = S.orders.filter((o) => !['delivered', 'cancelled'].includes(orderStage(o, now).key)).length;
  return html`<nav className=${'bnav' + (tab === 'explore' ? ' dark' : '')} aria-label="Main" aria-hidden=${hidden || undefined}>
    <span className="bnav-brand" aria-hidden="true"><span>quick</span>art</span>
    ${TABS.map((t) => html`<button key=${t.id} className=${'bnav-item' + (tab === t.id ? ' on' : '') + (t.id === 'explore' ? ' is-explore' : '')} aria-current=${tab === t.id ? 'page' : undefined} onClick=${() => {
      if (tab === t.id) { const sc = document.querySelector('.tab-screen:not(.off) .scroll'); if (sc) sc.scrollTo({ top: 0, behavior: 'smooth' }); }
      nav.tab(t.id);
    }}>
      <span className="bnav-ic">${I(t.icon)}${t.id === 'orders' && live > 0 && html`<span className="badge dot-badge" aria-label=${`${live} active`}>${live}</span>`}</span>
      <span className="bnav-label">${t.label}</span>
    </button>`)}
  </nav>`;
}
function Toast({ t, onDone }) {
  if (!t) return null;
  return html`<div key=${t.id} className="toast" role="status">${t.art && html`<${Art} art=${t.art} bg="#fff" cls="toast-img" />`}${t.emo && html`<${Emo} k=${t.emo} cls="toast-emo" />`}<span>${t.msg}</span>${t.action && html`<button onClick=${() => { t.action.fn(); onDone(); }}>${t.action.label}</button>`}</div>`;
}

function App() {
  const [S, setS] = useState(loadState);
  const wide = useWide();
  const Sref = useRef(S);
  Sref.current = S;
  const act = useCallback((fn) => setS((s) => { const n = JSON.parse(JSON.stringify(s)); fn(n); return n; }), []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* ignore */ } }, [S]);

  const [tab, setTab] = useState('home');
  const [stack, setStack] = useState(() => (S.user.onboarded ? [] : [mkRoute('login', { mode: 'onboard' })]));
  const [toastS, setToastS] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [jump, setJump] = useState(null);
  const tTimer = useRef();
  const toast = useCallback((msg, action, extra) => {
    clearTimeout(tTimer.current);
    setToastS({ msg, action, id: Math.random(), ...(extra || {}) });
    tTimer.current = setTimeout(() => setToastS(null), action ? 4200 : 2600);
  }, []);
  const nav = useMemo(() => ({
    push: (name, params) => setStack((s) => [...s, mkRoute(name, params)]),
    pop: () => setStack((s) => s.slice(0, -1)),
    popN: (n) => setStack((s) => s.slice(0, -n)),
    replace: (name, params) => setStack((s) => [...s.slice(0, -1), mkRoute(name, params)]),
    reset: (routes) => setStack(routes.map(([n, p]) => mkRoute(n, p))),
    tab: (t) => { setStack([]); setTab(t); setSheet(null); },
    go: (t, routes) => { setTab(t); setStack(routes.map(([n, p]) => mkRoute(n, p))); },
  }), []);

  const lines = useMemo(() => cartLinesOf(S), [S.cart]);
  const cart = useMemo(() => ({ lines, count: lines.reduce((a, l) => a + l.qty, 0), bill: billOf(lines) }), [lines]);
  const prevGap = useRef(cart.bill.gap);
  useEffect(() => {
    if (prevGap.current > 0 && cart.bill.gap === 0 && cart.bill.items > 0) {
      setTimeout(() => toast('Free delivery unlocked on this order', { label: 'View cart', fn: () => nav.push('cart') }, { emo: 'party' }), 700);
    }
    prevGap.current = cart.bill.gap;
  }, [cart.bill.gap]);
  const qty = (pid, vi) => Sref.current.cart[pid + ':' + vi] || 0;
  const setQty = (pid, vi, q) => {
    const v = P[pid].variants[vi];
    if (q > v.stock) { toast(`Only ${v.stock} in stock`); q = v.stock; }
    act((s) => { const k = pid + ':' + vi; if (q <= 0) delete s.cart[k]; else s.cart[k] = q; });
  };
  const deviceRef = useRef();
  const lastPt = useRef(null);
  useEffect(() => {
    const f = (e) => { lastPt.current = { x: e.clientX, y: e.clientY, t: Date.now() }; };
    document.addEventListener('pointerdown', f, true);
    return () => document.removeEventListener('pointerdown', f, true);
  }, []);
  const flyToCart = (art) => {
    const dev = deviceRef.current, pt = lastPt.current;
    try { navigator.vibrate && navigator.vibrate(12); } catch (e) { /* not supported */ }
    if (!dev || !pt || Date.now() - pt.t > 1500 || !dev.animate) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    setTimeout(() => {
      const layer = [...dev.querySelectorAll('.stack-screen')].pop() || dev.querySelector('.tab-screen:not(.off)');
      if (!layer) return;
      const d = dev.getBoundingClientRect();
      const tgt = [...layer.querySelectorAll('.js-cart')].find((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.top >= d.top && r.bottom <= d.bottom;
      });
      if (!tgt) return;
      const r = tgt.getBoundingClientRect();
      const dot = document.createElement('div');
      dot.className = 'fly';
      dot.innerHTML = art.photo ? `<img src="${asset(art.photo)}" alt="">` : artSvg(art);
      dev.appendChild(dot);
      const sx = pt.x - d.left - 24, sy = pt.y - d.top - 24;
      const ex = r.left - d.left + r.width / 2 - 24, ey = r.top - d.top + r.height / 2 - 24;
      const a = dot.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${(sx + ex) / 2}px, ${Math.min(sy, ey) - 70}px) scale(.85)`, opacity: 1, offset: 0.55 },
        { transform: `translate(${ex}px, ${ey}px) scale(.25)`, opacity: 0.4 },
      ], { duration: 620, easing: 'cubic-bezier(.45,0,.55,1)' });
      a.onfinish = () => { dot.remove(); tgt.classList.remove('bump'); void tgt.offsetWidth; tgt.classList.add('bump'); };
      setTimeout(() => dot.remove(), 900);
    }, 40);
  };
  const addToCart = (pid, vi, n = 1) => {
    const v = P[pid].variants[vi], cur = qty(pid, vi);
    if (v.stock === 0) { toast('This option is out of stock'); return; }
    if (cur >= v.stock) { toast(`Only ${v.stock} in stock`); return; }
    setQty(pid, vi, Math.min(v.stock, cur + n));
    flyToCart(P[pid].art);
    toast(`Added ${P[pid].name.split(',')[0]}`, { label: 'View cart', fn: () => nav.push('cart') }, { art: P[pid].art });
  };
  const addMany = (entries, msg) => {
    const ok = entries.filter(([pid, vi]) => P[pid].variants[vi].stock > (Sref.current.cart[pid + ':' + vi] || 0));
    act((s) => ok.forEach(([pid, vi, n]) => { const k = pid + ':' + vi; s.cart[k] = Math.min(P[pid].variants[vi].stock, (s.cart[k] || 0) + n); }));
    const skipped = entries.length - ok.length;
    if (ok.length) flyToCart(P[ok[0][0]].art);
    toast(ok.length ? msg + (skipped ? ` (${skipped} unavailable)` : '') : 'These items are unavailable right now', ok.length ? { label: 'View cart', fn: () => nav.push('cart') } : null);
  };
  const reorder = (o) => addMany(o.items.map((i) => [i.pid, i.vi, i.qty]), `Added ${o.items.length} items from #${o.id}`);
  const toggleSaved = (pid) => {
    const on = Sref.current.saved.includes(pid);
    act((s) => { s.saved = on ? s.saved.filter((x) => x !== pid) : [pid, ...s.saved]; });
    toast(on ? 'Removed from saved' : 'Saved for later');
  };
  const viewProduct = (pid, vi) => {
    act((s) => { s.recent = [pid, ...s.recent.filter((x) => x !== pid)].slice(0, 10); });
    nav.push('pdp', { pid, vi });
  };
  const proceed = () => (Sref.current.user.loggedIn ? nav.push('checkout') : nav.push('login', { mode: 'checkout' }));
  const buyNow = (pid, vi, q) => {
    if (qty(pid, vi) < q) setQty(pid, vi, q);
    proceed();
  };
  const jumpToReel = (rid, inStack) => {
    if (inStack) nav.push('reels', { rid });
    else { setJump({ rid, n: Date.now() }); nav.tab('explore'); }
  };
  const placeOrder = () => {
    const s0 = Sref.current;
    const items = cartLinesOf(s0).map(({ pid, vi, qty: q }) => lineSnap(pid, vi, q));
    const addr = s0.addresses.find((a) => a.id === s0.addressId) || s0.addresses[0];
    const id = 'QA' + String(Math.floor(20000 + Math.random() * 79999));
    act((s) => {
      s.orders.unshift({ id, items, bill: billOf(items), address: addr, pay: s.pay, slot: s.slot, placedAt: Date.now(), eta: addr.eta, cancelled: false });
      s.cart = {};
      s.slot = 'now';
    });
    return id;
  };
  const resetAll = () => {
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    setS(freshState());
    setTab('home');
    setStack([mkRoute('login', { mode: 'onboard' })]);
    toast('Prototype reset');
  };

  useEffect(() => {
    const dev = deviceRef.current;
    if (!dev) return;
    let st = null;
    const down = (e) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      const el = e.target.closest('.rail, .rail2, .scroll-x, .quick-row, .thumbs, .shop-tabs');
      if (el) st = { el, x: e.clientX, sl: el.scrollLeft, moved: false };
    };
    const move = (e) => {
      if (!st) return;
      const dx = e.clientX - st.x;
      if (!st.moved && Math.abs(dx) > 6) { st.moved = true; st.el.classList.add('dragging'); }
      if (st.moved) st.el.scrollLeft = st.sl - dx;
    };
    const up = () => {
      if (!st) return;
      const { el, moved } = st;
      st = null;
      el.classList.remove('dragging');
      if (moved) {
        const kill = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
        el.addEventListener('click', kill, { capture: true, once: true });
        setTimeout(() => el.removeEventListener('click', kill, { capture: true }), 60);
      }
    };
    dev.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => { dev.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
  }, [S.user.onboarded]);

  const app = {
    S, act, nav, tab, stack, cart, qty, setQty, addToCart, addMany, reorder, toggleSaved, viewProduct, proceed, buyNow,
    toast, openSheet: setSheet, jump, clearJump: () => setJump(null), jumpToReel, placeOrder, resetAll, setStackDirect: setStack,
  };
  const top = stack[stack.length - 1];
  const darkTop = (!top && tab === 'explore') || (top && top.name === 'reels');
  const lightAuth = top && ['login', 'otp'].includes(top.name);

  return html`<${Ctx.Provider} value=${app}>
    <div className="stage">
      <div ref=${deviceRef} className=${'device' + (darkTop ? ' dark-top' : '') + (lightAuth ? ' auth-top-bg' : '')}>
        ${S.user.onboarded && html`<div className="tabs-layer">
          ${TABS.map((t) => html`<section key=${t.id} className=${'tab-screen tab-' + t.id + (tab === t.id ? '' : ' off')} aria-label=${t.label} aria-hidden=${stack.length > 0}><${t.C} active=${tab === t.id && stack.length === 0} /></section>`)}
          <${BottomNav} hidden=${stack.length > 0 && !wide} />
        </div>`}
        ${stack.map((r, i) => {
          const C = SCREENS[r.name];
          return html`<div key=${r.k} className=${'stack-screen route-' + r.name + (r.name === 'reels' ? ' dark-screen' : '')} aria-hidden=${i < stack.length - 1}><${C} params=${r.params} /></div>`;
        })}
        ${sheet && sheet.type === 'address' && html`<${AddressSheet} onClose=${() => setSheet(null)} />`}
        ${sheet && sheet.type === 'share' && html`<${ShareSheet} rid=${sheet.rid} onClose=${() => setSheet(null)} />`}
        ${sheet && sheet.type === 'help' && html`<${HelpChat} oid=${sheet.oid} onClose=${() => setSheet(null)} />`}
        <${Toast} t=${toastS} onDone=${() => setToastS(null)} />
      </div>
    </div>
  <//>`;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
