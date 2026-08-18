# Component Library Reference

This file documents the components used in this project. Each entry follows the same
three-part shape: **structure** (HTML), **styling** (CSS), and **script** (JS, if the
component is interactive/animated).

## How to build from this file

When asked to build or modify a component listed here:

1. Reuse the exact structure/class naming pattern shown (BEM-style: `.component-name`,
   `.component-name__part`, `[data-component-name]` for JS hooks).
2. Keep styling scoped to the component's class — don't leak styles onto global tags.
3. If a script is included, keep animation logic in a single `initX()` function called
   on `DOMContentLoaded`, matching the pattern below (not React/Vue-style state).
4. Preserve transition timing, easing curves, and structural patterns (e.g. background
   as a separate absolutely-positioned div, text wrapped for animation) unless told
   otherwise — these are deliberate, not incidental.
5. When asked for a _new_ component that doesn't exist yet, build it in this same
   structure/styling/script shape, and add it as a new entry below so it's documented
   for next time.

---

## Buttons

### Staggering Chars Button

Hover animation that staggers each character upward, revealing a duplicate row via
`text-shadow`, with an inset background that animates on hover.

**Structure:**

```html
<a href="#" aria-label="Staggering button" class="btn-animate-chars">
  <div class="btn-animate-chars__bg"></div>
  <span data-button-animate-chars="" class="btn-animate-chars__text"
    >Staggering Button</span
  >
</a>
```

**Styling:**

```css
.btn-animate-chars {
  color: #131313;
  cursor: pointer;
  border-radius: 0.25em;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
  max-width: 12em;
  padding: 1em;
  font-size: 1em;
  line-height: 1;
  text-decoration: none;
  display: flex;
  position: relative;
}
.btn-animate-chars__text {
  white-space: nowrap;
  line-height: 1.3;
}
/* Characters */
.btn-animate-chars [data-button-animate-chars] {
  overflow: hidden;
  position: relative;
  display: inline-block;
}
.btn-animate-chars [data-button-animate-chars] span {
  display: inline-block;
  position: relative;
  text-shadow: 0px 1.3em currentColor;
  transform: translateY(0em) rotate(0.001deg);
  transition: transform 0.6s cubic-bezier(0.625, 0.05, 0, 1);
}
.btn-animate-chars:hover [data-button-animate-chars] span {
  transform: translateY(-1.3em) rotate(0.001deg);
}
/* Background */
.btn-animate-chars__bg {
  background-color: #efeeec;
  border-radius: 0.25em;
  position: absolute;
  inset: 0;
  transition: inset 0.6s cubic-bezier(0.625, 0.05, 0, 1);
}
.btn-animate-chars:hover .btn-animate-chars__bg {
  inset: 0.125em;
}
```

**Script:**

```js
function initButtonCharacterStagger() {
  const offsetIncrement = 0.01; // Transition offset increment in seconds
  const buttons = document.querySelectorAll("[data-button-animate-chars]");
  buttons.forEach((button) => {
    const text = button.textContent; // Get the button's text content
    button.innerHTML = ""; // Clear the original content
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.textContent = char;
      span.style.transitionDelay = `${index * offsetIncrement}s`;
      // Handle spaces explicitly
      if (char === " ") {
        span.style.whiteSpace = "pre"; // Preserve space width
      }
      button.appendChild(span);
    });
  });
}
// Initialize Button Character Stagger Animation
document.addEventListener("DOMContentLoaded", () => {
  initButtonCharacterStagger();
});
```

---

## Sliders

### Flick Cards Slider

Draggable card stack slider (GSAP + Draggable) where cards fan out in layers around an
active center card. Cards snap into position on release, and clicks pass through to the
underlying element if the drag distance was minimal (so it still works as a click when
not actually dragged). Requires a minimum of 7 cards for drag to activate.

**Dependencies:**

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/Draggable.min.js"></script>
```

**Structure:**

```html
<div data-flick-cards-init="" class="flick-group">
  <div class="flick-group__relative-object">
    <div class="flick-group__relative-object-before"></div>
  </div>
  <div data-flick-cards-collection="" class="flick-group__collection">
    <div data-flick-cards-list="" class="flick-group__list">
      <div
        data-flick-cards-item-status=""
        data-flick-cards-item=""
        class="flick-group__item"
      >
        <div class="flick-card">
          <div class="flick-card__before"></div>
          <div class="flick-card__media">
            <img
              width="256"
              loading="lazy"
              alt=""
              src="IMAGE_URL"
              class="cover-image"
            />
            <a href="#" class="flick-card__btn"
              ><span class="flick-card__btn-span">Get this product</span></a
            >
            <h3 class="flick-card__h3">FX100</h3>
          </div>
        </div>
      </div>
      <!-- Repeat .flick-group__item for each card — minimum 7 required for drag to activate -->
    </div>
  </div>
