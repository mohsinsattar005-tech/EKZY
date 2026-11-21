// OZVIO - Forgot Password Page JavaScript
// Frontend demo only. No real authentication, no backend, no password reset emails sent.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const forgotForm = document.getElementById('forgotForm');
    const emailInput = document.getElementById('forgotEmail');
    const emailError = document.getElementById('forgotEmailError');

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
       Form validation
    ------------------------------------------------------------------ */
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function clearError() {
        emailInput.parentElement.classList.remove('error');
        emailError.style.display = 'none';
    }

    function showError(msg) {
        emailInput.parentElement.classList.add('error');
        emailError.textContent = msg;
        emailError.style.display = 'block';
    }

    emailInput.addEventListener('blur', function () {
        if (this.value.trim() && !validateEmail(this.value)) {
            showError('Please enter a valid email address.');
        } else {
            clearError();
        }
    });

    emailInput.addEventListener('input', function () {
        if (this.parentElement.classList.contains('error') && this.value.trim() && validateEmail(this.value)) {
            clearError();
        }
    });

    /* ------------------------------------------------------------------
       Forgot password submit (demo only)
    ------------------------------------------------------------------ */
    forgotForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();

        if (!email || !validateEmail(email)) {
            showError('Please enter a valid email address.');
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        clearError();

        // Demo: pretend reset link sent
        showNotification('If an account exists for this email, a password reset link has been sent (demo).');
        forgotForm.reset();

        // Redirect to login after a short delay
        setTimeout(function () {
            window.location.href = '../login/login.html';
        }, 2000);
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
});

