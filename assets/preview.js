/* Neon desert preview interactions */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const API_BASE = window.PAYMENTS_API_BASE || 'https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com';
const DISCORD_URL = 'https://discord.gg/Bm6PkETmP';
const SHARE_BASE = 'https://reeguezrocks.com';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealObserver = null;

const FALLBACK_TIERS = [
  { id: 'ga-3-night', label: 'GA — 3 Night', price: 80, limit: null },
  { id: 'ga-2-night', label: 'GA — 2 Night', price: 60, limit: null },
  { id: 'ga-1-night', label: 'GA — 1 Night', price: 30, limit: null }
];

const FALLBACK_ARTISTS = [
  { name: 'Reeguez', image: 'Reeguez.png', soundcloud: 'https://soundcloud.com/reeguez', order: 1 },
  { name: 'Xhale Ghost', image: 'XG.png', instagram: 'https://www.instagram.com/xhaleghost/', order: 2 },
  { name: 'PrimeTime', image: 'PrimeTime.png', soundcloud: 'https://soundcloud.com/primetimedubs', order: 3 },
  { name: 'MiNDTAKE', image: 'Mindtake.png', soundcloud: 'https://soundcloud.com/mindtake_music', order: 4 },
  { name: 'Debased', image: 'Debased.png', soundcloud: 'https://soundcloud.com/debasedsound', order: 5 },
  { name: 'Myskosis', image: 'Myskosis.png', soundcloud: 'https://soundcloud.com/myskosis', order: 6 },
  { name: 'HANDZ', image: 'HANDZ2.png', soundcloud: 'https://soundcloud.com/handzzzzz', order: 7 },
  { name: 'Redline', image: 'REDLINE.png', soundcloud: 'https://soundcloud.com/redlinedubs/tracks', order: 8 },
  { name: 'Sherpa Suby', image: 'SHERPA.png', instagram: 'https://www.instagram.com/jsub5002/', order: 9 },
  { name: 'Ben10', image: 'Ben_10.png', instagram: 'https://www.instagram.com/bennnn_10/?hl=en', order: 10 },
  { name: 'JVGGER', image: 'JVGGER.png', instagram: 'https://www.instagram.com/jvgger_/', order: 11 },
  { name: 'Rourie', image: 'Rourie.png', soundcloud: 'https://soundcloud.com/therourie', order: 12 }
];

const FALLBACK_SCHEDULE = [
  { track: 'Main Stage', artist: 'Opening Ceremonies + Desert Welcome', start: new Date('2025-10-23T17:00:00-07:00'), end: new Date('2025-10-23T18:00:00-07:00') },
  { track: 'Main Stage', artist: 'Reeguez & Friends', start: new Date('2025-10-24T21:00:00-07:00'), end: new Date('2025-10-24T22:30:00-07:00') },
  { track: 'The Dome', artist: 'Ambient Dawn Session', start: new Date('2025-10-25T02:00:00-07:00'), end: new Date('2025-10-25T04:00:00-07:00') },
  { track: 'Workshops', artist: 'Sound Healing & Breathwork', start: new Date('2025-10-25T13:00:00-07:00'), end: new Date('2025-10-25T14:30:00-07:00') },
  { track: 'Main Stage', artist: 'MiNDTAKE', start: new Date('2025-10-25T23:30:00-07:00'), end: new Date('2025-10-26T01:00:00-07:00') },
  { track: 'The Dome', artist: 'Sunrise Closing Vibes', start: new Date('2025-10-26T05:00:00-07:00'), end: new Date('2025-10-26T06:30:00-07:00') }
];

function ensureRevealObserver() {
  if (prefersReducedMotion) return null;
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  }
  return revealObserver;
}

function registerReveals(root = document) {
  const elements = root.querySelectorAll('.reveal');
  if (!elements.length) return;
  if (prefersReducedMotion) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = ensureRevealObserver();
  if (!observer) return;
  elements.forEach((el) => {
    if (!el.classList.contains('is-visible')) {
      observer.observe(el);
    }
  });
}

