# 01: 4-Card Real-Time Triage KPI Grid

**What to build:**
A responsive 4-column hero metric strip across the top of the Admissions Overview page that gives receptionists and clinic staff an immediate, uncluttered operational snapshot of clinic throughput. The 4 cards replace the prior dense metric strip with clean, high-contrast values and contextual subtext:
1. Lobby Waiting (active patient count and estimated average wait duration)
2. Active Consultations (current in-session count and available suite count)
3. Discharged Today (completed encounter tally and current calendar date)
4. Pending Diagnostics (active lab order count and STAT priority indicator)

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] The top metric row renders four separate cards in a responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`).
- [x] Lobby Waiting card shows the exact number of patients in confirmed or scheduled status, plus average wait time.
- [x] Active Consultations card shows the count of suites currently engaged in consult vs total suites.
- [x] Discharged Today card reflects the count of completed visits for the day with the formatted date.
- [x] Pending Diagnostics card displays active diagnostic orders and highlights any pending STAT orders.
- [x] Metric counts update dynamically when underlying patient or appointment state changes.
