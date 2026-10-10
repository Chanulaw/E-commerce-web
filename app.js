// --- PRODUCT DATA (Stricly 10 products, exactly 3 categories) ---
const products = [
    // Electronics (3 items)
    { id: 1, name: "Wireless Noise-Canceling Headphones", category: "Electronics", price: 149.99, desc: "Immersive sound with active noise cancellation and ergonomic ear cushions.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { id: 2, name: "Smart Fitness Watch Series X", category: "Electronics", price: 199.99, desc: "Monitor heart rate, blood oxygen, and daily activity tracking seamlessly.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
    { id: 3, name: "Compact Portable Bluetooth Speaker", category: "Electronics", price: 59.99, desc: "Water-resistant outdoor speaker with deep bass and 12-hour battery life.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },

    // Clothing (4 items)
    { id: 4, name: "Classic Merino Wool Sweater", category: "Clothing", price: 89.99, desc: "Luxurious breathable knitwear styled with traditional editorial aesthetics.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400" },
    { id: 5, name: "Tailored Slim-Fit Chino Trousers", category: "Clothing", price: 65.00, desc: "Versatile stretch-cotton trousers tailored for everyday professional wear.", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400" },
    { id: 6, name: "Minimalist Leather Oxford Shoes", category: "Clothing", price: 120.00, desc: "Handcrafted genuine leather footwear blending durability with quiet luxury.", image: "https://images.unsplash.com/photo-1533867617858-e7d97e060857?w=400" },
    { id: 7, name: "Waterproof Everyday Urban Backpack", category: "Clothing", price: 75.50, desc: "Sleek compartment backpack designed for laptops and daily gear essentials.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400" },

    // Food (3 items)
    { id: 8, name: "Artisanal Organic Dark Coffee Beans", category: "Food", price: 22.50, desc: "Single-origin roast roasted to perfection with rich chocolate undertones.", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400" },
    { id: 9, name: "Handcrafted Belgian Gourmet Chocolates", category: "Food", price: 34.00, desc: "Assorted truffle selection crafted by master chocolatiers.", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400" },
    { id: 10, name: "Organic Wild Blossom Honey Jar", category: "Food", price: 18.00, desc: "Pure raw honey harvested sustainably from highland wildflower meadows.", image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400" }
];

// --- APP STATE ---
let cart = JSON.parse(localStorage.getItem('auramart_cart')) || [];
let currentCategory = 'all';
let searchQuery = '';

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('product-grid');
const categoryTabs = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const cartBtn = document.getElementById('cart-btn');
const cartBadge = document.getElementById('cart-badge');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const cartItemsList = document.getElementById('cart-items-list');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutModal = document.getElementById('checkout-modal');
const closeCheckout = document.getElementById('close-checkout');
const checkoutForm = document.getElementById('checkout-form');
const successModal = document.getElementById('success-modal');
const finishBtn = document.getElementById('finish-btn');

// Accessibility elements
const toggleContrastBtn = document.getElementById('toggle-contrast');
const fontDecreaseBtn = document.getElementById('font-decrease');
const fontResetBtn = document.getElementById('font-reset');
const fontIncreaseBtn = document.getElementById('font-increase');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();
    initAccessibility();
});

// --- RENDER PRODUCTS ---
function renderProducts() {
    productGrid.innerHTML = '';

    const filtered = products.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No products match your criteria.</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img-wrapper">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
            </div>
            <div class="product-info">
                <span class="product-cat">${product.category}</span>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.desc}</p>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="btn primary-btn" onclick="addToCart(${product.id})">Add to Basket</button>
                </div>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// --- FILTER & SEARCH EVENTS ---
categoryTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        currentCategory = e.target.getAttribute('data-category');
        renderProducts();
    });
});

searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.trim();
    renderProducts();
});

// --- CART FUNCTIONS (`localStorage`) ---
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveAndRefreshCart();
    
    // Quick visual pulse on cart button
    cartBtn.style.transform = 'scale(1.08)';
    setTimeout(() => cartBtn.style.transform = 'scale(1)', 200);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveAndRefreshCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveAndRefreshCart();
        }
    }
}

function saveAndRefreshCart() {
    localStorage.setItem('auramart_cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;

    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 20px;">Your shopping basket is empty.</p>`;
        cartTotalPrice.textContent = '\$0.00';
        return;
    }

    let totalPrice = 0;
    cart.forEach(item => {
        totalPrice += item.price * item.quantity;
        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
            <div style="flex-grow: 1;">
                <h5 style="font-size: 0.9rem; font-weight: 600;">${item.name}</h5>
                <small style="color: var(--text-muted);">$${item.price.toFixed(2)} x ${item.quantity}</small>
            </div>
            <div style="display: flex; gap: 5px; align-items: center;">
                <button class="btn" style="padding: 2px 6px; background: var(--border);" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span style="font-size: 0.9rem; font-weight: 600; width: 20px; text-align: center;">${item.quantity}</span>
                <button class="btn" style="padding: 2px 6px; background: var(--border);" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button class="btn" style="background: #ef4444; color: #fff; padding: 2px 6px; margin-left: 5px;" onclick="removeFromCart(${item.id})">&times;</button>
            </div>
        `;
        cartItemsList.appendChild(row);
    });

    cartTotalPrice.textContent = `$${totalPrice.toFixed(2)}`;
}

// --- MODAL CONTROLS ---
cartBtn.addEventListener('click', () => { cartModal.classList.remove('hidden'); });
closeCart.addEventListener('click', () => { cartModal.classList.add('hidden'); });
cartModal.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.classList.add('hidden'); });

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert("Your basket is empty!");
        return;
    }
    cartModal.classList.add('hidden');
    checkoutModal.classList.remove('hidden');
});
closeCheckout.addEventListener('click', () => { checkoutModal.classList.add('hidden'); });

checkoutForm.addEventListener('submit', (e) => {
    e.preventDefault();
    checkoutModal.classList.add('hidden');
    successModal.classList.remove('hidden');
    
    // Clear cart & localStorage
    cart = [];
    localStorage.removeItem('auramart_cart');
    updateCartUI();
});

finishBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
});

// --- UNIVERSAL DESIGN ACCESSIBILITY TOOLBAR ---
function initAccessibility() {
    let currentFontSize = 1;

    toggleContrastBtn.addEventListener('click', () => {
        document.body.classList.toggle('high-contrast');
    });

    fontIncreaseBtn.addEventListener('click', () => {
        if (currentFontSize < 1.25) {
            currentFontSize += 0.1;
            document.documentElement.style.setProperty('--font-scale', `${currentFontSize}rem`);
        }
    });

    fontDecreaseBtn.addEventListener('click', () => {
        if (currentFontSize > 0.85) {
            currentFontSize -= 0.1;
            document.documentElement.style.setProperty('--font-scale', `${currentFontSize}rem`);
        }
    });

    fontResetBtn.addEventListener('click', () => {
        currentFontSize = 1;
        document.documentElement.style.setProperty('--font-scale', '1rem');
        document.body.classList.remove('high-contrast');
    });
}