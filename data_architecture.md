# Data Architecture

> Companion to [website_overview.md](website_overview.md) and [creative_direction.md](creative_direction.md).

---

## The Honest Answer First

This site is **~90% read-only**. Products, scenes, copy, and video are written once
by us and read a million times by visitors. There is very little truly *dynamic*
data.

That means the database is **not** the interesting problem here. The interesting
problems are **content modelling** and **video delivery**. Picking a fashionable
database and hand-rolling a CMS would be solving the wrong thing.

So the answer is three layers, not one:

```
CONTENT   → Sanity          products, scenes, copy, video references
DATA      → MongoDB Atlas   signups, reviews, likes, events
MEDIA     → Mux + R2        video encoding, delivery, images
```

---

## Layer 1 — Content: Sanity

Everything a non-developer should be able to change without a deploy.

**Why Sanity over the alternatives**
- Structured content, not a page builder — matches our scene-based model exactly
- Real-time collaborative studio, hosted, zero infra for us
- GROQ queries return exactly the shape the component needs, no over-fetching
- Its CDN + Next.js ISR means content reads cost us nothing at runtime
- Free tier covers this project comfortably

**Strong alternative now that we're on Mongo — Payload CMS.** Payload runs *inside*
our Next.js app and uses MongoDB as its native store. That would collapse Layer 1
and Layer 2 into one database, one connection, one deploy, and give us a real admin
panel over our own collections for free.

| | Sanity | Payload + Mongo |
|---|---|---|
| Setup speed | Fastest | Moderate |
| Databases to run | 2 | **1** |
| Content CDN | Included | We handle it |
| Admin over our own data (reviews, waitlist) | Separate build | **Included** |
| Cost | Free tier | Free (our infra) |
| Editor experience | Best in class | Very good |

**Recommendation: Payload**, given the Mongo decision. One database for content and
data, a moderation dashboard we'd otherwise have to build by hand, and no second
vendor. Sanity stays the fallback if the editing experience turns out to matter more
than consolidation.

The content model below is identical either way.

**Not Contentful** (priced for enterprise), **not raw MDX** (breaks the moment a
non-developer needs to change a headline).

### What lives here
```
product          slug, name, tagline, story, specs[], gallery[],
                 videoRefs[], colorway[], order, featured
category         slug, name, ambientVideoRef, products[]
scene            key, headline, body, videoRef, posterRef, motionTier
page             slug, seo, sections[]  (scene references, ordered)
material         name, description, macroVideoRef
faq              question, answer, order
globals          nav, footer, colophon, socials
```

Note `videoRef` — Sanity stores the **Mux playback ID and poster**, never the file.
Video never touches the CMS asset pipeline.

---

## Layer 2 — Data: MongoDB Atlas

The genuinely dynamic, per-visitor data.

**Why it fits here.** Our writes are independent documents that nobody joins across:
a signup, a review, an interaction event. Reviews carry nested media and variable
fields; events carry a free-form `meta` blob that will change shape every time we
add a scene. Document storage handles both without a migration, and everything the
visitor *reads* is served from cache anyway — so the relational strengths we're
giving up are ones this site was never going to use.

**Use MongoDB Atlas**, not self-hosted. Managed backups, free M0 tier to start,
scales to M10 without a migration.

### Collections
```js
subscribers   { _id, email, source, createdAt, confirmedAt }
reviews       { _id, productSlug, name, rating, body, status,
                media: [{ url, type }], createdAt }
likes         { _id, productSlug, visitorHash, createdAt }
waitlist      { _id, productSlug, email, createdAt }
events        { _id, name, productSlug, sessionHash, meta: {}, createdAt }
contact       { _id, name, email, message, createdAt }
```

Review media is **embedded**, not a second collection — it is always read with its
parent and never queried alone. That embed is the whole reason Mongo suits this.

### Indexes — do these on day one
```js
subscribers.createIndex({ email: 1 }, { unique: true })
waitlist.createIndex({ productSlug: 1, email: 1 }, { unique: true })
likes.createIndex({ productSlug: 1, visitorHash: 1 }, { unique: true })
reviews.createIndex({ productSlug: 1, status: 1, createdAt: -1 })
events.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })  // 90d TTL
events.createIndex({ name: 1, createdAt: -1 })
```
The unique indexes are what enforce "one signup per email" and "one like per
visitor" — Mongo will not do it for us otherwise. The TTL index stops `events` from
growing forever.

### Access layer
- **Mongoose** for schemas, validation, and typed models — worth it here because
  document DBs give you no schema safety by default
- **Zod at the API boundary** — validate every request body before it reaches Mongo.
  Non-negotiable: with no column types, bad data gets in silently
