

## Problem
On mobile, the 5 tab buttons (Templates, AI Infographics, Data & Visuals, Timelines, Slide Library) are squeezed into a horizontal row with icons + labels + badges, causing them to overflow or appear cramped on small screens.

## Solution
Replace the horizontal tab bar with a **dropdown menu** on mobile (below `md` breakpoint), while keeping the current tab bar on desktop.

### Changes — single file: `src/pages/Templates.tsx`

1. **Import `DropdownMenu` components** from `@/components/ui/dropdown-menu` (DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem) and the `ChevronDown` icon.

2. **Mobile: render a dropdown trigger button** showing the current tab's icon, label, and badge, with a chevron. Wrapped in `<div className="md:hidden">`.

3. **Desktop: keep existing tab bar** wrapped in `<div className="hidden md:flex ...">` (current classes).

4. **Dropdown menu items** map over the same `TABS` array, each calling `setActiveTab(tab.id)` on click, with the icon, label, and badge rendered inline.

This gives mobile users a clean single-line selector that expands into a full menu on tap, while desktop stays unchanged.

