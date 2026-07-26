# Show Transcript (Producer Log) — Design

**Goal:** After any round ends (or the show ends), the producer can open a floating Transcript panel from the top-right of the live world, preview the full producer cut, and download it as a `.txt` file.

## Decisions

| Topic | Choice |
|-------|--------|
| Content | Full producer log (public, private, confessions, GM, producer notes, leaks, recaps/story) |
| Visual style | Option A — same dark / pixel producer theme as the live UI |
| Layout | Floating panel (~80–85% of viewport), world still visible behind a light dim — not fullscreen |
| Cast | All five contestants with puppet (sprite portrait), name/role, and full traits |
| Dialogue lines | Same puppet next to speaker name + kind tags |
| Availability | Enabled once at least one round has ended, or show is over; disabled mid-first-round |
| Download | Plain text `.txt` (UTF-8) and PDF (html2canvas snapshot of the preview) |

## UI

1. **Transcript** button — top-right of `WorldPage` (mirrors Start round top-left).
2. Click opens `TranscriptModal` over a semi-transparent dim; does not replace the world.
3. Panel header: title + Close + **Download .txt** + **Download PDF**.
4. Body: Cast block, then rounds (events → recap → story chapter).
5. PDF captures the preview DOM (same dark theme, puppets, layout), paginated to A4.

## Data

- On open: `getShow(showId)` for canonical `events`, `recaps`, `narratives`, `contestants`.
- Traits / accent / display metadata: join contestant `id` to `PRESET_AGENTS`.
- Puppets: same `char-slot-N.png` portraits as WorldView (slot by contestant index).

## Out of scope

- Markdown download format
- Mid-round live-updating transcript
- Broadcast (public-only) cut toggle
