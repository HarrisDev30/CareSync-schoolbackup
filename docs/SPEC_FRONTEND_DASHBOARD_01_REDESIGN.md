# [FE-401] Clean Frontend Redesign: shadcn dashboard-01 Pattern for Admissions & Front Desk

**Labels**: `ready-for-agent`, `frontend`, `sprint-1`

---

## Problem Statement

The CareSync Front Desk and Admissions Overview page (`/`) currently suffers from visual clutter and sensory overload ("too much happening at once"). A receptionist or intake coordinator arriving at the workstation is confronted with a dense horizontal metrics strip, a multi-doctor exam suite occupancy grid, an hourly outpatient flow area chart, and an extensive data table with lengthy notes and multiple filter tabs all crammed into the initial viewport.

While all the operational features are functional, the lack of visual hierarchy and structural restraint makes it difficult for clinic staff to quickly scan critical triage numbers, monitor waiting lobby volume, and dispatch incoming patients to available physician suites without excessive cognitive load.

## Solution

Redesign the primary Admissions Overview page (`/`) adhering to the clean, high-contrast, uncluttered layout pattern popularized by the official **shadcn/ui `dashboard-01`** block:

1. **Top Row (Hero KPIs)**: Four distinct, clean metric cards displaying key real-time operational indicators: Lobby Waiting Count, Active Consultations (Suites in Use), Discharged Today, and Pending Lab Diagnostics.
2. **Main Layout Split (2-Column Grid)**:
   - **Primary Panel (2/3 Width)**: Admissions & Triage Queue worklist featuring clean status badges, rapid search, and one-click check-in actions.
   - **Secondary Panel (1/3 Width)**: Physician Suite Occupancy & Instant Dispatch card, displaying real-time examination room status with direct "Call Patient to Room" capabilities.
3. **Progressive Disclosure for Analytics**: Integrate the Hourly Outpatient Flow Chart and extended analytics into a clean, secondary tab on the primary card header, eliminating visual clutter on initial page load while preserving immediate access.
4. **Preserved Shell**: Maintain the existing `AppSidebar` and top breadcrumb navigation bar, which already operate effectively.

---

## User Stories

1. As a clinic receptionist, I want to see four clear KPI cards across the top of my overview screen, so that I can immediately assess lobby wait times, room occupancy, discharged patients, and pending diagnostic orders at a single glance.
2. As a clinic receptionist, I want the waiting lobby KPI card to display both the total count of waiting patients and the estimated average wait time, so that I can provide accurate expectations to newly arriving patients.
3. As a clinic receptionist, I want the active consultations KPI card to indicate how many examination suites are occupied versus vacant, so that I know physician availability without walking down the hall.
4. As a clinic receptionist, I want the pending diagnostics KPI card to highlight STAT/urgent lab orders, so that critical diagnostic collections are not delayed.
5. As a clinic receptionist, I want the discharged today KPI card to show the total completed visits for the day, so that our team can monitor daily clinic throughput against targets.
6. As a clinic receptionist, I want a prominent "Register Walk-In" button and a quick search shortcut in the header, so that I can register an unscheduled patient with zero friction.
7. As a clinic receptionist, I want the Admissions Queue to occupy the primary 2/3 view on the left, so that I have ample space to read patient names, MRNs, scheduled times, and clinical indications without text clipping.
8. As an intake nurse, I want clear, color-coded status badges for Scheduled, Confirmed (Waiting), In Progress, and Completed states, so that patient statuses are unmistakably distinct.
9. As a receptionist, I want an instant "Check In" button directly on waiting patients in the queue, so that I can move them from scheduled to confirmed lobby status with one click.
10. As a receptionist, I want an instant search bar above the admissions table, so that I can filter the queue in real-time by patient name, MRN, or assigned physician.
11. As a receptionist, I want clean filter tabs (e.g. All, Lobby Waiting, In Suite, Completed) on the admissions card header, so that I can filter the worklist without cluttering the page with complex dropdown menus.
12. As a clinic staff member, I want a dedicated Physician Suite card in the right 1/3 column, so that I can see every doctor, their assigned room number, and whether their room is currently occupied or vacant.
13. As a receptionist, I want a "Dispatch Next Patient" button directly on any vacant physician suite card, so that I can immediately call the next waiting patient into that examination room without opening modal dialogues.
14. As a clinic manager, I want the Hourly Outpatient Flow pace chart accessible via a clean tab on the main card rather than taking up permanent vertical space, so that the initial interface remains uncluttered while trend data remains accessible.
15. As a keyboard-centric power user, I want the `⌘K` / `Ctrl+K` shortcut to remain available from anywhere on the overview page, so that I can rapidly jump to patient charts or commands.
16. As a compliance officer, I want the session security indicator and desk lock action in the top bar to remain intact, so that clinical confidentiality standards (HIPAA/GDPR) are upheld.
17. As an accessibility-focused user, I want all buttons, tabs, and interactive rows to possess visible WCAG 2.1 AA compliant focus rings, so that the entire triage workflow can be operated via keyboard.
18. As a tablet/mobile user, I want the 4 KPI cards and the 2-column layout to stack gracefully into a single responsive column, so that the interface remains functional on smaller diagnostic workstations.

