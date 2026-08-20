# Video Prompts — Dampeak Squeeze Toy

> Live-action look. Photoreal, cinematic, premium — **not** illustrated, not cartoon,
> not a 3D render. See [creative_direction.md](creative_direction.md) for the rules
> these follow.
>
> Subject: one man, around 25. Keep him the same person in every shot.

---

## The Rules Before You Generate

1. **Short clips only.** 4–6 seconds each. Longer and the model drifts — his face
   changes, the object morphs, the room rearranges itself.
2. **Hands are the danger.** This product is squeezed, so hands are in almost every
   shot — and hands are the single thing AI video gets wrong most often. Favour
   mid-shots over extreme finger close-ups, and generate 4–6 takes of any grip shot.
3. **One person, locked.** Generate a character reference still first, then use
   image-to-video for every shot so he stays the same man.
4. **No text in-frame.** Type is added in post. Ask for text and you get gibberish.
5. **Grade everything through one LUT** at the end. This is what makes eight
   separate clips feel like one film.

---

## Master Style Block

*Paste this into every prompt, then add the shot description.*

```
Photorealistic live-action commercial cinematography. Shot on ARRI Alexa,
35mm lens, shallow depth of field, natural handheld micro-movement.
Soft diffused north-facing daylight through a large window, gentle falloff,
no hard shadows. Warm neutral palette — off-white walls, pale oak, matte
concrete — with a single accent of cobalt blue. Calm, unhurried, premium.
Fine 35mm film grain, subtle halation, natural skin texture with visible pores.
Colour graded clean and slightly warm. 24fps, cinematic 2.39:1 framing.
```

## Master Negative Prompt

*Use on every shot.*

```
cartoon, anime, illustration, 3D render, CGI, animated, claymation, plastic
skin, waxy skin, airbrushed, uncanny face, distorted hands, extra fingers,
fused fingers, morphing object, warping background, text, captions, subtitles,
watermark, logo, brand name, oversaturated, HDR, teal-and-orange grade,
fisheye, fast zoom, jump cut, stock-footage smile, crowded frame
```

---

## The Film — Eight Shots, ~30 Seconds

### 01 · The pressure (5s)
```
A 25-year-old man sits at a clean white desk in a bright modern apartment,
lit by a large window. He is still, looking at a laptop, jaw slightly tight,
one hand resting flat on the desk. Slow push in on his face. He exhales.
```

### 02 · The reach (4s)
```
The same man's hand moves into frame and picks up a small soft yellow
squeeze ball from beside the laptop. Mid-shot from the side, camera static,
shallow focus on his hand and the object. Unhurried, natural motion.
```

### 03 · The squeeze (5s) — *generate extra takes*
```
Close-up on a man's hand slowly closing around a soft yellow foam ball.
The ball compresses between his fingers, then slowly returns to shape as he
releases. Side lighting, dark neutral background, shallow focus on the object.
Single continuous motion, no cuts.
```
> Hands fail most often here. Generate 6+ takes and keep the two cleanest.

### 04 · The release (4s)
```
Medium close-up of the same 25-year-old man leaning back in his chair,
shoulders dropping, eyes closing briefly as he breathes out. Warm window
light across his face. Camera holds still. Small, real, no performance.
```

### 05 · Back to it (4s)
```
The same man sets the yellow ball down beside his keyboard and returns his
hands to typing. Over-the-shoulder wide, tidy desk, plant and a glass of
water in soft focus. He is relaxed now, posture open.
```

### 06 · In the pocket (4s)
```
The same man walks through a bright hallway, drops the small yellow ball
into his jacket pocket without looking. Tracking shot at waist height,
shallow focus, morning light. Casual, everyday.
```

### 07 · The object alone (5s)
```
Product shot. A soft matte yellow foam ball resting on a pale oak surface,
slowly rotating. Soft top light, deep shadow, seamless off-white background.
Macro detail of the matte foam texture. No hands, no people.
```

### 08 · The close (4s)
```
Wide shot of the same man at his desk by the window, seen from across a
calm, uncluttered room. He is working, at ease. Camera slowly pulls back.
Soft daylight, negative space in the upper third of the frame.
```
> Leave the upper third empty — the end-card type goes there in post.

---

## One-Shot Version (if you only generate one clip)

```
Photorealistic live-action commercial cinematography, 35mm lens, shallow
depth of field. A 25-year-old man in a soft grey knit sweater sits at a
clean white desk in a bright modern apartment. He picks up a small soft
yellow squeeze ball, closes his hand slowly around it, then releases and
leans back with an easy exhale. Soft diffused daylight from a large window,
warm neutral palette, calm and unhurried. Fine film grain, natural skin
texture, subtle handheld movement. 24fps, cinematic framing.
```

---

## Casting and Wardrobe

Keep him ordinary and specific — vague prompts produce a stock-photo face.

- **Age** 25. **Look** relaxed, slightly tired at the start, at ease by the end.
- **Wardrobe** soft grey or oatmeal knit, plain crew neck, no visible branding,
  no pattern. Nothing that dates.
- **Grooming** natural, light stubble, hair not styled.
- **Never** a wide toothy smile to camera. He is in his own morning, not selling.

---

## Set and Props

- Bright apartment, off-white walls, pale oak, one plant, one glass of water
- A **tidy** desk — the product is about reducing clutter, so clutter contradicts it
- One cobalt-blue object in frame as the accent — a mug, a notebook, a chair
- No visible logos, screens with readable content, or other brands

---

## Sound

Add in post, never generated with the picture.

- Room tone, a distant street, a keyboard
- One soft compression sound on the squeeze — the hero sound of the film
- Sparse piano or warm pad, low in the mix
- **No voiceover.** The film says nothing the picture doesn't.

---

## Platform Notes

| Tool | Best for | Watch out |
|---|---|---|
| Veo | Full shots with people, best hands | Rejects some prompts as person-generation |
| Sora | Camera moves, continuity across shots | Drifts past ~6s |
| Kling | Image-to-video from a locked character still | Over-smooths skin — dial down |
| Runway Gen-4 | Shot 07, the object alone | Weak on realistic faces |
| Topaz | Upscale and 24→48fps at the very end | Never before the grade |

---

## Honesty Check

Per [creative_direction.md](creative_direction.md):

- This film shows **mood** — a person having an easier morning. It must not imply
  a medical or clinical outcome.
- The man is AI-generated and must never be captioned as a real customer or
  presented as a testimonial.
- Keep the disclosure in the site colophon, not in the film.

---

## If You Want the Stylised Version Instead

If the brief is animation rather than live action, swap the master style block for
this and drop the negative prompt's anti-cartoon terms:

```
Modern 3D animation, soft matte clay-like shading, rounded friendly forms,
warm neutral palette with cobalt blue, orange and yellow accents. Clean
studio lighting, gentle ambient occlusion, shallow depth of field.
Calm and premium — closer to a design-studio explainer than a children's
cartoon. No outlines, no exaggerated squash and stretch, no bouncy timing.
```
