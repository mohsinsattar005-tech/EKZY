// OZVIO - Orders Page JavaScript
// Frontend demo only. No backend, no real order storage.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const cartCountEl = document.getElementById('cartCount');
    const wishlistCountEl = document.getElementById('wishlistCount');
    const toastEl = document.getElementById('toast');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const sidebarLogout = document.getElementById('sidebarLogout');

    /* ------------------------------------------------------------------
       Demo order data (matches checkout product structure)
    ------------------------------------------------------------------ */
    const demoOrders = [
        {
            orderNumber: 'OSV-100247',
            date: 'Nov 18, 2026',
            items: 2,
            total: 798.00,
            status: 'delivered',
            products: [
                { name: 'Wireless Headphones Elite', qty: 1, price: 199 },
                { name: 'Smart Watch Series 5', qty: 1, price: 399 },
                { name: 'Premium Smartphone X', qty: 1, price: 599 },
                { name: 'Ultra Laptop Pro', qty: 1, price: 1299 },
            ]
        },
        {
            orderNumber: 'OSV-100231',
            date: 'Nov 10, 2026',
            items: 1,
            total: 499.00,
            status: 'shipped',
            products: [
                { name: 'Gaming Console Ultimate', qty: 1, price: 499 },
            ]
        },
        {
            orderNumber: 'OSV-100218',
            date: 'Oct 28, 2026',
            items: 3,
            total: 1497.00,
            status: 'processing',
            products: [
                { name: '4K Smart TV 55 inch', qty: 1, price: 899 },
                { name: 'Wireless Headphones Elite', qty: 2, price: 199 },
            ]
        },
        {
            orderNumber: 'OSV-100205',
            date: 'Oct 15, 2026',
            items: 1,
            total: 399.00,
            status: 'cancelled',
            products: [
                { name: 'Smart Watch Series 5', qty: 1, price: 399 },
            ]
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
       Render orders table
    ------------------------------------------------------------------ */
    function renderOrders() {
        ordersTableBody.innerHTML = demoOrders.map(order => {
            const statusClass = 'status-badge ' + order.status;
            return `
                <tr>
                    <td>
                        <div style="font-weight: 600; font-family: monospace; font-size: 0.85rem;">${order.orderNumber}</div>
                    </td>
                    <td>${order.date}</td>
                    <td>${order.items} item${order.items > 1 ? 's' : ''}</td>
                    <td>$${order.total.toLocaleString()}</td>
                    <td><span class="status-badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td>
                        <button class="btn-action" data-order="${order.orderNumber}" title="View details">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');

        // Order detail click
        ordersTableBody.querySelectorAll('.btn-action').forEach(btn => {
            btn.addEventListener('click', function () {
                const orderNumber = this.dataset.order;
                const order = demoOrders.find(o => o.orderNumber === orderNumber);
                if (!order) return;

                const itemsHtml = order.products.map(p => `
                    <div class="order-card-item">
                        <div class="order-card-item-thumb"><i class="fas fa-box"></i></div>
                        <div class="order-card-item-info">
                            <h4>${p.name}</h4>
                            <p>Qty: ${p.qty}</p>
                        </div>
                        <div class="order-card-item-price">$${p.price}</div>
                    </div>
                `).join('');

                const detailModal = document.createElement('div');
                detailModal.style.cssText = `
                    position: fixed; inset: 0; z-index: 2000;
                    background: rgba(0,0,0,0.7);
                    backdrop-filter: blur(8px);
                    display: flex; align-items: center; justify-content: center;
                    padding: 24px;
                `;
                detailModal.innerHTML = `
                    <div style="background: var(--surface-2); border: 1px solid var(--line); border-radius: var(--radius); box-shadow: var(--shadow-lift); width: 100%; max-width: 560px; max-height: 80vh; overflow-y: auto; padding: 28px;">
                        <div class="order-card-header" style="border-bottom: 0; padding-bottom: 0; margin-bottom: 20px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <h3 style="margin: 0;">Order Details</h3>
                                <span class="order-number">${order.orderNumber}</span>
                            </div>
                        </div>
                        <div class="order-card-body">
                            ${itemsHtml}
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700; color: var(--text); padding-top: 16px; border-top: 1px solid var(--line);">
                            <span>Order Total</span>
                            <span>$${order.total.toLocaleString()}</span>
                        </div>
                        <div style="margin-top: 20px; text-align: right;">
                            <button class="btn btn-outline" id="closeOrderDetail">Close</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(detailModal);

                detailModal.querySelector('#closeOrderDetail').addEventListener('click', () => {
                    detailModal.remove();
                });
                detailModal.addEventListener('click', (e) => {
                    if (e.target === detailModal) detailModal.remove();
                });
            });
        });
    }

    /* ------------------------------------------------------------------
       Logout (demo only)
    ------------------------------------------------------------------ */
    sidebarLogout.addEventListener('click', function (e) {
        e.preventDefault();
        showNotification('You have been logged out (demo).');
        setTimeout(function () {
            window.location.href = '../../index.html';
        }, 800);
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    document.getElementById('year').textContent = new Date().getFullYear();
    renderOrders();
});

