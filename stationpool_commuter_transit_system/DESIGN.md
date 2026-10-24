---
name: StationPool Commuter Transit System
colors:
  surface: '#031427'
  surface-dim: '#031427'
  surface-bright: '#2a3a4f'
  surface-container-lowest: '#000f21'
  surface-container-low: '#0b1c30'
  surface-container: '#102034'
  surface-container-high: '#1b2b3f'
  surface-container-highest: '#26364a'
  on-surface: '#d3e4fe'
  on-surface-variant: '#c5c6ce'
  inverse-surface: '#d3e4fe'
  inverse-on-surface: '#213145'
  outline: '#8f9098'
  outline-variant: '#44474d'
  surface-tint: '#b8c7e6'
  primary: '#b8c7e6'
  on-primary: '#223149'
  primary-container: '#0f1e36'
  on-primary-container: '#7886a3'
  inverse-primary: '#515f7a'
  secondary: '#94ccff'
  on-secondary: '#003352'
  secondary-container: '#0378b7'
  on-secondary-container: '#f5f8ff'
  tertiary: '#4edea3'
  on-tertiary: '#003824'
  tertiary-container: '#002416'
  on-tertiary-container: '#009969'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d7e3ff'
  primary-fixed-dim: '#b8c7e6'
  on-primary-fixed: '#0c1b33'
  on-primary-fixed-variant: '#394761'
  secondary-fixed: '#cde5ff'
  secondary-fixed-dim: '#94ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004b74'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#031427'
  on-background: '#d3e4fe'
  surface-variant: '#26364a'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-numeric-lg:
    fontFamily: JetBrains Mono
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: 0.02em
  label-numeric-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-numeric-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.04em
  label-ui:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-xxl: 2rem
---

## Brand & Style

This design system establishes a high-precision, utilitarian, and dependable commuter mobility aesthetic tailored specifically to urban metro riders in Pune. It bridges the urgency and real-time clarity of rapid transit network displays with the personal approachability and safety demanded by peer-to-peer car and two-wheeler pooling.

### Visual Style: Modern Transit-Tech
- **Clarity over Ornamentation:** Visual hierarchies prioritize legibility in high-glare outdoor environments (e.g., station exits, dynamic pick-up bays under flyovers).
- **Tactile Trust & Safety:** Verified badges, clear rider tiers, structural card divisions, and high-visibility state chips provide psychological reassurance for women riders, corporate commuters, and first-time carpoolers.
- **Urban Motion Accents:** Micro-interactions emphasize directional momentum, live ETA progress, and immediate station gate identification without visual noise.

## Colors

The palette directly reflects the functional realities of Pune’s multi-modal transit corridors: deep navy for systemic authority, electric transit blues for active wayfinding, Pune Metro line signifiers for spatial context, and high-contrast status accents. Set in a dark color mode optimized for low-light commuting and high-contrast night visibility.

### Core Functional Palette
- **Deep Metro Navy (`#0F1E36`, `#1A2B4C`):** Foundational anchor for primary brand surfaces, high-emphasis text, top app headers, and terminal navigation elements.
- **Electric Transit Blue (`#0077B6`, `#0096C7`):** Primary action surface, active route segments, progress gauges, and real-time radar rings.
- **Confirmed Mint (`#10B981`):** High-priority confirmation color reserved for matched rides, cost-savings metrics, verified employee/rider badges, and instant payouts.
- **Pune Interchange Orange (`#F97316`):** Dedicated to Metro interchange hubs (Civil Court, Swargate), quick-transfer notifications, and punctuality warnings.

### Transit Line Accents
- **Line 1 Purple (`#7C3AED`):** PCMC ⇄ Swargate route indicators and dedicated corridor tags.
- **Line 2 Aqua (`#06B6D4`):** Vanaz ⇄ Ramwadi route tags and feeder match chips.
- **Line 3 Hinjawadi IT Line (`#E11D48`):** Direct tech-park express carpool badges.

### Surface Neutrals
- **Canvas Base (`#0B132B`):** Primary dark app background reducing glare while commuting.
- **Card Surface (`#111E38`):** High-clarity elevated containers.
- **Subtle Stroke/Divider (`#1E293B`):** Defines clean containment boundaries across route timelines.
- **Muted Fill (`#172554`):** Input containers, inactive chips, and pick-up landmark backgrounds.

## Typography

The type hierarchy employs **Plus Jakarta Sans** for interface flow and structural content, ensuring instant legibility under motion. For all critical numerical data—such as OTP ride-start codes, departure countdowns, rupee fare breakdowns, and metro pier identification numbers—**JetBrains Mono** is specified to enforce tabular alignment and zero character confusion (e.g., distinguishing `0` from `O`, `1` from `I`).

