// Product Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Gallery Thumbnails
    const thumbs = document.querySelectorAll('.thumb');
    const mainImage = document.querySelector('.main-image .image-placeholder');
    
    thumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            thumbs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const iconClass = this.querySelector('i').className;
            mainImage.className = 'image-placeholder ' + iconClass;
        });
    });

    // Color Options
    const colorBtns = document.querySelectorAll('.color-btn');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            colorBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Storage Options
    const storageBtns = document.querySelectorAll('.storage-btn');
    storageBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            storageBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Quantity Selector
    const qtyMinus = document.querySelector('.qty-minus');
    const qtyPlus = document.querySelector('.qty-plus');
    const qtyInput = document.querySelector('.qty-input');
    
    qtyMinus.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        if (value > 1) {
            qtyInput.value = value - 1;
        }
    });
    
    qtyPlus.addEventListener('click', function() {
        let value = parseInt(qtyInput.value);
        if (value < 10) {
            qtyInput.value = value + 1;
        }
    });

    // Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            tabPanes.forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Add to Cart
    const addToCartBtn = document.querySelector('.btn-add-cart');
    addToCartBtn.addEventListener('click', function() {
        const quantity = qtyInput.value;
        showNotification(`Added ${quantity} item(s) to cart!`);
    });

    // Favorite Button
    const favoriteBtn = document.querySelector('.btn-favorite');
    const favoriteIcon = favoriteBtn.querySelector('i');
    
    favoriteBtn.addEventListener('click', function() {
        if (favoriteIcon.classList.contains('far')) {
            favoriteIcon.classList.remove('far');
            favoriteIcon.classList.add('fas');
            showNotification('Added to wishlist!');
        } else {
            favoriteIcon.classList.remove('fas');
            favoriteIcon.classList.add('far');
            showNotification('Removed from wishlist');
        }
    });

    // Notification
    function showNotification(message) {
        const existing = document.querySelector('.product-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'product-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #b08d54, #d6b681);
            color: #1b1409;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
});

// Notification animations
const productStyles = document.createElement('style');
productStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(productStyles);
