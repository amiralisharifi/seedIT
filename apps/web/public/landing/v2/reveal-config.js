// Shared scroll-reveal threshold — the ONE place the trigger line lives.
// Both motion.js (scrubbed word/section reveals) and scroll.js (giant footer
// one-shot) read window.__REVEAL, so the trigger point is set once and reused.
// Loaded before those two modules; each also keeps an inline fallback in case
// this file is slow, so the values here stay authoritative without being a
// single point of failure.
//
//  line — viewport fraction (from the top) where a reveal is centred / fires.
//         A reveal is essentially complete as the element's top crosses this
//         line — ~58% down, right where the eye rests — instead of up near the
//         top, where it used to land and felt late.
//  lead — how far below the line (as a viewport fraction) the scrub begins, so
//         the animation plays *as* the element rises to the line.
window.__REVEAL = { line: 0.58, lead: 0.32 };
