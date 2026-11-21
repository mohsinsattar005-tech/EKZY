// OZVIO - Login Page JavaScript
// Frontend demo only. No real authentication, no backend, no password storage.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const loginForm = document.getElementById('loginForm');
    const toggleLoginPassword = document.getElementById('toggleLoginPassword');
    const loginPassword = document.getElementById('loginPassword');

    /* ------------------------------------------------------------------
       Badges (shared cart / wishlist state from localStorage)
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
       Password toggle
    ------------------------------------------------------------------ */
    toggleLoginPassword.addEventListener('click', function () {
        const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassword.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    /* ------------------------------------------------------------------
       Form validation
    ------------------------------------------------------------------ */
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const emailError = document.getElementById('loginEmailError');
    const passwordError = document.getElementById('loginPasswordError');

    function clearError(inputEl, errorEl) {
        inputEl.parentElement.classList.remove('error');
        errorEl.style.display = 'none';
    }

    function showError(inputEl, errorEl, msg) {
        inputEl.parentElement.classList.add('error');
        errorEl.textContent = msg;
        errorEl.style.display = 'block';
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    emailInput.addEventListener('blur', function () {
        if (this.value.trim() && !validateEmail(this.value)) {
            showError(this, emailError, 'Please enter a valid email address.');
        } else {
            clearError(this, emailError);
        }
    });

    emailInput.addEventListener('input', function () {
        if (this.parentElement.classList.contains('error')) {
            if (this.value.trim() && validateEmail(this.value)) clearError(this, emailError);
        }
    });

    passwordInput.addEventListener('blur', function () {
        if (!this.value.trim()) {
            showError(this, passwordError, 'Please enter your password.');
        } else {
            clearError(this, passwordError);
        }
    });

    passwordInput.addEventListener('input', function () {
        if (this.parentElement.classList.contains('error') && this.value.trim()) {
            clearError(this, passwordError);
        }
    });

    /* ------------------------------------------------------------------
       Login submit (demo only)
    ------------------------------------------------------------------ */
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        let valid = true;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !validateEmail(email)) {
            showError(emailInput, emailError, 'Please enter a valid email address.');
            valid = false;
        } else {
            clearError(emailInput, emailError);
        }

        if (!password) {
            showError(passwordInput, passwordError, 'Please enter your password.');
            valid = false;
        } else {
            clearError(passwordInput, passwordError);
        }

        if (!valid) {
            showNotification('Please fix the errors above.', 'error');
            return;
        }

        // Demo: pretend login succeeded
        showNotification('Welcome back! Sign-in successful (demo).');
        loginForm.reset();

        // Redirect to account dashboard after a short delay
        setTimeout(function () {
            window.location.href = '../profile/profile.html';
        }, 1200);
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
});

