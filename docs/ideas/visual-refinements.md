# Visual refinements: motion and footer

## Objective

Give the public site a motion language of its own, built on the logo's slanted yellow bar and on the brand name (to lock), so that visitors remember the site. Also tidy two places that read badly: the landing sections without a visible title, and the footer. For visitors of the site and the shop, on a pointer device and on a phone.

## Criteria

- Every effect is one of a small set, used the same way everywhere: the yellow bar of links that fills from the left and leaves to the right, the corner brackets that lock onto a card, and a fade.
- Nothing hides content or waits for the effect: the page is complete without motion.
- A visitor who asks for reduced motion sees every state change without movement.
- On a device without hover the cards play their effect each time they come into view.
- No new production dependency.
- The site does not feel slow. Durations are tuned by eye on the finished result; the current rule (at most 320 ms, "fades and slides only") is a starting point, not a limit.

## Options

Large cards, considered on 2026-11-26 with a prototype (a private page with the three options on the real colours and type; not in the repository):

| Option | What it does | For | Against |
|---|---|---|---|
| A. Lock-in | Four corner brackets snap onto the corners with a short overshoot; the photo zooms, the arrow moves | Tells the brand ("lock"); CSS only | The overshoot also shook the title and arrow |
| B. Headlight | The photo darkens and a beam follows the pointer | Closest to the pointer-following effect of the reference (linoswarehouse.pt, a 3D tilt with `perspective(900px)` and `rotateX`/`rotateY`, read 2026-11-26) | Needs a script; dark photo without a pointer |
| C. Holeshot | The slanted bar sweeps the card, then a bar fills under the title; the photo moves against the pointer | Same bar as the navigation | The sweep covers the photo for a moment |

Chosen by the owner: A, Lock-in. Large cards: brackets on the corners; small cards (featured and shop listings): brackets on the image. A combination of A with the bar of C (under the title, along the base of small cards) was prototyped and dropped: too busy.

Page transitions: React's `ViewTransition`, which the App Router supports without configuration (bundled guide `01-app/02-guides/view-transitions.md`, Next.js 16.3.6, read 2026-11-26). No animation library.

Left out: a 3D tilt (the reference's effect, and the most common one), animated icons with Lottie (a dependency, and constant motion distracts in a shop), titles revealed word by word (delays reading).

## Open questions

- The final durations, decided by the owner on the finished result.
- Whether the short shake of the title and arrow of option A stays.

## Outcome

Spec `../specs/006-visual-refinements.md`.
