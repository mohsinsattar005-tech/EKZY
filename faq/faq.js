// OZVIO - FAQ Page JavaScript
// Frontend demo only. No backend, no database.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');
    const faqAccordion = document.getElementById('faqAccordion');
    const faqSearch = document.getElementById('faqSearch');

    /* ------------------------------------------------------------------
       FAQ data
    ------------------------------------------------------------------ */
    const faqs = [
        {
            question: 'How can I place an order?',
            answer: 'Choose the products you want, add them to your cart, then open your cart and select "Proceed to checkout". Fill in your contact and shipping details, choose your payment method, and place the order. You will receive an order confirmation with your order number.'
        },
        {
            question: 'How can I contact customer support?',
            answer: 'You can reach us through the contact form on our homepage, or email hello@OZVIO.com. We aim to reply within 1–2 business days.'
        },
        {
            question: 'How can I track my order?',
            answer: 'Open the Track Order page in the footer and enter your order number and the email address used at checkout. Your current order status will be shown there.'
        },
        {
            question: 'What payment methods are available?',
            answer: 'Cash on delivery is available at checkout. Online card payments are being prepared and are not yet active, so no card is charged on this website today.'
        },
        {
            question: 'How can I manage my account?',
            answer: 'Create an account or sign in, then open My Account. From your dashboard you can update your profile, manage shipping addresses, review previous orders and manage your wishlist.'
        },
        {
            question: 'How can I contact the store regarding my purchase?',
            answer: 'Reply to your order confirmation email or send us a message with your order number through the contact form. Please include your order number so we can help you faster.'
        }
    ];

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
       Render FAQs
    ------------------------------------------------------------------ */
    function renderFaqs(filter = '') {
        const query = filter.trim().toLowerCase();
        const filtered = query ? faqs.filter(f =>
            f.question.toLowerCase().includes(query) ||
            f.answer.toLowerCase().includes(query)
        ) : faqs;

        faqAccordion.innerHTML = '';

        if (filtered.length === 0) {
            faqAccordion.innerHTML = `
                <div class="faq-empty">
                    <div class="faq-empty-icon"><i class="fas fa-search"></i></div>
                    <h3>No results found</h3>
                    <p>Try a different keyword or browse all questions above.</p>
                </div>
            `;
            return;
        }

        filtered.forEach((faq, index) => {
            const item = document.createElement('div');
            item.className = 'faq-item';
            item.innerHTML = `
                <div class="faq-question" role="button" tabindex="0" aria-expanded="false" aria-controls="faqAnswer${index}">
                    ${faq.question}
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer" id="faqAnswer${index}" hidden>
                    ${faq.answer}
                </div>
            `;
            faqAccordion.appendChild(item);

            const questionEl = item.querySelector('.faq-question');
            const answerEl = item.querySelector('.faq-answer');

            questionEl.addEventListener('click', function () {
                const isActive = item.classList.contains('active');

                // Close all other items
                faqAccordion.querySelectorAll('.faq-item').forEach(other => {
                    if (other !== item) {
                        other.classList.remove('active');
                        const otherAnswer = other.querySelector('.faq-answer');
                        if (otherAnswer) {
                            otherAnswer.hidden = true;
                            otherAnswer.style.maxHeight = '0';
                            otherAnswer.style.opacity = '0';
                        }
                    }
                });

                // Toggle current item
                item.classList.toggle('active');
                if (!isActive) {
                    answerEl.hidden = false;
                    // Force reflow for transition
                    void answerEl.offsetWidth;
                    answerEl.style.maxHeight = '500px';
                    answerEl.style.opacity = '1';
                    questionEl.setAttribute('aria-expanded', 'true');
                } else {
                    answerEl.style.maxHeight = '0';
                    answerEl.style.opacity = '0';
                    setTimeout(() => { answerEl.hidden = true; }, 350);
                    questionEl.setAttribute('aria-expanded', 'false');
                }
            });

            // Keyboard accessibility
            questionEl.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    questionEl.click();
                }
            });
        });
    }

    /* ------------------------------------------------------------------
       Search
    ------------------------------------------------------------------ */
    faqSearch.addEventListener('input', function () {
        renderFaqs(this.value);
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderFaqs();
});

