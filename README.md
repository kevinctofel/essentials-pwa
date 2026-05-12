# Essentials – Minimalist Possessions Tracker

A progressive web app (PWA) for tracking personal possessions and knowing when you last used each item.

## Why

Ever bought something you already own? Kept things "just in case" for years? Essentials aims to solve that by making it dead simple to record when you last used each possession — so you can confidently declutter, stop rebuying, and know what you actually rely on.

## How it works

1. **Add an item** — name it, give it a category and location, snap a photo.
2. **Auto-track the timestamp** — the photo's EXIF date becomes the "last used" date. No extra taps.
3. **Mark as used anytime** — didn't take a photo? One click sets it to now.
4. **Spot the stale ones** — items untouched for 30+ days (configurable) are highlighted so nothing slips through the cracks.

## Key features

- **Photo timestamping** — EXIF data from your camera/gallery photos automatically records when you used something
- **Thumbnail-only storage** — photos are resized to thumbnails before saving, keeping storage lean
- **Manual fallback** — "Mark as Used Now" button for quick updates without a photo
- **Stale item detection** — visual highlight for items unused past a configurable threshold
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

- [ ] Settings page — adjust stale threshold, export/clear data
- [ ] Stale-items review tab — one place to review and mark/delete
- [ ] Search & filter by category/location
- [ ] Push notification reminders for stale items
- [ ] Cloud sync / backup option

## License

MIT
