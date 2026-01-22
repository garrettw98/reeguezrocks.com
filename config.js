// Reeguez Rocks 2026 Configuration
window.PAYMENTS_API_BASE = "https://6n6czuvav1.execute-api.us-east-1.amazonaws.com";

// Campaign Configuration
window.RR_CONFIG = {
  launchDate: '2026-01-17T00:00:00-08:00', 
  eventDate: '2026-10-15',
  tier1Deadline: '2026-06-01T23:59:59-07:00',
  tier1Goal: 6500,
  maxGoal: 95000,
  discordUrl: 'https://discord.gg/reeguezrocks',
  instagramUrl: 'https://www.instagram.com/reeguez_rocks_festival/',
  phasePricing: { 1: 1.0, 2: 1.2, 3: 1.4, 4: 1.6, 5: 1.8 }
};

// Ticket Schedule (base prices for Phase 1)
window.TIER_SCHEDULE_FALLBACK = [
  { id: 'ga-4-day', label: '4-Day Pass (Thu-Sun)', basePrice: 99, price: 99, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-3-day', label: '3-Day Pass (Fri-Sun)', basePrice: 80, price: 80, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-2-day', label: '2-Day Pass (Sat-Sun)', basePrice: 60, price: 60, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-1-day', label: '1-Day Pass (Sun Only)', basePrice: 30, price: 30, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'car-camping', label: 'Car Camping Add-On', price: 30, isAddon: true, startAt: null, endAt: null },
  { id: 'rv-camping', label: 'RV Camping Add-On', price: 100, isAddon: true, limit: 10, startAt: null, endAt: null },
  { id: 'early-arrival', label: 'Early Arrival (Wed)', price: 20, isAddon: true, startAt: null, endAt: null },
  { id: 'cabin', label: 'Historic Cabin (Sleeps 9)', price: 1000, isAddon: true, limit: 6, startAt: null, endAt: null }
];

// Crowdfunding Tier Structure
window.CROWDFUNDING_TIERS = [
  { id: 1, phase: 1, amount: 6500, cumulative: 6500, name: 'Event Confirmed' },
  { id: 2, phase: 2, amount: 4500, cumulative: 11000, name: '1st Mid-Tier Headliner' },
  { id: 3, phase: 2, amount: 3000, cumulative: 14000, name: 'County Permit + EMT' },
  { id: 4, phase: 2, amount: 3500, cumulative: 17500, name: 'Production Upgrade' },
  { id: 5, phase: 2, amount: 3500, cumulative: 21000, name: 'Festival Ambiance' },
  { id: 6, phase: 3, amount: 5500, cumulative: 26500, name: '2nd Mid-Tier Headliner' },
  { id: 7, phase: 3, amount: 4000, cumulative: 30500, name: 'Production Premium' },
  { id: 8, phase: 3, amount: 5000, cumulative: 35500, name: 'Art Installations' },
  { id: 9, phase: 3, amount: 6500, cumulative: 42000, name: '3rd Mid-Tier Headliner' },
  { id: 10, phase: 4, amount: 6000, cumulative: 48000, name: 'Support Acts' },
  { id: 11, phase: 4, amount: 7000, cumulative: 55000, name: 'Enhanced Infrastructure' },
  { id: 12, phase: 4, amount: 13000, cumulative: 68000, name: 'Marquee Headliner' },
  { id: 13, phase: 5, amount: 9000, cumulative: 77000, name: 'Production Festival-Grade' },
  { id: 14, phase: 5, amount: 9000, cumulative: 86000, name: 'Aftermovie + VIP' },
  { id: 15, phase: 5, amount: 9000, cumulative: 95000, name: 'Premium Stretch' }
];

window.BACKER_TIERS = {
  founder: { maxTier: 0, label: 'Founding Backer', color: '#ffd700' },
  pioneer: { maxTier: 5, label: 'Pioneer Backer', color: '#c0c0c0' },
  builder: { maxTier: 9, label: 'Builder Backer', color: '#cd7f32' },
  supporter: { maxTier: 15, label: 'Supporter', color: '#888888' }
};
