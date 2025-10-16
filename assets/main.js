// Small helpers
const $ = (s, d=document)=>d.querySelector(s);
const $$ = (s, d=document)=>Array.from(d.querySelectorAll(s));

// Nav shrink on scroll
const nav = $('.top-nav');
if (nav){
  const onScroll=()=>{ if (window.scrollY>12) nav.classList.add('shrink'); else nav.classList.remove('shrink'); };
  onScroll(); window.addEventListener('scroll', onScroll);
}

// Mobile menu toggle
(function(){
  const btn = $('#menu-toggle');
  const links = document.querySelector('.top-nav .links');
  if (!btn || !links) return;
  btn.addEventListener('click', ()=>{
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
    links.classList.remove('open');
  }));
})();

// Lineup rendering from assets/artists.json
(async function(){
  const grid = document.getElementById('lineup-grid');
  if (!grid) return;
  const updatedEl = document.getElementById('lineup-updated');

  function igHandleFrom(input){
    try{
      if(!input) return null; let v=String(input).trim();
      if (v.startsWith('@')) v = v.slice(1);
      if (!/^https?:\/\//i.test(v) && /^[A-Za-z0-9._-]+$/.test(v)) return v.toLowerCase();
      if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
      const u = new URL(v);
      if (!/instagram\.com$/i.test(u.hostname) && !/www\.instagram\.com$/i.test(u.hostname)) return null;
      const segs = u.pathname.split('/').filter(Boolean);
      if (!segs.length) return null;
      const first = segs[0].toLowerCase();
      if (['p','reel','reels','stories','tv','explore'].includes(first)) return null;
      return first;
    }catch{ return null }
  }
  function scHandleFrom(url){
    try{ const u=new URL(url); const parts=u.pathname.split('/').filter(Boolean); return parts[0]||null; }catch{return null}
  }

  async function fetchSCThumb(url){
    try{
      const res = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}&maxheight=256&maxwidth=256`);
      if(!res.ok) return null; const j=await res.json(); return j.thumbnail_url||null;
    }catch{return null}
  }

  function imageCandidates(a){
    const out=[];
    if (a.image) out.push(a.image);
    if (a._thumb) out.push(a._thumb);
    const slug = (a.name||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
    if (slug){
      out.push(`assets/lineup/${slug}.webp`, `assets/lineup/${slug}.png`, `assets/lineup/${slug}.jpg`, `assets/lineup/${slug}.jpeg`);
    }
    // final fallback handled by placeholder
    return out;
  }

  function buildCard(a){
    const card = document.createElement('div'); card.className='artist';
    const link = document.createElement('a'); link.target='_blank'; link.rel='noopener';
    link.href = a.soundcloud || a.instagram || '#';
    const img = document.createElement('img'); img.loading='lazy';
    const cands = imageCandidates(a);
    let idx = 0;
    const next = ()=>{
      if (idx < cands.length){ img.src = cands[idx++]; }
      else { img.src = 'assets/artist-placeholder.svg'; }
    };
    img.onerror = next;
    next();
    img.alt = a.name;
    link.appendChild(img);
    const name = document.createElement('div'); name.className='name'; name.textContent = a.name;
    card.appendChild(link); card.appendChild(name);
    return card;
  }

  try{
    let artists = null;
    // Try API first
    try{
      if (window.PAYMENTS_API_BASE){
        const api = await fetch(`${window.PAYMENTS_API_BASE}/artists?t=${Date.now()}`, { method:'GET', cache:'no-store' });
        if (api.ok){
          const j=await api.json();
          if (Array.isArray(j?.artists)) artists = j.artists;
          if (updatedEl && j?.updatedAt){
            const d=new Date(j.updatedAt);
            const fmt = d.toLocaleString(undefined,{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
            updatedEl.textContent = `Last updated: ${fmt}`;
          }
        }
      }
    }catch(_e){ /* fall back to static */ }
    if (!artists){
      const res = await fetch('assets/artists.json', {cache:'no-store'});
      artists = await res.json();
      if (updatedEl) updatedEl.textContent = '';
    }
    // Resolve thumbnails concurrently where needed
    await Promise.all(artists.map(async a=>{
      if (a.image) return;
      if (a.soundcloud){ a._thumb = await fetchSCThumb(a.soundcloud); if (!a._thumb){ const u=scHandleFrom(a.soundcloud); if (u) a._thumb = `https://unavatar.io/soundcloud/${encodeURIComponent(u)}`; } }
      if (!a._thumb && a.instagram){ const user = igHandleFrom(a.instagram); if (user) a._thumb = `https://unavatar.io/instagram/${encodeURIComponent(user)}`; }
    }));
    // Sort by order then name
    artists.sort((x,y)=> (x.order??9999)-(y.order??9999) || x.name.localeCompare(y.name));
    // Render
    artists.forEach(a=> grid.appendChild(buildCard(a)));
  }catch(_){ /* leave empty grid on failure */ }
})();

