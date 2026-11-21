// OZVIO - Checkout Page JavaScript
// Frontend demo only. No backend, no real payment, no database operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const checkoutForm = document.getElementById('checkoutForm');
    const continueToPaymentBtn = document.getElementById('continueToPayment');
    const placeOrderBtn = document.getElementById('placeOrderBtn');

    const summaryItemsEl = document.getElementById('summaryItems');
    const summarySubtotalEl = document.getElementById('summarySubtotal');
    const summaryShippingEl = document.getElementById('summaryShipping');
    const summaryTotalEl = document.getElementBy('summaryTotal');

    const orderConfirmation = document.getElementById('orderConfirmation');
    const confirmOrderNumberEl = document.getElementById('confirmOrderNumber');
    const confirmOrderDateEl = document.getElementById('confirmOrderDate');
    const confirmPaymentMethodEl = document.getElementById('confirmPaymentMethod');
    const confirmItemsEl = document.getElementById('confirmItems');
    const confirmTotalEl = document.getElementById('confirmTotal');

    const continueShoppingBtn = document.getElementById('continueShopping');
    const trackMyOrderBtn = document.getElementById('trackMyOrder');

    /* ------------------------------------------------------------------
       Shared product catalog (matches homepage new arrivals)
       Fields kept compatible with admin product structure for future Supabase integration.
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
       Cart state (shared with home page and cart page via localStorage)
    ------------------------------------------------------------------ */
    const CART_KEY = 'gz_cart';
    let cart = {}; // { productId: quantity }

    function readCart() {
        try {
            const stored = JSON.parse(localStorage.getItem(CART_KEY)) || {};
            return stored;
        } catch (e) {
            return {};
        }
    }

    cart = readCart();

    // Remove invalid entries
    Object.keys(cart).forEach(id => {
        if (!productById[id] || !(cart[id] > 0)) {
            delete cart[id];
        }
    });

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
        return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
    }

    updateBadge(cartCountEl, cartTotalItems());

    /* ------------------------------------------------------------------
       Money formatting
    ------------------------------------------------------------------ */
    function money(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    /* ------------------------------------------------------------------
       Render order summary
    ------------------------------------------------------------------ */
    function renderSummary() {
        const ids = Object.keys(cart);
        const subtotal = ids.reduce((sum, id) => sum + productById[id].price * cart[id], 0);
        const shipping = 0; // Free shipping (matches cart page)
        const total = subtotal + shipping;

        summaryItemsEl.innerHTML = '';

        if (ids.length === 0) {
            summaryItemsEl.innerHTML = '<p style="color: var(--muted); font-size: 0.88rem; text-align: center; padding: 20px;">Your cart is empty.</p>';
        }

        ids.forEach(id => {
            const p = productById[id];
            const qty = cart[id];
            const lineTotal = p.price * qty;

            const itemEl = document.createElement('div');
            itemEl.className = 'summary-item';
            itemEl.innerHTML = `
                <div class="summary-item-thumb">
                    <i class="${p.icon}"></i>
                </div>
                <div class="summary-item-info">
                    <h4>${p.name}</h4>
                    <div class="summary-item-variation">Qty: ${qty}</div>
                    <div class="summary-item-price">${money(lineTotal)}</div>
                </div>
            `;
            summaryItemsEl.appendChild(itemEl);
        });

        summarySubtotalEl.textContent = money(subtotal);
        summaryShippingEl.textContent = shipping === 0 ? 'Free' : money(shipping);
        summaryTotalEl.textContent = money(total);

        updateBadge(cartCountEl, cartTotalItems());
    }

    /* ------------------------------------------------------------------
       Form validation
    ------------------------------------------------------------------ */
    const fields = [
        { id: 'firstName', errorId: 'firstNameError', msg: 'Please enter your first name.' },
        { id: 'lastName', errorId: 'lastNameError', msg: 'Please enter your last name.' },
        { id: 'email', errorId: 'emailError', msg: 'Please enter a valid email address.' },
        { id: 'phone', errorId: 'phoneError', msg: 'Please enter a valid phone number.' },
        { id: 'country', errorId: 'countryError', msg: 'Please select a country.' },
        { id: 'city', errorId: 'cityError', msg: 'Please enter your city.' },
        { id: 'address', errorId: 'addressError', msg: 'Please enter your street address.' },
        { id: 'state', errorId: 'stateError', msg: 'Please enter your state or province.' },
        { id: 'postalCode', errorId: 'postalCodeError', msg: 'Please enter your postal code.' },
    ];

    function clearError(fieldId) {
        const group = document.getElementById(fieldId).closest('.form-group');
        const error = document.getElementById(fieldId + 'Error');
        group.classList.remove('error');
        if (error) error.style.display = 'none';
    }

    function showError(fieldId) {
        const group = document.getElementById(fieldId).closest('.form-group');
        const error = document.getElementById(fieldId + 'Error');
        group.classList.add('error');
        if (error) error.style.display = 'block';
    }

    function validateField(fieldId) {
        const input = document.getElementById(fieldId);
        const value = input.value.trim();
        let valid = true;

        if (!value) {
            valid = false;
        } else if (fieldId === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) valid = false;
        } else if (fieldId === 'phone') {
            const phoneRegex = /^[\d\s\+\-\(\)]{7,}$/;
            if (!phoneRegex.test(value)) valid = false;
        } else if (fieldId === 'country') {
            if (!value) valid = false;
        }

        if (valid) clearError(fieldId);
        else showError(fieldId);
        return valid;
    }

    fields.forEach(f => {
        const input = document.getElementById(f.id);
        input.addEventListener('blur', () => validateField(f.id));
        input.addEventListener('input', () => {
            if (document.getElementById(f.id).closest('.form-group').classList.contains('error')) {
                validateField(f.id);
            }
        });
    });

    function validateAll() {
        let allValid = true;
        fields.forEach(f => {
            if (!validateField(f.id)) allValid = false;
        });
        return allValid;
    }

    /* ------------------------------------------------------------------
       Form submit: continue to payment (step 2 -> 3 visual)
    ------------------------------------------------------------------ */
    checkoutForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateAll()) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }
        showNotification('Shipping details saved. Proceed to payment.');
        // In a multi-step demo, we'd mark step 2 complete and show payment options.
        // Here payment options are already visible on the same page.
    });

    /* ------------------------------------------------------------------
       Place Order (demo only - no backend, no real payment)
    ------------------------------------------------------------------ */
    placeOrderBtn.addEventListener('click', function () {
        if (!validateAll()) {
            showNotification('Please complete all required fields before placing your order.', 'error');
            return;
        }

        const ids = Object.keys(cart);
        if (ids.length === 0) {
            showNotification('Your cart is empty. Add items before placing an order.', 'error');
            return;
        }

        const subtotal = ids.reduce((sum, id) => sum + productById[id].price * cart[id], 0);
        const total = subtotal;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value === 'cod' ? 'Cash on Delivery' : 'Credit / Debit Card';
        const orderNumber = 'OSV-' + String(Math.floor(100000 + Math.random() * 900000));
        const now = new Date();
        const orderDate = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

        // Populate confirmation screen
        confirmOrderNumberEl.textContent = orderNumber;
        confirmOrderDateEl.textContent = orderDate;
        confirmPaymentMethodEl.textContent = paymentMethod;
        confirmItemsEl.textContent = cartTotalItems() + ' item' + (cartTotalItems() > 1 ? 's' : '');
        confirmTotalEl.textContent = money(total);

        // Hide checkout form, show confirmation
        document.getElementById('checkout').hidden = true;
        orderConfirmation.hidden = false;

        showNotification('Order placed successfully (demo).');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* ------------------------------------------------------------------
       Confirmation actions
    ------------------------------------------------------------------ */
    continueShoppingBtn.addEventListener('click', function () {
        orderConfirmation.hidden = true;
        document.getElementById('checkout').hidden = false;
        window.location.href = '../../index.html#new-arrivals';
    });

    trackMyOrderBtn.addEventListener('click', function () {
        window.location.href = '../track-order/track-order.html';
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderSummary();

    // Keep cart badge in sync if another tab updates the cart
    window.addEventListener('storage', function (e) {
        if (e.key === CART_KEY) {
            cart = readCart();
            renderSummary();
        }
    });
});

