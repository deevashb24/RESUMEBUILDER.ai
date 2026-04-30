---
name: Luminal Resume
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c1c6d7'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8b90a0'
  outline-variant: '#414754'
  surface-tint: '#aec6ff'
  primary: '#aec6ff'
  on-primary: '#002e6b'
  primary-container: '#0070f3'
  on-primary-container: '#ffffff'
  inverse-primary: '#0059c5'
  secondary: '#dbb8ff'
  on-secondary: '#470083'
  secondary-container: '#6807ba'
  on-secondary-container: '#d0a6ff'
  tertiary: '#00ddd6'
  on-tertiary: '#003735'
  tertiary-container: '#008480'
  on-tertiary-container: '#fefffe'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004397'
  secondary-fixed: '#efdbff'
  secondary-fixed-dim: '#dbb8ff'
  on-secondary-fixed: '#2b0052'
  on-secondary-fixed-variant: '#6600b7'
  tertiary-fixed: '#47faf3'
  tertiary-fixed-dim: '#00ddd6'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504d'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
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
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

The design system is engineered to evoke the feeling of a sophisticated, high-performance AI lab. It targets career-driven professionals who value innovation and precision. The aesthetic movement is **Glassmorphism with a Tech-Noir influence**, utilizing deep, immersive backgrounds to allow vibrant, glowing accents to pop.

The interface prioritizes a sense of "intelligence behind the screen." This is achieved through translucent layers that suggest depth, subtle motion blurs, and hyper-clean layouts that eliminate clutter. The personality is authoritative yet visionary, positioning the resume-building process not as a chore, but as a strategic career upgrade powered by cutting-edge technology.

## Colors

The palette is anchored in a dark-mode-first architecture to create a premium, futuristic atmosphere.

*   **Primary (Electric Blue):** Used for primary actions, progress indicators, and "AI-active" states.
*   **Secondary (Deep Purple):** Applied to accents, hover states, and premium features to add depth and a "computational" feel.
*   **Tertiary (Cyan):** Reserved for data visualization, success states, and subtle highlights.
*   **Neutrals:** The background stack utilizes `#020617` (Deep Navy) for the base layer and `#0f172a` for elevated surfaces, ensuring high contrast with the neon accents.
*   **Gradients:** Use linear gradients (e.g., Electric Blue to Deep Purple) at 135 degrees for hero elements and primary buttons to signify energy and movement.

## Typography

The typography strategy balances high-tech flair with absolute legibility. **Plus Jakarta Sans** is used for headlines to provide a modern, slightly geometric character that feels approachable yet professional. **Inter** is utilized for all functional text, body copy, and UI labels due to its exceptional clarity on screens and its neutral, systematic nature.

For resume content within the editor, maintain a strictly hierarchical structure to help users visualize the final print document. Use high contrast (White on Deep Navy) for primary text and reduced opacity (60-70% White) for secondary descriptions and metadata.

## Layout & Spacing

This design system employs a **12-column fluid grid** for dashboard views and a **centered fixed-width container** for the resume editor and landing pages. 

The spacing rhythm is based on an 8px scale. Generous whitespace is critical to maintaining the "Modern Minimalist" feel. Margins between major sections should be 80px (xl) or 48px (lg) to allow the glassmorphic layers to breathe. Use tight 12px (sm) or 8px (base) padding within cards and chips to maintain a compact, data-rich environment where necessary.

## Elevation & Depth

Depth is established through **Backdrop Blurs** and **Glows** rather than traditional shadows.

1.  **Base Layer:** Solid Deep Navy (`#020617`).
2.  **Middleground (Cards/Modals):** Surface Navy (`#0f172a`) with a 10% opacity and a 12px-20px backdrop blur.
3.  **Borders:** 1px solid borders using 20% opacity white or primary blue to define edges without adding visual weight.
4.  **Glowing Accents:** Use "Inner Glows" (box-shadow inset) on active elements and "Outer Glows" (drop-shadow with high blur/low opacity) on primary action buttons to simulate an emissive light source.

## Shapes

The shape language is characterized by **Refined Curvature**. A 0.5rem (8px) base radius is used for standard components, providing a professional balance between sharp technology and human-centric design.

*   **Standard Cards/Buttons:** 0.5rem (8px).
*   **Large Containers/Modals:** 1rem (16px).
*   **Input Fields:** 0.5rem (8px).
*   **Pill Elements (Status/Chips):** Full rounding for high-contrast differentiation from structural elements.

Avoid completely sharp 0px corners to prevent the UI from feeling dated or overly aggressive.

## Components

*   **Buttons:** Primary buttons use a vibrant gradient fill (Electric Blue to Deep Purple) with a subtle outer glow. Ghost buttons use a 1px border of the primary color with a 5% background tint on hover.
*   **Glass Cards:** Semi-transparent containers with a `backdrop-filter: blur(12px)`. Apply a top-down linear gradient border (White 20% to Transparent) to simulate light catching the top edge.
*   **Input Fields:** Deep navy background with a subtle 1px border. On focus, the border glows Electric Blue, and a very soft cyan drop-shadow is applied.
*   **Progress Indicators:** Use the Tertiary Cyan color with a "pulse" animation to signify AI processing or data generation.
*   **Chips & Tags:** Small, pill-shaped elements with low-opacity purple backgrounds and high-saturation purple text for skills and keywords.
*   **AI Suggestion Toast:** A special component with a Cyan-to-Blue gradient border and an icon that subtly rotates or pulses, indicating real-time intelligence.