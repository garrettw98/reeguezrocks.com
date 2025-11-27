/* ==========================================================================
   Reeguez Rocks 2026 - Main JavaScript
   ========================================================================== */

// Utilities
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// API Base
const API_BASE = window.PAYMENTS_API_BASE || '';

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
   Ticket Rendering
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

  // Sort by start date
  const sorted = tiers.slice().sort((a, b) => {
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
      const btn = document.createElement('button');
      btn.className = 'ticket-button';
      btn.textContent = `Buy $${tier.price}`;
      btn.dataset.tier = tier.id;
      btn.addEventListener('click', () => startCheckout(tier.id));
      action.appendChild(btn);
    }

    card.appendChild(info);
    card.appendChild(action);
    list.appendChild(card);
  });
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
