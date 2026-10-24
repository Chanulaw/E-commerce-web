/* ShopWave - app.js (vanilla JavaScript, data kept in localStorage) */
'use strict';
(() => {
  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage full or blocked */ } }
  };
  const KEYS = { cart: 'sw_cart', wish: 'sw_wishlist', orders: 'sw_orders', stock: 'sw_stock', prefs: 'sw_prefs', promo: 'sw_promo', news: 'sw_newsletter', users: 'sw_users', session: 'sw_session', lock: 'sw_lock' };
  const money = n => 'Rs. ' + Math.round(n).toLocaleString('en-US');
  const motionOff = () => document.documentElement.classList.contains('no-motion') || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- data: exactly 10 products, exactly 3 categories ---------- */
  const CATEGORIES = [
    { id: 'electronics', name: 'Electronics', icon: '🔌' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'food', name: 'Food & Drink', icon: '🍵' }
  ];
  const PRODUCTS = [
    { id: 1, name: 'Aurora Wireless Headphones', category: 'electronics', price: 18500, was: 22000, stock: 12, rating: 4.6, reviews: 328, emoji: '🎧', c: ['#6366f1', '#a78bfa'], desc: 'Over-ear Bluetooth 5.3 headphones with active noise cancellation and all-day comfort.', features: ['Active noise cancellation', '40-hour battery life', 'Foldable design', 'Built-in microphone'] },
    { id: 2, name: 'Pulse Smart Watch', category: 'electronics', price: 24900, was: null, stock: 7, rating: 4.4, reviews: 212, emoji: '⌚', c: ['#0ea5e9', '#22d3ee'], desc: 'Track steps, heart rate and sleep with a bright AMOLED display and week-long battery.', features: ['AMOLED touch display', 'Heart-rate and sleep tracking', 'Water resistant (5 ATM)', '7-day battery'] },
    { id: 3, name: 'Echo Mini Bluetooth Speaker', category: 'electronics', price: 9750, was: 11500, stock: 3, rating: 4.3, reviews: 154, emoji: '🔊', c: ['#ec4899', '#f97316'], desc: 'A pocket-sized speaker with surprisingly deep bass and a splash-proof body.', features: ['360° sound', 'IPX6 splash proof', '12-hour playtime', 'Pairs two speakers'] },
    { id: 4, name: 'VoltMax 20000mAh Power Bank', category: 'electronics', price: 7200, was: null, stock: 0, rating: 4.7, reviews: 97, emoji: '🔋', c: ['#14b8a6', '#84cc16'], desc: 'Fast-charging power bank that keeps your phone and tablet going for days.', features: ['20000mAh capacity', '22.5W fast charge', 'Dual USB + USB-C', 'LED charge indicator'] },
    { id: 5, name: 'Everyday Cotton T-Shirt', category: 'clothing', price: 2850, was: null, stock: 40, rating: 4.2, reviews: 540, emoji: '👕', c: ['#38bdf8', '#818cf8'], desc: 'Soft 100% combed cotton tee with a relaxed fit that works with everything.', features: ['100% combed cotton', 'Pre-shrunk fabric', 'Machine washable', 'Sizes S to XXL'] },
    { id: 6, name: 'Classic Denim Jacket', category: 'clothing', price: 11900, was: 14500, stock: 9, rating: 4.5, reviews: 187, emoji: '🧥', c: ['#1d4ed8', '#60a5fa'], desc: 'A timeless mid-wash denim jacket with sturdy stitching and metal buttons.', features: ['Durable mid-weight denim', 'Two chest pockets', 'Regular fit', 'Gets better with wear'] },
    { id: 7, name: 'StrideFlex Running Shoes', category: 'clothing', price: 15400, was: null, stock: 15, rating: 4.6, reviews: 263, emoji: '👟', c: ['#f43f5e', '#fb923c'], desc: 'Lightweight running shoes with responsive cushioning and a breathable knit upper.', features: ['Breathable knit upper', 'Responsive foam midsole', 'Anti-slip outsole', 'Under 270g'] },
    { id: 8, name: 'Ceylon Tea Gift Box', category: 'food', price: 3600, was: null, stock: 25, rating: 4.8, reviews: 402, emoji: '🍵', c: ['#16a34a', '#a3e635'], desc: 'Six premium single-estate Ceylon teas, beautifully packed for gifting.', features: ['6 estate varieties', '120 g total', 'Recyclable gift box', 'Freshly packed in Sri Lanka'] },
    { id: 9, name: 'Virgin Coconut Oil 500ml', category: 'food', price: 1950, was: 2300, stock: 30, rating: 4.5, reviews: 318, emoji: '🥥', c: ['#92400e', '#fbbf24'], desc: 'Cold-pressed virgin coconut oil for cooking, hair and skin.', features: ['Cold pressed', 'No additives', '500 ml glass bottle', 'Multi-purpose use'] },
    { id: 10, name: 'Dark Chocolate Collection', category: 'food', price: 1250, was: null, stock: 4, rating: 4.7, reviews: 129, emoji: '🍫', c: ['#7c2d12', '#be123c'], desc: 'Smooth 70% cocoa chocolate with notes of cinnamon, ginger and sea salt.', features: ['70% cocoa', '4 flavours', 'Ethically sourced cocoa', '200 g'] }
  ];
  PRODUCTS.forEach(p => {
    p.images = [
      `product-${p.id}-still.jpg`,
      `product-${p.id}-2.jpg`,
      `product-${p.id}-3.jpg`
    ];
    p.img = p.images[0];
    p.still = p.images[0];
  });
  const catName = id => CATEGORIES.find(c => c.id === id).name;
  const byId = id => PRODUCTS.find(p => p.id === Number(id));
  const PROMOS = { SAVE10: { pct: 10, label: '10% off' }, WELCOME5: { pct: 5, label: '5% off' } };
  const FREE_SHIP = 15000, SHIP_FEE = 450;

  /* ---------- state (persisted) ---------- */
  let stock = store.get(KEYS.stock, null);
  if (!stock) {
    stock = {};
    PRODUCTS.forEach(p => stock[p.id] = p.stock);
    store.set(KEYS.stock, stock);
  } else {
    const validIds = new Set(PRODUCTS.map(p => String(p.id)));
    let changed = false;
    Object.keys(stock).forEach(id => {
      if (!validIds.has(String(id))) {
        delete stock[id];
        changed = true;
      }
    });
    PRODUCTS.forEach(p => {
      if (stock[p.id] === undefined) {
        stock[p.id] = p.stock;
        changed = true;
      }
    });
    if (changed) store.set(KEYS.stock, stock);
  }
  /* signed-in shoppers get their own basket, wishlist and orders; guests keep using the plain keys */
  const readSession = () => {
    let s = null;
    try { s = JSON.parse(localStorage.getItem(KEYS.session) || sessionStorage.getItem(KEYS.session) || 'null'); } catch (e) { s = null; }
    return s && store.get(KEYS.users, []).some(u => u.id === s.uid) ? s : null;
  };
  let session = readSession();
  const ukey = n => KEYS[n] + (session ? '_' + session.uid : '');
  let cart = store.get(ukey('cart'), {});
  let wish = store.get(ukey('wish'), []).filter(id => byId(id));
  let orders = store.get(ukey('orders'), []);
  let promo = store.get(ukey('promo'), null);
  let prefs = store.get(KEYS.prefs, { theme: 'light', size: 100, motion: false });
  const filters = { cat: 'all', q: '', sort: 'featured', max: 25000, inStock: false };
  const getStock = id => stock[id] ?? 0;
  const save = () => {
    store.set(ukey('cart'), cart); store.set(ukey('wish'), wish); store.set(KEYS.stock, stock); store.set(ukey('orders'), orders); store.set(ukey('promo'), promo);
    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady() && session) {
      window.ShopWaveFirebase.saveUserCart(session.uid, cart).catch(() => {});
      window.ShopWaveFirebase.saveUserWishlist(session.uid, wish).catch(() => {});
    }
  };

  /* clean cart of invalid ids / over-stock */
  function sanitizeCart() { Object.keys(cart).forEach(id => { if (!byId(id) || getStock(id) < 1) delete cart[id]; else cart[id] = Math.min(cart[id], getStock(id)); }); }
  sanitizeCart();
  function loadScope() {
    cart = store.get(ukey('cart'), {}); wish = store.get(ukey('wish'), []).filter(id => byId(id));
    orders = store.get(ukey('orders'), []); promo = store.get(ukey('promo'), null);
    sanitizeCart();
  }

  /* ---------- feedback: toast, live region ---------- */
  function announce(msg) { const l = $('#live'); l.textContent = ''; setTimeout(() => l.textContent = msg, 50); }
  function toast(msg, type = '') {
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<span aria-hidden="true">' + (type === 'error' ? '⚠️' : '✅') + '</span><span></span>';
    t.lastChild.textContent = msg;
    $('#toasts').appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3200);
  }

  /* ---------- preferences: theme, text size, motion ---------- */
  function applyPrefs() {
    document.documentElement.dataset.theme = prefs.theme;
    document.documentElement.style.fontSize = prefs.size + '%';
    document.documentElement.classList.toggle('no-motion', !!prefs.motion);
    $$('input[name=theme]').forEach(r => r.checked = r.value === prefs.theme);
    $('#motionToggle').checked = !!prefs.motion;
    store.set(KEYS.prefs, prefs);
    syncMedia();
  }
  $$('input[name=theme]').forEach(r => r.addEventListener('change', () => { prefs.theme = r.value; applyPrefs(); }));
  $('#sizeUp').onclick = () => { prefs.size = Math.min(150, prefs.size + 10); applyPrefs(); announce('Text size ' + prefs.size + ' percent'); };
  $('#sizeDown').onclick = () => { prefs.size = Math.max(80, prefs.size - 10); applyPrefs(); announce('Text size ' + prefs.size + ' percent'); };
  $('#sizeReset').onclick = () => { prefs.size = 100; applyPrefs(); announce('Text size reset'); };
  $('#motionToggle').onchange = e => { prefs.motion = e.target.checked; applyPrefs(); };
  const a11yBtn = $('#a11yBtn'), a11yPanel = $('#a11yPanel');
  a11yBtn.onclick = () => { const o = a11yPanel.hidden; a11yPanel.hidden = !o; a11yBtn.setAttribute('aria-expanded', o); };
  document.addEventListener('click', e => { if (!a11yPanel.hidden && !e.target.closest('.a11y-wrap')) { a11yPanel.hidden = true; a11yBtn.setAttribute('aria-expanded', 'false'); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !a11yPanel.hidden) { a11yPanel.hidden = true; a11yBtn.setAttribute('aria-expanded', 'false'); a11yBtn.focus(); } });

  /* ---------- modal manager (focus trap, Esc, restore focus) ---------- */
  const modalStack = [];
  const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  function openModal(id, focusSel) {
    const ov = $('#' + id);
    ov._last = document.activeElement;
    ov.hidden = false;
    requestAnimationFrame(() => ov.classList.add('open'));
    document.body.style.overflow = 'hidden';
    modalStack.push(ov);
    setTimeout(() => {
      const target = (focusSel && $(focusSel, ov)) || $('[role=dialog]', ov);
      target && target.focus();
    }, 60);
  }
  function closeModal(ov) {
    ov = typeof ov === 'string' ? $('#' + ov) : ov;
    if (!ov || ov.hidden) return;
    ov.classList.remove('open');
    const idx = modalStack.indexOf(ov); if (idx > -1) modalStack.splice(idx, 1);
    setTimeout(() => { ov.hidden = true; if (!modalStack.length) document.body.style.overflow = ''; }, motionOff() ? 0 : 300);
    if (ov._last && document.contains(ov._last)) ov._last.focus();
  }
  $$('.overlay').forEach(ov => {
    ov.addEventListener('mousedown', e => { if (e.target === ov) closeModal(ov); });
    ov.addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(ov); });
    ov.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.stopPropagation(); closeModal(ov); }
      if (e.key === 'Tab') {
        const f = $$(FOCUSABLE, ov).filter(x => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ov.firstElementChild)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  });

  /* ---------- ripple on buttons ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('.btn'); if (!b || motionOff()) return;
    const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height);
    const sp = document.createElement('span'); sp.className = 'ripple';
    sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    b.appendChild(sp); setTimeout(() => sp.remove(), 600);
  });

  /* ---------- category nav + chips + footer ---------- */
  function renderCategoryUI() {
    const items = [{ id: 'all', name: 'All products', icon: '🛒' }, ...CATEGORIES];
    $('#catNav').innerHTML = items.map(c => `<button class="cat-link" data-cat="${c.id}" aria-current="${filters.cat === c.id}"><span aria-hidden="true">${c.icon}</span> ${c.name}</button>`).join('');
    $('#chipRow').innerHTML = items.map(c => `<button type="button" class="chip" data-cat="${c.id}" aria-pressed="${filters.cat === c.id}">${c.icon} ${c.name}</button>`).join('');
    $('#footCats').innerHTML = CATEGORIES.map(c => `<li><button type="button" class="foot-link" data-cat="${c.id}"><span class="foot-cat-dot" aria-hidden="true"></span><span class="foot-link-text">${c.name}</span><svg class="foot-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"></polyline></svg></button></li>`).join('');
  }
  function setCategory(id, scroll) {
    filters.cat = id; renderCategoryUI(); renderProducts();
    if (scroll) $('#products').scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth' });
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-cat]'); if (c && !c.closest('#grid')) setCategory(c.dataset.cat, !c.classList.contains('chip'));
    const s = e.target.closest('[data-shop]'); if (s) setCategory(s.dataset.shop, true);
  });

  /* ---------- product grid ---------- */
  function visibleProducts() {
    const q = filters.q.trim().toLowerCase();
    let list = PRODUCTS.filter(p =>
      (filters.cat === 'all' || p.category === filters.cat) &&
      p.price <= filters.max &&
      (!filters.inStock || getStock(p.id) > 0) &&
      (!q || (p.name + ' ' + catName(p.category) + ' ' + p.desc).toLowerCase().includes(q)));
    const s = filters.sort;
    if (s === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (s === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (s === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (s === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }
  const grad = p => `linear-gradient(135deg,${p.c[0]},${p.c[1]})`;
  const starsHtml = p => `<span class="stars" style="--r:${(p.rating / 5 * 100).toFixed(0)}%" role="img" aria-label="${p.rating} out of 5 stars">★★★★★</span>`;
  function tagHtml(p) {
    const s = getStock(p.id);
    if (s === 0) return '<span class="tag out">Out of stock</span>';
    if (s <= 5) return `<span class="tag low">Only ${s} left</span>`;
    if (p.was) return `<span class="tag sale">-${Math.round((1 - p.price / p.was) * 100)}%</span>`;
    return '';
  }
  const cardImgState = {};
  const getCardImgIdx = id => cardImgState[id] || 0;
  function setCardImgIdx(id, newIdx) {
    const p = byId(id);
    if (!p || !p.images || !p.images.length) return;
    const len = p.images.length;
    const nextIdx = (newIdx % len + len) % len;
    cardImgState[id] = nextIdx;
    const card = $(`.card[data-id="${id}"]`);
    if (card) {
      const imgs = card.querySelectorAll('.card-img-slider .p-img');
      imgs.forEach((img, idx) => {
        img.classList.toggle('active', idx === nextIdx);
      });
      const dots = card.querySelectorAll('.card-dot');
      dots.forEach((dot, idx) => {
        const isAct = idx === nextIdx;
        dot.classList.toggle('active', isAct);
        dot.setAttribute('aria-selected', isAct);
      });
    }
  }

  function cardHtml(p, i) {
    const s = getStock(p.id), inWish = wish.includes(p.id);
    const activeIdx = getCardImgIdx(p.id);
    const imgs = p.images && p.images.length ? p.images : [p.still || p.img];
    return `<article class="card" style="animation-delay:${i * 60}ms" data-id="${p.id}">
      <button class="wish" data-action="wish" aria-pressed="${inWish}" aria-label="${inWish ? 'Remove' : 'Add'} ${p.name} ${inWish ? 'from' : 'to'} wishlist">${inWish ? '♥' : '♡'}</button>
      <div class="card-media-wrap">
        <button class="p-media" data-action="view" style="background:${grad(p)}" aria-label="View details for ${p.name}">
          ${tagHtml(p)}
          <div class="card-img-slider">
            ${imgs.map((src, idx) => `
              <img class="p-img ${idx === activeIdx ? 'active' : ''}" 
                   src="${src}" 
                   data-idx="${idx}" 
                   data-emoji="${p.emoji}" 
                   alt="${p.name} view ${idx + 1}" 
                   width="512" height="512" 
                   loading="${i < 4 && idx === 0 ? 'eager' : 'lazy'}" 
                   decoding="async">
            `).join('')}
          </div>
        </button>
        ${imgs.length > 1 ? `
          <div class="card-nav-wrap">
            <button class="card-nav card-nav-prev" data-card-nav="prev" type="button" aria-label="Previous image of ${p.name}">‹</button>
            <button class="card-nav card-nav-next" data-card-nav="next" type="button" aria-label="Next image of ${p.name}">›</button>
          </div>
          <div class="card-dots" role="tablist" aria-label="Images for ${p.name}">
            ${imgs.map((_, idx) => `
              <button class="card-dot ${idx === activeIdx ? 'active' : ''}" 
                      data-card-dot="${idx}" 
                      type="button" 
                      role="tab" 
                      aria-selected="${idx === activeIdx}" 
                      aria-label="Image ${idx + 1} of ${imgs.length}">
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
      <div class="p-body">
        <p class="cat-label">${catName(p.category)}</p>
        <button class="p-name" data-action="view">${p.name}</button>
        <div class="rating">${starsHtml(p)} <span>${p.rating} (${p.reviews})</span></div>
        <p class="price-row">${money(p.price)} ${p.was ? `<s><span class="sr-only">was </span>${money(p.was)}</s>` : ''}</p>
        <div class="p-foot">
          <button class="btn btn-primary" data-action="add" ${s === 0 ? 'disabled' : ''} aria-label="${s === 0 ? p.name + ' is out of stock' : 'Add ' + p.name + ' to basket'}">${s === 0 ? 'Out of stock' : '🛒 Add to basket'}</button>
        </div>
      </div></article>`;
  }
  function renderProducts() {
    const list = visibleProducts();
    $('#grid').innerHTML = list.map(cardHtml).join('');
    $('#emptyState').hidden = list.length > 0;
    const catTxt = filters.cat === 'all' ? 'all categories' : catName(filters.cat);
    $('#resultInfo').textContent = `Showing ${list.length} of ${PRODUCTS.length} products in ${catTxt}` + (filters.q ? ` for “${filters.q}”` : '');
  }
  $('#grid').addEventListener('click', e => {
    const card = e.target.closest('.card'); if (!card) return;
    const id = Number(card.dataset.id);

    const navBtn = e.target.closest('[data-card-nav]');
    if (navBtn) {
      e.stopPropagation();
      e.preventDefault();
      const dir = navBtn.dataset.cardNav;
      const cur = getCardImgIdx(id);
      setCardImgIdx(id, dir === 'next' ? cur + 1 : cur - 1);
      return;
    }

    const dotBtn = e.target.closest('[data-card-dot]');
    if (dotBtn) {
      e.stopPropagation();
      e.preventDefault();
      setCardImgIdx(id, Number(dotBtn.dataset.cardDot));
      return;
    }

    const act = e.target.closest('[data-action]')?.dataset.action;
    if (act === 'add') addToCart(id, 1, card.querySelector('.p-img.active, .p-img, .p-emoji'));
    else if (act === 'wish') toggleWish(id);
    else if (act === 'view') openProduct(id, getCardImgIdx(id));
  });

  $('#grid').addEventListener('mouseover', e => {
    const dotBtn = e.target.closest('[data-card-dot]');
    if (dotBtn) {
      const card = dotBtn.closest('.card');
      if (card) setCardImgIdx(Number(card.dataset.id), Number(dotBtn.dataset.cardDot));
    }
  });

  let cardTouchX = 0, cardTouchY = 0;
  $('#grid').addEventListener('touchstart', e => {
    const wrap = e.target.closest('.card-media-wrap');
    if (!wrap) return;
    cardTouchX = e.touches[0].clientX;
    cardTouchY = e.touches[0].clientY;
  }, { passive: true });

  $('#grid').addEventListener('touchend', e => {
    const wrap = e.target.closest('.card-media-wrap');
    if (!wrap) return;
    const dx = e.changedTouches[0].clientX - cardTouchX;
    const dy = e.changedTouches[0].clientY - cardTouchY;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      const card = wrap.closest('.card');
      if (card) {
        const id = Number(card.dataset.id);
        const cur = getCardImgIdx(id);
        setCardImgIdx(id, dx < 0 ? cur + 1 : cur - 1);
      }
    }
  }, { passive: true });
  $('#sortSelect').onchange = e => { filters.sort = e.target.value; renderProducts(); };
  $('#priceRange').oninput = e => { filters.max = Number(e.target.value); $('#priceOut').textContent = money(filters.max); renderProducts(); };
  $('#stockOnly').onchange = e => { filters.inStock = e.target.checked; renderProducts(); };
  function clearFilters() {
    Object.assign(filters, { cat: 'all', q: '', sort: 'featured', max: 25000, inStock: false });
    $('#searchInput').value = ''; $('#sortSelect').value = 'featured'; $('#priceRange').value = 25000;
    $('#priceOut').textContent = money(25000); $('#stockOnly').checked = false;
    renderCategoryUI(); renderProducts(); announce('Filters cleared');
  }
  $('#clearFilters').onclick = clearFilters; $('#emptyClear').onclick = clearFilters;

  /* ---------- search with suggestions ---------- */
  const sInput = $('#searchInput'), sList = $('#suggestions');
  let sIdx = -1, sTimer;
  function showSuggestions() {
    const q = sInput.value.trim().toLowerCase();
    if (!q) { hideSuggestions(); return; }
    const m = PRODUCTS.filter(p => p.name.toLowerCase().includes(q)).slice(0, 5);
    if (!m.length) { sList.innerHTML = '<li role="option" aria-selected="false">No suggestions found</li>'; }
    else sList.innerHTML = m.map((p, i) => `<li role="option" id="sug${i}" data-id="${p.id}" aria-selected="false"><span aria-hidden="true">${p.emoji}</span> ${p.name}<small>${money(p.price)}</small></li>`).join('');
    sList.hidden = false; sInput.setAttribute('aria-expanded', 'true'); sIdx = -1;
  }
  function hideSuggestions() { sList.hidden = true; sInput.setAttribute('aria-expanded', 'false'); sInput.removeAttribute('aria-activedescendant'); sIdx = -1; }
  sInput.addEventListener('input', () => {
    clearTimeout(sTimer);
    sTimer = setTimeout(() => { filters.q = sInput.value; renderProducts(); showSuggestions(); }, 180);
  });
  sInput.addEventListener('keydown', e => {  
    const items = $$('li[data-id]', sList);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return; e.preventDefault();
      sIdx = (sIdx + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach((li, i) => li.setAttribute('aria-selected', i === sIdx));
      sInput.setAttribute('aria-activedescendant', items[sIdx].id);
    } else if (e.key === 'Enter' && sIdx > -1) { e.preventDefault(); openProduct(items[sIdx].dataset.id); hideSuggestions(); }
    else if (e.key === 'Escape') hideSuggestions();
  });
  sList.addEventListener('mousedown', e => { const li = e.target.closest('li[data-id]'); if (li) { e.preventDefault(); openProduct(li.dataset.id); hideSuggestions(); } });
  document.addEventListener('click', e => { if (!e.target.closest('#searchForm')) hideSuggestions(); });
  $('#searchForm').addEventListener('submit', e => { e.preventDefault(); filters.q = sInput.value; renderProducts(); hideSuggestions(); $('#products').scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth' }); });

  /* shortcut Ctrl+K / Cmd+K to focus search */
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      sInput.focus();
      sInput.select();
    }
  });

  /* promo code copy */
  const promoBtn = $('#promoCodeBtn');
  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('SAVE10').then(() => toast('Code SAVE10 copied to clipboard!'));
      } else {
        toast('Use coupon: SAVE10');
      }
    });
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    const i = wish.indexOf(id);
    if (i > -1) { wish.splice(i, 1); toast('Removed from wishlist'); } else { wish.push(id); toast('Saved to wishlist'); }
    save(); updateCounts(); renderProducts(); syncProductModalWish(); renderWishlist();
  }
  function renderWishlist() {
    const box = $('#wishItems');
    if (!wish.length) { box.innerHTML = '<div class="empty-cart"><div class="big" aria-hidden="true">💝</div><p>Your wishlist is empty. Tap the heart on any product to save it.</p></div>'; return; }
    box.innerHTML = wish.map(id => { const p = byId(id); const s = getStock(id); return `<div class="wish-line" data-id="${id}">
      <div class="thumb" style="background:${grad(p)}" aria-hidden="true">${thumbImg(p)}</div>
      <div class="grow"><strong>${p.name}</strong><br><span class="muted">${money(p.price)}</span></div>
      <button class="btn btn-primary btn-sm" data-w="add" ${s === 0 ? 'disabled' : ''}>${s === 0 ? 'Out of stock' : 'Add'}</button>
      <button class="btn btn-ghost btn-sm" data-w="rm" aria-label="Remove ${p.name} from wishlist">Remove</button></div>`; }).join('');
  }
  $('#wishItems').addEventListener('click', e => {
    const line = e.target.closest('.wish-line'); if (!line) return; const id = Number(line.dataset.id);
    if (e.target.dataset.w === 'add') addToCart(id, 1);
    if (e.target.dataset.w === 'rm') toggleWish(id);
  });
  $('#wishBtn').onclick = () => { renderWishlist(); openModal('wishOverlay'); };

  /* ---------- product quick view ---------- */
  let pmId = null, pmQty = 1, pmImgIdx = 0;

  function setModalImage(newIdx) {
    if (pmId == null) return;
    const p = byId(pmId);
    if (!p) return;
    const imgs = p.images && p.images.length ? p.images : [p.still || p.img];
    const len = imgs.length;
    pmImgIdx = (newIdx % len + len) % len;

    // Sync card image index too
    setCardImgIdx(p.id, pmImgIdx);

    const m = $('#pmMedia');
    const curImg = m.querySelector('.pm-img');
    const nextSrc = imgs[pmImgIdx];

    if (curImg) {
      curImg.style.opacity = '0';
      curImg.style.transform = 'scale(0.97)';
      setTimeout(() => {
        curImg.src = nextSrc;
        curImg.alt = `${p.name} - view ${pmImgIdx + 1}`;
        curImg.style.opacity = '1';
        curImg.style.transform = 'scale(1)';
      }, 140);
    } else {
      m.innerHTML = `<img class="pm-img" src="${nextSrc}" data-emoji="${p.emoji}" alt="${p.name} - view ${pmImgIdx + 1}" width="512" height="512" decoding="async">`;
    }

    const counter = $('#pmCounter');
    if (counter) counter.textContent = `${pmImgIdx + 1} / ${len}`;

    const thumbs = $$('.pm-thumb-btn', $('#pmThumbs'));
    thumbs.forEach((t, i) => {
      const isAct = i === pmImgIdx;
      t.classList.toggle('active', isAct);
      t.setAttribute('aria-selected', isAct);
    });
  }

  function renderModalGallery(p) {
    const imgs = p.images && p.images.length ? p.images : [p.still || p.img];
    pmImgIdx = Math.max(0, Math.min(pmImgIdx, imgs.length - 1));
    const m = $('#pmMedia');
    m.style.background = grad(p);
    m.innerHTML = `<img class="pm-img" src="${imgs[pmImgIdx]}" data-emoji="${p.emoji}" alt="${p.name} - view ${pmImgIdx + 1}" width="512" height="512" decoding="async">`;
    m.setAttribute('aria-label', `Photo of ${p.name}`);

    const counter = $('#pmCounter');
    if (counter) counter.textContent = `${pmImgIdx + 1} / ${imgs.length}`;

    const thumbsBox = $('#pmThumbs');
    if (imgs.length > 1) {
      thumbsBox.hidden = false;
      thumbsBox.innerHTML = imgs.map((src, i) => `
        <button type="button" 
                class="pm-thumb-btn ${i === pmImgIdx ? 'active' : ''}" 
                data-pm-thumb="${i}" 
                role="tab" 
                aria-selected="${i === pmImgIdx}" 
                aria-label="View photo ${i + 1} of ${p.name}">
          <img src="${src}" alt="" width="74" height="74" loading="lazy">
        </button>
      `).join('');
      $('#pmPrev').hidden = false;
      $('#pmNext').hidden = false;
      if (counter) counter.hidden = false;
    } else {
      thumbsBox.hidden = true;
      thumbsBox.innerHTML = '';
      $('#pmPrev').hidden = true;
      $('#pmNext').hidden = true;
      if (counter) counter.hidden = true;
    }
  }

  function openProduct(id, initialIdx = 0) {
    const p = byId(id); pmId = p.id; pmQty = 1;
    pmImgIdx = initialIdx || 0;
    renderModalGallery(p);
    $('#pmCat').textContent = catName(p.category);
    $('#pmName').textContent = p.name;
    $('#pmRating').innerHTML = `<div class="rating">${starsHtml(p)} <span>${p.rating} out of 5 · ${p.reviews} reviews</span></div>`;
    $('#pmPrice').innerHTML = `${money(p.price)} ${p.was ? `<s>${money(p.was)}</s><span class="save">Save ${money(p.was - p.price)}</span>` : ''}`;
    $('#pmDesc').textContent = p.desc;
    $('#pmFeat').innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
    refreshProductModal();
    openModal('productOverlay', '#pmAdd:not(:disabled), .modal-close');
  }

  function refreshProductModal() {
    if (pmId == null) return; const p = byId(pmId), s = getStock(p.id), inCart = cart[p.id] || 0, room = s - inCart;
    const st = $('#pmStock');
    if (s === 0) { st.className = 'stock-line out'; st.textContent = '✕ Out of stock'; }
    else if (s <= 5) { st.className = 'stock-line low'; st.textContent = `⚠ Only ${s} left in stock`; }
    else { st.className = 'stock-line ok'; st.textContent = `✓ In stock (${s} available)`; }
    pmQty = Math.max(1, Math.min(pmQty, Math.max(room, 1)));
    $('#pmQtyVal').textContent = pmQty;
    $('#pmMinus').disabled = pmQty <= 1; $('#pmPlus').disabled = pmQty >= room;
    $('#pmAdd').disabled = room < 1;
    $('#pmAdd').textContent = s === 0 ? 'Out of stock' : room < 1 ? 'Max quantity in basket' : `Add ${pmQty} to basket`;
    syncProductModalWish();
  }

  function syncProductModalWish() { if (pmId == null) return; const w = wish.includes(pmId); const b = $('#pmWish'); b.setAttribute('aria-pressed', w); b.textContent = w ? '♥ Saved' : '♡ Save'; }
  $('#pmMinus').onclick = () => { pmQty--; refreshProductModal(); };
  $('#pmPlus').onclick = () => { pmQty++; refreshProductModal(); };
  $('#pmAdd').onclick = () => { addToCart(pmId, pmQty, $('#pmMedia img, #pmMedia span')); refreshProductModal(); };
  $('#pmWish').onclick = () => toggleWish(pmId);

  $('#pmPrev').onclick = () => setModalImage(pmImgIdx - 1);
  $('#pmNext').onclick = () => setModalImage(pmImgIdx + 1);
  $('#pmThumbs').addEventListener('click', e => {
    const btn = e.target.closest('[data-pm-thumb]');
    if (btn) setModalImage(Number(btn.dataset.pmThumb));
  });

  let pmTouchX = 0, pmTouchY = 0;
  $('#pmMedia').addEventListener('touchstart', e => {
    pmTouchX = e.touches[0].clientX;
    pmTouchY = e.touches[0].clientY;
  }, { passive: true });
  $('#pmMedia').addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - pmTouchX;
    const dy = e.changedTouches[0].clientY - pmTouchY;
    if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
      setModalImage(dx < 0 ? pmImgIdx + 1 : pmImgIdx - 1);
    }
  }, { passive: true });

  document.addEventListener('keydown', e => {
    const ov = $('#productOverlay');
    if (!ov || ov.hidden || !ov.classList.contains('open')) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setModalImage(pmImgIdx - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setModalImage(pmImgIdx + 1);
    }
  });

  /* ---------- basket ---------- */
  function addToCart(id, qty = 1, srcEl) {
    if (!currentUser()) { requireLogin(() => { addToCart(id, qty); refreshProductModal(); }); return; }
    const p = byId(id), have = cart[id] || 0, s = getStock(id);
    if (s < 1) { toast(p.name + ' is out of stock', 'error'); return; }
    if (have + qty > s) { toast(`Only ${s} of ${p.name} available`, 'error'); return; }
    cart[id] = have + qty; save(); updateCounts(); renderCart();
    flyToCart(srcEl, p.emoji);
    toast(`${p.name} added to basket`); announce(`${p.name} added. Basket has ${cartCount()} items.`);
  }
  function setQty(id, q) {
    if (!currentUser()) { requireLogin(() => setQty(id, q), 'Please sign in to change your basket.'); return; }
    if (q < 1) return removeFromCart(id);
    if (q > getStock(id)) { toast(`Only ${getStock(id)} available`, 'error'); return; }
    cart[id] = q; save(); updateCounts(); renderCart();
  }
  function removeFromCart(id) {
    const line = $(`.line[data-id="${id}"]`); const p = byId(id);
    const done = () => { delete cart[id]; save(); updateCounts(); renderCart(); refreshProductModal(); toast(`${p.name} removed`); announce(`${p.name} removed from basket`); };
    if (line && !motionOff()) { line.classList.add('removing'); setTimeout(done, 280); } else done();
  }
  const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
  function totals() {
    const sub = Object.entries(cart).reduce((t, [id, q]) => t + byId(id).price * q, 0);
    const disc = promo ? Math.round(sub * PROMOS[promo].pct / 100) : 0;
    const after = sub - disc;
    const ship = sub === 0 ? 0 : (after >= FREE_SHIP ? 0 : SHIP_FEE);
    return { sub, disc, ship, total: after + ship, after };
  }
  function flyToCart(src, emoji) {
    if (!src || motionOff()) return;
    const a = src.getBoundingClientRect(), b = $('#cartBtn').getBoundingClientRect();
    const el = document.createElement('div'); el.className = 'fly'; el.textContent = emoji;
    const sx = a.left + a.width / 2, sy = a.top + a.height / 2;
    el.style.left = sx + 'px'; el.style.top = sy + 'px'; document.body.appendChild(el);
    const dx = b.left + b.width / 2 - sx, dy = b.top + b.height / 2 - sy;
    const anim = el.animate([
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
      { transform: `translate(calc(-50% + ${dx * .5}px),calc(-50% + ${dy * .5 - 80}px)) scale(1.3)`, opacity: 1, offset: .5 },
      { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.3)`, opacity: .3 }
    ], { duration: 750, easing: 'ease-in-out' });
    anim.onfinish = () => el.remove();
  }
  function updateCounts() {
    const n = cartCount(), cb = $('#cartCount'), wc = $('#wishCount');
    cb.textContent = n; cb.dataset.zero = n === 0; cb.classList.remove('bump'); void cb.offsetWidth; if (n) cb.classList.add('bump');
    wc.textContent = wish.length; wc.dataset.zero = wish.length === 0;
    $('#cartBtn').setAttribute('aria-label', `Open basket, ${n} item${n === 1 ? '' : 's'}`);
    $('#wishBtn').setAttribute('aria-label', `Wishlist, ${wish.length} saved`);
  }
  function renderCart() {
    const ids = Object.keys(cart), box = $('#cartItems'), t = totals();
    $('#cartFoot').hidden = ids.length === 0; $('#shipProgress').hidden = ids.length === 0;
    if (!ids.length) {
      box.innerHTML = currentUser()
        ? '<div class="empty-cart"><div class="big" aria-hidden="true">🛒</div><h3>Your basket is empty</h3><p class="muted">Add something you love and it will show up here.</p><button class="btn btn-primary" data-close>Start shopping</button></div>'
        : '<div class="empty-cart"><div class="big" aria-hidden="true">🔒</div><h3>Sign in to start your basket</h3><p class="muted">Create a free account or sign in to add items to your basket.</p><button class="btn btn-primary" data-signin>Sign in or create account</button></div>';
      return;
    }
    box.innerHTML = ids.map(id => { const p = byId(id), q = cart[id]; return `<div class="line" data-id="${id}">
      <div class="thumb" style="background:${grad(p)}" aria-hidden="true">${thumbImg(p)}</div>
      <div><h3>${p.name}</h3><div class="unit">${money(p.price)} each</div>
        <div class="line-actions">
          <div class="qty" role="group" aria-label="Quantity for ${p.name}">
            <button data-q="-" aria-label="Decrease quantity of ${p.name}">−</button><output aria-live="polite">${q}</output>
            <button data-q="+" aria-label="Increase quantity of ${p.name}" ${q >= getStock(id) ? 'disabled' : ''}>+</button></div>
          <button class="remove" data-rm aria-label="Remove ${p.name} from basket">Remove</button>
        </div></div>
      <div class="sum">${money(p.price * q)}</div></div>`; }).join('');
    const left = Math.max(0, FREE_SHIP - t.after), pct = Math.min(100, t.after / FREE_SHIP * 100);
    $('#shipProgress').innerHTML = left > 0 ? `🚚 Add <strong>${money(left)}</strong> more for free delivery<div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"><i style="width:${pct}%"></i></div>` : `🎉 You've unlocked <strong>free delivery</strong>!<div class="bar"><i style="width:100%"></i></div>`;
    $('#cartTotals').innerHTML = `<div><dt>Subtotal</dt><dd>${money(t.sub)}</dd></div>` +
      (promo ? `<div class="disc"><dt>Promo ${promo} (${PROMOS[promo].label})</dt><dd>−${money(t.disc)}</dd></div>` : '') +
      `<div><dt>Delivery</dt><dd>${t.ship ? money(t.ship) : 'Free'}</dd></div><div class="grand"><dt>Total</dt><dd>${money(t.total)}</dd></div>`;
    const pm = $('#promoMsg'); if (promo) { pm.textContent = `Code ${promo} applied.`; pm.className = 'promo-msg ok'; }
  }
  $('#cartItems').addEventListener('click', e => {
    const line = e.target.closest('.line'); if (!line) return; const id = line.dataset.id;
    if (e.target.dataset.q === '+') setQty(id, cart[id] + 1);
    if (e.target.dataset.q === '-') setQty(id, cart[id] - 1);
    if (e.target.hasAttribute('data-rm')) removeFromCart(id);
  });
  $('#promoForm').addEventListener('submit', e => {
    e.preventDefault(); const code = $('#promoInput').value.trim().toUpperCase(), pm = $('#promoMsg');
    if (!code) { pm.textContent = 'Enter a promo code first.'; pm.className = 'promo-msg bad'; return; }
    if (PROMOS[code]) { promo = code; save(); pm.textContent = `Code ${code} applied: ${PROMOS[code].label}.`; pm.className = 'promo-msg ok'; renderCart(); toast('Promo applied!'); }
    else { pm.textContent = 'Sorry, that code is not valid. Try SAVE10.'; pm.className = 'promo-msg bad'; }
  });
  $('#clearCartBtn').onclick = () => { if (confirm('Remove all items from your basket?')) { cart = {}; promo = null; $('#promoInput').value = ''; $('#promoMsg').textContent = ''; save(); updateCounts(); renderCart(); refreshProductModal(); announce('Basket emptied'); } };
  $('#cartBtn').onclick = () => { renderCart(); openModal('cartOverlay'); };
  $('#checkoutBtn').onclick = () => {
    if (!cartCount()) return;
    closeModal('cartOverlay');
    setTimeout(() => {
      if (currentUser()) startCheckout();
      else openAuth('login', { reason: 'Please sign in to check out.', next: startCheckout });
    }, 320);
  };

  /* ---------- checkout ---------- */
  const validators = {
    fullName: v => v.trim().length >= 3 || 'Enter your full name (at least 3 characters).',
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a valid email, for example name@example.com.',
    phone: v => /^\+?[\d\s-]{9,15}$/.test(v.trim()) || 'Enter a valid phone number with 9 to 15 digits.',
    address: v => v.trim().length >= 6 || 'Enter your street address.',
    city: v => v.trim().length >= 2 || 'Enter your city.',
    postal: v => /^\d{4,6}$/.test(v.trim()) || 'Enter a 4 to 6 digit postal code.',
    cardName: v => v.trim().length >= 3 || 'Enter the name shown on your card.',
    cardNumber: v => { const d = v.replace(/\s/g, ''); return (/^\d{13,19}$/.test(d) && luhn(d)) || 'Enter a valid card number (try 4242 4242 4242 4242).'; },
    expiry: v => {
      const m = v.match(/^(\d{2})\/(\d{2})$/); if (!m) return 'Enter expiry as MM/YY.';
      const mo = +m[1], yr = 2000 + +m[2], now = new Date();
      if (mo < 1 || mo > 12) return 'Month must be between 01 and 12.';
      if (yr < now.getFullYear() || (yr === now.getFullYear() && mo < now.getMonth() + 1)) return 'This card has expired.';
      return true;
    },
    cvv: v => /^\d{3,4}$/.test(v.trim()) || 'Enter the 3 or 4 digit security code.'
  };
  function luhn(num) { let s = 0, alt = false; for (let i = num.length - 1; i >= 0; i--) { let n = +num[i]; if (alt) { n *= 2; if (n > 9) n -= 9; } s += n; alt = !alt; } return s % 10 === 0; }
  const pendingBlur = {};
  const deferCheck = id => { clearTimeout(pendingBlur[id]); pendingBlur[id] = setTimeout(() => check(id), 200); };
  function check(id) {
    const el = $('#' + id), res = validators[id](el.value), err = $('#err-' + id);
    if (res === true) { err.textContent = ''; el.removeAttribute('aria-invalid'); return true; }
    err.textContent = res; el.setAttribute('aria-invalid', 'true'); return false;
  }
  function checkAll(ids) {
    ids.forEach(id => clearTimeout(pendingBlur[id]));
    let firstBad = null;
    ids.forEach(id => { if (!check(id) && !firstBad) firstBad = id; });
    if (firstBad) { $('#' + firstBad).focus(); announce('Please fix the highlighted fields.'); }
    return !firstBad;
  }
  Object.keys(validators).forEach(id => { const el = $('#' + id); el.addEventListener('blur', () => { if (el.value) deferCheck(id); }); el.addEventListener('input', () => { if (el.getAttribute('aria-invalid')) check(id); }); });
  $('#cardNumber').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim(); });
  $('#expiry').addEventListener('input', e => { let v = e.target.value.replace(/\D/g, '').slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2); e.target.value = v; });
  $('#cvv').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
  $$('input[name=pay]').forEach(r => r.addEventListener('change', () => { $('#cardFields').hidden = r.value === 'cod' && r.checked; }));

  const delivery = {}; let step = 1;
  function showStep(n) {
    step = n;
    ['step1', 'step2', 'step3', 'step4'].forEach((id, i) => $('#' + id).hidden = i + 1 !== n);
    $$('#steps li').forEach((li, i) => { li.classList.toggle('current', i + 1 === n); li.classList.toggle('done', i + 1 < n || n === 4); if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current'); });
    $('#steps').hidden = false;
    $('#coSummary').hidden = n === 4;
    const h = $('#step' + n + ' h3'); h && h.focus();
    if (n === 3) renderReview();
  }
  function renderSummary() {
    const t = totals();
    $('#coSummary').innerHTML = '<h3>Order summary</h3>' + Object.keys(cart).map(id => `<div class="mini"><span>${byId(id).emoji} ${byId(id).name} × ${cart[id]}</span><strong>${money(byId(id).price * cart[id])}</strong></div>`).join('') +
      `<hr><div class="mini"><span>Subtotal</span><span>${money(t.sub)}</span></div>` + (promo ? `<div class="mini"><span>Promo ${promo}</span><span>−${money(t.disc)}</span></div>` : '') +
      `<div class="mini"><span>Delivery</span><span>${t.ship ? money(t.ship) : 'Free'}</span></div><div class="mini"><strong>Total</strong><strong>${money(t.total)}</strong></div>`;
  }
  function startCheckout() {
    if (!cartCount()) return;
    renderSummary(); showStep(1); prefillCheckout(); openModal('checkoutOverlay', '#fullName');
  }
  const payMethod = () => $('input[name=pay]:checked').value;
  function renderReview() {
    const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const d = i => esc($('#' + i).value.trim());
    const card = $('#cardNumber').value.replace(/\s/g, '');
    $('#reviewBox').innerHTML = `<section><h4>Deliver to</h4><p>${d('fullName')}<br>${d('address')}, ${d('city')} ${d('postal')}<br>${d('email')} · ${d('phone')}</p></section>
      <section><h4>Payment</h4><p>${payMethod() === 'card' ? '💳 Card ending in ' + card.slice(-4) : '💵 Cash on delivery'}</p></section>
      <section><h4>Items (${cartCount()})</h4><p>${Object.keys(cart).map(id => `${byId(id).name} × ${cart[id]}`).join('<br>')}</p></section>`;
  }
  $('#step1').addEventListener('submit', e => { e.preventDefault(); if (checkAll(['fullName', 'email', 'phone', 'address', 'city', 'postal'])) showStep(2); });
  $('#step2').addEventListener('submit', e => {
    e.preventDefault();
    if (payMethod() === 'cod' || checkAll(['cardName', 'cardNumber', 'expiry', 'cvv'])) showStep(3);
  });
  $('#back1').onclick = () => showStep(1);
  $('#back2').onclick = () => showStep(2);
  $('#step3').addEventListener('submit', e => {
    e.preventDefault();
    const terms = $('#terms'), err = $('#err-terms');
    if (!terms.checked) { err.textContent = 'Please accept the terms to place your order.'; terms.setAttribute('aria-invalid', 'true'); terms.focus(); return; }
    err.textContent = ''; terms.removeAttribute('aria-invalid');
    const btn = $('#placeBtn'); btn.disabled = true; btn.textContent = '⏳ Processing payment…'; announce('Processing payment');
    setTimeout(() => {
      for (const id of Object.keys(cart)) {
        if (cart[id] > getStock(id)) { toast(`${byId(id).name} no longer has enough stock. Please update your basket.`, 'error'); btn.disabled = false; btn.textContent = 'Place order'; closeModal('checkoutOverlay'); cart[id] = Math.max(0, getStock(id)); if (!cart[id]) delete cart[id]; save(); updateCounts(); renderCart(); return; }
      }
      const t = totals();
      const order = { id: 'SW-' + Date.now().toString(36).toUpperCase(), date: new Date().toISOString(), items: Object.keys(cart).map(id => ({ id: +id, name: byId(id).name, qty: cart[id], price: byId(id).price })), total: t.total, promo, uid: session ? session.uid : null, pay: payMethod(), name: $('#fullName').value.trim(), email: $('#email').value.trim(), city: $('#city').value.trim(), address: $('#address').value.trim(), phone: $('#phone').value.trim() };
      Object.keys(cart).forEach(id => stock[id] = getStock(id) - cart[id]);
      orders.unshift(order); cart = {}; promo = null; save(); updateCounts(); renderCart(); renderProducts();
      if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
        window.ShopWaveFirebase.createOrder(order)
          .then(() => toast('Order saved to Cloud Firestore!'))
          .catch(err => console.warn('Could not save order to Firestore:', err));
      }
      $('#orderNo').textContent = order.id;
      $('#orderMsg').textContent = `A confirmation was sent to ${$('#email').value.trim()}. Total paid: ${money(order.total)}.`;
      btn.disabled = false; btn.textContent = 'Place order'; $('#terms').checked = false;
      $('#step1').reset(); $('#step2').reset(); $('#cardFields').hidden = false;
      showStep(4); confetti(); announce('Order placed successfully. Order number ' + order.id);
    }, 1800);
  });
  $('#keepShopping').onclick = () => closeModal('checkoutOverlay');
  $('#viewOrders').onclick = () => { closeModal('checkoutOverlay'); setTimeout(showOrders, 320); };
  function confetti() {
    if (motionOff()) return;
    const colors = ['#f97316', '#4f46e5', '#22c55e', '#eab308', '#ec4899', '#06b6d4'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('i'); c.className = 'confetti';
      c.style.cssText = `left:${Math.random() * 100}vw;background:${colors[i % colors.length]};animation-duration:${2 + Math.random() * 2.2}s;animation-delay:${Math.random() * .6}s;transform:rotate(${Math.random() * 360}deg)`;
      document.body.appendChild(c); setTimeout(() => c.remove(), 5000);
    }
  }

  /* ---------- orders ---------- */
  async function showOrders() {
    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady() && session) {
      try {
        const remoteOrders = await window.ShopWaveFirebase.getUserOrders(session.uid);
        if (remoteOrders && remoteOrders.length) {
          orders = remoteOrders;
          store.set(ukey('orders'), orders);
        }
      } catch (err) {
        console.warn('Could not fetch Firestore orders:', err);
      }
    }
    const box = $('#ordersList');
    box.innerHTML = !orders.length ? '<div class="empty-cart"><div class="big" aria-hidden="true">📦</div><p>You have not placed any orders yet.</p></div>' :
      orders.map(o => `<article class="orders-card"><header><span>${o.id || o.orderId}</span><span>${money(o.total)}</span></header>
        <p class="muted small">${new Date(o.date).toLocaleString()} · ${o.pay === 'card' ? 'Card' : 'Cash on delivery'}${o.promo ? ' · Code ' + o.promo : ''}${o.status ? ' · <span class="badge">' + o.status + '</span>' : ''}</p>
        <ul>${(o.items || []).map(i => `<li>${i.name} × ${i.qty}</li>`).join('')}</ul></article>`).join('');
    $('#ordersHint').hidden = !!session;
    openModal('ordersOverlay');
  }
  $('#ordersBtn').onclick = showOrders;
  if ($('#footOrders')) $('#footOrders').onclick = showOrders;
  if ($('#footWish')) $('#footWish').onclick = () => { renderWishlist(); openModal('wishOverlay'); };
  if ($('#footCart')) $('#footCart').onclick = () => { renderCart(); openModal('cartOverlay'); };

  /* ---------- hero carousel ---------- */
  const slides = $$('.slide'); let cur = 0, paused = false, timer;
  $('#dots').innerHTML = slides.map((_, i) => `<button class="dot-btn" aria-label="Go to slide ${i + 1}" aria-current="${i === 0}"></button>`).join('');
  function goSlide(n) {
    cur = (n + slides.length) % slides.length;
    slides.forEach((s, i) => { s.classList.toggle('active', i === cur); s.inert = i !== cur; });
    $$('.dot-btn').forEach((d, i) => d.setAttribute('aria-current', i === cur));
  }
  function startAuto() { clearInterval(timer); if (!paused && !motionOff()) timer = setInterval(() => goSlide(cur + 1), 6000); }
  $('#prevSlide').onclick = () => { goSlide(cur - 1); startAuto(); };
  $('#nextSlide').onclick = () => { goSlide(cur + 1); startAuto(); };
  $('#dots').onclick = e => { const i = $$('.dot-btn').indexOf(e.target); if (i > -1) { goSlide(i); startAuto(); } };
  $('#pauseSlide').onclick = e => { paused = !paused; e.currentTarget.setAttribute('aria-pressed', paused); e.currentTarget.textContent = paused ? '▶' : '⏸'; e.currentTarget.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow'); syncHeroVideo(); startAuto(); };
  $('#hero').addEventListener('mouseenter', () => clearInterval(timer));
  $('#hero').addEventListener('mouseleave', startAuto);
  $('#hero').addEventListener('focusin', () => clearInterval(timer));
  $('#hero').addEventListener('focusout', startAuto);

  /* ---------- newsletter ---------- */
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault(); const v = $('#newsEmail').value.trim(), err = $('#newsErr');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { err.textContent = 'Please enter a valid email address.'; $('#newsEmail').setAttribute('aria-invalid', 'true'); $('#newsEmail').focus(); return; }
    err.textContent = ''; $('#newsEmail').removeAttribute('aria-invalid');
    const list = store.get(KEYS.news, []); if (!list.includes(v)) list.push(v); store.set(KEYS.news, list);
    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
      window.ShopWaveFirebase.saveNewsletter(v).catch(err => console.warn('Could not sync newsletter to Firestore:', err));
    }
    $('#newsEmail').value = ''; toast('Subscribed! Check your inbox for WELCOME5.');
  });

  /* ---------- page effects ---------- */
  const header = $('.site-header'), toTop = $('#toTop');
  addEventListener('scroll', () => { header.classList.toggle('scrolled', scrollY > 10); toTop.hidden = scrollY < 600; }, { passive: true });
  toTop.onclick = () => scrollTo({ top: 0, behavior: motionOff() ? 'auto' : 'smooth' });
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { threshold: .12 }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));
  /* ---------- user accounts (front-end demo: everything is kept in this browser's localStorage) ---------- */
  const enc = new TextEncoder();
  const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
  const fromHex = hx => Uint8Array.from(hx.match(/.{2}/g).map(x => parseInt(x, 16)));
  const hasCrypto = !!(window.crypto && crypto.subtle);
  const randHex = n => { const a = new Uint8Array(n); if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(a); else a.forEach((_, i) => a[i] = Math.floor(Math.random() * 256)); return toHex(a); };
  /* passwords are never stored: only a salted PBKDF2 hash (a simple fallback hash is used where the browser has no Web Crypto) */
  async function hashPw(pw, salt, alg) {
    alg = alg || (hasCrypto ? 'p1' : 'w1');
    if (alg === 'p1' && hasCrypto) {
      const key = await crypto.subtle.importKey('raw', enc.encode(pw), 'PBKDF2', false, ['deriveBits']);
      const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: fromHex(salt), iterations: 100000, hash: 'SHA-256' }, key, 256);
      return 'p1:' + toHex(bits);
    }
    let hv = 5381; const s = salt + pw;
    for (let i = 0; i < s.length; i++) hv = ((hv << 5) + hv) ^ s.charCodeAt(i);
    return 'w1:' + (hv >>> 0).toString(16);
  }
  const getUsers = () => store.get(KEYS.users, []);
  const setUsers = u => store.set(KEYS.users, u);
  const findUser = email => getUsers().find(u => u.email === String(email).trim().toLowerCase());
  const currentUser = () => session ? (getUsers().find(u => u.id === session.uid) || null) : null;
  const firstName = u => u.name.trim().split(/\s+/)[0];

  /* ---- validation rules (they plug into the same checker the checkout uses) ---- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const pwRule = v => (v.length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) || 'Use at least 8 characters, including a letter and a number.';
  Object.assign(validators, {
    loginEmail: v => EMAIL_RE.test(v.trim()) || 'Enter the email you registered with.',
    loginPassword: v => v.length > 0 || 'Enter your password.',
    regName: validators.fullName,
    regEmail: v => !EMAIL_RE.test(v.trim()) ? 'Enter a valid email, for example name@example.com.' : (findUser(v) ? 'An account with this email already exists. Try signing in instead.' : true),
    regPassword: pwRule,
    regConfirm: v => v === $('#regPassword').value || 'The passwords do not match.',
    resetEmail: v => EMAIL_RE.test(v.trim()) || 'Enter the email for your account.',
    resetPassword: pwRule,
    resetConfirm: v => v === $('#resetPassword').value || 'The passwords do not match.',
    accName: validators.fullName,
    accPhone: v => !v.trim() || validators.phone(v),
    accAddress: v => !v.trim() || validators.address(v),
    accCity: v => !v.trim() || validators.city(v),
    accPostal: v => !v.trim() || validators.postal(v),
    curPass: v => v.length > 0 || 'Enter your current password.',
    newPass: pwRule,
    newPass2: v => v === $('#newPass').value || 'The passwords do not match.'
  });
  Object.keys(validators).filter(id => /^(login|reg|reset|acc|curPass|newPass)/.test(id)).forEach(id => {
    const el = $('#' + id);
    el.addEventListener('blur', () => { if (el.value) deferCheck(id); });
    el.addEventListener('input', () => { if (el.getAttribute('aria-invalid')) check(id); });
  });
  function strength(pw) {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++; if (pw.length >= 12) s++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++; if (/[^A-Za-z0-9]/.test(pw)) s++;
    return Math.min(4, Math.max(1, pw.length < 8 ? Math.min(s, 1) : s - 1));
  }
  function updateStrength(pw) {
    const lv = strength(pw), names = ['', 'Weak', 'Fair', 'Good', 'Strong'], bar = $('#pwBar');
    bar.style.width = lv * 25 + '%'; bar.dataset.lv = lv;
    $('#pwStrength').textContent = lv ? 'Password strength: ' + names[lv] : 'Use 8+ characters with a letter and a number.';
  }
  $('#regPassword').addEventListener('input', e => { updateStrength(e.target.value); if ($('#regConfirm').getAttribute('aria-invalid')) check('regConfirm'); });
  $('#newPass').addEventListener('input', () => { if ($('#newPass2').getAttribute('aria-invalid')) check('newPass2'); });
  $('#resetPassword').addEventListener('input', () => { if ($('#resetConfirm').getAttribute('aria-invalid')) check('resetConfirm'); });
  function shakeModal(id) {
    const m = $('#' + id + ' .modal') || $('#' + id);
    if (!m) return;
    m.classList.remove('shake');
    void m.offsetWidth;
    m.classList.add('shake');
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('.pw-toggle'); if (!b) return;
    const inp = $('#' + b.dataset.pw), show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    b.setAttribute('aria-pressed', show);
    b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    const eye = b.querySelector('.eye-icon');
    if (eye) {
      eye.innerHTML = show
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
      const txt = b.querySelector('.pw-toggle-text');
      if (txt) txt.textContent = show ? 'Hide' : 'Show';
    } else {
      b.textContent = show ? 'Hide' : 'Show';
    }
  });

  /* ---- the sign in / create account dialog ---- */
  let afterAuth = null;
  const PANELS = {
    login: ['loginForm', 'tabLogin', 'Welcome back', 'Sign in to see your basket, wishlist and saved details.'],
    register: ['registerForm', 'tabRegister', 'Create your account', 'It takes under a minute. No payment details needed.'],
    reset: ['resetForm', null, 'Reset your password', 'Demo only: a real store would email you a reset link.']
  };
  function showAuthPanel(name) {
    Object.entries(PANELS).forEach(([k, [form, tab]]) => {
      $('#' + form).hidden = k !== name;
      if (tab) { const t = $('#' + tab); t.setAttribute('aria-selected', k === name); t.tabIndex = k === name ? 0 : -1; }
    });
    $('.tabs', $('#authOverlay')).hidden = name === 'reset';
    const banner = $('#demoBanner'); if (banner) banner.hidden = name !== 'login';
    $('#authTitle').textContent = PANELS[name][2]; $('#authSub').textContent = PANELS[name][3];
    $$('#authOverlay .error, #authOverlay .form-error').forEach(p => p.textContent = '');
    $$('#authOverlay input[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
    const modal = $('#authOverlay .modal');
    if (modal) modal.scrollTop = 0;
  }
  function openAuth(tab, opts) {
    opts = opts || {};
    afterAuth = opts.next || null;
    $('#authReason').hidden = !opts.reason; $('#authReason').textContent = opts.reason || '';
    showAuthPanel(tab || 'login');
    openModal('authOverlay', tab === 'register' ? '#regName' : '#loginEmail');
  }
  /* shoppers must be signed in to use the basket; the action they attempted is finished automatically after sign in */
  function requireLogin(next, reason) {
    openAuth('login', { reason: reason || 'Please sign in to add items to your basket. It only takes a moment.', next });
  }
  $('#cartItems').addEventListener('click', e => {
    if (!e.target.closest('[data-signin]')) return;
    closeModal('cartOverlay');
    setTimeout(() => openAuth('login', { reason: 'Please sign in to use your basket.' }), 320);
  });
  function finishAuth() {
    closeModal('authOverlay');
    const fn = afterAuth; afterAuth = null;
    if (fn) setTimeout(fn, 350);
  }
  $('#tabLogin').onclick = () => showAuthPanel('login');
  $('#tabRegister').onclick = () => showAuthPanel('register');
  $('.tabs').addEventListener('keydown', e => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const next = $('#tabLogin').getAttribute('aria-selected') === 'true' ? 'register' : 'login';
    showAuthPanel(next); $(next === 'login' ? '#tabLogin' : '#tabRegister').focus();
  });
  $('#forgotBtn').onclick = () => { const em = $('#loginEmail').value; showAuthPanel('reset'); $('#resetEmail').value = em; $('#resetEmail').focus(); };
  $('#backToLogin').onclick = () => { showAuthPanel('login'); $('#loginEmail').focus(); };
  function fillDemoCredentials() {
    $('#loginEmail').value = 'demo@shopwave.lk';
    $('#loginPassword').value = 'Demo@1234';
    $$('#loginForm [aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
    $$('#loginForm .error').forEach(p => p.textContent = '');
    toast('Demo account loaded: click Sign in to proceed!');
    $('#loginSubmit').focus();
  }
  const demoFillBtn = $('#demoFill');
  if (demoFillBtn) demoFillBtn.onclick = fillDemoCredentials;
  const gBtn = $('#socialGoogle'), aBtn = $('#socialApple');
  if (gBtn) {
    gBtn.onclick = async () => {
      if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
        try {
          toast('Connecting with Google…');
          const fbUser = await window.ShopWaveFirebase.signInWithGoogle();
          const profile = await window.ShopWaveFirebase.getUserProfile(fbUser.uid);
          const u = {
            id: fbUser.uid,
            name: (profile && profile.name) || fbUser.displayName || 'Google User',
            email: (fbUser.email || '').toLowerCase(),
            phone: (profile && profile.phone) || '',
            address: (profile && profile.address) || '',
            city: (profile && profile.city) || '',
            postal: (profile && profile.postal) || '',
            created: new Date().toISOString()
          };
          const users = getUsers();
          const existingIdx = users.findIndex(x => x.id === u.id);
          if (existingIdx > -1) users[existingIdx] = u; else users.push(u);
          setUsers(users);

          const remoteOrders = await window.ShopWaveFirebase.getUserOrders(u.id);
          if (remoteOrders && remoteOrders.length) {
            orders = remoteOrders;
            store.set(KEYS.orders + '_' + u.id, orders);
          }
          if (profile && Array.isArray(profile.wishlist) && profile.wishlist.length) {
            profile.wishlist.forEach(id => { if (byId(id) && !wish.includes(id)) wish.push(id); });
            store.set(KEYS.wish + '_' + u.id, wish);
          }

          signIn(u, true, 'Signed in with Google as ' + u.name + '!');
        } catch (err) {
          console.error(err);
          toast(err.message || 'Google sign-in was cancelled or failed.', 'error');
        }
      } else {
        fillDemoCredentials();
        toast('Google account demo loaded! (Configure firebase-config.js for live Google sign-in)');
      }
    };
  }
  if (aBtn) aBtn.onclick = () => { fillDemoCredentials(); toast('Apple ID connected: demo credentials ready!'); };
  $('#ordersSignIn').onclick = () => { closeModal('ordersOverlay'); setTimeout(() => openAuth('login'), 320); };

  /* ---- sign in / out and merging the guest basket ---- */
  function mergeGuestData() {
    const gCart = store.get(KEYS.cart, {}), gWish = store.get(KEYS.wish, []), gPromo = store.get(KEYS.promo, null);
    let moved = 0;
    Object.keys(gCart).forEach(id => {
      if (!byId(id)) return;
      const add = Math.min(gCart[id], Math.max(getStock(id) - (cart[id] || 0), 0));
      if (add > 0) { cart[id] = (cart[id] || 0) + add; moved += add; }
    });
    gWish.forEach(id => { if (byId(id) && !wish.includes(id)) wish.push(id); });
    if (!promo && gPromo) promo = gPromo;
    ['cart', 'wish', 'promo'].forEach(n => { try { localStorage.removeItem(KEYS[n]); } catch (e) { /* ignore */ } });
    return moved;
  }
  function refreshAll() { updateCounts(); renderCart(); renderProducts(); renderWishlist(); renderAuthUI(); refreshProductModal(); }
  function signIn(u, remember, msg) {
    session = { uid: u.id, remember: !!remember };
    try { localStorage.removeItem(KEYS.session); sessionStorage.removeItem(KEYS.session); (remember ? localStorage : sessionStorage).setItem(KEYS.session, JSON.stringify(session)); } catch (e) { /* session lasts until the page closes */ }
    loadScope();
    const moved = mergeGuestData();
    save(); refreshAll();
    toast(msg + (moved ? ' Your basket items were added to your account.' : ''));
    announce(msg);
    finishAuth();
  }
  function endSession() {
    session = null;
    try { localStorage.removeItem(KEYS.session); sessionStorage.removeItem(KEYS.session); } catch (e) { /* ignore */ }
    loadScope(); refreshAll();
  }
  function signOut() { save(); endSession(); toast('You have signed out. See you soon!'); announce('Signed out'); }
  function deleteAccount() {
    const u = currentUser(); if (!u) return;
    ['cart', 'wish', 'orders', 'promo'].forEach(n => { try { localStorage.removeItem(KEYS[n] + '_' + u.id); } catch (e) { /* ignore */ } });
    setUsers(getUsers().filter(x => x.id !== u.id));
    endSession(); closeModal('accountOverlay'); toast('Your account has been deleted.'); announce('Account deleted');
  }

  /* ---- login with a short lock after repeated wrong passwords ---- */
  const LOCK_AFTER = 5, LOCK_MS = 30000;
  const getLock = email => (store.get(KEYS.lock, {})[email]) || { n: 0, until: 0 };
  const setLock = (email, l) => { const all = store.get(KEYS.lock, {}); if (l) all[email] = l; else delete all[email]; store.set(KEYS.lock, all); };
  let lockTimer;
  function lockCountdown(btn, until) {
    clearInterval(lockTimer);
    const tick = () => {
      const s = Math.ceil((until - Date.now()) / 1000);
      if (s <= 0) { clearInterval(lockTimer); btn.disabled = false; btn.textContent = 'Sign in'; $('#loginErr').textContent = ''; return; }
      btn.disabled = true; btn.textContent = 'Try again in ' + s + 's';
    };
    tick(); lockTimer = setInterval(tick, 500);
  }
  $('#loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const err = $('#loginErr'), btn = $('#loginSubmit'); err.textContent = '';
    if (!checkAll(['loginEmail', 'loginPassword'])) { shakeModal('authOverlay'); return; }
    const email = $('#loginEmail').value.trim().toLowerCase(), pw = $('#loginPassword').value, remember = $('#remember').checked;

    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
      btn.disabled = true; btn.textContent = 'Signing in…';
      try {
        const fbUser = await window.ShopWaveFirebase.signIn(email, pw);
        const profile = await window.ShopWaveFirebase.getUserProfile(fbUser.uid);
        const u = {
          id: fbUser.uid,
          name: (profile && profile.name) || fbUser.displayName || email.split('@')[0],
          email: email,
          phone: (profile && profile.phone) || '',
          address: (profile && profile.address) || '',
          city: (profile && profile.city) || '',
          postal: (profile && profile.postal) || '',
          created: (profile && profile.createdAt && profile.createdAt.toDate ? profile.createdAt.toDate().toISOString() : new Date().toISOString())
        };
        const users = getUsers();
        const existingIdx = users.findIndex(x => x.id === u.id);
        if (existingIdx > -1) users[existingIdx] = u; else users.push(u);
        setUsers(users);

        const remoteOrders = await window.ShopWaveFirebase.getUserOrders(u.id);
        if (remoteOrders && remoteOrders.length) {
          orders = remoteOrders;
          store.set(KEYS.orders + '_' + u.id, orders);
        }
        if (profile && Array.isArray(profile.wishlist) && profile.wishlist.length) {
          profile.wishlist.forEach(id => { if (byId(id) && !wish.includes(id)) wish.push(id); });
          store.set(KEYS.wish + '_' + u.id, wish);
        }

        btn.disabled = false; btn.textContent = 'Sign in';
        $('#loginForm').reset();
        signIn(u, remember, 'Welcome back, ' + firstName(u) + '! (Cloud Firebase)');
        return;
      } catch (fbErr) {
        btn.disabled = false; btn.textContent = 'Sign in';
        err.textContent = fbErr.message || 'Incorrect email or password.';
        shakeModal('authOverlay');
        $('#loginPassword').value = ''; $('#loginPassword').focus();
        return;
      }
    }

    const lk = getLock(email);
    if (lk.until > Date.now()) { err.textContent = 'Too many failed attempts. For your security, please wait before trying again.'; lockCountdown(btn, lk.until); shakeModal('authOverlay'); return; }
    btn.disabled = true; btn.textContent = 'Signing in…';
    const u = findUser(email);
    const ok = u ? (await hashPw(pw, u.salt, u.hash.split(':')[0])) === u.hash : (await hashPw(pw, '00'), false);
    if (ok) {
      setLock(email, null); btn.disabled = false; btn.textContent = 'Sign in';
      $('#loginForm').reset();
      signIn(u, remember, 'Welcome back, ' + firstName(u) + '!');
      return;
    }
    const n = lk.n + 1;
    if (n >= LOCK_AFTER) {
      const until = Date.now() + LOCK_MS; setLock(email, { n: 0, until });
      err.textContent = 'Too many failed attempts. For your security, please wait 30 seconds before trying again.';
      lockCountdown(btn, until);
    } else {
      setLock(email, { n, until: 0 });
      const left = LOCK_AFTER - n;
      err.textContent = 'Incorrect email or password. ' + left + ' attempt' + (left === 1 ? '' : 's') + ' left before a short lock.';
      btn.disabled = false; btn.textContent = 'Sign in';
    }
    shakeModal('authOverlay');
    $('#loginPassword').value = ''; $('#loginPassword').focus();
  });

  /* ---- create account ---- */
  $('#registerForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!checkAll(['regName', 'regEmail', 'regPassword', 'regConfirm'])) { shakeModal('authOverlay'); return; }
    const terms = $('#regTerms'), terr = $('#err-regTerms');
    if (!terms.checked) { terr.textContent = 'Please accept the terms to create your account.'; terms.setAttribute('aria-invalid', 'true'); terms.focus(); shakeModal('authOverlay'); return; }
    terr.textContent = ''; terms.removeAttribute('aria-invalid');
    const btn = $('#regSubmit'); btn.disabled = true; btn.textContent = 'Creating account…';
    const nameVal = $('#regName').value.trim().replace(/\s+/g, ' ');
    const emailVal = $('#regEmail').value.trim().toLowerCase();
    const rawPw = $('#regPassword').value;

    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
      try {
        const fbUser = await window.ShopWaveFirebase.signUp(nameVal, emailVal, rawPw);
        const u = {
          id: fbUser.uid,
          name: nameVal,
          email: emailVal,
          phone: '',
          address: '',
          city: '',
          postal: '',
          created: new Date().toISOString()
        };
        const users = getUsers();
        if (!users.some(x => x.id === u.id)) { users.push(u); setUsers(users); }
        btn.disabled = false; btn.textContent = 'Create account';
        $('#registerForm').reset(); updateStrength('');
        signIn(u, true, 'Welcome to ShopWave, ' + firstName(u) + '! (Saved to Cloud Firestore)');
        return;
      } catch (fbErr) {
        btn.disabled = false; btn.textContent = 'Create account';
        const terr = $('#err-regEmail');
        terr.textContent = fbErr.message || 'Could not register account.';
        shakeModal('authOverlay');
        return;
      }
    }

    const salt = randHex(16), hash = await hashPw(rawPw, salt);
    const u = { id: 'u' + Date.now().toString(36) + randHex(2), name: nameVal, email: emailVal, salt, hash, created: new Date().toISOString(), phone: '', address: '', city: '', postal: '' };
    const users = getUsers(); users.push(u); setUsers(users);
    btn.disabled = false; btn.textContent = 'Create account';
    $('#registerForm').reset(); updateStrength('');
    signIn(u, true, 'Welcome to ShopWave, ' + firstName(u) + '! Your account is ready.');
  });

  /* ---- reset password ---- */
  $('#resetForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!checkAll(['resetEmail', 'resetPassword', 'resetConfirm'])) return;
    const email = $('#resetEmail').value.trim().toLowerCase();

    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
      try {
        await window.ShopWaveFirebase.resetPassword(email);
        $('#resetForm').reset();
        showAuthPanel('login');
        toast('Password reset link sent to ' + email + ' via Firebase!');
        return;
      } catch (fbErr) {
        toast(fbErr.message || 'Could not send reset email.', 'error');
        return;
      }
    }

    const users = getUsers(), u = users.find(x => x.email === email);
    if (u) { u.salt = randHex(16); u.hash = await hashPw($('#resetPassword').value, u.salt); setUsers(users); setLock(email, null); }
    $('#resetForm').reset();
    showAuthPanel('login'); $('#loginEmail').value = email; $('#loginPassword').focus();
    toast('If an account exists for that email, its password has been reset. You can sign in now.');
  });

  /* ---- header button and account menu ---- */
  const authBtn = $('#authBtn'), userMenu = $('#userMenu');
  function setMenu(open) { userMenu.hidden = !open; authBtn.setAttribute('aria-expanded', open); }
  authBtn.onclick = () => { if (!currentUser()) { openAuth('login'); return; } setMenu(userMenu.hidden); };
  document.addEventListener('click', e => { if (!userMenu.hidden && !e.target.closest('.user-wrap')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !userMenu.hidden) { setMenu(false); authBtn.focus(); } });
  $('#menuAccount').onclick = () => { setMenu(false); openAccount(); };
  $('#menuOrders').onclick = () => { setMenu(false); showOrders(); };
  $('#menuSignOut').onclick = () => { setMenu(false); signOut(); };
  function renderAuthUI() {
    const u = currentUser(), ic = $('#authIcon');
    $('#authLabel').textContent = u ? firstName(u) : 'Sign in';
    ic.textContent = u ? u.name.trim()[0].toUpperCase() : '👤'; ic.classList.toggle('avatar', !!u);
    authBtn.setAttribute('aria-label', u ? 'Account menu for ' + u.name : 'Sign in or create an account');
    authBtn.setAttribute('aria-haspopup', u ? 'true' : 'dialog');
    $('#menuName').textContent = u ? u.name : ''; $('#menuEmail').textContent = u ? u.email : '';
    const badgeText = $('#authBadgeText');
    if (badgeText) {
      if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
        badgeText.textContent = 'Firebase Cloud DB Active';
        badgeText.parentElement.style.borderColor = 'rgba(34,197,94,.4)';
      } else {
        badgeText.textContent = 'ShopWave Portal (Local Mode)';
      }
    }
    if (!u) setMenu(false);
  }

  /* ---- my account ---- */
  function openAccount() {
    const u = currentUser(); if (!u) { openAuth('login'); return; }
    $('#accName').value = u.name; $('#accEmail').value = u.email;
    $('#accPhone').value = u.phone || ''; $('#accAddress').value = u.address || ''; $('#accCity').value = u.city || ''; $('#accPostal').value = u.postal || '';
    $('#passForm').reset();
    $$('#accountOverlay .error').forEach(p => p.textContent = ''); $$('#accountOverlay input[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
    $('#accMeta').textContent = 'Member since ' + new Date(u.created).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) + ' · ' + orders.length + ' order' + (orders.length === 1 ? '' : 's');
    openModal('accountOverlay', '#accName');
  }
  $('#profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!checkAll(['accName', 'accPhone', 'accAddress', 'accCity', 'accPostal'])) return;
    const users = getUsers(), u = users.find(x => session && x.id === session.uid); if (!u) return;
    u.name = $('#accName').value.trim().replace(/\s+/g, ' '); u.phone = $('#accPhone').value.trim();
    u.address = $('#accAddress').value.trim(); u.city = $('#accCity').value.trim(); u.postal = $('#accPostal').value.trim();
    setUsers(users); renderAuthUI();
    if (window.ShopWaveFirebase && window.ShopWaveFirebase.isReady()) {
      await window.ShopWaveFirebase.saveUserProfile(u.id, u).catch(err => console.warn('Could not sync profile to Firestore:', err));
    }
    toast('Your details were saved.'); announce('Profile saved');
  });
  $('#passForm').addEventListener('submit', async e => {
    e.preventDefault();
    if (!checkAll(['curPass', 'newPass', 'newPass2'])) return;
    const users = getUsers(), u = users.find(x => session && x.id === session.uid); if (!u) return;
    if ((await hashPw($('#curPass').value, u.salt, u.hash.split(':')[0])) !== u.hash) {
      $('#err-curPass').textContent = 'That is not your current password.'; $('#curPass').setAttribute('aria-invalid', 'true'); $('#curPass').focus(); return;
    }
    u.salt = randHex(16); u.hash = await hashPw($('#newPass').value, u.salt); setUsers(users);
    $('#passForm').reset(); toast('Your password was updated.'); announce('Password updated');
  });
  $('#deleteAcc').onclick = () => { if (confirm('Delete your account? Your details, basket, wishlist and orders will be removed from this browser. This cannot be undone.')) deleteAccount(); };

  /* checkout is filled in from the account's saved details */
  function prefillCheckout() {
    const u = currentUser(); if (!u) return;
    Object.entries({ fullName: u.name, email: u.email, phone: u.phone, address: u.address, city: u.city, postal: u.postal, cardName: u.name }).forEach(([id, v]) => { const el = $('#' + id); if (v && !el.value) el.value = v; });
  }

  /* a ready-made demo account so markers can try the login straight away */
  async function seedDemoUser() {
    if (store.get('sw_seeded', false)) return;
    const salt = randHex(16), hash = await hashPw('Demo@1234', salt), users = getUsers();
    if (!users.some(u => u.email === 'demo@shopwave.lk')) {
      users.push({ id: 'u_demo', name: 'Demo Shopper', email: 'demo@shopwave.lk', salt, hash, created: new Date().toISOString(), phone: '+94 77 123 4567', address: '25 Galle Road', city: 'Colombo', postal: '00300' });
      setUsers(users);
    }
    store.set('sw_seeded', true);
  }

  /* ---------- product photos + videos ---------- */
  const canHover = matchMedia('(hover: hover)').matches;
  const heroVideo = $('#heroVideo');
  let heroVisible = true;
  PRODUCTS.forEach(p => {
    p.images = [
      `product-${p.id}-still.jpg`,
      `product-${p.id}-2.jpg`,
      `product-${p.id}-3.jpg`
    ];
    p.img = p.images[0];
    p.still = p.images[0];
  });

  function thumbImg(p) {
    const src = (p.images && p.images[0]) || p.still || p.img;
    return `<img src="${src}" data-still="${src}" data-emoji="${p.emoji}" alt="" width="64" height="64" loading="lazy" decoding="async">`;
  }

  /* if an image file is missing, fall back to the still, then to the emoji, so the store never shows a broken picture */
  document.addEventListener('error', e => {
    const im = e.target;
    if (!(im instanceof HTMLImageElement) || !im.dataset.still) return;
    if (im.dataset.failed !== '1' && !im.src.endsWith(im.dataset.still)) { im.dataset.failed = '1'; im.src = im.dataset.still; return; }
    if (im.classList.contains('hero-img')) { im.remove(); return; }
    const fb = document.createElement('span'); fb.className = 'p-emoji'; fb.setAttribute('aria-hidden', 'true'); fb.textContent = im.dataset.emoji || '🛍️';
    im.replaceWith(fb);
  }, true);

  /* animated images follow the Display panel and the device's reduced-motion setting */
  function syncMedia() {
    $$('img[data-anim]').forEach(im => {
      const still = motionOff() || (im.classList.contains('p-img') && canHover);
      const want = still ? im.dataset.still : im.dataset.anim;
      if (!im.src.endsWith(want)) im.src = want;
    });
    syncHeroVideo();
  }
  /* the looping hero video stops for reduced motion, the Pause button, a hidden tab or when scrolled out of view */
  function syncHeroVideo() {
    if (!heroVideo) return;
    if (motionOff() || paused || !heroVisible || document.hidden) heroVideo.pause();
    else { const pr = heroVideo.play(); if (pr && pr.catch) pr.catch(() => {}); }
  }
  document.addEventListener('visibilitychange', syncHeroVideo);
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { heroVisible = es[0].isIntersecting; syncHeroVideo(); }).observe($('#hero'));
  try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { syncMedia(); startAuto(); }); } catch (e) { /* older browsers */ }

  /* promo video: captions are built here so they also work when the page is opened straight from a folder */
  const CUES = [
    [0, 2.9, 'ShopWave logo appears with the line: Everything you love, one smooth basket.'],
    [3.4, 7.0, 'Electronics: headphones, smart watch and speaker, from Rs. 9,750.'],
    [7.5, 11.1, 'Clothing: cotton tee, denim jacket and running shoes, from Rs. 2,850.'],
    [11.6, 15.2, 'Food and drink: Ceylon tea gift box, coconut oil and dark chocolate, from Rs. 1,250.'],
    [15.7, 19.4, 'Free delivery over Rs. 15,000. Use code SAVE10 for 10% off. Shop now at ShopWave.']
  ];
  const promoVideo = $('#promoVideo');
  (function setupPromoVideo() {
    const ts = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + (s % 60).toFixed(3).padStart(6, '0');
    const vtt = 'WEBVTT\n\n' + CUES.map(c => `${ts(c[0])} --> ${ts(c[1])}\n${c[2]}`).join('\n\n');
    try {
      const track = $('#promoTrack');
      track.src = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
      track.track.mode = 'showing';
    } catch (e) { /* captions are still in the transcript */ }
    const list = $('#transcriptList');
    list.innerHTML = CUES.map(c => `<li><button type="button" class="link-btn" data-t="${c[0]}" aria-label="Play from ${Math.floor(c[0])} seconds">${Math.floor(c[0] / 60)}:${String(Math.floor(c[0] % 60)).padStart(2, '0')}</button><span>${c[2]}</span></li>`).join('');
    list.addEventListener('click', e => {
      const b = e.target.closest('[data-t]'); if (!b) return;
      promoVideo.currentTime = Number(b.dataset.t);
      const pr = promoVideo.play(); if (pr && pr.catch) pr.catch(() => {});
      promoVideo.scrollIntoView({ behavior: motionOff() ? 'auto' : 'smooth', block: 'center' });
    });
  })();

  /* ---------- init ---------- */
  applyPrefs(); renderCategoryUI();
  $('#grid').innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton" aria-hidden="true"></div>').join('');
  setTimeout(renderProducts, 450);
  updateCounts(); renderCart(); startAuto(); renderAuthUI(); seedDemoUser();
})();
