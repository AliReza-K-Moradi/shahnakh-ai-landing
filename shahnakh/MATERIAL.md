## Current release candidate — September 17

The rolled/tubular edge is removed. The lower border is now a thin two-sided cut-face strip following the drape normals. Extra forward edge curl is removed; subtle bounded irregularities remain. Device tilt moves the cloth laterally and rotates it slightly, with smoothing in the render loop. Scroll ownership is established synchronously to avoid a competing GSAP transform. Context loss restores the readable static fallback; context restoration resumes the scene. Native 1254 × 1254 face and brushed reverse textures are retained. Below is historical material development documentation, not the current release specification; see PRODUCTION.md and UX-QA.md for release status.

## Texture-only refinement — September 16

The hero front now uses a dedicated flat jersey-face texture at its native 1254 × 1254 resolution, replacing the 512 × 512 crop. The brushed reverse also retains its native 1254 × 1254 pixels. Both are WebP quality 96 and embedded for offline use. Linear relief maps are separate from sRGB base-color maps; anisotropic filtering is raised to 8 where supported. Motion, lighting, layout, and palette are unchanged. These generated textures illustrate three-thread brushed sweatshirt fleece, not a measured or photographed Shahnakh product sample. Seamless tiling is not verified; mirrored repeat is used.

Mode: built-in imagegen generation. Final front prompt: Straight-on macro photograph of the outer jersey face of premium navy three-thread brushed sweatshirt fleece (دورس سه نخ). Fine dense V-shaped cotton knit stitches with discernible twisted yarn and tiny short cotton fibers; tight smooth sweatshirt jersey, not chunky sweater knit. Matte medium-dark navy #23375f. Square 2048 × 2048 requested. Perfectly flat edge-to-edge orthographic texture, uniform stitch scale, even diffuse lighting, seamless if possible. No folds, wrinkles, shadows, seams, text, objects, logos, watermark, terry loops, ribbing stripes, brushed reverse, or satin shine.

Generated front inspected directly; script syntax, embedded assets, and unchanged interaction files checked. Browser visual verification remains unavailable.

Current material: three-thread brushed-back sweatshirt fleece (دورس سه‌نخ پشت‌خارخورده).

## September 16 UX and stability revision (current)

`cloth-motion.js` supersedes the free-running cloth solver. It produces bounded, ordered 3D drape poses directly from scroll progress, retaining Three.js lighting and camera. This prevents the accumulated self-folding seen after reverse scrolling; it is intentionally an art-directed approximation, not a full cloth-physics solver. Twenty forward/reverse cycles were numerically checked at mobile and desktop proportions for repeatable poses and ordered finite geometry.

The front now uses `fleece-face.webp`, a fine knit-face material patch extracted from the existing generated three-thread fleece image; the reverse retains the dedicated brushed texture. These are still illustrative rather than a photographed sample from Shahnakh inventory.

The visible scroll hint is higher, the header cooperation button is gold, and cooperation is section 03 directly after the palette. Exhibition is section 04. Palette controls include a native color picker, editable six-digit HEX code, copy with a manual-copy fallback, on-image code and transfer of the selected code into the enquiry. Hue transitions take 280–420 ms. Pure white retains highlight headroom. The form payload now includes `selectedColor`.

This update received syntax, local-reference, document-order and numerical motion checks. No new browser visual verification is claimed. Older descriptions below are historical.

## Current 3D rebuild

The latest hero replaces `fabric-pull.js` with `cloth-solver.js` and `cloth-scene.js`, using locally bundled Three.js r180. True perspective projection, physical rough cloth materials, independent front/back surfaces and directional shadow mapping now render a simulated mesh. A position-based solver applies gravity, drag, structural/shear/bend constraints, moving attachments and scroll-driven gathering. The old forced curl formulas are no longer connected to the page. The generated backing remains a small-scale material map, not a photograph of folds. The front uses fine knit bump relief. Reduced-motion and WebGL-unavailable modes retain static content.

This is a realtime cloth approximation without self-collision or measured product parameters, not a claim of physically exact fabric. Numerical checks cover finite positions, bounded stretch, reverse motion and complete content reveal at the end. Browser visual QA for this rebuild has not been performed.

