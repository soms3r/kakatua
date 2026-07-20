---
name: Kakatua
colors:
  surface: '#fbf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#fbf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f3ef'
  surface-container: '#efeeea'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e4e2de'
  on-surface: '#1b1c1a'
  on-surface-variant: '#42493e'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f0ed'
  outline: '#72796e'
  outline-variant: '#c2c9bb'
  surface-tint: '#3b6934'
  primary: '#154212'
  on-primary: '#ffffff'
  primary-container: '#2d5a27'
  on-primary-container: '#9dd090'
  inverse-primary: '#a1d494'
  secondary: '#7b5800'
  on-secondary: '#ffffff'
  secondary-container: '#fdbb24'
  on-secondary-container: '#6c4d00'
  tertiary: '#6d1d06'
  on-tertiary: '#ffffff'
  tertiary-container: '#8c331b'
  on-tertiary-container: '#ffaf9a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bcf0ae'
  primary-fixed-dim: '#a1d494'
  on-primary-fixed: '#002201'
  on-primary-fixed-variant: '#23501e'
  secondary-fixed: '#ffdea5'
  secondary-fixed-dim: '#fdbb24'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5d4200'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a1'
  on-tertiary-fixed: '#3b0800'
  on-tertiary-fixed-variant: '#7f2a12'
  background: '#fbf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e4e2de'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 16px
  section-gap: 48px
  element-gap: 12px
---

## Brand & Style
The design system is centered around the "Nest" aesthetic—a concept that prioritizes warmth, protection, and organic growth. It targets a mobile-first audience seeking a sanctuary-like digital experience that feels both whimsical and highly professional.

The style is a fusion of **Soft Minimalism** and **Organic Tactility**. By leveraging generous whitespace and "extra-rounded" geometries, the UI mimics the soft curves found in nature. The emotional response should be one of "calm utility"—an interface that breathes, feels unhurried, and provides a safe container for the user's data and interactions.

## Colors
The palette is rooted in a "Sun-drenched Meadow" theme. The primary **Nature Green** (#2D5A27) is deep and trustworthy, used for key actions and brand presence. The secondary **Warm Yellow** (#F4B41A) provides a sunny optimism for highlights, while the **Earthy Terracotta** (#C05A3E) acts as a grounding accent for alerts or specialized status indicators.

Backgrounds must never be pure white; instead, use a soft cream or **Off-white** (#FDFBF7) to reduce eye strain and reinforce the organic, paper-like feel of a nest. Surfaces should use subtle tonal shifts (Sand/Stone) rather than harsh grey dividers.

## Typography
This design system utilizes **Geist** for its exceptional legibility and modern, technical precision, which balances the whimsical nature of the brand with a professional edge. 

Headlines use a tighter letter-spacing and medium-to-bold weights to create a strong visual anchor. Body copy remains airy with generous line-heights (1.5x) to ensure the "unhurried" brand promise is felt during long reading sessions. For mobile-specific views, headlines scale down slightly to prevent awkward line breaks while maintaining hierarchy.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for PWA constraints. On mobile, we use a single-column layout with 24px side margins to create a "framed" effect, making the content feel like it's resting inside a protective shell.

Spacing is intentionally "loose." Rather than packing information, use `section-gap` to isolate different functional areas. The rhythm is based on a 4px baseline, but defaults to larger increments (12px, 24px, 48px) to reinforce the airy, minimalist aesthetic. Content should never feel cramped against the edges of its container.

## Elevation & Depth
Depth is communicated through **Soft, Organic Shadows** rather than stark borders. Shadows should have a large blur radius and low opacity, often tinted with a hint of the Earthy Terracotta or Nature Green to feel like ambient occlusion in a natural environment.

We use **Tonal Layering** to create hierarchy:
- **Level 0 (Base):** Off-white background.
- **Level 1 (Cards):** Pure white or Sand-tinted surfaces with a subtle, diffused shadow.
- **Level 2 (Modals/Popovers):** Higher elevation with a soft backdrop blur (Glassmorphism) to maintain the sense of light passing through the "canopy."

## Shapes
The shape language is the core of the "Nest" identity. Everything follows an **Extra Rounded** philosophy. There are no sharp corners in the design system. Standard components use a minimum of 1rem (16px) radius, while larger containers like cards or main navigation bars use 2xl (24px) or 3xl (32px) radii to evoke the form of a bird's nest or a smoothed river stone.

## Components
Consistent styling across components ensures the "Nest" aesthetic remains cohesive:

- **Buttons:** Fully pill-shaped (rounded-full). The primary button is Nature Green with white text. Hover states should involve a slight "lift" (increased shadow) rather than a drastic color change.
- **Cards:** Use `rounded-3xl` and a subtle 1px border in a slightly darker "Sand" tone. Padding inside cards should be generous (24px+).
- **Input Fields:** Soft sand-colored backgrounds with `rounded-2xl`. Focus states should use a Nature Green glow rather than a sharp outline.
- **Chips/Badges:** Small, pill-shaped elements using low-saturation versions of the brand colors (e.g., a pale terracotta for an alert badge).
- **Lists:** Items should be separated by whitespace and soft "pills" rather than horizontal lines.
- **Navigation (PWA):** A floating bottom navigation bar with a high `backdrop-blur` and a `rounded-full` shape, making it appear to float above the content.
- **Progress Bars:** Thick, rounded bars that use a soft "Wheat" track and a "Nature Green" fill to feel organic.