// Smooth anchor scroll
$$('.top-nav .links a').forEach(a=>{
  a.addEventListener('click',e=>{
    const href=a.getAttribute('href');
    if (href && href.startsWith('#')){
      e.preventDefault();
      const el=$(href);
      if (el) el.scrollIntoView({behavior:'smooth'});
    }
  })
});

// Tickets modal open helper if available
function openTickets(){
  const overlay=$('#overlay'); const form=$('#form-container');
  if (overlay&&form){ form.classList.add('show'); overlay.classList.add('show'); }
}
window.openTickets=openTickets;

// Reveal on scroll
const io = ('IntersectionObserver' in window) ? new IntersectionObserver(ents=>{
  ents.forEach(e=>{ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} })
}) : null;
$$('.reveal').forEach(el=> io?io.observe(el):el.classList.add('in'));

// FAQ accordion
$$('.faq-q').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const item=btn.closest('.faq-item');
    if (item) item.classList.toggle('open');
  })
});

// Map dynamic embed if needed
const map = $('#gmap-embed');
if (map){
  const src = 'https://maps.google.com/maps?q=35.219889,-117.4505&z=11&output=embed';
  map.src = src;
}

// (Status chip removed on request; countdown alone is shown.)

// Parallax effect (disabled on small screens for performance)
(function(){
  const bg = document.querySelector('.parallax-bg');
  if (!bg) return;
  const mql = window.matchMedia('(max-width: 640px)');
  function onScroll(){
    if (mql.matches) { bg.style.backgroundPosition='center'; return; }
    const scrolled = window.pageYOffset;
    const offset = Math.max(-120, Math.min(120, scrolled * -0.2));
    bg.style.backgroundPosition = `center ${offset}px`;
  }
  onScroll();
  window.addEventListener('scroll', onScroll);
})();

// Close tickets modal with ESC
document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape'){
    const form=$('#form-container'); const overlay=$('#overlay');
    if(form && overlay){ form.classList.remove('show'); overlay.classList.remove('show'); }
  }
});

// Newsletter submit
(function(){
  const form = $('#newsletter-form'); if (!form) return;
  const emailEl = $('#newsletter-email');
  const nameEl = $('#newsletter-name');
  const zipEl = $('#newsletter-zip');
  const msg = $('#newsletter-msg');
  async function submit(e){
    e.preventDefault(); if (!emailEl) return;
    const email = (emailEl.value||'').trim(); if (!email){ return; }
    const name = (nameEl?.value||'').trim();
    const zip = (zipEl?.value||'').trim();
    msg.textContent = 'Submitting...';
    try{
      const res = await fetch(`${window.PAYMENTS_API_BASE}/newsletter`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, name, zip }) });
      if (!res.ok) throw new Error('http_'+res.status);
      msg.textContent = 'Thanks! You’re on the list.'; emailEl.value = ''; if (nameEl) nameEl.value=''; if (zipEl) zipEl.value='';
    }catch(err){ msg.textContent = 'Could not subscribe. Please try again.'; }
  }
  form.addEventListener('submit', submit);
})();

