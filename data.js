/* quickart prototype: sample catalogue, illustrations and icons.
   Everything here is prototype data: products, prices, stock, creators and delivery times are samples. */

/* Image paths resolve to embedded data URIs from assets.js; falls back to the file path. */
const asset = (p) => (window.QA_ASSETS && window.QA_ASSETS[p]) || p;

/* ---------- Icons: Lucide v1.49 line icons (ISC licence), drawn with currentColor ---------- */
const ICON_PATHS = {
  phone: '<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"/>',
  locate: '<line x1=\"2\" x2=\"5\" y1=\"12\" y2=\"12\"/><line x1=\"19\" x2=\"22\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"2\" y2=\"5\"/><line x1=\"12\" x2=\"12\" y1=\"19\" y2=\"22\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>',
  nav: '<polygon points=\"3 11 22 2 13 21 11 13 3 11\"/>',
  home: '<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>',
  grid: '<rect width=\"7\" height=\"7\" x=\"3\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"3\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"14\" y=\"14\" rx=\"1\"/><rect width=\"7\" height=\"7\" x=\"3\" y=\"14\" rx=\"1\"/>',
  explore: '<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M9 9.003a1 1 0 0 1 1.517-.859l4.997 2.997a1 1 0 0 1 0 1.718l-4.997 2.997A1 1 0 0 1 9 14.996z\"/>',
  orders: '<path d=\"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z\"/><path d=\"M12 22V12\"/><polyline points=\"3.29 7 12 12 20.71 7\"/><path d=\"m7.5 4.27 9 5.15\"/>',
  user: '<circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/>',
  search: '<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>',
  mic: '<path d=\"M12 19v3\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><rect x=\"9\" y=\"2\" width=\"6\" height=\"13\" rx=\"3\"/>',
  cart: '<path d=\"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18\"/><path d=\"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25\"/><circle cx=\"18\" cy=\"20\" r=\"2\"/><circle cx=\"8\" cy=\"20\" r=\"2\"/>',
  heart: '<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/>',
  bookmark: '<path d=\"M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z\"/>',
  share: '<circle cx=\"18\" cy=\"5\" r=\"3\"/><circle cx=\"6\" cy=\"12\" r=\"3\"/><circle cx=\"18\" cy=\"19\" r=\"3\"/><line x1=\"8.59\" x2=\"15.42\" y1=\"13.51\" y2=\"17.49\"/><line x1=\"15.41\" x2=\"8.59\" y1=\"6.51\" y2=\"10.49\"/>',
  x: '<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>',
  plus: '<path d=\"M5 12h14\"/><path d=\"M12 5v14\"/>',
  minus: '<path d=\"M5 12h14\"/>',
  left: '<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>',
  right: '<path d=\"M5 12h14\"/><path d=\"m12 5 7 7-7 7\"/>',
  back: '<path d=\"m15 18-6-6 6-6\"/>',
  chev: '<path d=\"m9 18 6-6-6-6\"/>',
  chevd: '<path d=\"m6 9 6 6 6-6\"/>',
  trash: '<path d=\"M10 11v6\"/><path d=\"M14 11v6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M3 6h18\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>',
  star: '<path d=\"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z\"/>',
  pin: '<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>',
  clock: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>',
  check: '<path d=\"M20 6 9 17l-5-5\"/>',
  sliders: '<path d=\"M10 5H3\"/><path d=\"M12 19H3\"/><path d=\"M14 3v4\"/><path d=\"M16 17v4\"/><path d=\"M21 12h-9\"/><path d=\"M21 19h-5\"/><path d=\"M21 5h-7\"/><path d=\"M8 10v4\"/><path d=\"M8 12H3\"/>',
  sort: '<path d=\"m21 16-4 4-4-4\"/><path d=\"M17 20V4\"/><path d=\"m3 8 4-4 4 4\"/><path d=\"M7 4v16\"/>',
  truck: '<path d=\"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2\"/><path d=\"M15 18H9\"/><path d=\"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14\"/><circle cx=\"17\" cy=\"18\" r=\"2\"/><circle cx=\"7\" cy=\"18\" r=\"2\"/>',
  shield: '<path d=\"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z\"/><path d=\"m9 12 2 2 4-4\"/>',
  info: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>',
  help: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\"/><path d=\"M12 17h.01\"/>',
  bell: '<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>',
  card: '<rect width=\"20\" height=\"14\" x=\"2\" y=\"5\" rx=\"2\"/><line x1=\"2\" x2=\"22\" y1=\"10\" y2=\"10\"/><path d=\"M6 14h2\"/>',
  upi: '<rect width=\"14\" height=\"20\" x=\"5\" y=\"2\" rx=\"2\" ry=\"2\"/><path d=\"M12 18h.01\"/>',
  cash: '<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><path d=\"M6 12h.01M18 12h.01\"/>',
  play: '<path d=\"M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z\"/>',
  pause: '<rect x=\"14\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/><rect x=\"5\" y=\"3\" width=\"5\" height=\"18\" rx=\"1\"/>',
  edit: '<path d=\"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z\"/><path d=\"m15 5 4 4\"/>',
  logout: '<path d=\"m16 17 5-5-5-5\"/><path d=\"M21 12H9\"/><path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/>',
  tag: '<path d=\"M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z\"/><circle cx=\"7.5\" cy=\"7.5\" r=\".5\" fill=\"currentColor\"/>',
  refresh: '<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>',
  copy: '<rect width=\"14\" height=\"14\" x=\"8\" y=\"8\" rx=\"2\" ry=\"2\"/><path d=\"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2\"/>',
  chat: '<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>',
  bag: '<path d=\"M16 10a4 4 0 0 1-8 0\"/><path d=\"M3.103 6.034h17.794\"/><path d=\"M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z\"/>',
  receipt: '<path d=\"M12 17V7\"/><path d=\"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8\"/><path d=\"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z\"/>',
  backspace: '<path d=\"M10 5a2 2 0 0 0-1.344.519l-6.328 5.74a1 1 0 0 0 0 1.481l6.328 5.741A2 2 0 0 0 10 19h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z\"/><path d=\"m12 9 6 6\"/><path d=\"m18 9-6 6\"/>',
  bolt: '<path d=\"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z\"/>',
  lock: '<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>',
  video: '<path d=\"m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5\"/><rect x=\"2\" y=\"6\" width=\"14\" height=\"12\" rx=\"2\"/>',
  calendar: '<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>',
  sparkle: '<path d=\"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z\"/><path d=\"M20 2v4\"/><path d=\"M22 4h-4\"/><circle cx=\"4\" cy=\"20\" r=\"2\"/>',
  bike: '<circle cx=\"18.5\" cy=\"17.5\" r=\"3.5\"/><circle cx=\"5.5\" cy=\"17.5\" r=\"3.5\"/><circle cx=\"15\" cy=\"5\" r=\"1\"/><path d=\"M12 17.5V14l-3-3 4-3 2 3h2\"/>',
  volume: '<path d=\"M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z\"/><path d=\"M16 9a5 5 0 0 1 0 6\"/><path d=\"M19.364 18.364a9 9 0 0 0 0-12.728\"/>',
  checkc: '<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>',
};
const FILLED_ICONS = new Set(['play', 'pause']);
function iconSvg(name, filled) {
  const p = ICON_PATHS[name] || '';
  const fill = filled || FILLED_ICONS.has(name);
  return `<svg viewBox="0 0 24 24" fill="${fill ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${p}</svg>`;
}

