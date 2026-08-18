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

### Radial Cards Slider

Draggable circular/radial card carousel (GSAP + Draggable + InertiaPlugin + CustomEase)
where cards are arranged around a wheel and rotate into view. Supports drag/inertia,
prev/next buttons, numbered jump controls, auto-generated dot navigation, active/total
slide counters, and infinite looping via auto-generated clones. Fully responsive — card
density and circle size are controlled with CSS custom properties per breakpoint.

**Dependencies:**

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/Draggable.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/InertiaPlugin.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15/dist/CustomEase.min.js"></script>
```

**Structure:**

```html
<section class="demo-section">
  <div
    data-radial-slider-drag-status="grab"
    data-radial-slider-init=""
    class="radial-gsap-slider"
  >
    <div
      data-radial-slider-collection=""
      class="radial-gsap-slider__collection"
    >
      <div data-radial-slider-list="" class="radial-gsap-slider__list">
        <div
          data-radial-slider-item-status="active"
          data-radial-slider-item=""
          class="radial-gsap-slider__item"
        >
          <div class="demo-card">
            <div class="demo-card__media">
              <img src="IMAGE_URL" loading="lazy" alt="" class="cover-image" />
            </div>
            <div class="demo-card__info">
              <h3 class="demo-card__h">CARD ONE</h3>
            </div>
          </div>
        </div>
        <div
          data-radial-slider-item-status="inview"
          data-radial-slider-item=""
          class="radial-gsap-slider__item"
        >
          <div class="demo-card">
            <div class="demo-card__media">
              <img src="IMAGE_URL" loading="lazy" alt="" class="cover-image" />
            </div>
            <div class="demo-card__info">
              <h3 class="demo-card__h">CARD TWO</h3>
            </div>
          </div>
        </div>
        <!-- Repeat .radial-gsap-slider__item for each card; only the first needs data-radial-slider-item-status="active", the rest "inview" -->
      </div>
    </div>
    <div class="radial-gsap-slider__controls">
      <button
        data-radial-slider-control="prev"
        class="radial-gsap-slider__control-btn"
      >
        Prev
      </button>
      <div data-radial-slider-generate-dots="" class="radial-gsap-slider__dots">
        <button
          data-radial-slider-control="1"
          data-radial-slider-control-status="active"
          class="radial-gsap-slider__control-dot"
        ></button>
        <!-- Only include ONE dot as a template — the script generates the rest to match the number of cards -->
      </div>
      <button
        data-radial-slider-control="next"
        class="radial-gsap-slider__control-btn is--next"
      >
        Next
      </button>
    </div>
  </div>
</section>
```

**Styling:**

```css
.demo-section {
  min-height: 100dvh;
  display: flex;
  background-color: #353d35;
}

.radial-gsap-slider {
  grid-column-gap: 5em;
  grid-row-gap: 5em;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-top: 5em;
  display: flex;
  position: relative;
}

[data-radial-slider-init] {
  --slider-rotate: 18deg;
  --slider-radius: 375%;
}

.radial-gsap-slider__collection {
  max-width: 100%;
  position: relative;
}

.radial-gsap-slider__list {
  -webkit-user-select: none;
  user-select: none;
  will-change: transform;
  touch-action: pan-y;
  backface-visibility: hidden;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  display: flex;
  position: relative;
}

[data-radial-slider-list] > :first-child {
  position: relative;
}

.radial-gsap-slider__item {
  transform-origin: 50% var(--slider-radius);
  flex: none;
  position: absolute;
}

@media screen and (max-width: 767px) {
  [data-radial-slider-init] {
    --slider-rotate: 12deg;
    --slider-radius: 475%;
  }
}

/* Demo Card */
.demo-card {
  width: 20em;
  color: #353d35;
  text-align: center;
  background-color: #e8e8e2;
  border-radius: 1.375em;
  flex-flow: column;
  align-items: flex-start;
  width: 100%;
  padding-top: 0.625em;
  padding-left: 0.625em;
  padding-right: 0.625em;
  display: flex;
}

@media screen and (max-width: 767px) {
  .demo-card {
    width: 15em;
  }
}

.demo-card__media {
  aspect-ratio: 8 / 9;
  border-radius: 0.75em;
  width: 100%;
  position: relative;
}

