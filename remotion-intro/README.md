# Take Back Your Health — Cold Open + Animated Guest Intro

A [Remotion](https://remotion.dev) project with two compositions for the
**Melissa Schreibfeder** episode (Founder, Functional Nurse Academy):

- **`ColdOpen`** (~63s) — the teaser: two episode clips played back-to-back
  with animated karaoke captions (clean white Poppins sans-serif, no
  background, the word currently being spoken highlighted yellow, synced from
  a word-level transcript) and the show logo sliding in top-left. Render:
  `npm run render-coldopen` → `out/melissa-cold-open.mp4`.
  Requires `public/clip1.mp4` and `public/clip2.mp4` (the two source clips —
  git-ignored due to size; drop them in `public/` before rendering).
- **`Intro`** (~42.5s) — the animated guest-intro over Dr. Amy Myers' voiceover
  (documented below).

## Guest Intro (`Intro`)

Renders the animated guest-intro that plays over Dr. Amy Myers' voiceover
introducing **Melissa Schreibfeder** (Founder, Functional Nurse Academy).

It reproduces the show's template from the provided example — periwinkle backdrop,
the *"Take Back Your Health with Dr. Amy Myers"* logo pinned top-left, website
screenshots composited inside a floating macOS Safari window, Ken-Burns headshot
title cards, and brand-styled pull-quotes — swapping in Melissa's assets and
Functional Nurse Academy branding.

**Output:** `1920×1080`, 30 fps, ~42.5 s, H.264 + AAC.

## Render

```bash
npm install
npm run render        # writes out/melissa-intro.mp4
```

`npm run render` targets the environment's bundled headless Chromium
(`remotion.config.ts`). On a normal machine where Remotion can find/download its
own Chrome, use `npm run render-local` (or just `npx remotion render Intro`).

Preview / edit interactively:

```bash
npm start             # opens Remotion Studio
```

## Structure

| File | Purpose |
| --- | --- |
| `src/Intro.tsx` | Timeline — all segments, timings, and scroll positions |
| `src/components/HeadshotCard.tsx` | Portrait title card (open + close) |
| `src/components/BrowserWindow.tsx` | Safari-chrome window with a scrolling website strip |
| `src/components/QuoteCard.tsx` | Functional Nurse Academy pull-quote card |
| `src/components/LogoChip.tsx` | Persistent show logo, top-left |
| `src/components/Background.tsx` | Periwinkle backdrop (`#ABC0D4`) |
| `src/theme.ts` | Brand colors + fonts (EB Garamond, Poppins — self-hosted) |
| `public/` | Rendered assets (see below) |

### Segment map (30 fps)

| Frames | Time | Scene | Voiceover beat |
| --- | --- | --- | --- |
| 0–246 | 0.0–8.2s | Headshot + name/credentials | "…a seasoned registered nurse…" |
| 234–474 | 7.8–15.8s | Home: hero → humanitarian | "…built a successful functional medicine business…" |
| 462–708 | 15.4–23.6s | Home: IFM partner → benefits | "…root cause, lifestyle and nutrition…" |
| 696–936 | 23.2–31.2s | Testimonials page grid | "…to train nurses nationwide…" |
| 924–1056 | 30.8–35.2s | Pull-quote (Althea Douglas) | "…to extend functional medicine training…" |
| 1050–1146 | 35.0–38.2s | Pull-quote (Stephanie Escamillia) | |
| 1140–1275 | 38.0–42.5s | Closing name lockup | "Welcome, Melissa, so happy to have you today." |

## Assets (`public/`)

- `headshot.jpeg` — Melissa's headshot (provided).
- `fna_home.png` / `fna_testimonials.png` — tall scroll-strips cropped from the
  provided full-page website captures (right-edge chat widget trimmed).
- `soundtrack.wav` — final mixed audio: the host voiceover + *Summer Air* music
  bed (ducked), loudness-normalized to −16 LUFS.

### Audio note

The source voiceover recording opens with a false start
(*"Today's guest, Melissa… we're gonna come back to this."*). The soundtrack
uses the clean take that begins at ~11.7 s (*"Okay, today's guest is a seasoned
registered nurse…"*) through *"Welcome, Melissa, so happy to have you today."*
To rebuild it from the raw files, re-run the ffmpeg mix documented in the commit
that added this project.

## Tweaking

- **Text** (name, credentials, quotes): edit the props in `src/Intro.tsx`.
- **Timing**: change each `Seg`'s `from` / `len` (frames).
- **What the browser shows**: change `fromFrac` / `toFrac` (0–1 scroll position)
  on each `BrowserWindow`.