/* ---------- Product illustrations (stand-ins for product photography) ---------- */
const COL = { red: '#E63946', orange: '#F4892C', yellow: '#F9C74F', lime: '#90BE6D', green: '#43AA8B', teal: '#2A9D8F', sky: '#5FB3E6', blue: '#277DA1', navy: '#1D3557', purple: '#8E44AD', pink: '#F15BB5', brown: '#8D5524', black: '#262329', white: '#FAFAFA' };
const RB = [COL.red, COL.orange, COL.yellow, COL.lime, COL.green, COL.teal, COL.sky, COL.blue, COL.purple, COL.pink, COL.brown, COL.black];
const GREYS = ['#3a3a3a', '#4a4a4a', '#5a5a5a', '#6a6a6a', '#7a7a7a', '#8a8a8a', '#9a9a9a', '#555'];

const ART = {
  paintset(o) {
    let s = `<rect x="10" y="20" width="100" height="82" rx="6" fill="${o.box || '#1e1b22'}"/><rect x="16" y="36" width="88" height="60" rx="3" fill="#fff"/><rect x="16" y="25" width="34" height="7" rx="2" fill="${COL.yellow}"/><rect x="54" y="25" width="20" height="7" rx="2" fill="#fff" opacity=".5"/>`;
    for (let i = 0; i < 8; i++) {
      const x = 20 + i * 10.5;
      s += `<rect x="${x}" y="46" width="8" height="42" rx="2" fill="#eee"/><rect x="${x}" y="55" width="8" height="24" fill="${RB[i]}"/><rect x="${x + 1.5}" y="40" width="5" height="7" rx="1" fill="#333"/>`;
    }
    return s;
  },
  tubes(o) {
    const cols = o.cols || [COL.red, COL.blue, COL.yellow, COL.green, COL.purple];
    let s = '';
    cols.forEach((c, i) => {
      const y = 26 + i * 15;
      s += `<g transform="rotate(-24 60 60)"><path d="M14 ${y} h64 l8 3 v6 l-8 3 h-64 l-3 -2 v-8z" fill="#f2f2f2" stroke="#d6d6d6"/><rect x="34" y="${y}" width="30" height="12" fill="${c}"/><rect x="86" y="${y + 2}" width="12" height="8" rx="2" fill="#2b2b2b"/></g>`;
    });
    return s;
  },
  markers(o) {
    const cols = o.cols || [COL.red, COL.orange, COL.yellow, COL.green, COL.sky, COL.purple, COL.pink];
    const n = cols.length, step = n > 4 ? 12 : 16, start = -((n - 1) * step) / 2;
    let s = '';
    cols.forEach((c, i) => {
      s += `<g transform="rotate(${start + i * step} 60 110)"><rect x="54" y="30" width="12" height="72" rx="5" fill="#f7f7f7" stroke="#d9d9d9"/><rect x="54" y="20" width="12" height="20" rx="5" fill="${c}"/><rect x="54" y="70" width="12" height="7" fill="${c}"/></g>`;
    });
    return s;
  },
  pencils(o) {
    const cols = o.grey ? GREYS : RB.slice(0, 8);
    let s = '';
    cols.forEach((c, i) => {
      const x = 23 + i * 9.6, top = 18 + (i % 3) * 9;
      s += `<rect x="${x}" y="${top + 11}" width="8" height="${80 - top}" fill="${o.grey ? '#2E7D4F' : c}"/><path d="M${x} ${top + 11}h8l-4 -11z" fill="#EBCB9C"/><path d="M${x + 2.6} ${top + 3.5}h2.8l-1.4 -3.5z" fill="${c}"/>`;
    });
    s += `<rect x="17" y="74" width="86" height="34" rx="4" fill="${o.box || '#1E3A5F'}"/><rect x="26" y="84" width="40" height="6" rx="2" fill="#fff" opacity=".7"/>`;
    return s;
  },
  sketchbook(o) {
    let s = `<rect x="30" y="24" width="66" height="84" rx="4" fill="#e6e1d8"/><rect x="25" y="19" width="66" height="84" rx="4" fill="${o.cover || '#2D2A32'}"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${30 + i * 7.5}" y="13" width="3" height="11" rx="1.5" fill="#9a9a9a"/>`;
    s += `<rect x="35" y="58" width="46" height="20" rx="2" fill="#fff" opacity=".92"/><rect x="40" y="63" width="30" height="3" fill="#bbb"/><rect x="40" y="69" width="20" height="3" fill="#ccc"/>`;
    return s;
  },
  brushes(o) {
    const cols = o.cols || [COL.red, COL.navy, COL.yellow, COL.black, COL.teal];
    let s = '<g transform="rotate(-38 60 60)">';
    cols.forEach((c, i) => {
      const y = 36 + i * 12;
      const tip = o.flat ? `<rect x="86" y="${y - 1.5}" width="13" height="9" rx="1" fill="#3d2a1e"/>` : `<path d="M86 ${y - 1}q20 4 0 8z" fill="#3d2a1e"/>`;
      s += `<rect x="8" y="${y}" width="64" height="6" rx="3" fill="${o.clear ? '#cfe8f3' : c}"/><rect x="72" y="${y - 0.5}" width="14" height="7" fill="#c5c9ce"/>${tip}`;
    });
    return s + '</g>';
  },
  canvas() {
    return `<path d="M38 114 60 12 82 114" stroke="#B07A4F" stroke-width="5" fill="none" stroke-linecap="round"/><rect x="20" y="22" width="80" height="62" fill="#fff" stroke="#E2D3C0" stroke-width="3"/><path d="M26 78 46 54 58 66 74 46 94 78Z" fill="#9ED0C2"/><circle cx="82" cy="36" r="6" fill="${COL.yellow}"/><rect x="16" y="84" width="88" height="5" rx="1" fill="#8B5A35"/>`;
  },
  fineliners(o) {
    const cols = o.cols || ['#ddd', '#ddd', '#ddd', '#ddd', '#ddd', '#ddd'];
    const n = o.single ? 1 : cols.length;
    let s = '<g transform="rotate(-32 60 60)">';
    for (let i = 0; i < n; i++) {
      const y = o.single ? 56 : 32 + i * 11;
      const h = o.single ? 11 : 7;
      s += `<rect x="12" y="${y}" width="80" height="${h}" rx="${h / 2}" fill="${o.body || '#1f1f1f'}"/><path d="M92 ${y + 1}l10 ${h / 2 - 1}-10 ${h / 2 - 1}z" fill="#9aa0a6"/><rect x="64" y="${y}" width="6" height="${h}" fill="${o.single ? COL.red : cols[i]}"/>`;
    }
    return s + '</g>';
  },
  sticky() {
    return `<g transform="rotate(-9 60 60)"><rect x="22" y="30" width="56" height="56" rx="2" fill="#7FD3F7"/></g><g transform="rotate(7 60 60)"><rect x="38" y="24" width="56" height="56" rx="2" fill="#FF8FB1"/></g><rect x="30" y="38" width="56" height="56" rx="2" fill="#FFE066"/><path d="M38 54h36M38 63h26M38 72h32" stroke="#B89400" stroke-width="2.5" stroke-linecap="round"/>`;
  },
  cutter() {
    return `<g transform="rotate(-35 60 60)"><rect x="12" y="50" width="72" height="20" rx="6" fill="#F2C230"/><rect x="22" y="54" width="50" height="12" rx="4" fill="#222"/><path d="M84 53 110 60 84 67Z" fill="#C8CDD3"/><circle cx="78" cy="60" r="3" fill="#777"/></g>`;
  },
  mat() {
    let s = `<g transform="rotate(-6 60 60)"><rect x="10" y="24" width="100" height="72" rx="4" fill="#2F7D59"/>`;
    for (let x = 18; x < 110; x += 8) s += `<path d="M${x} 24v72" stroke="#5FB08A" stroke-width=".8"/>`;
    for (let y = 32; y < 96; y += 8) s += `<path d="M10 ${y}h100" stroke="#5FB08A" stroke-width=".8"/>`;
    return s + `<path d="M10 60h100M60 24v72" stroke="#F9C74F" stroke-width="1.2"/></g>`;
  },
  ruler() {
    let s = `<g transform="rotate(-28 60 60)"><path d="M6 50h108v20H6z" fill="#F4F4EE" stroke="#b9b9b0"/><rect x="6" y="61" width="108" height="9" fill="#E3E3D8"/><rect x="8" y="63" width="18" height="5" fill="${COL.red}"/>`;
    for (let i = 0; i < 26; i++) s += `<path d="M${10 + i * 4} 50v${i % 5 ? 4 : 8}" stroke="#444" stroke-width=".8"/>`;
    return s + '</g>';
  },
  tape() {
    let s = `<rect x="52" y="60" width="62" height="13" fill="#F9D648"/>`;
    for (let i = 0; i < 15; i++) s += `<path d="M${55 + i * 4} 60v${i % 5 ? 3 : 6}" stroke="#333" stroke-width=".8"/>`;
    return s + `<circle cx="42" cy="62" r="28" fill="${COL.red}"/><circle cx="42" cy="62" r="11" fill="#fff" opacity=".4"/>`;
  },
  palette() {
    const dabs = [[38, 38, COL.red], [56, 30, COL.yellow], [76, 34, COL.blue], [90, 50, COL.green], [30, 58, COL.white], [40, 80, COL.purple]];
    let s = `<path d="M60 18c28 0 46 16 46 38 0 14-10 18-18 16-8-2-12 4-9 10 3 8-4 20-22 20-26 0-44-18-44-42s20-42 47-42z" fill="#E8C9A0"/><ellipse cx="72" cy="74" rx="7" ry="6" fill="#fff" opacity=".85"/>`;
    dabs.forEach(([x, y, c]) => (s += `<circle cx="${x}" cy="${y}" r="7" fill="${c}"/>`));
    return s + `<path d="M64 98 104 70" stroke="#777" stroke-width="3" stroke-linecap="round"/><path d="M100 72l10-6-4 9z" fill="#aaa"/>`;
  },
  watercolor(o) {
    let s = `<rect x="8" y="30" width="104" height="64" rx="6" fill="${o.box || '#2b2b2b'}"/>`;
    for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) s += `<rect x="${14 + i * 16}" y="${37 + r * 28}" width="13" height="22" rx="2" fill="${RB[r * 6 + i]}"/>`;
    return s;
  },
  glue() {
    return `<path d="M40 46h40v54a6 6 0 0 1-6 6H46a6 6 0 0 1-6-6z" fill="#fff" stroke="#d9d9d9"/><rect x="50" y="30" width="20" height="18" rx="3" fill="#E85D1F"/><path d="M57 14h6l2 16H55z" fill="#E85D1F"/><rect x="44" y="62" width="32" height="26" rx="3" fill="#F28C28"/><circle cx="60" cy="75" r="6" fill="#fff" opacity=".8"/>`;
  },
  foamboard() {
    let s = '';
    for (let i = 3; i >= 0; i--) s += `<g transform="translate(${i * 4} ${-i * 4})"><path d="M14 56 78 30l28 34-64 26z" fill="#fff" stroke="#d2d2d2"/><path d="M42 90l64-26v4L42 94z" fill="#e6e6e6"/></g>`;
    return s;
  },
  charcoal() {
    let s = '';
    [[-30, 0], [-15, 1], [5, 2], [22, 3]].forEach(([a, i]) => (s += `<g transform="rotate(${a} 60 60)"><rect x="${30 + i * 14}" y="20" width="9" height="78" rx="3" fill="#1d1d1d"/><rect x="${32 + i * 14}" y="24" width="2" height="66" fill="#555"/></g>`));
    return s;
  },
  eraser(o) {
    return `<g transform="rotate(-14 60 60)"><rect x="22" y="44" width="76" height="32" rx="6" fill="#fff" stroke="#d6d6d6"/><rect x="48" y="44" width="50" height="32" fill="${o.col || '#2E6FD8'}"/><rect x="58" y="56" width="30" height="5" fill="#fff" opacity=".8"/></g>`;
  },
  paper(o) {
    let s = '';
    for (let i = 3; i >= 0; i--) s += `<rect x="${22 + i * 4}" y="${18 + i * 4}" width="70" height="88" rx="2" fill="${i ? '#f0ece4' : '#fff'}" stroke="#ddd6c9"/>`;
    return s + `<rect x="22" y="80" width="70" height="18" fill="${o.tag || '#2A6F97'}"/><rect x="28" y="86" width="34" height="5" fill="#fff" opacity=".8"/>`;
  },
  curve(o) {
    return `<path d="M16 88c10-40 40-62 70-58 18 3 18 20 6 26-14 7-10 22 8 26-20 12-58 14-84 6z" fill="${o.col || '#5FB3E6'}" opacity=".75"/><circle cx="46" cy="72" r="6" fill="#fff" opacity=".9"/><path d="M24 84c12-30 34-46 58-46" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/>`;
  },
  whiteboard() {
    return `<rect x="10" y="18" width="100" height="74" rx="4" fill="#fff" stroke="#8C97A3" stroke-width="4"/><rect x="20" y="28" width="26" height="44" rx="4" fill="none" stroke="#277DA1" stroke-width="2.5"/><path d="M54 32h40M54 42h30M54 52h36" stroke="#E63946" stroke-width="2.5" stroke-linecap="round"/><path d="M56 64h30v14H56z" fill="none" stroke="#2A9D8F" stroke-width="2.5"/><rect x="30" y="96" width="60" height="6" rx="2" fill="#8C97A3"/><rect x="66" y="92" width="20" height="5" rx="2" fill="#262329"/>`;
  },
  stencil() {
    return `<rect x="12" y="22" width="96" height="76" rx="6" fill="#9FD8EE"/><rect x="22" y="32" width="22" height="40" rx="4" fill="#fff"/><rect x="50" y="32" width="22" height="40" rx="4" fill="#fff"/><circle cx="86" cy="40" r="7" fill="#fff"/><rect x="78" y="54" width="20" height="6" rx="3" fill="#fff"/><rect x="22" y="80" width="76" height="6" rx="3" fill="#fff"/><path d="M80 66h16l-8 10z" fill="#fff"/>`;
  },
  chalk() {
    const c = [COL.white, COL.blue, COL.red, COL.yellow];
    let s = '';
    c.forEach((col, i) => (s += `<g transform="rotate(${-20 + i * 14} 60 64)"><path d="M${26 + i * 12} 92 ${44 + i * 12} 34 ${62 + i * 12} 92z" fill="${col}" stroke="#ccc"/></g>`));
    return s;
  },
};
const _artCache = {};
function artSvg(art) {
  const key = JSON.stringify(art);
  if (!_artCache[key]) _artCache[key] = `<svg viewBox="0 0 120 120" aria-hidden="true" focusable="false">${ART[art.kind](art)}</svg>`;
  return _artCache[key];
}