---

## Implementation Decisions

### Architectural Structure & Layout
- **Page Layout**: Replace the multi-row layout in the Overview Page with the standard `dashboard-01` grid pattern:
  - Top: `grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4` for the 4 hero KPI metric cards.
  - Body: `grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3` (where the queue table spans `xl:col-span-2` and the suite dispatch card occupies `xl:col-span-1`).
- **No Mock E-commerce Code**: Rather than introducing disposable e-commerce files from `npx shadcn@latest add dashboard-01`, implement the layout directly using CareSync's established design tokens and primitives (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Badge`, `Table`, `Tabs`, `Button`, `Avatar`).
- **Preserved Global Navigation**: Do not modify `AppSidebar`, `DashboardLayout` header, lock modal, or breadcrumbs; only modify the content canvas of the Overview route.

### Metric Cards Hierarchy
- **Card 1 (Lobby Waiting)**:
  - Icon: `Clock` or `Users`
  - Value: Total count of patients with status `CONFIRMED` or `SCHEDULED` for the current hour
  - Context: Average wait duration indicator
- **Card 2 (Active Consultations)**:
  - Icon: `Stethoscope`
  - Value: Current in-progress consultation count vs total suite count
  - Context: Suite availability status (e.g., `1 suite vacant`)
- **Card 3 (Discharged Today)**:
  - Icon: `CheckCircle2`
  - Value: Total consultations marked `COMPLETED` for today
  - Context: Current calendar date subtext
- **Card 4 (Pending Diagnostics)**:
  - Icon: `Activity` or `FileText`
  - Value: Active lab orders awaiting collection or verification
  - Context: Priority indicator highlighting STAT orders

### Main Queue & Side Dispatch Panel
- **Admissions & Triage Queue (Left 2/3)**:
  - Clean table headers: Patient & MRN, Indication, Assigned Clinician, Room, Scheduled Time, Status, Action.
  - Tab switcher on the card header: `Admissions Queue` (default active) and `Flow Analytics` (reveals the Recharts hourly flow chart without cluttering the initial view).
  - Search input with inline icon and `⌘K` badge.
- **Physician Suite & Dispatch Board (Right 1/3)**:
  - Compact room list cards for active physicians (Doctor Name, Specialty, Room Number, Vacant / In Session badge).
  - Single-click "Dispatch" button that updates appointment status to `IN_PROGRESS` and assigns the suite room number.

---

## Testing Decisions

### Test Quality Principles
- Tests must interact strictly with external UI behavior and user-visible elements (roles, headings, text content, and button clicks) rather than internal state variables or component implementation details.
- Avoid fragile CSS selector queries; favor accessible ARIA roles and labels (`getByRole('button', { name: /dispatch/i })`, `getByText('Waiting in Lobby')`).

### Target Seam
- **Highest Possible Seam**: **The Page Integration Seam**.
  - The Overview Page component is mounted with mocked service layer responses (`fetchAppointments`, `fetchPatients`, `updateAppointmentStatus`).
  - Tests verify:
    1. The 4 KPI cards render the correct computed numbers from the mocked appointments list.
    2. Switching between "Admissions Queue" and "Flow Analytics" toggles between the table and chart without error.
    3. Typing into the search bar filters table rows in real-time.
    4. Clicking "Dispatch" on a vacant suite sends the expected payload to the API service and displays the confirmation toast.
    5. Clicking "Check In" on a scheduled patient updates status and toast.

---

## Out of Scope

- Modifying the global navigation sidebar (`AppSidebar`) or layout header.
- Modifying backend NestJS controller routes, DTOs, or PostgreSQL schemas.
- Full redesign of secondary sub-pages (`/patients`, `/appointments`, `/labs`, `/audit-logs`) in this cycle—this cycle sets the gold-standard reference on the Overview page (`/`) first.
- Adding third-party payment or billing checkout widgets.

---

## Further Notes

- Once the Overview page redesign is verified and approved, the established card and table visual tokens will be extracted into reusable templates for `/patients` and `/appointments`.

