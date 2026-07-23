---
name: Clinical Intelligence Framework
colors:
  surface: '#f6faf9'
  surface-dim: '#d7dbda'
  surface-bright: '#f6faf9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f4f3'
  surface-container: '#ebefee'
  surface-container-high: '#e5e9e8'
  surface-container-highest: '#dfe3e2'
  on-surface: '#181c1c'
  on-surface-variant: '#3e4948'
  inverse-surface: '#2c3131'
  inverse-on-surface: '#edf2f0'
  outline: '#6e7978'
  outline-variant: '#bdc9c8'
  surface-tint: '#006a68'
  primary: '#006766'
  on-primary: '#ffffff'
  primary-container: '#0a8280'
  on-primary-container: '#f3fffe'
  inverse-primary: '#77d6d3'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#595c5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#727577'
  on-tertiary-container: '#fbfdff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f2f0'
  primary-fixed-dim: '#77d6d3'
  on-primary-fixed: '#00201f'
  on-primary-fixed-variant: '#00504e'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f6faf9'
  on-background: '#181c1c'
  surface-variant: '#dfe3e2'
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

The aesthetic follows a **Corporate / Modern** approach with a strong emphasis on functional minimalism. It utilizes a systematic architecture to organize complex medical data—ranging from patient histories to diagnostic analytics—ensuring that the interface feels reliable and calm under pressure. The emotional response is one of controlled efficiency and absolute trust.

## Colors

The palette is optimized for WCAG AA compliance, ensuring high legibility for practitioners across various lighting conditions. 

- **Primary Teal (#319795):** Reserved for primary calls to action, active states, and successful clinical outcomes.
- **Carbono (#0f172a):** Used for primary headings and body text to ensure maximum contrast against the neutral background.
- **Surface (#f8fafc):** A soft, cool neutral used for page backgrounds to reduce eye strain during long shifts.
- **Specialty Accents:** These colors are used purposefully to categorize data. Use these for sidebar indicators, status chips, or specialty-specific headers to provide instant context switching between Odontology, Psychology, and Social Work modules.

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

To maintain a clean, clinical appearance, this design system avoids heavy shadows. Instead, it utilizes **Tonal Layers** and **Low-contrast outlines**.

- **Level 0 (Background):** Surface (#f8fafc).
- **Level 1 (Cards/Containers):** White (#ffffff) with a 1px border in a subtle neutral grey (#e2e8f0).
- **Level 2 (Active/Interactive):** A very soft, diffused ambient shadow (0px 4px 12px rgba(15, 23, 42, 0.05)) is applied only to floating elements like dropdowns, modals, and tooltips.

This hierarchy ensures that the "Clinical Workspace" feels flat and stable, while interactive overlays clearly sit above the primary data layer.

## Shapes

The shape language is disciplined and consistent. A base roundedness of **0.5rem (8px)** is applied to all primary containers, buttons, and input fields.

- **Standard Elements:** 8px radius (Buttons, Inputs, Cards).
- **Large Elements:** 16px radius (Modals, Large Section Wrappers).
- **Small Elements:** 4px radius (Checkboxes, Tags, Status Indicators).

This moderate rounding strikes a balance between the "hardness" of a traditional database and the "softness" of modern user-centric applications, resulting in a professional yet approachable tool.

## Components

- **Buttons:** Primary buttons use the Teal background with White text. Secondary buttons use a White background with a 1px border of Teal. Minimum height for touch targets is 44px.
- **Input Fields:** Use a solid 1px border (#cbd5e1). Upon focus, the border shifts to Primary Teal with a 2px outer glow. Labels are always visible above the field (never floating).
- **Chips & Tags:** Used for medical specialties. These utilize a light tint of the specialty color (e.g., 10% opacity Sky Blue) with high-contrast text of the same hue to denote the department.
- **Cards:** All patient data is housed in White cards with an 8px radius and a 1px neutral border. Use consistent header padding (16px) for card titles.
- **Lists & Tables:** Use "Zebra striping" for large data tables using the Surface color for even rows. Hover states on rows must use a subtle highlight to prevent "line-skipping" when reading diagnostic data.
- **Status Indicators:** Use standardized semantic colors—Success (Teal), Warning (Amber), and Alert (Red)—specifically for critical lab values or overdue appointments.