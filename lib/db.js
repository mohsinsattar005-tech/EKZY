'use strict';

/**
 * Ozvio database layer.
 * Uses Node's built-in SQLite (node:sqlite), so there are no external
 * dependencies to install. The database lives at data/ozvio.db.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'ozvio.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

/* ------------------------------------------------------------------ */
/* Schema                                                              */
/* ------------------------------------------------------------------ */

db.exec(`
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'fas fa-box',
    parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    visible INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL DEFAULT '',
    short_description TEXT NOT NULL DEFAULT '',
    main_image TEXT NOT NULL DEFAULT '',
    gallery TEXT NOT NULL DEFAULT '[]',
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    subcategory TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    sku TEXT NOT NULL DEFAULT '',
    product_type TEXT NOT NULL DEFAULT '',
    brand TEXT NOT NULL DEFAULT '',
    regular_price REAL NOT NULL DEFAULT 0,
    sale_price REAL,
    cost_price REAL,
    availability TEXT NOT NULL DEFAULT 'in_stock',
    track_inventory INTEGER NOT NULL DEFAULT 1,
    stock INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER NOT NULL DEFAULT 5,
    weight REAL,
    dimensions TEXT NOT NULL DEFAULT '',
    shipping_details TEXT NOT NULL DEFAULT '',
    processing_info TEXT NOT NULL DEFAULT '',
    featured INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'published',
    seo_title TEXT NOT NULL DEFAULT '',
    meta_description TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'fas fa-box',
    rating REAL NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS product_variations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    group_name TEXT NOT NULL DEFAULT 'Option',
    label TEXT NOT NULL,
    price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    sku TEXT NOT NULL DEFAULT '',
    image TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer',
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    last_login TEXT
);

CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_resets (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'percent',
    value REAL NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_number TEXT NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT NOT NULL DEFAULT '',
    city TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT '',
    postal_code TEXT NOT NULL DEFAULT '',
    country TEXT NOT NULL,
    subtotal REAL NOT NULL,
    discount REAL NOT NULL DEFAULT 0,
    shipping REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT 'cod',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    status TEXT NOT NULL DEFAULT 'pending',
    notes TEXT NOT NULL DEFAULT '',
    tracking_note TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    variation_id INTEGER REFERENCES product_variations(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    variation_label TEXT NOT NULL DEFAULT '',
    sku TEXT NOT NULL DEFAULT '',
    unit_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    line_total REAL NOT NULL,
    image TEXT NOT NULL DEFAULT '',
    icon TEXT NOT NULL DEFAULT 'fas fa-box'
);

CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor TEXT NOT NULL DEFAULT '',
    action TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
`);

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function slugify(value) {
    return String(value || '')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 90) || 'item';
}

function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
    return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password, stored) {
    try {
        const [scheme, salt, hash] = String(stored).split('$');
        if (scheme !== 'scrypt' || !salt || !hash) return false;
        const candidate = crypto.scryptSync(String(password), salt, 64);
        const expected = Buffer.from(hash, 'hex');
        return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
    } catch {
        return false;
    }
}

function getSetting(key, fallback = '') {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? row.value : fallback;
}

function setSetting(key, value) {
    db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, String(value ?? ''));
}

function logActivity(actor, action, details = '') {
    db.prepare('INSERT INTO activity_log (actor, action, details) VALUES (?, ?, ?)')
        .run(String(actor || 'system'), String(action), typeof details === 'string' ? details : JSON.stringify(details));
}

/* ------------------------------------------------------------------ */
/* Seed                                                                */
/* ------------------------------------------------------------------ */

