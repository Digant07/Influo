# Influo — Influencer Search & Roster Builder

Influo is a modern, search-first creator discovery tool built for talent teams, marketing managers, and agency coordinators to search, filter, and shortlist influencers across Instagram, YouTube, and TikTok.

---

## 🚀 Tech Stack
- **Frontend Core**: React 19, TypeScript
- **Bundler & Tooling**: Vite, ESLint
- **Styling**: Tailwind CSS, Vanilla CSS
- **State Management**: Zustand (with Persist Middleware)
- **Animation**: Framer Motion
- **Icons**: Lucide React

---

## ✨ Features & What Was Changed

### 1. Persistent Zustand Campaign Shortlist (New State Layer)
- **Context to Zustand Migration**: Replaced the original React Context state layer with a centralized Zustand store (`src/store/useListStore.ts`).
- **Persistence**: Shortlisted creators are serialized and persisted in the browser's `localStorage` under `influo-selected-profiles`, ensuring selections survive page refreshes.
- **Selector Optimization**: Components subscribe to specific state slices (e.g. `isSelected(username)` or `selectedProfiles`) to avoid unnecessary parent re-renders.

### 2. High-Fidelity UI/UX Redesign
- **Typography & Aesthetics**: Standardized the design system using Google Fonts (`Outfit` and `Plus Jakarta Sans`) combined with warm amber accents, subtle shadows, and glassmorphism.
- **Hero & Slogan Animation**: Added an interactive, loop-based typing animation for the slogan *"We'll Find Them!"* in the hero section, featuring custom delays, backspacing, and blinking cursor effects.
- **Platform Filters**: Built SVG-branded filter capsules with dynamic brand color highlights (pink for Instagram, red for YouTube, slate for TikTok).
- **Responsive Lists Sidebar**: Overhauled the selected drawer using Framer Motion spring curves and overlay transitions, providing real-time roster management.
- **Creator Details Page**: Redesigned statistics sheets into metric grids displaying followers, engagement rates, average views, average likes, average comments, and total posts.

### 3. Smart Avatar & Image Fallbacks
- **Capital Bounds Parser**: Created a robust fallback initials generator supporting camelCase (`MrBeast` -> `MB`), word separation (`Vlad and Niki` -> `VN`), and hyphenation/punctuation (`T-Series` -> `TS`).
- **Deterministic Gradient System**: Renders initials against a color gradient determined by a string-hash algorithm of the creator's username.
- **Bypassing Referrer Blocks**: Integrated `no-referrer` content metadata tags and attributes to bypass image hotlinking restrictions (solving `403 Forbidden` errors on creator images).

### 4. Excel & Sheets Ready CSV Exporter
- **RFC-4180 Exporter**: Standardized a dedicated CSV exporter utility with full value escaping (handling double quotes, commas, and newlines safely).
- **UTF-8 BOM Header**: Prefixes CSV files with `\uFEFF` so Microsoft Excel and Google Sheets open them immediately with correct encoding (retaining special characters).

---

## 🐛 Bugs Fixed

1. **External CDN Avatar Referrer Restrictions (403 Forbidden)**:
   - *Issue*: Creator profile pictures hotlinked from external CDNs (like Instagram/Facebook CDNs) failed to render, throwing HTTP 403 Forbidden errors because of origin checking headers.
   - *Fix*: Added a project-wide `<meta name="referrer" content="no-referrer" />` header in `index.html` and configured `referrerPolicy="no-referrer"` in the image fallback loaders to bypass CDN referrer security blocks.

2. **Incorrect Fallback Initials (e.g., T-Series, MrBeast)**:
   - *Issue*: The original initials fallback code parsed initials poorly, showing `T-` for `T-Series`, or a single letter for camelCase/spaced handles.
   - *Fix*: Designed a robust initials tokenizer that checks for camelCase boundaries (`MrBeast` -> `MB`), splits on spaces/punctuation (`T-Series` -> `TS`), and ignores filler words like "and", "the", "of" (`Vlad and Niki` -> `VN`).

3. **Glitched/Broken CSV Formatting in Microsoft Excel**:
   - *Issue*: Double quotes, commas, and formatting strings inside user bios or fullnames broke column alignment in Excel, and international characters were replaced by encoding block glyphs.
   - *Fix*: Escaped cells using RFC-4180 rules (wrapping strings in quotes, doubling double-quotes) and prefixed the binary stream with a UTF-8 BOM (`\uFEFF`) to force Excel to render characters correctly.

4. **Synchronous React Hook State Alterations**:
   - *Issue*: ESLint highlighted synchronous state updates inside active rendering effects (e.g. `useEffect`), creating a warning risk of render cycle loops.
   - *Fix*: Wrapped state update flags (such as typewriter deletion switches) in asynchronous `setTimeout` callbacks.

---

## 📁 Project Structure
```
src/
├── assets/         # Graphic assets and SVG vectors
├── components/     # Reusable presentation and utility components
│   ├── CreatorQuickViewModal.tsx
│   ├── ImageWithFallback.tsx
│   ├── Layout.tsx
│   ├── PlatformFilter.tsx
│   ├── ProfileCard.tsx
│   └── VerifiedBadge.tsx
├── pages/          # Primary route page controllers
│   ├── SearchPage.tsx
│   └── ProfileDetailPage.tsx
├── store/          # Zustand global store layer
│   └── useListStore.ts
├── types/          # Shared type and interface models
│   └── index.ts
└── utils/          # Standard utilities and helper scripts
    ├── dataHelpers.ts
    ├── exportHelpers.ts
    ├── formatters.ts
    └── profileLoader.ts
```

---

## 🛠️ Local Development & Setup

### Prerequisites
Ensure you have Node.js installed (v18+ recommended) and npm.

### Installation
1. Clone or download the repository files.
2. Open your terminal in the project directory.
3. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
   *(Note: `--legacy-peer-deps` is used due to third-party drag-and-drop peer constraints with React 19)*

### Running Locally
To launch the Vite development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
To run the TypeScript type checks and generate compiled production assets in the `dist` folder:
```bash
npm run build
```

---

## 💡 Assumptions & Trade-offs
- **Stable Keys**: Assumed that the `username` field is unique and stable across all platforms for shortlist selection lookup.
- **Framer Motion over Native Transitions**: Used Framer Motion instead of standard CSS transitions to support complex spring dynamics and exit animations (e.g. drawer exit).
- **React 19 Compatibility**: Opted to run dependencies with `--legacy-peer-deps` rather than downgrading the project core to React 18, ensuring we leverage modern concurrent rendering.

---

## 🔗 Live Demo URL (Optional Placeholder)
- Live Demo: [Insert Live URL Here]
