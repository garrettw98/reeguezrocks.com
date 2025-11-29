/* ==========================================================================
   Reeguez Rocks 2026 - Main JavaScript
   ========================================================================== */

// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// API Base
const API_BASE = window.PAYMENTS_API_BASE || '';

// Capture referral code from URL and store in localStorage
(function captureReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    localStorage.setItem('rr_referral', ref);
    // Track click for this affiliate (fire and forget)
    fetch(`${API_BASE}/affiliate/click?ref=${encodeURIComponent(ref)}`, { method: 'POST' }).catch(() => {});
    // Clean up URL without refreshing
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.toString());
  }
})();

// Get stored referral code
function getReferralCode() {
  return localStorage.getItem('rr_referral') || null;
}

/* --------------------------------------------------------------------------
   Navigation
   -------------------------------------------------------------------------- */
(function initNav() {
  const nav = $('.nav');
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');

  if (!nav || !toggle || !menu) return;

  // Scroll behavior
  const handleScroll = () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 20);
  };
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Mobile menu toggle
  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu on link click
  $$('.nav__link', menu).forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scroll for anchor links
  $$('.nav__link[href^="#"]', menu).forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = $(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });
})();

/* --------------------------------------------------------------------------
   Tabs
   -------------------------------------------------------------------------- */
(function initTabs() {
  const tabs = $$('.tab');
  const panels = $$('.tab-panel');

  if (!tabs.length || !panels.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = tab.dataset.tab;

      // Update tabs
      tabs.forEach(t => {
        t.classList.toggle('tab--active', t === tab);
        t.setAttribute('aria-selected', t === tab);
      });

      // Update panels
      panels.forEach(panel => {
        const isActive = panel.id === `panel-${targetId}`;
        panel.classList.toggle('tab-panel--active', isActive);
      });
    });
  });
})();

/* --------------------------------------------------------------------------
   Modal (Tickets)
   -------------------------------------------------------------------------- */
const modal = {
  overlay: $('#modal-overlay'),
  container: $('#ticket-modal'),
  closeBtn: $('#modal-close'),

  open() {
    if (!this.overlay || !this.container) return;
    this.overlay.classList.add('is-open');
    this.container.classList.add('is-open');
    this.container.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (typeof refreshTickets === 'function') refreshTickets();
  },

  close() {
    if (!this.overlay || !this.container) return;
    this.overlay.classList.remove('is-open');
    this.container.classList.remove('is-open');
    this.container.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  },

  init() {
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.overlay) {
      this.overlay.addEventListener('click', () => this.close());
    }
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }
};

modal.init();

// Global function for opening tickets modal
window.openTickets = () => modal.open();

// Ticket button handlers
$('#hero-tickets-btn')?.addEventListener('click', () => modal.open());
$('#mobile-cta')?.addEventListener('click', () => modal.open());

// Handle ticket link in nav
$$('.nav__link[href="#tickets"]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    modal.open();
  });
});

/* --------------------------------------------------------------------------
   Ticket Rendering & Multi-Step Checkout
   -------------------------------------------------------------------------- */
const TIER_COPY = {
  'ga-4-day': {
    description: 'Full festival access — Thursday through Monday.',
    points: ['Arrive Thursday at 12:00 PM', 'All four nights of music', 'Tent camping included']
  },
  'ga-3-day': {
    description: 'Friday arrival for three nights.',
    points: ['Arrive Friday at 10:00 AM', 'Three nights of music', 'Tent camping included']
  },
  'ga-2-day': {
    description: 'Weekend pass for two nights.',
    points: ['Arrive Saturday at 10:00 AM', 'Two nights of music', 'Tent camping included']
  },
  'ga-1-day': {
    description: 'Single day pass.',
    points: ['Access for one calendar day', 'Day parking included']
  },
  'car-camping': {
    description: 'Park at your campsite.',
    points: ['Add-on for any GA ticket', 'Camp next to your vehicle']
  },
  'cabin': {
    description: '9-person heated cabin.',
    points: ['Historic heated cabin', 'Sleeps up to 9', 'Limited availability (6 total)']
  },
  'early-arrival': {
    description: 'Arrive Wednesday evening.',
    points: ['Best campsite selection', 'Extra night of camping']
  }
};

