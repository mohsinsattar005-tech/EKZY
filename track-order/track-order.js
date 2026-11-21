// OZVIO - Track Order Page JavaScript
// Frontend demo only. No backend, no real tracking, no shipping provider.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const trackForm = document.getElementById('trackForm');
    const trackBtn = document.getElementById('trackBtn');
    const orderNumberInput = document.getElementById('trackOrderNumber');
    const emailInput = document.getElementById('trackEmail');
    const orderNumberError = document.getElementById('trackOrderError');
    const emailError = document.getElementById('trackEmailError');

    const trackResult = document.getElementById('trackResult');
    const trackNotFound = document.getElementById('trackNotFound');
    const trackDemo = document.getElementById('trackDemo');

    const resultOrderNumber = document.getElementById('resultOrderNumber');
    const resultOrderDate = document.getElementById('resultOrderDate');
    const resultConfirmedDate = document.getElementById('resultConfirmedDate');
    const resultProcessingDate = document.getElementById('resultProcessingDate');
    const resultShippedDate = document.getElementById('resultShippedDate');
    const resultDeliveredDate = document.getElementById('resultDeliveredDate');
    const resultStatus = document.getElementById('resultStatus');
    const resultPayment = document.getElementById('resultPayment');
    const resultTotal = document.getElementById('resultTotal');

    const stepConfirmed = document.getElementById('stepConfirmed');
    const stepProcessing = document.getElementById('stepProcessing');
    const stepShipped = document.getElementById('stepShipped');
    const stepDelivered = document.getElementById('stepDelivered');

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

    function wishlistTotalItems() {
        try {
            const stored = JSON.parse(localStorage.getItem('gz_wishlist')) || [];
            return Array.isArray(stored) ? stored.length : 0;
        } catch (e) {
            return 0;
        }
    }

    updateBadge(cartCountEl, cartTotalItems());
    updateBadge(wishlistCountEl, wishlistTotalItems());

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
       Validation
    ------------------------------------------------------------------ */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function clearError(input, errorEl) {
        input.parentElement.classList.remove('error');
        errorEl.style.display = 'none';
    }

    function showError(input, errorEl, msg) {
        input.parentElement.classList.add('error');
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }

    orderNumberInput.addEventListener('blur', function () {
        if (!this.value.trim()) {
            showError(this, orderNumberError, 'Please enter your order number.');
        } else {
            clearError(this, orderNumberError);
        }
    });

    orderNumberInput.addEventListener('input', function () {
        if (this.parentElement.classList.contains('error') && this.value.trim()) {
            clearError(this, orderNumberError);
        }
    });

    emailInput.addEventListener('blur', function () {
        if (this.value.trim() && !validateEmail(this.value)) {
            showError(this, emailError, 'Please enter a valid email address.');
        } else {
            clearError(this, emailError);
        }
    });

    emailInput.addEventListener('input', function () {
        if (this.parentElement.classList.contains('error') && this.value.trim() && validateEmail(this.value)) {
            clearError(this, emailError);
        }
    });

    /* ------------------------------------------------------------------
       Track submit (demo only)
    ------------------------------------------------------------------ */
    trackForm.addEventListener('submit', function (e) {
        e.preventDefault();

        let valid = true;
        const orderNum = orderNumberInput.value.trim();
        const email = emailInput.value.trim();

        if (!orderNum) {
            showError(orderNumberInput, orderNumberError, 'Please enter your order number.');
            valid = false;
        } else {
            clearError(orderNumberInput, orderNumberError);
        }

        if (!email || !validateEmail(email)) {
            showError(emailInput, emailError, 'Please enter a valid email address.');
            valid = false;
        } else {
            clearError(emailInput, emailError);
        }

        if (!valid) {
            showNotification('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Demo: show tracking result for any OSV- order number
        trackResult.hidden = true;
        trackNotFound.hidden = true;
        trackDemo.hidden = true;

        if (orderNum.toUpperCase().startsWith('OSV-')) {
            showDemoTracking(orderNum);
        } else {
            trackNotFound.hidden = false;
            showNotification('Order not found. Try an order number starting with "OSV-" for a demo result.', 'error');
        }
    });

    function showDemoTracking(orderNumber) {
        const now = new Date();
        const orderDate = now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const confirmedDate = new Date(now.getTime() + 86400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const processingDate = new Date(now.getTime() + 172800000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const shippedDate = new Date(now.getTime() + 259200000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        const deliveredDate = new Date(now.getTime() + 1814400000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

        resultOrderNumber.textContent = orderNumber.toUpperCase();
        resultOrderDate.textContent = orderDate;
        resultConfirmedDate.textContent = confirmedDate;
        resultProcessingDate.textContent = processingDate;
        resultShippedDate.textContent = shippedDate;
        resultDeliveredDate.textContent = deliveredDate;
        resultStatus.textContent = 'Processing';
        resultPayment.textContent = 'Pending';
        resultTotal.textContent = '$598.00';

        // Set timeline steps (all shown as completed for demo)
        stepConfirmed.classList.add('completed');
        stepProcessing.classList.add('completed');
        stepShipped.classList.add('completed');
        stepDelivered.classList.add('completed');

        trackResult.hidden = false;
        showNotification('Order found (demo).', 'success');
        window.scrollTo({ top: trackResult.offsetTop - 100, behavior: 'smooth' });
    }

    window.resetTrackForm = function () {
        trackForm.reset();
        trackResult.hidden = true;
        trackNotFound.hidden = true;
        trackDemo.hidden = true;
        // Reset step markers
        [stepConfirmed, stepProcessing, stepShipped, stepDelivered].forEach(step => {
            step.classList.remove('completed');
        });
        orderNumberInput.parentElement.classList.remove('error');
        orderNumberError.style.display = 'none';
        emailInput.parentElement.classList.remove('error');
        emailError.style.display = 'none';
    };

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
});

