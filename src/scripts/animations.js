import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Draggable from 'gsap/Draggable';
import InertiaPlugin from 'gsap/InertiaPlugin';
import CustomEase from 'gsap/CustomEase';
import LocomotiveScroll from 'locomotive-scroll';

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin, CustomEase);
CustomEase.create('radial', '0.25, 0.1, 0, 1');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------
   Smooth scroll — Locomotive v5 runs on Lenis and scrolls the window
   natively, so ScrollTrigger only needs a nudge on every scroll frame.
   ------------------------------------------------------------------ */
function initSmoothScroll() {
	if (prefersReducedMotion) return null;

	return new LocomotiveScroll({
		lenisOptions: {
			lerp: 0.09,
			smoothWheel: true,
			wheelMultiplier: 1,
		},
		scrollCallback: () => ScrollTrigger.update(),
	});
}

/* ------------------------------------------------------------------
   Simple reveals for text and card-like elements.
   ------------------------------------------------------------------ */
function initReveals() {
	gsap.utils.toArray('[data-anim="text"]').forEach((el) => {
		gsap.from(el, {
			y: 28,
			autoAlpha: 0,
			duration: 0.9,
			ease: 'power3.out',
			scrollTrigger: { trigger: el, start: 'top 88%' },
		});
	});

	gsap.utils.toArray('[data-anim="card"]').forEach((el) => {
		gsap.from(el, {
			y: 40,
			autoAlpha: 0,
			duration: 1,
			ease: 'power3.out',
			scrollTrigger: { trigger: el, start: 'top 85%' },
		});
	});

	// Groups stagger their direct children.
	gsap.utils.toArray('[data-anim-cards]').forEach((group) => {
		gsap.from(group.children, {
			y: 40,
			autoAlpha: 0,
			duration: 0.8,
			ease: 'power3.out',
			stagger: 0.08,
			scrollTrigger: { trigger: group, start: 'top 85%' },
		});
	});
}

/* ------------------------------------------------------------------
   Avatar arc — scrubbed so the faces settle into the arc as you scroll
   into the section.
   ------------------------------------------------------------------ */
function initAvatarArc() {
	const arc = document.querySelector('[data-avatar-arc]');
	if (!arc) return;

	const section = arc.closest('section');

	gsap.from(arc.children, {
		y: 140,
		scale: 0.55,
		autoAlpha: 0,
		ease: 'none',
		stagger: { each: 0.12, from: 'center' },
		scrollTrigger: {
			trigger: section,
			start: 'top bottom',
			end: 'top 25%',
			scrub: 1,
		},
	});
}

/* ------------------------------------------------------------------
   How-it-works staircase — each step slides in from its own offset,
   scrubbed against the section.
   ------------------------------------------------------------------ */
function initFlowTimeline() {
	const timeline = document.querySelector('[data-flow-timeline]');
	if (!timeline) return;

	const steps = gsap.utils.toArray('[data-flow-step]', timeline);

	steps.forEach((step, i) => {
		gsap.from(step, {
			x: -60,
			y: 40,
			autoAlpha: 0,
			ease: 'none',
			scrollTrigger: {
				trigger: timeline,
				start: `top ${75 - i * 8}%`,
				end: `top ${25 - i * 8}%`,
				scrub: 1,
			},
		});
	});
}

/* ------------------------------------------------------------------
   Quote — starts shrinking once the frame begins leaving the viewport.
   ------------------------------------------------------------------ */
function initQuoteScale() {
	const frame = document.querySelector('[data-quote-frame]');
	if (!frame) return;

	gsap.to(frame, {
		scale: 0.82,
		autoAlpha: 0.55,
		ease: 'none',
		scrollTrigger: {
			trigger: frame,
			start: 'bottom bottom',
			end: 'bottom top',
			scrub: 1,
		},
	});
}

/* ------------------------------------------------------------------
   Accordions — GSAP height tween instead of the native jump.
   ------------------------------------------------------------------ */
