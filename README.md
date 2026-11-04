# NANHER HEW 文 — ENTER THE CONSCIOUSNESS / V6

Reconstructing Nanher Hew as a minimal mental archive, inspired by classified
computer interfaces with its own black-and-red aesthetic. Static HTML/CSS/JS.

## Publishing to your existing GitHub Pages repository

Replace the repository's root files:

- `index.html`
- `style.css`
- `script.js`

**Keep your existing `arts/` directory** (it is not duplicated in the ZIP).
All paths are relative to the repository root, and the project does not need
Node.js, Supabase, a build step, or a backend.

The existing assets expected in `arts/` are:

```
arts/age-banner.jpg
arts/hero.PNG               ← exact uppercase PNG extension
arts/01.jpg … arts/08.jpg
arts/wip01.jpg
arts/wip02.jpg
arts/ambient.mp3            ← optional personal music, not bundled
```

If publishing in a subdirectory, keep `index.html`, `style.css`, `script.js`,
and `arts/` alongside each other.

## New visitor experience

1. **Initialization:** a short sequence displays `ACCESSING NANHER'S MIND`,
   a progress meter, and `70% / ALMOST DONE..` during loading.
2. **Combined warning / invitation:** explains that this is a mental portfolio
   of character art and requires a conscious **18+ confirmation**. No separate
   lengthy intro. The acknowledgement is remembered in sessionStorage for the
   browser tab/session (with graceful storage failure handling).
3. **Access granted:** fullscreen NANHER HEW identity and ONE complete
   `arts/hero.PNG` drawn in front of the name, with full opacity and no duplicate
   background/foreground image layers.

**Important:** the character image must contain transparency if you want
its *shape*, rather than a rectangle, to pass in front of the text. We cannot
change the pixels inside your original artwork through CSS. The original PNG
was not provided in this ZIP because it is already in your GitHub repo.

## Interface controls

- `[ + ] INTERFACE` opens a compact toolbar; clicking it again hides everything.
- `01 / NODES` opens the small navigation window at the top of the screen.
- `02 / FEED` opens the compact context monitor window.
- `03 / DETAILS` temporarily reveals extra home-page actions/details.
- The windows have real close buttons and close by clicking outside.
- Press `H` to hide/show the toolbar, `1`–`6` to navigate, `Esc` to close a
  window or the lightbox, and arrow keys for previous/next artwork.
- Selecting an access node opens its content and hides the controls again.
  To return to the fullscreen hero, open NODES → OVERVIEW or press `1`.
- No controls are forced onscreen except the small INTERFACE handle.

## Music and sound

Place **`ambient.mp3`** in your existing `arts/` folder. The browser plays it
in a loop at volume **18%** after the visitor presses the entry button.
If missing or blocked, the page uses a quiet synthesized fallback using Web
Audio API (3 oscillators and occasional soft notes).

The visitor can toggle `AUDIO OFF / MUSIC ON / AMBIENT ON` after opening the
interface. Sound is never started automatically before a click.

## Existing content and functionality

- Recent Works uses `01.jpg` through `04.jpg`.
- Archive uses `05.jpg`–`08.jpg`, `02.jpg`, `03.jpg`, `wip01.jpg`, `wip02.jpg`.
- Archive filters, image lightbox, Identity, commissions, prices, and social links
  are preserved/adapted.
- Commission prices are unchanged: Sketch $15; Headshot $20; Bust $25;
  Half Body $35; Full Body $45. Add-ons: extra character +$25,
  complex background +$15, commercial use +50%.
- Discord direct contact: `https://discord.gg/bzENFbeE`.
- No internal commission forms, tracking UI, Supabase, authentication, or
  external database requests.

## Performance changes

- Removed the three repeated hero layers and their heavy blending/masks.
- Only **one image** is rendered, at 100% opacity.
- No continuous requestAnimationFrame parallax loop. Pointer movement updates
  a small transform only when necessary, capped to one frame per event batch.
- No full-screen noise textures, costly blur overlays or continuous glitch effects.
- Short intro and module transitions; respects `prefers-reduced-motion`.
- On touch devices parallax only activates via the explicit motion permission
  control where orientation input is available.

## Validation and remaining manual checks

Browser interaction checks: 320, 360, 390, 430, 768, 1024, 1280, 1440,
and 1920px screen widths. Checks covered startup, 18+ gate, module popups,
archive filters, lightbox, and horizontal overflow, with no JavaScript page
errors in these tests.

**Still verify manually on GitHub Pages:** actual illustration transparency,
real image network loading, your own optional MP3, iOS motion permission, and
actual performance on the laptop where the previous version lagged.
