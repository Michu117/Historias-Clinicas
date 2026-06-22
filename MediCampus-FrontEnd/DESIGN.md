---
name: Clinical Precision
colors:
  surface: '#f9f9ff'
  surface-dim: '#d5dae7'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e9eefc'
  surface-container-high: '#e4e8f6'
  surface-container-highest: '#dee2f0'
  on-surface: '#171c25'
  on-surface-variant: '#424752'
  inverse-surface: '#2b303b'
  inverse-on-surface: '#ecf0fe'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#2d18c7'
  on-tertiary: '#ffffff'
  tertiary-container: '#473ddd'
  on-tertiary-container: '#cdcbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#e2dfff'
  tertiary-fixed-dim: '#c3c0ff'
  on-tertiary-fixed: '#0f0069'
  on-tertiary-fixed-variant: '#3323cc'
  background: '#f9f9ff'
  on-background: '#171c25'
  surface-variant: '#dee2f0'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section-margin: 48px
  gutter: 16px
---

## Brand & Style

The design system is engineered for university health environments, prioritizing clinical precision, high trust, and academic reliability. The aesthetic is rooted in **Modern Minimalism** and **Corporate** structures, ensuring that dense medical data remains legible and accessible. 

By utilizing a restrained color palette and generous whitespace, the UI evokes a sense of calm authority. Every element is designed to minimize cognitive load for practitioners and administrators, emphasizing functional clarity over decorative flair. The emotional response is one of security, efficiency, and professional rigor.

## Colors

This design system utilizes a structured palette to differentiate between clinical actions and administrative metadata.

- **Primary (Deep Clinical Blue):** Reserved for primary calls-to-action, active navigation states, and essential system functions.
- **Secondary (Medical Teal):** Used for supporting components, successful status indicators, and secondary clinical actions.
- **Tertiary (Insight Indigo):** Employed for medical metadata, specialized highlights, and research-oriented data points.
- **Neutral/Text:** High-contrast slate and charcoal tones ensure maximum legibility against the light slate background.
- **Semantic:** Red is strictly reserved for critical errors or urgent medical alerts.

## Typography

The typography relies exclusively on **Inter** to maintain a systematic, utilitarian appearance across all interfaces. 

Headlines use **Bold** or **Semi-bold** weights with tighter letter spacing to create a strong visual anchor for page sections. Body text is set with a **leading-relaxed** line height to ensure comfortable long-form reading of clinical notes and patient histories. Labels use a **Medium** weight to distinguish them from standard body copy, providing clear identification for data fields and metadata.

## Layout & Spacing

The layout is built upon a **12-column fluid grid** designed to adapt to complex data-heavy dashboards.

- **Scale:** An 8px base scale dictates all spatial relationships.
- **Grid:** Columns are separated by 16px gutters, providing sufficient breathing room between data modules.
- **Margins:** Main sections and top-level containers must maintain a 48px margin to preserve the minimalist, clinical feel.
- **Responsiveness:** On mobile devices, the grid collapses to a single column, with section margins reduced to 24px and standard gutters to 12px.

## Elevation & Depth

Visual hierarchy in the design system is established through a combination of tonal layering and subtle shadows:

- **Surface Layering:** The #f9f9ff background acts as the canvas, while #ffffff cards create the primary interaction surface.
- **Card Depth (shadow-sm):** Standard patient records and data cards use a soft, low-blur shadow to lift slightly from the background without creating visual clutter.
- **Overlay Depth (shadow-lg):** Modals, fly-outs, and diagnostic tooltips use a more pronounced, diffused shadow to focus attention and indicate a change in the functional layer.
- **Borders:** A 1px border (#c2c6d4) is used for inputs and container outlines to maintain definition in high-brightness environments.

## Shapes

The shape language differentiates between functional triggers and informational containers:

- **Buttons & Inputs:** Use a 8px (rounded-md) corner radius, balancing professional sharpness with modern approachability.
- **Cards & Large Containers:** Use a 16px (rounded-xl) radius to soften the appearance of large data blocks.
- **Chips & Status Badges:** Utilize a pill-shaped (rounded-full) geometry to immediately distinguish categorized data (e.g., blood types, department tags) from actionable buttons.

## Components

- **Buttons:** Primary buttons use the Deep Clinical Blue background with white text. Secondary buttons utilize a Medical Teal outline or ghost style.
- **Input Fields:** 1px borders in #c2c6d4 that transition to Primary Blue on focus. Labels are positioned above the field in Label-md weight.
- **Cards:** Always white (#ffffff) with a 16px radius and shadow-sm. Headlines within cards should use Headline-md.
- **Chips:** Pill-shaped with a light tint of the Tertiary Indigo or Secondary Teal backgrounds and darkened text for high contrast.
- **Data Lists:** Use subtle 1px dividers between rows. Zebra-striping is avoided in favor of clean whitespace and clear Label-sm headers.
- **Checkboxes & Radios:** Use the Primary Blue for selected states, with an 8px radius for checkboxes to match the button language.