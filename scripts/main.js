/* =============================================================================
   Maya Okonkwo — Portfolio behavior

   Vanilla JavaScript, no frameworks. Each feature is its own small function
   with a clear name, and we call them all once at the bottom. Read top to
   bottom and every piece should explain itself.

   Features handled here:
     1. Dark-mode toggle that remembers the choice in localStorage
     2. Mobile menu that opens and closes
     3. Closing the mobile menu after a nav link is tapped
     4. Friendly contact-form submission (no backend, so we just confirm)
     5. Stamping the current year into the footer
     6. A back-to-top button that appears after scrolling past the hero
     6b. A scroll-progress bar across the top that fills as you scroll
     7. Active-section highlighting in the nav as you scroll the page
     8. A project lightbox that opens a larger view when a card is clicked
     8b. Filtering the project cards by type via buttons above the grid
     9. The hero: measuring the header height, and the typing headline effect

   Note on smooth scrolling: it is handled in CSS with `scroll-behavior: smooth`
   plus `scroll-margin-top` on each section, so there is no JS needed for it.
   ========================================================================== */

/* -----------------------------------------------------------------------------
   1. DARK-MODE TOGGLE
   The theme is stored on <html data-theme="..."> and mirrored to localStorage
   so it survives a refresh or a return visit. (index.html applies the saved
   theme before paint; here we just handle clicks afterward.)
   -------------------------------------------------------------------------- */
function setupThemeToggle() {
  const toggleButton = document.getElementById("themeToggle");
  const root = document.documentElement; // the <html> element

  toggleButton.addEventListener("click", function () {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";

    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next); // remember it for next time
  });
}

/* -----------------------------------------------------------------------------
   2. MOBILE MENU TOGGLE
   We add/remove an `is-open` class on the <nav>. CSS does the rest (the slide
   animation and the hamburger-to-X morph). We also keep aria-expanded honest
   for screen readers.
   -------------------------------------------------------------------------- */
function setupMobileMenu() {
  const nav = document.querySelector(".nav");
  const toggleButton = document.getElementById("navToggle");

  toggleButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");

    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

/* -----------------------------------------------------------------------------
   3. CLOSE THE MENU AFTER CLICKING A LINK
   On mobile, tapping a nav link should scroll AND tidy up by closing the menu.
   We listen on each in-page link inside the menu.
   -------------------------------------------------------------------------- */
function setupMenuAutoClose() {
  const nav = document.querySelector(".nav");
  const menuLinks = document.querySelectorAll('.nav__menu a[href^="#"]');

  menuLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");

      const toggleButton = document.getElementById("navToggle");
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.setAttribute("aria-label", "Open menu");
    });
  });
}

/* -----------------------------------------------------------------------------
   4. CONTACT FORM
   There is no server behind this demo site, so instead of sending data we let
   the browser run its built-in validation (required + email format), then show
   a warm confirmation message and clear the fields.
   -------------------------------------------------------------------------- */
function setupContactForm() {
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  const emailField = form.elements.email;
  const emailError = document.getElementById("emailError");

  // Turn off native validation in JS (not in the HTML) so the form still falls
  // back to the browser's own checks if JavaScript is unavailable. With JS on,
  // we show a styled, on-page error instead of the browser's default bubble.
  form.noValidate = true;

  // Simple email format check: text @ text . text, no spaces. A formatting
  // sanity check — not proof the address actually exists.
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // aria-invalid drives the red border (see CSS); emailError shows the message.
  function validateEmail() {
    const valid = EMAIL_PATTERN.test(emailField.value.trim());
    emailField.setAttribute("aria-invalid", valid ? "false" : "true");
    emailError.textContent = valid
      ? ""
      : "Please enter a valid email, like name@example.com.";
    return valid;
  }

  // Clear the error the moment it's fixed, but only after it's been flagged.
  emailField.addEventListener("input", function () {
    if (emailField.getAttribute("aria-invalid") === "true") validateEmail();
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault(); // no backend — we just confirm

    if (!validateEmail()) {
      emailField.focus(); // the message is announced via aria-describedby
      return;
    }

    // Grab the visitor's name so the thank-you feels personal.
    const name = form.elements.name.value.trim();
    const firstName = name.split(" ")[0] || "there";

    status.textContent = `Thanks, ${firstName}! Your message is on its way. ✦`;
    form.reset();
    emailField.setAttribute("aria-invalid", "false");
    emailError.textContent = "";
  });
}

