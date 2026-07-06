# 🚀 Sam's Learning Plan — Summer 2026

A private summer learning app for Sam, built from his OCCLC assessment (May 13, 2026) and the Dolch Pre-K + Kindergarten sight-word lists. Same design and pacing engine as Selah's app. 8 weeks: **Mon July 6 – Fri Aug 28, 2026**.

## Deploy (same as Selah's)
Push this folder to a GitHub repo and import it into Vercel — it detects Vite and builds automatically. No settings needed.

Progress checkmarks save on the device: the app uses `window.storage` when published as a Claude artifact and falls back to browser storage on Vercel. (Selah's live app only has the first one — if her checkmarks ever reset on Vercel, copy the `loadChecks`/`saveChecks` functions from this file into hers.)

## Every day — 9 tasks
1. 👁️ **Sight words** — this week's new batch + every earlier word (read → 🔊 check → ✓ or ↺)
2. 🤪 **Silly CVC words** — 20 made-up words for decoding fluency
3. 🔤 **Phonics** (rotates) — big letters J/K/Y → blends → magic-e → vowel teams
4. ➕ **Adding to 10** — ten frame
5. 🔢 **Counting** — tap the chart (say each number out loud)
6. 💰 **Coins** — name it, then its value (penny, nickel, dime)
7. 📖 **20 min reading together** — grown-up reads → read together → Sam reads it back (books where Sam gets ~8–9 of every 10 words)
8. ➗ **10 min IXL math** — goal 150 in Numbers & Operations, Algebra, Data & Probability
9. 📚 **10 min IXL language** — goal 150 in Reading Level, Reading Strategies, Grammar & Mechanics

## 8-week sight word map (all 92 assessment words)
Each week practices the new batch **plus every word from earlier weeks**.

| Week | List | New words |
|---|---|---|
| 1 | Pre-K | the, a, I, to, and, is, in, it, we, me, my, can, go, see |
| 2 | Pre-K | you, up, look, play, run, said, come, here, help, down, not, one, two |
| 3 | Pre-K | big, little, blue, red, yellow, three, find, for, funny, jump, make, away, where |
| 4 | K | he, she, was, on, are, that, this, with, they, at, be |
| 5 | K | all, so, no, do, am, get, like, have, out, saw, went |
| 6 | K | what, there, now, came, ate, eat, good, new, ran, ride |
| 7 | K | say, too, under, want, well, who, will, yes, our, into |
| 8 | K | black, brown, white, four, but, did, must, please, pretty, soon |

## Skill arcs
- **Phonics:** weeks 1–2 uppercase J/K/Y + magic-e · weeks 3–4 blends + J/K/Y review · weeks 5–8 vowel teams (ai, ay, ee, ea, oa) + blends + magic-e
- **Counting:** weeks 1–3 bridge the tricky decades (1–30 → 30–60 → 60–90 → 80–100) + by 2s · weeks 4–5 1–50 and 50–100 · weeks 6–8 the full 1–100 + by 2s
- **Math facts:** one new family a day for the first 6 days (+1s, +2s, +3s, +4/+5, doubles, make-10), then mixed review — all sums ≤ 10

Skipped on purpose (assessment strengths): vocabulary (160), shapes, ordinals, even/odd, subtraction, fractions, measurement.

## Editing
All word lists and the weekly schedules live at the **top of `App.jsx`**, clearly labeled with ✏️ comments. The Good & Beautiful Booster A cards pair naturally with the J/K/Y and CVC decks.