// Checkout state
const checkoutState = {
  step: 1,
  selectedTicket: null,
  selectedTicketData: null,
  quantity: 1,
  camping: 'ga-parking',
  earlyArrival: false
};

let lastInventory = null;

function msOrNull(ms, s) {
  if (typeof ms === 'number' && Number.isFinite(ms)) return ms;
  if (!s) return null;
  const d = Date.parse(s);
  return Number.isFinite(d) ? d : null;
}

function isActive(t, now) {
  const nowMs = now.getTime();
  const sMs = msOrNull(t.startAtMs, t.startAt);
  const eMs = msOrNull(t.endAtMs, t.endAt);
  const afterStart = (sMs == null) || (nowMs >= sMs);
  const beforeEnd = (eMs == null) || (nowMs < eMs);
  return afterStart && beforeEnd;
}

async function fetchInventory() {
  try {
    if (API_BASE) {
      const r = await fetch(`${API_BASE}/inventory?t=${Date.now()}`, { method: 'GET', cache: 'no-store' });
      if (r.ok) {
        const j = await r.json();
        if (Array.isArray(j?.tiers) && j.tiers.length) {
          const tiers = j.tiers.slice();
          // Merge fallback windows if API didn't supply them
          const fbList = Array.isArray(window.TIER_SCHEDULE_FALLBACK) ? window.TIER_SCHEDULE_FALLBACK : [];
          const fbById = new Map(fbList.map(t => [t.id, t]));
          const anyWindow = tiers.some(t => t.startAt != null || t.startAtMs != null || t.endAt != null || t.endAtMs != null);
          if (!anyWindow && fbById.size) {
            tiers.forEach(t => {
              const f = fbById.get(t.id);
              if (f) {
                t.startAt = f.startAt ?? null;
                t.endAt = f.endAt ?? null;
                t.startAtMs = msOrNull(null, f.startAt);
                t.endAtMs = msOrNull(null, f.endAt);
              }
            });
          }
          return tiers;
        }
      }
    }
  } catch (_) { /* fall through */ }
  // Fallback to local schedule
  return (window.TIER_SCHEDULE_FALLBACK || []).slice();
}