/* -----------------------------------------------------------------------------
   5. FOOTER YEAR
   A tiny touch so the copyright never goes stale.
   -------------------------------------------------------------------------- */
function setCurrentYear() {
  const yearSpan = document.getElementById("year");
  yearSpan.textContent = new Date().getFullYear();
}

/* -----------------------------------------------------------------------------
   6. BACK-TO-TOP BUTTON
   The button hides until the visitor scrolls past the hero, then fades in. We
   toggle an `is-visible` class (CSS handles the fade) on scroll, comparing the
   scroll position against the hero's height. Clicking scrolls back to the top —
   smoothly, unless the visitor has asked for reduced motion.
   -------------------------------------------------------------------------- */
function setupBackToTop() {
  const button = document.getElementById("toTop");
  const hero = document.getElementById("hero");

  // How far down to scroll before the button shows. Falls back to one viewport
  // height if the hero somehow isn't found.
  function revealThreshold() {
    return hero ? hero.offsetHeight : window.innerHeight;
  }

  function toggleButton() {
    const scrolledPastHero = window.scrollY > revealThreshold();
    button.classList.toggle("is-visible", scrolledPastHero);
  }

  // `passive: true` lets the browser keep scrolling smoothly while we listen.
  window.addEventListener("scroll", toggleButton, { passive: true });
  toggleButton(); // set the right state on initial load

  button.addEventListener("click", function () {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  });
}

/* -----------------------------------------------------------------------------
   6b. SCROLL PROGRESS BAR
   Fills a thin bar across the top of the page as the visitor scrolls. We track
   the scroll position as a fraction of the total scrollable distance and scale
   the bar horizontally (scaleX) to match — transform is cheaper than animating
   width. Recomputed on scroll and on resize (which changes the page height).
   -------------------------------------------------------------------------- */
function setupScrollProgress() {
  const bar = document.getElementById("scrollProgress");
  if (!bar) return;

  const root = document.documentElement;

  function updateProgress() {
    // How far the page can scroll (0 when everything already fits on screen).
    const scrollable = root.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.transform = "scaleX(" + progress + ")";
  }

  // `passive: true` keeps scrolling smooth while we listen.
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress, { passive: true });
  updateProgress(); // set the right fill on initial load
}

/* -----------------------------------------------------------------------------
   7. ACTIVE-SECTION HIGHLIGHTING (scroll spy)
   As the visitor scrolls, the nav link for the section they're looking at gets
   an `is-active` class so the menu always shows where they are.

   We use an IntersectionObserver instead of doing scroll math on every frame.
   The rootMargin pins the observed area to a thin band at the very TOP of the
   viewport (the bottom 95% is trimmed). Combined with picking the first section
   in page order that's in the band, a section stays highlighted until its own
   bottom edge scrolls off the top of the screen — only then does the next
   section take over. So a link lights up only once the section above it has
   scrolled fully out of view and the current section fills the screen.
   -------------------------------------------------------------------------- */
function setupActiveNav() {
  // Pair each in-page nav link with the section it points to.
  const sections = Array.from(
    document.querySelectorAll('.nav__menu a[href^="#"]')
  )
    .map(function (link) {
      const section = document.getElementById(link.getAttribute("href").slice(1));
      return section ? { section: section, link: link } : null;
    })
    .filter(Boolean);

  if (sections.length === 0) return;

  // Highlight one link and clear the rest. aria-current keeps screen readers in
  // the loop, not just sighted users who can see the color.
  function highlight(activeLink) {
    sections.forEach(function (item) {
      const isActive = item.link === activeLink;
      item.link.classList.toggle("is-active", isActive);
      if (isActive) {
        item.link.setAttribute("aria-current", "true");
      } else {
        item.link.removeAttribute("aria-current");
      }
    });
  }

  // Track which sections are currently crossing the band. We can't just react
  // to whatever entered, because when you scroll UP into the hero (which has no
  // nav link), the last section leaves and nothing replaces it — so we'd be
  // stuck highlighting it. Instead we recompute from the full set each time and
  // clear everything when nothing is in the band.
  const inBand = new Set();

  const observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          inBand.add(entry.target);
        } else {
          inBand.delete(entry.target);
        }
      });

      // Highlight the first section (in page order) still in the band, or clear
      // all links when we're above the first one (i.e. up in the hero).
      const current = sections.find(function (item) {
        return inBand.has(item.section);
      });
      highlight(current ? current.link : null);
    },
    { rootMargin: "0px 0px -95% 0px", threshold: 0 }
  );

  sections.forEach(function (item) {
    observer.observe(item.section);
  });
}