/* ---------- Taxonomy ---------- */
const CATS = [
  { id: 'paints', name: 'Paints', icon: 'palette', bg: '#F0E9FF' },
  { id: 'pencils', name: 'Pencils & Charcoal', short: 'Pencils', icon: 'pencil', bg: '#F0E9FF' },
  { id: 'markers', name: 'Markers & Pens', short: 'Markers', icon: 'crayon', bg: '#F0E9FF' },
  { id: 'paper', name: 'Sketchbooks & Paper', short: 'Sketch', icon: 'ledger', bg: '#F0E9FF' },
  { id: 'brushes', name: 'Brushes', icon: 'brush', bg: '#F0E9FF' },
  { id: 'canvas', name: 'Canvas & Palettes', short: 'Canvas', icon: 'frame', bg: '#F0E9FF' },
  { id: 'model', name: 'Model-making', short: 'Models', icon: 'package', bg: '#F0E9FF' },
  { id: 'cutting', name: 'Cutting Tools', short: 'Cutting', icon: 'scissors', bg: '#F0E9FF' },
  { id: 'drafting', name: 'Drafting', icon: 'ruler', bg: '#F0E9FF' },
  { id: 'fashion', name: 'Fashion Tools', short: 'Fashion', icon: 'thread', bg: '#F0E9FF' },
  { id: 'studio', name: 'Studio & Workshop', short: 'Studio', icon: 'notepad', bg: '#F0E9FF' },
  { id: 'craft', name: 'Craft & Glue', short: 'Craft', icon: 'yarn', bg: '#F0E9FF' },
];

