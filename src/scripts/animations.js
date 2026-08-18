import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Draggable from 'gsap/Draggable';
import LocomotiveScroll from 'locomotive-scroll';

gsap.registerPlugin(ScrollTrigger, Draggable);

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
   Fixed nav — hides on scroll-down, returns on scroll-up, and recolours
   itself against whatever section sits behind it.
   ------------------------------------------------------------------ */
function initNav() {
	const nav = document.querySelector('[data-nav]');
	if (!nav) return;

	/* --- hide / show --- */
	const HIDE_AFTER = 120; // px before hiding is allowed
	const DELTA = 6; // ignore sub-pixel jitter
	let lastY = window.scrollY;

	const onScroll = () => {
		const y = window.scrollY;
		const diff = y - lastY;
		if (Math.abs(diff) < DELTA) return;

		// Always visible near the top; otherwise follow scroll direction.
		nav.classList.toggle('is-hidden', y > HIDE_AFTER && diff > 0);
		lastY = y;
	};

	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });

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
   Flick Cards Slider  (see OSMO.md)
   ------------------------------------------------------------------ */
function initFlickCards() {
	const sliders = document.querySelectorAll('[data-flick-cards-init]');

	sliders.forEach((slider) => {
		const list = slider.querySelector('[data-flick-cards-list]');
		const cards = Array.from(list.querySelectorAll('[data-flick-cards-item]'));
		const total = cards.length;
		let activeIndex = 0;

		const sliderWidth = slider.offsetWidth;
		const threshold = 0.1;

		// Generate draggers inside each card and store references
		const draggers = [];
		cards.forEach((card) => {
			const dragger = document.createElement('div');
			dragger.setAttribute('data-flick-cards-dragger', '');
			card.appendChild(dragger);
			draggers.push(dragger);
		});

		// Set initial drag status
		slider.setAttribute('data-flick-drag-status', 'grab');

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
				default: {
					const dir = diff > 0 ? 1 : -1;
					return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
				}
			}
		}

		function renderCards(currentIndex) {
			cards.forEach((card, i) => {
				const cfg = getConfig(i, currentIndex);
				let status;

				if (cfg.x === 0) status = 'active';
				else if (cfg.x === 25) status = '2-after';
				else if (cfg.x === -25) status = '2-before';
				else if (cfg.x === 45) status = '3-after';
				else if (cfg.x === -45) status = '3-before';
				else status = 'hidden';

				card.setAttribute('data-flick-cards-item-status', status);
				card.style.zIndex = cfg.z;

				gsap.to(card, {
					duration: 0.6,
					ease: 'elastic.out(1.2, 1)',
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
			console.log('Not minimum of 7 cards');
			return;
		}

		let pressClientX = 0;
		let pressClientY = 0;

		Draggable.create(draggers, {
			type: 'x',
			edgeResistance: 0.8,
			bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
			inertia: false,

			onPress() {
				pressClientX = this.pointerEvent.clientX;
				pressClientY = this.pointerEvent.clientY;
				slider.setAttribute('data-flick-drag-status', 'grabbing');
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
						xPercent: mix('x'),
						yPercent: mix('y'),
						rotation: mix('rot'),
						scale: mix('s'),
						opacity: mix('o'),
					});
				});
			},

			onRelease() {
				slider.setAttribute('data-flick-drag-status', 'grab');

				const releaseClientX = this.pointerEvent.clientX;
				const releaseClientY = this.pointerEvent.clientY;
				const dragDistance = Math.hypot(
					releaseClientX - pressClientX,
					releaseClientY - pressClientY
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
					ease: 'power1.out',
				});

				if (dragDistance < 4) {
					// Temporarily allow clicks to pass through
					this.target.style.pointerEvents = 'none';

					// Allow the DOM to register pointer-through
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							const el = document.elementFromPoint(releaseClientX, releaseClientY);
							if (el) {
								const evt = new MouseEvent('click', {
									view: window,
									bubbles: true,
									cancelable: true,
								});
								el.dispatchEvent(evt);
							}

							// Restore pointer events
							this.target.style.pointerEvents = 'auto';
						});
					});
				}
			},
		});
	});
}

function init() {
	initSmoothScroll();
	initNav();
	initAccordions();
	initFlickCards();

	if (!prefersReducedMotion) {
		initReveals();
		initAvatarArc();
		initFlowTimeline();
		initQuoteScale();
	}

	// Images settle late; re-measure once everything has loaded.
	window.addEventListener('load', () => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', init);
} else {
	init();
}