/* -----------------------------------------------------------------------------
   8. PROJECT LIGHTBOX
   Clicking a project card opens a larger view of it in a native <dialog>. Using
   showModal() means the browser handles the fiddly, bug-prone parts for us:
   focus is trapped inside the dialog, Escape closes it, the background goes
   inert, and focus returns to the card afterward. We add just the content
   filling, the gradient copy, scroll-lock, outside-click, and the fade-in.
   -------------------------------------------------------------------------- */
function setupProjectLightbox() {
  const lightbox = document.getElementById("lightbox");
  if (!lightbox) return;

  const banner = document.getElementById("lightboxBanner");
  const tag = document.getElementById("lightboxTag");
  const title = document.getElementById("lightboxTitle");
  const text = document.getElementById("lightboxText");
  const triggers = document.querySelectorAll(".card__trigger");
  const root = document.documentElement;

  // Pull the project's details straight from the card's own markup (no separate
  // data store to keep in sync), open the dialog, then fade it in.
  function openFromCard(card) {
    const thumb = card.querySelector(".card__thumb");

    tag.textContent = card.querySelector(".card__tag").textContent;
    title.textContent = card.querySelector(".card__title").textContent.trim();
    text.textContent = card.querySelector(".card__text").textContent.trim();
    // Copy the card's exact gradient so the banner matches its thumbnail. This
    // also carries over a real background image if one is added later.
    banner.style.backgroundImage = thumb
      ? getComputedStyle(thumb).backgroundImage
      : "";

    lightbox.showModal();
    root.classList.add("has-modal"); // lock the page behind it from scrolling
    requestAnimationFrame(function () {
      lightbox.classList.add("is-open");
    });
  }

  triggers.forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const card = trigger.closest(".card");
      if (card) openFromCard(card);
    });
  });

  // A click that lands on the <dialog> element itself (not a child) is a click
  // on the dimmed backdrop around the panel — so close.
  lightbox.addEventListener("click", function (event) {
    if (event.target === lightbox) lightbox.close();
  });

  // The × button and the CTA both carry data-close.
  lightbox.querySelectorAll("[data-close]").forEach(function (element) {
    element.addEventListener("click", function () {
      lightbox.close();
    });
  });

  // One cleanup path for every way of closing (button, backdrop, CTA, and the
  // native Escape key, which all fire the dialog's `close` event).
  lightbox.addEventListener("close", function () {
    lightbox.classList.remove("is-open");
    root.classList.remove("has-modal");
  });
}

/* -----------------------------------------------------------------------------
   8b. PROJECT FILTERS
   Buttons above the grid that filter the cards by type. Following the same idea
   as the lightbox, we don't keep a separate list of categories: we read each
   card's data-type straight from its markup, collect the unique ones in page
   order, and build one button per type (plus "All"). Add a project later and its
   type shows up here on its own. Clicking a button hides the cards that don't
   match; aria-pressed marks the active one for both styling and screen readers.
   -------------------------------------------------------------------------- */
