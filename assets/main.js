/* Reeguez Rocks 2026 - Final Optimized Main JavaScript */

// --- Helpers ---
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// --- Configuration & Data ---
const API_BASE = window.PAYMENTS_API_BASE || "";
const CONFIG = window.RR_CONFIG || {};
const CROWDFUNDING_TIERS = window.CROWDFUNDING_TIERS || [];
const BACKER_TIERS = window.BACKER_TIERS || {};

const TIER_COPY = {
  "ga-4-day": { description: "Full festival pass - Thursday, Oct 15 through Monday, Oct 19.", points: ["Arrive Thursday 10AM", "Depart Monday 12PM", "Camping included"] },
  "ga-3-day": { description: "Friday arrival for three nights.", points: ["Arrive Friday 10AM", "Depart Monday 12PM", "Camping included"] },
  "ga-2-day": { description: "Weekend pass - Saturday and Sunday.", points: ["Arrive Saturday 10AM", "Depart Monday 12PM", "Camping included"] },
  "ga-1-day": { description: "Single day pass - Sunday only.", points: ["One calendar day", "Day parking included"] }
};

const checkoutState = { 
    step: 1, 
    selectedTicket: null, 
    selectedTicketData: null, 
    quantity: 1, 
    camping: "ga-parking", 
    earlyArrival: false, 
    addonQtys: {
        "car-camping": 1,
        "rv-camping": 1,
        "early-arrival": 1
    },
    currentPhase: 1, 
    raised: 0 
};

// --- Logic Helpers ---
function getCurrentPhase(raised) {
  if (!CROWDFUNDING_TIERS.length) return 1;
  // If we haven't hit the first goal, we are in Tier 1 (Index 0 + 1)
  // Logic: Find the first tier where raised < goal.
  for (let i = 0; i < CROWDFUNDING_TIERS.length; i++) {
      if (raised < CROWDFUNDING_TIERS[i].goal) {
          return CROWDFUNDING_TIERS[i].id;
      }
  }
  // If we exceeded all goals, return the last tier
  return CROWDFUNDING_TIERS[CROWDFUNDING_TIERS.length - 1].id;
}

function getPhaseMultiplier(phase) {
  const pricing = CONFIG.phasePricing || { 1: 1.0, 2: 1.2, 3: 1.4, 4: 1.6, 5: 1.8 };
  return pricing[phase] || 1.0;
}

function getPhasePrices(basePrice, currentPhase) {
  return Math.round(basePrice * getPhaseMultiplier(currentPhase));
}

function msOrNull(ms, s) {
  if (typeof ms === "number" && Number.isFinite(ms)) return ms;
  if (!s) return null;
  const d = Date.parse(s);
  return Number.isFinite(d) ? d : null;
}

function isActive(t, now) {
  const nowMs = now.getTime();
  const sMs = msOrNull(t.startAtMs, t.startAt);
  const eMs = msOrNull(t.endAtMs, t.endAt);
  return ((sMs == null) || (nowMs >= sMs)) && ((eMs == null) || (nowMs < eMs));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Capture and persist referral code from URL
(function initAffiliateTracking() {
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref) {
    localStorage.setItem("rr_referral", ref);
    fetch(API_BASE + "/affiliate/click?ref=" + encodeURIComponent(ref), { method: "POST" }).catch(() => {});
    const url = new URL(window.location.href); 
    url.searchParams.delete("ref");
    window.history.replaceState({}, "", url.toString());
  }
})();

function getReferralCode() { 
    const manual = $("#manual-referral")?.value?.trim();
    if (manual) return manual;
    return localStorage.getItem("rr_referral") || null; 
}

