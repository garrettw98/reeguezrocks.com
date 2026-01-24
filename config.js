// Reeguez Rocks 2026 Configuration
window.PAYMENTS_API_BASE = "https://6n6czuvav1.execute-api.us-east-1.amazonaws.com";

// Campaign Configuration
window.RR_CONFIG = {
  launchDate: '2026-01-17T00:00:00-08:00', 
  eventDate: '2026-10-14', // 4-Day Event
  tierGoal: 50, // Tickets per tier
  totalTiers: 10,
  discordUrl: 'https://discord.gg/reeguezrocks',
  instagramUrl: 'https://www.instagram.com/reeguez_rocks_festival/',
};

// Ticket Schedule (Base Prices per Tier)
// The active price will be determined by the current Crowdfunding Tier
window.TIER_SCHEDULE_FALLBACK = [
  { id: 'ga-4-day', label: '4-Day Pass (Thu-Sun)', basePrice: 119, price: 119, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-3-day', label: '3-Day Pass (Fri-Sun)', basePrice: 99, price: 99, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-2-day', label: '2-Day Pass (Sat-Sun)', basePrice: 79, price: 79, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-1-day', label: '1-Day Pass (Sun Only)', basePrice: 49, price: 49, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'car-camping', label: 'Car Camping (Assigned Spot)', price: 40, isAddon: true, startAt: null, endAt: null },
  { id: 'rv-camping', label: 'RV Camping (No Hookups)', price: 100, isAddon: true, limit: 10, startAt: null, endAt: null },
  { id: 'glamping', label: 'Glamping Package (2 Person)', price: 500, isAddon: true, limit: 25, startAt: null, endAt: null },
  { id: 'cabin', label: 'Historic Cabin (Flat Rate)', price: 1000, isAddon: true, limit: 6, startAt: null, endAt: null },
  { id: 'early-arrival', label: 'Early Arrival (Wed)', price: 30, isAddon: true, startAt: null, endAt: null }
];

// Crowdfunding Tier Structure (10 Tiers)
// Amount = Cumulative Revenue Goal (50 tix * Price)
window.CROWDFUNDING_TIERS = [
  { id: 1, price: 119, goal: 5950,  name: 'Event Confirmed', desc: 'Foundation costs & Venue Deposit covered.' },
  { id: 2, price: 129, goal: 12400, name: 'Headliner 1 Unlock', desc: 'First major artist announcement.' },
  { id: 3, price: 139, goal: 19350, name: 'Production Upgrade', desc: 'Base audio/visuals secured.' },
  { id: 4, price: 149, goal: 26800, name: 'Headliner 2 Unlock', desc: 'Second major artist announcement.' },
  { id: 5, price: 159, goal: 34750, name: 'The Dome Upgrade', desc: 'Comfy furniture & decor for the late night zone.' },
  { id: 6, price: 169, goal: 43200, name: 'Headliner 3 Unlock', desc: 'Third major artist announcement.' },
  { id: 7, price: 179, goal: 52150, name: 'Art Installations', desc: 'Interactive art funding unlocked.' },
  { id: 8, price: 189, goal: 61600, name: 'Interactive Games', desc: 'Group activities and games unlocked.' },
  { id: 9, price: 199, goal: 71550, name: 'Full Lineup Drop', desc: 'Every artist revealed.' },
  { id: 10, price: 209, goal: 82000, name: 'Production Max Out', desc: 'Lasers, massive sound, full send.' }
];

window.BACKER_TIERS = {
  founder: { maxTier: 1, label: 'Founding Member', color: '#ffd700' },
  core: { maxTier: 4, label: 'Core Community', color: '#c0c0c0' },
  builder: { maxTier: 7, label: 'Event Builder', color: '#cd7f32' },
  supporter: { maxTier: 10, label: 'Supporter', color: '#888888' }
};
