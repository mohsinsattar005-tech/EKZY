// Ozvio - Category pages JavaScript
// Products come from window.CATEGORY_PRODUCTS, defined in each category page.
// Sorting always reads the price and the "added" date of every product, so a
// product you add later is sorted automatically.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const header = document.querySelector('.header');
    const mainNav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const grid = document.getElementById('products-container');
    const sortSelect = document.getElementById('sortSelect');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const DAY = 86400000;
    const NEW_FOR_DAYS = 30;   // a product shows the NEW badge for this many days

    /* ------------------------------------------------------------------
       Saved cart + wishlist (shared between the category pages)
    ------------------------------------------------------------------ */
    function readStore(key, fallback) {
        try {
            const value = JSON.parse(localStorage.getItem(key));
            return value === null || value === undefined ? fallback : value;
        } catch (err) {
            return fallback;
        }
    }

    function writeStore(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) { /* storage blocked */ }
    }

    let cart = readStore('gz_cart', {});
    if (!cart || typeof cart !== 'object' || Array.isArray(cart)) cart = {};

    const savedWishlist = readStore('gz_wishlist', []);
    const wishlist = new Set(Array.isArray(savedWishlist) ? savedWishlist : []);

    let searchQuery = '';

    /* ------------------------------------------------------------------
       Products
    ------------------------------------------------------------------ */
    const source = Array.isArray(window.CATEGORY_PRODUCTS) ? window.CATEGORY_PRODUCTS : [];

    const items = source.map(function (p, i) {
        return {
            name: String(p.name || 'Product'),
            price: Number(p.price) || 0,
            oldPrice: Number(p.oldPrice) || 0,
            rating: Number(p.rating) || 0,
            icon: p.icon || 'fas fa-box',
            image: p.image || '',
            time: Date.parse(p.added) || 0,
            index: i
        };
    });

    /* ------------------------------------------------------------------
       Toast
    ------------------------------------------------------------------ */
    let toastTimer;

    function showNotification(message) {
        toastEl.textContent = '';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        toastEl.appendChild(icon);
        toastEl.appendChild(document.createTextNode(message));

        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 3000);
    }

    /* ------------------------------------------------------------------
       Header: scroll state + mobile menu
    ------------------------------------------------------------------ */
    function setMenuOpen(open) {
        mainNav.classList.toggle('active', open);
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    menuToggle.addEventListener('click', function () { setMenuOpen(!mainNav.classList.contains('active')); });
    mainNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () { setMenuOpen(false); });
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenuOpen(false); });

    function onScroll() { header.classList.toggle('scrolled', window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Links that do not lead anywhere yet should not jump to the top
    document.querySelectorAll('a[href="#"]').forEach(function (link) {
        link.addEventListener('click', function (e) { e.preventDefault(); });
    });

    /* ------------------------------------------------------------------
       Header icons + badges
    ------------------------------------------------------------------ */
    function cartTotalItems() {
        return Object.keys(cart).reduce(function (sum, key) { return sum + (Number(cart[key]) || 0); }, 0);
    }

    function updateBadge(el, count, animate) {
        el.textContent = count;
        el.hidden = count === 0;
        if (animate) {
            el.classList.remove('bump');
            void el.offsetWidth; // restart animation
            el.classList.add('bump');
        }
    }

    updateBadge(cartCountEl, cartTotalItems(), false);
    updateBadge(wishlistCountEl, wishlist.size, false);

    document.getElementById('accountLink').addEventListener('click', function () {
        window.location.href = '../account/login/login.html';
    });

    document.getElementById('wishlistLink').addEventListener('click', function () {
        window.location.href = '../wishlist/wishlist.html';
    });

    document.getElementById('cartLink').addEventListener('click', function () {
        const n = cartTotalItems();
        showNotification(n ? 'You have ' + n + ' item' + (n > 1 ? 's' : '') + ' in your cart' : 'Your cart is empty');
    });

    /* ------------------------------------------------------------------
       Helpers
    ------------------------------------------------------------------ */
    function escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, function (ch) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
        });
    }

    function formatPrice(value) {
        return '$' + value.toLocaleString('en-US');
    }

    function generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let html = '';

        for (let i = 0; i < fullStars; i++) html += '<i class="fas fa-star"></i>';
        if (hasHalfStar) html += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < 5 - Math.ceil(rating); i++) html += '<i class="far fa-star"></i>';

        return html;
    }

    function isNew(item) {
        return item.time > 0 && (Date.now() - item.time) <= NEW_FOR_DAYS * DAY;
    }

    function discountPercent(item) {
        return item.oldPrice > item.price ? Math.round((1 - item.price / item.oldPrice) * 100) : 0;
    }

    /* ------------------------------------------------------------------
       Sorting (price + date)
    ------------------------------------------------------------------ */
    const sorters = {
        'newest':     function (a, b) { return b.time - a.time; },
        'price-asc':  function (a, b) { return a.price - b.price; },
        'price-desc': function (a, b) { return b.price - a.price; },
        'rating':     function (a, b) { return b.rating - a.rating; }
    };

    function sortItems(list, mode) {
        const primary = sorters[mode] || sorters.newest;
        // Ties: newer date first; products without a date: later in the list = newer
        return list.slice().sort(function (a, b) {
            return primary(a, b) || (b.time - a.time) || (b.index - a.index);
        });
    }

    /* ------------------------------------------------------------------
       Rendering
    ------------------------------------------------------------------ */
    function cardHTML(item, position) {
        const liked = wishlist.has(item.name);
        const percent = discountPercent(item);
        let badge = '';

        if (isNew(item)) badge = '<span class="new-badge">New</span>';
        else if (percent) badge = '<span class="new-badge sale">-' + percent + '%</span>';

        const visual = item.image
            ? '<img src="' + escapeHTML(item.image) + '" alt="' + escapeHTML(item.name) + '" loading="lazy">'
            : '<i class="' + escapeHTML(item.icon) + '"></i>';

        return '' +
            '<article class="product-card" style="--i:' + Math.min(position, 12) + '">' +
                badge +
                '<button class="wishlist-btn' + (liked ? ' active' : '') + '" data-index="' + item.index + '" aria-label="Toggle wishlist">' +
                    '<i class="' + (liked ? 'fas' : 'far') + ' fa-heart"></i>' +
                '</button>' +
                '<div class="product-image">' + visual + '</div>' +
                '<div class="product-info">' +
                    '<h3>' + escapeHTML(item.name) + '</h3>' +
                    '<div class="price">' +
                        '<span class="current-price">' + formatPrice(item.price) + '</span>' +
                        (percent ? '<span class="old-price">' + formatPrice(item.oldPrice) + '</span>' : '') +
                    '</div>' +
                    '<div class="rating">' + generateRatingStars(item.rating) + '<span>(' + item.rating.toFixed(1) + ')</span></div>' +
                    '<div class="product-actions">' +
                        '<button class="btn btn-primary add-to-cart" data-index="' + item.index + '">Add to Cart</button>' +
                        '<a href="product/product.html" class="btn btn-outline">View Product</a>' +
                    '</div>' +
                '</div>' +
            '</article>';
    }

    function render() {
        const query = searchQuery.trim().toLowerCase();
        const filtered = query ? items.filter(function (p) { return p.name.toLowerCase().includes(query); }) : items;

        if (!filtered.length) {
            grid.innerHTML = '<p class="no-results">' +
                (items.length ? 'No products match your search. Try a different keyword.' : 'No products here yet. Check back soon.') +
                '</p>';
            return;
        }

        grid.innerHTML = sortItems(filtered, sortSelect.value).map(cardHTML).join('');
        bindTilt();
    }

    /* ------------------------------------------------------------------
       3D tilt on product cards (mouse devices only)
    ------------------------------------------------------------------ */
    const canTilt = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

    function bindTilt() {
        if (!canTilt) return;

        grid.querySelectorAll('.product-card').forEach(function (card) {
            card.addEventListener('mousemove', function (e) {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width;
                const y = (e.clientY - rect.top) / rect.height;

                card.classList.add('is-tilting');
                card.style.setProperty('--mx', (x * 100) + '%');
                card.style.setProperty('--my', (y * 100) + '%');
                card.style.transform =
                    'perspective(900px) rotateX(' + ((0.5 - y) * 10) + 'deg) rotateY(' + ((x - 0.5) * 12) + 'deg) translateY(-6px)';
            });

            card.addEventListener('mouseleave', function () {
                card.classList.remove('is-tilting');
                card.style.transform = '';
            });
        });
    }

    /* ------------------------------------------------------------------
       Product clicks: add to cart, view, wishlist
    ------------------------------------------------------------------ */
    grid.addEventListener('click', function (e) {
        const button = e.target.closest('.add-to-cart, .view-product, .wishlist-btn');
        if (!button) return;
        e.preventDefault();

        const item = items[Number(button.dataset.index)];
        if (!item) return;

        if (button.classList.contains('add-to-cart')) {
            cart[item.name] = (Number(cart[item.name]) || 0) + 1;
            writeStore('gz_cart', cart);
            updateBadge(cartCountEl, cartTotalItems(), true);
            showNotification('Added "' + item.name + '" to cart!');
        } else if (button.classList.contains('view-product')) {
            showNotification('Viewing "' + item.name + '" - Feature coming soon!');
        } else {
            const icon = button.querySelector('i');
            if (wishlist.has(item.name)) {
                wishlist.delete(item.name);
                button.classList.remove('active');
                icon.classList.replace('fas', 'far');
                showNotification('Removed "' + item.name + '" from wishlist');
            } else {
                wishlist.add(item.name);
                button.classList.add('active');
                icon.classList.replace('far', 'fas');
                showNotification('Added "' + item.name + '" to wishlist!');
            }
            writeStore('gz_wishlist', Array.from(wishlist));
            updateBadge(wishlistCountEl, wishlist.size, true);
        }
    });

    /* ------------------------------------------------------------------
       Sort + search
    ------------------------------------------------------------------ */
    sortSelect.addEventListener('change', render);

    searchInput.addEventListener('input', function () {
        searchQuery = this.value;
        render();
    });

    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchQuery = searchInput.value;
        render();
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });

    /* ------------------------------------------------------------------
       Hero: gentle 3D tilt (desktop pointer only)
    ------------------------------------------------------------------ */
    const hero = document.querySelector('.hero');
    const heroStage = document.querySelector('.hero-stage');
    const heroGlow = document.querySelector('.hero-glow');

    if (hero && heroStage && canTilt) {
        hero.addEventListener('mousemove', function (e) {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            heroStage.style.setProperty('--ry', (-14 + x * 10) + 'deg');
            heroStage.style.setProperty('--rx', (8 - y * 8) + 'deg');
            if (heroGlow) heroGlow.style.transform = 'translate(' + (x * 24) + 'px, calc(-45% + ' + (y * 24) + 'px))';
        });

        hero.addEventListener('mouseleave', function () {
            heroStage.style.removeProperty('--ry');
            heroStage.style.removeProperty('--rx');
            if (heroGlow) heroGlow.style.transform = '';
        });
    }

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    render();
});