function renderTickets(tiers) {
  const list = $('#ticket-list');
  if (!list) return;
  list.innerHTML = '';

  if (!tiers || !tiers.length) {
    list.innerHTML = '<p class="modal__note">Tickets unavailable. Please try again soon.</p>';
    return;
  }

  const now = new Date();

  const stateFor = (tier) => {
    if (typeof tier.available === 'number' && tier.available <= 0) return 'sold';
    if (isActive(tier, now)) return 'active';
    const startMs = msOrNull(tier.startAtMs, tier.startAt);
    if (startMs != null && now.getTime() < startMs) return 'upcoming';
    const endMs = msOrNull(tier.endAtMs, tier.endAt);
    if (endMs != null && now.getTime() >= endMs) return 'ended';
    return 'inactive';
  };

  // Sort by start date, filter only GA tickets (not add-ons)
  const gaTickets = ['ga-4-day', 'ga-3-day', 'ga-2-day', 'ga-1-day'];
  const sorted = tiers.slice()
    .filter(t => gaTickets.includes(t.id))
    .sort((a, b) => {
      const as = msOrNull(a.startAtMs, a.startAt) ?? 0;
      const bs = msOrNull(b.startAtMs, b.startAt) ?? 0;
      return as - bs;
    });

  sorted.forEach(tier => {
    const state = stateFor(tier);
    if (state === 'ended' || state === 'inactive') return;

    const card = document.createElement('div');
    card.className = 'ticket-option';
    card.dataset.tier = tier.id;
    if (state === 'active') card.classList.add('current');
    if (state === 'sold') card.classList.add('sold');
    if (checkoutState.selectedTicket === tier.id) card.classList.add('selected');

    const info = document.createElement('div');
    info.className = 'ticket-info';

    const title = document.createElement('h3');
    title.textContent = tier.label;
    info.appendChild(title);

    const copy = TIER_COPY[tier.id] || {};
    const desc = document.createElement('p');
    desc.className = 'description';
    desc.textContent = copy.description || 'General Admission';
    info.appendChild(desc);

    if (Array.isArray(copy.points) && copy.points.length) {
      const ul = document.createElement('ul');
      ul.className = 'ticket-notes';
      copy.points.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        ul.appendChild(li);
      });
      info.appendChild(ul);
    }

    const action = document.createElement('div');
    action.className = 'ticket-action';

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${tier.price}`;
    action.appendChild(price);

    const availability = document.createElement('div');
    availability.className = 'availability';

    if (state === 'sold') {
      availability.textContent = 'Sold Out';
      availability.classList.add('soldout');
      action.appendChild(availability);
    } else if (state === 'upcoming') {
      availability.textContent = 'Coming Soon';
      action.appendChild(availability);
    } else if (state === 'active') {
      availability.textContent = 'Available';
      action.appendChild(availability);
      // Make entire card clickable for selection
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => selectTicket(tier));
    }

    card.appendChild(info);
    card.appendChild(action);
    list.appendChild(card);
  });
}

// Select a ticket
function selectTicket(tier) {
  checkoutState.selectedTicket = tier.id;
  checkoutState.selectedTicketData = tier;

  // Update UI
  $$('.ticket-option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.tier === tier.id);
  });

  // Enable continue button
  const nextBtn = $('#step1-next');
  if (nextBtn) nextBtn.disabled = false;
}

async function refreshTickets() {
  const list = $('#ticket-list');
  if (list) {
    list.innerHTML = '<p class="modal__note">Loading tickets...</p>';
  }
  try {
    const tiers = await fetchInventory();
    lastInventory = tiers;
    renderTickets(tiers);
  } catch (_) {
    renderTickets([]);
  }
}

window.refreshTickets = refreshTickets;

/* --------------------------------------------------------------------------
   Stripe Checkout
   -------------------------------------------------------------------------- */
async function startCheckout(tierId) {
  try {
    const res = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({ tierId })
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      const message = (data && (data.error || data.detail)) || 'Checkout failed';
      throw new Error(message);
    }
    window.location.href = data.url;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'This tier may be sold out or unavailable.';
    alert(`Sorry, ${msg}`);
  }
}

/* --------------------------------------------------------------------------
   Lineup Grid
   -------------------------------------------------------------------------- */
(async function initLineup() {
  const grid = $('#lineup-grid');
  const updatedEl = $('#lineup-updated');
  if (!grid) return;

  function igHandleFrom(input) {
    try {
      if (!input) return null;
      let v = String(input).trim();
      if (v.startsWith('@')) v = v.slice(1);
      if (!/^https?:\/\//i.test(v) && /^[A-Za-z0-9._-]+$/.test(v)) return v.toLowerCase();
      if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
      const u = new URL(v);
      if (!/instagram\.com$/i.test(u.hostname) && !/www\.instagram\.com$/i.test(u.hostname)) return null;
      const segs = u.pathname.split('/').filter(Boolean);
      if (!segs.length) return null;
      const first = segs[0].toLowerCase();
      if (['p', 'reel', 'reels', 'stories', 'tv', 'explore'].includes(first)) return null;
      return first;
    } catch { return null; }
  }

  function scHandleFrom(url) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[0] || null;
    } catch { return null; }
  }

  async function fetchSCThumb(url) {
    try {
      const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}&maxheight=256&maxwidth=256`);
      if (!res.ok) return null;
      const j = await res.json();
      return j.thumbnail_url || null;
    } catch { return null; }
  }

  function imageCandidates(a) {
    const out = [];
    if (a.image) out.push(a.image);
    if (a._thumb) out.push(a._thumb);
    const slug = (a.name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (slug) {
      out.push(`assets/lineup/${slug}.webp`, `assets/lineup/${slug}.png`, `assets/lineup/${slug}.jpg`, `assets/lineup/${slug}.jpeg`);
    }
    return out;
  }

  function buildCard(a) {
    const card = document.createElement('div');
    card.className = 'artist';

    const link = document.createElement('a');
    link.target = '_blank';
    link.rel = 'noopener';
    link.href = a.soundcloud || a.instagram || '#';

    const img = document.createElement('img');
    img.loading = 'lazy';
    const cands = imageCandidates(a);
    let idx = 0;
    const next = () => {
      if (idx < cands.length) {
        img.src = cands[idx++];
      } else {
        img.src = 'assets/artist-placeholder.svg';
      }
    };
    img.onerror = next;
    next();
    img.alt = a.name;

    link.appendChild(img);

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = a.name;

    card.appendChild(link);
    card.appendChild(name);
    return card;
  }

  try {
    let artists = null;

    // Try API first
    try {
      if (API_BASE) {
        const api = await fetch(`${API_BASE}/artists?t=${Date.now()}`, { method: 'GET', cache: 'no-store' });
        if (api.ok) {
          const j = await api.json();
          if (Array.isArray(j?.artists)) artists = j.artists;
          if (updatedEl && j?.updatedAt) {
            const d = new Date(j.updatedAt);
            const fmt = d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
            updatedEl.textContent = `Last updated: ${fmt}`;
          }
        }
      }
    } catch (_) { /* fall back to static */ }

    if (!artists) {
      const res = await fetch('assets/artists.json', { cache: 'no-store' });
      artists = await res.json();
      if (updatedEl) updatedEl.textContent = '';
    }

    // Resolve thumbnails
    await Promise.all(artists.map(async a => {
      if (a.image) return;
      if (a.soundcloud) {
        a._thumb = await fetchSCThumb(a.soundcloud);
        if (!a._thumb) {
          const u = scHandleFrom(a.soundcloud);
          if (u) a._thumb = `https://unavatar.io/soundcloud/${encodeURIComponent(u)}`;
        }
      }
      if (!a._thumb && a.instagram) {
        const user = igHandleFrom(a.instagram);
        if (user) a._thumb = `https://unavatar.io/instagram/${encodeURIComponent(user)}`;
      }
    }));

    // Sort by order then name
    artists.sort((x, y) => (x.order ?? 9999) - (y.order ?? 9999) || x.name.localeCompare(y.name));

    // Render
    artists.forEach(a => grid.appendChild(buildCard(a)));
  } catch (_) { /* leave empty grid */ }
})();

