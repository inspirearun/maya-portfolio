# images/

Real assets used by the site.

| File | Used by |
|---|---|
| `portrait-maya.jpg` | About section portrait (`.about__photo` in `index.html`) |
| `project-tide-budgeting.jpg` | Tide Budgeting card (`.card__thumb--one` in `styles/main.css`) |
| `project-clearpath-clinics.jpg` | Clearpath Clinics card (`.card__thumb--two`) |
| `project-kindle-learning-kit.jpg` | Kindle Learning Kit card (`.card__thumb--three`) |
| `project-greenline-reports.jpg` | Greenline Reports card (`.card__thumb--four`) |
| `og-image.png` | Social share image (1200×630, `og:image` / `twitter:image`) |

Project screenshots are set as `background-image` on the `.card__thumb` rules,
which lets the lightbox reuse the same image on its banner automatically.

The two newest cards (Quiet Hours, Common Table) don't have screenshots yet, so
they still use a themed gradient (`.card__thumb--five` / `--six`). To add one,
drop a ~1280×800 image here and give its card a `background-image` rule to match.
