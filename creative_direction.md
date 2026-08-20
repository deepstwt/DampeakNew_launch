# Creative Direction — AI Video Experience

> Companion to [website_overview.md](website_overview.md).
> That doc defines *how it should feel*. This doc defines *what we actually build*.

---

## The Brand

Dampeak is **not** a one-product brand. It sells a growing collection of small,
useful everyday things that make life easier, more comfortable, more productive,
or more enjoyable.

**Four ranges:**

| Range | For | Colour |
|---|---|---|
| Better Focus | Holding your attention together | Blue |
| Better Comfort | Taking the ache out of the ordinary | Orange |
| Better Routine | The same job, with less of the work | Yellow |
| Better Moments | The bit of the day that isn't work | Ink |

**First product:** a stress/anxiety relief squishy toy (Better Focus).

This changes the creative brief in one important way: **the site cannot be built
around a single hero object.** The film, the scenes, and the 3D moment all have to
survive a catalogue that grows in four directions. So the constant is not the
product — it is the **hand**. Every range is something you pick up, squeeze, press,
wipe, carry. That is the through-line the visuals hang on.

Colour is the navigation system. A visitor should learn within one scroll that blue
means focus and orange means comfort, and still know it three pages later.

---

## The Big Idea

**The website is not a page. It is a film that the visitor scrubs with their scroll.**

Instead of a hero video sitting in a box at the top, the entire site is built on a
continuous AI-generated visual narrative. Scrolling does not move the page down —
it moves the story forward. Sections do not "load", they **cut**, like scenes.

The product is never presented as a catalogue item. It is presented as a
**character in a film**.

Working name for the system: **The Reel**.

---

## Three Creative Pillars

### 1. Scroll = Time
The hero is a video whose playback position is bound to scroll position.
Scroll down → the film advances. Scroll up → it rewinds. Stop → it holds on a frame.

The visitor is the editor. They control the pace of the story.

### 2. The Site Reacts to You
AI video is not just decoration — it responds:
- Cursor moves → the shot subtly parallaxes / re-lights
- Hover a product → its own micro-film wakes up and plays
- Idle for 8s → the site drifts into an ambient "dream sequence" loop
- Return visitor → different opening cut than first-time visitor

### 3. Impossible Visuals
AI video lets us shoot things that cannot be filmed. This is where "crazy" lives:
- The product dissolving into liquid and reforming
- The product falling through five different worlds in one unbroken shot
- Macro shots at impossible scale — inside the material, inside the texture
- Environments that morph mid-shot (desert → underwater → chrome void)
- Seasons, weather, and time of day changing in a single continuous take

If it could be shot with a normal camera, we are not being ambitious enough.

---

## Experience Flow (Scene by Scene)

### SCENE 00 — The Ignition (Preloader)
- Black screen. One line of type. One heartbeat of sound.
- A 2-second AI clip of the product materialising from particles.
- Preloader is not a spinner — it is the film's cold open.
- Never longer than 1.8s. It hides the first video buffer.

### SCENE 01 — The Scroll Film (Hero)
- Full-bleed AI video, frame-scrubbed by scroll.
- Large kinetic typography that cuts in and out on beat with the footage.
- Sound toggle in the corner — off by default, but *invited*.
- Ends on a hold frame that becomes the background of Scene 02.

### SCENE 02 — The Reveal
- The camera "lands" on the product.
- Video freezes → seamlessly hands off to a real 3D model (R3F) at the exact
  same camera angle. The visitor doesn't notice the swap. Now they can drag it.
- **This handoff is the signature moment of the site.**

### SCENE 03 — The Living Grid
- Product cards are not images. Each is a silent looping AI micro-film.
- Idle: a slow ambient loop (5s, seamless).
- Hover: cuts to a second, more energetic clip + magnetic pull toward cursor.
- Scroll velocity affects grid: fast scroll = motion blur + desaturation.

### SCENE 04 — Inside the Material
- Scroll-driven zoom that goes *into* the product surface.
- AI-generated macro footage: fibres, grain, coating, light refraction.
- Text overlays the science/craft as the camera keeps descending.

### SCENE 05 — Two Worlds (Before / After)
- Split-screen AI video, draggable divider.
- Left and right are the same shot, two realities. Drag to choose.

### SCENE 06 — The Chorus (Social Proof)
- AI-generated ambient portrait loops behind real customer quotes.
- Faces are stylised/abstract enough to read as art direction, never as fake
  testimonial evidence. **Real quotes, artistic backdrops — never fabricated people
  presented as real customers.**

### SCENE 07 — The Fade Out (Footer)
- The film returns to the opening frame. Loop closed.
- Email capture styled as "join the next scene".

---

## Where Video Lives — Placement Map

