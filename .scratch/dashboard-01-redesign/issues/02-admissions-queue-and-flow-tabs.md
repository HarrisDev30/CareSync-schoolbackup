# 02: Uncluttered Admissions Queue with Progressive Flow Analytics Tab

**What to build:**
The primary 2/3 column layout (`xl:col-span-2`) of the Admissions Overview containing a streamlined Admissions & Triage Queue table. The worklist provides real-time search filtering, segmented status tabs (All, Lobby Waiting, In Suite, Completed), clean row presentation with avatars, patient identity, MRN, assigned clinician, suite badge, and a 1-click "Check In" button for scheduled patients. To eliminate visual clutter on initial page load, the card header includes a tab switcher that lets the user seamlessly switch between the Admissions Queue and the Hourly Outpatient Flow Chart on demand.

**Blocked by:** 01: 4-Card Real-Time Triage KPI Grid

**Status:** ready-for-agent

- [ ] Primary card occupies a 2/3 responsive column on large screens.
- [ ] Card header includes view tabs toggling between "Admissions Queue" and "Flow Analytics".
- [ ] In "Admissions Queue" view, patient rows render without text truncation or clipping.
- [ ] Quick status filter tabs allow filtering by All, Lobby Waiting, In Room, and Completed.
- [ ] Real-time search bar filters the queue by patient name, MRN, clinician, or indication with `⌘K` badge indicator.
- [ ] Patients in scheduled status have a visible 1-click "Check In" action that updates their status to confirmed lobby wait.
- [ ] In "Flow Analytics" view, the hourly outpatient flow area chart renders cleanly without layout shifts.