function initAccordions() {
	document.querySelectorAll('[data-accordion]').forEach((details) => {
		const summary = details.querySelector('[data-accordion-trigger]');
		const panel = details.querySelector('[data-accordion-panel]');
		if (!summary || !panel) return;

		if (details.open) details.classList.add('is-open');
		gsap.set(panel, { height: details.open ? 'auto' : 0, overflow: 'hidden' });

		let tween;

		summary.addEventListener('click', (event) => {
			event.preventDefault();
			if (tween) tween.kill();

			const opening = !details.classList.contains('is-open');
			details.classList.toggle('is-open', opening);

			if (opening) {
				details.open = true;
				tween = gsap.fromTo(
					panel,
					{ height: 0 },
					{
						height: 'auto',
						duration: 0.55,
						ease: 'power2.out',
						onComplete: () => ScrollTrigger.refresh(),
					}
				);
			} else {
				tween = gsap.to(panel, {
					height: 0,
					duration: 0.45,
					ease: 'power2.in',
					onComplete: () => {
						details.open = false;
						ScrollTrigger.refresh();
					},
				});
			}
		});
	});
}

/* ------------------------------------------------------------------
   Nav theme detection — reads each section's own background colour and
   derives whether the bar needs light or dark items. A section can opt
   out with an explicit `data-nav-theme` attribute.
   ------------------------------------------------------------------ */