.cover-image {
  object-fit: cover;
  border-radius: inherit;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.demo-card__info {
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 4.5em;
  padding: 0.625em;
  display: flex;
}

.demo-card__h {
  text-transform: uppercase;
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.3125em;
  font-weight: 900;
  line-height: 1;
}

/* Controls */
.radial-gsap-slider__controls {
  grid-column-gap: 1em;
  grid-row-gap: 1em;
  justify-content: center;
  align-items: center;
  padding: 3em;
  display: flex;
  position: relative;
}

.radial-gsap-slider__control-btn {
  z-index: 1;
  color: #e8e8e2;
  letter-spacing: -0.02em;
  cursor: pointer;
  background-color: #1f251f;
  border-radius: 50em;
  height: 3em;
  padding: 0 1.5em;
  font-size: 1em;
  font-weight: 600;
  position: relative;
}

.radial-gsap-slider__control-btn.is--next {
  color: #353d35;
  background-color: #e8e8e2;
}

.radial-gsap-slider__dots {
  justify-content: center;
  align-items: center;
  display: flex;
}

.radial-gsap-slider__control-dot {
  z-index: 1;
  outline-offset: 0px;
  color: #4c554c;
  cursor: pointer;
  background-color: currentColor;
  border: 0.1875em solid #353d35;
  border-radius: 50em;
  outline: 0 #0000;
  width: 0.875em;
  height: 0.875em;
  padding: 0;
  font-size: 1em;
  transition: color 0.1s ease;
  position: relative;
  overflow: hidden;
  outline: 0 !important;
  box-shadow: 0 0 #0000 !important;
}

.radial-gsap-slider__control-dot[data-radial-slider-control-status="active"] {
  color: #aba994;
}
```

**Script:**

```js
gsap.registerPlugin(Draggable, InertiaPlugin, CustomEase);
CustomEase.create("radial", "0.25, 0.1, 0, 1");

function initRadialCardsSlider() {
  const slideDuration = 1;
  const clickEase = "radial";

  document
    .querySelectorAll("[data-radial-slider-init]")
    .forEach((container) => {
      if (container._radialSliderDraggable)
        container._radialSliderDraggable.kill();
      if (container._radialSliderProxy)
        gsap.killTweensOf(container._radialSliderProxy);
      if (container._radialSliderProxyEl)
        container._radialSliderProxyEl.remove();

      const collection = container.querySelector(
        "[data-radial-slider-collection]",
      );
      const track = container.querySelector("[data-radial-slider-list]");
      if (!collection || !track) return;

      container
        .querySelectorAll("[data-radial-slider-clone]")
        .forEach((el) => el.remove());

      const originalItems = Array.from(
        container.querySelectorAll(
          "[data-radial-slider-item]:not([data-radial-slider-clone])",
        ),
      );
      if (!originalItems.length) return;

      container.setAttribute("role", "region");
      container.setAttribute("aria-roledescription", "carousel");
      container.setAttribute(
        "aria-label",
        container.getAttribute("aria-label") || "Radial Cards Slider",
      );

      track.setAttribute("role", "group");
      track.setAttribute("aria-label", "Slides");

      const dotsWrap = container.querySelector(
        "[data-radial-slider-generate-dots]",
      );
      if (dotsWrap) {
        const dots = Array.from(
          dotsWrap.querySelectorAll("[data-radial-slider-control]"),
        );

        if (dots.length) {
          const firstDot = dots[0];

          dots.slice(1).forEach((dot) => dot.remove());

          firstDot.setAttribute("data-radial-slider-control", "1");
          firstDot.setAttribute(
            "data-radial-slider-control-status",
            "not-active",
          );

          for (let i = 2; i <= originalItems.length; i++) {
            const dot = firstDot.cloneNode(true);

            dot.setAttribute("data-radial-slider-control", String(i));
            dot.setAttribute("data-radial-slider-control-status", "not-active");

            dotsWrap.appendChild(dot);
          }
        }
      }

      const controls = Array.from(
        container.querySelectorAll("[data-radial-slider-control]"),
      );
      const totalEl = container.querySelector(
        "[data-radial-slider-total-slide]",
      );
      const indicators = Array.from(
        container.querySelectorAll("[data-radial-slider-active-slide]"),
      );

      originalItems.forEach((item, index) => {
        item.removeAttribute("data-radial-slider-item-status");
        item.removeAttribute("aria-hidden");
        item.setAttribute("role", "group");
        item.setAttribute(
          "aria-label",
          `Slide ${index + 1} of ${originalItems.length}`,
        );
      });

      controls.forEach((btn) => {
        const value = btn.getAttribute("data-radial-slider-control");

        if (value === "prev") btn.setAttribute("aria-label", "Previous slide");
        if (value === "next") btn.setAttribute("aria-label", "Next slide");

        if (/^\d+$/.test(value)) {
          btn.setAttribute("aria-label", `Go to slide ${value}`);
          btn.setAttribute("aria-current", "false");
        }
      });

      track.style.height = "";

      const setNumber = (el, value) => {
        if (!el) return;
        el.textContent = value < 10 ? "0" + value : String(value);
      };

      const mod = (value, total) => ((value % total) + total) % total;

      setNumber(totalEl, originalItems.length);

      const containerStyles = getComputedStyle(container);
      const rotateStep =
        Math.abs(
          parseFloat(containerStyles.getPropertyValue("--slider-rotate")),
        ) || 18;
      const maxLoopItems = Math.max(1, Math.floor(360 / rotateStep));

      const firstRect = originalItems[0].getBoundingClientRect();
      const itemWidth = firstRect.width;
      const itemHeight = firstRect.height;

      const originParts = getComputedStyle(
        originalItems[0],
      ).transformOrigin.split(" ");
      const originY = parseFloat(originParts[1]) || itemHeight * 3.75;
      const wheelRadius = Math.max(0, originY - itemHeight / 2);
      const proxyRadius = wheelRadius + Math.max(itemWidth, itemHeight) * 0.525;

      const getBoundsAtAngle = (angle) => {
        const rad = (angle * Math.PI) / 180;

        return {
          x: Math.sin(rad) * wheelRadius,
          y: originY - Math.cos(rad) * wheelRadius,
          halfWidth:
            (Math.abs(Math.cos(rad)) * itemWidth) / 2 +
            (Math.abs(Math.sin(rad)) * itemHeight) / 2,
          halfHeight:
            (Math.abs(Math.sin(rad)) * itemWidth) / 2 +
            (Math.abs(Math.cos(rad)) * itemHeight) / 2,
        };
      };

      const isOffsetInsideContainer = (offset) => {
        const containerRect = container.getBoundingClientRect();
        const trackRect = track.getBoundingClientRect();

        const originX = trackRect.left + trackRect.width / 2;
        const originYTop = trackRect.top;

        const leftLimit = containerRect.left - originX;
        const rightLimit = containerRect.right - originX;
        const topLimit = containerRect.top - originYTop;
        const bottomLimit = containerRect.bottom - originYTop;

        const bounds = getBoundsAtAngle(offset * rotateStep);

        const cardLeft = bounds.x - bounds.halfWidth;
        const cardRight = bounds.x + bounds.halfWidth;
        const cardTop = bounds.y - bounds.halfHeight;
        const cardBottom = bounds.y + bounds.halfHeight;

        return (
          cardRight >= leftLimit &&
          cardLeft <= rightLimit &&
          cardBottom >= topLimit &&
          cardTop <= bottomLimit
        );
      };

      const getVisibleOffsets = () => {
        const offsets = [0];
        const maxSide = Math.ceil(maxLoopItems / 2);

        let leftEdge = 0;
        let rightEdge = 0;

        for (let i = 1; i <= maxSide; i++) {
          if (!isOffsetInsideContainer(i)) break;
          offsets.push(i);
          rightEdge = i;
        }

        for (let i = 1; i <= maxSide; i++) {
          if (!isOffsetInsideContainer(-i)) break;
          offsets.unshift(-i);
          leftEdge = -i;
        }

        const nextLeft = leftEdge - 1;
        const nextRight = rightEdge + 1;

        if (Math.abs(nextLeft) <= maxSide) offsets.unshift(nextLeft);
        if (Math.abs(nextRight) <= maxSide) offsets.push(nextRight);

        return offsets;
      };

      const visibleOffsets = getVisibleOffsets();
      const minItemsNeeded = Math.min(
        maxLoopItems,
        Math.max(originalItems.length, visibleOffsets.length),
      );
      const neededItems =
        Math.ceil(minItemsNeeded / originalItems.length) * originalItems.length;

      const currentItems = Array.from(
        container.querySelectorAll(
          "[data-radial-slider-item]:not([data-radial-slider-clone])",
        ),
      );

      for (let i = currentItems.length; i < neededItems; i++) {
        const clone = currentItems[i % currentItems.length].cloneNode(true);

        clone.setAttribute("data-radial-slider-clone", "");
        clone.setAttribute("aria-hidden", "true");

        track.appendChild(clone);
      }

      const items = Array.from(
        track.querySelectorAll(":scope > [data-radial-slider-item]"),
      );
      const totalItems = items.length;

      track.style.height = itemHeight + "px";

      items.forEach((item) => {
        item.setAttribute("data-radial-slider-item-status", "not-active");
      });

      container.setAttribute("data-radial-slider-drag-status", "grab");

      const containerRect = container.getBoundingClientRect();
      const collectionRect = collection.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();

      const proxyWrap = document.createElement("div");
      proxyWrap.setAttribute("data-radial-slider-proxy-wrap", "");

      Object.assign(proxyWrap.style, {
        position: "absolute",
        left: containerRect.left - collectionRect.left + "px",
        top: containerRect.top - collectionRect.top + "px",
        width: containerRect.width + "px",
        height: containerRect.height + "px",
        overflow: "hidden",
        pointerEvents: "none",
      });

      const proxy = document.createElement("div");
      proxy.setAttribute("data-radial-slider-proxy", "");

      Object.assign(proxy.style, {
        position: "absolute",
        width: proxyRadius * 2 + "px",
        height: proxyRadius * 2 + "px",
        left: trackRect.left + trackRect.width / 2 - containerRect.left + "px",
        top: trackRect.top - containerRect.top + originY - proxyRadius + "px",
        transform: "translateX(-50%)",
        borderRadius: "50%",
        pointerEvents: "auto",
        opacity: "0",
      });

      proxyWrap.appendChild(proxy);
      collection.appendChild(proxyWrap);

      container._radialSliderProxy = proxy;
      container._radialSliderProxyEl = proxyWrap;

      const setRotation = items.map((item) =>
        gsap.quickSetter(item, "rotation", "deg"),
      );

      gsap.set(proxy, { rotation: 0 });

      const getIndexFromProxy = () =>
        -gsap.getProperty(proxy, "rotation") / rotateStep;

      const nearestDelta = (index, realIndex, total) => {
        const loop = Math.round((realIndex - index) / total);
        return index - (realIndex - loop * total);
      };

      const nearestDeltaToSlideNumber = (targetNumber, realIndex) => {
        let bestDelta = 0;
        let bestDistance = Infinity;

        items.forEach((item, index) => {
          const slideNumber = index % originalItems.length;

          if (slideNumber !== targetNumber) return;

          const delta = nearestDelta(index, realIndex, totalItems);
          const distance = Math.abs(delta);

          if (distance < bestDistance) {
            bestDistance = distance;
            bestDelta = delta;
          }
        });

        return bestDelta;
      };

      let lastActiveIndex = null;

      const setIndicator = (index) => {
        const value = index + 1;
        const text = value < 10 ? "0" + value : String(value);

        indicators.forEach((el) => {
          el.textContent = text;
        });
      };

      const updateControlStatus = (activeIndex) => {
        controls.forEach((btn) => {
          const value = btn.getAttribute("data-radial-slider-control");

          if (!/^\d+$/.test(value)) return;

          const index = Math.max(
            0,
            Math.min(originalItems.length - 1, parseInt(value, 10) - 1),
          );
          const isActive = index === activeIndex;

          btn.setAttribute(
            "data-radial-slider-control-status",
            isActive ? "active" : "not-active",
          );
          btn.setAttribute("aria-current", isActive ? "true" : "false");
        });
      };

      const updateActiveUI = (activeIndex) => {
        if (activeIndex === lastActiveIndex) return;

        setIndicator(activeIndex);
        updateControlStatus(activeIndex);
        lastActiveIndex = activeIndex;
      };

      const render = () => {
        const realIndex = getIndexFromProxy();
        const activeIndex = mod(Math.round(realIndex), totalItems);
        const activeSlideIndex = activeIndex % originalItems.length;

        items.forEach((item, index) => {
          const rotation =
            nearestDelta(index, realIndex, totalItems) * rotateStep;

          item.setAttribute(
            "data-radial-slider-item-status",
            index === activeIndex ? "active" : "inview",
          );
          setRotation[index](rotation);
        });

        updateActiveUI(activeSlideIndex);
      };

      controls.forEach((btn) => {
        btn.disabled = false;

        const value = btn.getAttribute("data-radial-slider-control");

        if (value === "next" || value === "prev") {
          btn.onclick = () => {
            gsap.killTweensOf(proxy);

            const currentIndex = getIndexFromProxy();
            const targetIndex =
              Math.round(currentIndex) + (value === "next" ? 1 : -1);

            gsap.to(proxy, {
              rotation: -targetIndex * rotateStep,
              duration: slideDuration,
              ease: clickEase,
              onUpdate: render,
            });
          };
        }

        if (/^\d+$/.test(value)) {
          const targetSlideNumber = Math.max(
            0,
            Math.min(originalItems.length - 1, parseInt(value, 10) - 1),
          );

          btn.onclick = () => {
            gsap.killTweensOf(proxy);

            const currentIndex = getIndexFromProxy();
            const delta = nearestDeltaToSlideNumber(
              targetSlideNumber,
              currentIndex,
            );

            gsap.to(proxy, {
              rotation: -(currentIndex + delta) * rotateStep,
              duration: slideDuration,
              ease: clickEase,
              onUpdate: render,
            });
          };
        }
      });

      container._radialSliderDraggable = Draggable.create(proxy, {
        type: "rotation",
        trigger: [proxy, ...items],
        inertia: true,
        throwResistance: 2000,
        dragResistance: 0.05,
        maxDuration: 1,
        minDuration: 0.5,
        edgeResistance: 0.75,
        overshootTolerance: 0,
        snap: (value) => Math.round(value / rotateStep) * rotateStep,
        onDrag: render,
        onThrowUpdate: render,
        onThrowComplete: () => {
          container.setAttribute("data-radial-slider-drag-status", "grab");
          render();
        },
        onPress: () =>
          container.setAttribute("data-radial-slider-drag-status", "grabbing"),
        onDragStart: () =>
          container.setAttribute("data-radial-slider-drag-status", "grabbing"),
        onRelease: () =>
          container.setAttribute("data-radial-slider-drag-status", "grab"),
      })[0];

      render();
    });

  if (initRadialCardsSlider._resize) {
    window.removeEventListener("resize", initRadialCardsSlider._resize);
  }

  initRadialCardsSlider._resize = debounceOnWidthChange(
    initRadialCardsSlider,
    200,
  );
  window.addEventListener("resize", initRadialCardsSlider._resize);
}

function debounceOnWidthChange(fn, ms) {
  let lastWidth = window.innerWidth;
  let timer;

  return function (...args) {
    clearTimeout(timer);

    timer = setTimeout(() => {
      if (window.innerWidth === lastWidth) return;

      lastWidth = window.innerWidth;
      fn.apply(this, args);
    }, ms);
  };
}

// Initialize Radial Cards Slider (GSAP)
document.addEventListener("DOMContentLoaded", () => {
  initRadialCardsSlider();
});
```

**Notes:**

- Container: `[data-radial-slider-init]` turns a wrapper into the slider and defines the visible canvas — the script measures it to figure out how many cards fit, auto-generates clones for a seamless loop, and positions cards around the circle.
- Collection: `[data-radial-slider-collection]` is the visual area where cards rotate and where the invisible draggable proxy gets injected.
- List: `[data-radial-slider-list]` holds the cards, takes its height from the first card, and receives generated clones as needed.
- Item: `[data-radial-slider-item]` on each card; the script sets `[data-radial-slider-item-status]` to `"active"` on the current card and `"inview"` on the rest.
- Drag state: the container toggles `[data-radial-slider-drag-status="grab"]` / `"grabbing"` during interaction.
- Circle layout is controlled entirely via CSS custom properties on `[data-radial-slider-init]`:
  - `--slider-rotate` — spacing between cards (smaller = more cards visible around the circle; e.g. `18deg` ≈ 20 cards, `45deg` ≈ 8 cards).
  - `--slider-radius` — size of the circle (larger = cards pushed further from center).
  - Adjust both per breakpoint for responsive density (see the `max-width: 767px` example in the styling above).
- Add `overflow: clip;` to the page/section wrapper on large radial sliders to prevent the offscreen circle from causing horizontal overflow.
- Controls: `[data-radial-slider-control="prev"]` / `"next"` step one card at a time; numbered controls (`data-radial-slider-control="1"`) jump to that slide via the shortest path around the loop.
- Dots: wrap dot buttons in `[data-radial-slider-generate-dots]` with just **one** numbered button as a template — the script deletes extras and clones the template to match the card count.
- Optional counters: `[data-radial-slider-active-slide]` and `[data-radial-slider-total-slide]` on any element (e.g. a `<span>`) auto-display the current slide number and total slide count.

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
