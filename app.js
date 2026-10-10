// --- PRODUCT DATA (Stricly 10 products, exactly 3 categories) ---
const products = [
    // Electronics (3 items)
    { id: 1, name: "Wireless Noise-Canceling Headphones", category: "Electronics", price: 149.99, originalPrice: 199.99, desc: "Immersive sound with active noise cancellation and ergonomic ear cushions.", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", rating: 4.9, badge: "Top Rated" },
    { id: 2, name: "Smart Fitness Watch Series X", category: "Electronics", price: 199.99, originalPrice: 249.99, desc: "Monitor heart rate, blood oxygen, and daily activity tracking seamlessly.", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", rating: 4.8, badge: "New" },
    { id: 3, name: "Compact Portable Bluetooth Speaker", category: "Electronics", price: 59.99, originalPrice: 79.99, desc: "Water-resistant outdoor speaker with deep bass and 12-hour battery life.", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400", rating: 4.7, badge: "Deal" },

    // Clothing (4 items)
    { id: 4, name: "Classic Merino Wool Sweater", category: "Clothing", price: 89.99, originalPrice: 119.99, desc: "Luxurious breathable knitwear styled with traditional editorial aesthetics.", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400", rating: 4.8, badge: "Best Seller" },
    { id: 5, name: "Tailored Slim-Fit Chino Trousers", category: "Clothing", price: 65.00, originalPrice: 89.99, desc: "Versatile stretch-cotton trousers tailored for everyday professional wear.", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400", rating: 4.6, badge: "Trending" },
    { id: 6, name: "Minimalist Leather Oxford Shoes", category: "Clothing", price: 120.00, originalPrice: 149.00, desc: "Handcrafted genuine leather footwear blending durability with quiet luxury.", image: "https://images.unsplash.com/photo-1533867617858-e7d97e060857?w=400", rating: 4.9, badge: "Premium" },
    { id: 7, name: "Waterproof Everyday Urban Backpack", category: "Clothing", price: 75.50, originalPrice: 95.00, desc: "Sleek compartment backpack designed for laptops and daily gear essentials.", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", rating: 4.7, badge: "Hot" },

    // Food (3 items)
    { id: 8, name: "Artisanal Organic Dark Coffee Beans", category: "Food", price: 22.50, originalPrice: 31.00, desc: "Single-origin roast roasted to perfection with rich chocolate undertones.", image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400", rating: 4.8, badge: "Fresh" },
    { id: 9, name: "Handcrafted Belgian Gourmet Chocolates", category: "Food", price: 34.00, originalPrice: 44.00, desc: "Assorted truffle selection crafted by master chocolatiers.", image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400", rating: 4.9, badge: "Limited" },
    { id: 10, name: "Organic Wild Blossom Honey Jar", category: "Food", price: 18.00, originalPrice: 24.00, desc: "Pure raw honey harvested sustainably from highland wildflower meadows.", image: "https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=400", rating: 4.7, badge: "Popular" }
];

// --- APP STATE ---
let cart = [];
let currentCategory = 'all';
let searchQuery = '';
let currentSort = 'best';
let currentUser = JSON.parse(localStorage.getItem('auramart_current_user')) || null;

// --- DOM ELEMENTS ---
const productGrid = document.getElementById('product-grid');
const categoryTabs = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const loginBtn = document.getElementById('login-btn');
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
const loginModal = document.getElementById('login-modal');
const closeLogin = document.getElementById('close-login');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginView = document.getElementById('login-view');
const signupView = document.getElementById('signup-view');
const authTitle = document.getElementById('auth-title');
const showSignupBtn = document.getElementById('show-signup');
const showLoginBtn = document.getElementById('show-login');
const accountPanel = document.getElementById('account-panel');
const logoutBtn = document.getElementById('logout-btn');
const accountName = document.getElementById('account-name');
const accountEmail = document.getElementById('account-email');
const accountDate = document.getElementById('account-date');
const savedCount = document.getElementById('saved-count');
const ordersCount = document.getElementById('orders-count');
const totalSpend = document.getElementById('total-spend');
const ordersList = document.getElementById('orders-list');
const savedList = document.getElementById('saved-list');
const accountTabs = document.querySelectorAll('.account-tab');

// Accessibility elements
const toggleContrastBtn = document.getElementById('toggle-contrast');
const fontDecreaseBtn = document.getElementById('font-decrease');
const fontResetBtn = document.getElementById('font-reset');
const fontIncreaseBtn = document.getElementById('font-increase');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    cart = JSON.parse(localStorage.getItem('auramart_cart')) || [];
    renderProducts();
    updateCartUI();
    initAccessibility();
    setupAuthEvents();
    updateAuthUI();
});

// --- RENDER PRODUCTS ---
function renderProducts() {
    productGrid.innerHTML = '';

    let filtered = products.filter(item => {
        const matchesCategory = currentCategory === 'all' || item.category === currentCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              item.desc.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (currentSort === 'price-low') {
        filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filtered = [...filtered].sort((a, b) => b.price - a.price);
    } else if (currentSort === 'rating') {
        filtered = [...filtered].sort((a, b) => b.rating - a.rating);
    }

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
                <span class="deal-badge">${product.badge}</span>
            </div>
            <div class="product-info">
                <div class="product-meta">
                    <span class="product-cat">${product.category}</span>
                    <span class="rating-star">★ ${product.rating}</span>
                </div>
                <h4 class="product-title">${product.name}</h4>
                <p class="product-desc">${product.desc}</p>
                <div class="product-price-row">
                    <div class="price-stack">
                        <span class="product-price">$${product.price.toFixed(2)}</span>
                        <span class="product-old-price">$${product.originalPrice.toFixed(2)}</span>
                    </div>
                    <div class="product-actions">
                        <button class="icon-btn" onclick="window.addToWishlist(${product.id})" aria-label="Save item">♡</button>
                        <button class="btn primary-btn" onclick="addToCart(${product.id})">Add to Basket</button>
                    </div>
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

sortSelect.addEventListener('change', (e) => {
    const value = e.target.value;
    if (value === 'Lowest price') currentSort = 'price-low';
    else if (value === 'Highest price') currentSort = 'price-high';
    else if (value === 'Top rated') currentSort = 'rating';
    else currentSort = 'best';
    renderProducts();
});

// --- CART FUNCTIONS (`localStorage`) ---
function addToCart(productId) {
    if (!currentUser) {
        loginModal.classList.remove('hidden');
        return;
    }

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
cartBtn.addEventListener('click', () => {
    if (!currentUser) {
        loginModal.classList.remove('hidden');
        return;
    }
    cartModal.classList.remove('hidden');
});
closeCart.addEventListener('click', () => { cartModal.classList.add('hidden'); });
cartModal.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.classList.add('hidden'); });

checkoutBtn.addEventListener('click', () => {
    if (!currentUser) {
        cartModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
        return;
    }
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

    const order = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        items: cart.map(item => ({ id: item.id, name: item.name, qty: item.quantity, price: item.price }))
    };

    const userData = getCurrentUserData();
    userData.orders = userData.orders || [];
    userData.orders.unshift(order);
    localStorage.setItem('auramart_users', JSON.stringify(getUsersStorage()));
    localStorage.setItem('auramart_current_user', JSON.stringify(userData));
    currentUser = userData;

    cart = [];
    localStorage.removeItem('auramart_cart');
    updateCartUI();
    updateAuthUI();
    successModal.classList.remove('hidden');
});

finishBtn.addEventListener('click', () => {
    successModal.classList.add('hidden');
});

function setupAuthEvents() {
    loginBtn.addEventListener('click', () => {
        if (currentUser) {
            const isOpen = !accountPanel.classList.contains('hidden');
            if (isOpen) {
                accountPanel.classList.add('hidden');
                loginBtn.setAttribute('aria-expanded', 'false');
            } else {
                updateAuthUI();
                accountPanel.classList.remove('hidden');
                loginBtn.setAttribute('aria-expanded', 'true');
            }
            return;
        }

        showAuthView('login');
        loginModal.classList.remove('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!accountPanel.contains(e.target) && e.target !== loginBtn && !loginBtn.contains(e.target)) {
            accountPanel.classList.add('hidden');
            loginBtn.setAttribute('aria-expanded', 'false');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            accountPanel.classList.add('hidden');
            loginBtn.setAttribute('aria-expanded', 'false');
        }
    });

    showSignupBtn.addEventListener('click', () => showAuthView('signup'));
    showLoginBtn.addEventListener('click', () => showAuthView('login'));

    closeLogin.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const users = getUsersStorage();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!user) {
            alert('Invalid email or password. Please try again.');
            return;
        }

        currentUser = user;
        localStorage.setItem('auramart_current_user', JSON.stringify(user));
        loginModal.classList.add('hidden');
        loginForm.reset();
        updateAuthUI();
    });

    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();

        if (!name || !email || !password) {
            alert('Please fill all signup fields.');
            return;
        }

        const users = getUsersStorage();
        const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

        if (exists) {
            alert('An account with this email already exists. Please log in instead.');
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            joined: new Date().toLocaleDateString(),
            orders: [],
            savedItems: []
        };

        users.push(newUser);
        localStorage.setItem('auramart_users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('auramart_current_user', JSON.stringify(newUser));
        signupForm.reset();
        loginModal.classList.add('hidden');
        updateAuthUI();
    });

    logoutBtn.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('auramart_current_user');
        updateAuthUI();
    });

    accountTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            accountTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.querySelectorAll('.account-content').forEach(panel => {
                panel.classList.remove('active');
            });
            document.getElementById(`account-${target}`).classList.add('active');
        });
    });
}