The palette now uses more saturated colors and HSL interpolation, deliberately taking the hue path through green/yellow between blue and red. The endpoints stay exact, and reduced-motion skips the transition. White retains tonal headroom. Technical references: [Three.js PerspectiveCamera](https://threejs.org/docs/pages/PerspectiveCamera.html), [MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html). Older entries below describe superseded versions.

Hero, splash, palette and detail image use `assets/fleece.webp`. The rolled reverse samples the brushed region of this image. Broader folds, slower response, a rounded thicker hem and diffuse lighting replace the satin treatment. This is atmospheric generated artwork, not an actual Shahnakh product photograph.

Image generated with the built-in imagegen tool. Final prompt: Premium photorealistic deep navy #1b2456 three-thread sweatshirt fleece, broad heavy soft folds, fine matte cotton knit face, lower-left folded corner revealing dense short brushed fleece reverse. Wide 16:9 textile editorial close-up fills frame, subtle side lighting, darker quiet right region for white overlay text. No shine, terry loops, shag fur, objects, text, logos, or watermark.

The reverse now uses a dedicated `assets/fleece-back.webp` material texture, embedded for direct offline use. Material-coordinate mapping, mipmaps and optional anisotropic filtering preserve fine fibers around the fold. The grip leads the lift while corners lag, and the fold radius varies across the width.

Backing texture generated with built-in imagegen. Prompt: Straight-on macro photograph of dark navy #1b2456 brushed-back three-thread sweatshirt fleece. Dense very short fine raised cotton fibers, uniform diffuse lighting and tiny-scale grain. Square tileable material, no perspective, folds, loops, shag, seams, objects, text or baked-in shadows. Native generation 1254 × 1254; delivered as a 1024 × 1024 texture for WebGL mipmaps and repeat compatibility.

This material revision was checked for script syntax and local asset references. A browser preview was blocked by the browser tool's local-file URL policy, so no new visual browser verification is claimed.

Corner revision: side boundaries now bow along their height and roll inward in depth. The two corners use separate damped springs with response determined by grip proximity. A stronger bottom return, projected corner rounding and lift-dependent shadow address the straight-cut silhouette in the user's screenshot. Hero copy is fully hidden during the reveal. This remains an art-directed real-time mesh approximation, not measured cloth physics. Corner motion was numerically checked across 30/60/120/144 Hz and forward/reverse scroll; this revision has not been visually browser-tested.

Palette section update: an independent square photo (`assets/two-thread.webp`) shows TWO-thread unbrushed French terry with loopback reverse, distinct from the brushed three-thread hero. The six existing colors are retained, followed by sky blue, olive, terracotta, cocoa, sand and charcoal. An SVG luminance transfer replaces the old hue/invert filters. Milky white retains a 0.38 tonal range without clipping highlights. Color changes ease over 360 ms (instant under reduced motion). A 1–2.5× slider plus pointer/keyboard panning exposes knit detail; touch panning preserves vertical page scrolling.

Palette image generated with built-in imagegen. Final prompt: Photorealistic premium TWO-THREAD unbrushed French terry sweatshirt cloth, medium neutral cool gray. Matte fine smooth jersey face and a generously folded-over edge clearly showing small regular unbrushed cotton loopback underside, no fleece nap. Close-up stack of two soft curved folds diagonally crossing the square frame. Soft studio side illumination, moderate contrast, no blown highlights, text, labels, logos, watermark, objects or synthetic shine. Native output 1254 × 1254; saved as WebP. This remains illustrative material imagery and color, not an inventory or exact-dye guarantee.

## Lighting and rounded-edge refinement

The hero now uses a denser drape mesh (56/88 columns, 48 rows), reduced ambient fill, a subtle cool rim, matte cotton sheen and cloth self-shadow reception. Desktop shadow maps use 2048 pixels; mobile uses 1024. A narrow rounded 3D strip closes the bottom edge, following the surface normals with small deterministic thickness variation. Bounded edge ripples and slight edge lift preserve ordered rows/columns; no accumulated physics state is introduced. Existing native-resolution front and brushed-back images remain unchanged, as do the Pantone controls. This is an art-directed approximation of fleece, not a physically measured cloth simulation. Browser visual verification was unavailable; numerical reversibility and code checks were used.
