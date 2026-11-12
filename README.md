# shounakjoshi88-a11y.github.io

Live at **https://shounakjoshi88-a11y.github.io**

One hand-written HTML file: no framework, no build step, no dependencies, nothing tracked.
The hero ring and the five project demos are canvas, drawn by a single `requestAnimationFrame` loop.

The loop — plan, execute, verify, retry — is the site's motif at three scales: the brand mark,
the scroll-driven section, and the demos themselves. Each demo runs the project's actual hard
problem: the verifier catching a bad extraction, OCR noise being refused, two users racing for
one seat, `server` becoming `waiter` and being reverted, triage bugs becoming regression tests.

## Editing

Everything lives in `index.html`. Open it in a browser, or serve the folder:

```
python -m http.server
```

## Deploying

GitHub Pages from the `main` branch, root folder. Push and it ships.
