# CareSync Design System & UI Specification (`DESIGN.md`)

> **Guiding Principle**: High-density, professional enterprise clinical EHR/HIS interface. Clean, neutral monochrome/slate aesthetic, high information density, calm visual rhythm, and zero gimmicks.
> 
> When creating new pages or components, **layouts can be unique to the domain problem**, but the **"taste", typography, elevation, button sizes, and design system tokens must remain strictly identical**.

---

## 1. Core Visual Taste & Design Principles

### 1.1 The "CareSync Taste"
- **Monochrome & Slate Palette**: Rooted in slate grays, zinc, deep navy darks, and crisp white cards (`bg-background`, `bg-card`, `border-border`, `text-foreground`, `text-muted-foreground`).
- **Feature-Driven Architecture**: Avoid cookie-cutter 4-KPI metric cards on pages where they add no clinical value. Choose the layout that solves the user's workflow (e.g., interactive room tiles for Floor Census, timeline queues for Outpatient Consultations, multi-pane analyzer workbench for Diagnostic Labs, searchable directory table for Patient Registry).
- **Zero Rainbow Gradients / Gimmicks**: Never use multi-color gradient bars, floating cartoon badges, or novelty icons in headers.
- **Micro-Interactions**: Clean transitions (`active:scale-[0.98]`, `transition-colors duration-150`, standard focus rings).

---

## 2. Global Header Specification (Strict Rule)

Every dashboard page **must** use the exact same header markup, typography, and button dimensions:

```tsx
{/* 1. COMMAND HEADER */}
<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1">
  <div className="space-y-1.5">
    <h1 className="text-3xl font-bold tracking-tight text-foreground">
      {Page Title}
    </h1>
    <p className="text-sm text-muted-foreground">
      {Concise one-sentence description of the clinical feature.}
    </p>
  </div>

  {/* Global Action Group */}
  <div className="flex items-center gap-2.5 flex-wrap">
    {/* Secondary Action (Search, Filter, Export, or Auxiliary Link) */}
    <Button
      variant="outline"
      size="sm"
      className="gap-2 text-sm text-muted-foreground hover:text-foreground h-10 px-3.5 border-border shadow-none cursor-pointer"
    >
      <Search className="w-4 h-4 text-muted-foreground" />
      <span className="hidden sm:inline">Search records</span>
      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
        ⌘K
      </kbd>
    </Button>

    {/* Primary Action Button */}
    <Button
      size="sm"
      className="gap-2 h-10 px-4 cursor-pointer active:scale-[0.98] transition-transform bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
    >
      <Plus className="w-4 h-4" />
      <span>{Action Name}</span>
    </Button>
  </div>
</div>
```

### 2.1 Header Do's and Don'ts
| Element | Allowed | Forbidden |
| :--- | :--- | :--- |
| **Title (`<h1>`)** | Clean text: `text-3xl font-bold tracking-tight text-foreground` | ❌ Decorative icon boxes, beaker icons, or sticker badges inside/beside `<h1>`. |
| **Subtitle (`<p>`)** | `text-sm text-muted-foreground` inside `space-y-1.5` | ❌ Random font sizes, multiple paragraphs. |
| **Header Wrapper** | `flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-1` | ❌ Arbitrary `border-b` dividers under the header wrapper. |
| **Header Buttons** | `h-10 px-3.5` (secondary), `h-10 px-4` (primary) | ❌ Inconsistent heights (`h-8`, `h-9`, `h-11`). |

---

## 3. Sidebar Navigation Rules (`nav-main.tsx`)

The sidebar dynamically adjusts chevron disclosure based on sub-item count:

1. **Multi-Feature Menus ($>1$ sub-items)**:
   - Example: *Patient Admissions* (`Front Desk Overview` + `Admissions & Registry`).
   - Renders a collapsible chevron (`ChevronRight` with `data-[state=open]:rotate-90`).
2. **Single-Feature Menus ($=1$ sub-item)**:
   - Example: *Consultation Scheduling*, *Diagnostic Services*, *Room Management*.
   - Renders as a clean direct single-click navigation button with **no chevron**.

```tsx
// Rule in nav-main.tsx:
const hasMultipleSubItems = Boolean(item.items && item.items.length > 1);
```

---

## 4. UI Components & Tokens Reference

### 4.1 Cards & Containers
- **Card**: `<Card className="border-border bg-card shadow-xs rounded-xl">`
- **Card Header**: `<CardHeader className="py-5 px-6">`
- **Card Title**: `<CardTitle className="text-lg font-semibold tracking-tight text-foreground">`
- **Card Description**: `<CardDescription className="text-xs text-muted-foreground">`

