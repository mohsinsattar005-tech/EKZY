// OZVIO - Admin Customers JavaScript
// Frontend demo only. No backend, no database, no real customer operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const customersTableBody = document.getElementById('customersTableBody');
    const addCustomerModal = document.getElementById('addCustomerModal');
    const closeAddCustomerModal = document.getElementById('closeAddCustomerModal');
    const cancelAddCustomer = document.getElementById('cancelAddCustomer');
    const addCustomerForm = document.getElementById('addCustomerForm');
    const toastEl = document.getElementById('toast');

    /* ------------------------------------------------------------------
       Demo customer data
    ------------------------------------------------------------------ */
    const demoCustomers = [
        { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 (555) 123-4567', orders: 4, spent: 1247.00, status: 'active' },
        { name: 'Mike Chen', email: 'mike@example.com', phone: '+1 (555) 234-5678', orders: 2, spent: 1698.00, status: 'active' },
        { name: 'Priya Patel', email: 'priya@example.com', phone: '+1 (555) 345-6789', orders: 1, spent: 399.00, status: 'active' },
        { name: 'David Wilson', email: 'david@example.com', phone: '+1 (555) 456-7890', orders: 3, spent: 2198.00, status: 'active' },
        { name: 'Emily Davis', email: 'emily@example.com', phone: '+1 (555) 567-8901', orders: 1, spent: 199.00, status: 'pending' },
        { name: 'Robert Brown', email: 'robert@example.com', phone: '+1 (555) 678-9012', orders: 5, spent: 3450.00, status: 'active' },
    ];

    /* ------------------------------------------------------------------
       Render customers table
    ------------------------------------------------------------------ */
    function renderCustomers() {
        customersTableBody.innerHTML = demoCustomers.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.phone}</td>
                <td>${c.orders}</td>
                <td>$${c.spent.toLocaleString()}</td>
                <td><span class="status-badge ${c.status}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="viewCustomer('${c.name}')" title="View"><i class="fas fa-eye"></i></button>
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editCustomer('${c.name}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteCustomer('${c.name}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /* ------------------------------------------------------------------
       Modal actions
    ------------------------------------------------------------------ */
    function showAddCustomerModal() {
        addCustomerModal.classList.add('show');
    }

    function hideAddCustomerModal() {
        addCustomerModal.classList.remove('show');
    }

    closeAddCustomerModal.addEventListener('click', hideAddCustomerModal);
    cancelAddCustomer.addEventListener('click', hideAddCustomerModal);
    addCustomerModal.addEventListener('click', function (e) {
        if (e.target === addCustomerModal) hideAddCustomerModal();
    });

    addCustomerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.elements['name'].value.trim();
        if (!name) {
            showNotification('Customer name is required.', 'error');
            return;
        }
        hideAddCustomerModal();
        showNotification(`Customer "${name}" added (demo UI only).`);
        this.reset();
    });

    /* ------------------------------------------------------------------
       Global actions (demo only)
    ------------------------------------------------------------------ */
    window.viewCustomer = function (name) {
        showNotification(`View customer "${name}" - demo UI only.`);
    };

    window.editCustomer = function (name) {
        showNotification(`Edit customer "${name}" - demo UI only.`);
    };

    window.deleteCustomer = function (name) {
        if (confirm(`Delete customer "${name}"? This is a frontend demo - no database record will be removed.`)) {
            showNotification(`Customer "${name}" deleted (demo UI only).`);
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
    renderCustomers();
});

