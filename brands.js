/* Quick Art: brand directory, catalogue product pages, local shop offers and the shop owner portal.
   Loaded before app.js; uses its shared helpers (html, useApp, I, Art, Sheet, TopBar, ...) at render time.
   Rule: a product only shows as available when a shop has entered its stock and confirmed it (verifiedAt). */

/* ---------- Shared helpers ---------- */
function refProduct(ref) {
  if (!ref) return null;
  if (ref.type === 'prod') return P[ref.id] || null;
  const c = CITEM[ref.id];
  if (!c) return null;
  return { id: c.id, name: c.name, brand: (BRAND_CAT[c.brand] || {}).name || '', brandId: c.brand, art: { ph: c.cat }, bg: '#EEEAF4', cat: c.cat, size: c.size, desc: c.desc, catalogue: true };
}
const listingAvailable = (l) => l.qty > 0 && !!l.verifiedAt;
function offersFor(S, type, id) {
  return S.listings
    .filter((l) => l.ref.type === type && l.ref.id === id)
    .map((l) => ({ l, shop: S.shops.find((s) => s.id === l.shopId) }))
    .filter((x) => x.shop);
}
function bestOffer(S, type, id) {
  const av = offersFor(S, type, id).filter((x) => listingAvailable(x.l)).sort((a, b) => a.l.price - b.l.price);
  return av.length ? { from: av[0].l.price, shops: av.length } : null;
}
function ago(t) {
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 1) return 'just now';
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}
const ORIGIN = { india: 'Indian brand', intl: 'International brand' };

/* ---------- Brand logo placeholder and tiles ---------- */
function BrandLogo({ b, size }) {
  return html`<span className="brand-logo" style=${{ '--h': b.hue, width: size || 52, height: size || 52, fontSize: (size || 52) * 0.34 }} title="Logo placeholder" aria-hidden="true">${b.mono}</span>`;
}
function BrandTile({ b }) {
  const { nav } = useApp();
  const store = storeProductsOfBrand(b.id);
  const hero = store.find((p) => p.art.photo);
  const n = store.length + catalogueOfBrand(b.id).length;
  return html`<button className="brand-tile" style=${{ '--h': b.hue }} onClick=${() => nav.push('brand', { id: b.id })} aria-label=${`${b.name}, ${n} products`}>
    <span className="brand-pic" aria-hidden="true">${hero ? html`<img src=${asset(hero.art.photo)} alt="" loading="lazy" />` : html`<span className="brand-mono">${b.mono}</span>`}<span className="brand-badge">${b.mono}</span></span>
    <span className="brand-txt"><b>${b.name}</b><small>${n} product${n === 1 ? '' : 's'}</small></span>
  </button>`;
}
function BrandRow({ b }) {
  const { S, nav } = useApp();
  const cats = brandCats(b.id);
  const n = storeProductsOfBrand(b.id).length + catalogueOfBrand(b.id).length;
  const shops = new Set(S.listings.filter((l) => (l.ref.type === 'cat' ? (CITEM[l.ref.id] || {}).brand : brandIdOf((P[l.ref.id] || {}).brand)) === b.id && listingAvailable(l)).map((l) => l.shopId)).size;
  return html`<button className="brand-row" onClick=${() => nav.push('brand', { id: b.id })}>
    <${BrandLogo} b=${b} size=${48} />
    <span className="brand-row-txt">
      <b>${b.name} ${b.pro && html`<em className="tag-pro">Pro</em>`}</b>
      <small>${cats.slice(0, 3).map((c) => CCAT[c].short).join(' · ')}</small>
      <small className="brand-row-meta">${ORIGIN[b.origin]} · ${n} product${n === 1 ? '' : 's'}${shops ? ` · ${shops} shop${shops === 1 ? '' : 's'} nearby` : ''}</small>
    </span>
    ${I('chev')}
  </button>`;
}

