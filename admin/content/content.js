// OZVIO - Admin Content Management JavaScript
// Frontend demo only. No backend, no database, no real content operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const bannersTableBody = document.getElementById('bannersTableBody');
    const featuredTableBody = document.getElementById('featuredTableBody');
    const addBannerModal = document.getElementById('addBannerModal');
    const closeAddBannerModal = document.getElementById('closeAddBannerModal');
    const cancelAddBanner = document.getElementById('cancelAddBanner');
    const addBannerForm = document.getElementById('addBannerForm');
    const toastEl = document.getElementById('toast');

    /* ------------------------------------------------------------------
       Demo banner data
    ------------------------------------------------------------------ */
    const demoBanners = [
        { title: 'Summer Sale', position: 'Hero', visible: true },
        { title: 'New Arrivals', position: 'Homepage Top', visible: true },
        { title: 'Tech Essentials', position: 'Homepage Bottom', visible: false },
    ];

    const demoFeatured = [
        { product: 'Premium Smartphone X', position: '1', visible: true },
        { product: 'Ultra Laptop Pro', position: '2', visible: true },
        { product: 'Wireless Headphones Elite', position: '3', visible: true },
        { product: 'Smart Watch Series 5', position: '4', visible: false },
    ];

    /* ------------------------------------------------------------------
       Render tables
    ------------------------------------------------------------------ */
    function renderBanners() {
        bannersTableBody.innerHTML = demoBanners.map(b => `
            <tr>
                <td>${b.title}</td>
                <td>${b.position}</td>
                <td><span class="status-badge ${b.visible ? 'published' : 'draft'}">${b.visible ? 'Visible' : 'Hidden'}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editBanner('${b.title}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteBanner('${b.title}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function renderFeatured() {
        featuredTableBody.innerHTML = demoFeatured.map(f => `
            <tr>
                <td>${f.product}</td>
                <td>${f.position}</td>
                <td><span class="status-badge ${f.visible ? 'published' : 'draft'}">${f.visible ? 'Visible' : 'Hidden'}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editFeatured('${f.product}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="removeFeatured('${f.product}')" title="Remove"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /* ------------------------------------------------------------------
       Modal actions
    ------------------------------------------------------------------ */
    function showAddBannerModal() {
        addBannerModal.classList.add('show');
    }

    function hideAddBannerModal() {
        addBannerModal.classList.remove('show');
    }

    closeAddBannerModal.addEventListener('click', hideAddBannerModal);
    cancelAddBanner.addEventListener('click', hideAddBannerModal);
    addBannerModal.addEventListener('click', function (e) {
        if (e.target === addBannerModal) hideAddBannerModal();
    });

    addBannerForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const title = this.elements['title'].value.trim();
        if (!title) {
            showNotification('Banner title is required.', 'error');
            return;
        }
        hideAddBannerModal();
        showNotification(`Banner "${title}" added (demo UI only).`);
        this.reset();
    });

    /* ------------------------------------------------------------------
       Global actions (demo only)
    ------------------------------------------------------------------ */
    window.editBanner = function (title) {
        showNotification(`Edit banner "${title}" - demo UI only.`);
    };

    window.deleteBanner = function (title) {
        if (confirm(`Delete banner "${title}"? This is a frontend demo - no database record will be removed.`)) {
            showNotification(`Banner "${title}" deleted (demo UI only).`);
        }
    };

    window.editFeatured = function (product) {
        showNotification(`Edit featured product "${product}" - demo UI only.`);
    };

    window.removeFeatured = function (product) {
        if (confirm(`Remove "${product}" from featured? This is a frontend demo.`)) {
            showNotification(`"${product}" removed from featured (demo UI only).`);
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
    renderBanners();
    renderFeatured();
});

