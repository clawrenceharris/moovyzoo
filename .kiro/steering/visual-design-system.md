---
inclusion: fileMatch

fileMatch: "src/components/**/*.tsx"
fileMatch: "src/features/**/components/*.tsx"
fileMatch: "*.css"

---

# Visual Design System – Zoovie

_Modern, sleek design for young adults with the cinematic elegance of Netflix, the community-based immersivenes of Discord and the spontaneous fun of Snapchat_

## Brand Identity & Visual Direction

### Core Brand Personality

- **Sophisticated**: Polished, cinematic design inspired by streaming platforms
- **Playful**: Fun, vibrant accents that create a welcoming, social vibe
- **Youth-oriented**: Targeted for ages 20–35, blending pop culture with sleek interfaces
- **Immersive**: Encourages exploration, shared experiences, and interaction

### Visual Metaphors

- **Cinematic screens**: Dark backgrounds and vibrant accents mimicking a movie theater
- **Social sparks**: Bright pops of color representing conversation and excitement
- **Card-based interactions**: Swipeable and tappable UI for movies, chats, and games
- **Party mode visuals**: Motion accents and glow effects for watch parties and game events

### Target Aesthetic: "Netflix meets Snapchat"

- **Netflix influence**: Minimalist layouts, bold typography, cinematic imagery
- **Snapchat influence**: Bright playful accents, animated interactions, social-first design
- **Hybrid experience**: Professional polish with spontaneous, fun UI elements
- **Trust factor**: Clean layouts and thoughtful spacing keep it usable and comfortable

## Dark-First Color System

### Primary Palette

```css
--primary: #DA0B0B; /* Cinematic red for CTAs and highlights */
```

### Dark Theme Foundation

```css
--dark-bg-primary: #0a0a0a; /* Theater black */
--dark-bg-secondary: #141414; /* Netflix card gray */
--dark-bg-tertiary: #1f1f1f; /* Elevated surfaces */
--dark-bg-glass: rgba(20, 20, 20, 0.8); /* Glass overlay */
```

### Accent Colors

```css
--accent: #00d4ff; /* Electric social highlight */
--accent-yellow: #facc15; /* Playful spotlight */
--accent-pink: #ec4899; /* Social likes and reactions */
```

## Typography

### Font Stack

```css
font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

- **Headings**: Bold, cinematic sizes for key screens
- **Body**: Clean, easy-to-read for chat and descriptions
- **Labels**: Medium weight for UI clarity

## Motion & Interaction

### Animation Philosophy

- Smooth, cinematic transitions for page changes
- Playful bounce/glow for social interactions
- Hover and tap feedback for all interactive elements

### Example Animations

```css
@keyframes glowPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 212, 255, 0);
  }
}
```

## Component Patterns

### Cards

- Dark backgrounds with subtle shadows
- Rounded corners (1rem default)
- Glow + scale on hover for interactivity

### Buttons

- **Primary**: Cinematic red
- **Secondary**: Glassmorphism background for subtlety
- **Accent**: Bright playful colors for social features

### Forms

- Rounded, glass-style inputs
- Clear focus states in accent cyan

## Accessibility

- High-contrast text for all primary interactions
- Minimum WCAG AA compliance for color contrast

## Quality Checklist

Before shipping any UI component:

- [ ] Works in dark mode (default) and light mode (optional)
- [ ] Feels both sleek and fun
- [ ] Animations enhance, not distract
- [ ] Clear visual hierarchy for navigation
- [ ] Responsive for mobile-first experience
