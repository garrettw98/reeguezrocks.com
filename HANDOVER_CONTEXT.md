# Gemini CLI Agent Handover Context
**Date:** January 21, 2026
**Project:** Reeguez Rocks 2026 (499 Capacity Pivot)

## 1. Project Status Summary
We have successfully updated the **Reeguez Rocks 2026** website to a polished visual state and established a new strategic direction for the event.

### A. Website Visuals (Completed)
*   **Overlay Fixed:** We moved away from a global dark overlay to a **Section-Specific Alternating Overlay** strategy.
    *   Hero: 40% opacity (`rgba(0,0,0,0.4)`).
    *   Standard Sections: 40% opacity.
    *   Alternate Sections: 60% opacity (`rgba(0,0,0,0.6)`).
    *   *Result:* Background is visible/bright, but text is readable.
*   **Cards:** Darkened to 50% opacity for better contrast.
*   **Text:** Lightened muted text to `#e0e0e0` and `#c0c0c0`.
*   **Cache:** CSS is currently at `assets/main-v5.css?v=18`.

### B. Content & Lineup (Completed)
*   **Lineup Updated:** Confirmed artists are Reeguez, Apex Logan, Debased, DirtyD, HANDZ, MiniHandz, MiNDTAKE, Myskosis, PrimeTime, Sherpa Suby, LEO, XOXO, and **Kitty Counts**.
*   **Socials:** Added Instagram link support for artists (specifically for Kitty Counts).
*   **Corrections:** Fixed gate times in `main.js` (Thursday is 10 AM, not 12 PM).

### C. Repository (Active)
*   The local directory is now a git repo linked to `https://github.com/garrettw98/reeguezrocks.com`.
*   All current changes are pushed to `main`.

---

## 2. The New Strategy: 499 Capacity
**We are pivoting the event model to a strict 499-person cap for permitting reasons.**
*   **Reference Document:** See `REEGUEZ_ROCKS_499_PLAN.md` for the full draft.

### Key Constraints
1.  **Capacity:** 499 Total Bodies (450 Paid Tickets / 49 Staff + Artists).
2.  **Financials:** ~$60k Budget. Ticket prices hold steady ($99-$179). Car camping becomes a major revenue driver (~150 spots).
3.  **Infrastructure:**
    *   **Stages:** Reduced to **The Bowl** (Main) + **The Dome** (Late Night/Chill). "The Meadow" is cut.
    *   **Sound:** Strict "No Generator" rule (Solar/Battery only for sound camps).
4.  **Crowdfunding:** Simplified to **10 Tiers** (approx 45 tix/tier) to maintain unlock momentum.

---

## 3. Immediate Next Steps (For the Next Agent)
The user **DOES NOT** want to implement the code changes for the 499 plan yet. They want to continue formulating the plan.

**Your Goal:** Help the user refine the `REEGUEZ_ROCKS_499_PLAN.md` before touching the HTML/JS.

**Suggested Prompts to continue:**
1.  "Let's breakdown the $60k budget allocation for the 499 model."
2.  "How do we want to market the 'exclusivity' of only 450 tickets?"
3.  "Let's detail the 'Sound Camp' encouragement strategy since the main stage is smaller."

**To Resume:**
1.  Read `REEGUEZ_ROCKS_499_PLAN.md`.
2.  Ask the user for specific details on the remaining "Open Questions" in that file or specific budget numbers.
