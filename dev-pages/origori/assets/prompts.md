# Origori asset prompts

Tool: built-in `image_gen.imagegen` (no API/CLI fallback).

Source: the user-supplied Origori character sheet, preserved as `origori-reference.png`.
Initial concept: `origori-hero.webp`, optimized to 1000×1000 with WebP quality 86. This raster is now reference-only; the website uses the redrawn SVG assets under `mascots/`.

## Character generation

Use case: identity-preserve. Asset type: transparent website mascot cutout. The input is the character reference sheet for ORIGORI, a blue and teal origami gorilla. Create one single high-quality isolated full-body ORIGORI gorilla, matching the large top-left reference exactly in character identity: angular folded paper facets, broad shoulders, squat long arms, navy/azure blue front, mint/teal green back and crest, cream white forearms and muzzle, tiny expressive black eyes beneath a white brow. Slightly more relaxed, approachable pose, sitting at rest with both arms on the ground and head tilted subtly with gentle curiosity. Keep the quiet earnest face, do not turn it into a smiling cartoon. Same tactile matte paper folds. Three-quarter frontal view facing slightly left. Center the whole character, occupy 85% of canvas, no clipping. Scene/backdrop: actual transparent alpha background. No floor, no landscape, no text, no logo, no badges, no extra objects, no other characters. Output only one isolated gorilla, not the reference sheet. Soft natural studio lighting with crisp folded paper edges. Colors navy #173b53, blue #237ba4, teal #318575, cream #eee8dc.

The first output had an opaque checkerboard, so it was not used as a transparent asset. The following built-in edit produced the selected artwork.

## Final background edit

Use case: precise-object-edit. Edit the provided gorilla asset. Keep this exact gorilla perfectly unchanged, same pose, facets, colors, shape, lighting, face and proportions. Change ONLY the checkerboard background: replace the entire grey and white checkerboard with one perfectly uniform solid near-white warm paper color #f7f5ef. IMPORTANT no checkerboard anywhere, no texture in the background, no transparency simulation. All gaps between the arms and body should also be filled with the same solid color #f7f5ef. No border, no shadow, no extra objects or text. Add 8% of clear background margin around all four edges so the subject is comfortably contained in the square composition.

The initial selected source image was `exec-4d4669b9-861f-4297-9919-00ef3452fb68.png` in the tool's generation output. It has a solid paper background and was used in the first concept only.

## Transparent extraction attempt — not adopted

Use case: background-extraction. Edit target: the supplied blue-and-teal folded-paper gorilla. Remove ONLY the off-white background, including the holes between arms, torso and legs. Preserve the character's exact pose, silhouette, shape, paper textures, eye expression, colors and lighting. Return an isolated full-body character as a PNG with genuine transparent alpha background (alpha=0 outside the character). No white or grey background, no checkerboard image, no simulated transparency, no backdrop, no floor, no shadow, no border, no text. Crop canvas tightly to the character with only 1 percent transparent padding on each side. This is a reusable website asset to sit on arbitrary light and dark colors. The subject must stay exactly the same, no simplification, no redesign.

Output `exec-5a88f4bc-ee7c-4c04-8e53-40ccaeff2f5a.png` was RGB with no alpha and a baked-in checkerboard. It was rejected. No API/model fallback was used. The adopted icons were instead redrawn as genuine SVG geometry as requested by the user; transparent PNGs are rendered from those vector masters, not extracted from the low-resolution character sheet.
