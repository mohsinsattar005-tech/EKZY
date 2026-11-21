// OZVIO - Admin Products JavaScript
// Frontend demo only. No backend, no database, no real product operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const productGrid = document.getElementById('productGrid');
    const productTableBody = document.getElementById('productTableBody');
    const viewGridBtn = document.getElementById('viewGrid');
    const viewListBtn = document.getElementById('viewList');

    /* ------------------------------------------------------------------
       Demo product data (compatible structure with customer-facing site)
    ------------------------------------------------------------------ */
    const demoProducts = [
        {
            id: 1, title: 'Premium Smartphone X', slug: 'premium-smartphone-x',
            sku: 'OZ-1001', price: 599, salePrice: null, stock: 24,
            category: 'Gadgets', subcategory: 'Smartphones', brand: 'OZVIO',
            status: 'published', icon: 'fas fa-mobile-alt',
            lowStockThreshold: 5, weight: 0.22, dimensions: '160 x 75 x 8 mm'
        },
        {
            id: 2, title: 'Ultra Laptop Pro', slug: 'ultra-laptop-pro',
            sku: 'OZ-1002', price: 1299, salePrice: 1199, stock: 12,
            category: 'Electronics', subcategory: 'Laptops', brand: 'OZVIO',
            status: 'published', icon: 'fas fa-laptop',
            lowStockThreshold: 5, weight: 1.8, dimensions: '356 x 246 x 18 mm'
        },
        {
            id: 3, title: 'Wireless Headphones Elite', slug: 'wireless-headphones-elite',
            sku: 'OZ-1003', price: 199, salePrice: null, stock: 45,
            category: 'Electronics', subcategory: 'Audio', brand: 'OZVIO',
            status: 'published', icon: 'fas fa-headphones',
            lowStockThreshold: 10, weight: 0.3, dimensions: '200 x 180 x 85 mm'
        },
        {
            id: 4, title: 'Smart Watch Series 5', slug: 'smart-watch-series-5',
            sku: 'OZ-1004', price: 399, salePrice: 349, stock: 3,
            category: 'Smart Accessories', subcategory: 'Wearables', brand: 'OZVIO',
            status: 'published', icon: 'fas fa-clock',
            lowStockThreshold: 5, weight: 0.06, dimensions: '44 x 44 x 11 mm'
        },
        {
            id: 5, title: 'Gaming Console Ultimate', slug: 'gaming-console-ultimate',
            sku: 'OZ-1005', price: 499, salePrice: null, stock: 8,
            category: 'Gadgets', subcategory: 'Gaming', brand: 'OZVIO',
            status: 'draft', icon: 'fas fa-gamepad',
            lowStockThreshold: 5, weight: 2.2, dimensions: '390 x 260 x 105 mm'
        },
        {
            id: 6, title: '4K Smart TV 55 inch', slug: '4k-smart-tv-55-inch',
            sku: 'OZ-1006', price: 899, salePrice: 799, stock: 2,
            category: 'Electronics', subcategory: 'Television', brand: 'OZVIO',
            status: 'published', icon: 'fas fa-tv',
            lowStockThreshold: 3, weight: 12.5, dimensions: '1230 x 720 x 60 mm'
        },
        {
            id: 7, title: 'Galaxy S24 Ultra', slug: 'galaxy-s24-ultra',
            sku: 'OZ-GS24-BLK-256', price: 899, salePrice: null, stock: 30,
            category: 'Gadgets', subcategory: 'Smartphones', brand: 'Samsung',
            status: 'published', icon: 'fas fa-mobile-alt',
            lowStockThreshold: 5, weight: 0.23, dimensions: '163 x 78 x 9 mm'
        },
        {
            id: 8, title: 'iPad Pro 12.9"', slug: 'ipad-pro-12-9',
            sku: 'OZ-1008', price: 1099, salePrice: null, stock: 18,
            category: 'Gadgets', subcategory: 'Tablets', brand: 'Apple',
            status: 'published', icon: 'fas fa-tablet-alt',
            lowStockThreshold: 5, weight: 0.68, dimensions: '280 x 215 x 6 mm'
        },
        {
            id: 9, title: 'Sony Alpha A7 IV', slug: 'sony-alpha-a7-iv',
            sku: 'OZ-1009', price: 2199, salePrice: null, stock: 4,
            category: 'Gadgets', subcategory: 'Cameras', brand: 'Sony',
            status: 'published', icon: 'fas fa-camera',
            lowStockThreshold: 3, weight: 0.66, dimensions: '131 x 96 x 80 mm'
        },
        {
            id: 10, title: 'Apple Watch Ultra', slug: 'apple-watch-ultra',
            sku: 'OZ-1010', price: 799, salePrice: null, stock: 22,
            category: 'Gadgets', subcategory: 'Wearables', brand: 'Apple',
            status: 'published', icon: 'fas fa-clock',
            lowStockThreshold: 5, weight: 0.06, dimensions: '49 x 44 x 14 mm'
        }
    ];

    /* ------------------------------------------------------------------
       Render product cards (grid view)
    ------------------------------------------------------------------ */
    function renderGrid(products) {
        productGrid.innerHTML = products.map(p => {
            const isLowStock = p.stock <= p.lowStockThreshold;
            const isOut = p.stock === 0;
            const statusClass = isOut ? 'stock-out' : (isLowStock ? 'stock-low' : 'stock-in');
            const statusText = isOut ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock');
            const saleHtml = p.salePrice ? `<span style="font-size:0.78rem;color:var(--muted);text-decoration:line-through;">$${p.price}</span> <span style="color:var(--danger);font-weight:700;">-$${Math.round((1 - p.salePrice / p.price) * 100)}%</span>` : '';
            return `
                <div class="product-card-admin">
                    <div class="product-card-admin-thumb">
                        <i class="${p.icon}"></i>
                    </div>
                    <span class="product-card-admin-badge">SKU: ${p.sku}</span>
                    <span class="product-card-admin-status ${p.status}">${p.status.charAt(0).toUpperCase() + p.status.slice(1)}</span>
                    <div class="product-card-admin-info">
                        <h4>${p.title}</h4>
                        <div class="product-card-admin-meta">
                            <span>${p.category}</span>
                            <span>${p.brand}</span>
                        </div>
                    </div>
                    <div class="product-card-admin-price">
                        <span class="price">$${p.salePrice || p.price}</span>
                        ${saleHtml}
                    </div>
                    <div class="product-card-admin-actions">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editProduct(${p.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="viewProduct(${p.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteProduct(${p.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /* ------------------------------------------------------------------
       Render product table rows (list view)
    ------------------------------------------------------------------ */
    function renderTable(products) {
        productTableBody.innerHTML = products.map(p => {
            const isLowStock = p.stock <= p.lowStockThreshold;
            const isOut = p.stock === 0;
            const statusClass = isOut ? 'stock-out' : (isLowStock ? 'stock-low' : 'stock-in');
            const statusText = isOut ? 'Out of Stock' : (isLowStock ? 'Low Stock' : 'In Stock');
            return `
                <tr>
                    <td>
                        <div style="width:40px;height:40px;border-radius:6px;background:var(--bg-alt);border:1px solid var(--line);display:grid;place-items:center;">
                            <i class="${p.icon}" style="font-size:1.2rem;color:var(--muted);"></i>
                        </div>
                    </td>
                    <td>${p.title}</td>
                    <td style="font-family:monospace;font-size:0.85rem;">${p.sku}</td>
                    <td>${p.category}</td>
                    <td>$${p.salePrice || p.price}</td>
                    <td>${p.stock}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <div style="display:flex;gap:6px;">
                            <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editProduct(${p.id})" title="Edit"><i class="fas fa-edit"></i></button>
                            <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="viewProduct(${p.id})" title="View"><i class="fas fa-eye"></i></button>
                            <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteProduct(${p.id})" title="Delete"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /* ------------------------------------------------------------------
       Toggle views
    ------------------------------------------------------------------ */
    function showGrid() {
        productGrid.hidden = false;
        productTable.hidden = true;
        viewGridBtn.classList.add('active');
        viewListBtn.classList.remove('active');
    }

    function showList() {
        productGrid.hidden = true;
        productTable.hidden = false;
        viewListBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
    }

    viewGridBtn.addEventListener('click', showGrid);
    viewListBtn.addEventListener('click', showList);

    /* ------------------------------------------------------------------
       Global product actions (demo only)
    ------------------------------------------------------------------ */
    window.editProduct = function (id) {
        const p = demoProducts.find(x => x.id === id);
        if (!p) return;
        // In a real app this would navigate to product-edit.html?id=
        showNotification(`Edit product "${p.title}" - navigate to product-edit.html?id=${id} (demo).`);
    };

    window.viewProduct = function (id) {
        const p = demoProducts.find(x => x.id === id);
        if (!p) return;
        showNotification(`View product "${p.title}" - navigate to product-view.html?id=${id} (demo).`);
    };

    window.deleteProduct = function (id) {
        const p = demoProducts.find(x => x.id === id);
        if (!p) return;
        if (confirm(`Delete product "${p.title}"? This is a frontend demo - no database record will be removed.`)) {
            showNotification(`Product "${p.title}" deleted (demo UI only).`);
        }
    };

    /* ------------------------------------------------------------------
       Toast notification
    ------------------------------------------------------------------ */
    let toastTimer;
    function showNotification(message) {
        const toastEl = document.getElementById('toast');
        if (!toastEl) return;
        toastEl.textContent = '';
        const icon = document.createElement('i');
        icon.className = 'fas fa-info-circle';
        toastEl.appendChild(icon);
        toastEl.appendChild(document.createTextNode(message));
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3000);
    }

    /* ------------------------------------------------------------------
       Init
    ------------------------------------------------------------------ */
    const productTable = document.getElementById('productTable');
    renderGrid(demoProducts);
    renderTable(demoProducts);
});