function relativeLuminance(color) {
	const parts = color.match(/[\d.]+/g);
	if (!parts) return null;

	const [r, g, b, a = 1] = parts.map(Number);
	if (a === 0) return null; // transparent — fall through to the page background

	const [rl, gl, bl] = [r, g, b].map((channel) => {
		const v = channel / 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

function sectionAppearance(el) {
	// A section with no background of its own shows the page background through.
	let bg = getComputedStyle(el).backgroundColor;
	let lum = relativeLuminance(bg);
	if (lum === null) {
		bg = getComputedStyle(document.body).backgroundColor;
		lum = relativeLuminance(bg);
	}

	// Below the midpoint the background is dark, so the bar needs light items.
	const theme = el.dataset.navTheme ?? (lum !== null && lum < 0.4 ? 'dark' : 'light');
	return { theme, bg };
}

/* ------------------------------------------------------------------
   Fixed nav — stays visible at all times (the page is long, so the menu
   must remain reachable) and recolours itself against whatever section
   sits behind it.
   ------------------------------------------------------------------ */
function initNav() {
	const nav = document.querySelector('[data-nav]');
	if (!nav) return;

	// Never hide on scroll; clear any hidden state a previous build may have set.
	nav.classList.remove('is-hidden');

	/* --- theme per section --- */
	const navLine = nav.offsetHeight / 2;
	const sections = document.querySelectorAll('body > section, body > footer');

	const apply = ({ theme, bg }) => {
		nav.setAttribute('data-nav-theme', theme);
		nav.style.setProperty('--nav-scrim', bg);
	};

	sections.forEach((section) => {
		const appearance = sectionAppearance(section);
		ScrollTrigger.create({
			trigger: section,
			start: `top top+=${navLine}`,
			end: `bottom top+=${navLine}`,
			onEnter: () => apply(appearance),
			onEnterBack: () => apply(appearance),
		});
	});

	if (sections.length) apply(sectionAppearance(sections[0]));
}
/* ------------------------------------------------------------------
   Radial Cards Slider  (see OSMO.md)
   ------------------------------------------------------------------ */
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

function initRadialCardsSlider() {
	const slideDuration = 1;
	const clickEase = 'radial';

	document.querySelectorAll('[data-radial-slider-init]').forEach((container) => {
		if (container._radialSliderDraggable) container._radialSliderDraggable.kill();
		if (container._radialSliderProxy) gsap.killTweensOf(container._radialSliderProxy);
		if (container._radialSliderProxyEl) container._radialSliderProxyEl.remove();

		const collection = container.querySelector('[data-radial-slider-collection]');
		const track = container.querySelector('[data-radial-slider-list]');
		if (!collection || !track) return;

		container.querySelectorAll('[data-radial-slider-clone]').forEach((el) => el.remove());

		const originalItems = Array.from(
			container.querySelectorAll('[data-radial-slider-item]:not([data-radial-slider-clone])')
		);
		if (!originalItems.length) return;

		container.setAttribute('role', 'region');
		container.setAttribute('aria-roledescription', 'carousel');
		container.setAttribute('aria-label', container.getAttribute('aria-label') || 'Radial Cards Slider');

		track.setAttribute('role', 'group');
		track.setAttribute('aria-label', 'Slides');

		const dotsWrap = container.querySelector('[data-radial-slider-generate-dots]');
		if (dotsWrap) {
			const dots = Array.from(dotsWrap.querySelectorAll('[data-radial-slider-control]'));

			if (dots.length) {
				const firstDot = dots[0];

				dots.slice(1).forEach((dot) => dot.remove());

				firstDot.setAttribute('data-radial-slider-control', '1');
				firstDot.setAttribute('data-radial-slider-control-status', 'not-active');

				for (let i = 2; i <= originalItems.length; i++) {
					const dot = firstDot.cloneNode(true);

					dot.setAttribute('data-radial-slider-control', String(i));
					dot.setAttribute('data-radial-slider-control-status', 'not-active');

					dotsWrap.appendChild(dot);
				}
			}
		}

		const controls = Array.from(container.querySelectorAll('[data-radial-slider-control]'));
		const totalEl = container.querySelector('[data-radial-slider-total-slide]');
		const indicators = Array.from(container.querySelectorAll('[data-radial-slider-active-slide]'));

		originalItems.forEach((item, index) => {
			item.removeAttribute('data-radial-slider-item-status');
			item.removeAttribute('aria-hidden');
			item.setAttribute('role', 'group');
			item.setAttribute('aria-label', `Slide ${index + 1} of ${originalItems.length}`);
		});

		controls.forEach((btn) => {
			const value = btn.getAttribute('data-radial-slider-control');

			const labelled = btn.getAttribute('aria-label');
			if (value === 'prev') btn.setAttribute('aria-label', labelled || 'Previous slide');
			if (value === 'next') btn.setAttribute('aria-label', labelled || 'Next slide');

			if (/^\d+$/.test(value)) {
				btn.setAttribute('aria-label', `Go to slide ${value}`);
				btn.setAttribute('aria-current', 'false');
			}
		});

		track.style.height = '';

		const setNumber = (el, value) => {
			if (!el) return;
			el.textContent = value < 10 ? '0' + value : String(value);
		};

		const mod = (value, total) => ((value % total) + total) % total;

		setNumber(totalEl, originalItems.length);

		const containerStyles = getComputedStyle(container);
		const rotateStep = Math.abs(parseFloat(containerStyles.getPropertyValue('--slider-rotate'))) || 18;
		const maxLoopItems = Math.max(1, Math.floor(360 / rotateStep));

		const firstRect = originalItems[0].getBoundingClientRect();
		const itemWidth = firstRect.width;
		const itemHeight = firstRect.height;

		const originParts = getComputedStyle(originalItems[0]).transformOrigin.split(' ');
		const originY = parseFloat(originParts[1]) || itemHeight * 3.75;
		const wheelRadius = Math.max(0, originY - itemHeight / 2);
		const proxyRadius = wheelRadius + Math.max(itemWidth, itemHeight) * 0.525;

		const getBoundsAtAngle = (angle) => {
			const rad = (angle * Math.PI) / 180;

			return {
				x: Math.sin(rad) * wheelRadius,
				y: originY - Math.cos(rad) * wheelRadius,
				halfWidth: (Math.abs(Math.cos(rad)) * itemWidth) / 2 + (Math.abs(Math.sin(rad)) * itemHeight) / 2,
				halfHeight: (Math.abs(Math.sin(rad)) * itemWidth) / 2 + (Math.abs(Math.cos(rad)) * itemHeight) / 2,
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
			Math.max(originalItems.length, visibleOffsets.length)
		);
		const neededItems = Math.ceil(minItemsNeeded / originalItems.length) * originalItems.length;

		const currentItems = Array.from(
			container.querySelectorAll('[data-radial-slider-item]:not([data-radial-slider-clone])')
		);

		for (let i = currentItems.length; i < neededItems; i++) {
			const clone = currentItems[i % currentItems.length].cloneNode(true);

			clone.setAttribute('data-radial-slider-clone', '');
			clone.setAttribute('aria-hidden', 'true');

			track.appendChild(clone);
		}

		const items = Array.from(track.querySelectorAll(':scope > [data-radial-slider-item]'));
		const totalItems = items.length;

		track.style.height = itemHeight + 'px';

		items.forEach((item) => {
			item.setAttribute('data-radial-slider-item-status', 'not-active');
		});

		container.setAttribute('data-radial-slider-drag-status', 'grab');

		const containerRect = container.getBoundingClientRect();
		const collectionRect = collection.getBoundingClientRect();
		const trackRect = track.getBoundingClientRect();

		const proxyWrap = document.createElement('div');
		proxyWrap.setAttribute('data-radial-slider-proxy-wrap', '');

		Object.assign(proxyWrap.style, {
			position: 'absolute',
			left: containerRect.left - collectionRect.left + 'px',
			top: containerRect.top - collectionRect.top + 'px',
			width: containerRect.width + 'px',
			height: containerRect.height + 'px',
			overflow: 'hidden',
			pointerEvents: 'none',
		});

		const proxy = document.createElement('div');
		proxy.setAttribute('data-radial-slider-proxy', '');

		Object.assign(proxy.style, {
			position: 'absolute',
			width: proxyRadius * 2 + 'px',
			height: proxyRadius * 2 + 'px',
			left: trackRect.left + trackRect.width / 2 - containerRect.left + 'px',
			top: trackRect.top - containerRect.top + originY - proxyRadius + 'px',
			transform: 'translateX(-50%)',
			borderRadius: '50%',
			pointerEvents: 'auto',
			opacity: '0',
		});

		proxyWrap.appendChild(proxy);
		collection.appendChild(proxyWrap);

		container._radialSliderProxy = proxy;
		container._radialSliderProxyEl = proxyWrap;

		const setRotation = items.map((item) => gsap.quickSetter(item, 'rotation', 'deg'));

		gsap.set(proxy, { rotation: 0 });

		const getIndexFromProxy = () => -gsap.getProperty(proxy, 'rotation') / rotateStep;

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
			const text = value < 10 ? '0' + value : String(value);

			indicators.forEach((el) => {
				el.textContent = text;
			});
		};

		const updateControlStatus = (activeIndex) => {
			controls.forEach((btn) => {
				const value = btn.getAttribute('data-radial-slider-control');

				if (!/^\d+$/.test(value)) return;

				const index = Math.max(0, Math.min(originalItems.length - 1, parseInt(value, 10) - 1));
				const isActive = index === activeIndex;

				btn.setAttribute('data-radial-slider-control-status', isActive ? 'active' : 'not-active');
				btn.setAttribute('aria-current', isActive ? 'true' : 'false');
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
				const rotation = nearestDelta(index, realIndex, totalItems) * rotateStep;

				item.setAttribute(
					'data-radial-slider-item-status',
					index === activeIndex ? 'active' : 'inview'
				);
				setRotation[index](rotation);
			});

			updateActiveUI(activeSlideIndex);
		};

		controls.forEach((btn) => {
			btn.disabled = false;

			const value = btn.getAttribute('data-radial-slider-control');

			if (value === 'next' || value === 'prev') {
				btn.onclick = () => {
					gsap.killTweensOf(proxy);

					const currentIndex = getIndexFromProxy();
					const targetIndex = Math.round(currentIndex) + (value === 'next' ? 1 : -1);

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
					Math.min(originalItems.length - 1, parseInt(value, 10) - 1)
				);

				btn.onclick = () => {
					gsap.killTweensOf(proxy);

					const currentIndex = getIndexFromProxy();
					const delta = nearestDeltaToSlideNumber(targetSlideNumber, currentIndex);

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
			type: 'rotation',
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
				container.setAttribute('data-radial-slider-drag-status', 'grab');
				render();
			},
			onPress: () => container.setAttribute('data-radial-slider-drag-status', 'grabbing'),
			onDragStart: () => container.setAttribute('data-radial-slider-drag-status', 'grabbing'),
			onRelease: () => container.setAttribute('data-radial-slider-drag-status', 'grab'),
		})[0];

		render();
	});

	if (initRadialCardsSlider._resize) {
		window.removeEventListener('resize', initRadialCardsSlider._resize);
	}

	initRadialCardsSlider._resize = debounceOnWidthChange(initRadialCardsSlider, 200);
	window.addEventListener('resize', initRadialCardsSlider._resize);
}

/* ------------------------------------------------------------------
   Hero breakout animation — 12 participants flip and reshuffle into new
   breakout groups, with a question card surfacing between each scramble.
   ------------------------------------------------------------------ */
function initBreakout() {
	const root = document.querySelector('[data-breakout]');
	if (!root) return;

	const cols = gsap.utils.toArray('[data-col]', root);
	if (!cols.length) return;
	const scrim = root.querySelector('[data-breakout-scrim]');
	const qWrap = root.querySelector('[data-breakout-q]');
	const qLabel = root.querySelector('[data-q-label]');
	const qText = root.querySelector('[data-q-text]');

	const questions = [
		"What's the one default setting in your product you'd change tomorrow to make insecure use harder? Who do you need to convince?",
		'Where does security actually touch your part of the business?',
		'When your incident comes, will you lose trust — or win it?',
	];

	gsap.set(qWrap, { autoAlpha: 0, y: 14 });
	gsap.set(scrim, { autoAlpha: 0 });

	// Each column strip is COPIES identical copies stacked vertically (Hero.astro).
	// We keep its offset wrapped inside one copy's height, so nudging a whole
	// column by one tile up or down loops seamlessly — the duplicated copies above
	// and below hide the seam. Calm, uniform column motion instead of a scramble.
	const COPIES = 4;
	const strips = cols.map((col) => {
		const tileH = col.children[0].getBoundingClientRect().height;
		const setH = (col.children.length / COPIES) * tileH;
		const wrap = gsap.utils.wrap(-2 * setH, -setH);
		const s = { col, tileH, setH, wrap, y: wrap(-1.5 * setH) };
		gsap.set(col, { y: s.y });
		return s;
	});
	if (strips.some((s) => !s.setH)) return; // not laid out (e.g. below lg)

	let round = 0;

	// Move every column by exactly one tile (each independently up or down), then
	// wrap the offset back into the middle band with an invisible jump.
	function shiftColumns() {
		strips.forEach((s) => {
			const dir = Math.random() < 0.5 ? 1 : -1;
			const target = s.y + dir * s.tileH;
			gsap.to(s.col, {
				y: target,
				duration: 1.1,
				ease: 'power2.inOut',
				onComplete: () => {
					const wrapped = s.wrap(target);
					if (wrapped !== target) gsap.set(s.col, { y: wrapped });
					s.y = wrapped;
				},
			});
		});
		gsap.delayedCall(1.35, askQuestion);
	}

	// A shared question drops in over the settled columns, holds, clears, and
	// they "talk" for ~2s before the next shift.
	function askQuestion() {
		qLabel.textContent = `Question ${round + 1}`;
		qText.textContent = questions[round % questions.length];
		gsap
			.timeline({
				onComplete: () => {
					round += 1;
					shiftColumns();
				},
			})
			.to(scrim, { autoAlpha: 1, duration: 0.4 })
			.to(qWrap, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power3.out' }, '<')
			.to({}, { duration: 1.8 })
			.to(qWrap, { autoAlpha: 0, y: 14, duration: 0.4, ease: 'power2.in' })
			.to(scrim, { autoAlpha: 0, duration: 0.4 }, '<')
			.to({}, { duration: 2 });
	}

	gsap.delayedCall(0.8, shiftColumns);
}

/* ------------------------------------------------------------------
   Strikethrough — draws the line across [data-strike] text as it scrolls
   through, via a --strike (0→1) custom property the CSS reads.
   ------------------------------------------------------------------ */
function initStrike() {
	gsap.utils.toArray('[data-strike]').forEach((el) => {
		gsap.fromTo(
			el,
			{ '--strike': 0 },
			{
				'--strike': 1,
				ease: 'none',
				scrollTrigger: { trigger: el, start: 'top 80%', end: 'top 45%', scrub: true },
			}
		);
	});
}

function init() {
	initSmoothScroll();
	initNav();
	initAccordions();
	initRadialCardsSlider();

	if (!prefersReducedMotion) {
		initReveals();
		initAvatarArc();
		initFlowTimeline();
		initQuoteScale();
		initBreakout();
		initStrike();
	}

	// Images settle late; re-measure once everything has loaded.
	window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
