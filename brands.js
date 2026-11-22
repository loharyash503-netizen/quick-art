/* Quick Art: brand directory, catalogue product pages, local shop offers and the shop owner portal.
   Loaded before app.js; uses its shared helpers (html, useApp, I, Art, Sheet, TopBar, ...) at render time.
   Rule: a product only shows as available when a shop has entered its stock and confirmed it (verifiedAt). */

/* ---------- Shared helpers ---------- */
/* A catalogue item's picture: its supplied photo, otherwise the category placeholder */
function catArt(c) { return c.photo ? { photo: c.photo } : { ph: c.cat }; }
function refProduct(ref) {
  if (!ref) return null;
  if (ref.type === 'prod') return P[ref.id] || null;
  const c = CITEM[ref.id];
  if (!c) return null;
  return { id: c.id, name: c.name, brand: (BRAND_CAT[c.brand] || {}).name || '', brandId: c.brand, art: catArt(c), bg: '#EEEAF4', cat: c.cat, size: c.size, desc: c.desc, catalogue: true };
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
  const [cat, setCat] = useState(null);
  const filtering = q.trim() || cat;
  const list = BRANDS_CAT
    .filter((b) => !q.trim() || b.name.toLowerCase().includes(q.trim().toLowerCase()))
    .filter((b) => !cat || brandCats(b.id).includes(cat))
    .sort((a, b) => a.name.localeCompare(b.name));
  return html`<div className=${'brands-browser' + (embedded ? ' embedded' : '')}>
    <div className="pad-x">
      <label className="brand-search">${I('search')}<input id="brand-q" type="search" value=${q} onChange=${(e) => setQ(e.target.value)} placeholder=${`Search ${BRANDS_CAT.length} brands`} aria-label="Search brands" autoComplete="off" />${q && html`<button className="clear-x" aria-label="Clear" onClick=${() => setQ('')}>${I('x')}</button>`}</label>
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
    <span className="cat-card-img"><${Art} art=${catArt(c)} bg="#EEEAF4" /></span>
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
      <div className=${'citem-hero' + (c.photo ? ' has-photo fit-' + c.fit : '')}><${Art} art=${catArt(c)} cls="citem-art" />${!c.photo && html`<span className="ph-note">Product photo coming soon</span>`}</div>
      <button className="brand-link" onClick=${() => nav.push('brand', { id: b.id })}>${b.name} ${I('chev')}</button>
      <h1 className="pdp-title">${c.name}</h1>
      <div className="chips wrap"><span className="chip static">${CCAT[c.cat].short}</span><span className="chip static">${c.sub}</span><span className="chip static">Typical pack: ${c.size}</span></div>
      <p className="desc">${c.desc}</p>
      <p className="proto-note">Catalogue details are general. Pack sizes and prices vary by shop.</p>
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
        <${SecHead} title="Available now" sub=${storeShown.every((p) => INDIA_MRP.has(p.id)) ? 'Priced at Indian MRP, ready to order' : 'Sample Quick Art store products, ready to order'} />
        <div className="grid2">${storeShown.map((p) => html`<${ProductCard} key=${p.id} p=${p} wide />`)}</div>
      </section>`}
      ${(items.length > 0 || store.length === 0) && html`<section className="sec pad-x">
        <h2 className="h-s">${b.name} catalogue <small className="count">${items.length}</small></h2>
        ${items.length ? html`<div className="cat-list">${items.map((c) => html`<${CatalogueCard} key=${c.id} c=${c} />`)}</div>`
          : html`<p className="muted">No catalogue entries in this category yet.</p>`}
      </section>`}
      <section className="sec pad-x">
        <h2 className="h-s">Nearby shops with ${b.name}</h2>
        ${shops.length ? html`<div className="shop-list">${shops.map(({ s, n }) => html`<div key=${s.id} className="shop-row card">${I('store')}<div><b>${s.name}</b><small>${s.area}</small><small>${n} ${b.name} product${n === 1 ? '' : 's'} in stock${s.delivery ? ` · delivery about ${s.eta} min` : ''}${s.pickup ? ' · pickup' : ''}</small></div></div>`)}</div>`
          : html`<div className="offers-empty"><p>${I('info')} No local shop has listed ${b.name} stock yet.</p></div>`}
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