// --- API & Rendering ---
async function fetchInventory() {
  try {
    if (API_BASE) {
      const r = await fetch(API_BASE + "/inventory?t=" + Date.now(), { method: "GET", cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        if (j && Array.isArray(j.tiers)) {
          checkoutState.raised = j.totalRaised || 0;
          checkoutState.currentPhase = getCurrentPhase(checkoutState.raised);
          return j.tiers;
        }
      }
    }
  } catch (e) { console.error("Inventory fetch failed:", e); }
  return window.TIER_SCHEDULE_FALLBACK || [];
}

function renderTickets(tiers) {
  const list = $("#ticket-list");
  if (!list) return;
  list.innerHTML = "";
  if (!tiers.length) { list.innerHTML = "<p>Tickets temporarily unavailable.</p>"; return; }
  
  const now = new Date(), phase = checkoutState.currentPhase;
  const gaTickets = ["ga-4-day", "ga-3-day", "ga-2-day", "ga-1-day"];
  
  tiers.filter(t => gaTickets.includes(t.id)).forEach(tier => {
    const state = (typeof tier.available === "number" && tier.available <= 0) ? "sold" : (isActive(tier, now) ? "active" : "upcoming");
    const displayPrice = tier.basePrice ? getPhasePrices(tier.basePrice, phase) : (tier.price || 0);
    const card = document.createElement("div");
    card.className = `ticket-option ${state === "active" ? "current" : ""} ${state === "sold" ? "sold" : ""}`;
    card.dataset.tier = tier.id;
    
    const copy = TIER_COPY[tier.id] || {};
    card.innerHTML = `
        <div class="ticket-info">
            <h3>${tier.label}</h3>
            <p class="description">${copy.description || ""}</p>
            <ul class="ticket-notes">${(copy.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
        </div>
        <div class="ticket-action">
            <p class="price">$${displayPrice}</p>
            <div class="availability ${state === "sold" ? "soldout" : ""}">${state === "sold" ? "Sold Out" : state === "upcoming" ? "Coming Soon" : "Available"}</div>
        </div>
    `;
    if (state === "active") { 
        card.style.cursor = "pointer"; 
        card.onclick = () => selectTicket(tier, displayPrice); 
    }
    list.appendChild(card);
  });
}

function renderPageTickets(tiers) {
    const list = $("#page-ticket-list");
    if (!list) return;
    list.innerHTML = "";
    if (!tiers.length) { list.innerHTML = "<p>Tickets unavailable.</p>"; return; }
    
    const now = new Date(), phase = checkoutState.currentPhase;
    const gaTickets = ["ga-4-day", "ga-3-day", "ga-2-day", "ga-1-day"];
    
    tiers.filter(t => gaTickets.includes(t.id)).forEach(tier => {
        const state = (typeof tier.available === "number" && tier.available <= 0) ? "sold" : (isActive(tier, now) ? "active" : "upcoming");
        const displayPrice = tier.basePrice ? getPhasePrices(tier.basePrice, phase) : tier.price;
        
        const card = document.createElement("div");
        card.className = `ticket-option ${state === "active" ? "current" : ""} ${state === "sold" ? "sold" : ""}`;
        card.dataset.tier = tier.id;
        
        if (state === "active") {
            card.style.cursor = "pointer";
            card.onclick = () => {
                window.openTickets();
                setTimeout(() => selectTicket(tier, displayPrice), 150);
            };
        }
        
        const copy = TIER_COPY[tier.id] || {};
        card.innerHTML = `
            <div class="ticket-info">
                <h3>${tier.label}</h3>
                <p class="description">${copy.description || ""}</p>
                <ul class="ticket-notes">${(copy.points || []).map(p => `<li>${p}</li>`).join("")}</ul>
            </div>
            <div class="ticket-action">
                <p class="price">$${displayPrice}</p>
                <div class="availability ${state === "sold" ? "soldout" : ""}">${state === "sold" ? "Sold Out" : state === "upcoming" ? "Coming Soon" : "Available"}</div>
            </div>
        `;
        list.appendChild(card);
    });
}

function selectTicket(tier, displayPrice) {
  checkoutState.selectedTicket = tier.id;
  checkoutState.selectedTicketData = { ...tier, price: displayPrice };
  $$(".ticket-option").forEach(opt => opt.classList.toggle("selected", opt.dataset.tier === tier.id));
  const nextBtn = $("#step1-next");
  if (nextBtn) nextBtn.disabled = false;
}

async function refreshTickets() {
  try { 
      const tiers = await fetchInventory();
      renderTickets(tiers); 
      renderPageTickets(tiers);
  } catch (e) { console.error("Refresh tickets failed:", e); }
}

// --- UI Initializers ---
const initNav = () => {
  const nav = $(".nav"), toggle = $("#nav-toggle"), menu = $("#nav-menu");
  if (!nav || !toggle || !menu) return;
  window.addEventListener("scroll", () => { nav.classList.toggle("nav--scrolled", window.scrollY > 20); }, { passive: true });
  toggle.addEventListener("click", () => { 
      const isOpen = menu.classList.toggle("is-open"); 
      toggle.setAttribute("aria-expanded", isOpen); 
  });
  $$(".nav__link", menu).forEach(link => { 
      link.addEventListener("click", () => { 
          menu.classList.remove("is-open"); 
          toggle.setAttribute("aria-expanded", "false"); 
      }); 
  });
};

const modal = {
  overlay: $("#modal-overlay"), container: $("#ticket-modal"),
  open() {
    this.overlay?.classList.add("is-open"); 
    this.container?.classList.add("is-open");
    document.body.style.overflow = "hidden";
    refreshTickets();
  },
  close() {
    this.overlay?.classList.remove("is-open"); 
    this.container?.classList.remove("is-open");
    document.body.style.overflow = "";
  }
};

const initCheckout = () => {
  const goToStep = (step) => {
    checkoutState.step = step;
    $$(".checkout-step").forEach(el => { 
        const s = parseInt(el.dataset.step, 10); 
        el.classList.toggle("checkout-step--active", s === step); 
        el.classList.toggle("checkout-step--completed", s < step); 
    });
    $$(".checkout-panel").forEach(panel => panel.classList.toggle("checkout-panel--active", panel.id === `panel-step-${step}`));
    if (step === 3) buildOrderSummary();
  };

  $("#qty-minus")?.addEventListener("click", () => { if (checkoutState.quantity > 1) checkoutState.quantity--; $("#ticket-qty").value = checkoutState.quantity; });
  $("#qty-plus")?.addEventListener("click", () => { if (checkoutState.quantity < 10) checkoutState.quantity++; $("#ticket-qty").value = checkoutState.quantity; });
  
  const updateAddonVisibility = () => {
      // Keep selectors visible for relevant options to avoid confusion
      $$(".addon-qty-controls").forEach(el => el.style.display = 'flex');
      
      // But only show early arrival qty if early arrival is checked
      const earlyQtyWrap = $("#early-arrival-qty-wrap");
      if (earlyQtyWrap) earlyQtyWrap.style.display = checkoutState.earlyArrival ? 'flex' : 'none';
      
      // Update order summary if we're in the modal
      if (typeof window.updateOrderSummary === 'function') window.updateOrderSummary();
  };

  $$("input[name=camping]").forEach(input => { 
      input.addEventListener("change", () => { 
          checkoutState.camping = input.value; 
          updateAddonVisibility();
      }); 
  });

  const earlyCheck = $("#early-arrival-check");
  if (earlyCheck) {
      earlyCheck.addEventListener("change", () => { 
          checkoutState.earlyArrival = earlyCheck.checked;
          updateAddonVisibility();
      });
  }

  // Waiver Check Logic
  const waiverCheck = $("#waiver-check");
  const checkoutBtn = $("#checkout-btn");
  if (waiverCheck && checkoutBtn) {
      waiverCheck.addEventListener("change", () => {
          checkoutBtn.disabled = !waiverCheck.checked;
      });
  }

  // Set initial visibility on load
  updateAddonVisibility();

  $("#step1-next")?.addEventListener("click", () => { if (checkoutState.selectedTicket) goToStep(2); });
  $("#step2-back")?.addEventListener("click", () => goToStep(1));
  $("#step2-next")?.addEventListener("click", () => goToStep(3));
  $("#step3-back")?.addEventListener("click", () => goToStep(2));
  $("#checkout-btn")?.addEventListener("click", processCheckout);

  function buildOrderSummary() {
    const summary = $("#order-summary");
    const totalEl = $("#order-total-amount");
    if (!summary || !totalEl) return;
    
    // Pre-fill manual referral if empty
    const manualInput = $("#manual-referral");
    if (manualInput && !manualInput.value) {
        manualInput.value = localStorage.getItem("rr_referral") || "";
    }

    let total = 0;
    let html = "";
    
    // 1. Primary Ticket
    if (checkoutState.selectedTicketData) {
        const p = checkoutState.selectedTicketData.price * checkoutState.quantity;
        total += p;
        html += `<div class="order-item"><span>${checkoutState.selectedTicketData.label} x${checkoutState.quantity}</span><span>$${p.toLocaleString()}</span></div>`;
    }
    
    // 2. Camping / Accommodations
    if (checkoutState.camping === "car-camping") {
        const qty = checkoutState.addonQtys["car-camping"];
        const p = 40 * qty;
        total += p;
        html += `<div class="order-item"><span>Car Camping x${qty}</span><span>$${p.toLocaleString()}</span></div>`;
    } else if (checkoutState.camping === "rv-camping") {
        const qty = checkoutState.addonQtys["rv-camping"];
        const p = 100 * qty;
        total += p;
        html += `<div class="order-item"><span>RV Camping x${qty}</span><span>$${p.toLocaleString()}</span></div>`;
    } else {
        html += `<div class="order-item"><span>GA Parking</span><span>Included</span></div>`;
    }
    
    // 3. Early Arrival Add-on
    if (checkoutState.earlyArrival) {
        const qty = checkoutState.addonQtys["early-arrival"];
        const p = 30 * qty;
        total += p;
        html += `<div class="order-item"><span>Early Arrival Add-on x${qty}</span><span>$${p.toLocaleString()}</span></div>`;
    }
    
    totalEl.textContent = `$${total.toLocaleString()}`;
    summary.innerHTML = html;
  }
  window.updateOrderSummary = buildOrderSummary;

  async function processCheckout() {
    const btn = $("#checkout-btn"); if (btn) btn.disabled = true;
    try {
      const addons = [];
      if (checkoutState.camping !== "ga-parking") {
          const qty = checkoutState.camping === "cabin" ? 1 : checkoutState.addonQtys[checkoutState.camping];
          addons.push({ tierId: checkoutState.camping, quantity: qty });
      }
      if (checkoutState.earlyArrival) {
          addons.push({ tierId: "early-arrival", quantity: checkoutState.addonQtys["early-arrival"] });
      }

      const res = await fetch(API_BASE + "/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            tierId: checkoutState.selectedTicket, 
            quantity: checkoutState.quantity, 
            addons: addons,
            referral: getReferralCode()
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout failed");
    } catch (e) { alert("Error connecting to payment server."); }
    if (btn) btn.disabled = false;
  }
};

window.updateAddonQty = (addonId, delta) => {
    const current = checkoutState.addonQtys[addonId] || 1;
    const next = Math.max(1, Math.min(10, current + delta));
    checkoutState.addonQtys[addonId] = next;
    const input = $(`#qty-${addonId}`);
    if (input) input.value = next;
    
    if (typeof window.updateOrderSummary === 'function') {
        window.updateOrderSummary();
    }
};

const initFunding = async () => {
    const progressBar = $("#funding-progress-bar");
    if (!progressBar) return;
    try {
        const r = await fetch(API_BASE + "/inventory?t=" + Date.now());
        const data = await r.json();
        const raised = data.totalRaised || 0;
        checkoutState.raised = raised;
        
        // Find current tier target
        let currentTier = CROWDFUNDING_TIERS[0];
        let prevGoal = 0;
        
        for (let i = 0; i < CROWDFUNDING_TIERS.length; i++) {
            if (raised < CROWDFUNDING_TIERS[i].goal) {
                currentTier = CROWDFUNDING_TIERS[i];
                prevGoal = i > 0 ? CROWDFUNDING_TIERS[i-1].goal : 0;
                break;
            }
        }
        
        // Calculate % within this tier (not total 0-100%)
        // Example: Tier 2 starts at 5950 (Tier 1 goal) and ends at 12400. Raised 7000.
        // Progress = (7000 - 5950) / (12400 - 5950)
        const tierSpan = currentTier.goal - prevGoal;
        const progressInTier = raised - prevGoal;
        const pct = Math.min(100, Math.max(0, (progressInTier / tierSpan) * 100));
        
        progressBar.style.width = `${pct}%`;
        $("#funding-current").textContent = `$${raised.toLocaleString()}`;
        $("#next-tier-name").textContent = `Current: ${currentTier.name} ($${currentTier.goal.toLocaleString()} Goal)`;
        
        // Update timeline if exists
        renderTimeline();
    } catch (e) {}
};

const initLineup = async () => {
    const grid = $("#lineup-grid") || $("#lineup-teaser-grid");
    if (!grid) return;
    
    try {
        let artists = [];
        if (API_BASE) {
            const res = await fetch(API_BASE + "/artists?t=" + Date.now());
            if (res.ok) {
                const data = await res.json();
                artists = data.artists || [];
            }
        }
        
        if (!artists.length) {
            const res = await fetch("assets/artists.json");
            artists = await res.json();
        }
        
        // Handle both main grid and teaser grid
        const mainGrid = $("#lineup-grid");
        const teaserGrid = $("#lineup-teaser-grid");
        
        if (mainGrid) renderLineup(mainGrid, artists);
        if (teaserGrid) renderLineup(teaserGrid, artists);
    } catch (e) {
        console.error("Lineup failed:", e);
    }
};

const renderLineup = (grid, artists) => {
    grid.innerHTML = "";
    artists.forEach(a => {
        const card = document.createElement("div");
        card.className = "artist";
        const img = a.image || "assets/artist-placeholder.svg";
        card.innerHTML = `
            <img src="${img}" alt="${a.name}" loading="lazy">
            <div class="name">${a.name}</div>
            ${a.soundcloud ? `<a href="${a.soundcloud}" target="_blank" style="display:block; text-align:center; font-size:10px; color:var(--color-text-muted); margin-bottom:8px;">SoundCloud</a>` : ""}
            ${a.instagram ? `<a href="${a.instagram}" target="_blank" style="display:block; text-align:center; font-size:10px; color:var(--color-text-muted); margin-bottom:8px;">Instagram</a>` : ""}
        `;
        grid.appendChild(card);
    });
};

const initCountdown = () => {
    const targetDate = new Date('2026-10-14T12:00:00-07:00').getTime();
    
    const update = () => {
        const now = new Date().getTime();
        const diff = targetDate - now;
        
        if (diff <= 0) {
            $$('.countdown').forEach(el => el.innerHTML = '<div class="countdown__started">Event Live!</div>');
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Update hero countdown (index.html)
        const hDays = $("#hero-days"), hHours = $("#hero-hours"), hMins = $("#hero-mins"), hSecs = $("#hero-secs");
        if (hDays) hDays.textContent = String(days).padStart(2, '0');
        if (hHours) hHours.textContent = String(hours).padStart(2, '0');
        if (hMins) hMins.textContent = String(mins).padStart(2, '0');
        if (hSecs) hSecs.textContent = String(secs).padStart(2, '0');

        // Update campaign countdown (tickets.html)
        const cDays = $("#countdown-days"), cHours = $("#countdown-hours"), cMins = $("#countdown-mins"), cSecs = $("#countdown-secs");
        if (cDays) cDays.textContent = String(days).padStart(2, '0');
        if (cHours) cHours.textContent = String(hours).padStart(2, '0');
        if (cMins) cMins.textContent = String(mins).padStart(2, '0');
        if (cSecs) cSecs.textContent = String(secs).padStart(2, '0');
    };
    
    update();
    setInterval(update, 1000);
};

const renderTimeline = () => {
    const timeline = $("#journey-timeline");
    const fullTimeline = $("#full-timeline");
    if (!timeline || !CROWDFUNDING_TIERS.length) return;
    
    timeline.innerHTML = "";
    if (fullTimeline) fullTimeline.innerHTML = "";
    
    // Find current tier index
    let currentIndex = 0;
    for (let i = 0; i < CROWDFUNDING_TIERS.length; i++) {
        if (checkoutState.raised >= CROWDFUNDING_TIERS[i].goal) {
            currentIndex = i + 1;
        } else {
            break;
        }
    }

    CROWDFUNDING_TIERS.forEach((tier, index) => {
        const isUnlocked = checkoutState.raised >= tier.goal;
        const isActive = index === currentIndex;
        
        const milestoneHtml = `
            <div class="milestone ${isActive ? 'milestone--active' : ''} ${isUnlocked ? 'milestone--unlocked' : ''}">
                <div class="milestone__icon">${isUnlocked ? '✓' : tier.id}</div>
                <div class="milestone__content">
                    <div class="milestone__title">${tier.name} <span style="float:right; font-size:10px; opacity:0.6;">$${tier.price}</span></div>
                    <div class="milestone__desc">${tier.desc}</div>
                </div>
            </div>
        `;

        // Only show current and next in the main dashboard
        if (index === currentIndex || index === currentIndex - 1 || (currentIndex === 0 && index === 0)) {
            timeline.insertAdjacentHTML('beforeend', milestoneHtml);
        }
        
        // Add everything to the full list
        if (fullTimeline) {
            fullTimeline.insertAdjacentHTML('beforeend', milestoneHtml);
        }
    });
};

const initTabs = () => {
    $$('.tabs').forEach(tabList => {
        const tabs = $$('.tab', tabList);
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                const parent = tab.closest('.container') || tab.parentElement.parentElement;
                
                // Update tabs
                tabs.forEach(t => {
                    t.classList.toggle('tab--active', t === tab);
                    t.setAttribute('aria-selected', t === tab);
                });
                
                // Update panels
                $$('.tab-panel', parent).forEach(panel => {
                    panel.classList.toggle('tab-panel--active', panel.id === `panel-${target}`);
                });
            });
        });
    });
};

const initAnimations = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
    initNav();
    modal.overlay?.addEventListener("click", () => modal.close());
    $("#modal-close")?.addEventListener("click", () => modal.close());
    initCheckout();
    initFunding();
    initLineup();
    initTabs();
    initAnimations();
    initCountdown();
    refreshTickets();
});

// --- Globals ---
window.openTickets = () => modal.open();