// OZVIO - Admin Orders JavaScript
// Frontend demo only. No backend, no database, no real order operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const ordersTableBody = document.getElementById('adminOrdersTableBody');
    const addOrderModal = document.getElementById('addOrderModal');
    const closeAddOrderModal = document.getElementById('closeAddOrderModal');
    const cancelAddOrder = document.getElementById('cancelAddOrder');
    const addOrderForm = document.getElementById('addOrderForm');
    const toastEl = document.getElementById('toast');

    /* ------------------------------------------------------------------
       Demo order data (matches customer checkout structure)
    ------------------------------------------------------------------ */
    const demoOrders = [
        { orderNumber: 'OSV-100247', customer: 'Sarah Johnson', email: 'sarah@example.com', date: 'Nov 18, 2026', items: 2, total: 598.00, payment: 'paid', status: 'delivered' },
        { orderNumber: 'OSV-100246', customer: 'Mike Chen', email: 'mike@example.com', date: 'Nov 17, 2026', items: 1, total: 1299.00, payment: 'paid', status: 'shipped' },
        { orderNumber: 'OSV-100245', customer: 'Priya Patel', email: 'priya@example.com', date: 'Nov 16, 2026', items: 1, total: 399.00, payment: 'pending', status: 'processing' },
        { orderNumber: 'OSV-100244', customer: 'David Wilson', email: 'david@example.com', date: 'Nov 15, 2026', items: 1, total: 899.00, payment: 'paid', status: 'confirmed' },
        { orderNumber: 'OSV-100243', customer: 'Emily Davis', email: 'emily@example.com', date: 'Nov 14, 2026', items: 1, total: 199.00, payment: 'pending', status: 'pending' },
        { orderNumber: 'OSV-100242', customer: 'Robert Brown', email: 'robert@example.com', date: 'Nov 13, 2026', items: 3, total: 1497.00, payment: 'paid', status: 'shipped' },
    ];

    const statusLabels = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
    };

    /* ------------------------------------------------------------------
       Render orders table
    ------------------------------------------------------------------ */
    function renderOrders() {
        ordersTableBody.innerHTML = demoOrders.map(o => `
            <tr>
                <td style="font-family:monospace;font-size:0.85rem;font-weight:600;">${o.orderNumber}</td>
                <td>${o.customer}</td>
                <td>${o.date}</td>
                <td>${o.items}</td>
                <td>$${o.total.toLocaleString()}</td>
                <td><span class="status-badge ${o.payment}">${o.payment.charAt(0).toUpperCase() + o.payment.slice(1)}</span></td>
                <td><span class="status-badge ${o.status}">${statusLabels[o.status]}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="viewOrder('${o.orderNumber}')" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editOrder('${o.orderNumber}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteOrder('${o.orderNumber}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /* ------------------------------------------------------------------
       Modal actions
    ------------------------------------------------------------------ */
    function showAddOrderModal() {
        addOrderModal.classList.add('show');
    }

    function hideAddOrderModal() {
        addOrderModal.classList.remove('show');
    }

    closeAddOrderModal.addEventListener('click', hideAddOrderModal);
    cancelAddOrder.addEventListener('click', hideAddOrderModal);
    addOrderModal.addEventListener('click', function (e) {
        if (e.target === addOrderModal) hideAddOrderModal();
    });

    addOrderForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.elements['customerName'].value.trim();
        if (!name) {
            showNotification('Customer name is required.', 'error');
            return;
        }
        hideAddOrderModal();
        showNotification(`Order for "${name}" created (demo UI only).`);
        this.reset();
    });

    /* ------------------------------------------------------------------
       Global actions (demo only)
    ------------------------------------------------------------------ */
    window.viewOrder = function (orderNumber) {
        showNotification(`View order ${orderNumber} - demo UI only.`);
    };

    window.editOrder = function (orderNumber) {
        showNotification(`Edit order ${orderNumber} - demo UI only.`);
    };

    window.deleteOrder = function (orderNumber) {
        if (confirm(`Delete order ${orderNumber}? This is a frontend demo - no database record will be removed.`)) {
            showNotification(`Order ${orderNumber} deleted (demo UI only).`);
        }
    };

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
       Init
    ------------------------------------------------------------------ */
    renderOrders();
});