// Fetch inventory and update ticket UI
// Inventory loader with loading state + retry
async function loadInventory(attempt=1){
  try{
    const btns = document.querySelectorAll('.ticket-button[data-tier]');
    btns.forEach(btn=>{
      const avail = btn.parentElement.querySelector('.availability');
      if (avail){ avail.textContent='Loading...'; avail.classList.add('loading'); avail.classList.remove('error','soldout'); }
      btn.removeAttribute('aria-disabled'); btn.style.pointerEvents='auto'; btn.style.opacity='1';
      const card = btn.closest('.ticket-option');
      if (card) card.classList.remove('sold');
    });
    if (!window.PAYMENTS_API_BASE) return;
    const res = await fetch(`${window.PAYMENTS_API_BASE}/inventory?t=${Date.now()}`, { method:'GET', cache:'no-store' });
    if (!res.ok) throw new Error('http_'+res.status);
    const data = await res.json();
    const byId = new Map((data.tiers||[]).map(t=>[t.id,t]));
    btns.forEach(btn=>{
      const tierId = btn.getAttribute('data-tier');
      const t = byId.get(tierId); const availEl = btn.parentElement.querySelector('.availability');
      if (!t){ if (availEl){ availEl.textContent=''; availEl.classList.remove('loading'); } return; }
      if (availEl){
        if (t.limit != null){
          // Do not show numeric counts publicly anymore
          const remaining = Math.max(0,(t.limit||0) - (t.sold||0));
          availEl.textContent = remaining>0 ? 'Available' : 'Sold out';
          availEl.classList.remove('loading'); if (remaining<=0) availEl.classList.add('soldout');
        } else {
          availEl.textContent = 'Available';
          availEl.classList.remove('loading');
        }
      }
      if (t.limit != null){
        const remaining = Math.max(0,(t.limit||0) - (t.sold||0));
        if (remaining<=0){
          btn.setAttribute('aria-disabled','true');
          btn.style.pointerEvents='none';
          btn.style.opacity='0.6';
          if (btn.textContent) btn.textContent = 'Sold Out';
          const card = btn.closest('.ticket-option');
          if (card) card.classList.add('sold');
        }
      }
    });
  }catch(e){
    const btns = document.querySelectorAll('.ticket-button[data-tier]');
    btns.forEach(btn=>{
      const avail = btn.parentElement.querySelector('.availability');
      if (!avail) return;
      avail.classList.remove('loading'); avail.classList.add('error');
      avail.textContent = 'Check back soon';
      let retry = avail.parentElement.querySelector('.retry-link');
      if (!retry){
        retry = document.createElement('a'); retry.className='retry-link'; retry.textContent='Retry';
        retry.addEventListener('click', (ev)=>{ ev.preventDefault(); loadInventory(); });
        avail.after(retry);
      }
    });
    if (attempt<3){ await new Promise(r=>setTimeout(r, 500*attempt)); return loadInventory(attempt+1); }
  }
}

// Initial load and lightweight polling to keep availability fresh
loadInventory().catch(()=>{});
// Refresh when window regains focus or tab becomes visible
window.addEventListener('focus', ()=>{ loadInventory().catch(()=>{}); });
document.addEventListener('visibilitychange', ()=>{ if (document.visibilityState==='visible') loadInventory().catch(()=>{}); });
// Periodic refresh every 20s while the page is open
setInterval(()=>{ loadInventory().catch(()=>{}); }, 20000);

// Public schedule renderer (shows only when published via API)
(async function(){
  const mount = document.getElementById('public-schedule');
  const fallback = document.getElementById('schedule-fallback');
  if (!mount) return;
  try{
    if (!window.PAYMENTS_API_BASE) return;
    const res = await fetch(`${window.PAYMENTS_API_BASE}/schedule`, { method:'GET', cache:'no-store' });
    if (!res.ok) return;
    const j = await res.json();
    if (!j || !j.meta || j.meta.published !== true || !Array.isArray(j.entries) || j.entries.length===0) return;
    // Hide fallback
    if (fallback) fallback.style.display='none';
    // Build simple grouped schedule by day and track
    const entries = j.entries.map(e=> ({
      track: e.track,
      start: new Date(e.start),
      end: new Date(e.end),
      artist: e.artist
    })).sort((a,b)=> a.start - b.start);
    const byDay = new Map();
    entries.forEach(e=>{
      const key = e.start.toDateString();
      if (!byDay.has(key)) byDay.set(key, []);
      byDay.get(key).push(e);
    });
    byDay.forEach((list, day)=>{
      const dayEl=document.createElement('div'); dayEl.style.margin='10px 0 16px';
      const h=document.createElement('h3'); h.textContent = day; h.style.margin='0 0 6px'; h.style.color='var(--accent)'; dayEl.appendChild(h);
      const ul=document.createElement('ul'); ul.style.listStyle='none'; ul.style.padding='0'; ul.style.margin='0';
      list.forEach(ev=>{
        const li=document.createElement('li'); li.style.margin='6px 0'; li.style.display='flex'; li.style.justifyContent='space-between'; li.style.gap='8px';
        const left=document.createElement('div'); left.textContent = `${ev.artist}`; left.style.fontWeight='700';
        const right=document.createElement('div'); right.textContent = `${ev.track} • ${ev.start.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}–${ev.end.toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}`; right.style.color='#cfd1d6';
        li.appendChild(left); li.appendChild(right); ul.appendChild(li);
      });
      dayEl.appendChild(ul); mount.appendChild(dayEl);
    });
  }catch(_e){ /* ignore */ }
})();
