// OZVIO - Admin Product Form JavaScript (Add & Edit)
// Frontend demo only. No backend, no database, no real product operations.

document.addEventListener('DOMContentLoaded', function () {

    /* ------------------------------------------------------------------
       Elements
    ------------------------------------------------------------------ */
    const form = document.getElementById('addProductForm') || document.getElementById('editProductForm');
    const tabs = document.querySelectorAll('.product-form-tab');
    const tabContents = document.querySelectorAll('.product-form-tab-content');
    const addVariationBtn = document.getElementById('addVariation');
    const variationsList = document.getElementById('variationsList');
    const saveBtn = form.querySelector('button[type="submit"]');

    /* ------------------------------------------------------------------
       Tab switching
    ------------------------------------------------------------------ */
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const targetTab = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            document.getElementById('tab' + targetTab.charAt(0).toUpperCase() + targetTab.slice(1)).classList.add('active');
        });
    });

    /* ------------------------------------------------------------------
       Variation management (demo UI only)
    ------------------------------------------------------------------ */
    if (addVariationBtn && variationsList) {
        let variationCount = variationsList.querySelectorAll('.variation-item').length;

        addVariationBtn.addEventListener('click', function () {
            variationCount++;
            const item = document.createElement('div');
            item.className = 'variation-item';
            item.innerHTML = `
                <div style="flex:1; min-width:140px;">
                    <label style="font-size:0.78rem;color:var(--muted);display:block;margin-bottom:4px;">Variation Name</label>
                    <input type="text" value="Option ${variationCount}" style="width:100%;padding:8px 12px;background:var(--bg-alt);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:0.88rem;">
                </div>
                <div style="flex:1; min-width:140px;">
                    <label style="font-size:0.78rem;color:var(--muted);display:block;margin-bottom:4px;">Label</label>
                    <input type="text" value="Label ${variationCount}" style="width:100%;padding:8px 12px;background:var(--bg-alt);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:0.88rem;">
                </div>
                <div style="flex:1; min-width:100px;">
                    <label style="font-size:0.78rem;color:var(--muted);display:block;margin-bottom:4px;">Price</label>
                    <input type="number" value="0" style="width:100%;padding:8px 12px;background:var(--bg-alt);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:0.88rem;">
                </div>
                <div style="flex:1; min-width:100px;">
                    <label style="font-size:0.78rem;color:var(--muted);display:block;margin-bottom:4px;">Stock</label>
                    <input type="number" value="0" style="width:100%;padding:8px 12px;background:var(--bg-alt);border:1px solid var(--line);border-radius:6px;color:var(--text);font-size:0.88rem;">
                </div>
                <button type="button" class="btn-remove-var" title="Remove variation"><i class="fas fa-trash"></i></button>
            `;
            variationsList.appendChild(item);
        });

        variationsList.addEventListener('click', function (e) {
            const btn = e.target.closest('.btn-remove-var');
            if (btn) {
                btn.closest('.variation-item').remove();
            }
        });
    }

    /* ------------------------------------------------------------------
       Form validation (demo)
    ------------------------------------------------------------------ */
    const requiredFields = form.querySelectorAll('input[required], select[required], textarea[required]');

    function showFieldError(input, message) {
        const group = input.closest('.product-form-group');
        const error = group.querySelector('.product-form-error');
        group.classList.add('error');
        if (error) error.textContent = message;
    }

    function clearFieldError(input) {
        const group = input.closest('.product-form-group');
        const error = group.querySelector('.product-form-error');
        group.classList.remove('error');
        if (error) error.textContent = '';
    }

    requiredFields.forEach(field => {
        field.addEventListener('blur', function () {
            if (!this.value.trim()) {
                showFieldError(this, 'This field is required.');
            } else {
                clearFieldError(this);
            }
        });
        field.addEventListener('input', function () {
            if (this.closest('.product-form-group').classList.contains('error') && this.value.trim()) {
                clearFieldError(this);
            }
        });
    });

    /* ------------------------------------------------------------------
       Save (demo only - no backend)
    ------------------------------------------------------------------ */
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let valid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                showFieldError(field, 'This field is required.');
                valid = false;
            } else {
                clearFieldError(field);
            }
        });

        if (!valid) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        const btnText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        setTimeout(function () {
            saveBtn.textContent = btnText;
            saveBtn.disabled = false;
            showNotification('Product saved successfully (demo UI only - no database record created).');
            // In a real app: navigate to product-list.html
        }, 1200);
    });

    /* ------------------------------------------------------------------
       Toast notification
    ------------------------------------------------------------------ */
    let toastTimer;
    function showNotification(message, type = 'success') {
        const toastEl = document.getElementById('toast');
        if (!toastEl) return;
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
       Image upload zone (demo)
    ------------------------------------------------------------------ */
    const uploadZones = document.querySelectorAll('.image-upload-zone');
    uploadZones.forEach(zone => {
        zone.addEventListener('click', function () {
            showNotification('Image upload is a frontend demo only. Connect Supabase storage in the next phase.');
        });
    });
});

