// OZVIO - Admin Dashboard JavaScript
// Frontend demo only. No backend, no database, no real data operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const statTotalSales = document.getElementById('statTotalSales');
    const statTotalOrders = document.getElementById('statTotalOrders');
    const statTotalProducts = document.getElementById('statTotalProducts');
    const statTotalCustomers = document.getElementById('statTotalCustomers');
    const adminRecentOrders = document.getElementById('adminRecentOrders');
    const adminRecentCustomers = document.getElementById('adminRecentCustomers');
    const adminLowStock = document.getElementById('adminLowStock');
    const adminPageTitle = document.getElementById('adminPageTitle');
    const adminPageSubtitle = document.getElementById('adminPageSubtitle');
    const adminLogout = document.getElementById('adminLogout');

    /* ------------------------------------------------------------------
       Demo data (compatible with customer product structure)
    ------------------------------------------------------------------ */
    const demoStats = {
        totalSales: 84250.00,
        totalOrders: 142,
        totalProducts: 36,
        totalCustomers: 89
    };

    const demoRecentOrders = [
        { orderNumber: 'OSV-100247', customer: 'Sarah Johnson', date: 'Nov 18, 2026', total: 598.00, status: 'delivered' },
        { orderNumber: 'OSV-100246', customer: 'Mike Chen', date: 'Nov 17, 2026', total: 1299.00, status: 'shipped' },
        { orderNumber: 'OSV-100245', customer: 'Priya Patel', date: 'Nov 16, 2026', total: 399.00, status: 'processing' },
        { orderNumber: 'OSV-100244', customer: 'David Wilson', date: 'Nov 15, 2026', total: 899.00, status: 'confirmed' },
        { orderNumber: 'OSV-100243', customer: 'Emily Davis', date: 'Nov 14, 2026', total: 199.00, status: 'pending' },
    ];

    const demoRecentCustomers = [
        { name: 'Sarah Johnson', email: 'sarah@example.com', orders: 4, status: 'active' },
        { name: 'Mike Chen', email: 'mike@example.com', orders: 2, status: 'active' },
        { name: 'Priya Patel', email: 'priya@example.com', orders: 1, status: 'active' },
        { name: 'David Wilson', email: 'david@example.com', orders: 3, status: 'active' },
        { name: 'Emily Davis', email: 'emily@example.com', orders: 1, status: 'pending' },
    ];

    const demoLowStock = [
        { name: 'Titanium Cream / 1TB', sku: 'OZ-GS24-CRM-1TB', stock: 6, status: 'stock-low' },
        { name: '4K Smart TV 55 inch', sku: 'OZ-TV-55-4K', stock: 3, status: 'stock-low' },
        { name: 'DJI Mavic 3 Pro', sku: 'OZ-DJI-M3P', stock: 1, status: 'stock-out' },
        { name: 'Sony Alpha A7 IV', sku: 'OZ-SONY-A7IV', stock: 4, status: 'stock-low' },
    ];

    /* ------------------------------------------------------------------
       Render stats
    ------------------------------------------------------------------ */
    function money(n) {
        return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }

    function renderStats() {
        statTotalSales.textContent = money(demoStats.totalSales);
        statTotalOrders.textContent = demoStats.totalOrders;
        statTotalProducts.textContent = demoStats.totalProducts;
        statTotalCustomers.textContent = demoStats.totalCustomers;
    }

    /* ------------------------------------------------------------------
       Render tables
    ------------------------------------------------------------------ */
    function renderRecentOrders() {
        adminRecentOrders.innerHTML = demoRecentOrders.map(order => `
            <tr>
                <td style="font-family: monospace; font-size: 0.85rem; font-weight: 600;">${order.orderNumber}</td>
                <td>${order.customer}</td>
                <td>${order.date}</td>
                <td>$${order.total.toLocaleString()}</td>
                <td><span class="status-badge ${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                <td>
                    <button class="btn-admin btn-admin-outline btn-admin-sm" title="View order">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function renderRecentCustomers() {
        adminRecentCustomers.innerHTML = demoRecentCustomers.map(c => `
            <tr>
                <td>${c.name}</td>
                <td>${c.email}</td>
                <td>${c.orders}</td>
                <td><span class="status-badge ${c.status === 'pending' ? 'pending' : 'confirmed'}">${c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></td>
            </tr>
        `).join('');
    }

    function renderLowStock() {
        adminLowStock.innerHTML = demoLowStock.map(p => `
            <tr>
                <td>${p.name}</td>
                <td style="font-family: monospace; font-size: 0.85rem;">${p.sku}</td>
                <td>${p.stock}</td>
                <td><span class="status-badge ${p.status}">${p.status === 'stock-out' ? 'Out of Stock' : 'Low Stock'}</span></td>
            </tr>
        `).join('');
    }

    /* ------------------------------------------------------------------
       Logout (demo only)
    ------------------------------------------------------------------ */
    adminLogout.addEventListener('click', function (e) {
        e.preventDefault();
        if (confirm('Are you sure you want to log out? (demo)')) {
            window.location.href = '../../index.html';
        }
    });

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    renderStats();
    renderRecentOrders();
    renderRecentCustomers();
    renderLowStock();

    // Set page title
    if (adminPageTitle) adminPageTitle.textContent = 'Dashboard';
    if (adminPageSubtitle) adminPageSubtitle.textContent = 'Overview of your OZVIO store performance.';
});