</div>
```

**Styling:**

```css
.flick-group {
  position: relative;
}

.flick-group__relative-object {
  opacity: 0;
  pointer-events: none;
  width: 47em;
  position: relative;
}

.flick-group__relative-object-before {
  padding-top: 75%;
}

.flick-group__collection {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.flick-group__list {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  position: relative;
}

.flick-group__item {
  position: absolute;
}

.flick-card {
  color: #fff;
  -webkit-user-select: none;
  user-select: none;
  background-color: #000;
  border-radius: 1em;
  justify-content: center;
  align-items: center;
  width: 23.5em;
  display: flex;
  position: relative;
  overflow: hidden;
}

.flick-card__before {
  padding-top: 150%;
}

.flick-card__media {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
}

.cover-image {
  pointer-events: none;
  object-fit: cover;
  -webkit-user-select: none;
  user-select: none;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: auto;
}

.flick-card__h3 {
  letter-spacing: -0.025em;
  font-size: 4em;
  font-weight: 500;
  line-height: 1;
  position: absolute;
}

.flick-card__btn {
  background-color: #000;
  border-radius: 0.375em;
  justify-content: center;
  align-items: center;
  width: calc(100% - 4em);
  height: 3.25em;
  text-decoration: none;
  display: flex;
  position: absolute;
  bottom: 2em;
  left: 2em;
}

.flick-card__btn-span {
  color: #fff;
  font-size: 1em;
  font-weight: 500;
}

[data-flick-cards-dragger] {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: auto;
  touch-action: pan-y;
}

/* Position Slides */
[data-flick-cards-item-status] .flick-card__media {
  transition: opacity 0.2s ease;
  opacity: 0.5;
}

[data-flick-cards-item-status="2-before"] .flick-card__media,
[data-flick-cards-item-status="2-after"] .flick-card__media {
  transition: opacity 0.2s ease;
  opacity: 0.75;
}

[data-flick-cards-item-status="active"] .flick-card__media {
  opacity: 1;
}

/* Animate Button */
[data-flick-cards-item-status] .flick-card__btn {
  transition:
    opacity 0.4s cubic-bezier(0.625, 0.05, 0, 1),
    1s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translate(0%, 50%) rotate(0.001deg);
}

[data-flick-cards-item-status="active"] .flick-card__btn {
  opacity: 1;
  transform: translate(0%, 0%) rotate(0.001deg);
}
```

**Script:**

```js
gsap.registerPlugin(Draggable);

function initFlickCards() {
  const sliders = document.querySelectorAll("[data-flick-cards-init]");

  sliders.forEach((slider) => {
    const list = slider.querySelector("[data-flick-cards-list]");
    const cards = Array.from(list.querySelectorAll("[data-flick-cards-item]"));
    const total = cards.length;
    let activeIndex = 0;

    const sliderWidth = slider.offsetWidth;
    const threshold = 0.1;

    // Generate draggers inside each card and store references
    const draggers = [];
    cards.forEach((card) => {
      const dragger = document.createElement("div");
      dragger.setAttribute("data-flick-cards-dragger", "");
      card.appendChild(dragger);
      draggers.push(dragger);
    });

    // Set initial drag status
    slider.setAttribute("data-flick-drag-status", "grab");

    function getConfig(i, currentIndex) {
      let diff = i - currentIndex;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;

      switch (diff) {
        case 0:
          return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
        case 1:
          return { x: 25, y: 1, rot: 10, s: 0.9, o: 1, z: 4 };
        case -1:
          return { x: -25, y: 1, rot: -10, s: 0.9, o: 1, z: 4 };
        case 2:
          return { x: 45, y: 5, rot: 15, s: 0.8, o: 1, z: 3 };
        case -2:
          return { x: -45, y: 5, rot: -15, s: 0.8, o: 1, z: 3 };
        default:
          const dir = diff > 0 ? 1 : -1;
          return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
      }
    }

    function renderCards(currentIndex) {
      cards.forEach((card, i) => {
        const cfg = getConfig(i, currentIndex);
        let status;

        if (cfg.x === 0) status = "active";
        else if (cfg.x === 25) status = "2-after";
        else if (cfg.x === -25) status = "2-before";
        else if (cfg.x === 45) status = "3-after";
        else if (cfg.x === -45) status = "3-before";
        else status = "hidden";

        card.setAttribute("data-flick-cards-item-status", status);
        card.style.zIndex = cfg.z;

        gsap.to(card, {
          duration: 0.6,
          ease: "elastic.out(1.2, 1)",
          xPercent: cfg.x,
          yPercent: cfg.y,
          rotation: cfg.rot,
          scale: cfg.s,
          opacity: cfg.o,
        });
      });
    }

    renderCards(activeIndex);

    if (total < 7) {
      console.log("Not minimum of 7 cards");
      return;
    }

    let pressClientX = 0;
    let pressClientY = 0;

    Draggable.create(draggers, {
      type: "x",
      edgeResistance: 0.8,
      bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
      inertia: false,

      onPress() {
        pressClientX = this.pointerEvent.clientX;
        pressClientY = this.pointerEvent.clientY;
        slider.setAttribute("data-flick-drag-status", "grabbing");
      },

      onDrag() {
        const rawProgress = this.x / sliderWidth;
        const progress = Math.min(1, Math.abs(rawProgress));
        const direction = rawProgress > 0 ? -1 : 1;
        const nextIndex = (activeIndex + direction + total) % total;

        cards.forEach((card, i) => {
          const from = getConfig(i, activeIndex);
          const to = getConfig(i, nextIndex);
          const mix = (prop) => from[prop] + (to[prop] - from[prop]) * progress;

          gsap.set(card, {
            xPercent: mix("x"),
            yPercent: mix("y"),
            rotation: mix("rot"),
            scale: mix("s"),
            opacity: mix("o"),
          });
        });
      },

      onRelease() {
        slider.setAttribute("data-flick-drag-status", "grab");

        const releaseClientX = this.pointerEvent.clientX;
        const releaseClientY = this.pointerEvent.clientY;
        const dragDistance = Math.hypot(
          releaseClientX - pressClientX,
          releaseClientY - pressClientY,
        );

        const raw = this.x / sliderWidth;
        let shift = 0;
        if (raw > threshold) shift = -1;
        else if (raw < -threshold) shift = 1;

        if (shift !== 0) {
          activeIndex = (activeIndex + shift + total) % total;
          renderCards(activeIndex);
        }

        gsap.to(this.target, {
          x: 0,
          duration: 0.3,
          ease: "power1.out",
        });

        if (dragDistance < 4) {
          // Temporarily allow clicks to pass through
          this.target.style.pointerEvents = "none";

          // Allow the DOM to register pointer-through
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const el = document.elementFromPoint(
                releaseClientX,
                releaseClientY,
              );
              if (el) {
                const evt = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                el.dispatchEvent(evt);
              }

              // Restore pointer events
              this.target.style.pointerEvents = "auto";
            });
          });
        }
      },
    });
  });
}

// Initialize Flick Cards Slider
document.addEventListener("DOMContentLoaded", function () {
  initFlickCards();
});
```

**Notes:**

- Container: `[data-flick-cards-init]` goes on the outermost wrapper — one slider instance is created per element with this attribute.
- List: `[data-flick-cards-list]` goes on the element containing all card items.
- Item: `[data-flick-cards-item]` goes on each card; on load each receives `[data-flick-cards-item-status]` set to `active`, `2-before`/`2-after`, `3-before`/`3-after`, or `hidden` based on position — use these to control z-index/visibility/pointer-events in CSS.
- Drag state: the root container gets `[data-flick-drag-status="grab"]` or `"grabbing"` during interaction — use this to style cursor state.
- Minimum 7 cards required for drag to activate; below that, cards still position visually but dragging is disabled.

---

<!--
  ADD NEW COMPONENTS BELOW USING THIS TEMPLATE:

  ### Component Name

  Short description of what it does / when to use it.

  **Structure:**
  ```html
  ```

  **Styling:**
  ```css
  ```

  **Script:** (omit this section if the component is static/no JS)
  ```js
  ```

  ---
-->
