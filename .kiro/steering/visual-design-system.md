---
inclusion: fileMatch

fileMatch: "src/components/**/*.tsx"
fileMatch: "src/features/**/components/*.tsx"
fileMatch: "*.css"
fileMatch: "page.tsx"


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
--primary: #da0b0b; /* Cinematic red for CTAs and highlights */
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
--accent-green: #10b981; /* Success states and positive actions */
--accent-purple: #8b5cf6; /* Premium features and special content */
```

### Gradient Combinations

```css
--gradient-primary: linear-gradient(135deg, #da0b0b 0%, #ff4444 100%);
--gradient-social: linear-gradient(135deg, #00d4ff 0%, #0ea5e9 100%);
--gradient-card: linear-gradient(135deg, #1f1f1f 0%, #2a2a2a 100%);
--gradient-glass: linear-gradient(
  135deg,
  rgba(255, 255, 255, 0.1) 0%,
  rgba(255, 255, 255, 0.05) 100%
);
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

### Essential Animations

```css
/* Social media-inspired glow pulse for CTAs */
@keyframes glowPulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 212, 255, 0);
  }
}

/* Floating label animation (Instagram-style) */
@keyframes floatLabel {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.7;
  }
  100% {
    transform: translateY(-20px) scale(0.85);
    opacity: 1;
  }
}

/* Micro bounce for social interactions */
@keyframes socialBounce {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Cinematic card hover */
@keyframes cardHover {
  0% {
    transform: scale(1) translateY(0);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  100% {
    transform: scale(1.02) translateY(-2px);
    box-shadow: 0 8px 24px rgba(218, 11, 11, 0.2);
  }
}
```

### Interaction States

- **Hover**: Scale (1.02), glow, color shift (0.2s ease)
- **Active**: Scale (0.98), brightness increase
- **Focus**: Accent glow ring, no harsh outlines
- **Loading**: Subtle pulse or skeleton with shimmer effect
- **Success**: Brief green glow with checkmark icon
- **Error**: Red glow with shake animation

## Component Patterns

### MANDATORY: Use Shadcn UI Components

**All UI components must use Shadcn UI as the foundation.** This includes:

- **Buttons**: Use `@/components/ui/button` with variants
- **Forms**: Use `@/components/ui/input`, `@/components/ui/label`, `@/components/ui/form`
- **Cards**: Use `@/components/ui/card` with custom styling
- **Dialogs**: Use `@/components/ui/dialog` for modals
- **Navigation**: Use `@/components/ui/tabs`, `@/components/ui/navigation-menu`

### Cards

- Built on Shadcn UI `Card` component
- Dark backgrounds with cinematic gradients and glow effects
- Rounded corners (1rem default) with subtle border highlights
- Interactive hover states: scale (1.02), glow pulse, and color shifts
- Use backdrop blur for glassmorphism effect on overlays

### Buttons

- Built on Shadcn UI `Button` component with custom variants:
  - **Primary**: Cinematic red (`--primary`) with glow and scale on hover
  - **Secondary**: Glassmorphism with subtle accent borders
  - **Accent**: Electric cyan (`--accent`) for social actions with pulse animation
  - **Ghost**: Minimal with hover glow for secondary actions
- Remove verbose button text - use icons + concise labels
- Add micro-interactions: bounce, glow, color transitions

### Forms - Social Media Inspired

**CRITICAL: Eliminate verbose, corporate form patterns**

- **NO character counters** (0/500) unless absolutely critical
- **NO helper text** unless essential for UX
- **NO verbose labels** - use placeholder text or floating labels
- **Minimal validation messages** - use inline icons + brief text
- Built on Shadcn UI form components with heavy customization
- Floating labels that animate on focus (like Instagram/TikTok)
- Glassmorphism inputs with subtle glow on focus
- Use icons instead of text labels where possible
- Inline validation with smooth color transitions (red → green)
- Auto-expanding textareas without visible character limits

### Installation Requirements

Before implementing any UI component, ensure required Shadcn components are installed:

```bash
# Core components (install as needed)
npx shadcn@latest add button input label card form dialog tabs
npx shadcn@latest add navigation-menu select textarea checkbox
```

## Accessibility

- High-contrast text for all primary interactions
- Minimum WCAG AA compliance for color contrast

## UI Personality Guidelines

### Social Media Aesthetic Principles

- **Instant gratification**: Fast, smooth interactions with immediate visual feedback
- **Minimal cognitive load**: Reduce text, increase visual cues and icons
- **Playful micro-interactions**: Subtle bounces, glows, and color shifts on interaction
- **Content-first**: Let media and user content shine, UI should feel invisible
- **Mobile-native feel**: Touch-friendly, swipe gestures, thumb-optimized layouts

### Anti-Patterns to Avoid

❌ **Corporate/Enterprise UI patterns:**

- Verbose form labels and helper text
- Character counters and field descriptions
- Excessive validation messaging
- Bland, uniform button styling
- Static, lifeless interactions

❌ **Boring visual elements:**

- Plain gray backgrounds without gradients or filters
- Uniform spacing without visual rhythm
- Missing hover states and micro-interactions
- Text-heavy interfaces without visual hierarchy
- No glow effects or text color transitions
- No SVG's or custom icons, only use Lucid react icons

❌ **No Over Doing It:**

- Overly verbose text and corporate patterns
- Overly complex UI components
- Mismatching colors and visual styles across components
- Overly boring visual elements
- Overly complex animations and micro-interactions like text color transitions
- No Floating/animated labels or text
- No gradient text or animations
- No distracting animations or micro-interactions

### Required Visual Elements

✅ **Cinematic polish:**

- Subtle gradients and interactive elements
- Smooth transitions between states (0.2s-0.3s duration)
- Depth through shadows, blur, and layering
- Rich color accent that pops against dark backgrounds

✅ **Social media inspiration:**

- Icon-first navigation and actions (Use Lucid react icons)
- Card-based content with rich, enlarged media previews
- Gesture-friendly interactions and feedback

## Quality Checklist

Before shipping any UI component:

- [ ] **MANDATORY**: Uses Shadcn UI components as foundation
- [ ] **MANDATORY**: Eliminates verbose text and corporate patterns
- [ ] **MANDATORY**: Includes hover states and micro-interactions
- [ ] Works in dark mode (default) with cinematic styling
- [ ] Feels fun, social, and engaging (not corporate)
- [ ] Uses icons and visual cues over text labels
- [ ] Animations enhance the social media feel
- [ ] Mobile-first with touch-friendly interactions
- [ ] Uses design system tokens with rich visual effects
- [ ] Content and media are the hero, UI feels invisible
