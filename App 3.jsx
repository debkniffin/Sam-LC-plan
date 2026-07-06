import { useState, useEffect } from "react";

/* ============================================================================
   SAM'S SUMMER LEARNING PLAN — Summer 2026
   Built from: OCCLC Assessment (May 13, 2026) + Dolch Pre-K & Kindergarten
   sight-word lists. Same design & pacing engine as Selah's app.

   ASSESSMENT-DRIVEN DESIGN CHOICES (do not "optimize" these away):
   • NO timers, NO scores — gentle mastery practice only.
   • READ-FIRST-THEN-CHECK flow on every card deck: Sam reads the card out
     loud, THEN taps 🔊 to hear it, THEN taps ✓ (got it) or ↺ (put it back
     in the deck). This mirrors the assessment's guidance to sound words out,
     then say them smoothly — and it builds honest self-checking.
   • Tap-to-hear audio everywhere.
   • One thing at a time, minimal visual clutter.

   8-WEEK MASTERY MAP (Mon July 6 – Fri Aug 28, 2026):
   • Sight words: all 40 Pre-K Dolch (weeks 1–3) + all 52 Kindergarten Dolch
     (weeks 4–8). Each week adds a new batch AND reviews every earlier word.
   • Silly CVC words: 20 nonsense words daily → CVC decoding fluency.
   • Phonics arc: uppercase J/K/Y (wks 1–4) → blends (wks 3–8) → magic-e
     (weekly) → vowel teams ai/ay/ee/ea/oa (wks 5–8).
   • Math: addition facts to 10 (ten frame), counting 1–100 + skip counting
     by 2s (tap chart), coin names & values (penny, nickel, dime).
   • Daily: 20 min reading together + 10 min IXL math + 10 min IXL language.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   ✏️  SAM'S WORD LISTS — edit here to swap or add words
---------------------------------------------------------------------------- */

// TRUE sight words only — Dolch words Sam can't yet sound out. Removed the
// decodable ones: CVC, blends, ck/sh/th, the -all family, taught vowel teams
// (ai/ay/ee/ea/oa), magic-e, open-syllable words (he/she/we/me/be/go/no/so),
// and "is" (s→z). He practices all of those in the phonics decks instead.
// KEPT: irregular words + words with vowel teams he hasn't learned yet
// (oo, ow, ou, ew, aw) and r-controlled vowels — he still needs those by sight.
// ~5–6 new words per week, most-common first.
const SIGHT_WORD_BATCHES = [
  ["the","a","I","to","my","you"],
  ["look","said","come","here","down"],
  ["one","two","little","blue","yellow"],
  ["find","for","funny","away","where"],
  ["was","are","they","do","have"],
  ["out","saw","what","there","now","good"],
  ["new","too","under","want","who","our"],
  ["into","brown","four","pretty","soon"],
];

// Made-up CVC words for decoding practice (13 per short vowel, none real).
const SILLY_CVC = [
  "zat","jat","vab","mab","kaz","taz","gak","paf","laz","daf","hab","faz","zab",   // short a
  "zet","veb","meb","kez","tez","gek","pef","neb","wep","yed","hev","jev","fep",   // short e
  "ziv","mib","kiz","pif","nid","wib","fim","yib","dit","tib","biv","piv","kib",   // short i
  "zog","koz","toz","gof","pob","lom","nof","vog","fod","rop","zop","vob","dof",   // short o
  "zub","vun","mub","kuz","tuz","guf","lud","wug","yub","dut","huz","juv","fuv",   // short u
];

// Real words with blends — starts with the assessment's own examples.
const BLEND_WORDS = [
  "flip","trap","sack","left","stop","clap","frog","slip","grab","spin",
  "drum","plan","snap","twin","swim","glad","step","milk","hand","jump",
  "best","fast","lamp","nest","tent","pond","gift","desk","crab","drip",
  "flag","plum","skip","spot","trip","sled","brag","club","grin","crib",
];

// Long vowel teams — "Two vowels go walking, and the first one does the
// talking." Starts with the assessment's examples (main, say, meet, team, soap).
const VOWEL_TEAM_WORDS = [
  { word: "main", team: "ai" }, { word: "say",  team: "ay" }, { word: "meet", team: "ee" },
  { word: "team", team: "ea" }, { word: "soap", team: "oa" }, { word: "rain", team: "ai" },
  { word: "play", team: "ay" }, { word: "seed", team: "ee" }, { word: "read", team: "ea" },
  { word: "boat", team: "oa" }, { word: "mail", team: "ai" }, { word: "day",  team: "ay" },
  { word: "feet", team: "ee" }, { word: "eat",  team: "ea" }, { word: "coat", team: "oa" },
  { word: "wait", team: "ai" }, { word: "stay", team: "ay" }, { word: "keep", team: "ee" },
  { word: "seat", team: "ea" }, { word: "road", team: "oa" }, { word: "tail", team: "ai" },
  { word: "hay",  team: "ay" }, { word: "deep", team: "ee" }, { word: "leaf", team: "ea" },
  { word: "goat", team: "oa" }, { word: "pain", team: "ai" }, { word: "may",  team: "ay" },
  { word: "need", team: "ee" }, { word: "sail", team: "ai" }, { word: "toad", team: "oa" },
];