Every slot below is a place motion earns its keep. Anything not on this list stays
still. **Video is the exception, not the wallpaper** — if everything moves, nothing
reads as special.

| # | Placement | Type | Length | Trigger | Sound | Weight |
|---|---|---|---|---|---|---|
| 1 | Preloader | Materialise clip | 1.5s | Auto, once | No | ~200KB |
| 2 | Hero | Scroll-scrubbed sequence | 6s of footage | Scroll | Optional | ~3MB |
| 3 | Product reveal | Hold frame → 3D | — | Scroll end | No | — |
| 4 | Category tiles | Ambient loop | 4–5s | In view | No | ≤300KB ea |
| 5 | Product cards | Micro-film | 3s idle / 3s hover | Hover | No | ≤400KB ea |
| 6 | Material zoom | Scroll-scrubbed macro | 4s | Scroll | No | ~1.5MB |
| 7 | Feature strips | Loop beside copy | 5s | In view | No | ≤400KB ea |
| 8 | Before / After | Dual clip, draggable | 4s | Drag | No | ~800KB |
| 9 | Section dividers | Texture pass | 3s | In view | No | ≤200KB ea |
| 10 | Story / craft | Long ambient bed | 12s | In view | Optional | ~1MB |
| 11 | Testimonial bed | Abstract loop | 8s | In view | No | ~400KB |
| 12 | Footer | Opening frame return | 4s | In view | No | ~400KB |
| 13 | Idle state | Drift loop | 10s | 8s no input | No | ~600KB |
| 14 | Nav open | Backdrop motion | 2s | Menu open | No | ~250KB |
| 15 | Empty / 404 | Character moment | 5s | Route | No | ~400KB |

### Placement Rules
- **Max two decoding at once.** Everything off-screen pauses, hard rule.
- **Mobile drops 6, 9, 13, 14** → static frames instead.
- **Hero and material zoom are the only scrubbed pieces.** Everything else loops.
- Every slot ships with a poster frame that stands alone as a real image.
- If a slot's video fails to load, the poster *is* the design. Nothing looks broken.

### Motion Hierarchy
```
LOUD    Hero, Product reveal          — one per page, the moment
MEDIUM  Cards, Before/After, Material — reward for engaging
QUIET   Dividers, Footer, Nav, Idle   — texture, barely noticed
```
Never put two LOUD moments in the same viewport.

---

## Voice & Naming — The UI Must Never Sound Like Software

Nothing the visitor reads should smell like a tech demo. The craft is invisible;
only the feeling is on screen.

### Never appears in the UI
> AI · AI-powered · Generated · Powered by · Smart · Intelligent · Neural ·
> Engine · Algorithm · Immersive · Experience · Next-gen · Revolutionary ·
> Seamless · Cutting-edge · Unlock · Elevate · Discover more · Learn more

### Instead
| Don't write | Write |
|---|---|
| "AI-powered product viewer" | "Turn it over" |
| "Immersive brand experience" | *(delete — just show it)* |
| "Discover our collection" | "See the range" |
| "Learn more" | "How it's made" |
| "Unlock the experience" | "Sound on" |
| "Next-gen materials" | "Woven, not glued" |

### Copy Rules
- **Short. Physical. Concrete.** Nouns and verbs beat adjectives.
- Write like a person who made the thing, not a company that sells it.
- Label buttons with what happens, not with excitement.
- No sentence explains the animation. If it needs a caption, it failed.
- Internal names (The Reel, Scene 02, the handoff) are **for us only** — they never
  reach the screen.

The visuals should read as *expensively shot*, not as *cleverly generated*. If a
visitor's first thought is "how did they make that," we've won. If it's "that's AI,"
we've lost.

---

## AI Video Production Pipeline

### Generation
| Purpose | Tool options |
|---|---|
| Hero cinematic / long takes | Sora, Veo, Kling |
| Product morphs & VFX | Runway Gen-4, Luma Dream Machine |
| Style frames / keyframes | Midjourney, Flux, Nano Banana |
| Image → video motion | Runway, Kling, Luma |
| Upscale & frame interpolation | Topaz Video AI |
| Sound design / score | ElevenLabs, Suno |

### Workflow
1. **Style frames first.** Generate 20–30 stills. Lock the look before any video.
2. **Keyframe pairs.** Start-frame + end-frame → image-to-video for control.
3. **Short clips only.** 3–6s each. Long AI clips drift and break continuity.
4. **Stitch with transitions**, not with prompts. Editorial control beats prompt luck.
5. **Colour grade everything through one LUT.** This is what makes 40 AI clips feel
   like one film instead of 40 experiments.
6. **Upscale last**, encode after.

