# images/

Drop your real assets here — a portrait for the About section and screenshots
for each project card.

How to wire them up:

- **Portrait:** in `index.html`, replace the `.about__portrait` block (the one
  showing the "MO" initials) with an `<img src="images/portrait.jpg" alt="..." />`.
- **Project thumbnails:** swap each `.card__thumb` gradient `<div>` for an
  `<img src="images/project-one.jpg" alt="..." />`, or set the image as a
  `background-image` on the existing `.card__thumb` rule in `styles/main.css`.

Until then, the site uses tasteful gradient placeholders so it looks complete.
