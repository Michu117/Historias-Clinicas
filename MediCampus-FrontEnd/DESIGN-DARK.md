---
name: Clinical Intelligence Framework (Dark Mode)
colors:
  surface: '#1e1e20'
  surface-dim: '#121214'
  surface-bright: '#2a2a2e'
  surface-container-lowest: '#121214'
  surface-container-low: '#121214'
  surface-container: '#121214'
  surface-container-high: '#1e1e20'
  surface-container-highest: '#2a2a2e'
  on-surface: '#e3e3e6'
  on-surface-variant: '#8e8e93'
  inverse-surface: '#f6faf9'
  inverse-on-surface: '#181c1c'
  outline: '#2c2c30'
  outline-variant: '#2c2c30'
  surface-tint: '#319795'
  primary: '#319795'
  on-primary: '#ffffff'
  primary-container: '#134e4a'
  on-primary-container: '#ccfbf1'
  inverse-primary: '#006766'
  secondary: '#8e8e93'
  on-secondary: '#121214'
  secondary-container: '#1e1e20'
  on-secondary-container: '#e3e3e6'
  tertiary: '#8e8e93'
  on-tertiary: '#121214'
  tertiary-container: '#2a2a2e'
  on-tertiary-container: '#e3e3e6'
  error: '#f87171'
  on-error: '#121214'
  error-container: '#3b1a1a'
  on-error-container: '#fca5a5'
  primary-fixed: '#ccfbf1'
  primary-fixed-dim: '#99f6e4'
  on-primary-fixed: '#004d40'
  on-primary-fixed-variant: '#00796b'
  secondary-fixed: '#e3e3e6'
  secondary-fixed-dim: '#8e8e93'
  on-secondary-fixed: '#121214'
  on-secondary-fixed-variant: '#1e1e20'
  tertiary-fixed: '#e3e3e6'
  tertiary-fixed-dim: '#8e8e93'
  on-tertiary-fixed: '#121214'
  on-tertiary-fixed-variant: '#1e1e20'
  background: '#121214'
  on-background: '#e3e3e6'
  surface-variant: '#1e1e20'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style

The design system is engineered for high-stakes medical environments where cognitive clarity and precision are paramount. The brand personality is professional, authoritative, and clinical, removing all unnecessary visual noise to focus on data density and actionable insights.

The aesthetic follows a **Corporate / Modern** approach with a strong emphasis on functional minimalism. It utilizes a systematic architecture to organize complex medical data—ranging from patient histories to diagnostic analytics—ensuring that the interface feels reliable, calm, and glare-free under low-light high-pressure conditions.

## Colors

The palette is optimized for WCAG AA compliance, ensuring high legibility for practitioners across various lighting conditions, specifically targeting dark environments to reduce fatigue.

- **Primary Teal (#319795):** Reserved for primary calls to action, active states, and successful clinical outcomes.
- **Texto Principal (#f8fafc):** High-contrast cool white used for primary headings and body text to ensure maximum readability against dark surfaces.
- **Fondo / Background (#0f172a):** A deep, dark carbon-slate neutral used for page backgrounds to prevent screen glare during night shifts.
- **Specialty Accents:** Used purposefully to categorize data. Lightened tints with high saturation are applied to headers, tags, and status indicators to maintain semantic meaning without causing visual vibrations.

## Typography

This design system utilizes **Inter** exclusively to leverage its systematic, utilitarian nature. The typeface was selected for its exceptional legibility in small sizes, particularly critical for medical dosage instructions and laboratory results.

- **Scale:** A tight modular scale is used to maintain high information density without sacrificing readability.
- **Weight:** Use Semibold (600) and Bold (700) for clinical headings to establish a clear hierarchy. Regular (400) is used for all patient data entry and notes.
- **Labels:** Micro-copy and data labels should use `label-md` with uppercase styling to differentiate headers from user-generated content.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop to ensure data visualizations and patient charts remain consistent and predictable.

- **Desktop (1440px+):** A 12-column grid with a max-width of 1360px, 20px gutters, and 40px side margins.
- **Tablet (768px - 1439px):** An 8-column fluid grid with 16px gutters. Sidebars should be collapsible to maximize the workspace.
- **Mobile (<767px):** A 4-column fluid grid. Data-heavy tables should transition to card-based layouts or use horizontal scrolling with pinned key columns.

Spacing follows a 4px base unit. Use 16px (`md`) for standard component spacing and 24px (`lg`) for section separation to provide visual breathing room in complex forms.

## Elevation & Depth

To maintain a clean, clinical appearance, this design system avoids heavy shadows, which are poorly visible on dark backgrounds. Instead, it utilizes **Tonal Layers** (making higher elements progressively lighter).

- **Level 0 (Background):** Fondo (#0f172a).
- **Level 1 (Cards/Containers):** Dark Slate (#1e293b) with a 1px border in a subtle dark neutral grey (#334155).
- **Level 2 (Active/Interactive):** Medium Slate (#334155). A soft, dark ambient shadow (0px 4px 12px rgba(0, 0, 0, 0.5)) is applied only to floating elements like dropdowns, modals, and tooltips to clearly separate them from the workspace.

## Shapes

The shape language is disciplined and consistent. A base roundedness of **0.5rem (8px)** is applied to all primary containers, buttons, and input fields.

- **Standard Elements:** 8px radius (Buttons, Inputs, Cards).
- **Large Elements:** 16px radius (Modals, Large Section Wrappers).
- **Small Elements:** 4px radius (Checkboxes, Tags, Status Indicators).

## Components

- **Buttons:** Primary buttons use the Teal background with White text. Secondary buttons use a transparent background with a 1px border of Teal and Teal text. Minimum height for touch targets is 44px.
- **Input Fields:** Use a solid 1px dark border (#475569) with a background of #1e293b. Upon focus, the border shifts to Primary Teal with a 2px outer glow. Labels are always visible above the field (never floating).
- **Chips & Tags:** Used for medical specialties. These utilize a dark tint of the specialty color (e.g., 20% opacity dark teal) with vibrant, desaturated high-contrast text of the same hue to ensure legibility.
- **Cards:** All patient data is housed in Dark Slate cards (#1e293b) with an 8px radius and a 1px border (#334155).
- **Lists & Tables:** Use "Zebra striping" for large data tables using the alternate container color (#0f172a) for even rows. Hover states on rows must use a subtle highlight highlight (#334155) to prevent "line-skipping".
- **Status Indicators:** Use standardized semantic colors calibrated for dark themes—Success (Teal), Warning (Amber/Orange), and Alert (Soft Red)—specifically for critical lab values or overdue appointments.