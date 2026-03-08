

## Plan: Full Mobile Responsiveness

### Scope
Make the entire app render correctly at 390px (iPhone 14) and 360px (Android). Focus areas: Dashboard (sidebar → bottom tab bar), Editor, Create page, Settings, landing/marketing pages, and global CSS fixes.

### 1. New Component: `MobileBottomNav`
Create `src/components/MobileBottomNav.tsx` — a fixed bottom navigation bar visible only below `md:` breakpoint with 4 tabs: **Home** (dashboard home), **Generate** (links to /create), **My Decks** (library tab), **Account** (settings). Icons: Home, Sparkles, Layers, User. Min tap target 44×44px.

### 2. Dashboard (`src/pages/Dashboard.tsx`)
- Hide `<LibrarySidebar>` below `md:` with `hidden md:block`
- Show `<MobileBottomNav>` below `md:` — wire tab changes to `sidebarTab` state or navigation
- Add `pb-20 md:pb-0` to main content to avoid bottom nav overlap
- Main content padding: `p-4 md:p-6`

### 3. Library Header (`src/components/library/LibraryHeader.tsx`)
- Search bar: `w-full md:w-80` (full width on mobile)
- Reduce horizontal padding: `px-4 md:px-6`
- Stack search above actions on mobile or hide view toggle on small screens

### 4. Library Action Bar (`src/components/library/LibraryActionBar.tsx`)
- On mobile, stack vertically or show only primary CTA + icon buttons
- Wrap in `flex-wrap gap-2` so buttons don't overflow

### 5. Editor (`src/pages/Editor.tsx`)
- Already has mobile handling with `MobileEditorTabs` — good
- Touch-friendly spacing: increase block gap from `space-y-2` to `space-y-3` on mobile in the block list
- Canvas padding already has `p-4 md:p-8` — good
- Ensure editor sidebar actions have min 44px tap targets
- Add `min-h-[44px]` to block action buttons in `MobileBlocksPanel`

### 6. Create Page (`src/pages/Create.tsx`)
- Entry cards grid: change `grid-cols-2 lg:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`
- Options row: change `grid-cols-2 sm:grid-cols-5` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-5`
- Prompt textarea and generate button: full width, larger tap target on mobile

### 7. Settings Page (`src/pages/Settings.tsx`)
- Already has `flex-col md:flex-row` — good
- Settings tab nav on mobile: convert to horizontal scrollable row instead of vertical list
- Ensure buttons have adequate padding

### 8. Landing/Marketing Pages
- Navbar already handles mobile with hamburger — good
- Hero: ensure heading text doesn't overflow at 360px (already uses `clamp()` — verify)
- Pricing cards: ensure horizontal scroll or stack at small widths

### 9. Global CSS (`src/index.css`)
- Add `overflow-x: hidden` to `html, body` to kill horizontal scroll
- Add utility class `.safe-area-bottom` with `padding-bottom: env(safe-area-inset-bottom)` if not already present
- Add global touch target utility: `.touch-target { min-width: 44px; min-height: 44px; }`

### 10. Button Component (`src/components/ui/button.tsx`)
- Add mobile-first padding increase: default size gets `px-4 py-2.5 md:px-4 md:py-2` (slightly larger on mobile)
- Ensure `size="icon"` is at least 44×44px: `h-11 w-11 md:h-10 md:w-10`

### Files to Create
- `src/components/MobileBottomNav.tsx`

### Files to Modify
- `src/pages/Dashboard.tsx` — hide sidebar on mobile, add bottom nav, adjust padding
- `src/components/library/LibraryHeader.tsx` — responsive search width, padding
- `src/components/library/LibraryActionBar.tsx` — flex-wrap for mobile
- `src/pages/Create.tsx` — fix grid breakpoints
- `src/pages/Settings.tsx` — horizontal tab nav on mobile
- `src/pages/Editor.tsx` — touch spacing in block list
- `src/components/editor/MobileBlocksPanel.tsx` — 44px tap targets
- `src/components/ui/button.tsx` — mobile padding/size adjustments
- `src/index.css` — overflow-x hidden, safe-area, touch utilities