function showAuthView(view) {
    const showSignup = view === 'signup';
    loginView.hidden = showSignup;
    signupView.hidden = !showSignup;
    authTitle.textContent = showSignup ? 'Create your AuraMart account' : 'Sign in to your account';
}

function getUsersStorage() {
    return JSON.parse(localStorage.getItem('auramart_users')) || [];
}

function getCurrentUserData() {
    const users = getUsersStorage();
    return users.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase()) || currentUser;
}

function updateAuthUI() {
    if (currentUser) {
        const user = getCurrentUserData();
        currentUser = user;
        loginBtn.textContent = `Hi, ${user.name}`;
        loginBtn.setAttribute('aria-label', `Open account for ${user.name}`);
        accountName.textContent = user.name;
        accountEmail.textContent = user.email;
        accountDate.textContent = user.joined || 'Recently';

        const savedItems = user.savedItems || [];
        const orders = user.orders || [];
        const total = orders.reduce((sum, order) => sum + order.total, 0);

        savedCount.textContent = savedItems.length;
        ordersCount.textContent = orders.length;
        totalSpend.textContent = `$${total.toFixed(2)}`;

        renderOrders(orders);
        renderSavedItems(savedItems);
        accountPanel.classList.add('hidden');
        loginBtn.setAttribute('aria-expanded', 'false');
    } else {
        loginBtn.textContent = 'Login';
        loginBtn.setAttribute('aria-label', 'Login to your account');
        loginBtn.setAttribute('aria-expanded', 'false');
        accountPanel.classList.add('hidden');
    }
}

