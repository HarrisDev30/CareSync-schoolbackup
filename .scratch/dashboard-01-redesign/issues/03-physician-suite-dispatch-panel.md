# 03: Physician Suite Availability & 1-Click Lobby Dispatch Panel

**What to build:**
The secondary 1/3 column layout (`xl:col-span-1`) of the Admissions Overview presenting the Physician Suite Occupancy card. Receptionists and nurses can see every on-duty physician, their designated examination suite room number, specialty, and live occupancy status (Vacant vs In Session). When an examination suite is vacant and patients are waiting in the lobby, the card displays a prominent 1-click "Dispatch Next Patient" action that immediately assigns the suite to the next waiting patient, sets their status to in-consult, and provides instant toast feedback with zero modal delay.

**Blocked by:** 02: Uncluttered Admissions Queue with Progressive Flow Analytics Tab

**Status:** ready-for-agent

- [ ] Secondary card occupies a 1/3 responsive column on large screens adjacent to the admissions worklist.
- [ ] Displays all scheduled clinic physicians with their name, specialty, room number, and occupancy status.
- [ ] Active consultations show the current occupant patient name and an "In Session" indicator.
- [ ] Vacant suites show a "Ready" badge and, if patients are waiting in the queue, a "Dispatch Next Patient" button.
- [ ] Clicking "Dispatch Next Patient" moves the highest-priority waiting patient into the suite and triggers a toast notification.
- [ ] Occupancy metrics and suite states reactively sync with the top KPI cards and the admissions queue.

