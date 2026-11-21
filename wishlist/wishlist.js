// OZVIO - Wishlist Page JavaScript
// Frontend demo only. No backend, no real wishlist storage.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');
    const wishlistGrid = document.getElementById('wishlistGrid');
    const wishlistEmpty = document.getElementById('wishlistEmpty');
    const wishlistView = document.getElementById('wishlistView');

    /* ------------------------------------------------------------------
       Shared product catalog (matches homepage new arrivals)
    ------------------------------------------------------------------ */
    const products = [
        { id: 1, name: 'Premium Smartphone X', price: 599, oldPrice: 699, icon: 'fas fa-mobile-alt' },
        { id: 2, name: 'Ultra Laptop Pro', price: 1299, oldPrice: 1499, icon: 'fas fa-laptop' },
        { id: 3, name: 'Wireless Headphones Elite', price: 199, oldPrice: 249, icon: 'fas fa-headphones' },
        { id: 4, name: 'Smart Watch Series 5', price: 399, oldPrice: 499, icon: 'fas fa-clock' },
        { id: 5, name: 'Gaming Console Ultimate', price: 499, oldPrice: 599, icon: 'fas fa-gamepad' },
        { id: 6, name: '4K Smart TV 55 inch', price: 899, oldPrice: 1099, icon: 'fas fa-tv' }
    ];

    const productById = {};
    products.forEach(p => { productById[p.id] = p; });

    /* ------------------------------------------------------------------
       Wishlist state (shared via localStorage)
    ------------------------------------------------------------------ */
    const WISHLIST_KEY = 'gz_wishlist';
    let wishlist = new Set();

    function readWishlist() {
        try {
            const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
            return new Set(Array.isArray(stored) ? stored.map(Number) : []);
        } catch (e) {
            return new Set();
        }
    }

    wishlist = readWishlist();

    function writeWishlist() {
        try {
            localStorage.setItem(WISHLIST_KEY, JSON.stringify(Array.from(wishlist)));
        } catch (e) { /* storage blocked */ }
    }

    /* ------------------------------------------------------------------
       Badges
    ------------------------------------------------------------------ */
    function updateBadge(el, count) {
        el.textContent = count;
        el.hidden = count === 0;
        el.classList.remove('bump');
        void el.offsetWidth;
        el.classList.add('bump');
    }

    function cartTotalItems() {
        try {
            const stored = JSON.parse(localStorage.getItem('gz_cart')) || {};
            return Object.values(stored).reduce((sum, qty) => sum + qty, 0);
        } catch (e) {
            return 0;
        }
    }

    updateBadge(cartCountEl, cartTotalItems());
    updateBadge(wishlistCountEl, wishlist.size);

    /* ------------------------------------------------------------------
       Toast notification
    ------------------------------------------------------------------ */
    let toastTimer;
    function showNotification(message, type = 'success') {
        toastEl.textContent = '';
        const icon = document.createElement('i');
        icon.className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';
        toastEl.appendChild(icon);
        toastEl.appendChild(document.createTextNode(message));
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    /* ------------------------------------------------------------------
       Money formatting
    ------------------------------------------------------------------ */
    function money(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    /* ------------------------------------------------------------------
       Render wishlist items
    ------------------------------------------------------------------ */
    function renderWishlist() {
        const ids = Array.from(wishlist);

        if (ids.length === 0) {
            wishlistView.hidden = true;
            wishlistEmpty.hidden = false;
            updateBadge(wishlistCountEl, 0);
            return;
        }

        wishlistView.hidden = false;
        wishlistEmpty.hidden = true;

        wishlistGrid.innerHTML = ids.map(id => {
            const p = productById[id];
            if (!p) return '';
            return `
                <div class="wishlist-item" data-id="${p.id}">
                    <div class="wishlist-item-thumb">
                        <i class="${p.icon}"></i>
                    </div>
                    <div class="wishlist-item-info">
                        <h3>${p.name}</h3>
                        <div class="wishlist-item-price">
                            <span class="current-price">${money(p.price)}</span>
                            ${p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : ''}
                        </div>
                        <div class="wishlist-item-actions">
                            <button class="btn btn-primary move-to-cart" data-id="${p.id}">Move to Cart</button>
                            <button class="btn btn-outline remove-from-wishlist" data-id="${p.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        updateBadge(wishlistCountEl, wishlist.size);
    }

    /* ------------------------------------------------------------------
       Actions: remove, move to cart
    ------------------------------------------------------------------ */
    const CART_KEY = 'gz_cart';

    function readCart() {
        try {
            const stored = JSON.parse(localStorage.getItem(CART_KEY)) || {};
            return stored;
        } catch (e) {
            return {};
        }
    }

    function writeCart(cart) {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch (e) { /* storage blocked */ }
    }

    wishlistGrid.addEventListener('click', function (e) {
        const removeBtn = e.target.closest('.remove-from-wishlist');
        const moveBtn = e.target.closest('.move-to-cart');

        if (removeBtn) {
            const id = Number(removeBtn.dataset.id);
            wishlist.delete(id);
            writeWishlist();
            removeBtn.closest('.wishlist-item').style.opacity = '0';
            removeBtn.closest('.wishlist-item').style.transform = 'translateX(-20px)';
            setTimeout(() => {
                renderWishlist();
                showNotification(`Removed "${productById[id].name}" from wishlist`);
            }, 250);
            return;
        }

        if (moveBtn) {
            const id = Number(moveBtn.dataset.id);
            const p = productById[id];

            const cart = readCart();
            cart[id] = (cart[id] || 0) + 1;
            writeCart(cart);

            wishlist.delete(id);
            writeWishlist();

            updateBadge(document.getElementById('cartCount'), Object.values(cart).reduce((s, q) => s + q, 0));
            renderWishlist();
            showNotification(`Added "${p.name}" to cart!`);
            return;
        }
    });

    /* ------------------------------------------------------------------
       Keep badges in sync across tabs
    ------------------------------------------------------------------ */
    window.addEventListener('storage', function (e) {
        if (e.key === WISHLIST_KEY || e.key === CART_KEY) {
            wishlist = readWishlist();
            updateBadge(wishlistCountEl, wishlist.size);
            updateBadge(cartCountEl, cartTotalItems());
            renderWishlist();
        }
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderWishlist();
});

