const carousel = document.querySelector("#albumCarousel");
const prevButton = document.querySelector(".carousel-prev");
const nextButton = document.querySelector(".carousel-next");
const searchToggle = document.querySelector(".search-toggle");
const searchPanel = document.querySelector(".search-panel");
const searchInput = document.querySelector(".search-field input");
const cartToggle = document.querySelector(".cart-toggle");
const cartPanel = document.querySelector(".cart-panel");
const cartOverlay = document.querySelector(".cart-overlay");
const cartClose = document.querySelector(".cart-close");

let carouselIndex = 0;
let carouselOriginalCount = 0;
let carouselCloneCount = 0;
let carouselResetTimer;

if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

window.addEventListener("pageshow", () => {
    window.scrollTo(0, 0);
    resetCarouselPosition();
});

function toggleSearch() {
    const isOpen = searchPanel.classList.toggle("is-open");
    searchToggle.setAttribute("aria-expanded", String(isOpen));

    if (isOpen) {
        window.setTimeout(() => searchInput.focus(), 220);
    }
}

function openCart() {
    cartOverlay.hidden = false;
    requestAnimationFrame(() => {
        cartPanel.classList.add("is-open");
        cartOverlay.classList.add("is-open");
        cartPanel.setAttribute("aria-hidden", "false");
        cartToggle.setAttribute("aria-expanded", "true");
    });
}

function closeCart() {
    cartPanel.classList.remove("is-open");
    cartOverlay.classList.remove("is-open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartToggle.setAttribute("aria-expanded", "false");

    window.setTimeout(() => {
        if (!cartOverlay.classList.contains("is-open")) {
            cartOverlay.hidden = true;
        }
    }, 260);
}

function getCarouselMetrics() {
    const firstCard = carousel?.querySelector(".album-card");
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 214;
    const styles = carousel ? window.getComputedStyle(carousel) : null;
    const gap = styles ? parseFloat(styles.columnGap || styles.gap || "18") : 18;
    const visible = Math.max(1, Math.floor((carousel.clientWidth + gap) / (cardWidth + gap)));
    const total = carousel ? carousel.querySelectorAll(".album-card").length : 0;

    return {
        step: cardWidth + gap,
        visible,
        total,
        lastStart: Math.max(0, total - visible)
    };
}

function jumpCarouselTo(index) {
    if (!carousel) return;

    carousel.classList.add("is-jumping");
    carousel.scrollLeft = index * getCarouselMetrics().step;
    requestAnimationFrame(() => carousel.classList.remove("is-jumping"));
}

function setupInfiniteCarousel() {
    if (!carousel) return;

    const originalCards = Array.from(carousel.querySelectorAll(".album-card"));
    carouselOriginalCount = originalCards.length;
    carouselCloneCount = Math.min(5, carouselOriginalCount);

    const beforeClones = originalCards.slice(-carouselCloneCount).map((card) => card.cloneNode(true));
    const afterClones = originalCards.slice(0, carouselCloneCount).map((card) => card.cloneNode(true));

    beforeClones.forEach((card) => carousel.prepend(card));
    afterClones.forEach((card) => carousel.append(card));

    carouselIndex = carouselCloneCount;
    jumpCarouselTo(carouselIndex);
}

function normalizeCarouselLoop() {
    if (!carousel) return;

    if (carouselIndex >= carouselCloneCount + carouselOriginalCount) {
        carouselIndex = carouselCloneCount;
        jumpCarouselTo(carouselIndex);
    }

    if (carouselIndex < carouselCloneCount) {
        carouselIndex = carouselCloneCount + carouselOriginalCount - 1;
        jumpCarouselTo(carouselIndex);
    }
}

function moveCarousel(direction) {
    if (!carousel) return;

    const metrics = getCarouselMetrics();
    carouselIndex += direction;
    carousel.scrollTo({
        left: carouselIndex * metrics.step,
        behavior: "smooth"
    });

    window.clearTimeout(carouselResetTimer);
    carouselResetTimer = window.setTimeout(normalizeCarouselLoop, 420);
}

function resetCarouselPosition() {
    if (!carousel) return;
    carouselIndex = carouselCloneCount;
    jumpCarouselTo(carouselIndex);
}

searchToggle?.addEventListener("click", toggleSearch);
cartToggle?.addEventListener("click", openCart);
cartClose?.addEventListener("click", closeCart);
cartOverlay?.addEventListener("click", closeCart);
prevButton?.addEventListener("click", () => moveCarousel(-1));
nextButton?.addEventListener("click", () => moveCarousel(1));
window.addEventListener("resize", resetCarouselPosition);

carousel?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") moveCarousel(-1);
    if (event.key === "ArrowRight") moveCarousel(1);
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        if (cartPanel?.classList.contains("is-open")) closeCart();
        if (searchPanel?.classList.contains("is-open")) toggleSearch();
    }
});

setupInfiniteCarousel();
