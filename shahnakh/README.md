# Shahnakh — AI-assisted textile experience

A bilingual Persian/English exhibition landing page exploring the feel of premium sweatshirt fabric through scroll-driven 3D drape, colour previews and optional device tilt.

## Open

Extract the complete folder. Open `index.html` for Persian or `en.html` for English. The compiled site and libraries are bundled locally. Deploy the folder unchanged to an HTTPS static host for device sensor support; no build is required for deployment.

## Features

- Persian RTL and English LTR pages, including form feedback and accessible labels.
- Three-thread brushed fleece hero with a reversible 3D drape and a thin cut edge, without a rolled tube.
- Optional, permission-aware device tilt with calibration, smoothing, bounds, landscape handling and reduced-motion support.
- Animated connected-circle/down-arrow scroll cue, with static reduced-motion presentation.
- Separate two-thread loopback colour preview, 12 swatches, custom picker, zoom and approximate Pantone TCX references.
- Five-field enquiry form, validation, explicit offline state, retry feedback and direct business contact links.

HTML, Tailwind CSS, JavaScript, Three.js, GSAP and a locally hosted Vazirmatn font.

## AI disclosure

The project was created through human direction and iterative feedback using OpenAI Codex and AI-generated fabric imagery. Human input defined the business requirements, visual direction, interaction priorities and revisions. AI assisted with implementation, texture generation and automated checks. Generated visuals are illustrative, not photographs of verified Shahnakh stock. The drape is an art-directed approximation, not a measured textile simulation.

## Release status

**Frontend release candidate; not a fully verified live service.** The enquiry endpoint is intentionally empty in `config.js`: no enquiry is submitted or stored until the owner's team connects a backend. Device tilt requires a supported secure browser and may request permission. Pantone suggestions cover only 12 editorial references, not the full official catalogue or exact colour matching.

Automated DOM, interaction and geometry checks passed. Real-browser screenshots, GPU performance, screen-reader usability and real iOS/Android sensor behaviour remain acceptance checks. See [UX and QA](UX-QA.md) and the [production handoff](PRODUCTION.md) for exact coverage and open items.

## Editing

Edit the Persian HTML and JavaScript, then run `python src/build-english.py` to rebuild the English files from the translation map. Edit `src/input.css` and compile with Tailwind CSS CLI v4 to `assets/styles.css`. Source files and already compiled assets are included.

Automated checks are included in `tests`: with Node.js 24, run `pnpm install --frozen-lockfile`, then `pnpm test`. These use jsdom and an adapter for the renderer, not a GPU or real device. Tests are development-only and unnecessary for viewing or hosting the page.

GitHub Pages: upload this folder's contents to the repository root and publish `main` / root. Keep `.nojekyll`. Configure the final domain before generating printed QR codes.

## Attribution

Brand identity and business details: Shahnakh / SNIRAN. Bundled third-party code and font notices remain in `assets`; see [third-party notes](THIRD_PARTY.md). No blanket licence over the brand, third-party libraries or imagery is implied by publishing this repository.
