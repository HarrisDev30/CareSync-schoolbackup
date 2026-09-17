# 04: End-to-End Triage Flow Verification & WCAG 2.1 AA Polish

**What to build:**
Comprehensive end-to-end integration verification and accessibility polish of the redesigned Overview screen. Confirms that all triage workflows—from walk-in patient registration and status updates to suite dispatches—function seamlessly together without visual regression. Ensures graceful responsive stacking on tablet and mobile viewports, zero unhandled errors, and complete WCAG 2.1 AA keyboard navigation with distinct focus rings on all interactive components.

**Blocked by:** 03: Physician Suite Availability & 1-Click Lobby Dispatch Panel

**Status:** ready-for-agent

- [ ] Complete admissions and dispatch workflow passes manual and automated verification without runtime errors.
- [ ] Responsive design verified: 4 KPI cards and 2-column layout smoothly collapse to a single column on mobile/tablet screens.
- [ ] All interactive controls (buttons, tabs, inputs, table rows) feature visible WCAG 2.1 AA focus rings.
- [ ] Registration modal and command palette (`⌘K`) trigger cleanly from the new header and controls.
- [ ] Production build (`next build`) and lint checks complete cleanly with zero errors.