function setupProjectFilters() {
  const container = document.getElementById("projectFilters");
  const grid = document.querySelector(".projects__grid");
  if (!container || !grid) return;

  const items = Array.from(grid.querySelectorAll("li[data-type]"));
  if (items.length === 0) return;

  // Unique types, in the order they first appear in the grid.
  const types = [];
  items.forEach(function (item) {
    const type = item.dataset.type;
    if (type && types.indexOf(type) === -1) types.push(type);
  });

  // With only one type (or none), a filter can't narrow anything — so don't
  // build a control that would do nothing. The container stays empty.
  if (types.length < 2) return;

  // "All" first, then one button per type.
  const filters = ["all"].concat(types);
  const buttons = filters.map(function (value, index) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.filter = value;
    button.textContent = value === "all" ? "All" : value;
    // The first button ("All") starts pressed, matching the initial view.
    button.setAttribute("aria-pressed", index === 0 ? "true" : "false");
    container.appendChild(button);
    return button;
  });

  // How long a leaving card fades before we pull it from the layout for good.
  // Kept in step with the opacity transition in the CSS.
  const LEAVE_MS = 320;
  // Timers for cards mid-exit, so a fast follow-up click can cancel them.
  const leaveTimers = new Map();

  // Wipe the inline styles we set while animating a card, handing styling back
  // to the stylesheet.
  function resetInline(item) {
    item.style.top = "";
    item.style.left = "";
    item.style.width = "";
    item.style.height = "";
    item.style.transition = "";
    item.style.transform = "";
  }

  // Animate the grid from its current arrangement to the one for `value` using
  // the FLIP technique: measure First positions, apply the change, measure Last
  // positions, then transform each moved card from Last back to First and let it
  // transition to zero — so the browser animates the reflow we'd otherwise get
  // for free but instantly. Leaving cards fade out on top; entering cards fade in.
  function applyFilter(value) {
    const matches = function (item) {
      return value === "all" || item.dataset.type === value;
    };

    // Settle anything still animating from a previous click, so we always start
    // from a clean, correct layout and a fast clicker never strands a card.
    items.forEach(function (item) {
      if (leaveTimers.has(item)) {
        clearTimeout(leaveTimers.get(item));
        leaveTimers.delete(item);
        item.hidden = true;
      }
      item.classList.remove("is-leaving", "is-entering");
      resetInline(item);
    });

    // Reduced motion: skip the choreography and just toggle visibility.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      items.forEach(function (item) {
        item.hidden = !matches(item);
      });
      return;
    }

    // Sort each card by what it's about to do.
    const stayers = []; // visible before and after — may need to glide (FLIP)
    const leavers = []; // visible now, hidden next — fade out
    const enterers = []; // hidden now, visible next — fade in
    items.forEach(function (item) {
      const show = matches(item);
      const wasVisible = !item.hidden;
      if (show && wasVisible) stayers.push(item);
      else if (show) enterers.push(item);
      else if (wasVisible) leavers.push(item);
    });

    // FIRST: where does every staying/leaving card sit right now?
    const gridRect = grid.getBoundingClientRect();
    const firstRects = new Map();
    stayers.concat(leavers).forEach(function (item) {
      firstRects.set(item, item.getBoundingClientRect());
    });

    // Pin each leaver where it stands, out of the grid's flow, so the survivors
    // can reflow beneath it while it fades out in place.
    leavers.forEach(function (item) {
      const rect = firstRects.get(item);
      item.style.top = rect.top - gridRect.top + "px";
      item.style.left = rect.left - gridRect.left + "px";
      item.style.width = rect.width + "px";
      item.style.height = rect.height + "px";
      item.classList.add("is-leaving");
      const timer = window.setTimeout(function () {
        leaveTimers.delete(item);
        item.hidden = true;
        item.classList.remove("is-leaving");
        resetInline(item);
      }, LEAVE_MS);
      leaveTimers.set(item, timer);
    });

    // Bring enterers into the grid, starting faded and small (see .is-entering).
    enterers.forEach(function (item) {
      item.hidden = false;
      item.classList.add("is-entering");
    });

    // LAST: with leavers pulled out and enterers in, read the final layout and
    // give each stayer its INVERT transform (old minus new) with the transition
    // off, so it jumps back to where it was without a visible flicker.
    stayers.forEach(function (item) {
      const first = firstRects.get(item);
      const last = item.getBoundingClientRect();
      item.style.transition = "none";
      item.style.transform =
        "translate(" + (first.left - last.left) + "px, " +
        (first.top - last.top) + "px)";
    });

    // One reflow commits those start states; then PLAY — release the stayers to
    // glide to their real spots and let the enterers fade in.
    void grid.offsetWidth;
    stayers.forEach(function (item) {
      item.style.transition = "";
      item.style.transform = "";
    });
    enterers.forEach(function (item) {
      item.classList.remove("is-entering");
    });
  }

  // One listener on the container catches clicks on any button (delegation).
  container.addEventListener("click", function (event) {
    const button = event.target.closest(".filter-button");
    if (!button) return;

    buttons.forEach(function (other) {
      other.setAttribute("aria-pressed", String(other === button));
    });
    applyFilter(button.dataset.filter);
  });
}