const FIELDS = [
  { id: 'uiux', name: 'UI/UX Design', icon: 'phone', bg: '#F0E9FF', blurb: 'Wireframing, workshops, sketching', kit: ['p20', 'p35', 'p37', 'p14', 'p36', 'p17'] },
  { id: 'graphic', name: 'Graphic Design', icon: 'pen', bg: '#F0E9FF', blurb: 'Markers, liners, lettering', kit: ['p13', 'p14', 'p19', 'p18', 'p15', 'p10'] },
  { id: 'fashion', name: 'Fashion Design', icon: 'dress', bg: '#F0E9FF', blurb: 'Croquis, fabric markers, measuring', kit: ['p22', 'p16', 'p33', 'p32', 'p34', 'p10', 'p9'] },
  { id: 'interior', name: 'Interior Design', icon: 'couch', bg: '#F0E9FF', blurb: 'Drafting, scale, model boards', kit: ['p30', 'p31', 'p23', 'p26', 'p27', 'p28', 'p14'] },
  { id: 'product', name: 'Product Design', icon: 'puzzle', bg: '#F0E9FF', blurb: 'Ideation sketching, mock-ups', kit: ['p19', 'p13', 'p26', 'p27', 'p28', 'p32'] },
  { id: 'arch', name: 'Architecture', icon: 'building', bg: '#F0E9FF', blurb: 'Technical pens, sheets, models', kit: ['p30', 'p31', 'p23', 'p26', 'p27', 'p28', 'p9'] },
  { id: 'fine', name: 'Fine Arts', icon: 'palette', bg: '#F0E9FF', blurb: 'Paints, brushes, canvas', kit: ['p1', 'p3', 'p6', 'p24', 'p25', 'p5', 'p11', 'p21'] },
  { id: 'illus', name: 'Illustration', icon: 'writing', bg: '#F0E9FF', blurb: 'Inking, watercolour, markers', kit: ['p15', 'p13', 'p8', 'p21', 'p3', 'p10', 'p19'] },
  { id: 'craft', name: 'Craft & DIY', icon: 'yarn', bg: '#F0E9FF', blurb: 'Glue, cutting, colours', kit: ['p29', 'p27', 'p16', 'p2', 'p25', 'p7', 'p26'] },
];