### 4.2 Buttons
| Variant | Classes | Usage |
| :--- | :--- | :--- |
| **Primary Header** | `h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium rounded-md active:scale-[0.98] transition-transform` | Main page CTA (e.g. `Register Walk-In`, `Book Consultation`). |
| **Secondary Header** | `h-10 px-3.5 variant="outline" border-border text-muted-foreground hover:text-foreground text-sm shadow-none` | Search, print census, filters. |
| **Table Action (Sm)** | `h-8 px-2.5 text-xs variant="outline"` or `h-8 px-3 variant="default"` | Row-level actions (`Open Chart`, `Collect`, `Assign`). |

### 4.3 Badges & Status Indicators
Always use `variant="outline"` with subtle 10% opacity tints rather than bright opaque blocks:

- **Confirmed / Normal**: `border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400`
- **In Progress / In Consult**: `border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400`
- **Urgent / Warning**: `border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400`
- **STAT / Emergency**: `border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400 font-bold` with `<span className="size-1.5 rounded-full bg-red-500 animate-ping shrink-0" />`
- **Routine / Neutral**: `border-border bg-muted/40 text-muted-foreground`

### 4.4 Typography & Font Hierarchy
- **Page Titles**: `text-3xl font-bold tracking-tight text-foreground`
- **Section / Card Titles**: `text-lg font-semibold tracking-tight text-foreground`
- **Body Text**: `text-sm text-foreground`
- **Muted Text / Labels**: `text-xs text-muted-foreground font-medium`
- **Monospace Codes (MRN, Order #, Room #, Lab Findings)**: `font-mono text-xs text-foreground`

### 4.5 Filter Tabs & Unified Command Toolbar (Strict Rule)
Filter tabs must always use the standard Shadcn `<Tabs>` and `<TabsList>` component with dynamic counts for **every** status/wing tab:

```tsx
<div className="pt-3.5 flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
  {/* Search Bar with ⌘K Badge */}
  <div className="relative flex-1">
    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Filter records..."
      className="pl-10 pr-16 h-10 text-sm border-border bg-background shadow-none focus-visible:ring-1 focus-visible:ring-ring"
    />
    <button
      type="button"
      onClick={() => setIsCommandOpen(true)}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 px-2 py-1 rounded border border-border bg-muted text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      title="Open Command Palette (⌘K)"
    >
      ⌘K
    </button>
  </div>

  {/* Filter Tabs Group with Dynamic Counts */}
  <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap shrink-0">
    <Tabs value={filterValue} onValueChange={setFilterValue} className="w-auto shrink-0">
      <TabsList className="h-10 bg-muted p-1 border border-border">
        <TabsTrigger value="ALL" className="text-sm px-3.5 py-1.5 font-medium">
          All ({totalCount})
        </TabsTrigger>
        <TabsTrigger value="CATEGORY_A" className="text-sm px-3.5 py-1.5 font-medium">
          Active ({countA})
        </TabsTrigger>
        <TabsTrigger value="CATEGORY_B" className="text-sm px-3.5 py-1.5 font-medium">
          Pending ({countB})
        </TabsTrigger>
      </TabsList>
    </Tabs>

    {/* Auxiliary Select Dropdowns */}
    <div className="w-full sm:w-44 shrink-0">
      <Select value={selectValue} onValueChange={setSelectValue}>
        <SelectTrigger className="h-10 text-sm border-border bg-background shadow-none">
          <SelectValue placeholder="All Options" />
        </SelectTrigger>
        ...
      </Select>
    </div>
  </div>
</div>
```

**Toolbar Rules**:
- ❌ Do NOT use custom pill buttons or rounded button strips with inconsistent padding.
- ❌ Do NOT omit count badges from individual filter tabs (every tab must show its count: `All (8)`, `Active (4)`, etc.).
- Always use `h-10` height for inputs, tabs list, and select dropdown triggers.

### 4.6 Clinical Proportions, Row Heights & Spatial Ergonomics (The "Comfortable Scale" Rule)
To prevent pages from feeling cramped, tight, or micro-scaled, all data tables must maintain generous human-readable proportions:

| Element | Specification | Rationale & Strict Rule |
| :--- | :--- | :--- |
| **Table Row Height** | `<TableCell className="py-4">` | Generous 16px vertical padding ensures rows breathe at ~64px height. Never drop to compact `py-2` or `p-2`. |
| **Card Edge Padding** | First cell: `pl-6 py-4`<br>Last cell: `pr-6 py-4` | Prevents table text and action buttons from colliding with the outer card border. |
| **Table Headers** | `<TableHead className="py-3.5 text-sm font-medium text-muted-foreground">` | Matches body text scale and provides clear visual separation. |
| **Patient Identity Avatars** | `h-10 w-10 border border-border text-xs shrink-0` | Standard 40px clinical avatar. Never shrink to `size-8` (32px). |
| **Row Primary Typography** | `font-semibold text-sm text-foreground leading-snug` | Patient names, test names, and consultation reasons must always use `text-sm` (14px). |
| **Row Secondary Metadata** | `font-mono text-xs text-muted-foreground mt-0.5` | MRNs, order IDs, timestamps, and categories must use `text-xs` (12px). |
| **Status Badges** | `text-xs py-1 px-2.5 font-medium` | Badges must remain crisp and readable with standard `text-xs`. Never use micro-badges (`text-[9px]` or `text-[11px]`). |
| **Row Action Buttons** | `h-8 px-3 text-xs font-medium` | Quick row actions (`Call to Room`, `Collect Specimen`, `Input Findings`, `View Chart`). |

### 4.7 Card Grids & Interactive Room Tiles (Preventing Cramped Layouts)
When designing grid-based interfaces (e.g. Hospital Floor Census, Room Occupancy, Bed Trackers):

```tsx
{/* Standard 3-Column Desktop Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="p-5 rounded-xl border border-border bg-card shadow-xs flex flex-col justify-between min-h-[195px]">
    {/* Header: Room # + Status Badge */}
    <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-emerald-500" />
        <span className="font-bold text-sm font-mono text-foreground">Suite 3B</span>
      </div>
      <Badge variant="outline" className="font-mono text-xs uppercase px-2.5 py-0.5 h-6">
        In Use
      </Badge>
    </div>

    {/* Body: Occupant Details */}
    <div className="my-3 space-y-1.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm text-foreground">Eleanor Vance</span>
        <span className="font-mono text-xs text-muted-foreground">MRN-90214</span>
      </div>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Stethoscope className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span>Dr. Sarah Chen, MD</span>
      </div>
    </div>

    {/* Footer Actions */}
    <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2">
      <Button variant="ghost" size="sm" className="h-8 text-xs px-3 text-muted-foreground hover:text-foreground">
        Free Room
      </Button>
      <Button size="sm" className="h-8 text-xs px-3.5 gap-1.5 bg-primary text-primary-foreground">
        <span>Open Chart</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Button>
    </div>
  </div>
</div>
```

**Grid Rules**:
- Standardize on **3 columns on desktop** (`lg:grid-cols-3 gap-4` to `gap-5`). Squeezing into 4 columns (`xl:grid-cols-4`) crunches text and truncates clinical data.
- Tile padding must be generous (`p-5`, `min-h-[195px]`).
- Minimum font size anywhere in a tile is `text-xs` (12px). **Never use `text-[9px]`, `text-[10px]`, or `text-[11px]`**.
- Card action buttons must use standard `h-8 text-xs px-3 font-medium`.

---

## 5. Modal & Dialog Standards
1. **Overlay**: Semi-transparent dark backdrop (`bg-black/80`).
2. **Dialog Container**: `max-w-2xl` or `max-w-3xl` with `bg-card border-border rounded-xl shadow-xl`.
3. **Dialog Header**: Clean title with concise subtitle (`space-y-1.5`), close button top-right.
4. **Form Sections**: Grouped inside light inner panels (`p-4 rounded-lg bg-muted/30 border border-border/60`).
5. **Sticky Action Footer**:
   ```tsx
   <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
     <Button variant="outline" onClick={onClose} className="h-9 px-4 text-xs">
       Cancel
     </Button>
     <Button type="submit" className="h-9 px-4 text-xs font-semibold">
       Confirm & Save
     </Button>
   </div>
   ```
6. **Departmental & Suite Selection in Modals**:
   - In modals where users designate clinical rooms or resources across departments (e.g., *Outpatient Clinic*, *Cardiology & Specialty*, *Diagnostic Laboratory*):
   - Provide Department filter pills with live available count badges (`All Departments (3)`, `Outpatient Clinic (1 Free)`).
   - Render available suites as interactive, clickable clinical cards showing Room Number, Department, Bed/Equipment Type, and emerald "Available" badge.
   - Include instant search for high-density scalability across large clinical directories.
   - Ensure nested popovers or lists isolate wheel events (`onWheel={(e) => e.stopPropagation()}`) for unrestricted mousewheel scrolling.

---

## 6. Layout Flexibility ("Make Unique, Keep the Taste")

When building a new module:
1. **Analyze the clinical workflow**:
   - Outpatient waiting room? -> Roster queue table with status progression tabs.
   - Bed / exam room management? -> Visual wing-grouped room tiles with real-time occupancy meters.
   - Diagnostic analysis? -> Multi-stage specimen tracking with structured analyzer form input.
   - Patient medical record? -> Modal chart drawer with allergy warnings, SOAP history, and medication reconciliation.
2. **Apply identical styling tokens**:
   - Reuse the exact header blueprint (§2).
   - Use the same card borders, subtle background tints, font sizes, and badge styles (§4).
   - Never deviate from the `h-10` button scale for headers.