### Consistency Rules (non-negotiable)
- One camera language: focal length, movement style, shutter feel
- One palette (defined in the style frames, enforced by the grade)
- One lighting logic — a single, consistent key light direction
- The product must be generated from real reference images every time
- Anything AI can't keep accurate (logos, text, fine product detail) is composited
  in afterwards as a real asset, not generated

---

## Technical Implementation

### Stack (extends the overview doc)
```
Next.js (App Router) + TypeScript + Tailwind
GSAP ScrollTrigger    → scroll-scrubbed video timeline
Lenis                 → smooth scroll (feeds GSAP)
Framer Motion         → component-level motion, transitions
React Three Fiber     → Scene 02 handoff, 3D product
Web Audio API         → optional score, scroll-reactive
```

### Scroll-Scrubbed Video — the hard part
Do **not** scrub an HTML5 `<video>` element by setting `currentTime`. It stutters
on almost every device.

Choose one:
- **A — Image sequence (recommended):** export the hero as 120–180 WebP frames,
  preload, and paint to `<canvas>`. Buttery, fully deterministic, works everywhere.
  Cost: ~3–5MB for a well-optimised sequence.
- **B — Fragmented MP4 + `requestVideoFrameCallback`:** smaller payload, but
  inconsistent on iOS Safari.
- **C — Hybrid:** canvas sequence on desktop, plain autoplay loop on mobile.

Ship **C**. Build **A** first.

### Video Encoding Standard
| Use | Format | Notes |
|---|---|---|
| Hero scrub | WebP frame sequence | 1600px wide, quality 78 |
| Ambient loops | AV1 + H.264 fallback | muted, `playsinline`, `loop` |
| Card micro-films | H.264, ≤400KB | poster frame always set |
| Mobile | Half-res variants | never ship desktop bitrates |

### Playback Discipline
- Never more than **2 videos decoding at once** — use IntersectionObserver to
  pause everything off-screen (mobile GPUs will thermal-throttle otherwise)
- Every video has a poster frame; poster loads first, video is lazy
- `preload="none"` below the fold, `preload="auto"` for hero only
- Prefetch the *next* scene's video when the current scene is 60% scrolled

---

## Performance Contract

AI video is heavy. The overview doc demands Lighthouse 95+. Both can be true:

- **LCP is never a video.** It is a poster image or a text headline.
- Hero video starts loading *after* first paint
- Total blocking JS budget: **< 200KB gzipped**
- 3D (R3F) is dynamically imported, desktop-only, and never blocks
- Target: interactive in < 2.5s on 4G mid-tier Android

### Graceful Degradation Ladder
1. Full experience — desktop, good connection
2. Reduced — mobile: loops instead of scrub, no 3D
3. Minimal — `prefers-reduced-motion` or Save-Data: static style frames, no video
4. Baseline — no JS: real HTML, real content, real images. The site still works.

**`prefers-reduced-motion` is respected everywhere. No exceptions.**

---

## Accessibility

Crazy visuals, zero exclusion:
- All video is decorative → `aria-hidden`, never carries unique information
- Any spoken/text content in video is duplicated as real DOM text
- Sound is **off by default**, always toggleable
- No strobing, no flash sequences (photosensitivity)
- Full keyboard path through the site that skips all scroll-jacking
- Scroll-scrubbing never traps the user — keyboard and skip-links always escape

---

## Honesty Rules

Because this is AI-generated media on a commercial site:
- Never generate a fake person and present them as a real customer
- Never generate the product doing something it cannot do
- Product footage used to demonstrate real capability must be real footage
- AI is for **mood, world, and art direction** — not for false claims
- Disclosure lives in the colophon / credits page, worded plainly and once. It does
  not appear in marketing copy, headlines, or anywhere in the main flow — being
  honest doesn't mean advertising the tooling.

---

## Build Phases

**Phase 1 — Look Development**
Style frames, palette, typography, LUT, motion language. No code.
*Output: a locked visual bible + 10 approved style frames.*

**Phase 2 — The Vertical Slice**
Build Scene 01 → 02 only. Hero scrub + the 3D handoff.
If this moment doesn't land, nothing else matters.

**Phase 3 — Full Film**
All scenes, all clips, full grade, sound design.

**Phase 4 — Compression & Polish**
Performance pass, degradation ladder, accessibility audit, Lighthouse.

---

## Open Decisions

1. ~~What is Dampeak?~~ **Answered** — see The Brand above. Four ranges, squishy first.
2. **Sound on or off by default?** Recommend off, but heavily invited.
3. **Scroll-jacking tolerance** — how much control do we take from the user?
   Recommend: scrub the hero only, everything below scrolls naturally.
4. **AI video budget** — generation credits + iteration time is the real cost driver.
5. **3D handoff scope** — one hero product, or several?
