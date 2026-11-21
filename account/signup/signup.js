// OZVIO - Sign Up Page JavaScript
// Frontend demo only. No real authentication, no backend, no user records created.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');

    const signupForm = document.getElementById('signupForm');
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const signupPassword = document.getElementById('signupPassword');
    const signupConfirmPassword = document.getElementById('signupConfirmPassword');

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
       Password toggles
    ------------------------------------------------------------------ */
    toggleSignupPassword.addEventListener('click', function () {
        const type = signupPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        signupPassword.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    toggleConfirmPassword.addEventListener('click', function () {
        const type = signupConfirmPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        signupConfirmPassword.setAttribute('type', type);
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });

    /* ------------------------------------------------------------------
       Form validation
    ------------------------------------------------------------------ */
    const fullNameInput = document.getElementById('signupFullName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    const termsCheckbox = document.getElementById('signupTerms');

    const fullNameError = document.getElementById('signupFullNameError');
    const emailError = document.getElementById('signupEmailError');
    const passwordError = document.getElementById('signupPasswordError');
    const confirmPasswordError = document.getElementById('signupConfirmPasswordError');

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

    // Real-time validation on blur
    [fullNameInput, emailInput, passwordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('blur', function () {
            validateField(this.id);
        });
        input.addEventListener('input', function () {
            if (this.parentElement.classList.contains('error')) {
                validateField(this.id);
            }
        });
    });

    termsCheckbox.addEventListener('change', function () {
        if (this.checked) {
            this.parentElement.classList.remove('error');
        }
    });

    function validateField(fieldId) {
        const input = document.getElementById(fieldId);
        let errorEl;
        let valid = true;
        let msg = '';

        switch (fieldId) {
            case 'signupFullName':
                errorEl = fullNameError;
                if (!input.value.trim()) { valid = false; msg = 'Please enter your full name.'; }
                break;
            case 'signupEmail':
                errorEl = emailError;
                if (!input.value.trim() || !validateEmail(input.value.trim())) { valid = false; msg = 'Please enter a valid email address.'; }
                break;
            case 'signupPassword':
                errorEl = passwordError;
                if (!input.value.trim()) { valid = false; msg = 'Please enter a password.'; }
                else if (input.value.trim().length < 8) { valid = false; msg = 'Password must be at least 8 characters.'; }
                break;
            case 'signupConfirmPassword':
                errorEl = confirmPasswordError;
                if (!input.value.trim()) { valid = false; msg = 'Please confirm your password.'; }
                else if (input.value.trim() !== passwordInput.value.trim()) { valid = false; msg = 'Passwords do not match.'; }
                break;
        }

        if (valid) clearError(input, errorEl);
        else showError(input, errorEl, msg);
        return valid;
    }

    /* ------------------------------------------------------------------
       Signup submit (demo only)
    ------------------------------------------------------------------ */
    signupForm.addEventListener('submit', function (e) {
        e.preventDefault();

        let valid = true;

        if (!validateField('signupFullName')) valid = false;
        if (!validateField('signupEmail')) valid = false;
        if (!validateField('signupPassword')) valid = false;
        if (!validateField('signupConfirmPassword')) valid = false;

        if (!termsCheckbox.checked) {
            termsCheckbox.parentElement.classList.add('error');
            showNotification('Please agree to the Terms of Service and Privacy Policy.', 'error');
            valid = false;
        } else {
            termsCheckbox.parentElement.classList.remove('error');
        }

        if (!valid) {
            showNotification('Please fix the errors above.', 'error');
            return;
        }

        // Demo: pretend account created successfully
        showNotification('Account created successfully! You are now signed in (demo).');
        signupForm.reset();

        // Redirect to account profile after a short delay
        setTimeout(function () {
            window.location.href = '../profile/profile.html';
        }, 1500);
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
});