/* -----------------------------------------------------------------------------
   9a. HERO HEIGHT
   The header is sticky and sits in the page flow, so the hero needs to be the
   viewport height MINUS the header to fill exactly one screen (and keep the
   scroll cue on-screen). We measure the header and expose it as --header-h for
   the hero's `min-height: calc(100svh - var(--header-h))` to use.
   -------------------------------------------------------------------------- */
function setupHeroHeight() {
  const header = document.querySelector(".site-header");
  const root = document.documentElement;
  if (!header) return;

  function setHeaderHeight() {
    root.style.setProperty("--header-h", header.offsetHeight + "px");
  }

  setHeaderHeight();
  window.addEventListener("resize", setHeaderHeight, { passive: true });
}

/* -----------------------------------------------------------------------------
   9b. HERO TYPING HEADLINE
   Types the headline out character by character with a blinking cursor, cycling
   through a few phrases (type → hold → delete → next). The real headline lives
   in the static HTML (.hero__headline-text) for SEO and screen readers; here we
   just hide that visually (via the .is-animating class) and animate a copy. If
   the visitor prefers reduced motion, we leave the static headline untouched.
   -------------------------------------------------------------------------- */
function setupHeroTyping() {
  const hero = document.querySelector(".hero");
  const typed = document.getElementById("heroTyped");
  const canonical = document.querySelector(".hero__headline-text");
  if (!hero || !typed || !canonical) return;

  // Reduced motion → show the full static headline immediately, no cursor.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // The FIRST phrase is read straight from the static <h1>, so the markup stays
  // the single source of truth for your real headline.
  // === EDIT / ADD EXTRA PHRASES HERE ===
  const phrases = [
    canonical.textContent.trim(),
    "I turn tangled ideas into interfaces people enjoy.",
    "I sweat the details nobody notices until they're gone.",
  ];

  // === TIMING (milliseconds) — tweak to taste ===
  const TYPE_MS = 55; // delay between typed characters
  const DELETE_MS = 28; // delay between deleted characters
  const HOLD_FULL_MS = 1800; // pause once a phrase is fully typed
  const HOLD_EMPTY_MS = 350; // pause after deleting, before the next phrase
  const START_DELAY_MS = 450; // initial delay before typing begins

  // Switches the CSS over: hides the static text (kept for AT) and shows the
  // cursor. Done in JS so a no-JS / reduced-motion visitor never sees it.
  hero.classList.add("is-animating");

  let phraseIndex = 0;
  let charCount = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    charCount += deleting ? -1 : 1;
    typed.textContent = phrase.slice(0, charCount);

    if (!deleting && charCount === phrase.length) {
      // Whole phrase shown — hold, then start deleting.
      deleting = true;
      setTimeout(tick, HOLD_FULL_MS);
    } else if (deleting && charCount === 0) {
      // Fully deleted — move to the next phrase.
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(tick, HOLD_EMPTY_MS);
    } else {
      setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
    }
  }

  setTimeout(tick, START_DELAY_MS);
}

/* -----------------------------------------------------------------------------
   START EVERYTHING
   The script tag is at the end of <body>, so the DOM is already parsed and we
   can safely wire things up right away.
   -------------------------------------------------------------------------- */
setupThemeToggle();
setupMobileMenu();
setupMenuAutoClose();
setupContactForm();
setCurrentYear();
setupBackToTop();
setupScrollProgress();
setupActiveNav();
setupProjectLightbox();
setupProjectFilters();
setupHeroHeight();
setupHeroTyping();
