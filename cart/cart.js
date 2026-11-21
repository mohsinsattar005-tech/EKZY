// Ozvio - Cart page
document.addEventListener('DOMContentLoaded', () => {

    /* ------------------------------------------------------------------
       Config
    ------------------------------------------------------------------ */
    const CART_KEY = 'gz_cart';        // { "<productId>": qty }  (shared with home page)
    const SAVED_KEY = 'gz_saved';      // [productId, ...]
    const PRODUCT_PAGE = '../product.html?id='; // change if your product page lives elsewhere
    const COUPONS = { GLOBAL10: 0.10 };

    // Same catalog as the home page "New Arrivals"
    const products = [
        { id: 1, name: 'Premium Smartphone X',      price: 599,  oldPrice: 699,  rating: 4.5, icon: 'fas fa-mobile-alt', badge: 'New' },
        { id: 2, name: 'Ultra Laptop Pro',          price: 1299, oldPrice: 1499, rating: 5.0, icon: 'fas fa-laptop',     badge: 'New' },
        { id: 3, name: 'Wireless Headphones Elite', price: 199,  oldPrice: 249,  rating: 4.8, icon: 'fas fa-headphones', badge: 'New' },
        { id: 4, name: 'Smart Watch Series 5',      price: 399,  oldPrice: 499,  rating: 4.6, icon: 'fas fa-clock',      badge: 'New' },
        { id: 5, name: 'Gaming Console Ultimate',   price: 499,  oldPrice: 599,  rating: 4.9, icon: 'fas fa-gamepad',    badge: 'New' },
        { id: 6, name: '4K Smart TV 55 inch',       price: 899,  oldPrice: 1099, rating: 4.7, icon: 'fas fa-tv',         badge: 'New' }
    ];
    const byId = id => products.find(p => p.id === Number(id));

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const $ = id => document.getElementById(id);
    const cartItemsEl = $('cartItems'), savedBlock = $('savedBlock'), savedItemsEl = $('savedItems'), savedCountEl = $('savedCount');
    const cartLayout = $('cartLayout'), emptyState = $('emptyState'), cartTitle = $('cartTitle');
    const suggestGrid = $('suggestGrid'), cartCountEl = $('cartCount'), toastEl = $('toast');
    const couponForm = $('couponForm'), couponInput = $('couponInput'), couponMsg = $('couponMsg');

    /* ------------------------------------------------------------------
       Storage
    ------------------------------------------------------------------ */
    function read(key, fallback) {
        try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
        catch (e) { return fallback; }
    }
    function write(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage blocked */ }
    }

    let cart = read(CART_KEY, {});
    let saved = read(SAVED_KEY, []);
    let coupon = null; // { code, rate }

    // Drop anything that is not a known product
    Object.keys(cart).forEach(id => { if (!byId(id) || !(cart[id] > 0)) delete cart[id]; });
    saved = saved.filter(id => byId(id) && !cart[id]);

    const persist = () => { write(CART_KEY, cart); write(SAVED_KEY, saved); };
    const money = n => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

    /* ------------------------------------------------------------------
       Toast
    ------------------------------------------------------------------ */
    let toastTimer;
    function toast(message) {
        toastEl.textContent = '';
        const i = document.createElement('i');
        i.className = 'fas fa-check-circle';
        toastEl.append(i, document.createTextNode(message));
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2800);
    }

    /* ------------------------------------------------------------------
       Render
    ------------------------------------------------------------------ */
    function stars(rating) {
        let html = '';
        for (let i = 0; i < Math.floor(rating); i++) html += '<i class="fas fa-star"></i>';
        if (rating % 1 !== 0) html += '<i class="fas fa-star-half-alt"></i>';
        for (let i = 0; i < 5 - Math.ceil(rating); i++) html += '<i class="far fa-star"></i>';
        return html;
    }

    function cartItemHTML(p, qty) {
        const options = Array.from({ length: 10 }, (_, i) =>
            `<option value="${i + 1}"${i + 1 === qty ? ' selected' : ''}>${i + 1}</option>`).join('');
        const lineTotal = p.price * qty;
        const lineSave = (p.oldPrice - p.price) * qty;
        return `
            <article class="zc-item" data-id="${p.id}">
                <a href="${PRODUCT_PAGE}${p.id}" class="zc-thumb" aria-label="View ${p.name}"><i class="${p.icon}"></i></a>
                <div class="zc-item-info">
                    <h3><a href="${PRODUCT_PAGE}${p.id}">${p.name}</a></h3>
                    <p class="zc-item-meta">${money(p.price)} each</p>
                    <div class="zc-controls">
                        <select class="zc-qty" data-action="qty" aria-label="Quantity for ${p.name}">${options}</select>
                        <button type="button" class="zc-link-btn" data-action="save">Save for later</button>
                        <button type="button" class="zc-link-btn zc-remove" data-action="remove">Remove</button>
                    </div>
                    <details class="zc-note">
                        <summary>Add a note to Ozvio Store</summary>
                        <textarea placeholder="Gift message or delivery instructions" aria-label="Note for ${p.name}"></textarea>
                    </details>
                </div>
                <div class="zc-price">
                    <strong>${money(lineTotal)}</strong>
                    ${lineSave > 0 ? `<span class="zc-was">${money(p.oldPrice * qty)}</span><span class="zc-save">You save ${money(lineSave)}</span>` : ''}
                </div>
            </article>`;
    }

    function savedItemHTML(p) {
        return `
            <div class="zc-saved-item" data-id="${p.id}">
                <a href="${PRODUCT_PAGE}${p.id}" class="zc-thumb" aria-label="View ${p.name}"><i class="${p.icon}"></i></a>
                <div class="zc-item-info">
                    <h3><a href="${PRODUCT_PAGE}${p.id}">${p.name}</a></h3>
                    <p>${money(p.price)}</p>
                </div>
                <button type="button" class="zc-btn zc-btn-outline" data-action="move">Move to cart</button>
                <button type="button" class="zc-link-btn zc-remove" data-action="drop">Remove</button>
            </div>`;
    }

    function productCardHTML(p) {
        return `
            <article class="zc-card">
                <span class="zc-card-badge">${p.badge}</span>
                <a href="${PRODUCT_PAGE}${p.id}" class="zc-card-img" aria-label="View ${p.name}"><i class="${p.icon}"></i></a>
                <div class="zc-card-body">
                    <h3>${p.name}</h3>
                    <div class="zc-card-price"><strong>${money(p.price)}</strong><s>${money(p.oldPrice)}</s></div>
                    <div class="zc-stars">${stars(p.rating)}<span>(${p.rating})</span></div>
                    <div class="zc-card-actions">
                        <button type="button" class="zc-btn zc-btn-gold" data-action="add" data-id="${p.id}">Add to cart</button>
                        <a href="${PRODUCT_PAGE}${p.id}" class="zc-btn zc-btn-outline">View</a>
                    </div>
                </div>
            </article>`;
    }

    function render() {
        const ids = Object.keys(cart);
        const totalQty = ids.reduce((sum, id) => sum + cart[id], 0);
        const itemsTotal = ids.reduce((sum, id) => sum + byId(id).price * cart[id], 0);
        const discount = coupon ? Math.round(itemsTotal * coupon.rate * 100) / 100 : 0;

        // Header badge
        cartCountEl.textContent = totalQty;
        cartCountEl.hidden = totalQty === 0;

        const isEmpty = ids.length === 0;
        cartLayout.hidden = isEmpty;
        emptyState.hidden = !isEmpty;
        cartTitle.textContent = isEmpty ? 'Your cart' : `${totalQty} item${totalQty > 1 ? 's' : ''} in your cart`;

        cartItemsEl.innerHTML = ids.map(id => cartItemHTML(byId(id), cart[id])).join('');

        // Saved for later (also shown when the cart itself is empty)
        savedBlock.hidden = saved.length === 0;
        savedCountEl.textContent = saved.length ? `(${saved.length})` : '';
        savedItemsEl.innerHTML = saved.map(id => savedItemHTML(byId(id))).join('');
        if (isEmpty && saved.length) cartLayout.hidden = false;
        if (isEmpty && saved.length) {
            // Show saved list without an empty summary
            cartItemsEl.closest('.zc-shop-card').hidden = true;
            document.querySelector('.zc-summary').hidden = true;
        } else {
            cartItemsEl.closest('.zc-shop-card').hidden = false;
            document.querySelector('.zc-summary').hidden = false;
        }

        // Summary
        $('itemsTotal').textContent = money(itemsTotal);
        $('discountRow').hidden = !discount;
        $('discountAmt').textContent = '-' + money(discount);
        $('totalQty').textContent = totalQty;
        $('grandTotal').textContent = money(itemsTotal - discount);

        // Suggestions: products not in the cart (fall back to all if everything is in the cart)
        let pool = products.filter(p => !cart[p.id]);
        if (!pool.length) pool = products;
        suggestGrid.innerHTML = pool.slice(0, 4).map(productCardHTML).join('');
    }

    /* ------------------------------------------------------------------
       Actions
    ------------------------------------------------------------------ */
    function change(fn) { fn(); persist(); render(); }

    cartItemsEl.addEventListener('change', e => {
        if (e.target.dataset.action !== 'qty') return;
        const id = e.target.closest('.zc-item').dataset.id;
        change(() => { cart[id] = Number(e.target.value); });
    });

    cartItemsEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn || btn.tagName === 'SELECT') return;
        const id = btn.closest('.zc-item').dataset.id;
        const p = byId(id);
        if (btn.dataset.action === 'remove') {
            change(() => { delete cart[id]; });
            toast(`Removed "${p.name}" from your cart`);
        } else if (btn.dataset.action === 'save') {
            change(() => { delete cart[id]; saved.unshift(Number(id)); });
            toast(`Saved "${p.name}" for later`);
        }
    });

    savedItemsEl.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = Number(btn.closest('.zc-saved-item').dataset.id);
        const p = byId(id);
        if (btn.dataset.action === 'move') {
            change(() => { saved = saved.filter(x => x !== id); cart[id] = (cart[id] || 0) + 1; });
            toast(`Moved "${p.name}" to your cart`);
        } else if (btn.dataset.action === 'drop') {
            change(() => { saved = saved.filter(x => x !== id); });
            toast(`Removed "${p.name}"`);
        }
    });

    suggestGrid.addEventListener('click', e => {
        const btn = e.target.closest('[data-action="add"]');
        if (!btn) return;
        const id = Number(btn.dataset.id);
        change(() => { cart[id] = (cart[id] || 0) + 1; });
        toast(`Added "${byId(id).name}" to your cart`);
    });

    couponForm.addEventListener('submit', e => {
        e.preventDefault();
        const code = couponInput.value.trim().toUpperCase();
        if (!code) { couponMsg.className = 'zc-coupon-msg err'; couponMsg.textContent = 'Enter a coupon code.'; return; }
        if (COUPONS[code]) {
            coupon = { code, rate: COUPONS[code] };
            couponMsg.className = 'zc-coupon-msg ok';
            couponMsg.textContent = `${code} applied: ${COUPONS[code] * 100}% off your items.`;
            render();
        } else {
            coupon = null;
            couponMsg.className = 'zc-coupon-msg err';
            couponMsg.textContent = 'That code is not valid. Check it and try again.';
            render();
        }
    });

    $('checkoutBtn').addEventListener('click', () => {
        window.location.href = '../checkout/checkout.html';
    });

    // Keep tabs in sync (home page and cart page open at once)
    window.addEventListener('storage', e => {
        if (e.key === CART_KEY || e.key === SAVED_KEY) {
            cart = read(CART_KEY, {});
            saved = read(SAVED_KEY, []);
            render();
        }
    });

    $('year').textContent = new Date().getFullYear();
    render();
});