/* ---------- Catalogue ---------- */
// variants: [label, price, mrp, stock]
const RAW = [
  ['p1', 'Acrylic Paint Set', 'Brustro', 'paints', 'Acrylic', { kind: 'paintset' }, [['12 shades · 12 ml', 549, 650, 14], ['24 shades · 22 ml', 899, 1100, 9], ['42-piece kit with brushes', 1220, 1525, 3]], 4.7, 1245,
    'A complete acrylic painting kit for artists, beginners and design students. Vibrant, opaque colours that dry to a satin finish on canvas, paper and wood.',
    { Type: 'Artist acrylic', Finish: 'Satin', 'Drying time': '15–20 min, thin layer', 'Works on': 'Canvas, paper, wood' }, 1],
  ['p2', 'Acrylic Colour Tubes, 10 × 9 ml', 'Kokuyo Camlin', 'paints', 'Acrylic', { kind: 'tubes' }, [['10 shades', 260, 300, 25]], 4.5, 3120,
    'Student-grade acrylic tubes for craft, school projects and quick colour studies.', { Type: 'Student acrylic', Pack: '10 × 9 ml tubes' }],
  ['p3', 'Cotman Watercolour Half Pans', 'Winsor & Newton', 'paints', 'Watercolour', { kind: 'watercolor', box: '#1f3b5a' }, [['12 half pans', 1299, 1550, 6], ['24 half pans', 2299, 2700, 0]], 4.8, 842,
    'Transparent, finely ground student watercolours in a compact travel tin with a mixing lid.', { Type: 'Student watercolour', Format: 'Half pans in tin', 'Includes': 'Mixing lid, sable-blend brush' }],
  ['p4', 'Artist Watercolour Pans, 36 Shades', 'Brustro', 'paints', 'Watercolour', { kind: 'watercolor', box: '#3a2a1f' }, [['36 pans', 749, 899, 18]], 4.4, 1960,
    'A wide colour range for swatching, sketchbook studies and plein-air work.', { Type: 'Artist watercolour', Format: 'Pans with palette lid' }],
  ['p5', 'Oil Colour Set, 12 × 20 ml', 'Kokuyo Camlin', 'paints', 'Oil', { kind: 'tubes', cols: [COL.navy, COL.yellow, COL.red, COL.white, COL.brown] }, [['12 shades', 420, 495, 12]], 4.5, 690,
    'Buttery oil colours with good tinting strength for beginners and studio practice.', { Type: 'Student oil', Pack: '12 × 20 ml' }],
  ['p6', 'Synthetic Round Brushes, Set of 7', 'Brustro', 'brushes', 'Round', { kind: 'brushes' }, [['Set of 7', 349, 420, 20]], 4.6, 2310,
    'Soft synthetic round brushes, sizes 0 to 12, that hold a point for detail and fill work.', { Hair: 'Synthetic taklon', Sizes: '0, 2, 4, 6, 8, 10, 12', 'Best for': 'Acrylic, watercolour, gouache' }],
  ['p7', 'Flat Brushes for Acrylic & Oil, Set of 6', 'Kokuyo Camlin', 'brushes', 'Flat', { kind: 'brushes', flat: true, cols: [COL.black, COL.black, COL.black, COL.black, COL.black] }, [['Set of 6', 199, 240, 30]], 4.3, 1404,
    'Firm flat brushes for blocking in colour and bold strokes.', { Hair: 'Synthetic bristle', Sizes: '2 to 12' }],
  ['p8', 'Koi Water Brush Pens, Set of 3', 'Sakura', 'brushes', 'Water brush', { kind: 'brushes', clear: true, cols: [0, 0, 0] }, [['Set of 3', 450, 520, 7]], 4.6, 512,
    'Refillable water brushes for watercolour on the go. Squeeze the barrel to control the flow.', { Tips: 'Small, medium, large', Barrel: 'Refillable' }],
  ['p9', 'Castell 9000 Graphite Pencils, 8B–2H', 'Faber-Castell', 'pencils', 'Graphite', { kind: 'pencils', grey: true, box: '#2E7D4F' }, [['Set of 12', 540, 600, 22]], 4.8, 5410,
    'Break-resistant graphite pencils across 12 grades for sketching, shading and technical drawing.', { Grades: '8B, 7B … HB, F, H, 2H', Case: 'Metal tin' }],
  ['p10', 'Ergosoft Colour Pencils', 'Staedtler', 'pencils', 'Colour', { kind: 'pencils', box: '#1E3A5F' }, [['24 shades', 520, 650, 15], ['36 shades', 780, 975, 8]], 4.6, 2208,
    'Soft, bright colour pencils with a triangular grip and break-resistant leads.', { Lead: '3 mm, break resistant', Shape: 'Triangular' }],
  ['p11', 'Charcoal Pencils & Sticks Set', 'Brustro', 'pencils', 'Charcoal', { kind: 'charcoal' }, [['10 pieces', 299, 360, 11]], 4.4, 388,
    'Willow sticks, compressed charcoal and charcoal pencils for gesture and tonal drawing.', { Includes: '4 willow, 3 compressed, 3 pencils' }],
  ['p12', 'Mars Plastic Erasers, Pack of 4', 'Staedtler', 'pencils', 'Erasers', { kind: 'eraser' }, [['Pack of 4', 90, 100, 40]], 4.8, 7020,
    'Clean, smudge-free erasing on paper and drafting film.', { Material: 'Phthalate-free vinyl' }],
  ['p13', 'Dual-tip Alcohol Markers', 'Touchfive', 'markers', 'Alcohol', { kind: 'markers' }, [['30 shades', 649, 799, 10], ['60 shades', 899, 1100, 6], ['80 shades', 1199, 1499, 0]], 4.5, 3655,
    'Chisel and fine tips with smooth, streak-free blending. Ideal for product rendering and illustration.', { Tips: 'Chisel + fine', Ink: 'Alcohol-based', Case: 'Zip carry bag' }, 1],
  ['p14', 'Pigment Liner Fineliners, Set of 6', 'Staedtler', 'markers', 'Fineliners', { kind: 'fineliners', cols: [COL.sky, COL.yellow, COL.red, COL.green, COL.purple, COL.orange] }, [['0.05 to 0.8 mm', 480, 550, 16]], 4.7, 1832,
    'Waterproof, lightfast pigment ink across six line widths for sketching and technical drawing.', { Widths: '0.05, 0.1, 0.3, 0.5, 0.7, 0.8 mm', Ink: 'Pigment, waterproof' }],
  ['p15', 'Pigma Micron Fineliners, 6 Sizes', 'Sakura', 'markers', 'Fineliners', { kind: 'fineliners', body: '#333', cols: ['#bbb', '#bbb', '#bbb', '#bbb', '#bbb', '#bbb'] }, [['Black, 6 sizes', 699, 780, 9]], 4.8, 2950,
    'Archival ink that will not bleed through watercolour or markers. A favourite for inking.', { Widths: '005 to 08', Ink: 'Archival pigment' }],
  ['p16', 'Fabric Markers, Set of 12', 'Kokuyo Camlin', 'markers', 'Fabric', { kind: 'markers', cols: [COL.red, COL.pink, COL.purple, COL.blue, COL.green, COL.yellow] }, [['12 shades', 240, 280, 14]], 4.2, 940,
    'Permanent markers for cotton and blends. Heat-set with an iron for wash-fast colour.', { Fabrics: 'Cotton, cotton blends', Fixing: 'Iron for 2 min' }],
  ['p17', '550 Whiteboard Markers, Pack of 4', 'Artline', 'markers', 'Whiteboard', { kind: 'markers', cols: [COL.black, COL.blue, COL.red, COL.green] }, [['4 colours', 120, 140, 30]], 4.5, 4120,
    'Low-odour dry-erase markers that wipe clean. Good for workshops and critiques.', { Tip: 'Bullet, 2 mm' }],
  ['p18', 'Brush Pens, Set of 12', 'Doms', 'markers', 'Brush pens', { kind: 'fineliners', body: '#f2f2f2', cols: RB.slice(0, 6) }, [['12 shades', 199, 240, 0]], 4.1, 760,
    'Flexible brush tips for hand lettering and quick colour.', { Tip: 'Flexible fibre brush' }],
  ['p19', 'Sketchbook, 140 gsm, 100 Pages', 'Brustro', 'paper', 'Sketchbooks', { kind: 'sketchbook' }, [['A5', 160, 199, 25], ['A4', 220, 275, 20], ['A3', 390, 450, 5]], 4.6, 6240,
    'Acid-free 140 gsm paper that takes pencil, ink and light washes. Lay-flat spiral binding.', { Paper: '140 gsm, acid-free', Binding: 'Spiral, lay-flat', Pages: '100' }, 1],
  ['p20', 'Dot Grid Notebook, A5, 160 Pages', 'quickart Basics', 'paper', 'Notebooks', { kind: 'sketchbook', cover: '#7A3FA0' }, [['A5', 249, 299, 30]], 4.5, 410,
    '5 mm dot grid for wireframes, user flows and bullet journaling. 100 gsm, no ghosting.', { Grid: '5 mm dots', Paper: '100 gsm' }],
  ['p21', 'Watercolour Pad, 300 gsm', 'Canson', 'paper', 'Watercolour paper', { kind: 'paper', tag: '#2A6F97' }, [['A4 · 12 sheets', 549, 650, 8], ['A3 · 12 sheets', 899, 1050, 4]], 4.7, 1115,
    'Cold-pressed, 25% cotton paper that handles washes without buckling.', { Weight: '300 gsm', Surface: 'Cold pressed' }],
  ['p22', 'Fashion Croquis Pad, A4, 50 Sheets', 'quickart Basics', 'paper', 'Marker & layout', { kind: 'paper', tag: '#C2185B' }, [['A4', 199, 240, 12]], 4.3, 186,
    'Smooth marker paper with faint 9-head croquis guides for fashion illustration.', { Paper: '90 gsm marker paper', Guides: '9-head croquis' }],
  ['p23', 'Drawing Sheets, Pack of 10', 'quickart Basics', 'paper', 'Drawing sheets', { kind: 'paper', tag: '#5B6B7A' }, [['A2 · 10 sheets', 180, 200, 40], ['A1 · 10 sheets', 320, 360, 15]], 4.4, 902,
    'Bright white cartridge sheets for plates, drafting and presentation drawings.', { Weight: '180 gsm', Finish: 'Smooth cartridge' }],
  ['p24', 'Stretched Cotton Canvas', 'Kokuyo Camlin', 'canvas', 'Canvas', { kind: 'canvas' }, [['8 × 10 in', 179, 210, 20], ['12 × 16 in', 299, 350, 12], ['16 × 20 in', 449, 520, 4]], 4.4, 1530,
    'Triple-primed cotton canvas on a pine frame, ready for acrylic and oil.', { Primer: 'Triple acrylic gesso', Frame: 'Pine, 18 mm' }, 1],
  ['p25', 'Wooden Palette & Knife Set', 'quickart Basics', 'canvas', 'Palettes', { kind: 'palette' }, [['Palette + 3 knives', 149, 180, 18]], 4.2, 344,
    'Sealed wooden palette with three steel painting knives.', { Includes: 'Palette, 3 knives' }],
  ['p26', 'Foam Board, 5 mm, Pack of 5', 'quickart Basics', 'model', 'Boards', { kind: 'foamboard' }, [['A2 · 5 boards', 260, 300, 22], ['A1 · 5 boards', 450, 520, 9]], 4.5, 726,
    'Lightweight, rigid board with a smooth face for architectural and product models.', { Thickness: '5 mm', Face: 'White, smooth' }],
  ['p27', 'Precision Cutter, L-1', 'Olfa', 'cutting', 'Cutters', { kind: 'cutter' }, [['With 2 spare blades', 399, 450, 14]], 4.8, 2050,
    'Snap-off cutter with auto-lock for straight, clean cuts in board and card.', { Blade: '18 mm snap-off', Lock: 'Auto-lock' }],
  ['p28', 'Self-healing Cutting Mat', 'Olfa', 'cutting', 'Mats', { kind: 'mat' }, [['A4', 499, 580, 6], ['A3', 899, 1050, 5]], 4.7, 1290,
    'Double-sided mat with a 1 cm grid that closes up after every cut.', { Grid: '1 cm, both sides', Thickness: '1.5 mm' }, 1],
  ['p29', 'Fevicol MR White Glue, 200 g', 'Pidilite', 'craft', 'Glue', { kind: 'glue' }, [['200 g', 75, 80, 50]], 4.7, 9800,
    'Quick-drying white glue for paper, card, foam board and wood.', { Dries: 'Clear' }],
  ['p30', 'Triangular Scale Ruler, 30 cm', 'Staedtler', 'drafting', 'Scales', { kind: 'ruler' }, [['1:20 to 1:500', 349, 399, 10]], 4.6, 655,
    'Six metric scales on one ruler for plans, sections and elevations.', { Scales: '1:20, 1:25, 1:50, 1:75, 1:100, 1:500' }],
  ['p31', 'Isograph Technical Pen', 'rOtring', 'drafting', 'Technical pens', { kind: 'fineliners', single: true, body: '#2b2b2b' }, [['0.25 mm', 1650, 1850, 3], ['0.35 mm', 1650, 1850, 4], ['0.5 mm', 1650, 1850, 0]], 4.7, 318,
    'Refillable technical pen for consistent line weights on drafting film and paper.', { Ink: 'Refillable cartridge', Nib: 'Tubular steel' }, 1],
  ['p32', 'French Curves, Set of 3', 'Staedtler', 'drafting', 'Curves', { kind: 'curve' }, [['Set of 3', 210, 250, 13]], 4.4, 298,
    'Transparent curves for smooth necklines, armholes and product profiles.', { Material: 'Acrylic' }],
  ['p33', "Tailor's Measuring Tape, 150 cm", 'Singer', 'fashion', 'Measuring', { kind: 'tape' }, [['150 cm', 60, 75, 35]], 4.5, 2210,
    'Soft fibreglass tape with cm and inch markings that does not stretch.', { Length: '150 cm / 60 in' }],
  ['p34', "Tailor's Chalk, Pack of 6", 'quickart Basics', 'fashion', 'Marking', { kind: 'chalk' }, [['6 colours', 45, 55, 28]], 4.1, 140,
    'Clay chalk that marks clearly on fabric and brushes away.', { Colours: 'White, blue, red, yellow' }],
  ['p35', 'Post-it Notes, 3 × 3 in, 5 Pads', '3M Post-it', 'studio', 'Sticky notes', { kind: 'sticky' }, [['5 pads · 450 notes', 299, 350, 24]], 4.8, 3870,
    'Repositionable notes for affinity mapping, journey maps and crits.', { Size: '76 × 76 mm', Notes: '90 per pad' }],
  ['p36', 'Mini Whiteboard, A3, with Marker', 'quickart Basics', 'studio', 'Whiteboards', { kind: 'whiteboard' }, [['A3', 349, 399, 9]], 4.3, 211,
    'Desk-size dry-erase board for quick flows and sketch reviews.', { Size: 'A3', Includes: '1 marker' }],
  ['p37', 'Mobile UI Sketching Stencil', 'quickart Basics', 'studio', 'Stencils', { kind: 'stencil' }, [['Mobile, 1:1', 299, 350, 12]], 4.4, 163,
    'Steel-edge stencil with phone frames, icons and common UI controls at 1:1.', { Includes: 'Frames, icons, controls' }],
];