function renderOrders(orders) {
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '<li class="empty-state">No purchases yet.</li>';
        return;
    }

    ordersList.innerHTML = orders.map(order => `
        <li class="account-item">
            <div>
                <strong>Order #${order.id}</strong>
                <p>${order.date}</p>
            </div>
            <div class="order-summary">
                <span>${order.items.length} items</span>
                <strong>$${order.total.toFixed(2)}</strong>
            </div>
        </li>
    `).join('');
}

function renderSavedItems(savedItems) {
    if (!savedItems || savedItems.length === 0) {
        savedList.innerHTML = '<li class="empty-state">No saved items.</li>';
        return;
    }

    savedList.innerHTML = savedItems.map(item => `
        <li class="account-item saved-item">
            <div class="saved-item-info">
                <strong>${item.name}</strong>
                <p>${item.category}</p>
            </div>
            <span>$${item.price.toFixed(2)}</span>
        </li>
    `).join('');
}

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

// Add save item for logged-in users
window.addToWishlist = function(productId) {
    if (!currentUser) {
        loginModal.classList.remove('hidden');
        return;
    }

    const product = products.find(item => item.id === productId);
    if (!product) return;

    const userData = getCurrentUserData();
    const saved = userData.savedItems || [];
    const exists = saved.some(item => item.id === product.id);

    if (!exists) {
        saved.push({ id: product.id, name: product.name, category: product.category, price: product.price });
        userData.savedItems = saved;
        localStorage.setItem('auramart_users', JSON.stringify(getUsersStorage().map(user => user.email.toLowerCase() === currentUser.email.toLowerCase() ? userData : user)));
        currentUser = userData;
        localStorage.setItem('auramart_current_user', JSON.stringify(userData));
        updateAuthUI();
    }
};

window.saveCurrentUser = function() {
    if (!currentUser) return;
    localStorage.setItem('auramart_current_user', JSON.stringify(currentUser));
};