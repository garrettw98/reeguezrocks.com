# Gemini CLI Agent Handover Context
**Date:** January 23, 2026
**Project:** Reeguez Rocks 2026 (499 Capacity Strategy)

## 1. Project Status Summary
The website is fully updated to reflect the **499 Capacity "Back to Roots" Plan**. All financial logic, content, and visuals are live.

### A. Core Strategy (Implemented)
*   **Capacity:** 499 Total Bodies (Strict Permit Limit).
*   **Venue:** Camp Tahquitz (640 Acres).
*   **Financial Goal:** $92,000 Stretch Goal (Breaks even at ~$5,950).
*   **Pricing:**
    *   **Tickets:** 10 Tiers, starting at **$119** (Net ~$79 after venue fees).
    *   **Car Camping:** **$40** (Limit 200).
    *   **RV Camping:** **$100** (Limit 10).
    *   **Glamping:** **$500** (Limit 25).
    *   **Cabins:** **$1,000 Flat Rate** (Limit 6, $250 rental cost).
*   **Venue Fee:** The pricing model accounts for a ~$10/day venue fee.

### B. Technical Stack
*   **Frontend:** HTML5, CSS3 (Purple & Gold Theme), Vanilla JS.
*   **Backend:** AWS Lambda (Node.js) + DynamoDB + Stripe.
*   **Deployment:** AWS S3 (`reeguezrocks-2026-site`) + CloudFront (`E2ES0HQCB0HRVJ`).
*   **Repo:** GitHub (`garrettw98/reeguezrocks.com` on `main`).

### C. Recent Changes
*   **Visuals:** Reverted to **Purple & Gold** brand colors.
*   **Content:** Removed "The Meadow" stage references; added "The Bowl" as Main Stage.
*   **Safety:** Added strict "No Open Flames" (except wood stoves) and "Propane Only" cooking rules.
*   **Cabins:** Updated to "Flexible Capacity" / "Unlimited Occupancy" description with wood stove & bathroom details.

---

## 2. Deployment & Sync Status
*   **Git:** All changes committed and pushed to `main`.
*   **AWS:** Static site synced to S3. CloudFront cache invalidated.
*   **Backend:** `deploy/tiers.json` has been pushed to the API via `update_tiers_only.mjs`.

## 3. How to Resume Work
To continue working on another machine:

1.  **Clone:** `git clone https://github.com/garrettw98/reeguezrocks.com.git`
2.  **Navigate:** `cd reeguezrocks.com/2026`
3.  **Install Dependencies:** `npm install` (if you need to run scripts).
4.  **AWS Credentials:** Ensure you have `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` set in your environment or `~/.aws/credentials`.
5.  **Deploy Script:**
    *   **Full Site:** `node deploy/scripts/sync_static.mjs`
    *   **Update Tiers Only:** `node deploy/scripts/update_tiers_only.mjs` (Requires Admin Password in AWS SSM).

## 4. Pending / Next Steps
*   **Audio Testimonials:** User mentioned adding audio recordings later.
*   **Content Polish:** Continue refining artist lineup and visual assets (currently using placeholders).