// The 3 uppercase letters Sam didn't recognize, plus friendly review letters
// he already knows (mixed in for easy wins).
const TARGET_LETTERS = [
  { L: "J", word: "jump" },
  { L: "K", word: "kite" },
  { L: "Y", word: "yo-yo" },
];
const REVIEW_LETTERS = [
  { L: "A", word: "apple" }, { L: "B", word: "ball" }, { L: "D", word: "dog" },
  { L: "F", word: "fish" },  { L: "G", word: "go" },   { L: "H", word: "hat" },
  { L: "L", word: "lamp" },  { L: "M", word: "moon" }, { L: "N", word: "net" },
  { L: "P", word: "pig" },   { L: "R", word: "run" },  { L: "S", word: "sun" },
  { L: "T", word: "top" },   { L: "W", word: "web" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const WEEKS = 8;

// Calendar mapping: Week 1 Monday = July 6, 2026 (same start as Selah's)
const START_DATE = new Date(2026, 6, 6); // month is 0-indexed, so 6 = July
function dateFor(week, dayIdx) {
  const offset = (week - 1) * 7 + dayIdx;
  const d = new Date(START_DATE);
  d.setDate(d.getDate() + offset);
  return d;
}
function fmtShort(d) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}
function fmtLong(d) {
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return `${days[d.getDay()]}, ${fmtShort(d)}`;
}
function isPastOrToday(d) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d <= today;
}

// Calm, warm palette — same as Selah's app (one shared look for both kids).
const COLOR = "#8a6d9e";        // muted plum
const COLOR_DEEP = "#5e4575";
const COLOR_SOFT = "#f3eef7";
const INK = "#3a3340";
// The three buttons every activity shares — no reading needed, just color + symbol.
const HEAR = "#b39ac4";         // purple  🔊  hear it (check yourself)
const GO   = "#6fa37f";         // green   ✓   got it → next
const REDO = "#d17159";         // red     ↺   try again

/* ─── Persistent storage ──────────────────────────────────────────────────
   Uses window.storage when published as a Claude artifact, and falls back
   to the browser's localStorage when deployed on Vercel — so checkmarks
   stick in both places. All wrapped in try/catch for preview sandboxes. */
const STORE_KEY = "sam_summer2026";
async function loadChecks() {
  try {
    if (typeof window !== "undefined" && window.storage) {
      const r = await window.storage.get(STORE_KEY);
      return r ? JSON.parse(r.value) : {};
    }
  } catch { /* key not saved yet, or storage unavailable — fall through */ }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const r = window.localStorage.getItem(STORE_KEY);
      return r ? JSON.parse(r) : {};
    }
  } catch { /* sandboxed preview — no persistence here */ }
  return {};
}
async function saveChecks(data) {
  try {
    if (typeof window !== "undefined" && window.storage) {
      await window.storage.set(STORE_KEY, JSON.stringify(data));
      return;
    }
  } catch { /* fall through to localStorage */ }
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORE_KEY, JSON.stringify(data));
    }
  } catch { /* preview environment — progress won't persist here */ }
}

/* ─── Speech (tap-to-hear everywhere) ─────────────────────────────────────── */
const speak = (text, rate = 0.8) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const utter = () => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(String(text));
    u.rate = rate; u.pitch = 1; u.volume = 1; u.lang = "en-US";
    synth.speak(u);
  };
  // iOS/Safari sometimes needs voices loaded before the first utterance.
  if (synth.getVoices().length === 0) {
    synth.onvoiceschanged = () => { utter(); synth.onvoiceschanged = null; };
    setTimeout(utter, 60);
  } else {
    utter();
  }
};

const btn = (bg, extra = {}) => ({
  flex: 1, padding: "12px 8px", borderRadius: 12, border: "none",
  background: bg, color: "white", fontWeight: 700, fontSize: 15,
  cursor: "pointer", fontFamily: "Georgia, serif", ...extra,
});

/* ============================================================================
   THE SHARED CONTROLS — every activity ends the same way, with no text to
   read: a 🔊 Hear-it button (check yourself), a green ✓ (got it → next), and
   a red ↺ (try again). Sam never has to read an instruction to use anything.
   ============================================================================ */
function Controls({ onHear, onRedo, onGot }) {
  return (
    <>
      <button onClick={onHear} style={{ ...btn(HEAR), width: "100%", marginBottom: 8, fontSize: 18, padding: "16px 8px" }}>🔊 Hear it</button>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onRedo} style={{ ...btn(REDO), fontSize: 32, padding: "12px 8px" }}>↺</button>
        <button onClick={onGot} style={{ ...btn(GO), fontSize: 32, padding: "12px 8px" }}>✓</button>
      </div>
    </>
  );
}
// Put an item back into the deck a few cards later (so it comes around again).
function putBackInto(list, item) {
  const rest = list.slice(1);
  const at = rest.length === 0 ? 0 : Math.floor(Math.random() * rest.length) + 1;
  const next = [...rest]; next.splice(at, 0, item); return next;
}

/* ============================================================================
   SAM DECK — the flashcard for sight words, silly CVC words, blends, vowel
   teams, big letters, and magic-e. Just the word on the card — nothing to
   read. He reads it, taps 🔊 to check, then ✓ (got it) or ↺ (try again).
   ============================================================================ */
