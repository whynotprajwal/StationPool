---
name: Metro Flow
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#43474d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  surface-tint: '#476080'
  primary: '#00162d'
  on-primary: '#ffffff'
  primary-container: '#0f2b48'
  on-primary-container: '#7a93b5'
  inverse-primary: '#afc8ed'
  secondary: '#00677d'
  on-secondary: '#ffffff'
  secondary-container: '#63dbfe'
  on-secondary-container: '#005e73'
  tertiary: '#001916'
  on-tertiary: '#ffffff'
  tertiary-container: '#00302b'
  on-tertiary-container: '#29a195'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d2e4ff'
  primary-fixed-dim: '#afc8ed'
  on-primary-fixed: '#001c37'
  on-primary-fixed-variant: '#2f4867'
  secondary-fixed: '#b3ebff'
  secondary-fixed-dim: '#5cd5f8'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5f'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
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
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system serves daily metro commuters, multimodal transit linkers, and shared ride participants across Pune’s urban transit corridor. The brand personality blends institutional reliability with forward-looking urban dynamism: trustworthy, frictionless, civic-minded, and energetic.

The visual direction uses Modern Transit Utility with high tactile polish. Generous pill rounding, high-clarity typography, and crisp white modular surfaces establish a dependable public utility aesthetic. Micro-interactions and status accents mirror real-time navigation dashboards, ensuring commuter confidence during high-stress peak transit hours.

## Colors

The palette balances structural infrastructure tones with luminous transit signals:

- **Primary (`#0F2B48`):** Deep Transit Navy anchors primary branding, major action surfaces, and critical state indicators. A darker shade (`#0B1E36`) serves as the active/pressed state.
- **Secondary (`#00A3C4`):** Pune Metro Aqua Cyan commands focal interactions, route paths, live station badges, and active carpool tracking states.
- **Tertiary (`#0D9488`):** Emerald Green designates verified commuter status, eco-savings, seat confirmation, and on-time schedules.
- **Accent Purple (`#7C3AED`):** Metro Line Multi-modal transfers, fare payment badges, and express pooling markers.
- **Neutrals & Surfaces:** Pure White (`#FFFFFF`) forms the foreground cards and inputs. Off-white canvas (`#F8FAFC`) and container wells (`#F1F5F9`) define structural layers. Borders use slate line work (`#E2E8F0` and `#CBD5E1`).
- **Typography Colors:** Headings and primary copy leverage `#0F172A` and `#1E293B` to exceed WCAG AAA readability on light surfaces; secondary labels utilize `#475569` and `#64748B`.
- **Status Pills:** Tinted soft pastel backgrounds paired with deeply saturated ink:
  - Cyan/Sky: `#F0F9FF` background with `#075985` text.
  - Emerald: `#ECFDF5` background with `#065F46` text.
  - Amber (Alerts/Delays): `#FFFBEB` background with `#92400E` text.
  - Purple (Transfers): `#F5F3FF` background with `#5B21B6` text.

## Typography

Plus Jakarta Sans governs the entire typographic hierarchy. Its rounded terminals and wide apertures guarantee glanceability in outdoor sunlit conditions, moving trains, and fast-paced walking environments.

Numerical values (arrival windows, pricing, seat availability counts) utilize tabular figures to maintain visual alignment across dynamic lists and cards. Display and headline scales adopt tighter tracking to create crisp impact, while body and label styles maintain neutral-to-expanded spacing for quick parsing.

## Layout & Spacing

The layout is built on a responsive 4-column (mobile), 8-column (tablet), and 12-column (desktop) fluid grid system:

- **Mobile (< 768px):** 4 columns with `1rem` margins and `1rem` gutters. Interactive actions maintain a minimum tap target height of 48px to prevent touch errors on crowded transit.
- **Tablet (768px - 1024px):** 8 columns with `2rem` margins and `1.5rem` gutters. Feed elements, journey itineraries, and station maps adopt split horizontal panes.
- **Desktop (> 1024px):** 12 columns with `3rem` margins and `2rem` gutters, contained to a max-width of 1280px for standard viewport balance.

Spacing follows an 8pt spatial cadence. Internal card paddings use `space-lg` (1.5rem) on tablet/desktop and scale down to `space-md` (1rem) on mobile compact screens.

