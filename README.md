# Essentials – Minimalist Possessions Tracker

A progressive web app (PWA) for tracking personal possessions and knowing when you last used each item.

## Why

Ever bought something you already own? Kept things "just in case" for years? Essentials aims to solve that by making it dead simple to record when you last used each possession — so you can confidently declutter, stop rebuying, and know what you actually rely on.

## How it works

1. **Add an item** — name it, give it a category and location, snap a photo.
2. **Auto-track the timestamp** — the photo's EXIF date becomes the "last used" date. No extra taps.
3. **Mark as used anytime** — didn't take a photo? One click sets it to now.
4. **Spot the stale ones** — a dedicated Stale tab shows items untouched past a configurable threshold (default 180 days).
5. **Keep everything tidy** — edit item details, change photos, or delete items you no longer track.

## Key features

- **Photo timestamping** — EXIF data from your camera/gallery photos automatically records when you used something
- **Thumbnail-only storage** — photos are resized to thumbnails before saving, keeping storage lean
- **Manual fallback** — "Mark as Used Now" button for quick updates without a photo
- **Stale item detection** — dedicated Stale tab + summary banner with configurable threshold (Settings gear icon, 30–730 days)
- **Edit & delete** — tap any item card to edit its name, category, location, or photo. Trash icon removes items with a confirmation dialog.
- **Sort options** — sort by Last Used (newest/oldest), Name (A–Z), or Date Added
- **Group by location** — toggle grouping to see items organized by location with collapsible sections
- **Offline-first** — all data stored locally in IndexedDB via Dexie
- **PWA** — installable on mobile and desktop, no app store needed

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Database | Dexie (IndexedDB) |
| EXIF parsing | exifr |
| PWA | vite-plugin-pwa |

## Getting started

```bash
git clone https://github.com/kevinctofel/essentials-pwa.git
cd essentials-pwa
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Building for production

```bash
npm run build
npm run preview
```

## Roadmap (ideas being explored)

- [ ] Search & filter by category/location
- [ ] Push notification reminders for stale items
- [ ] Cloud sync / backup option
- [ ] Bulk actions (mark multiple items as used, batch delete)

## License

MIT