function SamDeck({ items, title }) {
  const [remaining, setRemaining] = useState(() => [...items]);
  const [done, setDone] = useState([]);

  if (remaining.length === 0) {
    return (
      <div style={{ background: "#fbf9fd", border: "2px solid #d8c9e4", borderRadius: 16, padding: 24, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🌟</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLOR_DEEP, marginBottom: 12 }}>All {done.length} done!</div>
        <button onClick={() => { setRemaining([...items]); setDone([]); }} style={{ ...btn(COLOR), maxWidth: 200, margin: "0 auto" }}>Start over</button>
      </div>
    );
  }

  const item = remaining[0];
  const gotIt = () => { setDone((d) => [...d, item]); setRemaining((r) => r.slice(1)); };
  const putBack = () => setRemaining((r) => putBackInto(r, item));

  return (
    <div style={{ background: "#fbf9fd", border: "2px solid #d8c9e4", borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: COLOR_DEEP, textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9b8aa8" }}>{done.length}/{items.length}</div>
      </div>

      <div style={{ background: "white", border: "3px solid #d8c9e4", borderRadius: 14, padding: "44px 16px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: item.parts ? 50 : 56, fontWeight: 900, color: INK, fontFamily: "Palatino Linotype, Georgia, serif", letterSpacing: 1 }}>
          {item.parts ? (
            <>
              <span style={{ color: INK }}>{item.parts.pre}</span>
              <span style={{ color: COLOR_DEEP, borderBottom: `4px solid ${COLOR}` }}>{item.parts.hi}</span>
              <span style={{ color: INK }}>{item.parts.post}</span>
            </>
          ) : item.display}
        </div>
      </div>

      <Controls onHear={() => speak(item.say, 0.72)} onRedo={putBack} onGot={gotIt} />
    </div>
  );
}

/* ─── Deck builders ─────────────────────────────────────────────────────── */
const wordItems = (ws) => ws.map((w) => ({ display: w, say: w }));

function sliceFrom(pool, start, count) {
  const out = [];
  for (let i = 0; i < count; i++) out.push(pool[(start + i) % pool.length]);
  return out;
}
function sillySetFor(week, dayIdx) {
  const dayNum = (week - 1) * 5 + dayIdx;
  return sliceFrom(SILLY_CVC, (dayNum * 7) % SILLY_CVC.length, 20);
}
function blendSetFor(week, dayIdx) {
  const dayNum = (week - 1) * 5 + dayIdx;
  return sliceFrom(BLEND_WORDS, (dayNum * 7) % BLEND_WORDS.length, 15);
}
function teamItems(week, dayIdx) {
  const dayNum = (week - 1) * 5 + dayIdx;
  const picks = sliceFrom(VOWEL_TEAM_WORDS, (dayNum * 5) % VOWEL_TEAM_WORDS.length, 12);
  return picks.map(({ word, team }) => {
    const i = word.indexOf(team);
    return { parts: { pre: word.slice(0, i), hi: team, post: word.slice(i + team.length) }, say: word };
  });
}
function letterItems(dayNum) {
  const revs = sliceFrom(REVIEW_LETTERS, (dayNum * 3) % REVIEW_LETTERS.length, 6);
  const order = [
    TARGET_LETTERS[0], revs[0], TARGET_LETTERS[1], revs[1], TARGET_LETTERS[2], revs[2],
    TARGET_LETTERS[0], revs[3], TARGET_LETTERS[1], revs[4], TARGET_LETTERS[2], revs[5],
  ];
  return order.map(({ L, word }) => ({ display: L, say: `${L}! ${L} is for ${word}.`, note: `${L} is for ${word}` }));
}

/* ============================================================================
   ADDING TO 10 — ten frame + fact families, all sums ≤ 10 (the exact gap:
   "consistently adding two single-digit numbers with a sum of 10 or less").
   One new family per day for the first 6 school days, then mixed review.
   ============================================================================ */
// Each fact is just "a+b"; a blank tappable ten frame helps him count, and he
// types his own answer. The card never shows the total — 🔊 reads it to check.
const FACT_FAMILIES = [
  { family: "+1 facts", facts: ["1+1","2+1","3+1","4+1","5+1","6+1","7+1","8+1","9+1","1+2","1+3","1+4","1+5","1+6","1+7","1+8","1+9"] },
  { family: "+2 facts", facts: ["2+2","3+2","4+2","5+2","6+2","7+2","8+2","2+3","2+4","2+5","2+6","2+7","2+8"] },
  { family: "+3 facts", facts: ["3+3","4+3","5+3","6+3","7+3","3+4","3+5","3+6","3+7"] },
  { family: "+4 and +5 facts", facts: ["4+4","5+4","6+4","5+5","4+5","4+6"] },
  { family: "doubles", facts: ["1+1","2+2","3+3","4+4","5+5"] },
  { family: "make 10", facts: ["1+9","2+8","3+7","4+6","5+5","9+1","8+2","7+3","6+4"] },
];

function TenFrame({ factFamily }) {
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const [remaining, setRemaining] = useState(() => shuffle(factFamily.facts));
  const [done, setDone] = useState([]);
  const [cells, setCells] = useState(Array(10).fill(false));
  const [answer, setAnswer] = useState("");
  useEffect(() => { setRemaining(shuffle(factFamily.facts)); setDone([]); setCells(Array(10).fill(false)); setAnswer(""); }, [factFamily.family]);

  if (remaining.length === 0) {
    return (
      <div style={{ background: "#fbf9fd", border: "2px solid #e8ddf0", borderRadius: 16, padding: 24, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🌟</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLOR_DEEP, marginBottom: 12 }}>All {done.length} done!</div>
        <button onClick={() => { setRemaining(shuffle(factFamily.facts)); setDone([]); setCells(Array(10).fill(false)); setAnswer(""); }} style={{ ...btn(COLOR), maxWidth: 200, margin: "0 auto" }}>Start over</button>
      </div>
    );
  }

  const fact = remaining[0];
  const [as, bs] = fact.split("+");
  const a = parseInt(as, 10), b = parseInt(bs, 10), c = a + b;

  // Tap an empty cell -> fill from the start up to it. Tap a filled cell -> clear from it on.
  const tap = (i) => setCells((prev) => {
    const next = [...prev];
    if (prev[i]) { for (let j = i; j < 10; j++) next[j] = false; }
    else { for (let j = 0; j <= i; j++) next[j] = true; }
    return next;
  });

  const gotIt = () => { setDone((d) => [...d, fact]); setRemaining((r) => r.slice(1)); setCells(Array(10).fill(false)); setAnswer(""); };
  const putBack = () => { setRemaining((r) => putBackInto(r, fact)); setCells(Array(10).fill(false)); setAnswer(""); };

  return (
    <div style={{ background: "#fbf9fd", border: "2px solid #e8ddf0", borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9b8aa8" }}>{done.length}/{factFamily.facts.length}</div>
      </div>

      <div style={{ background: "white", border: "3px solid #d8c9e4", borderRadius: 14, padding: "20px 16px", textAlign: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 46, fontWeight: 900, color: INK, fontFamily: "Georgia, serif" }}>{a} + {b} =</span>
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value.replace(/[^0-9]/g, "").slice(0, 2))}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="?"
            aria-label="your answer"
            style={{ width: 72, height: 62, textAlign: "center", fontSize: 40, fontWeight: 900, fontFamily: "Georgia, serif", color: COLOR_DEEP, border: "3px solid #d8c9e4", borderRadius: 12, background: "#fbf9fd", outline: "none", padding: 0 }}
          />
        </div>
        {/* One tappable ten frame — he fills it to help himself count. It never shows the total. */}
        <div style={{ display: "flex", width: "100%", maxWidth: 320, margin: "0 auto", border: `3px solid ${COLOR_DEEP}`, borderRadius: 10, overflow: "hidden" }}>
          {Array.from({ length: 10 }, (_, col) => {
            const filled = cells[col];
            const left = col < 5;
            return (
              <div key={col} onClick={() => tap(col)} style={{ flex: 1, aspectRatio: "1", borderRight: col === 4 ? `4px solid ${COLOR_DEEP}` : col < 9 ? "1.5px solid #d8c9e4" : "none", background: filled ? (left ? "#b39ac4" : "#7fa8c9") : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.1s" }}>
                {filled && <div style={{ width: "60%", height: "60%", borderRadius: "50%", background: left ? COLOR_DEEP : "#5b87aa" }} />}
              </div>
            );
          })}
        </div>
      </div>

      <Controls onHear={() => speak(`${a} plus ${b} equals ${c}`, 0.75)} onRedo={putBack} onGot={gotIt} />
    </div>
  );
}

/* ============================================================================
   COUNTING PRACTICE — tap the chart, say each number out loud.
   Sam counted to 43 without error, so early weeks bridge the tricky
   decades (30→60→90→100), then build to the full 1–100. Skip counting
   by 2s to 20 appears twice every week (both are named assessment gaps).
   ============================================================================ */
const RANGE = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const COUNT_SEQUENCES = [
  { label: "1 to 30",     nums: RANGE(1, 30),   by: 1 },
  { label: "30 to 60",    nums: RANGE(30, 60),  by: 1 },
  { label: "60 to 90",    nums: RANGE(60, 90),  by: 1 },
  { label: "80 to 100",   nums: RANGE(80, 100), by: 1 },
  { label: "1 to 50",     nums: RANGE(1, 50),   by: 1 },
  { label: "50 to 100",   nums: RANGE(50, 100), by: 1 },
  { label: "1 to 100",    nums: RANGE(1, 100),  by: 1 },
  { label: "By 2s to 20", nums: [2,4,6,8,10,12,14,16,18,20], by: 2 },
];
// One row per week (Mon–Fri): which sequence each day practices.
const COUNT_SCHEDULE = [
  [0, 7, 1, 7, 1],
  [1, 7, 2, 7, 2],
  [2, 7, 3, 7, 3],
  [4, 7, 5, 7, 5],
  [5, 7, 6, 7, 4],
  [6, 7, 6, 7, 6],
  [7, 6, 7, 6, 7],
  [6, 7, 6, 7, 6],
];

function HundredChart({ seqIdx = 0 }) {
  const seq = COUNT_SEQUENCES[seqIdx];
  const [tapped, setTapped] = useState([]);
  const [wrongTap, setWrongTap] = useState(null);
  useEffect(() => { setTapped([]); setWrongTap(null); }, [seqIdx]);

  const nextExpected = seq.nums[tapped.length];
  const tappedSet = new Set(tapped);
  const done = tapped.length === seq.nums.length;

  const start = seq.nums[0];
  const end = seq.nums[seq.nums.length - 1];
  const dir = end >= start ? "Forward" : "Backward";
  const instruction = `${dir} by ${seq.by}s from ${start} to ${end}`;

  const handleTap = (n) => {
    speak(String(n));
    if (n === nextExpected) { setTapped((t) => [...t, n]); setWrongTap(null); }
    else if (!tappedSet.has(n)) { setWrongTap(n); setTimeout(() => setWrongTap((w) => (w === n ? null : w)), 700); }
  };

  const gridNums = RANGE(1, 100);

  return (
    <div style={{ background: "#f6f3fb", border: "2px solid #d8c9e4", borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <div style={{ textAlign: "center", marginBottom: 12, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {done ? (
          <div style={{ fontSize: 42 }}>🌟</div>
        ) : (
          <div style={{ fontSize: 18, fontWeight: 800, color: COLOR_DEEP, fontFamily: "Georgia, serif" }}>{instruction}</div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 2, marginBottom: 14 }}>
        {gridNums.map((n) => {
          const isTapped = tappedSet.has(n);
          const isLast = tapped[tapped.length - 1] === n;
          const isWrong = wrongTap === n;
          let bg = "white", color = "#ccc", border = "#eee", weight = 400;
          if (isTapped) { bg = "#d8c9e4"; color = COLOR_DEEP; border = "#c4b0d4"; weight = 800; }
          if (isLast) { bg = COLOR; color = "white"; border = COLOR; weight = 800; }
          if (isWrong) { bg = REDO; color = "white"; border = REDO; weight = 800; }
          return (
            <div key={n} onClick={() => handleTap(n)} style={{ aspectRatio: "1", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: weight, background: bg, color, border: `1.5px solid ${border}`, cursor: "pointer", transform: isLast || isWrong ? "scale(1.12)" : "scale(1)", transition: "all 0.12s" }}>{n}</div>
          );
        })}
      </div>

      <button onClick={() => { setTapped([]); setWrongTap(null); }} style={{ ...btn(COLOR), width: "100%", fontSize: 26, padding: "12px 8px" }}>↺</button>
    </div>
  );
}

/* ============================================================================
   MAGIC-E — the silent final e makes the vowel say its long name. Uses the
   same SamDeck card as everything else, with the silent e highlighted.
   ============================================================================ */
const MAGIC_E_WORDS = ["cape","kite","tube","pine","cube","ripe","hope","tape","mane","rode","cane","bike","note","cute","game","vote","wave","dime","home","mule"];
function magicEItems() {
  return MAGIC_E_WORDS.map((w) => ({ parts: { pre: w.slice(0, -1), hi: "e", post: "" }, say: w }));
}

/* ============================================================================
   COINS — penny, nickel, and dime (the exact coins from the assessment).
   Shows the heads (portrait) side as a real photo, sized to the coin's real
   size. He names it + its value, taps 🔊 to check, then ✓ or ↺. Drawn coin
   is a fallback only if the photo can't load.
   ============================================================================ */
const COINS = [
  { name: "Penny",  value: "1¢",  worth: "1 cent",   pennies: 1,  metal1: "#d98a4a", metal2: "#b06a2c", edge: "#8a5523", ink: "#6e3d18", r: 50, person: "Lincoln",   back: "Shield",     px: 118,
    imgThumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/2005-Penny-Uncirculated-Obverse.png/320px-2005-Penny-Uncirculated-Obverse.png",
    imgAlt: "https://commons.wikimedia.org/wiki/Special:FilePath/2005-Penny-Uncirculated-Obverse.png?width=320" },
  { name: "Nickel", value: "5¢",  worth: "5 cents",  pennies: 5,  metal1: "#d8d8dc", metal2: "#aeaeb4", edge: "#8f8f96", ink: "#5a5a60", r: 60, person: "Jefferson", back: "Monticello", px: 134,
    imgThumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Jefferson-Nickel-Unc-Obv.jpg/320px-Jefferson-Nickel-Unc-Obv.jpg",
    imgAlt: "https://commons.wikimedia.org/wiki/Special:FilePath/Jefferson-Nickel-Unc-Obv.jpg?width=320" },
  { name: "Dime",   value: "10¢", worth: "10 cents", pennies: 10, metal1: "#dadade", metal2: "#b4b4ba", edge: "#9a9aa0", ink: "#5a5a60", r: 44, person: "Roosevelt", back: "Torch",      px: 102,
    imgThumb: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/2017-D_Roosevelt_dime_obverse_transparent.png/320px-2017-D_Roosevelt_dime_obverse_transparent.png",
    imgAlt: "https://commons.wikimedia.org/wiki/Special:FilePath/2017-D_Roosevelt_dime_obverse_transparent.png?width=320" },
];

// Clean, recognizable emblem per coin BACK (tails) — simple line art.
function CoinEmblem({ profile, ink }) {
  const s = { fill: "none", stroke: ink, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round", opacity: 0.85 };
  if (profile === "Shield") return <g {...s}><path d="M70 50 l16 6 v12 c0 14 -8 22 -16 26 c-8 -4 -16 -12 -16 -26 v-12 z" /><line x1="70" y1="58" x2="70" y2="88" /><line x1="58" y1="68" x2="82" y2="68" /></g>;
  if (profile === "Monticello") return <g {...s}><path d="M52 70 a18 12 0 0 1 36 0" /><rect x="55" y="70" width="30" height="18" /><path d="M63 60 l7 -9 l7 9" /><line x1="62" y1="74" x2="62" y2="86" /><line x1="70" y1="74" x2="70" y2="86" /><line x1="78" y1="74" x2="78" y2="86" /></g>;
  // Torch
  return <g {...s}><line x1="70" y1="54" x2="70" y2="90" /><path d="M62 54 q8 -12 16 0" /><path d="M58 64 q-7 10 -5 22" /><path d="M82 64 q7 10 5 22" /></g>;
}

// A left-facing profile bust (like a real coin portrait) for the drawn fallback.
function CoinHead({ ink }) {
  return (
    <g fill={ink} opacity="0.85">
      <path d="M95 48 C88 40 74 38 66 44 C58 49 54 57 54 65 C51 67 48 70 45 72 C42 74 43 77 47 78 C50 79 51 81 49 83 C52 84 52 87 55 89 C57 91 59 93 61 97 C63 100 69 102 75 103 L88 103 C93 103 96 99 96 93 L96 48 Z" />
    </g>
  );
}

function CoinFaceDrawn({ coin, side }) {
  const r = coin.r;
  return (
    <svg viewBox="0 0 140 140" style={{ width: 156, height: 156, display: "block" }}>
      <defs>
        <radialGradient id={`g-${coin.name}`} cx="38%" cy="34%" r="75%">
          <stop offset="0%" stopColor={coin.metal1} />
          <stop offset="100%" stopColor={coin.metal2} />
        </radialGradient>
      </defs>
      <circle cx="70" cy="70" r={r} fill={`url(#g-${coin.name})`} stroke={coin.edge} strokeWidth="3.5" />
      <circle cx="70" cy="70" r={r - 5} fill="none" stroke={coin.edge} strokeWidth="1" opacity="0.45" />
      {coin.name === "Dime" && Array.from({ length: 48 }, (_, i) => {
        const a = (i * 7.5 * Math.PI) / 180; const x1 = 70 + r * Math.cos(a), y1 = 70 + r * Math.sin(a);
        const x2 = 70 + (r + 2.5) * Math.cos(a), y2 = 70 + (r + 2.5) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={coin.edge} strokeWidth="1" opacity="0.5" />;
      })}
      {side === "heads" ? (
        <>
          <CoinHead ink={coin.ink} />
          <text x="70" y={70 - r + 12} textAnchor="middle" fontSize="6.5" fontWeight="700" fill={coin.ink} fontFamily="Georgia, serif" opacity="0.75" letterSpacing="0.5">LIBERTY</text>
          <text x="70" y={70 + r - 9} textAnchor="middle" fontSize="9" fontWeight="800" fill={coin.ink} fontFamily="Georgia, serif">{coin.person}</text>
        </>
      ) : (
        <>
          <CoinEmblem profile={coin.back} ink={coin.ink} />
          <text x="70" y={70 - r + 12} textAnchor="middle" fontSize="6" fontWeight="700" fill={coin.ink} fontFamily="Georgia, serif" opacity="0.7">UNITED STATES</text>
          <text x="70" y={70 + r - 9} textAnchor="middle" fontSize="11" fontWeight="800" fill={coin.ink} fontFamily="Georgia, serif">{coin.value}</text>
        </>
      )}
    </svg>
  );
}

// Real coin photo (Wikimedia). Tries the direct CDN image, then a redirect
// URL, and only falls back to the drawn coin if both fail to load.
function CoinFace({ coin }) {
  const sources = [coin.imgThumb, coin.imgAlt].filter(Boolean);
  const [idx, setIdx] = useState(0);
  if (idx >= sources.length) return <CoinFaceDrawn coin={coin} side="heads" />;
  return (
    <img
      src={sources[idx]}
      alt={coin.name}
      onError={() => setIdx((i) => i + 1)}
      style={{ width: coin.px, height: coin.px, objectFit: "contain", display: "block" }}
    />
  );
}

function CoinID() {
  const shuffleCoins = () => { const a = COINS.map((_, i) => i); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const [remaining, setRemaining] = useState(shuffleCoins);
  const [done, setDone] = useState([]);

  if (remaining.length === 0) {
    return (
      <div style={{ background: "#f6f3fb", border: "2px solid #d8c9e4", borderRadius: 16, padding: 24, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 44, marginBottom: 8 }}>🌟</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLOR_DEEP, marginBottom: 12 }}>All done!</div>
        <button onClick={() => { setRemaining(shuffleCoins()); setDone([]); }} style={{ ...btn(COLOR), maxWidth: 200, margin: "0 auto" }}>Start over</button>
      </div>
    );
  }

  const coinIdx = remaining[0];
  const coin = COINS[coinIdx];
  const gotIt = () => { setDone((d) => [...d, coinIdx]); setRemaining((r) => r.slice(1)); };
  const putBack = () => setRemaining((r) => putBackInto(r, coinIdx));

  return (
    <div style={{ background: "#f6f3fb", border: "2px solid #d8c9e4", borderRadius: 16, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#9b8aa8" }}>{done.length}/{COINS.length}</div>
      </div>
      <div style={{ background: "white", border: "3px solid #d8c9e4", borderRadius: 14, padding: "18px 16px", marginBottom: 14, display: "flex", justifyContent: "center", alignItems: "center", minHeight: 168 }}>
        <CoinFace coin={coin} key={coin.name} />
      </div>
      <Controls onHear={() => speak(`${coin.name}. A ${coin.name} is worth ${coin.worth}.`, 0.82)} onRedo={putBack} onGot={gotIt} />
    </div>
  );
}

/* ============================================================================
   DAY BUILDER — maps Sam's weekly objectives to tasks.
   Phonics arc: J/K/Y first (quick win), blends from week 3 (after CVC is
   rolling), vowel teams from week 5, magic-e sprinkled weekly throughout.
   ============================================================================ */
const PHONICS_SCHEDULE = [
  ["jky",    "jky",    "finale", "jky",    "jky"   ],
  ["jky",    "finale", "jky",    "jky",    "finale"],
  ["blends", "jky",    "blends", "finale", "blends"],
  ["blends", "finale", "blends", "jky",    "blends"],
  ["teams",  "blends", "finale", "teams",  "blends"],
  ["blends", "teams",  "blends", "finale", "teams" ],
  ["teams",  "blends", "teams",  "blends", "finale"],
  ["teams",  "blends", "finale", "teams",  "blends"],
];

function samDay(week, dayIdx) {
  const w = week;
  const dayNum = (w - 1) * 5 + dayIdx; // 0..39

  // 1) Sight words — this week's new batch + every word from earlier weeks
  const currentBatch = SIGHT_WORD_BATCHES[w - 1];
  const reviewBatch = w > 1 ? SIGHT_WORD_BATCHES[w - 2] : [];
  const sight = {
    id: `sw-w${w}`,
    label: "👁️ Sight Words",
    sub: w > 1
      ? `${currentBatch.length} new words, plus last week's ${reviewBatch.length} to review. Tap ▼ for the cards.`
      : `${currentBatch.length} words to start. Tap ▼ for the cards.`,
    tool: "deck", deckTitle: "👁️ Sight Words",
    tip: "Read the word out loud FIRST — then tap 🔊 to check.",
    items: wordItems([...currentBatch, ...reviewBatch]),
  };

  // 2) Silly CVC words — 20 nonsense words a day for decoding fluency
  const silly = {
    id: `silly-w${w}d${dayIdx}`,
    label: "🤪 Silly CVC Words",
    sub: "Made-up words! Sound it out, say it, then tap 🔊 to check yourself.",
    tool: "deck", deckTitle: "🤪 Silly Words",
    tip: "These words are MADE UP — just sound them out. (The robot voice does its best!)",
    items: wordItems(sillySetFor(w, dayIdx)),
  };

  // 3) Phonics — rotates through the arc for this week
  const ph = PHONICS_SCHEDULE[w - 1][dayIdx];
  let phonics;
  if (ph === "jky") {
    phonics = { id: `jky-w${w}d${dayIdx}`, label: "🔤 Big letters J, K, Y", sub: "The 3 letters from his assessment (J, K, Y), mixed with letters he already knows.", tool: "deck", deckTitle: "🔤 Big Letters", items: letterItems(dayNum) };
  } else if (ph === "finale") {
    phonics = { id: `magice-w${w}d${dayIdx}`, label: "🔤 Magic-e words", sub: "A silent e at the end makes the vowel say its name (cap → cape). Tap ▼ for the cards.", tool: "deck", deckTitle: "🔤 Magic-e", items: magicEItems() };
  } else if (ph === "blends") {
    phonics = { id: `blends-w${w}d${dayIdx}`, label: "🔤 Blend Words", sub: "Real words with blends like fl, tr, st. Read it, then tap 🔊 to check. Tap ▼ for the cards.", tool: "deck", deckTitle: "🔤 Blends", tip: "Slide the beginning sounds together — f…l…ip → flip!", items: wordItems(blendSetFor(w, dayIdx)) };
  } else {
    phonics = { id: `teams-w${w}d${dayIdx}`, label: "🔤 Vowel teams: ai, ay, ee, ea, oa", sub: "“Two vowels go walking — the first one does the talking.” Tap ▼ for the cards.", tool: "deck", deckTitle: "🔤 Vowel Teams", tip: "The two colored vowels say ONE sound — the first vowel's name.", items: teamItems(w, dayIdx) };
  }

  // 4) Adding to 10 — a new fact family each of the first 6 school days,
  //    then every day mixes all families (cumulative review so facts stick).
  let ff, ffSub;
  if (dayNum < FACT_FAMILIES.length) {
    ff = FACT_FAMILIES[dayNum];
    ffSub = `New family today: ${ff.family}. Tap ▼ for the ten frame.`;
  } else {
    ff = { family: "Mixed review", facts: FACT_FAMILIES.flatMap((f) => f.facts) };
    ffSub = "Mixed review of all your facts to 10. Tap ▼ for the ten frame.";
  }
  const mathFacts = { id: `facts-w${w}d${dayIdx}`, label: `➕ Adding to 10 — ${ff.family}`, sub: ffSub, tool: "tenframe", factFamily: ff };

  // 5) Counting — per the weekly schedule (chunks → full 1–100, plus 2s)
  const seqIdx = COUNT_SCHEDULE[w - 1][dayIdx];
  const counting = { id: `count-w${w}d${dayIdx}`, label: `🔢 Counting — ${COUNT_SEQUENCES[seqIdx].label}`, sub: "Tap ▼, then tap each number in order — and say it out loud!", tool: "hundredchart", seqIdx };

  // 6) Coins — name + value, every day (quick review)
  const coins = { id: "coins", label: "💰 Coins — penny, nickel, dime", sub: "Tap ▼ to play. Name the coin, then tell how much it's worth.", tool: "coins" };

  // 7–9) Daily habits from the assessment plan
  const reading = { id: "reading", label: "📖 20 min reading together", sub: "Pick an easy book (Sam gets about 8–9 of every 10 words). 1) Grown-up reads it. 2) Read it together. 3) Sam reads it back." };
  const ixlMath = { id: "ixl-math", label: "➗ 10 min IXL math", sub: "Goal: 150 in Numbers & Operations, Algebra, and Data & Probability." };
  const ixlLang = { id: "ixl-lang", label: "📚 10 min IXL language", sub: "Goal: 150 in Reading Level, Reading Strategies, and Grammar & Mechanics." };

  return [sight, silly, phonics, mathFacts, counting, coins, reading, ixlMath, ixlLang].map((t) => ({ ...t, core: true }));
}

/* ─── Task row ──────────────────────────────────────────────────────────── */
function TaskItem({ task, checked, onToggle }) {
  const [open, setOpen] = useState(false);
  const hasTool = !!task.tool;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 14px", borderRadius: 12, background: checked ? "#f4f0f0" : "white", border: `1.5px solid ${checked ? "#dfe9e2" : "#efe9f3"}` }}>
        <div onClick={() => onToggle(task.id)} style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, marginTop: 1, border: `2px solid ${checked ? "#6fa37f" : "#cfc4d8"}`, background: checked ? "#6fa37f" : "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          {checked && <span style={{ color: "white", fontSize: 15 }}>✓</span>}
        </div>
        <div style={{ flex: 1, cursor: hasTool ? "pointer" : "default" }} onClick={() => hasTool && setOpen((o) => !o)}>
          <div style={{ fontSize: 16, fontWeight: 700, color: checked ? "#a99fb3" : INK, textDecoration: checked ? "line-through" : "none", fontFamily: "Palatino Linotype, Georgia, serif", marginBottom: task.sub ? 4 : 0 }}>
            {task.label}
            {hasTool && <span style={{ marginLeft: 8, fontSize: 11, background: COLOR_SOFT, color: COLOR_DEEP, borderRadius: 6, padding: "3px 8px", fontFamily: "Georgia, serif", fontWeight: 700 }}>{open ? "▲ hide" : "▼ open"}</span>}
          </div>
          {task.sub && <div style={{ fontSize: 13, color: checked ? "#bbb" : "#8b8190", fontFamily: "Georgia, serif", fontStyle: "italic", lineHeight: 1.5 }}>{task.sub}</div>}
        </div>
      </div>
      {open && (
        <div style={{ margin: "6px 0 0 38px" }}>
          {task.tool === "deck" && <SamDeck items={task.items} title={task.deckTitle} />}
          {task.tool === "tenframe" && <TenFrame factFamily={task.factFamily} />}
          {task.tool === "hundredchart" && <HundredChart seqIdx={task.seqIdx} />}
          {task.tool === "coins" && <CoinID />}
        </div>
      )}
    </div>
  );
}

function DayView({ week, dayIdx, checks, onToggle }) {
  const tasks = samDay(week, dayIdx);
  const dayKey = `w${week}-d${dayIdx}`;
  const done = tasks.filter((t) => checks[`${dayKey}-${t.id}`]).length;
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#b6a8c0", letterSpacing: 1, textTransform: "uppercase", marginBottom: 2 }}>Week {week} · {DAYS[dayIdx]}</div>
          <div style={{ fontSize: 23, fontWeight: 800, color: INK, fontFamily: "Palatino Linotype, Georgia, serif" }}>Today's Plan</div>
        </div>
        <div style={{ background: done === tasks.length ? "#6fa37f" : COLOR, color: "white", borderRadius: 20, padding: "6px 15px", fontSize: 14, fontWeight: 700 }}>
          {done}/{tasks.length} {done === tasks.length ? "🌟" : ""}
        </div>
      </div>
      {tasks.map((t) => (
        <TaskItem key={t.id} task={t} checked={!!checks[`${dayKey}-${t.id}`]} onToggle={(id) => onToggle(`${dayKey}-${id}`)} />
      ))}
    </div>
  );
}

/* ─── Make-Up Log (for parent) — shows past days & whether tasks are done ── */
function MakeUpLog({ checks, onJump }) {
  const [open, setOpen] = useState(false);

  const rows = [];
  for (let w = 1; w <= WEEKS; w++) {
    for (let d = 0; d < 5; d++) {
      const date = dateFor(w, d);
      if (!isPastOrToday(date)) continue;
      const tasks = samDay(w, d);
      const coreOnly = tasks.filter((t) => t.core);
      const key = `w${w}-d${d}`;
      const done = coreOnly.filter((t) => checks[`${key}-${t.id}`]).length;
      const total = coreOnly.length;
      rows.push({ w, d, date, done, total, complete: done === total });
    }
  }

  if (rows.length === 0) return null;

  const missed = rows.filter((r) => !r.complete);

  return (
    <div style={{ marginTop: 30, marginBottom: 20 }}>
      <button onClick={() => setOpen((o) => !o)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1px solid #e8ddf0`, background: "white", color: "#9b8aa8", fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "Georgia, serif" }}>
        📋 Make-Up Log ({missed.length} to catch up) {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{ background: "#fbf9fd", border: "1px solid #e8ddf0", borderRadius: 10, marginTop: 8, padding: "10px 12px" }}>
          {rows.map((r) => (
            <div key={`${r.w}-${r.d}`} onClick={() => onJump(r.w, r.d)}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderBottom: "1px solid #efe9f3", cursor: "pointer", fontSize: 13 }}>
              <div style={{ color: r.complete ? "#4f7a5e" : "#a86a6a" }}>
                {r.complete ? "✓" : "○"} {fmtLong(r.date)} · W{r.w}
              </div>
              <div style={{ fontSize: 11, color: "#9b8aa8" }}>{r.done}/{r.total}</div>
            </div>
          ))}
          <div style={{ fontSize: 10, color: "#b6a8c0", marginTop: 8, fontStyle: "italic", textAlign: "center" }}>
            Tap a day to jump to it.
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [week, setWeek] = useState(1);
  const [dayIdx, setDayIdx] = useState(0);
  const [checks, setChecks] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadChecks().then((d) => { setChecks(d); setLoaded(true); }); }, []);
  useEffect(() => { if (loaded) saveChecks(checks); }, [checks, loaded]);

  const toggle = (key) => setChecks((prev) => ({ ...prev, [key]: !prev[key] }));

  let total = 0, done = 0;
  for (let w = 1; w <= WEEKS; w++) for (let d = 0; d < 5; d++) {
    const tasks = samDay(w, d); const key = `w${w}-d${d}`;
    total += tasks.length; done += tasks.filter((t) => checks[`${key}-${t.id}`]).length;
  }
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#faf7fc", fontFamily: "Georgia, serif" }}>
      <div style={{ background: "white", borderBottom: `3px solid ${COLOR}`, padding: "18px 20px 0", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 2px 12px rgba(90,60,110,0.06)" }}>
        <div style={{ maxWidth: 620, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "#c4b0d4", marginBottom: 2 }}>Summer 2026</div>
            <div style={{ fontSize: 27, fontWeight: 800, color: COLOR_DEEP, fontFamily: "Palatino Linotype, Georgia, serif" }}>🚀 Sam's Learning Plan</div>
          </div>
          <div style={{ background: COLOR_SOFT, borderRadius: 10, height: 9, overflow: "hidden", marginBottom: 3 }}>
            <div style={{ width: `${pct}%`, height: "100%", borderRadius: 10, background: `linear-gradient(90deg, #b39ac4, ${COLOR})`, transition: "width 0.4s ease" }} />
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#b6a8c0", marginBottom: 12 }}>Summer progress: {pct}%</div>
        </div>
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "16px 16px 0" }}>
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#b6a8c0", marginBottom: 6 }}>Week</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {Array.from({ length: WEEKS }, (_, i) => i + 1).map((w) => (
              <button key={w} onClick={() => setWeek(w)} style={{ width: 40, height: 40, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: 700, background: week === w ? COLOR : "white", color: week === w ? "white" : "#9b8aa8", border: `1.5px solid ${week === w ? COLOR : "#e8ddf0"}` }}>{w}</button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#b6a8c0", marginBottom: 6 }}>Day</div>
          <div style={{ display: "flex", gap: 6 }}>
            {DAYS.map((d, i) => {
              const dateStr = fmtShort(dateFor(week, i));
              return (
                <button key={d} onClick={() => setDayIdx(i)} style={{ flex: 1, padding: "8px 4px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 700, background: dayIdx === i ? COLOR : "white", color: dayIdx === i ? "white" : "#9b8aa8", border: `1.5px solid ${dayIdx === i ? COLOR : "#e8ddf0"}`, fontFamily: "Georgia, serif", lineHeight: 1.2 }}>
                  <div>{d.slice(0, 3)}</div>
                  <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>{dateStr}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div style={{ background: "#fdfcfe", borderRadius: 18, padding: "20px 16px", border: "1.5px solid #efe9f3", marginBottom: 32 }}>
          <DayView week={week} dayIdx={dayIdx} checks={checks} onToggle={toggle} />
        </div>
        <MakeUpLog checks={checks} onJump={(w, d) => { setWeek(w); setDayIdx(d); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
        <div style={{ textAlign: "center", color: "#cfc4d8", fontSize: 12, paddingBottom: 24, fontStyle: "italic" }}>Made with love · Summer 2026</div>
      </div>
    </div>
  );
}