const PRODUCTS = RAW.map(([id, name, brand, cat, sub, art, v, rating, reviews, desc, specs, dv]) => ({
  id, name, brand, cat, sub, art, rating, reviews, desc, specs, dv: dv || 0,
  variants: v.map(([label, price, mrp, stock]) => ({ label, price, mrp, stock })),
}));
const P = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
PRODUCTS.forEach((p) => {
  p.fields = FIELDS.filter((f) => f.kit.includes(p.id)).map((f) => f.id);
  p.bg = (CATS.find((c) => c.id === p.cat) || {}).bg || '#F4F2F7';
});
// Studio product photos (AI-generated, unbranded). Products without one fall back to the drawn illustration.
const PHOTOS = new Set(Array.from({ length: 25 }, (_, i) => 'p' + (i + 1)));
PRODUCTS.forEach((p) => { if (PHOTOS.has(p.id)) p.art = { ...p.art, photo: 'img/' + p.id + '.jpg' }; });
const BRANDS = [...new Set(PRODUCTS.map((p) => p.brand))].sort();

/* ---------- Explore reels (simulated demo clips) ---------- */
const REELS = [
  { id: 'r1', scene: 'markers', title: 'Blending three alcohol markers without streaks', creator: 'inkbymeera', fields: ['illus', 'graphic', 'product'], tags: ['drawing'], products: ['p13', 'p22'], likes: 12400, bg: '#F4EFE6' },
  { id: 'r2', scene: 'watercolor', title: 'Student vs artist grade: how the pigment blooms on 300 gsm', creator: 'wetonwet.studio', fields: ['fine', 'illus'], tags: ['painting'], products: ['p3', 'p21'], likes: 8930, bg: '#F7F6F2' },
  { id: 'r3', scene: 'cut', title: 'One-pass foam board cuts for your model jury', creator: 'model.lab.ahd', fields: ['arch', 'interior', 'product'], tags: ['model'], products: ['p27', 'p28', 'p26'], likes: 5210, bg: '#2F7D59' },
  { id: 'r4', scene: 'sticky', title: 'Affinity mapping kit for your next UX workshop', creator: 'ux.with.ananya', fields: ['uiux', 'graphic'], tags: ['studio'], products: ['p35', 'p17'], likes: 3880, bg: '#E9E4DA' },
  { id: 'r5', scene: 'brush', title: 'Which round brush holds a point for acrylic detail?', creator: 'canvas.kabir', fields: ['fine', 'craft'], tags: ['painting'], products: ['p6', 'p1'], likes: 15100, bg: '#22303C' },
  { id: 'r6', scene: 'fineliner', title: 'Line weights for elevations: 0.05 to 0.8 mm', creator: 'drafts.by.dev', fields: ['arch', 'interior'], tags: ['drawing'], products: ['p14', 'p30'], likes: 4420, bg: '#F3F5F7' },
  { id: 'r7', scene: 'tape', title: 'Measuring for your first croquis-to-pattern project', creator: 'studio.tanvi', fields: ['fashion'], tags: ['studio'], products: ['p33', 'p22', 'p32'], likes: 2760, bg: '#F6E3EC' },
  { id: 'r8', scene: 'sketch', title: 'Hatching tones from 8B down to 2H', creator: 'sketch.daily', fields: ['fine', 'illus', 'arch'], tags: ['drawing'], products: ['p9', 'p19'], likes: 21800, bg: '#FBFAF6' },
  { id: 'r9', scene: 'swatch', title: 'Swatching all 24 shades before you buy', creator: 'colourcheck', fields: ['fine', 'craft'], tags: ['painting'], products: ['p1', 'p2'], likes: 9640, bg: '#FFFFFF' },
];
const R = Object.fromEntries(REELS.map((r) => [r.id, r]));