### Usage Directives
- **Fares & Financial Split:** Always render with `label-numeric-md` or `label-numeric-lg`, preceded by the Indian Rupee symbol `₹`.
- **OTP Start Codes:** Render with `label-numeric-lg` with `0.15em` tracked spacing inside high-contrast badge containers.
- **Station Names & Gate Designations:** Use `headline-sm` with upper case styling only for gate indicators (e.g., `GATE 2`, `PIER 14`).

## Layout & Spacing

This design system uses an 8pt base grid with a 4pt sub-grid for dense transit-line schedules and micro-labels. Layout density is compact yet breathable, matching handheld transit usage where thumb access is paramount.

### Breakpoints & Adaptive Model
- **Mobile Handheld (320px – 480px):** Single-column fluid stack. Fixed bottom sheet for live matching radar and immediate call-to-actions. Outer margins set to `margin` (16px).
- **Tablet / In-Cab Display (481px – 1024px):** Split dual-pane view: sticky station map/radar on the left (55%), pool listings and queue status on the right (45%). Canvas margins scale to `margin-tablet` (24px).
- **Desktop Transit Dashboard (> 1024px):** Centered max-width of 1200px utilizing a 12-column layout with 24px gutters for administrative transit coordinators and corporate pool dashboards.

## Elevation & Depth

Visual depth reinforces layer separation between the static base map, floating route elements, and dynamic bottom cards against dark mode surfaces.

### Layer Hierarchy
- **Level 0 (Floor):** Base map and station route layout tiles (`#0B132B`). Flat with no cast shadow.
- **Level 1 (Transit Cards):** Elevated pooling cards and metro ticket summaries. Standard border `1px solid #1E293B`, surface `#111E38`, accompanied by an ambient, low-contrast shadow: `0 2px 4px -1px rgba(0, 0, 0, 0.4), 0 4px 6px -1px rgba(0, 0, 0, 0.3)`.
- **Level 2 (Active Pick-up Drawers & Floating Controls):** Bottom booking sheets and floating SOS buttons. Elevated with: `0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4)`.
- **Level 3 (Modal Alerts & QR Validation):** High-priority verification layers and safety alerts. Crisp separation using `0 20px 25px -5px rgba(0, 0, 0, 0.6)`.

## Shapes

The interface balances sharp industrial navigation precision with comfortable organic contact surfaces using standard rounded scaling.

- **Base Radius (8px / 0.5rem):** Standard interactive surfaces including pool matching cards, input fields, and metro timeline step nodes.
- **Large Radius (16px / 1rem):** Bottom sheets, modal dialogues, and metro ticket containers.
- **Pill Radius (Full / 9999px):** Live matching radar status badges, OTP confirmation tags, vehicle priority indicators, and floating SOS triggers.

## Components

### 1. Ride-Type Priority Cards
- **Bike & Scooter 1st Priority Card:** Compact vertical footprint. Includes high-visibility helmet badge (`#0077B6` tint), prominent `1 Seat` tag, fast-exit warning indicator, and vehicle registration sub-label in monospace.
- **Carpool Card:** Highlights `Seats Left` with dynamic dot indicators (green for available, neutral for occupied). Displays comfort traits (AC status, trunk space for station luggage) via compact icon-text pairs.

### 2. Station Gate & Landmark Chips
- Stylized contextual anchors (e.g., `Pune Station Gate 2 Auto/Bike Bay`, `Civil Court Interchange Pier 4`).
- Uses `#172554` background, `#E2E8F0` text, an integrated transit map pin, and an orange or purple accent dot indicating the corresponding Metro Line connection.

### 3. Dynamic Live Matching Radar Pill
- Persistent floating capsule displaying dynamic radar ripple animation.
- Includes match count: `Scanning Line 1 Commuters... (3 nearby)`.
- Tapping expands directly to instant pool options.

### 4. OTP Ride-Start Badge
- High-contrast Navy (`#0F1E36`) background with crisp white mono-spaced numbers.
- Integrated safety label: `Share only after boarding vehicle`.

### 5. Metro Ticket Integration Card
- Dual-state container: Top half displays P2P pool pickup details; bottom half embeds active Pune Metro QR token with live countdown validity timer.
- Perforated border separator styled with radial punch-outs on lateral card edges.

### 6. Fare Breakdown & Cost-Sharing Summary
- Tabular row list showing distance-based metric calculations.
- Highlights `StationPool Savings` in Mint (`#10B981`) text against standard auto-rickshaw/cab baseline fares.

### 7. Floating SOS/Emergency Action Button
- Placed in the lower-right thumb zone during active trips.
- Saturated red (`#EF4444`) with high-contrast white shield/alert icon. Immediate one-tap access to Pune Police transit helpline and pre-configured emergency contacts.