function seed() {
    const categoryCount = db.prepare('SELECT COUNT(*) AS n FROM categories').get().n;
    if (!categoryCount) {
        const insertCat = db.prepare(
            'INSERT INTO categories (name, slug, description, icon, sort_order) VALUES (?, ?, ?, ?, ?)'
        );
        const cats = [
            ['Gadgets', 'gadgets', 'Latest gadgets and innovative technology.', 'fas fa-microchip', 1],
            ['Electronics', 'electronics', 'Advanced electronic devices and accessories.', 'fas fa-bolt', 2],
            ['Smart Accessories', 'smart-accessories', 'Intelligent accessories for modern life.', 'fas fa-wifi', 3],
            ['Tech Essentials', 'tech-essentials', 'Essential technology for everyday use.', 'fas fa-plug', 4]
        ];
        cats.forEach(c => insertCat.run(...c));
    }

    const productCount = db.prepare('SELECT COUNT(*) AS n FROM products').get().n;
    if (!productCount) {
        const cat = {};
        db.prepare('SELECT id, slug FROM categories').all().forEach(c => { cat[c.slug] = c.id; });

        const insertProduct = db.prepare(`
            INSERT INTO products (
                title, slug, description, short_description, main_image, gallery, category_id,
                subcategory, tags, sku, product_type, brand, regular_price, sale_price, cost_price,
                availability, track_inventory, stock, low_stock_threshold, weight, dimensions,
                shipping_details, processing_info, featured, status, seo_title, meta_description,
                icon, rating, created_at, updated_at
            ) VALUES (
                ?, ?, ?, ?, '', '[]', ?, '', '[]', ?, ?, ?, ?, ?, ?, 'in_stock', 1, ?, 5,
                ?, '', '', '', ?, 'published', ?, ?, ?, ?, ?, datetime('now')
            )`);

        // `price` is the selling price, `oldPrice` is the compare-at price.
        const catalog = [
            // Homepage featured ("New arrivals")
            ['Premium Smartphone X', 599, 699, 4.5, 'fas fa-mobile-alt', 'gadgets', 1, 'Smartphones', 'Ozvio', 'Premium smartphone with an edge-to-edge display and all-day battery.'],
            ['Ultra Laptop Pro', 1299, 1499, 5.0, 'fas fa-laptop', 'electronics', 1, 'Laptops', 'Ozvio', 'A slim, powerful laptop built for creators and professionals.'],
            ['Wireless Headphones Elite', 199, 249, 4.8, 'fas fa-headphones', 'electronics', 1, 'Audio', 'Ozvio', 'Immersive wireless sound with adaptive noise cancellation.'],
            ['Smart Watch Series 5', 399, 499, 4.6, 'fas fa-clock', 'smart-accessories', 1, 'Wearables', 'Ozvio', 'Health, fitness and notifications on a bright always-on display.'],
            ['Gaming Console Ultimate', 499, 599, 4.9, 'fas fa-gamepad', 'gadgets', 1, 'Gaming', 'Ozvio', 'Next-generation console gaming with lightning-fast load times.'],
            ['4K Smart TV 55 inch', 899, 1099, 4.7, 'fas fa-tv', 'electronics', 1, 'Television', 'Ozvio', 'Cinematic 4K picture with smart streaming built in.'],

            // Gadgets
            ['Galaxy S24 Ultra', 899, 1059, 4.7, 'fas fa-mobile-alt', 'gadgets', 0, 'Smartphones', 'Samsung', 'Flagship smartphone with a 200MP camera and S Pen.'],
            ['iPad Pro 12.9"', 1099, 1299, 5.0, 'fas fa-tablet-alt', 'gadgets', 0, 'Tablets', 'Apple', 'Desktop-class performance in a stunning Liquid Retina display.'],
            ['Sony Alpha A7 IV', 2199, 2799, 4.9, 'fas fa-camera', 'gadgets', 0, 'Cameras', 'Sony', 'Full-frame mirrorless camera for photo and video creators.'],
            ['Apple Watch Ultra', 799, 899, 4.8, 'fas fa-clock', 'gadgets', 0, 'Wearables', 'Apple', 'Rugged smartwatch built for adventure and endurance.'],
            ['PlayStation 5 Pro', 599, 699, 4.9, 'fas fa-gamepad', 'gadgets', 0, 'Gaming', 'Sony', 'High-performance console with ray tracing and ultra-fast SSD.'],
            ['DJI Mavic 3 Pro', 1899, 2199, 4.7, 'fas fa-plane', 'gadgets', 0, 'Drones', 'DJI', 'Triple-camera drone with professional aerial imaging.'],

            // Electronics
            ['MacBook Pro M3 Max', 2499, 2999, 5.0, 'fas fa-laptop', 'electronics', 0, 'Laptops', 'Apple', 'Extreme performance for demanding creative workflows.'],
            ['Dell UltraSharp 32" 4K', 1299, 1499, 4.8, 'fas fa-desktop', 'electronics', 0, 'Monitors', 'Dell', 'Colour-accurate 4K monitor for professional work.'],
            ['Sony WH-1000XM5', 349, 449, 4.9, 'fas fa-headphones', 'electronics', 0, 'Audio', 'Sony', 'Industry-leading noise cancellation with premium comfort.'],
            ['HP LaserJet Pro', 299, 399, 4.6, 'fas fa-print', 'electronics', 0, 'Printers', 'HP', 'Fast, reliable monochrome laser printing for the office.'],
            ['UPS 1500VA Backup', 199, 249, 4.5, 'fas fa-plug', 'electronics', 0, 'Power', 'APC', 'Keeps your essential devices running through outages.'],
            ['Netgear Nighthawk AX12', 349, 449, 4.7, 'fas fa-network-wired', 'electronics', 0, 'Networking', 'Netgear', 'High-speed Wi-Fi 6 router for large homes.'],

            // Smart Accessories
            ['Anker PowerCore 26800mAh', 59, 79, 4.8, 'fas fa-battery-full', 'smart-accessories', 0, 'Power Banks', 'Anker', 'Massive capacity power bank with fast charging.'],
            ['USB-C to HDMI Adapter', 29, 39, 4.7, 'fas fa-tv', 'smart-accessories', 0, 'Adapters', 'Ozvio', 'Connect your USB-C device to any HDMI display.'],
            ['iPhone 15 Pro Case', 39, 49, 4.6, 'fas fa-mobile-alt', 'smart-accessories', 0, 'Cases', 'Ozvio', 'Slim protective case with a premium finish.'],
            ['Logitech MX Master 3S', 99, 129, 4.9, 'fas fa-mouse', 'smart-accessories', 0, 'Mice', 'Logitech', 'Precision wireless mouse for productivity.'],
            ['USB-C Hub 7-in-1', 49, 59, 4.7, 'fas fa-layer-group', 'smart-accessories', 0, 'Hubs', 'Ozvio', 'Expand your laptop with seven essential ports.'],
            ['Adjustable Laptop Stand', 44, 59, 4.8, 'fas fa-laptop', 'smart-accessories', 0, 'Stands', 'Ozvio', 'Ergonomic aluminium stand for better posture.'],

            // Tech Essentials
            ['USB-C to USB-C Cable 2m', 19, 24, 4.7, 'fas fa-plug', 'tech-essentials', 0, 'Cables', 'Ozvio', 'Durable fast-charging and data cable.'],
            ['65W GaN Charger', 39, 49, 4.8, 'fas fa-charging-station', 'tech-essentials', 0, 'Chargers', 'Ozvio', 'Compact gallium-nitride charger for laptop and phone.'],
            ['Samsung T7 SSD 2TB', 129, 169, 4.9, 'fas fa-hdd', 'tech-essentials', 0, 'Storage', 'Samsung', 'Fast portable SSD with a rugged metal body.'],
            ['Logitech C920 Pro Webcam', 79, 99, 4.6, 'fas fa-video', 'tech-essentials', 0, 'Webcams', 'Logitech', 'Sharp 1080p video for calls and streaming.'],
            ['Multi-Port USB-C Adapter', 34, 39, 4.5, 'fas fa-microchip', 'tech-essentials', 0, 'Adapters', 'Ozvio', 'Compact adapter with the ports you need daily.'],
            ['USB-C Noise-Canceling Headset', 89, 119, 4.8, 'fas fa-headset', 'tech-essentials', 0, 'Audio', 'Ozvio', 'Crisp calls and focused listening in any environment.']
        ];

        let sequence = 1000;
        for (const [title, price, oldPrice, rating, icon, categorySlug, featured, subcategory, brand, shortDesc] of catalog) {
            sequence += 1;
            const slug = slugify(title);
            const sku = 'OZ-' + sequence;
            const stock = 25 + (sequence % 9) * 12;
            insertProduct.run(
                title, slug,
                `${title} — ${shortDesc} Backed by Ozvio's quality checks and worldwide shipping.`,
                shortDesc,
                cat[categorySlug], sku, subcategory, brand,
                oldPrice, price, Math.round(price * 0.62),
                stock, 12, featured,
                `${title} | Ozvio`, shortDesc, icon, rating
            );
        }

        // Variations for a flagship product
        const galaxy = db.prepare("SELECT id FROM products WHERE slug = 'galaxy-s24-ultra'").get();
        if (galaxy) {
            const insVar = db.prepare(
                'INSERT INTO product_variations (product_id, group_name, label, price, stock, sku) VALUES (?, ?, ?, ?, ?, ?)'
            );
            insVar.run(galaxy.id, 'Colour / Storage', 'Midnight Black / 256GB', 899, 30, 'OZ-GS24-BLK-256');
            insVar.run(galaxy.id, 'Colour / Storage', 'Titanium Silver / 256GB', 899, 22, 'OZ-GS24-SLV-256');
            insVar.run(galaxy.id, 'Colour / Storage', 'Titanium Blue / 512GB', 1019, 14, 'OZ-GS24-BLU-512');
            insVar.run(galaxy.id, 'Colour / Storage', 'Titanium Cream / 1TB', 1259, 6, 'OZ-GS24-CRM-1TB');
        }
    }

    const settings = {
        store_name: 'OZVIO',
        store_tagline: 'Shop the world, your way.',
        support_email: 'hello@ozvio.com',
        support_phone: '+1 (555) 123-4567',
        store_address: '123 Global Street, Tech City',
        hero_title: 'Shop the world,\nyour way.',
        hero_subtitle: 'Premium gadgets and electronics from around the globe, with fast shipping and fair prices.',
        shipping_policy: 'Our estimated shipping and delivery timeframe is approximately 20 to 22 days, although delivery times may vary depending on the destination, product availability, and shipping circumstances. We will make every effort to deliver your order within the estimated timeframe.',
        return_policy: 'We always strive to provide high-quality products and accurate product descriptions so that customers receive exactly what they expect. Our goal is to make sure you are satisfied with your purchase and do not need to return your product. At this time, we do not offer returns or exchanges. Please review product details carefully before placing your order.',
        shipping_flat: '0',
        currency: 'USD',
        cod_enabled: '1',
        card_enabled: '0',
        low_stock_default: '5'
    };
    const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO NOTHING');
    Object.entries(settings).forEach(([k, v]) => upsert.run(k, v));

    if (!db.prepare('SELECT COUNT(*) AS n FROM coupons').get().n) {
        db.prepare("INSERT INTO coupons (code, type, value, active) VALUES ('GLOBAL10', 'percent', 10, 1)").run();
    }

    if (!db.prepare('SELECT COUNT(*) AS n FROM faqs').get().n) {
        const ins = db.prepare('INSERT INTO faqs (question, answer, sort_order) VALUES (?, ?, ?)');
        [
            ['How can I place an order?', 'Choose the products you want, add them to your cart, then open your cart and select "Proceed to checkout". Fill in your contact and shipping details, choose your payment method, and place the order. You will receive an order confirmation with your order number.'],
            ['How can I contact customer support?', 'You can reach us through the contact form on our homepage, or email hello@ozvio.com. We aim to reply within 1–2 business days.'],
            ['How can I track my order?', 'Open the Track Order page in the footer and enter your order number and the email address used at checkout. Your current order status will be shown there.'],
            ['What payment methods are available?', 'Cash on delivery is available at checkout. Online card payments are being prepared and are not yet active, so no card is charged on this website today.'],
            ['How can I manage my account?', 'Create an account or sign in, then open My Account. From your dashboard you can update your profile, manage shipping addresses, review previous orders and manage your wishlist.'],
            ['How can I contact the store regarding my purchase?', 'Reply to your order confirmation email or send us a message with your order number through the contact form. Please include your order number so we can help you faster.']
        ].forEach((f, i) => ins.run(f[0], f[1], i + 1));
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ozvio.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Ozvio2026';
    const existingAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
    if (!existingAdmin) {
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)')
            .run('Store Administrator', adminEmail, hashPassword(adminPassword), 'admin');
        console.log(`[Ozvio] Admin account created: ${adminEmail}`);
        if (!process.env.ADMIN_PASSWORD) console.log('[Ozvio] Default admin password: Admin@Ozvio2026 (change it after first login)');
    }
}

seed();

module.exports = {
    db,
    DATA_DIR,
    UPLOAD_DIR,
    slugify,
    hashPassword,
    verifyPassword,
    getSetting,
    setSetting,
    logActivity
};
