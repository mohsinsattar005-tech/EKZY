// OZVIO - Admin Categories JavaScript
// Frontend demo only. No backend, no database, no real category operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const categoriesTableBody = document.getElementById('categoriesTableBody');
    const addCategoryModal = document.getElementById('addCategoryModal');
    const closeAddCategoryModal = document.getElementById('closeAddCategoryModal');
    const cancelAddCategory = document.getElementById('cancelAddCategory');
    const addCategoryForm = document.getElementById('addCategoryForm');
    const toastEl = document.getElementById('toast');

    /* ------------------------------------------------------------------
       Demo category data
    ------------------------------------------------------------------ */
    const demoCategories = [
        { name: 'Gadgets', slug: 'gadgets', parent: '—', products: 12, visible: true },
        { name: 'Electronics', slug: 'electronics', parent: '—', products: 9, visible: true },
        { name: 'Smart Accessories', slug: 'smart-accessories', parent: '—', products: 7, visible: true },
        { name: 'Tech Essentials', slug: 'tech-essentials', parent: '—', products: 8, visible: true },
        { name: 'Smartphones', slug: 'smartphones', parent: 'Gadgets', products: 5, visible: true },
        { name: 'Laptops', slug: 'laptops', parent: 'Electronics', products: 4, visible: true },
        { name: 'Audio', slug: 'audio', parent: 'Electronics', products: 3, visible: false },
        { name: 'Wearables', slug: 'wearables', parent: 'Smart Accessories', products: 3, visible: true },
    ];

    /* ------------------------------------------------------------------
       Render categories table
    ------------------------------------------------------------------ */
    function renderCategories() {
        categoriesTableBody.innerHTML = demoCategories.map(c => `
            <tr>
                <td>${c.name}</td>
                <td style="font-family:monospace;font-size:0.85rem;">${c.slug}</td>
                <td>${c.parent}</td>
                <td>${c.products}</td>
                <td><span class="status-badge ${c.visible ? 'published' : 'draft'}">${c.visible ? 'Visible' : 'Hidden'}</span></td>
                <td>
                    <div style="display:flex;gap:6px;">
                        <button class="btn-admin btn-admin-outline btn-admin-sm" onclick="editCategory('${c.name}')" title="Edit"><i class="fas fa-edit"></i></button>
                        <button class="btn-admin btn-admin-danger btn-admin-sm" onclick="deleteCategory('${c.name}')" title="Delete"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    /* ------------------------------------------------------------------
       Modal actions
    ------------------------------------------------------------------ */
    function showAddCategoryModal() {
        addCategoryModal.classList.add('show');
    }

    function hideAddCategoryModal() {
        addCategoryModal.classList.remove('show');
    }

    closeAddCategoryModal.addEventListener('click', hideAddCategoryModal);
    cancelAddCategory.addEventListener('click', hideAddCategoryModal);
    addCategoryModal.addEventListener('click', function (e) {
        if (e.target === addCategoryModal) hideAddCategoryModal();
    });

    addCategoryForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = this.elements['name'].value.trim();
        if (!name) {
            showNotification('Category name is required.', 'error');
            return;
        }
        hideAddCategoryModal();
        showNotification(`Category "${name}" added (demo UI only).`);
        this.reset();
    });

    /* ------------------------------------------------------------------
       Global actions (demo only)
    ------------------------------------------------------------------ */
    window.editCategory = function (name) {
        showNotification(`Edit category "${name}" - demo UI only.`);
    };

    window.deleteCategory = function (name) {
        if (confirm(`Delete category "${name}"? This is a frontend demo - no database record will be removed.`)) {
            showNotification(`Category "${name}" deleted (demo UI only).`);
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
    renderCategories();
});