- **Cache the connection on `globalThis`** in dev and serverless, or Next.js hot
  reload will open a new pool on every request and exhaust Atlas connection limits
- Set `maxPoolSize: 10` for serverless; the default is far too high per instance

### Rules
- `reviews.status` is `pending | approved | rejected` — nothing shows unmoderated
- `visitorHash` / `sessionHash` are salted hashes, not raw IPs. No PII in `events`
- All writes go through server-side route handlers. **Atlas is never reachable from
  the browser** — no public API key, no client-side driver
- Atlas Network Access locked to our deploy IPs, database user scoped to one DB
- `events` is a cheap product-interest signal (which scenes hold attention, which
  products get replayed), not a full analytics platform

---

## Layer 3 — Media: Mux + Cloudflare R2

**This is the layer that actually decides whether the site succeeds.**

We are shipping ~15 video slots. Serving those as files from our own origin will
kill the Lighthouse target and the bandwidth bill at the same time.

| Asset | Where | Why |
|---|---|---|
| All video | **Mux** | Per-device encoding ladders, adaptive delivery, instant playback, real playback analytics |
| Hero frame sequence | **R2** | Static WebP frames, zero egress fees, cached at edge |
| Images / posters | **Sanity CDN** | Already there, on-the-fly transforms |
| 3D models (.glb) | **R2** | Big, static, rarely change |

**Cloudflare Stream** is the cheaper alternative to Mux if we don't need playback
analytics. Mux's per-title data tells us which scenes people actually watch — worth
paying for during the first months, revisit after.

**Never self-host the video.** Not from `/public`, not from the Next.js server.

---

## Caching Strategy

```
Static scenes / product pages   SSG + ISR, 60s revalidate
Content updates                 Sanity webhook → on-demand revalidate
Review lists                    ISR, 5 min
Form posts                      Route handlers, no cache
Video / images                  Immutable, edge-cached, hashed URLs
```

Result: a visitor's page load hits **zero databases**. Mongo is only touched on write
and on the moderation dashboard — which is exactly why the free Atlas tier carries
us far longer than traffic numbers would suggest.

---

## The Fork: Are We Selling?

The overview says storytelling over "a traditional shopping experience" — which
leaves this genuinely open.

**If there is no checkout (recommended for v1)**
Ship exactly what's above. Products are content. "Where to buy" links out, or a
waitlist captures intent. Simple, fast, cheap.

**If there is checkout**
Do **not** model products, inventory, prices, and orders in our own MongoDB — that is
a year of work we'd do badly, and money movement is the one place where the lack of
transactions and constraints genuinely bites. Instead:

```
Shopify (headless)  →  source of truth for products, inventory, cart, orders
CMS                 →  the story layer, joined to Shopify by product handle
MongoDB             →  unchanged; still just signups, reviews, events
```

Shopify Storefront API + Hydrogen-style cart in Next.js. Our creative layer sits on
top and Shopify never renders a pixel.

**Decision needed before Phase 2 of the build** — it changes the content model but
nothing else in this doc.

---

## Full Stack Summary

```
Next.js (App Router) · TypeScript · Tailwind
Payload CMS           content        (Sanity = fallback)
MongoDB Atlas         data
Mongoose + Zod        models & validation
Mux                   video
Cloudflare R2         frames, models, static heavy assets
Resend                transactional email
Upstash Redis         rate limiting on public forms  (only if abuse appears)
Vercel                hosting
```

Cost at launch scale: effectively free except Mux and Vercel.

---

## Working With Mongo — Things That Will Bite Us

Choosing a document store moves work from the database into our code. Budget for it:

1. **No schema enforcement.** Mongoose + Zod are not optional here, they are the
   replacement for column types. Skip them and we ship corrupt documents.
2. **Uniqueness is index-only.** Duplicate emails and double-likes get in unless the
   unique indexes above exist *before* launch.
3. **Serverless connection storms.** Cache the client globally, cap `maxPoolSize`.
   This is the single most common way a Next.js + Atlas app falls over.
4. **No joins.** Denormalise on purpose — store `productSlug` on every document
   rather than an id we'd have to look up.
5. **Aggregation for anything analytical.** Review averages and event rollups are
   `$group` pipelines, not `AVG()`. Fine, just less familiar.
6. **Migrations are our job.** Changing a document shape means writing a script;
   nothing warns us that old documents don't match the new model.

None of these are blockers at our scale. They're just the bill for the flexibility.

---

## What We Are Deliberately Not Using

- **Firebase** — vendor lock-in, weak querying, poor fit with Next.js SSG
- **Mongo as a cache layer** — ISR already covers reads; don't invent a second one
- **A self-built CMS** — Payload gives us the admin panel for free
- **Redis for caching** — only add it for rate limiting, if abuse appears
