// Reeguez Rocks 2026 Configuration
window.PAYMENTS_API_BASE = "https://6n6czuvav1.execute-api.us-east-1.amazonaws.com";

// Campaign Configuration
window.RR_CONFIG = {
  launchDate: '2026-01-17T00:00:00-08:00', 
  eventDate: '2026-10-14', // 4-Day Event
  tierGoal: 75, // Starting tier goal (Tier 1)
  totalTiers: 10,
  discordUrl: 'https://discord.gg/reeguezrocks',
  instagramUrl: 'https://www.instagram.com/reeguez_rocks_festival/',
};

// Ticket Schedule (Base Prices per Tier)
// The active price will be determined by the current Crowdfunding Tier
window.TIER_SCHEDULE_FALLBACK = [
  { id: 'ga-4-day', label: '4-Day Pass (Thu-Sun)', basePrice: 119, price: 119, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-3-day', label: '3-Day Pass (Fri-Sun)', basePrice: 109, price: 109, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-2-day', label: '2-Day Pass (Sat-Sun)', basePrice: 89, price: 89, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'ga-1-day', label: '1-Day Pass (Sun Only)', basePrice: 79, price: 79, startAt: '2026-01-17T00:00:00-08:00', endAt: null },
  { id: 'car-camping', label: 'Car Camping (Assigned Spot)', price: 40, isAddon: true, startAt: null, endAt: null },
  { id: 'rv-camping', label: 'RV Camping (No Hookups)', price: 100, isAddon: true, limit: 10, startAt: null, endAt: null },
  { id: 'glamping', label: 'Pre-Set Camping (2 Person)', price: 500, isAddon: true, limit: 25, startAt: null, endAt: null },
  { id: 'cabin', label: 'Historic Cabin (Flat Rate)', price: 1000, isAddon: true, limit: 6, startAt: null, endAt: null },
  { id: 'early-arrival', label: 'Early Arrival (Wed)', price: 30, isAddon: true, startAt: null, endAt: null }
];

// Crowdfunding Tier Structure (10 Tiers)
// Tier 1: 75 Tix | Tiers 2-4: 50 Tix | Tiers 5-10: 45 Tix
window.CROWDFUNDING_TIERS = [
  { id: 1, price: 119, goal: 8925,  name: 'Event Confirmed', desc: 'Venue, insurance, and permits secured. We are 100% go.' },
  { id: 2, price: 129, goal: 15375, name: 'Headliner 1 Unlock', desc: 'First major artist secured and announced.' },
  { id: 3, price: 139, goal: 22325, name: 'Stage Vibe', desc: 'Custom stage decor and forest lighting rigs.' },
  { id: 4, price: 149, goal: 29775, name: 'Headliner 2 Unlock', desc: 'Second major artist secured and announced.' },
  { id: 5, price: 159, goal: 36930, name: 'Art Grants', desc: 'Funding for interactive forest art installations.' },
  { id: 6, price: 169, goal: 44535, name: 'Headliner 3 Unlock', desc: 'Third major artist secured and announced.' },
  { id: 7, price: 179, goal: 52590, name: 'Interactive Art', desc: 'Funding for physical art installations.' },
  { id: 8, price: 189, goal: 61095, name: 'Daytime Magic', desc: 'Yoga, workshops, and flow arts programming.' },
  { id: 9, price: 199, goal: 70050, name: 'Final Reveal', desc: 'Complete support acts and schedule released.' },
  { id: 10, price: 209, goal: 79455, name: 'The Full Send', desc: 'Lasers and high-spec visual production.' }
];

window.BACKER_TIERS = {
  founder: { maxTier: 1, label: 'Founding Member', color: '#ffd700' },
  core: { maxTier: 4, label: 'Core Community', color: '#c0c0c0' },
  builder: { maxTier: 7, label: 'Event Builder', color: '#cd7f32' },
  supporter: { maxTier: 10, label: 'Supporter', color: '#888888' }
};