/* ---------- Brand directory ---------- */
function BrandsBrowser({ embedded }) {
  const { nav } = useApp();
  const [q, setQ] = useState('');
  const [origin, setOrigin] = useState('all');
  const [cat, setCat] = useState(null);
  const filtering = q.trim() || origin !== 'all' || cat;
  const list = BRANDS_CAT
    .filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((b) => origin === 'all' || b.origin === origin)
    .filter((b) => !cat || brandCats(b.id).includes(cat))
    .sort((a, b) => a.name.localeCompare(b.name));
  return html`<div className=${'brands-browser' + (embedded ? ' embedded' : '')}>
    <div className="pad-x">
      <label className="brand-search">${I('search')}<input id="brand-q" type="search" value=${q} onChange=${(e) => setQ(e.target.value)} placeholder="Search 67 brands" aria-label="Search brands" autoComplete="off" />${q && html`<button className="clear-x" aria-label="Clear" onClick=${() => setQ('')}>${I('x')}</button>`}</label>
      <div className="seg origin-seg" role="tablist" aria-label="Brand origin">
        ${[['all', 'All brands'], ['india', 'Indian'], ['intl', 'International']].map(([k, l]) => html`<button key=${k} role="tab" aria-selected=${origin === k} className=${origin === k ? 'on' : ''} onClick=${() => setOrigin(k)}>${l}</button>`)}
      </div>
    </div>
    <div className="chips scroll-x cat-filter" role="group" aria-label="Filter by category">
      <button className=${'chip' + (!cat ? ' on' : '')} aria-pressed=${!cat} onClick=${() => setCat(null)}>All categories</button>
      ${CCATS.map((c) => html`<button key=${c.id} className=${'chip' + (cat === c.id ? ' on' : '')} aria-pressed=${cat === c.id} onClick=${() => setCat(cat === c.id ? null : c.id)}>${c.short}</button>`)}
    </div>
    ${!filtering && html`
      <section className="sec">
        <${SecHead} title="Popular brands" sub="Everyday names for school, college and studio" />
        <div className="rail brands">${BRANDS_CAT.filter((b) => b.pop).map((b) => html`<${BrandTile} key=${b.id} b=${b} />`)}</div>
      </section>
      <section className="sec">
        <${SecHead} title="Professional & specialist" sub="Artist-grade paints, papers, markers and tools" />
        <div className="rail brands">${BRANDS_CAT.filter((b) => b.pro).map((b) => html`<${BrandTile} key=${b.id} b=${b} />`)}</div>
      </section>`}
    <section className="sec pad-x">
      <h2 className="h-s">${filtering ? `${list.length} brand${list.length === 1 ? '' : 's'}` : `All brands A–Z (${list.length})`}</h2>
      ${list.length ? html`<div className="brand-list">${list.map((b) => html`<${BrandRow} key=${b.id} b=${b} />`)}</div>`
        : html`<${Empty} icon="search" title="No brands match" text="Try another name or clear the filters." />`}
      <button className="nudge shop-cta" onClick=${() => nav.push('shop')}>${I('store')}<span><b>Own a stationery or art shop?</b><small>List your stock so nearby artists can order or reserve it.</small></span>${I('chev')}</button>
    </section>
    <div className="spacer"></div>
  </div>`;
}
function BrandsScreen() {
  return html`<div className="screen-col">
    <${TopBar} title="Brands" sub=${`${BRANDS_CAT.length} Indian and international brands`} right=${html`<${CartBtn} />`} />
    <div className="stack-body"><${BrandsBrowser} /></div>
  </div>`;
}

/* ---------- Catalogue product card and page ---------- */
function CatalogueCard({ c }) {
  const { S, nav } = useApp();
  const best = bestOffer(S, 'cat', c.id);
  const b = BRAND_CAT[c.brand];
  return html`<button className="cat-card" onClick=${() => nav.push('citem', { id: c.id })}>
    <span className="cat-card-img"><${Art} art=${{ ph: c.cat }} bg="#EEEAF4" /></span>
    <span className="cat-card-txt">
      <small>${b.name}</small>
      <b>${c.name}</b>
      <small>${CCAT[c.cat].short} · ${c.size}</small>
      ${best ? html`<span className="avail good">${I('check')} From ${inr(best.from)} · ${best.shops} shop${best.shops === 1 ? '' : 's'}</span>`
        : html`<span className="avail none">Not stocked nearby yet</span>`}
    </span>
    ${I('chev')}
  </button>`;
}
function CatalogueItem({ params }) {
  const { S, nav } = useApp();
  const c = CITEM[params.id];
  if (!c) return html`<div className="screen-col"><${TopBar} title="Product" /><${Empty} icon="search" title="Product not found" /></div>`;
  const b = BRAND_CAT[c.brand];
  return html`<div className="screen-col">
    <${TopBar} title=${b.name} sub=${CCAT[c.cat].name} right=${html`<${CartBtn} />`} />
    <div className="stack-body pad-x citem">
      <div className="citem-hero"><${Art} art=${{ ph: c.cat }} cls="citem-art" /><span className="ph-note">Product photo coming soon</span></div>
      <button className="brand-link" onClick=${() => nav.push('brand', { id: b.id })}>${b.name} ${I('chev')}</button>
      <h1 className="pdp-title">${c.name}</h1>
      <div className="chips wrap"><span className="chip static">${CCAT[c.cat].short}</span><span className="chip static">${c.sub}</span><span className="chip static">Typical pack: ${c.size}</span></div>
      <p className="desc">${c.desc}</p>
      <${ShopOffers} type="cat" id=${c.id} name=${c.name} />
      <p className="proto-note">Catalogue details are general. Each shop states its own pack size and price.</p>
      <div className="spacer"></div>
    </div>
  </div>`;
}

