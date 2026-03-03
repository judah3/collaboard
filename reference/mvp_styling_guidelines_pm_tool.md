# Project Management Tool – MVP Styling Guidelines

This document defines the styling standards for the React + TypeScript MVP. The goal is consistency, clarity, and scalability while keeping the UI clean and collaboration-focused.

---

# 1. Design Principles

- Use an 8pt spacing system
- Neutral color base with one primary brand color
- Clear typography hierarchy
- Minimal shadows, consistent borders
- Soft rounded corners
- Subtle interactions and motion
- Accessibility-first (focus states required)

---

# 2. Spacing System (8pt Grid)

All spacing must follow the 8pt scale.

| Tailwind Class | Pixel Value |
|---------------|------------|
| p-2 / gap-2   | 8px        |
| p-3 / gap-3   | 12px       |
| p-4 / gap-4   | 16px       |
| p-6 / gap-6   | 24px       |
| p-8 / gap-8   | 32px       |

### Standards

- Page padding: `p-6` (desktop), `p-4` (tablet), `p-3` (mobile)
- Card padding: `p-4`
- Column padding: `p-3`
- Section spacing: `gap-6`
- List spacing: `gap-3` or `gap-4`

Avoid arbitrary spacing values.

---

# 3. Border Radius

| Element | Class |
|----------|--------|
| Cards | `rounded-xl` |
| Buttons | `rounded-lg` |
| Inputs | `rounded-lg` |
| Drawer | `rounded-2xl` (desktop only) |

Keep radius consistent across components.

---

# 4. Color System

## Base Neutrals (Tailwind Slate)

- App background: `bg-slate-50`
- Surface (cards, panels): `bg-white`
- Primary text: `text-slate-900`
- Secondary text: `text-slate-600`
- Muted text: `text-slate-500`
- Borders: `border-slate-200`

## Brand Accent

Choose one brand color (recommended: Blue or Indigo).

Example (Blue):

- Primary button: `bg-blue-600 hover:bg-blue-700 text-white`
- Focus ring: `focus:ring-2 focus:ring-blue-500/40`

## Status Accents

Used minimally (badges or small indicators only):

- High priority: Red (soft background)
- Medium priority: Amber
- Low priority: Slate
- Completed column accent: Green underline or border

Avoid full-color backgrounds for large areas.

---

# 5. Typography Scale

| Usage | Class |
|--------|--------|
| Page title | `text-2xl font-semibold` |
| Section title | `text-base font-semibold` |
| Card title | `text-sm font-semibold` |
| Body text | `text-sm text-slate-600` |
| Metadata | `text-xs text-slate-500` |

### Text Rules

- Card descriptions: maximum 2 lines (`line-clamp-2`)
- Avoid long blocks of text in cards
- Maintain clear hierarchy

---

# 6. Component Styling Standards

## Buttons

Base:

- `h-9 px-3 rounded-lg text-sm font-medium`

Variants:

- Primary: Solid brand color
- Secondary: `bg-white border border-slate-200`
- Ghost: Transparent with hover background

## Inputs

- `h-9 px-3 rounded-lg border border-slate-200`
- Focus: `focus:outline-none focus:ring-2 focus:ring-blue-500/40`
- Placeholder: `text-slate-400`

## Badges (Tags & Priority)

- Height: `h-6`
- Font: `text-xs`
- Padding: `px-2`
- Soft background tint

## Avatars

- Card usage: `h-7 w-7`
- Header usage: `h-8 w-8`
- Stacked: `-space-x-2`

---

# 7. Layout Standards

## Sidebar

- Width: `w-64`
- Background: `bg-white`
- Border: `border-r border-slate-200`
- Active item: `bg-slate-100 text-slate-900`

## Topbar

- Height: `h-14`
- Sticky: `sticky top-0`
- Background: `bg-white/80 backdrop-blur`
- Border bottom: `border-b`

## Project Header

- Container: `rounded-xl border bg-white p-5`
- Right-aligned metadata (avatars, due date, progress)

## Board Columns

- Minimum width: `min-w-[320px]`
- Background: `bg-slate-50`
- Border: `border border-slate-200`
- Radius: `rounded-xl`

## Task Cards

- `bg-white border border-slate-200 rounded-xl p-4 shadow-sm`
- Hover: `hover:shadow-md hover:border-slate-300`

---

# 8. Interaction Standards

## Hover

- Cards: subtle elevation increase
- Buttons: darker shade or light background tint

## Focus (Required)

All interactive elements must include:

`focus:outline-none focus:ring-2 focus:ring-blue-500/40`

## Motion

- Drawer transition: 200ms ease
- Card hover animation: 150ms
- Avoid excessive or playful motion

---

# 9. Responsive Rules

## Desktop

- Drawer docked right (`w-[420px]`)
- 3 visible columns

## Tablet

- Drawer overlays with backdrop
- Horizontal board scroll enabled

## Mobile

- Drawer full screen
- Horizontal board scroll
- Reduced padding (`p-3`)

---

# 10. Code Styling Conventions

- Use `cn()` helper (clsx + tailwind-merge) for class management
- Avoid arbitrary pixel values
- Avoid inline styles unless dynamic
- Centralize color and radius tokens
- Keep components variant-driven (not copy-pasted styles)

---

# Final Styling Philosophy

The UI should feel:

- Clean
- Lightweight
- Professional
- Collaboration-focused
- Scalable

Consistency is more important than visual complexity.