## Elevation & Depth

Visual hierarchy combines clean tonal surfaces, subtle structural borders, and diffuse ambient shadows to avoid heavy, muddy visuals:

- **Surface Layer 0 (Canvas):** Crisp `#F8FAFC`. Completely flat.
- **Surface Layer 1 (Cards & Modules):** Pure `#FFFFFF` framed by a 1px soft border (`#E2E8F0`). Casts an ambient shadow: `0px 4px 16px -2px rgba(15, 43, 72, 0.04), 0px 1px 3px 0px rgba(15, 43, 72, 0.02)`.
- **Surface Layer 2 (Floating Action Bars & Overlays):** `#FFFFFF` with border `#CBD5E1` and elevated ambient shadow: `0px 12px 28px -4px rgba(15, 43, 72, 0.08), 0px 4px 8px -2px rgba(15, 43, 72, 0.04)`.
- **Surface Layer 3 (Modals & Route Sheets):** Supported by a semi-transparent backdrop blur (`rgba(15, 23, 42, 0.4)` with `backdrop-filter: blur(8px)`) and directional shadow: `0px 24px 48px -12px rgba(15, 43, 72, 0.16)`.

## Shapes

The design system incorporates full pill geometries and sweeping 16px to 24px corner radii. This generous curvature reduces visual fatigue and provides tactile, friendly interfaces that contrast cleanly against geometric transit route maps:

- **Full Pill (`9999px`):** Primary buttons, filter pills, search bars, counter badges, and passenger avatars.
- **Large Cards (`rounded-xl` / 24px):** Transit cards, booking summaries, trip itinerary modules, and vehicle profile containers.
- **Medium Panels (`rounded-lg` / 16px):** Nested containers, inner alert blocks, drop-down sheets, and modal viewports.
- **Input Fields (16px - 20px):** Form fields, date-time selectors, and station search controls.

## Components

### Buttons
- **Primary Action:** Solid Deep Navy (`#0F2B48`) background, white text (`#FFFFFF`), full pill shape (`9999px`), 48px height, medium elevation. Hover state shifts to `#0B1E36`.
- **Secondary / Action Cyan:** Solid Aqua Cyan (`#00A3C4`) background, white text (`#FFFFFF`), full pill shape. Active state elevates slightly with a soft cyan glow.
- **Ghost / Outlined:** Transparent background, 1.5px border (`#E2E8F0`), Deep Navy text (`#0F2B48`). Hover transitions to `#F1F5F9`.

### Chips & Badges
- **Status Pills:** Full pill (`9999px`) geometry, 24px to 28px height, `label-md` or `label-sm` weight.
- **Aqua Metro Pill:** Background `#F0F9FF`, text `#075985`.
- **Emerald Eco/Confirmed Pill:** Background `#ECFDF5`, text `#065F46`.
- **Amber Delay/Attention Pill:** Background `#FFFBEB`, text `#92400E`.
- **Purple Line/Interchange Pill:** Background `#F5F3FF`, text `#5B21B6`.

### Cards & Route Itineraries
- **Carpool Card:** `#FFFFFF` background, 24px border radius, 1px border (`#E2E8F0`). Contains trip origin/destination connected via a vertical 2px transit line, departure countdown chip, driver profile thumbnail, and seat availability dots.
- **Station Link Card:** Features an accent left border stripe in Aqua Cyan or Purple, identifying multimodal metro feeder routes.

### Inputs & Station Pickers
- **Search & Text Inputs:** 52px height, 16px radius, background `#F8FAFC`, border 1px solid `#CBD5E1`, text `#0F172A`.
- **Focus State:** Border changes to `#00A3C4` with a 3px ring of `rgba(0, 163, 196, 0.15)`. Background shifts to `#FFFFFF`.

### Checkboxes & Radios
- **Checkbox:** 20px rounded-sm (6px) box with a 1.5px border (`#CBD5E1`). Checked state fills with `#0F2B48` displaying a white check icon.
- **Radio Button:** 20px circular outline. Selected state features a solid `#00A3C4` active dot centered within an inner white margin.

### Ride Seat Selector
- Custom commuter module displaying available/booked seats via circular toggle nodes: empty seats use a 2px dashed cyan outline; filled seats use solid navy with passenger avatars.