function initNav() {
  const header = $('.site-header');
  const toggle = $('.menu-toggle');
  const links = $('.nav-links');
  const floatingCTA = $('.floating-cta');

  function handleScroll() {
    const condensed = window.scrollY > 24;
    header?.setAttribute('data-condensed', String(condensed));
    if (floatingCTA) {
      if (window.scrollY > window.innerHeight * 0.5) {
        floatingCTA.removeAttribute('data-hidden');
      } else {
        floatingCTA.setAttribute('data-hidden', 'true');
      }
    }
    if (!prefersReducedMotion) {
      const hero = $('.hero');
      if (hero) {
        const depth = Math.min(window.scrollY / window.innerHeight, 1);
        hero.style.setProperty('--parallax-y', `${depth * 30}px`);
        hero.style.setProperty('--parallax-opacity', `${1 - depth * 0.4}`);
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.getAttribute('data-open') === 'true';
      links.setAttribute('data-open', String(!open));
      toggle.setAttribute('aria-expanded', String(!open));
      if (!open) {
        links.querySelector('a')?.focus();
      }
    });

    document.addEventListener('click', (evt) => {
      if (!links || !toggle) return;
      if (evt.target === toggle || links.contains(evt.target)) return;
      links.setAttribute('data-open', 'false');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  $$('.nav-links a').forEach((link) => {
    link.addEventListener('click', () => {
      if (links?.getAttribute('data-open') === 'true') {
        links.setAttribute('data-open', 'false');
        toggle?.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

const TICKET_COPY = {
  'ga-3-night': {
    label: 'GA — 3 Night',
    tag: 'Full Send',
    price: 80,
    description: 'Thursday arrival through Sunday breakdown. Festival programming across all stages, late-night domes, and sunrise renegades.',
    points: [
      'Arrive Thursday at 12 PM or later',
      'Camping, parking, and re-entry included',
      'All stages + workshops + renegades'
    ],
    share: `${SHARE_BASE}/tickets/ga-3-night.html`
  },
  'ga-2-night': {
    label: 'GA — 2 Night',
    tag: 'Weekend Wave',
    price: 60,
    description: 'Friday + Saturday access with the same stage production, sound, and community. Perfect for weekend warriors.',
    points: [
      'Arrive Friday at 10 AM or later',
      'Covers Friday & Saturday nights',
      'Camping and parking included'
    ],
    share: `${SHARE_BASE}/tickets/ga-2-night.html`
  },
  'ga-1-night': {
    label: 'GA — 1 Night',
    tag: 'Saturday Sprint',
    price: 30,
    description: 'Drop in for the flagship night. Rail-rattling lineups and sunrise wind-downs before a Sunday reset.',
    points: [
      'Arrive Saturday at 10 AM or later',
      'Depart Sunday by 2 PM',
      'Camping and parking for one vehicle'
    ],
    share: `${SHARE_BASE}/tickets/ga-1-night.html`
  }
};

function startCheckout(tierId) {
  if (!tierId) return;
  try {
    (async () => {
      const res = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ tierId })
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        const message = data?.error || data?.detail || 'Checkout failed';
        throw new Error(message);
      }
      window.location.href = data.url;
    })().catch((err) => {
      alert(`Sorry, checkout is unavailable right now: ${err.message || err}`);
    });
  } catch (err) {
    alert('Checkout unavailable. Please refresh and try again.');
  }
}

window.startCheckout = startCheckout;

async function fetchInventory() {
  try {
    const res = await fetch(`${API_BASE}/inventory`, { cache: 'no-store' });
    if (!res.ok) throw new Error('inventory_failed');
    const data = await res.json();
    if (Array.isArray(data?.tiers) && data.tiers.length) return data.tiers;
  } catch (err) {
    // fall back to config tiers
  }
  const configFallback = Array.isArray(window.TIER_SCHEDULE_FALLBACK)
    ? window.TIER_SCHEDULE_FALLBACK
    : [];
  const mergedIds = new Set();
  const mappedConfig = configFallback.map((t) => {
    mergedIds.add(t.id);
    return {
      id: t.id,
      label: t.label || TICKET_COPY[t.id]?.label || t.id,
      price: t.price ?? TICKET_COPY[t.id]?.price ?? 0,
      limit: t.limit ?? null,
      sold: 0,
      available: null,
      startAt: t.startAt || null,
      endAt: t.endAt || null
    };
  });
  const supplemental = FALLBACK_TIERS.filter((tier) => !mergedIds.has(tier.id)).map((tier) => ({
    ...tier,
    sold: 0,
    available: null,
    startAt: null,
    endAt: null
  }));
  return [...mappedConfig, ...supplemental];
}

function renderTickets(tiers) {
  const container = $('#ticket-grid');
  if (!container) return;
  container.innerHTML = '';

  const ordered = ['ga-3-night', 'ga-2-night', 'ga-1-night'];
  ordered.forEach((tierId, index) => {
    const data = tiers.find((t) => t.id === tierId) || { id: tierId, price: TICKET_COPY[tierId]?.price ?? 0 };
    const copy = TICKET_COPY[tierId];
    if (!copy) return;
    const card = document.createElement('article');
    card.className = 'ticket-card reveal';
    card.dataset.tier = tierId;
    card.dataset.highlight = index === 0 ? 'true' : 'false';
    card.innerHTML = `
      <header>
        <div>
          <div class="ticket-tag">${copy.tag || 'General Admission'}</div>
          <h3>${copy.label}</h3>
        </div>
        <p class="ticket-price">$${Number(data.price ?? copy.price ?? 0).toLocaleString()}</p>
      </header>
      <p class="ticket-copy">${copy.description}</p>
      <ul class="ticket-points">${copy.points.map((point) => `<li>${point}</li>`).join('')}</ul>
      <div class="ticket-meta">
        <div class="ticket-availability" data-state="${(data.available === 0 || data.sold >= (data.limit ?? Infinity)) ? 'soldout' : 'available'}">
          ${(data.available === 0 || data.sold >= (data.limit ?? Infinity)) ? 'Sold Out' : 'Available'}
        </div>
        <span aria-live="polite" class="ticket-status-msg"></span>
      </div>
      <div class="ticket-actions">
        <button type="button" data-action="buy" data-tier="${tierId}" ${data.available === 0 ? 'disabled' : ''}>
          <span>Buy Now</span>
        </button>
        <a class="ticket-share" href="${copy.share}" target="_blank" rel="noopener">
          Share Pass
        </a>
      </div>
    `;
    container.appendChild(card);

    const shareLink = card.querySelector('.ticket-share');
    if (shareLink) {
      shareLink.addEventListener('click', (event) => {
        if (event.metaKey || event.ctrlKey) return;
        event.preventDefault();
        const url = copy.share;
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(() => {
            const status = card.querySelector('.ticket-status-msg');
            if (status) {
              status.textContent = 'Link copied';
              setTimeout(() => { status.textContent = ''; }, 1800);
            }
          }).catch(() => {
            window.open(url, '_blank', 'noopener');
          });
        } else {
          window.open(url, '_blank', 'noopener');
        }
      });
    }
  });

  $$('#ticket-grid [data-action="buy"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const tierId = btn.getAttribute('data-tier');
      startCheckout(tierId);
    });
  });

  registerReveals(container);
}

async function initTickets() {
  const tickets = await fetchInventory();
  renderTickets(tickets);
}

async function initLineup() {
  const grid = $('#lineup-grid-preview');
  const updatedEl = $('#lineup-updated-preview');
  if (!grid) return;
  grid.innerHTML = '';

  let artists = null;
  try {
    if (window.PAYMENTS_API_BASE) {
      const res = await fetch(`${window.PAYMENTS_API_BASE}/artists?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.artists)) {
          artists = data.artists;
          if (updatedEl && data.updatedAt) {
            const date = new Date(data.updatedAt);
            updatedEl.textContent = `Updated ${date.toLocaleString(undefined, { month: 'short', day: 'numeric' })}`;
          }
        }
      }
    }
  } catch (_) {
    // ignore
  }

  if (!artists) {
    try {
      const res = await fetch('assets/artists.json', { cache: 'no-store' });
      if (res.ok) {
        artists = await res.json();
        if (updatedEl) updatedEl.textContent = '';
      }
    } catch (_) {
      // ignore
    }
  }

  if (!artists) {
    artists = FALLBACK_ARTISTS;
  }

  if (!Array.isArray(artists) || !artists.length) {
    grid.innerHTML = '<p role="status">Lineup drop coming soon.</p>';
    return;
  }

  artists.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999));
  const featured = artists.slice(0, 12);

  featured.forEach((artist) => {
    const card = document.createElement('article');
    card.className = 'artist-card reveal';
    const img = document.createElement('img');
    img.src = artist.image || 'assets/artist-placeholder.svg';
    img.alt = `${artist.name} promotional image`;
    img.loading = 'lazy';
    card.appendChild(img);
    const body = document.createElement('div');
    body.className = 'artist-body';
    const name = document.createElement('h3');
    name.textContent = artist.name;
    body.appendChild(name);
    if (artist.stage) {
      const info = document.createElement('p');
      info.textContent = artist.stage;
      body.appendChild(info);
    }
    const socials = document.createElement('div');
    socials.className = 'artist-links';
    if (artist.instagram) {
      const a = document.createElement('a');
      a.href = artist.instagram.startsWith('http') ? artist.instagram : `https://instagram.com/${artist.instagram.replace(/^@/, '')}`;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'Instagram';
      socials.appendChild(a);
    }
    if (artist.soundcloud) {
      const a = document.createElement('a');
      a.href = artist.soundcloud;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'SoundCloud';
      socials.appendChild(a);
    }
    if (socials.childElementCount) body.appendChild(socials);
    card.appendChild(body);
    grid.appendChild(card);
  });

  registerReveals(grid);
}

async function initSchedule() {
  const container = $('#schedule-list-preview');
  const fallback = $('#schedule-fallback-preview');
  if (!container) return;
  container.innerHTML = '';
  let entries = [];
  try {
    if (window.PAYMENTS_API_BASE) {
      const res = await fetch(`${window.PAYMENTS_API_BASE}/schedule`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data?.meta?.published && Array.isArray(data.entries)) {
          entries = data.entries.map((item) => ({
            ...item,
            start: new Date(item.start),
            end: new Date(item.end)
          }));
        }
      }
    }
  } catch (_) {
    // ignore
  }

  if (!entries.length) {
    entries = FALLBACK_SCHEDULE;
  }

  if (!entries.length) {
    fallback?.removeAttribute('hidden');
    container.innerHTML = '<p role="status">Full schedule drops closer to the show.</p>';
    return;
  }

  fallback?.setAttribute('hidden', 'true');
  entries.sort((a, b) => a.start - b.start);
  entries.slice(0, 6).forEach((item) => {
    const node = document.createElement('div');
    node.className = 'schedule-item reveal';
    node.innerHTML = `
      <div>
        <div class="track">${item.track}</div>
        <h3>${item.artist}</h3>
      </div>
      <time datetime="${item.start.toISOString()}">${item.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${item.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
    `;
    container.appendChild(node);
  });

  registerReveals(container);
}

function initReveal() {
  registerReveals(document);
}

function initFAQ() {
  $$('.faq-item').forEach((item) => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = item.getAttribute('data-open') === 'true';
      item.setAttribute('data-open', String(!open));
    });
  });
}

