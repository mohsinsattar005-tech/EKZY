// Ozvio - Premium website JavaScript

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const header = document.querySelector('.header');
    const mainNav = document.getElementById('mainNav');
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.querySelectorAll('.main-nav a');
    const productsContainer = document.getElementById('products-container');
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    /* ------------------------------------------------------------------
       State
    ------------------------------------------------------------------ */
    const CART_KEY = 'gz_cart';                  // shared with cart/cart.js
    const CART_PAGE = 'cart/cart.html';
    const PRODUCT_PAGE = 'product.html?id=';
    const cart = new Map();      // productId -> quantity (saved in localStorage)
    try {
        const stored = JSON.parse(localStorage.getItem(CART_KEY)) || {};
        Object.keys(stored).forEach(id => { if (stored[id] > 0) cart.set(Number(id), stored[id]); });
    } catch (e) { /* ignore broken storage */ }
    function saveCart() {
        try {
            const obj = {};
            cart.forEach((qty, id) => { obj[id] = qty; });
            localStorage.setItem(CART_KEY, JSON.stringify(obj));
        } catch (e) { /* storage blocked */ }
    }
    const wishlist = new Set();  // productIds
    let searchQuery = '';

    // Product data for New Arrivals
    const products = [
        { id: 1, name: 'Premium Smartphone X',      price: 599,  oldPrice: 699,  rating: 4.5, icon: 'fas fa-mobile-alt', badge: 'New' },
        { id: 2, name: 'Ultra Laptop Pro',          price: 1299, oldPrice: 1499, rating: 5.0, icon: 'fas fa-laptop',     badge: 'New' },
        { id: 3, name: 'Wireless Headphones Elite', price: 199,  oldPrice: 249,  rating: 4.8, icon: 'fas fa-headphones', badge: 'New' },
        { id: 4, name: 'Smart Watch Series 5',      price: 399,  oldPrice: 499,  rating: 4.6, icon: 'fas fa-clock',      badge: 'New' },
        { id: 5, name: 'Gaming Console Ultimate',   price: 499,  oldPrice: 599,  rating: 4.9, icon: 'fas fa-gamepad',    badge: 'New' },
        { id: 6, name: '4K Smart TV 55 inch',       price: 899,  oldPrice: 1099, rating: 4.7, icon: 'fas fa-tv',         badge: 'New' }
    ];

    /* ------------------------------------------------------------------
       Toast notification
    ------------------------------------------------------------------ */
    let toastTimer;

    function showNotification(message) {
        toastEl.textContent = '';
        const icon = document.createElement('i');
        icon.className = 'fas fa-check-circle';
        toastEl.appendChild(icon);
        toastEl.appendChild(document.createTextNode(message)); // textContent-safe

        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    /* ------------------------------------------------------------------
       Header: scroll state, mobile menu, active link
    ------------------------------------------------------------------ */
    function setMenuOpen(open) {
        mainNav.classList.toggle('active', open);
        menuToggle.classList.toggle('open', open);
        menuToggle.setAttribute('aria-expanded', String(open));
    }

    menuToggle.addEventListener('click', () => setMenuOpen(!mainNav.classList.contains('active')));
    navLinks.forEach(link => link.addEventListener('click', () => setMenuOpen(false)));
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenuOpen(false); });

    const spySections = ['home', 'categories', 'new-arrivals', 'contact']
        .map(id => document.getElementById(id))
        .filter(Boolean);

    function onScroll() {
        header.classList.toggle('scrolled', window.scrollY > 20);

        // Highlight the nav link of the section currently in view
        const marker = window.scrollY + header.offsetHeight + 120;
        let currentId = 'home';
        spySections.forEach(section => { if (section.offsetTop <= marker) currentId = section.id; });
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + currentId));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ------------------------------------------------------------------
       Smooth scrolling + placeholder links
    ------------------------------------------------------------------ */
    function scrollToSection(targetId) {
        if (targetId === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const target = document.querySelector(targetId);
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - header.offsetHeight + 1;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            // Pages that do not exist yet (e.g. Affiliate Program)
            if (this.dataset.placeholder) {
                setMenuOpen(false);
                showNotification(`${this.dataset.placeholder} - coming soon!`);
                return;
            }
            if (targetId === '#') return;
            scrollToSection(targetId);
        });
    });

    /* ------------------------------------------------------------------
       Header icons: account, wishlist, cart
    ------------------------------------------------------------------ */
    function updateBadge(el, count) {
        el.textContent = count;
        el.hidden = count === 0;
        el.classList.remove('bump');
        void el.offsetWidth; // restart animation
        el.classList.add('bump');
    }

    function cartTotalItems() {
        let total = 0;
        cart.forEach(qty => { total += qty; });
        return total;
    }

    document.getElementById('accountLink').addEventListener('click', () => {
        window.location.href = '../account/login/login.html';
    });

    document.getElementById('wishlistLink').addEventListener('click', () => {
        window.location.href = '../wishlist/wishlist.html';
    });

    document.getElementById('cartLink').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = CART_PAGE;
    });

    /* ------------------------------------------------------------------
       Products
    ------------------------------------------------------------------ */
    function generateRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';

        for (let i = 0; i < fullStars; i++) starsHTML += '<i class="fas fa-star"></i>';
        if (hasHalfStar) starsHTML += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < 5 - Math.ceil(rating); i++) starsHTML += '<i class="far fa-star"></i>';

        return starsHTML;
    }

    function renderProducts() {
        const query = searchQuery.trim().toLowerCase();
        const list = query ? products.filter(p => p.name.toLowerCase().includes(query)) : products;

        if (!list.length) {
            productsContainer.innerHTML = '<p class="no-results">No products match your search. Try a different keyword.</p>';
            return;
        }

        productsContainer.innerHTML = list.map(product => {
            const liked = wishlist.has(product.id);
            return `
                <div class="product-card">
                    <span class="new-badge">${product.badge}</span>
                    <button class="wishlist-btn${liked ? ' active' : ''}" data-product-id="${product.id}" aria-label="Toggle wishlist">
                        <i class="${liked ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <div class="product-image">
                        <i class="${product.icon}"></i>
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="price">
                            <span class="current-price">$${product.price}</span>
                            <span class="old-price">$${product.oldPrice}</span>
                        </div>
                        <div class="rating">
                            ${generateRatingStars(product.rating)}
                            <span>(${product.rating})</span>
                        </div>
                        <div class="product-actions">
                            <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Add to Cart</button>
                            <a href="#" class="btn btn-outline view-product" data-product-id="${product.id}">View</a>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }

    // One delegated listener handles add-to-cart, view and wishlist
    productsContainer.addEventListener('click', function (e) {
        const button = e.target.closest('.add-to-cart, .view-product, .wishlist-btn');
        if (!button) return;
        e.preventDefault();

        const product = products.find(p => p.id === Number(button.dataset.productId));
        if (!product) return;

        if (button.classList.contains('add-to-cart')) {
            cart.set(product.id, (cart.get(product.id) || 0) + 1);
            saveCart();
            updateBadge(cartCountEl, cartTotalItems());
            showNotification(`Added "${product.name}" to cart!`);
        } else if (button.classList.contains('view-product')) {
            window.location.href = PRODUCT_PAGE + product.id;
        } else {
            const icon = button.querySelector('i');
            if (wishlist.has(product.id)) {
                wishlist.delete(product.id);
                button.classList.remove('active');
                icon.classList.replace('fas', 'far');
                showNotification(`Removed "${product.name}" from wishlist`);
            } else {
                wishlist.add(product.id);
                button.classList.add('active');
                icon.classList.replace('far', 'fas');
                showNotification(`Added "${product.name}" to wishlist!`);
            }
            updateBadge(wishlistCountEl, wishlist.size);
        }
    });

    /* ------------------------------------------------------------------
       Search
    ------------------------------------------------------------------ */
    searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        searchQuery = searchInput.value;
        renderProducts();
        scrollToSection('#new-arrivals');
    });

    // Clearing the field restores the full product list
    searchInput.addEventListener('input', function () {
        if (!this.value.trim() && searchQuery) {
            searchQuery = '';
            renderProducts();
        }
    });

    /* ------------------------------------------------------------------
       Contact form
    ------------------------------------------------------------------ */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const name = this.elements['name'].value.trim();
            const email = this.elements['email'].value.trim();
            const message = this.elements['message'].value.trim();

            if (name && email && message) {
                showNotification(`Thank you ${name}! Your message has been sent.`);
                this.reset();
            } else {
                showNotification('Please fill in all fields.');
            }
        });
    }

    /* ------------------------------------------------------------------
       Hero: gentle 3D tilt (desktop pointer only)
    ------------------------------------------------------------------ */
    const hero = document.querySelector('.hero');
    const heroStage = document.querySelector('.hero-stage');
    const heroGlow = document.querySelector('.hero-glow');
    const canTilt = window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches;

    if (hero && canTilt) {
        hero.addEventListener('mousemove', function (e) {
            const rect = hero.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            heroStage.style.setProperty('--ry', `${-14 + x * 10}deg`);
            heroStage.style.setProperty('--rx', `${8 - y * 8}deg`);
            heroGlow.style.transform = `translate(${x * 24}px, calc(-45% + ${y * 24}px))`;
        });

        hero.addEventListener('mouseleave', function () {
            heroStage.style.removeProperty('--ry');
            heroStage.style.removeProperty('--rx');
            heroGlow.style.transform = '';
        });
    }

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderProducts();
    if (cartTotalItems() > 0) updateBadge(cartCountEl, cartTotalItems());
});
