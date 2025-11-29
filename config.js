// Copy this to config.js and set your API base URL after deploying payments.yaml
// Example: https://abc123.execute-api.us-east-1.amazonaws.com
window.PAYMENTS_API_BASE = "https://gg9rf9hsf0.execute-api.us-east-1.amazonaws.com";

// Optional: Frontend fallback schedule if the API is unreachable.
// Times are in local California time with explicit offset.
// Reeguez Rocks 2026 - Camp Tahquitz, Angeles National Forest
// NOTE: startAt set to future date (2099) to show "Coming Soon" state until sales open
window.TIER_SCHEDULE_FALLBACK = [
  { id: 'ga-3-night', label: 'GA — 3 Night', price: 80, startAt: '2025-05-01T00:00:00-07:00', endAt: null },
  { id: 'ga-2-night', label: 'GA — 2 Night', price: 60, startAt: '2025-05-01T00:00:00-07:00', endAt: null },
  { id: 'ga-1-night', label: 'GA — 1 Night', price: 30, startAt: '2025-05-01T00:00:00-07:00', endAt: null },
  { id: 'car-camping', label: 'Car Camping Add-On', price: 30, startAt: null, endAt: null },
  { id: 'rv-camping', label: 'RV Camping Add-On', price: 100, limit: null, startAt: null, endAt: null },
  { id: 'early-arrival', label: 'Early Arrival (Wed)', price: 20, startAt: null, endAt: null },
  { id: 'cabin', label: 'Cabin (Sleeps 9)', price: 1000, limit: 6, startAt: null, endAt: null }
];