function initCommunityLinks() {
  $$('[data-discord-link]').forEach((link) => {
    link.setAttribute('href', DISCORD_URL);
  });
}

function initNewsletter() {
  const form = $('#newsletter-form-preview');
  if (!form) return;
  const emailEl = $('#newsletter-email-preview');
  const nameEl = $('#newsletter-name-preview');
  const zipEl = $('#newsletter-zip-preview');
  const msg = $('#newsletter-msg-preview');

  async function submit(evt) {
    evt.preventDefault();
    if (!emailEl || !emailEl.value.trim()) return;
    msg.textContent = 'Submitting...';
    msg.setAttribute('aria-live', 'polite');
    try {
      const payload = {
        email: emailEl.value.trim(),
        name: nameEl?.value.trim(),
        zip: zipEl?.value.trim()
      };
      const res = await fetch(`${API_BASE}/newsletter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`http_${res.status}`);
      msg.textContent = 'Welcome to the inner circle. We will keep you updated.';
      emailEl.value = '';
      if (nameEl) nameEl.value = '';
      if (zipEl) zipEl.value = '';
    } catch (err) {
      msg.textContent = 'Could not subscribe. Please try again shortly.';
    }
  }

  form.addEventListener('submit', submit);
}

function initTicketsCTA() {
  const cta = $('.floating-cta');
  const heroCta = $('.hero-primary');
  const navCta = $('.primary-nav-action');
  const scrollTarget = $('#tickets');
  const focusable = scrollTarget?.querySelector('h2');

  function scrollToTickets() {
    if (scrollTarget) {
      scrollTarget.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      focusable?.setAttribute('tabindex', '-1');
      focusable?.focus({ preventScroll: true });
    }
  }

  heroCta?.addEventListener('click', scrollToTickets);
  navCta?.addEventListener('click', scrollToTickets);
  cta?.addEventListener('click', scrollToTickets);

  window.openTickets = scrollToTickets;
}

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initCommunityLinks();
  initTickets();
  initLineup();
  initSchedule();
  initFAQ();
  initNewsletter();
  initTicketsCTA();
  initReveal();
});