/* --------------------------------------------------------------------------
   Newsletter Form
   -------------------------------------------------------------------------- */
(function initNewsletter() {
  const form = $('#newsletter-form');
  if (!form) return;

  const emailEl = $('#newsletter-email');
  const nameEl = $('#newsletter-name');
  const zipEl = $('#newsletter-zip');
  const msg = $('#newsletter-msg');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!emailEl) return;

    const email = (emailEl.value || '').trim();
    if (!email) return;

    const name = (nameEl?.value || '').trim();
    const zip = (zipEl?.value || '').trim();

    msg.textContent = 'Submitting...';

    try {
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, zip })
      });
      if (!res.ok) throw new Error('http_' + res.status);

      msg.textContent = "Thanks! You're on the list.";
      emailEl.value = '';
      if (nameEl) nameEl.value = '';
      if (zipEl) zipEl.value = '';
    } catch (_) {
      msg.textContent = 'Could not subscribe. Please try again.';
    }
  });
})();

/* --------------------------------------------------------------------------
   Public Schedule
   -------------------------------------------------------------------------- */
(async function initSchedule() {
  const mount = $('#public-schedule');
  const fallback = $('#schedule-fallback');
  if (!mount) return;

  try {
    if (!API_BASE) return;

    const res = await fetch(`${API_BASE}/schedule`, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return;

    const j = await res.json();
    if (!j || !j.meta || j.meta.published !== true || !Array.isArray(j.entries) || j.entries.length === 0) return;

    // Hide fallback
    if (fallback) fallback.style.display = 'none';

    // Build schedule
    const entries = j.entries.map(e => ({
      track: e.track,
      start: new Date(e.start),
      end: new Date(e.end),
      artist: e.artist
    })).sort((a, b) => a.start - b.start);

    const byDay = new Map();
    entries.forEach(e => {
      const key = e.start.toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(e);
    });

    byDay.forEach((list, day) => {
      const dayEl = document.createElement('div');

      const h = document.createElement('h3');
      h.textContent = day;
      dayEl.appendChild(h);

      const ul = document.createElement('ul');
      list.forEach(ev => {
        const li = document.createElement('li');
        const left = document.createElement('div');
        left.textContent = ev.artist;
        left.style.fontWeight = '600';

        const right = document.createElement('div');
        right.textContent = `${ev.track} • ${ev.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}–${ev.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
        right.style.color = 'var(--color-text-muted)';

        li.appendChild(left);
        li.appendChild(right);
        ul.appendChild(li);
      });
      dayEl.appendChild(ul);
      mount.appendChild(dayEl);
    });
  } catch (_) { /* ignore */ }
})();

/* --------------------------------------------------------------------------
   Preconnect to API
   -------------------------------------------------------------------------- */
(function preconnect() {
  try {
    if (!API_BASE) return;
    const l1 = document.createElement('link');
    l1.rel = 'dns-prefetch';
    l1.href = API_BASE;
    document.head.appendChild(l1);

    const l2 = document.createElement('link');
    l2.rel = 'preconnect';
    l2.href = API_BASE;
    l2.crossOrigin = '';
    document.head.appendChild(l2);
  } catch (_) { }
})();

/* --------------------------------------------------------------------------
   Handle URL ticket parameter
   -------------------------------------------------------------------------- */
(function handleTicketParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const ticketParam = (urlParams.get('ticket') || '').trim().toLowerCase();
  if (ticketParam) {
    // Open modal on load
    setTimeout(() => modal.open(), 100);
  }
})();

/* --------------------------------------------------------------------------
   Multi-Step Checkout Logic
   -------------------------------------------------------------------------- */
(function initCheckoutFlow() {
  // Step navigation
  function goToStep(step) {
    checkoutState.step = step;

    // Update step indicators
    $$('.checkout-step').forEach(el => {
      const s = parseInt(el.dataset.step, 10);
      el.classList.toggle('checkout-step--active', s === step);
      el.classList.toggle('checkout-step--completed', s < step);
    });

    // Update panels
    $$('.checkout-panel').forEach(panel => {
      const panelStep = parseInt(panel.id.replace('panel-step-', ''), 10);
      panel.classList.toggle('checkout-panel--active', panelStep === step);
    });

    // If going to step 3, build order summary
    if (step === 3) {
      buildOrderSummary();
    }
  }

  // Quantity controls
  const qtyInput = $('#ticket-qty');
  const qtyMinus = $('#qty-minus');
  const qtyPlus = $('#qty-plus');

  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10) || 1;
      if (val > 1) {
        qtyInput.value = val - 1;
        checkoutState.quantity = val - 1;
      }
    });

    qtyPlus.addEventListener('click', () => {
      const val = parseInt(qtyInput.value, 10) || 1;
      if (val < 10) {
        qtyInput.value = val + 1;
        checkoutState.quantity = val + 1;
      }
    });
  }

  // Camping option selection
  const campingOptions = $$('input[name="camping"]');
  campingOptions.forEach(input => {
    input.addEventListener('change', () => {
      checkoutState.camping = input.value;
      // Update visual state
      $$('.camping-option').forEach(opt => {
        opt.classList.toggle('camping-option--selected', opt.querySelector('input').checked);
      });
    });
  });

  // Early arrival checkbox
  const earlyCheck = $('#early-arrival-check');
  if (earlyCheck) {
    earlyCheck.addEventListener('change', () => {
      checkoutState.earlyArrival = earlyCheck.checked;
    });
  }

  // Step 1 -> Step 2
  const step1Next = $('#step1-next');
  if (step1Next) {
    step1Next.addEventListener('click', () => {
      if (checkoutState.selectedTicket) {
        goToStep(2);
      }
    });
  }

  // Step 2 -> Back
  const step2Back = $('#step2-back');
  if (step2Back) {
    step2Back.addEventListener('click', () => goToStep(1));
  }

  // Step 2 -> Step 3
  const step2Next = $('#step2-next');
  if (step2Next) {
    step2Next.addEventListener('click', () => goToStep(3));
  }

  // Step 3 -> Back
  const step3Back = $('#step3-back');
  if (step3Back) {
    step3Back.addEventListener('click', () => goToStep(2));
  }

  // Final checkout button
  const checkoutBtn = $('#checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => processCheckout());
  }

  // Build order summary
  function buildOrderSummary() {
    const summary = $('#order-summary');
    const totalEl = $('#order-total-amount');
    if (!summary) return;

    summary.innerHTML = '';
    let total = 0;

    // Ticket
    if (checkoutState.selectedTicketData) {
      const ticketPrice = checkoutState.selectedTicketData.price * checkoutState.quantity;
      total += ticketPrice;

      const item = document.createElement('div');
      item.className = 'order-item';
      item.innerHTML = `
        <div>
          <span class="order-item__name">${checkoutState.selectedTicketData.label}</span>
          <span class="order-item__qty"> x ${checkoutState.quantity}</span>
        </div>
        <span class="order-item__price">$${ticketPrice}</span>
      `;
      summary.appendChild(item);
    }

    // Camping
    if (checkoutState.camping === 'car-camping') {
      const campingPrice = 30 * checkoutState.quantity;
      total += campingPrice;

      const item = document.createElement('div');
      item.className = 'order-item';
      item.innerHTML = `
        <div>
          <span class="order-item__name">Car Camping</span>
          <span class="order-item__qty"> x ${checkoutState.quantity}</span>
        </div>
        <span class="order-item__price">$${campingPrice}</span>
      `;
      summary.appendChild(item);
    } else if (checkoutState.camping === 'cabin') {
      // Cabin replaces GA ticket pricing
      // Recalculate - cabin is flat $1000
      total = 1000;
      summary.innerHTML = '';

      const item = document.createElement('div');
      item.className = 'order-item';
      item.innerHTML = `
        <div>
          <span class="order-item__name">Cabin (Sleeps 9)</span>
          <span class="order-item__qty"> x 1</span>
        </div>
        <span class="order-item__price">$1,000</span>
      `;
      summary.appendChild(item);
    } else {
      // GA Parking - included
      const item = document.createElement('div');
      item.className = 'order-item';
      item.innerHTML = `
        <div>
          <span class="order-item__name">GA Parking</span>
        </div>
        <span class="order-item__price">Included</span>
      `;
      summary.appendChild(item);
    }

    // Early arrival
    if (checkoutState.earlyArrival && checkoutState.camping !== 'cabin') {
      const earlyPrice = 20 * checkoutState.quantity;
      total += earlyPrice;

      const item = document.createElement('div');
      item.className = 'order-item';
      item.innerHTML = `
        <div>
          <span class="order-item__name">Early Arrival (Wed)</span>
          <span class="order-item__qty"> x ${checkoutState.quantity}</span>
        </div>
        <span class="order-item__price">$${earlyPrice}</span>
      `;
      summary.appendChild(item);
    }

    // Update total
    if (totalEl) {
      totalEl.textContent = `$${total.toLocaleString()}`;
    }
  }

  // Process checkout - sends items to Stripe
  async function processCheckout() {
    const checkoutBtn = $('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Processing...';
    }

    try {
      // Build line items array
      const lineItems = [];

      if (checkoutState.camping === 'cabin') {
        // Cabin purchase - single item
        lineItems.push({ tierId: 'cabin', quantity: 1 });
      } else {
        // GA ticket + add-ons
        lineItems.push({
          tierId: checkoutState.selectedTicket,
          quantity: checkoutState.quantity
        });

        if (checkoutState.camping === 'car-camping') {
          lineItems.push({
            tierId: 'car-camping',
            quantity: checkoutState.quantity
          });
        }

        if (checkoutState.earlyArrival) {
          lineItems.push({
            tierId: 'early-arrival',
            quantity: checkoutState.quantity
          });
        }
      }

      // For now, use the existing single-item checkout
      // TODO: Update API to handle multiple line items
      const primaryItem = lineItems[0];
      const referral = getReferralCode();
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({
          tierId: primaryItem.tierId,
          quantity: primaryItem.quantity,
          // Pass additional items as metadata
          addons: lineItems.slice(1),
          // Pass referral code if present
          referral: referral || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        const message = (data && (data.error || data.detail)) || 'Checkout failed';
        throw new Error(message);
      }
      window.location.href = data.url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Checkout failed. Please try again.';
      alert(`Sorry, ${msg}`);

      if (checkoutBtn) {
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Proceed to Payment';
      }
    }
  }

  // Reset checkout state when modal opens
  const originalOpen = modal.open.bind(modal);
  modal.open = function() {
    // Reset state
    checkoutState.step = 1;
    checkoutState.selectedTicket = null;
    checkoutState.selectedTicketData = null;
    checkoutState.quantity = 1;
    checkoutState.camping = 'ga-parking';
    checkoutState.earlyArrival = false;

    // Reset UI
    if (qtyInput) qtyInput.value = 1;
    const step1Next = $('#step1-next');
    if (step1Next) step1Next.disabled = true;

    // Reset camping selection
    const gaParkingRadio = $('input[name="camping"][value="ga-parking"]');
    if (gaParkingRadio) gaParkingRadio.checked = true;
    $$('.camping-option').forEach((opt, i) => {
      opt.classList.toggle('camping-option--selected', i === 0);
    });

    // Reset early arrival
    if (earlyCheck) earlyCheck.checked = false;

    // Go to step 1
    goToStep(1);

    // Call original open
    originalOpen();
  };
})();

/* --------------------------------------------------------------------------
   Crowdfunding Progress Tracker
   -------------------------------------------------------------------------- */
(function initCrowdfunding() {
  // Tier configuration with cumulative goals (each tier amount includes 10% community fund)
  const TIERS = [
    { id: 1, name: 'Minimum Viable Production', amount: 7590 },
    { id: 2, name: 'First Headliner + Support', amount: 6600 },
    { id: 3, name: 'Subphonic Upgrade ($6k)', amount: 3300 },
    { id: 4, name: 'Festival Ambiance', amount: 3300 },
    { id: 5, name: 'Daytime Programming', amount: 2750 },
    { id: 6, name: 'Second Headliner + Support', amount: 6600 },
    { id: 7, name: 'Subphonic Upgrade ($9k)', amount: 3300 },
    { id: 8, name: 'Art & Infrastructure', amount: 5500 },
    { id: 9, name: 'Third Headliner + Support', amount: 7700 },
    { id: 10, name: 'Underground Support Acts', amount: 4400 },
    { id: 11, name: 'Subphonic Upgrade ($12k)', amount: 3300 },
    { id: 12, name: 'Marquee Headliner', amount: 13200 },
    { id: 13, name: 'Subphonic Elite ($15k)', amount: 3300 },
    { id: 14, name: 'Premium Package', amount: 11000 }
  ];

  // Calculate cumulative goals
  let cumulative = 0;
  TIERS.forEach(tier => {
    cumulative += tier.amount;
    tier.cumulativeGoal = cumulative;
  });

  // DOM elements
  const progressBar = $('#funding-progress-bar');
  const currentEl = $('#funding-current');
  const goalEl = $('#funding-goal');
  const tierNameEl = $('#next-tier-name');
  const tiersUnlockedEl = $('#tiers-unlocked');

  if (!progressBar || !currentEl || !goalEl) return;

  // Update progress display
  function updateProgress(raised) {
    // Find current tier (first one not fully funded)
    let tiersUnlocked = 0;
    let currentTier = TIERS[0];
    let prevCumulative = 0;

    for (let i = 0; i < TIERS.length; i++) {
      if (raised >= TIERS[i].cumulativeGoal) {
        tiersUnlocked = i + 1;
        prevCumulative = TIERS[i].cumulativeGoal;
        if (i < TIERS.length - 1) {
          currentTier = TIERS[i + 1];
        } else {
          currentTier = null; // All tiers complete
        }
      } else {
        currentTier = TIERS[i];
        break;
      }
    }

    // Update tiers unlocked count
    if (tiersUnlockedEl) {
      tiersUnlockedEl.textContent = tiersUnlocked;
    }

    // If all tiers complete
    if (tiersUnlocked === TIERS.length) {
      if (tierNameEl) tierNameEl.textContent = 'All Tiers Unlocked!';
      currentEl.textContent = '$' + raised.toLocaleString();
      goalEl.textContent = '$' + TIERS[TIERS.length - 1].cumulativeGoal.toLocaleString();
      progressBar.style.width = '100%';
      return;
    }

    // Calculate progress within current tier
    const tierStart = prevCumulative;
    const tierEnd = currentTier.cumulativeGoal;
    const tierProgress = raised - tierStart;
    const tierGoal = tierEnd - tierStart;
    const percent = Math.min(100, Math.max(0, (tierProgress / tierGoal) * 100));

    // Update display
    currentEl.textContent = '$' + tierProgress.toLocaleString();
    goalEl.textContent = '$' + tierGoal.toLocaleString();
    progressBar.style.width = percent + '%';

    if (tierNameEl) {
      tierNameEl.textContent = `Tier ${currentTier.id}: ${currentTier.name}`;
    }

    // Update tier cards in the DOM
    updateTierCards(raised, tiersUnlocked, currentTier);
  }

  // Update visual state of tier cards
  function updateTierCards(raised, tiersUnlocked, currentTier) {
    const tierCards = $$('.tier[data-tier]');
    let prevCumulative = 0;

    tierCards.forEach(card => {
      const tierNum = parseInt(card.dataset.tier, 10);
      const tier = TIERS[tierNum - 1];
      if (!tier) return;

      const tierStart = tierNum === 1 ? 0 : TIERS[tierNum - 2].cumulativeGoal;
      const tierEnd = tier.cumulativeGoal;

      // Remove all state classes
      card.classList.remove('tier--active', 'tier--complete');

      if (raised >= tierEnd) {
        // Tier is complete
        card.classList.add('tier--complete');

        // Update progress bar if it exists
        const fillEl = card.querySelector('.tier__fill');
        const statusEl = card.querySelector('.tier__status');
        if (fillEl) fillEl.style.width = '100%';
        if (statusEl) statusEl.textContent = 'Complete!';
      } else if (currentTier && tierNum === currentTier.id) {
        // This is the active tier
        card.classList.add('tier--active');

        // Calculate and show progress
        const tierProgress = Math.max(0, raised - tierStart);
        const tierGoal = tier.amount;
        const percent = Math.min(100, (tierProgress / tierGoal) * 100);

        // Ensure progress elements exist
        let progressDiv = card.querySelector('.tier__progress');
        if (!progressDiv) {
          progressDiv = document.createElement('div');
          progressDiv.className = 'tier__progress';
          progressDiv.innerHTML = `
            <div class="tier__bar"><div class="tier__fill" style="width: 0%"></div></div>
            <span class="tier__status">$0 / $${tierGoal.toLocaleString()}</span>
          `;
          card.appendChild(progressDiv);
        }

        const fillEl = card.querySelector('.tier__fill');
        const statusEl = card.querySelector('.tier__status');
        if (fillEl) fillEl.style.width = percent + '%';
        if (statusEl) statusEl.textContent = `$${tierProgress.toLocaleString()} / $${tierGoal.toLocaleString()}`;
      }
    });
  }

  // Fetch current funding from API (or use mock data for now)
  async function fetchFunding() {
    try {
      // Try to get real data from orders table
      const res = await fetch(`${API_BASE}/inventory?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Calculate total raised from ticket sales
        // For now, use 0 until we have real sales data
        const raised = data.totalRaised || 0;
        updateProgress(raised);
      }
    } catch (e) {
      // On error, just show 0 progress
      updateProgress(0);
    }
  }

  // Initialize
  updateProgress(0); // Start with 0, will update when API responds
  fetchFunding();
})();

/* --------------------------------------------------------------------------
   Affiliate Signup Form
   -------------------------------------------------------------------------- */
(function initAffiliate() {
  const form = $('#affiliate-form');
  const result = $('#affiliate-result');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating...';
    }

    const name = ($('#affiliate-name')?.value || '').trim();
    const email = ($('#affiliate-email')?.value || '').trim();

    try {
      const res = await fetch(`${API_BASE}/affiliate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();

      if (data.ok) {
        $('#affiliate-link').value = data.link;
        $('#affiliate-code').textContent = data.code;
        if (result) result.style.display = 'block';
        form.style.display = 'none';
      } else {
        alert(data.error || 'Something went wrong');
        if (btn) {
          btn.disabled = false;
          btn.textContent = 'Get My Affiliate Link';
        }
      }
    } catch (_) {
      alert('Network error. Please try again.');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Get My Affiliate Link';
      }
    }
  });
})();

// Copy affiliate link helper
window.copyAffiliateLink = function() {
  const input = $('#affiliate-link');
  if (!input) return;
  input.select();
  document.execCommand('copy');
  const btn = input.nextElementSibling;
  if (btn) {
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  }
};
