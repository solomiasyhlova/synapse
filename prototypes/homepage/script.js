// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Navbar opacity on scroll ----------
const navbar = document.getElementById("navbar");
const onNavScroll = () => {
  navbar.classList.toggle("scrolled", window.scrollY > 12);
};
onNavScroll();
window.addEventListener("scroll", onNavScroll, { passive: true });

// ---------- Mobile nav toggle ----------
const navToggle = document.getElementById("navToggle");
navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".navbar").classList.toggle("nav-open", !expanded);
});

// ---------- Scroll fade-in ----------
const fadeEls = document.querySelectorAll(".fade-in");
const fadeObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
);
fadeEls.forEach((el) => fadeObserver.observe(el));

// ---------- Pricing billing toggle ----------
const billingToggle = document.getElementById("billingToggle");
const monthlyLabel = document.querySelector(".billing-label:first-child");
const yearlyLabel = document.querySelector(".billing-label:last-child");
const priceAmount = document.querySelector(".price-amount[data-monthly]");
const pricePeriod = document.querySelector(".price-period[data-monthly]");

function setBilling(isYearly) {
  billingToggle.setAttribute("aria-checked", String(isYearly));
  monthlyLabel.dataset.active = String(!isYearly);
  yearlyLabel.dataset.active = String(isYearly);
  if (priceAmount && pricePeriod) {
    priceAmount.textContent = isYearly ? priceAmount.dataset.yearly : priceAmount.dataset.monthly;
    pricePeriod.textContent = isYearly ? pricePeriod.dataset.yearly : pricePeriod.dataset.monthly;
  }
}

billingToggle?.addEventListener("click", () => {
  const isYearly = billingToggle.getAttribute("aria-checked") === "true";
  setBilling(!isYearly);
});

// ---------- Chaos icons animation ----------
(function initChaosIcons() {
  const bounds = document.getElementById("chaosIcons");
  const container = document.getElementById("chaosContainer");
  if (!bounds || !container) return;

  const icons = Array.from(bounds.querySelectorAll(".chaos-icon"));
  const ICON_SIZE = 44;
  const REPEL_RADIUS = 90;
  const REPEL_STRENGTH = 1400;

  let width = bounds.clientWidth;
  let height = bounds.clientHeight;

  const state = icons.map((el, i) => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 0.4 + Math.random() * 0.35;
    return {
      el,
      x: Math.random() * Math.max(width - ICON_SIZE, 1),
      y: Math.random() * Math.max(height - ICON_SIZE, 1),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotPhase: Math.random() * Math.PI * 2,
      rotSpeed: 0.4 + Math.random() * 0.4,
      scalePhase: Math.random() * Math.PI * 2,
      scaleSpeed: 0.5 + Math.random() * 0.5,
    };
  });

  let mouseX = null;
  let mouseY = null;

  bounds.addEventListener("mousemove", (e) => {
    const rect = bounds.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  bounds.addEventListener("mouseleave", () => {
    mouseX = null;
    mouseY = null;
  });

  window.addEventListener("resize", () => {
    width = bounds.clientWidth;
    height = bounds.clientHeight;
  });

  let lastTime = performance.now();
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick(now) {
    const dt = Math.min((now - lastTime) / 16.67, 3);
    lastTime = now;
    const t = now / 1000;

    for (const s of state) {
      const maxX = Math.max(width - ICON_SIZE, 0);
      const maxY = Math.max(height - ICON_SIZE, 0);

      s.x += s.vx * dt;
      s.y += s.vy * dt;

      if (mouseX !== null) {
        const cx = s.x + ICON_SIZE / 2;
        const cy = s.y + ICON_SIZE / 2;
        const dx = cx - mouseX;
        const dy = cy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_RADIUS && dist > 0.01) {
          const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_STRENGTH;
          s.x += (dx / dist) * force * 0.001 * dt;
          s.y += (dy / dist) * force * 0.001 * dt;
        }
      }

      if (s.x <= 0) {
        s.x = 0;
        s.vx = Math.abs(s.vx);
      } else if (s.x >= maxX) {
        s.x = maxX;
        s.vx = -Math.abs(s.vx);
      }

      if (s.y <= 0) {
        s.y = 0;
        s.vy = Math.abs(s.vy);
      } else if (s.y >= maxY) {
        s.y = maxY;
        s.vy = -Math.abs(s.vy);
      }

      const rot = prefersReducedMotion ? 0 : Math.sin(t * s.rotSpeed + s.rotPhase) * 8;
      const scale = prefersReducedMotion ? 1 : 1 + Math.sin(t * s.scaleSpeed + s.scalePhase) * 0.08;

      s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rot}deg) scale(${scale})`;
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
