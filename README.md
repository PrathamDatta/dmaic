# dMaic Innovations: Website Redesign

A fully animated, single-page redesign of https://dmaicinnovations.com/demo/ built with the site's
original content (home, About Us, Turnkey Solutions, Contact and all 11 product pages).

## Run it
Static site, no build step. Open `index.html` directly, or serve the folder:

    python3 -m http.server 8000   # then visit http://localhost:8000

To deploy, upload the whole folder (index.html + assets/) to any web host, e.g. the existing cPanel/Apache server.

## Animation stack (bundled locally in assets/vendor, no CDN needed)
| Plugin | Used for |
|---|---|
| GSAP 3.12.5 | All timelines, preloader, char/line reveals, counters |
| ScrollTrigger | Pinned Grain Journey, horizontal Turnkey scroll, parallax, scrubbed effects |
| Flip | Animated product filtering |
| Lenis 1.1.13 | Inertial smooth scrolling |
| SplitType 0.3.4 | Splitting headlines into chars / words |
| Three.js r149 | WebGL "grain shower" particle field in the hero (mouse-reactive) |
| vanilla-tilt 1.8.1 | 3D tilt + glare on product and pillar cards |
Fonts: Unbounded, Manrope, JetBrains Mono (Google Fonts).

## Sections
1. Preloader with falling grains and % counter, shutter reveal
2. Hero: WebGL grain particles, Ken Burns plant-photo slideshow, split-letter headline, live HUD
3. Crop marquee + animated stat rings (2018 / 20+ / 30+ / 11)
4. About: scroll-scrubbed word highlight, clip-path image reveal, spinning badge, tilt cards
5. **Infographic: The Grain Journey**, a pinned, scroll-driven processing line (Intake, Elevator, Pre Cleaner, Fine Cleaner, Destoner, Gravity Separator, Clean Seed) with flowing grains and a purity meter
6. Products: filterable grid (Flip), each card opens a slide-in drawer with the full original specs
7. **Engineering infographics**: bouncing rubber-ball screen cleaning, spinning Punkofan impeller + power comparison, gravity-deck heavy/light separation, Destoner 4-control dials, material layers, modular blocks
8. **Crop orbit**: rotating rings of supported crops
9. Turnkey: pinned horizontal scroll of the 10 support functions + R&D
10. Parallax gallery, radar-map contact section, giant footer wordmark

Respects `prefers-reduced-motion`; the custom cursor and tilt are disabled on touch devices.

## Notes
- The "Grain Journey" is presented as "a typical processing line", built from the machine descriptions.
- The Punkofan power bars are labelled illustrative; the original site gives no figures.
- The secondary phone number (+91 8147109250) is commented out on the original site, so it is left out here.