/* ---------- Offers from local shops (compare, deliver, reserve) ---------- */
function ShopOffers({ type, id, name, title }) {
  const { S, act, nav, toast } = useApp();
  const all = offersFor(S, type, id);
  const avail = all.filter((x) => listingAvailable(x.l)).sort((a, b) => a.l.price - b.l.price);
  const out = all.filter((x) => !listingAvailable(x.l));
  const refKey = type + ':' + id;
  const asked = S.requests.filter((r) => r.ref === refKey).length;
  const mine = S.requests.some((r) => r.ref === refKey && r.me);
  const add = (x) => {
    const k = 'L:' + x.l.id, cur = S.cart[k] || 0;
    if (cur >= x.l.qty) { toast(`Only ${x.l.qty} in stock at ${x.shop.name}`); return; }
    act((s) => { s.cart[k] = cur + 1; });
    toast(`Added from ${x.shop.name}`, { label: 'View cart', fn: () => nav.push('cart') });
  };
  const reserve = (x) => {
    const code = 'QA-' + Math.floor(1000 + Math.random() * 9000);
    act((s) => {
      const l = s.listings.find((y) => y.id === x.l.id);
      if (!l || l.qty < 1) return;
      l.qty -= 1;
      s.reservations.unshift({ id: 'rv' + Date.now(), code, listingId: l.id, shopId: x.shop.id, shopName: x.shop.name, area: x.shop.area, name: name || (refProduct(l.ref) || {}).name, size: l.size, price: l.price, at: Date.now(), status: 'reserved' });
    });
    toast(`Reserved at ${x.shop.name}. Show code ${code} when you pick it up.`, { label: 'Orders', fn: () => nav.tab('orders') });
  };
  const request = () => {
    if (mine) return;
    act((s) => { s.requests.push({ id: 'rq' + Date.now(), ref: refKey, at: Date.now(), me: true }); });
    toast('Request sent to shops near you');
  };
  return html`<section className="offers">
    <div className="offers-h"><h2>${title || 'Buy from local shops'}</h2>${avail.length > 1 && html`<small>${avail.length} shops · sorted by price</small>`}</div>
    ${avail.length ? html`<div className="offer-list">${avail.map((x, i) => html`<article key=${x.l.id} className=${'offer' + (i === 0 && avail.length > 1 ? ' best' : '')}>
        ${i === 0 && avail.length > 1 && html`<span className="offer-best">Lowest price</span>`}
        <div className="offer-top">
          <div className="offer-shop">${I('store')}<div><b>${x.shop.name}</b><small>${x.shop.area}</small></div></div>
          <div className="offer-price"><b>${inr(x.l.price)}</b>${x.l.mrp > x.l.price && html`<s>${inr(x.l.mrp)}</s>`}<small>${x.l.size}</small></div>
        </div>
        <div className="offer-meta">
          <span className="good">${I('check')} In stock · ${x.l.qty} left</span>
          <span>Stock checked ${ago(x.l.verifiedAt)}</span>
          ${x.l.delivery && x.shop.delivery && html`<span>${I('truck')} Delivery in about ${x.shop.eta} min</span>`}
        </div>
        <div className="offer-actions">
          ${x.l.delivery && x.shop.delivery && html`<button className="btn primary sm" onClick=${() => add(x)}>${I('cart')} ${S.cart['L:' + x.l.id] ? `In cart (${S.cart['L:' + x.l.id]})` : 'Add for delivery'}</button>`}
          ${x.l.pickup && x.shop.pickup && html`<button className="btn lav sm" onClick=${() => reserve(x)}>${I('bag')} Reserve & pick up</button>`}
        </div>
      </article>`)}</div>`
      : html`<div className="offers-empty">
        <p>${I('info')} No nearby shop has entered stock for this yet, so it can't be ordered right now.</p>
        <div className="row-gap wrap-gap">
          <button className=${'btn sm ' + (mine ? 'ghost' : 'primary')} disabled=${mine} onClick=${request}>${mine ? html`${I('check')} Requested` : 'Request from nearby shops'}</button>
          ${asked > 0 && html`<small>${asked} request${asked === 1 ? '' : 's'} so far</small>`}
        </div>
      </div>`}
    ${out.length > 0 && html`<p className="offers-out">${out.map((x) => x.shop.name).join(', ')} ${out.length === 1 ? 'lists' : 'list'} this but ${out.length === 1 ? 'is' : 'are'} out of stock or hasn't confirmed stock.</p>`}
  </section>`;
}

/* ---------- Brand detail ---------- */
function BrandDetail({ params }) {
  const { S, nav } = useApp();
  const b = BRAND_CAT[params.id];
  const [cat, setCat] = useState(null);
  if (!b) return html`<div className="screen-col"><${TopBar} title="Brand" /><${Empty} icon="search" title="Brand not found" /></div>`;
  const cats = brandCats(b.id);
  const store = storeProductsOfBrand(b.id);
  const items = catalogueOfBrand(b.id).filter((c) => !cat || c.cat === cat);
  const shopItems = S.listings.filter((l) => listingAvailable(l) && (l.ref.type === 'cat' ? (CITEM[l.ref.id] || {}).brand === b.id : brandIdOf((P[l.ref.id] || {}).brand) === b.id));
  const shops = S.shops.map((s) => ({ s, n: shopItems.filter((l) => l.shopId === s.id).length })).filter((x) => x.n);
  const storeShown = store.filter((p) => !cat || STORE_TO_CCAT[p.cat] === cat);
  return html`<div className="screen-col">
    <${TopBar} title=${b.name} sub=${ORIGIN[b.origin]} right=${html`<${CartBtn} />`} />
    <div className="stack-body">
      <section className="brand-hero pad-x">
        <${BrandLogo} b=${b} size=${76} />
        <div className="brand-hero-txt">
          <h1>${b.name}</h1>
          <div className="chips wrap"><span className="chip static">${ORIGIN[b.origin]}</span>${b.pro && html`<span className="chip static pro">Professional range</span>`}${b.groups.map((g) => html`<span key=${g} className="chip static">${BRAND_GROUPS[g]}</span>`)}</div>
        </div>
      </section>
      <p className="brand-desc pad-x">${b.desc}</p>
      <p className="ph-line pad-x">Logo shown is a placeholder until an official logo is added.</p>
      <div className="chips scroll-x cat-filter" role="group" aria-label="Product categories">
        <button className=${'chip' + (!cat ? ' on' : '')} aria-pressed=${!cat} onClick=${() => setCat(null)}>All</button>
        ${cats.map((c) => html`<button key=${c} className=${'chip' + (cat === c ? ' on' : '')} aria-pressed=${cat === c} onClick=${() => setCat(cat === c ? null : c)}>${CCAT[c].short}</button>`)}
      </div>
      ${storeShown.length > 0 && html`<section className="sec">
        <${SecHead} title="Available now" sub="Sample Quick Art store products, ready to order" />
        <div className="grid2">${storeShown.map((p) => html`<${ProductCard} key=${p.id} p=${p} wide />`)}</div>
      </section>`}
      <section className="sec pad-x">
        <h2 className="h-s">${b.name} catalogue <small className="count">${items.length}</small></h2>
        ${items.length ? html`<div className="cat-list">${items.map((c) => html`<${CatalogueCard} key=${c.id} c=${c} />`)}</div>`
          : html`<p className="muted">No catalogue entries in this category yet.</p>`}
      </section>
      <section className="sec pad-x">
        <h2 className="h-s">Nearby shops with ${b.name}</h2>
        ${shops.length ? html`<div className="shop-list">${shops.map(({ s, n }) => html`<div key=${s.id} className="shop-row card">${I('store')}<div><b>${s.name}</b><small>${s.area}</small><small>${n} ${b.name} product${n === 1 ? '' : 's'} in stock${s.delivery ? ` · delivery about ${s.eta} min` : ''}${s.pickup ? ' · pickup' : ''}</small></div></div>`)}</div>`
          : html`<div className="offers-empty"><p>${I('info')} No local shop has listed ${b.name} stock yet.</p><button className="link" onClick=${() => nav.push('shop')}>Own a shop? List your ${b.name} stock ${I('right')}</button></div>`}
      </section>
      <div className="spacer"></div>
    </div>
  </div>`;
}

/* ---------- Search results from the catalogue ---------- */
function CatalogueResults({ q }) {
  const brands = searchBrands(q).slice(0, 6);
  const items = searchCatalogue(q).slice(0, 8);
  if (!brands.length && !items.length) return null;
  return html`<section className="sec pad-x cat-results">
    ${brands.length > 0 && html`<h2 className="h-s">Brands</h2><div className="brand-list">${brands.map((b) => html`<${BrandRow} key=${b.id} b=${b} />`)}</div>`}
    ${items.length > 0 && html`<h2 className="h-s">From the brand catalogue</h2><div className="cat-list">${items.map((c) => html`<${CatalogueCard} key=${c.id} c=${c} />`)}</div>`}
  </section>`;
}

/* ---------- Pickup reservations (shown in Orders) ---------- */
function Reservations() {
  const { S, act, toast } = useApp();
  const list = S.reservations.filter((r) => r.status === 'reserved');
  if (!list.length) return null;
  const cancel = (r) => {
    act((s) => {
      const x = s.reservations.find((y) => y.id === r.id); if (x) x.status = 'cancelled';
      const l = s.listings.find((y) => y.id === r.listingId); if (l) l.qty += 1;
    });
    toast('Reservation cancelled');
  };
  return html`<section className="sec pad-x"><h2 className="h-s">Reserved for pickup</h2>
    ${list.map((r) => html`<article key=${r.id} className="card resv">
      <div className="resv-top"><div><b>${r.name}</b><small>${r.size} · ${inr(r.price)} · pay at the shop</small></div><span className="resv-code">${r.code}</span></div>
      <div className="resv-shop">${I('store')}<span><b>${r.shopName}</b><small>${r.area} · reserved ${ago(r.at)}</small></span></div>
      <button className="btn text danger-text sm" onClick=${() => cancel(r)}>Cancel reservation</button>
    </article>`)}
  </section>`;
}

/* ---------- Shop owner portal ---------- */
function ShopForm({ shop, onSave, onCancel }) {
  const [d, setD] = useState(shop || { name: '', area: '', delivery: true, eta: '', pickup: true });
  const [err, setErr] = useState({});
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (d.name.trim().length < 2) er.name = 'Enter your shop name.';
    if (d.area.trim().length < 3) er.area = 'Enter the area or landmark customers know.';
    if (d.delivery && !(+d.eta >= 5 && +d.eta <= 240)) er.eta = 'Enter your usual delivery time in minutes (5 to 240).';
    if (!d.delivery && !d.pickup) er.mode = 'Offer home delivery, pickup, or both.';
    setErr(er);
    if (!Object.keys(er).length) onSave({ ...d, name: d.name.trim(), area: d.area.trim(), eta: d.delivery ? +d.eta : null });
  };
  return html`<form className="shop-form card" onSubmit=${save} noValidate>
    <label className="text-field"><span>Shop name</span><input id="shop-name" value=${d.name} onChange=${(e) => setD({ ...d, name: e.target.value })} aria-invalid=${!!err.name} />${err.name && html`<em className="field-err">${err.name}</em>`}</label>
    <label className="text-field"><span>Area and landmark</span><input id="shop-area" value=${d.area} onChange=${(e) => setD({ ...d, area: e.target.value })} aria-invalid=${!!err.area} />${err.area && html`<em className="field-err">${err.area}</em>`}</label>
    <label className="switch-row"><span><b>Home delivery</b><small>You deliver orders to customers</small></span><input type="checkbox" role="switch" checked=${d.delivery} onChange=${(e) => setD({ ...d, delivery: e.target.checked })} /></label>
    ${d.delivery && html`<label className="text-field"><span>Usual delivery time (minutes)</span><input id="shop-eta" type="number" inputMode="numeric" min="5" max="240" value=${d.eta} onChange=${(e) => setD({ ...d, eta: e.target.value })} aria-invalid=${!!err.eta} />${err.eta && html`<em className="field-err">${err.eta}</em>`}</label>`}
    <label className="switch-row"><span><b>Reserve & pickup</b><small>Customers reserve and collect at your counter</small></span><input type="checkbox" role="switch" checked=${d.pickup} onChange=${(e) => setD({ ...d, pickup: e.target.checked })} /></label>
    ${err.mode && html`<em className="field-err">${err.mode}</em>`}
    <div className="row-gap end">${onCancel && html`<button type="button" className="btn ghost sm" onClick=${onCancel}>Cancel</button>`}<button type="submit" className="btn primary sm">${shop ? 'Save details' : 'Create shop'}</button></div>
  </form>`;
}
function ListingSheet({ shop, edit, presetRef, onClose }) {
  const { act, toast } = useApp();
  const [ref, setRef] = useState(edit ? edit.ref : presetRef || null);
  const [q, setQ] = useState('');
  const prod = refProduct(ref);
  const base = edit || { size: prod ? (ref.type === 'cat' ? prod.size : (prod.variants[prod.dv] || {}).label || '') : '', price: '', mrp: '', qty: '', delivery: shop.delivery, pickup: shop.pickup, checked: false };
  const [d, setD] = useState({ ...base, checked: false });
  const [err, setErr] = useState({});
  useEffect(() => { if (!edit && prod) setD((x) => ({ ...x, size: ref.type === 'cat' ? prod.size : (prod.variants[prod.dv] || {}).label || '' })); }, [ref && ref.id]);
  const results = q.trim().length > 1
    ? [...searchCatalogue(q).slice(0, 8).map((c) => ({ ref: { type: 'cat', id: c.id }, name: c.name, brand: BRAND_CAT[c.brand].name })),
       ...searchProducts(q).list.slice(0, 4).map((p) => ({ ref: { type: 'prod', id: p.id }, name: p.name, brand: p.brand }))]
    : [];
  const save = (e) => {
    e.preventDefault();
    const er = {};
    if (!d.size || !String(d.size).trim()) er.size = 'Enter the pack size or quantity you sell.';
    if (!(+d.price > 0)) er.price = 'Enter your selling price.';
    if (d.mrp !== '' && d.mrp != null && +d.mrp < +d.price) er.mrp = 'MRP cannot be lower than your price.';
    if (!(Number.isInteger(+d.qty) && +d.qty >= 0)) er.qty = 'Enter how many you have, as a whole number.';
    if (!d.checked) er.checked = 'Confirm you have checked this stock before it is shown to customers.';
    if (!d.delivery && !d.pickup) er.mode = 'Choose delivery, pickup or both.';
    setErr(er);
    if (Object.keys(er).length) return;
    act((s) => {
      const rec = { size: String(d.size).trim(), price: +d.price, mrp: d.mrp === '' || d.mrp == null ? +d.price : +d.mrp, qty: +d.qty, delivery: !!d.delivery && shop.delivery, pickup: !!d.pickup && shop.pickup, verifiedAt: Date.now() };
      if (edit) Object.assign(s.listings.find((l) => l.id === edit.id), rec);
      else s.listings.unshift({ id: 'ls' + Date.now(), shopId: shop.id, ref, ...rec });
    });
    toast(edit ? 'Listing updated' : 'Listed. Customers nearby can now see it.');
    onClose();
  };
  return html`<${Sheet} title=${edit ? 'Edit listing' : 'List a product'} onClose=${onClose} tall>
    ${!ref ? html`<div className="lst-pick">
        <label className="brand-search">${I('search')}<input id="lst-q" type="search" value=${q} onChange=${(e) => setQ(e.target.value)} placeholder="Search products or brands" autoComplete="off" /></label>
        ${results.length ? html`<ul className="sugg">${results.map((r) => html`<li key=${r.ref.type + r.ref.id}><button onClick=${() => setRef(r.ref)}><span className="sugg-ic img"><${Art} art=${(refProduct(r.ref) || {}).art} bg="#EEEAF4" /></span><span><b>${r.name}</b><small>${r.brand}${r.ref.type === 'prod' ? ' · Quick Art store item' : ''}</small></span>${I('chev')}</button></li>`)}</ul>`
          : html`<p className="muted">Type at least two letters, for example “Copic” or “watercolour paper”.</p>`}
      </div>`
    : html`<form className="lst-form" onSubmit=${save} noValidate>
        <div className="rv-prod"><${Art} art=${prod.art} bg=${prod.bg} /><div><small>${prod.brand}</small><b>${prod.name}</b></div>${!edit && !presetRef && html`<button type="button" className="link" onClick=${() => setRef(null)}>Change</button>`}</div>
        <label className="text-field"><span>Pack size or quantity you sell</span><input id="lst-size" value=${d.size} onChange=${(e) => setD({ ...d, size: e.target.value })} aria-invalid=${!!err.size} />${err.size && html`<em className="field-err">${err.size}</em>`}</label>
        <div className="two-col">
          <label className="text-field"><span>Your price (₹)</span><input id="lst-price" type="number" inputMode="decimal" min="1" value=${d.price} onChange=${(e) => setD({ ...d, price: e.target.value })} aria-invalid=${!!err.price} />${err.price && html`<em className="field-err">${err.price}</em>`}</label>
          <label className="text-field"><span>MRP (₹) <small>(optional)</small></span><input id="lst-mrp" type="number" inputMode="decimal" min="1" value=${d.mrp} onChange=${(e) => setD({ ...d, mrp: e.target.value })} aria-invalid=${!!err.mrp} />${err.mrp && html`<em className="field-err">${err.mrp}</em>`}</label>
        </div>
        <label className="text-field"><span>Quantity in stock</span><input id="lst-qty" type="number" inputMode="numeric" min="0" value=${d.qty} onChange=${(e) => setD({ ...d, qty: e.target.value })} aria-invalid=${!!err.qty} />${err.qty && html`<em className="field-err">${err.qty}</em>`}</label>
        ${shop.delivery && html`<label className="switch-row"><span><b>Available for delivery</b></span><input type="checkbox" role="switch" checked=${d.delivery} onChange=${(e) => setD({ ...d, delivery: e.target.checked })} /></label>`}
        ${shop.pickup && html`<label className="switch-row"><span><b>Available to reserve & pick up</b></span><input type="checkbox" role="switch" checked=${d.pickup} onChange=${(e) => setD({ ...d, pickup: e.target.checked })} /></label>`}
        ${err.mode && html`<em className="field-err">${err.mode}</em>`}
        <label className="check-row"><input type="checkbox" checked=${d.checked} onChange=${(e) => { setD({ ...d, checked: e.target.checked }); if (e.target.checked) setErr({ ...err, checked: undefined }); }} /><span>I have checked this stock is on my shelf right now</span></label>
        ${err.checked && html`<em className="field-err">${err.checked}</em>`}
        <button type="submit" className="btn primary">${edit ? 'Save listing' : 'List product'}</button>
      </form>`}
  <//>`;
}
function ShopPortal() {
  const { S, act, toast } = useApp();
  const shop = S.shops.find((s) => s.id === S.myShop);
  const [editing, setEditing] = useState(false);
  const [sheet, setSheet] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const mine = shop ? S.listings.filter((l) => l.shopId === shop.id) : [];
  const listedRefs = new Set(mine.map((l) => l.ref.type + ':' + l.ref.id));
  const reqs = Object.entries(S.requests.reduce((a, r) => ((a[r.ref] = (a[r.ref] || 0) + 1), a), {}))
    .filter(([k]) => !listedRefs.has(k))
    .map(([k, n]) => { const [type, id] = k.split(':'); return { ref: { type, id }, n, p: refProduct({ type, id }) }; })
    .filter((x) => x.p);
  const setQtyOf = (l, q) => act((s) => { const x = s.listings.find((y) => y.id === l.id); x.qty = Math.max(0, q); x.verifiedAt = Date.now(); });
  if (!shop) {
    return html`<div className="screen-col"><${TopBar} title="Sell on Quick Art" sub="For stationery and art shops" />
      <div className="stack-body pad-x portal">
        <div className="portal-intro card">${I('store')}<div><b>Reach artists and students near your shop</b><small>Add your shop, list the products you actually have, and customers can order for delivery or reserve to pick up.</small></div></div>
        <${ShopForm} onSave=${(d) => { const id = 'sh' + Date.now(); act((s) => { s.shops.push({ id, ...d, at: Date.now() }); s.myShop = id; }); toast('Shop created. Now list your stock.'); }} />
        <p className="proto-note">Prototype: shops and listings are saved on this device only. A live version needs shop accounts and a server so customers everywhere see them.</p>
      </div></div>`;
  }
  return html`<div className="screen-col"><${TopBar} title=${shop.name} sub="Your shop on Quick Art" />
    <div className="stack-body pad-x portal">
      ${editing ? html`<${ShopForm} shop=${{ ...shop, eta: shop.eta || '' }} onCancel=${() => setEditing(false)} onSave=${(d) => { act((s) => { Object.assign(s.shops.find((x) => x.id === shop.id), d); }); setEditing(false); toast('Shop details saved'); }} />`
        : html`<div className="card shop-card">
          <div className="shop-row">${I('store')}<div><b>${shop.name}</b><small>${shop.area}</small><small>${[shop.delivery && `Delivery about ${shop.eta} min`, shop.pickup && 'Reserve & pickup'].filter(Boolean).join(' · ')}</small></div><button className="link" onClick=${() => setEditing(true)}>Edit</button></div>
          <div className="shop-stats"><span><b>${mine.length}</b><small>listings</small></span><span><b>${mine.filter(listingAvailable).length}</b><small>in stock</small></span><span><b>${S.reservations.filter((r) => r.shopId === shop.id && r.status === 'reserved').length}</b><small>reservations</small></span></div>
        </div>`}
      <button className="btn primary" onClick=${() => setSheet({})}>${I('plus')} List a product</button>
      ${reqs.length > 0 && html`<section className="sec"><h2 className="h-s">Customers are asking for</h2>
        ${reqs.map((r) => html`<div key=${r.ref.type + r.ref.id} className="req-row card"><div><b>${r.p.name}</b><small>${r.p.brand} · ${r.n} request${r.n === 1 ? '' : 's'}</small></div><button className="btn lav sm" onClick=${() => setSheet({ presetRef: r.ref })}>List it</button></div>`)}
      </section>`}
      <section className="sec"><h2 className="h-s">Your listings</h2>
        ${mine.length ? mine.map((l) => { const p = refProduct(l.ref) || { name: 'Unknown product', brand: '', art: { ph: 'paints' } }; return html`<article key=${l.id} className="card lst-row">
          <div className="lst-top"><${Art} art=${p.art} bg="#EEEAF4" cls="lst-img" /><div><b>${p.name}</b><small>${p.brand} · ${l.size} · ${inr(l.price)}</small><small className=${listingAvailable(l) ? 'good' : 'bad'}>${l.qty > 0 ? `${l.qty} in stock` : 'Out of stock'} · checked ${ago(l.verifiedAt)}</small></div></div>
          <div className="lst-actions"><${Stepper} q=${l.qty} soft label=${p.name} onChange=${(n) => setQtyOf(l, n)} /><button className="btn ghost sm" onClick=${() => setSheet({ edit: l })}>Edit</button>
            ${confirmDel === l.id ? html`<button className="btn danger sm" onClick=${() => { act((s) => { s.listings = s.listings.filter((y) => y.id !== l.id); }); setConfirmDel(null); toast('Listing removed'); }}>Confirm remove</button>` : html`<button className="btn text danger-text sm" onClick=${() => setConfirmDel(l.id)}>Remove</button>`}</div>
        </article>`; }) : html`<p className="muted">No listings yet. Tap “List a product” and enter stock you have on your shelf.</p>`}
      </section>
      <p className="proto-note">Prototype: shops and listings are saved on this device only. A live version needs shop accounts and a server so customers everywhere see them.</p>
      <div className="spacer"></div>
    </div>
    ${sheet && html`<${ListingSheet} shop=${shop} edit=${sheet.edit} presetRef=${sheet.presetRef} onClose=${() => setSheet(null)} />`}
  </div>`;
}
