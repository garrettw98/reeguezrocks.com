// Copy this to config.js and set your API base URL after deploying payments.yaml
// Example: https://abc123.execute-api.us-east-1.amazonaws.com
window.PAYMENTS_API_BASE = "https://gg9rf9hsf0.execute-api.us-east-1.amazonaws.com";

// Optional: Frontend fallback schedule if the API is unreachable.
// Times are in local California time with explicit offset.
// Reeguez Rocks 2026 - Camp Tahquitz, Angeles National Forest
// NOTE: startAt set to future date (2099) to show "Coming Soon" state until sales open
window.TIER_SCHEDULE_FALLBACK = [
  { id: 'ga-4-day', label: 'GA — 4 Day (Thu–Mon)', price: 99, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'ga-3-day', label: 'GA — 3 Day (Fri–Mon)', price: 80, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'ga-2-day', label: 'GA — 2 Day (Sat–Mon)', price: 60, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'ga-1-day', label: 'GA — 1 Day', price: 30, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'car-camping', label: 'Car Camping Add-On', price: 30, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'early-arrival', label: 'Early Arrival (Wed)', price: 20, startAt: '2099-01-01T00:00:00-08:00', endAt: null },
  { id: 'cabin', label: 'Cabin (Sleeps 9)', price: 1000, startAt: '2099-01-01T00:00:00-08:00', endAt: null }
];