/* Scene drawings. Animated with CSS classes: .s-dr (stroke draws in), .s-bloom, .s-pop, .s-slide, .s-grow */
const SCENES = {
  markers: () => `<rect width="360" height="640" fill="#F4EFE6"/>
    <rect x="30" y="150" width="300" height="340" rx="6" fill="#fff"/>
    <path class="s-dr" style="--d:0s" pathLength="1" d="M60 230 C140 190 220 270 300 220" stroke="#F15BB5" stroke-width="30" fill="none" stroke-linecap="round" opacity=".85"/>
    <path class="s-dr" style="--d:.9s" pathLength="1" d="M60 300 C140 260 220 340 300 290" stroke="#5FB3E6" stroke-width="30" fill="none" stroke-linecap="round" opacity=".85"/>
    <path class="s-dr" style="--d:1.8s" pathLength="1" d="M60 370 C140 330 220 410 300 360" stroke="#F9C74F" stroke-width="30" fill="none" stroke-linecap="round" opacity=".85"/>
    <path class="s-dr" style="--d:2.7s" pathLength="1" d="M90 440 L270 200" stroke="#8E44AD" stroke-width="22" fill="none" stroke-linecap="round" opacity=".55"/>`,
  watercolor: () => `<rect width="360" height="640" fill="#F7F4EC"/>
    <defs><radialGradient id="wg0"><stop offset="0" stop-color="#277DA1" stop-opacity=".85"/><stop offset=".55" stop-color="#277DA1" stop-opacity=".55"/><stop offset="1" stop-color="#277DA1" stop-opacity="0"/></radialGradient><radialGradient id="wg1"><stop offset="0" stop-color="#F15BB5" stop-opacity=".85"/><stop offset=".55" stop-color="#F15BB5" stop-opacity=".55"/><stop offset="1" stop-color="#F15BB5" stop-opacity="0"/></radialGradient><radialGradient id="wg2"><stop offset="0" stop-color="#F9C74F" stop-opacity=".85"/><stop offset=".55" stop-color="#F9C74F" stop-opacity=".55"/><stop offset="1" stop-color="#F9C74F" stop-opacity="0"/></radialGradient><radialGradient id="wg3"><stop offset="0" stop-color="#43AA8B" stop-opacity=".85"/><stop offset=".55" stop-color="#43AA8B" stop-opacity=".55"/><stop offset="1" stop-color="#43AA8B" stop-opacity="0"/></radialGradient><radialGradient id="wg4"><stop offset="0" stop-color="#8E44AD" stop-opacity=".85"/><stop offset=".55" stop-color="#8E44AD" stop-opacity=".55"/><stop offset="1" stop-color="#8E44AD" stop-opacity="0"/></radialGradient></defs>
    <circle class="s-bloom" style="--d:0s; mix-blend-mode:multiply" cx="110" cy="230" r="95" fill="url(#wg0)"/>
    <circle class="s-bloom" style="--d:0.7s; mix-blend-mode:multiply" cx="250" cy="250" r="90" fill="url(#wg1)"/>
    <circle class="s-bloom" style="--d:1.4s; mix-blend-mode:multiply" cx="150" cy="370" r="105" fill="url(#wg2)"/>
    <circle class="s-bloom" style="--d:2.1s; mix-blend-mode:multiply" cx="255" cy="420" r="85" fill="url(#wg3)"/>
    <circle class="s-bloom" style="--d:2.8s; mix-blend-mode:multiply" cx="95" cy="470" r="70" fill="url(#wg4)"/>`,
  cut: () => {
    let g = '';
    for (let x = 0; x <= 360; x += 30) g += `<path d="M${x} 0v640" stroke="#5FB08A" stroke-width="1"/>`;
    for (let y = 0; y <= 640; y += 30) g += `<path d="M0 ${y}h360" stroke="#5FB08A" stroke-width="1"/>`;
    return `<rect width="360" height="640" fill="#2F7D59"/>${g}
      <rect x="50" y="200" width="260" height="200" fill="#fff" transform="rotate(-4 180 300)"/>
      <path class="s-dr" style="--d:.2s" pathLength="1" d="M60 300 L300 280" stroke="#262329" stroke-width="3" fill="none"/>
      <g class="s-slide"><g transform="rotate(-35 60 290)"><rect x="-10" y="280" width="72" height="20" rx="6" fill="#F2C230"/><rect x="0" y="284" width="50" height="12" rx="4" fill="#222"/><path d="M62 283 88 290 62 297Z" fill="#C8CDD3"/></g></g>`;
  },
  sticky: () => {
    const notes = [[40, 160, '#FFE066'], [130, 150, '#FFE066'], [60, 250, '#FFE066'], [210, 180, '#FF8FB1'], [270, 260, '#FF8FB1'], [200, 290, '#FF8FB1'], [60, 400, '#7FD3F7'], [150, 420, '#7FD3F7'], [240, 400, '#B9F18D']];
    return `<rect width="360" height="640" fill="#E9E4DA"/>` + notes.map(([x, y, c], i) => `<g class="s-pop" style="--d:${i * 0.35}s"><rect x="${x}" y="${y}" width="74" height="74" fill="${c}"/><path d="M${x + 10} ${y + 24}h50M${x + 10} ${y + 38}h38M${x + 10} ${y + 52}h44" stroke="#00000033" stroke-width="4" stroke-linecap="round"/></g>`).join('');
  },
  brush: () => `<rect width="360" height="640" fill="#22303C"/>
    <rect x="40" y="140" width="280" height="360" fill="#F4F1EA"/>
    <path class="s-dr" style="--d:0s" pathLength="1" d="M70 220 C120 160 160 300 210 230 S290 200 300 260" stroke="#E63946" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path class="s-dr" style="--d:1.2s" pathLength="1" d="M70 320 C120 270 170 380 220 320 S290 300 300 350" stroke="#277DA1" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path class="s-dr" style="--d:2.4s" pathLength="1" d="M70 420 C130 380 170 470 230 410 S290 400 300 440" stroke="#262329" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
  fineliner: () => {
    let g = '';
    for (let x = 0; x <= 360; x += 20) g += `<path d="M${x} 0v640" stroke="#DDE6EE" stroke-width="1"/>`;
    for (let y = 0; y <= 640; y += 20) g += `<path d="M0 ${y}h360" stroke="#DDE6EE" stroke-width="1"/>`;
    return `<rect width="360" height="640" fill="#F3F5F7"/>${g}
      <path class="s-dr" style="--d:0s" pathLength="1" d="M40 460 H320" stroke="#111" stroke-width="4" fill="none"/>
      <path class="s-dr" style="--d:.6s" pathLength="1" d="M70 460 V260 L180 170 L290 260 V460" stroke="#111" stroke-width="2.5" fill="none"/>
      <path class="s-dr" style="--d:1.4s" pathLength="1" d="M110 300 h50 v60 h-50 z M200 300 h50 v60 h-50 z" stroke="#111" stroke-width="1.2" fill="none"/>
      <path class="s-dr" style="--d:2.1s" pathLength="1" d="M155 460 v-70 h50 v70" stroke="#111" stroke-width="1.2" fill="none"/>
      <path class="s-dr" style="--d:2.8s" pathLength="1" d="M70 490 H290 M70 484 v12 M290 484 v12" stroke="#666" stroke-width=".6" fill="none"/>`;
  },
  tape: () => {
    let t = '';
    for (let i = 0; i < 30; i++) t += `<path d="M${42 + i * 9} 300v${i % 5 ? 10 : 18}" stroke="#333" stroke-width="1.4"/>`;
    return `<rect width="360" height="640" fill="#F6E3EC"/>
      <path d="M0 0 L360 640 M60 0 L360 540 M0 100 L300 640" stroke="#EBC7D7" stroke-width="40"/>
      <g class="s-grow"><rect x="40" y="300" width="290" height="34" fill="#F9D648"/>${t}</g>
      <circle cx="40" cy="317" r="44" fill="#E63946"/><circle cx="40" cy="317" r="16" fill="#fff" opacity=".4"/>`;
  },
  sketch: () => {
    let h = '';
    for (let i = 0; i < 16; i++) h += `<path class="s-dr" style="--d:${1 + i * 0.12}s" pathLength="1" d="M${120 + i * 8} 380 l40 -60" stroke="#444" stroke-width="${2.6 - i * 0.12}" fill="none" stroke-linecap="round"/>`;
    return `<rect width="360" height="640" fill="#FBFAF6"/>
      <path class="s-dr" style="--d:0s" pathLength="1" d="M180 200 C250 200 280 270 270 330 C260 400 210 430 180 430 C150 430 100 400 90 330 C80 270 110 200 180 200Z" stroke="#222" stroke-width="2.5" fill="none"/>${h}`;
  },
  swatch: () => {
    let s = '';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
      const i = r * 6 + c;
      s += `<rect class="s-pop" style="--d:${i * 0.12}s" x="${34 + c * 50}" y="${170 + r * 70}" width="42" height="56" rx="4" fill="${RB[i % 12]}" opacity="${r % 2 ? 0.75 : 1}"/>`;
    }
    return `<rect width="360" height="640" fill="#fff"/>${s}`;
  },
};
