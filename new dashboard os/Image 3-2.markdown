---
name: Ethereal Workspace
colors:
  surface: '#111415'
  surface-dim: '#111415'
  surface-bright: '#373a3b'
  surface-container-lowest: '#0c0f10'
  surface-container-low: '#191c1d'
  surface-container: '#1d2021'
  surface-container-high: '#272a2b'
  surface-container-highest: '#323536'
  on-surface: '#e1e3e4'
  on-surface-variant: '#ddc1ae'
  inverse-surface: '#e1e3e4'
  inverse-on-surface: '#2e3132'
  outline: '#a58c7b'
  outline-variant: '#564334'
  surface-tint: '#ffb77f'
  primary: '#ffb77f'
  on-primary: '#4e2600'
  primary-container: '#ff8a00'
  on-primary-container: '#613100'
  inverse-primary: '#914c00'
  secondary: '#adc6ff'
  on-secondary: '#002e6a'
  secondary-container: '#0566d9'
  on-secondary-container: '#e6ecff'
  tertiary: '#d0bcff'
  on-tertiary: '#3c0091'
  tertiary-container: '#b698ff'
  on-tertiary-container: '#4b00b3'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc4'
  primary-fixed-dim: '#ffb77f'
  on-primary-fixed: '#2f1500'
  on-primary-fixed-variant: '#6f3900'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#111415'
  on-background: '#e1e3e4'
  surface-variant: '#323536'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1280px
  gutter: 24px
  margin-page: 40px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style

This design system is defined by **Sophisticated Glassmorphism** and a high-end editorial feel. It targets career-driven professionals who seek a workspace that feels like a premium digital atelier rather than a utility tool. The personality is ambitious, precise, and cinematic.

The visual direction combines the depth of layered frosted glass with the high-contrast impact of modern brutalist typography. The aesthetic relies on dark-mode immersion, using light to guide the eye through subtle glows and ultra-sharp borders. Every interaction should feel fluid and "expensive," utilizing depth and motion to reward user input.

## Colors

The palette is rooted in a deep `zinc-950` (#09090b) base to provide maximum contrast for glass effects. The brand accent is a vibrant **Solar Orange** (#FF8A00), used sparingly for high-priority calls to action and "Upgrade" flows.

To create the "WOW" factor, the background features smooth, large-scale mesh gradients using **Electric Blue** (#3B82F6) and **Deep Violet** (#8B5CF6). These are not background colors but "light sources" positioned at the edges of the viewport to create a sense of three-dimensional space. Neutral tones are kept cool and desaturated (#999D9E) to maintain the premium dark-mode aesthetic.

## Typography

This design system utilizes **Plus Jakarta Sans** across all levels to achieve a clean, contemporary editorial look. Headlines are set with tight tracking and significant weight to create a "bold-hero" impact against the dark background. 

Secondary information and meta-data use the uppercase label style to establish a clear hierarchy. Body text is prioritized for legibility with generous line heights, ensuring that even within semi-transparent glass containers, content remains effortless to read.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy for desktop, centering the workspace within a 1280px container to maintain an intentional, gallery-like presentation. A 12-column system is used with 24px gutters.

Spacing is generous to allow the background gradients to breathe. Elements are grouped in "islands" rather than edge-to-edge blocks, emphasizing the glassmorphic nature of the components floating over the background mesh. Internal padding within glass cards should be no less than 32px to reinforce the premium feel.

## Elevation & Depth

Depth is the cornerstone of this system. It is achieved through three specific layers:
1.  **The Void:** The base dark layer with ambient mesh glows.
2.  **The Glass:** Semi-transparent surfaces (Background Blur: 20px-40px) with a fill of white at 2-5% opacity.
3.  **The Edge:** Every glass surface must have a 1px solid border at `rgba(255, 255, 255, 0.1)`. This creates the sharp, "machined" look of the Phenomenon Studio aesthetic.

Shadows are used sparingly; instead of black shadows, use "Outer Glows" that inherit the color of the background mesh gradient beneath them to simulate light passing through the glass.

## Shapes

The shape language is sophisticated and modern, using **Rounded** (0.5rem base) geometry. Larger containers and cards utilize the `rounded-xl` (1.5rem) setting to feel approachable yet structured. Buttons should use high roundedness (full pill) to contrast against the more architectural squareness of the workspace panels.

## Components

### Buttons
- **Primary:** Solid #FF8A00 with black text. On hover, a white inner-glow (stroke) appears.
- **Glass/Secondary:** Transparent background with a 1px white/0.1 border. On hover, the background opacity increases to 10% and the border brightens.

### Cards & Workspaces
All cards must use `backdrop-filter: blur(24px)`. They should not have a visible background color other than a faint white tint. Use a subtle inner-shadow (top-down) to suggest thickness.

### Inputs
Input fields are "Ghost" style. They have no background fill until focused. On focus, the 1px border transitions from white/0.1 to a gradient stroke (Primary to Secondary color).

### Micro-interactions
- **Glow-track:** Borders of cards should subtly "light up" as the cursor passes nearby.
- **Fluid Elevation:** Cards should scale by 1.01% on hover with a transition-timing-function of `cubic-bezier(0.4, 0, 0.2, 1)`.

### Premium Accents
High-priority sections (like "Upgrade to Pro") should use a linear gradient border and a very subtle `box-shadow` that matches the brand's orange accent color to simulate a neon-like radiance.