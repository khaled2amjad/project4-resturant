// logic.js - Global JavaScript logic for the entire website

// ==================== UTILITY FUNCTIONS ====================

// Load content from content.js and populate data-content attributes
function loadContent() {
    if (typeof CONTENT === 'undefined') {
        console.error('CONTENT object not found. Make sure content.js is loaded first.');
        return;
    }
    
    document.querySelectorAll('[data-content]').forEach(element => {
        const key = element.getAttribute('data-content');
        if (CONTENT[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = CONTENT[key];
            } else {
                element.textContent = CONTENT[key];
            }
        }
    });
}

// Toast notification system
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== CART MANAGEMENT ====================

let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }
    updateCartUI();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('restaurantCart', JSON.stringify(cart));
    updateCartUI();
}

// Add item to cart
function addToCart(productId, productName, productPrice, productImage) {
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage || 'assests/istockphoto-1184633031-612x612.jpg',
            quantity: 1
        });
    }
    
    saveCart();
    showToast(CONTENT.itemAdded || 'Item added to cart', 'success');
}

// Update item quantity in cart
function updateCartQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    showToast(CONTENT.quantityUpdated || 'Quantity updated', 'success');
}

// Remove item from cart (with confirmation)
function removeFromCart(productId, skipConfirm = false, callback = null) {
    if (!skipConfirm) {
        // Show confirmation modal
        showConfirmModal(
            CONTENT.removeItemConfirm || 'Minimum quantity is 1. Do you want to remove this item from cart?',
            () => {
                // User confirmed - proceed with removal
                cart = cart.filter(item => item.id !== productId);
                saveCart();
                showToast(CONTENT.itemRemoved || 'Item removed from cart', 'success');
                // Call callback if provided (e.g., to refresh menu grid)
                if (callback && typeof callback === 'function') {
                    callback();
                }
            }
        );
        return;
    }
    
    // Skip confirmation - direct removal
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    showToast(CONTENT.itemRemoved || 'Item removed from cart', 'success');
    // Call callback if provided
    if (callback && typeof callback === 'function') {
        callback();
    }
}

// Calculate cart totals
function calculateCartTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = CONSTANTS.DELIVERY_FEE || 2.5;
    const tax = subtotal * (CONSTANTS.TAX_RATE || 0.16);
    const total = subtotal + deliveryFee + tax;
    
    return {
        subtotal: subtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2)
    };
}

// Update cart UI (badge, modal content)
function updateCartUI() {
    // Update cart badge
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems > 0 ? totalItems : '';
    }
    
    // Update checkout button state
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
    
    // Update cart modal if it's open
    if (document.getElementById('cartModal')?.classList.contains('active')) {
        renderCartItems();
    }
}

// Render cart items in modal
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSummary = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    cartItemsContainer.style.display = 'block';
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    cartItemsContainer.innerHTML = cart.map(item => {
        const imageUrl = item.image || item.img || 'assests/istockphoto-1184633031-612x612.jpg';
        console.log('Cart item:', item.name, 'Image URL:', imageUrl);
        return `
        <div class="cart-item">
            <img src="${imageUrl}" alt="${item.name}" class="cart-item-image" onerror="this.src='assests/istockphoto-1184633031-612x612.jpg'">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${item.price.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'}</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
                    <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
                </div>
            </div>
        </div>
    `;
    }).join('');
    
    // Update totals
    const totals = calculateCartTotals();
    const subtotalEl = document.getElementById('cartSubtotal');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    
    if (subtotalEl) subtotalEl.textContent = `${totals.subtotal} ${CONSTANTS.CURRENCY || 'JOD'}`;
    if (taxEl) taxEl.textContent = `${totals.tax} ${CONSTANTS.CURRENCY || 'JOD'}`;
    if (totalEl) totalEl.textContent = `${totals.total} ${CONSTANTS.CURRENCY || 'JOD'}`;
}

// ==================== MODAL MANAGEMENT ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// ==================== CONFIRMATION MODAL ====================

let confirmCallback = null;

function showConfirmModal(message, callback) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    
    if (!confirmModal || !confirmMessage) return;
    
    confirmMessage.textContent = message;
    confirmCallback = callback;
    openModal('confirmModal');
}

function initConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmYesBtn = document.getElementById('confirmYesBtn');
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', () => {
            closeModal('confirmModal');
            confirmCallback = null;
        });
    }
    
    if (confirmYesBtn) {
        confirmYesBtn.addEventListener('click', () => {
            if (confirmCallback) {
                confirmCallback();
            }
            closeModal('confirmModal');
            confirmCallback = null;
        });
    }
    
    // Close on overlay click
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                closeModal('confirmModal');
                confirmCallback = null;
            }
        });
    }
}

// ==================== DARK MODE ====================

function initDarkMode() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        });
    }
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ==================== CHECKOUT FORM ====================

function initCheckoutForm() {
    const checkoutForm = document.getElementById('checkoutForm');
    const completeOrderBtn = document.getElementById('completeOrderBtn');
    
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validate form
            const formData = new FormData(checkoutForm);
            const phone = formData.get('phone');
            
            // Validate Jordanian phone number
            if (!/^7\d{8}$/.test(phone)) {
                showToast(CONTENT.formError || 'Please enter a valid Jordanian phone number (9 digits, starts with 7)', 'error');
                return;
            }
            
            // Show processing state
            if (completeOrderBtn) {
                completeOrderBtn.textContent = CONTENT.processingOrderBtn || 'Processing...';
                completeOrderBtn.disabled = true;
            }
            
            // Prepare order data
            const orderData = {
                customer: {
                    name: formData.get('name'),
                    phone: `962${phone}`,
                    address: formData.get('address'),
                    city: formData.get('city'),
                    street: formData.get('street'),
                    building: formData.get('building'),
                    notes: formData.get('notes')
                },
                paymentMethod: formData.get('paymentMethod'),
                items: cart,
                totals: calculateCartTotals(),
                timestamp: new Date().toISOString()
            };
            
            // Google Sheets integration
            const scriptUrl = 'https://script.google.com/macros/s/AKfycbxgS55kSFxYvim4mEckm5_fVmgiNiwgDo817kxMCJWld6OFnu0MMRzSyvYiByRjjS561g/exec';
            
            fetch(scriptUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    functionName: 'processOrder',
                    orderData: orderData
                }),
                redirect: 'follow'
            })
            .then(response => {
                // With no-cors mode, we can't read the response properly
                // If we get here without a network error, assume success
                return { success: true, message: 'Order processed successfully' };
            })

            .then(result => {
                if (result.success) {
                    // Close checkout modal
                    closeModal('checkoutModal');
                    
                    // Show thank you modal
                    const trackOrderPhone = document.getElementById('trackOrderPhone');
                    if (trackOrderPhone) {
                        trackOrderPhone.textContent = orderData.customer.phone;
                    }
                    openModal('thankYouModal');
                    
                    // Clear cart
                    cart = [];
                    saveCart();
                    
                    // Reset form
                    checkoutForm.reset();
                } else {
                    showToast('Order failed: ' + result.error, 'error');
                }
            })
            .catch(error => {
                console.error('Error submitting order:', error);
                showToast('Order failed. Please try again.', 'error');
            })
            .finally(() => {
                // Reset button
                if (completeOrderBtn) {
                    completeOrderBtn.textContent = CONTENT.completeOrderBtn || 'Complete Order';
                    completeOrderBtn.disabled = false;
                }
            });
        });
    }
}

// ==================== CAROUSEL ====================

let carouselInterval = null;
let currentCarouselIndex = 0;

function initCarousel() {
    if (typeof CONTENT === 'undefined' || !CONTENT.specialOffers) return;
    
    const carouselTrack = document.getElementById('carouselTrack');
    const carouselDots = document.getElementById('carouselDots');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (!carouselTrack) return;
    
    const offers = CONTENT.specialOffers;
    
    // Render carousel items
    carouselTrack.innerHTML = offers.map(offer => `
        <div class="carousel-item">
            <div class="carousel-item-content" onclick="addToCart('${offer.id}', '${offer.name}', ${offer.price}, '${offer.img}')">
                <img src="${offer.img}" alt="${offer.name}" class="carousel-item-image">
                <div class="carousel-item-info">
                    <div class="carousel-item-name">${offer.name}</div>
                    <div class="carousel-item-price">
                        ${offer.discount ? `<span class="discount-badge">${offer.discount}</span>` : ''}
                        <span class="current-price">${offer.price.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'}</span>
                        ${offer.originalPrice ? `<span class="original-price">${offer.originalPrice.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'}</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Render dots
    if (carouselDots) {
        carouselDots.innerHTML = offers.map((_, index) => `
            <span class="carousel-dot ${index === 0 ? 'active' : ''}" onclick="goToCarouselSlide(${index})"></span>
        `).join('');
    }
    
    // Navigation buttons
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            goToCarouselSlide(currentCarouselIndex - 1);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            goToCarouselSlide(currentCarouselIndex + 1);
        });
    }
    
    // Auto-play
    startCarouselAutoPlay();
    
    // Pause on hover
    const carouselContainer = carouselTrack.parentElement;
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', stopCarouselAutoPlay);
        carouselContainer.addEventListener('mouseleave', startCarouselAutoPlay);
    }
}

function goToCarouselSlide(index) {
    const offers = CONTENT.specialOffers || [];
    if (offers.length === 0) return;
    
    if (index < 0) {
        currentCarouselIndex = offers.length - 1;
    } else if (index >= offers.length) {
        currentCarouselIndex = 0;
    } else {
        currentCarouselIndex = index;
    }
    
    const carouselTrack = document.getElementById('carouselTrack');
    if (carouselTrack) {
        carouselTrack.style.transform = `translateX(-${currentCarouselIndex * 100}%)`;
    }
    
    // Update dots
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentCarouselIndex);
    });
}

function startCarouselAutoPlay() {
    stopCarouselAutoPlay();
    const interval = CONSTANTS.CAROUSEL_AUTO_PLAY_INTERVAL || 5000; // Changed from 2500 to 5000ms (5 seconds)
    carouselInterval = setInterval(() => {
        goToCarouselSlide(currentCarouselIndex + 1);
    }, interval);
}

function stopCarouselAutoPlay() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

// ==================== BENEFITS SECTION ====================

function initBenefitsSection() {
    if (typeof CONTENT === 'undefined' || !CONTENT.benefits) return;
    
    const benefitsGrid = document.getElementById('benefitsGrid');
    if (!benefitsGrid) return;
    
    const icons = ['🚚', '⭐', '🔒', '↩️'];
    
    benefitsGrid.innerHTML = CONTENT.benefits.map((benefit, index) => `
        <div class="benefit-card">
            <div class="benefit-icon">${icons[index] || '✨'}</div>
            <h3 class="benefit-title">${benefit.title}</h3>
            <p class="benefit-description">${benefit.description}</p>
        </div>
    `).join('');
}

// ==================== NAVIGATION ====================

function initNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Order Now button in header
    const orderNowBtn = document.querySelector('.btn-order-now');
    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', () => {
            window.location.href = 'menu.html';
        });
    }
}

// ==================== MENU PAGE (API-DRIVEN) ====================

const MENU_ITEMS_PER_PAGE = 12;
let menuItems = [];
let filteredMenuItems = [];
let currentMenuPage = 1;
let currentCategory = 'ALL';
let currentSort = ''; // Default: no sorting, shows "Sort by price"

async function fetchMenuItems() {
    const endpoint = 'https://free-food-menus-api-two.vercel.app/burgers';
    const skeleton = document.getElementById('menuSkeleton');
    const grid = document.getElementById('menuGrid');
    const emptyState = document.getElementById('menuEmpty');
    const pagination = document.getElementById('menuPagination');

    if (skeleton) skeleton.style.display = 'grid';
    if (grid) grid.style.display = 'none';
    if (emptyState) emptyState.style.display = 'none';
    if (pagination) pagination.style.display = 'none';

    // Render skeleton cards (12)
    if (skeleton && !skeleton.innerHTML.trim()) {
        const skeletonCards = Array.from({ length: MENU_ITEMS_PER_PAGE })
            .map(() => `
                <div class="skeleton-card">
                    <div class="skeleton-image"></div>
                    <div class="skeleton-line short"></div>
                    <div class="skeleton-line medium"></div>
                    <div class="skeleton-line long"></div>
                </div>
            `).join('');
        skeleton.innerHTML = skeletonCards;
    }

    try {
        const response = await fetch(endpoint);
        const data = await response.json();

        menuItems = data.map(item => ({
            id: item.id,
            name: item.dsc,        // product name/description
            brand: item.name,      // used as category (brand)
            img: item.img,
            price: Number(item.price) || 0,
            rate: item.rate,
            country: item.country,
            description: item.dsc
        }));

        // Initialize filters and render
        initCategoryFilters();
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error fetching menu items', error);
        showToast('Failed to load menu. Please try again later.', 'error');
        if (skeleton) skeleton.style.display = 'none';
    }
}

function initCategoryFilters() {
    const container = document.getElementById('categoryFilters');
    if (!container || !menuItems.length) return;

    // Use country as category instead of brand (fewer categories)
    const countries = Array.from(new Set(menuItems.map(item => item.country))).sort();

    const buttonsHtml = [
        `<button class="filter-btn active" data-category="ALL">${CONTENT.categoryFilterAll || 'All'}</button>`,
        ...countries.map(country => `<button class="filter-btn" data-category="${country}">${country}</button>`)
    ].join('');

    container.innerHTML = buttonsHtml;

    // Show only first 12 categories (including "All" button)
    const buttons = container.querySelectorAll('.filter-btn');
    const maxVisibleCategories = 12; // Including "All" button
    
    if (buttons.length > maxVisibleCategories) {
        // Hide buttons after the 12th one
        buttons.forEach((btn, index) => {
            if (index >= maxVisibleCategories) {
                btn.classList.add('filter-btn-hidden');
            }
        });

        // Add show more/less button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'filter-btn-toggle';
        toggleBtn.textContent = CONTENT.showMoreCategories || 'Show more';
        toggleBtn.setAttribute('data-expanded', 'false');
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isExpanded = toggleBtn.getAttribute('data-expanded') === 'true';
            
            buttons.forEach((btn, index) => {
                if (index >= maxVisibleCategories) {
                    if (isExpanded) {
                        btn.classList.add('filter-btn-hidden');
                    } else {
                        btn.classList.remove('filter-btn-hidden');
                    }
                }
            });
            
            toggleBtn.setAttribute('data-expanded', !isExpanded);
            toggleBtn.textContent = isExpanded 
                ? (CONTENT.showMoreCategories || 'Show more')
                : (CONTENT.showLessCategories || 'Show less');
        });
        
        container.appendChild(toggleBtn);
    }

    container.addEventListener('click', (e) => {
        const btn = e.target.closest('.filter-btn');
        if (!btn) return;

        const category = btn.getAttribute('data-category');
        currentCategory = category;
        currentMenuPage = 1;

        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        applyFiltersAndSort();
        scrollToMenuTop();
    });
}

function initMenuSorting() {
    const select = document.getElementById('priceSort');
    if (!select) return;

    // Ensure default option is selected (shows "Sort by price")
    // Set value to empty string to show the default option
    if (!currentSort || currentSort === '') {
        select.value = '';
        // Explicitly select the first option (default)
        select.selectedIndex = 0;
    } else {
        select.value = currentSort;
    }

    select.addEventListener('change', () => {
        const selectedValue = select.value;
        // If default option is selected, don't apply sorting
        if (selectedValue === '' || selectedValue === null) {
            currentSort = '';
            select.selectedIndex = 0; // Reset to default option
            applyFiltersAndSort();
            return;
        }
        currentSort = selectedValue;
        currentMenuPage = 1;
        applyFiltersAndSort();
        scrollToMenuTop();
    });
}

function applyFiltersAndSort() {
    // Filter by country (category)
    if (currentCategory === 'ALL') {
        filteredMenuItems = [...menuItems];
    } else {
        filteredMenuItems = menuItems.filter(item => item.country === currentCategory);
    }

    // Sort
    if (currentSort === 'price-asc') {
        filteredMenuItems.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filteredMenuItems.sort((a, b) => b.price - a.price);
    }

    renderMenuGrid();
    renderMenuPagination();
}

function renderMenuGrid() {
    const grid = document.getElementById('menuGrid');
    const skeleton = document.getElementById('menuSkeleton');
    const emptyState = document.getElementById('menuEmpty');

    if (!grid) return;

    if (skeleton) skeleton.style.display = 'none';

    if (!filteredMenuItems.length) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (emptyState) emptyState.style.display = 'block';
        return;
    }

    if (emptyState) emptyState.style.display = 'none';
    grid.style.display = 'grid';

    const start = (currentMenuPage - 1) * MENU_ITEMS_PER_PAGE;
    const end = start + MENU_ITEMS_PER_PAGE;
    const pageItems = filteredMenuItems.slice(start, end);

    grid.innerHTML = pageItems.map(item => {
        const existing = cart.find(c => c.id === item.id);
        const desc = item.description.length > 50
            ? item.description.slice(0, 50) + '...'
            : item.description;

        // Debug: Check image URL
        const imageUrl = item.img ? item.img.replace(/\\u0026/g, '&') : 'assests/istockphoto-1184633031-612x612.jpg';
        console.log('Product:', item.name, 'Image URL:', imageUrl);

        return `
            <article class="menu-card" data-id="${item.id}">
                <div class="menu-card-image-wrapper">
                    <img src="${imageUrl}" alt="${item.name}" class="menu-card-image" onerror="this.src='assests/istockphoto-1184633031-612x612.jpg'">
                </div>
                <div class="menu-card-content">
                    <h3 class="menu-card-name">${item.name}</h3>
                    <p class="menu-card-brand">${item.brand}</p>
                    <p class="menu-card-price">${item.price.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'}</p>
                    <p class="menu-card-desc">${desc}</p>
                    <div class="menu-card-footer">
                        ${existing ? `
                            <div class="menu-qty-group" data-id="${item.id}">
                                <button class="menu-qty-btn" data-action="decrease">-</button>
                                <span class="menu-qty-value">${existing.quantity}</span>
                                <button class="menu-qty-btn" data-action="increase">+</button>
                            </div>
                        ` : `
                            <button class="btn btn-primary menu-add-btn" data-id="${item.id}">${CONTENT.orderNowBtn || 'Add to cart'}</button>
                        `}
                    </div>
                </div>
            </article>
        `;
    }).join('');

    // Event delegation for card interactions
    grid.addEventListener('click', onMenuGridClick);
}

function onMenuGridClick(e) {
    const addBtn = e.target.closest('.menu-add-btn');
    const qtyBtn = e.target.closest('.menu-qty-btn');
    const card = e.target.closest('.menu-card');

    // Add to cart button
    if (addBtn) {
        e.stopPropagation();
        const id = addBtn.getAttribute('data-id');
        const product = menuItems.find(item => item.id === id);
        if (product) {
            addToCart(product.id, product.name, product.price, product.img);
            applyFiltersAndSort(); // re-render to show qty controls
        }
        return;
    }

    // Quantity controls
    if (qtyBtn) {
        e.stopPropagation();
        const group = qtyBtn.closest('.menu-qty-group');
        const id = group.getAttribute('data-id');
        const action = qtyBtn.getAttribute('data-action');
        const existing = cart.find(c => c.id === id);
        if (!existing) return;

        let newQty = existing.quantity + (action === 'increase' ? 1 : -1);
        if (newQty < 1) {
            // Will trigger confirmation modal via removeFromCart
            // Pass a callback to refresh menu after removal
            removeFromCart(id, false, () => {
                applyFiltersAndSort(); // re-render after removal
            });
        } else {
            updateCartQuantity(id, newQty);
            applyFiltersAndSort(); // re-render
        }
        return;
    }

    // Card click → go to product details
    if (card) {
        const id = card.getAttribute('data-id');
        window.location.href = `product-details.html?id=${encodeURIComponent(id)}`;
    }
}

function renderMenuPagination() {
    const pagination = document.getElementById('menuPagination');
    if (!pagination) return;

    const totalItems = filteredMenuItems.length;
    const totalPages = Math.ceil(totalItems / MENU_ITEMS_PER_PAGE) || 1;

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        pagination.style.display = 'none';
        return;
    }

    pagination.style.display = 'flex';

    let buttons = '';

    // First page button (<<)
    buttons += `
        <button class="page-btn ${currentMenuPage === 1 ? 'disabled' : ''}" data-page="first" title="First page">
            &lt;&lt;
        </button>
    `;

    // Previous button (<)
    buttons += `
        <button class="page-btn ${currentMenuPage === 1 ? 'disabled' : ''}" data-page="prev" title="Previous page">
            ‹
        </button>
    `;

    // Smart page numbers: show first 2, ..., last page
    if (totalPages <= 3) {
        // Show all pages if 3 or fewer
        for (let i = 1; i <= totalPages; i++) {
            buttons += `
                <button class="page-btn ${i === currentMenuPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
    } else {
        // Smart pagination: 1 2 ... last
        // Always show first page
        buttons += `
            <button class="page-btn ${1 === currentMenuPage ? 'active' : ''}" data-page="1">
                1
            </button>
        `;

        // Show second page if current page is near the beginning
        if (currentMenuPage <= 3) {
            buttons += `
                <button class="page-btn ${2 === currentMenuPage ? 'active' : ''}" data-page="2">
                    2
                </button>
            `;
        }

        // Show ellipsis after page 2 if current page is far from start
        if (currentMenuPage > 3) {
            buttons += `<span class="page-ellipsis">...</span>`;
        }

        // Show current page if it's not 1, 2, or last
        if (currentMenuPage > 2 && currentMenuPage < totalPages) {
            buttons += `
                <button class="page-btn active" data-page="${currentMenuPage}">
                    ${currentMenuPage}
                </button>
            `;
        }

        // Show ellipsis before last page if current page is not near the end
        // Only show if we're not already showing current page right before last
        if (currentMenuPage < totalPages - 1 && currentMenuPage <= 2) {
            // Show ellipsis when on pages 1-2 and there's a gap
            buttons += `<span class="page-ellipsis">...</span>`;
        } else if (currentMenuPage < totalPages - 2 && currentMenuPage > 3) {
            // Show ellipsis when current page is in the middle
            buttons += `<span class="page-ellipsis">...</span>`;
        }

        // Always show last page
        buttons += `
            <button class="page-btn ${totalPages === currentMenuPage ? 'active' : ''}" data-page="${totalPages}">
                ${totalPages}
            </button>
        `;
    }

    // Next button (>)
    buttons += `
        <button class="page-btn ${currentMenuPage === totalPages ? 'disabled' : ''}" data-page="next" title="Next page">
            ›
        </button>
    `;

    // Last page button (>>)
    buttons += `
        <button class="page-btn ${currentMenuPage === totalPages ? 'disabled' : ''}" data-page="last" title="Last page">
            &gt;&gt;
        </button>
    `;

    pagination.innerHTML = buttons;

    pagination.onclick = (e) => {
        const btn = e.target.closest('.page-btn');
        if (!btn || btn.classList.contains('disabled')) return;

        const page = btn.getAttribute('data-page');
        const totalPagesInner = Math.ceil(filteredMenuItems.length / MENU_ITEMS_PER_PAGE) || 1;

        if (page === 'first') {
            currentMenuPage = 1;
        } else if (page === 'prev') {
            currentMenuPage = Math.max(1, currentMenuPage - 1);
        } else if (page === 'next') {
            currentMenuPage = Math.min(totalPagesInner, currentMenuPage + 1);
        } else if (page === 'last') {
            currentMenuPage = totalPagesInner;
        } else {
            currentMenuPage = parseInt(page, 10);
        }

        applyFiltersAndSort();
        scrollToMenuTop();
    };
}

function scrollToMenuTop() {
    const menuSection = document.querySelector('.menu-page');
    if (menuSection) {
        menuSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==================== HOME PAGE INITIALIZATION ====================

function initHomePage() {
    // Load content
    loadContent();
    
    // Initialize cart
    loadCart();
    
    // Initialize dark mode
    initDarkMode();
    
    // Initialize carousel
    initCarousel();
    
    // Initialize benefits section
    initBenefitsSection();
    
    // Initialize navigation
    initNavigation();
    
    // Initialize checkout form
    initCheckoutForm();
    
    // Initialize confirmation modal
    initConfirmModal();
    
    // Cart modal handlers
    const cartIconBtn = document.getElementById('cartIconBtn');
    const closeCartModal = document.getElementById('closeCartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', () => {
            renderCartItems();
            openModal('cartModal');
        });
    }
    
    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => closeModal('cartModal'));
    }
    
    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => closeModal('cartModal'));
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                closeModal('cartModal');
                openModal('checkoutModal');
            }
        });
    }
    
    // Checkout modal handlers
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');
    
    if (closeCheckoutModal) {
        closeCheckoutModal.addEventListener('click', () => closeModal('checkoutModal'));
    }
    
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => closeModal('checkoutModal'));
    }
    
    // Thank you modal handler
    const closeThankYouModal = document.getElementById('closeThankYouModal');
    if (closeThankYouModal) {
        closeThankYouModal.addEventListener('click', () => {
            closeModal('thankYouModal');
        });
    }
}

// ==================== MENU PAGE INITIALIZATION ====================

function initMenuPage() {
    // Load content
    loadContent();

    // Initialize cart & dark mode
    loadCart();
    initDarkMode();

    // Navigation & checkout form shared
    initNavigation();
    initCheckoutForm();
    initConfirmModal();

    // Menu-specific
    initMenuSorting();
    fetchMenuItems();

    // Cart modal handlers (same as home)
    const cartIconBtn = document.getElementById('cartIconBtn');
    const closeCartModal = document.getElementById('closeCartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', () => {
            renderCartItems();
            openModal('cartModal');
        });
    }

    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => closeModal('cartModal'));
    }

    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => closeModal('cartModal'));
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                closeModal('cartModal');
                openModal('checkoutModal');
            }
        });
    }

    // Checkout modal handlers
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');

    if (closeCheckoutModal) {
        closeCheckoutModal.addEventListener('click', () => closeModal('checkoutModal'));
    }

    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => closeModal('checkoutModal'));
    }

    // Thank you modal handler
    const closeThankYouModal = document.getElementById('closeThankYouModal');
    if (closeThankYouModal) {
        closeThankYouModal.addEventListener('click', () => {
            closeModal('thankYouModal');
        });
    }
}

// ==================== PRODUCT DETAILS PAGE ====================

let currentProduct = null;

async function initProductDetailsPage() {
    // Load content
    loadContent();
    
    // Initialize cart & dark mode
    loadCart();
    initDarkMode();
    
    // Initialize shared components
    initNavigation();
    initCheckoutForm();
    initConfirmModal();
    
    // Cart modal handlers
    initCartModalHandlers();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        showProductError();
        return;
    }
    
    // Load product details
    await loadProductDetails(productId);
    
    // Initialize quantity controls
    initQuantityControls();
    
    // Initialize add to cart button
    initAddToCartButton();
}

async function loadProductDetails(productId) {
    const loadingEl = document.getElementById('productLoading');
    const containerEl = document.getElementById('productDetailsContainer');
    const errorEl = document.getElementById('productError');
    
    // Show loading state
    if (loadingEl) loadingEl.style.display = 'block';
    if (containerEl) containerEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'none';
    
    try {
        // First try to get from menuItems if already loaded
        if (menuItems.length === 0) {
            // Fetch menu items if not already loaded
            await fetchMenuItems();
        }
        
        const product = menuItems.find(item => item.id === productId);
        
        if (!product) {
            showProductError();
            return;
        }
        
        currentProduct = product;
        renderProductDetails(product);
        
        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'block';
        
    } catch (error) {
        console.error('Error loading product details:', error);
        showProductError();
    }
}

function renderProductDetails(product) {
    // Update breadcrumb
    const productNameEl = document.getElementById('productName');
    if (productNameEl) productNameEl.textContent = product.name;
    
    // Update page title
    document.title = `${product.name} - Restaurant`;
    
    // Product image
    const productImageEl = document.getElementById('productImage');
    if (productImageEl) {
        productImageEl.src = product.img ? product.img.replace(/\\u0026/g, '&') : 'assests/istockphoto-1184633031-612x612.jpg';
        productImageEl.alt = product.name;
        productImageEl.onerror = function() {
            this.src = 'assests/istockphoto-1184633031-612x612.jpg';
        };
    }
    
    // Product info
    const productTitleEl = document.getElementById('productTitle');
    const productBrandEl = document.getElementById('productBrand');
    const productPriceEl = document.getElementById('productPrice');
    const productDescriptionEl = document.getElementById('productDescription');
    const productOriginEl = document.getElementById('productOrigin');
    
    if (productTitleEl) productTitleEl.textContent = product.name;
    if (productBrandEl) productBrandEl.textContent = product.brand;
    if (productPriceEl) productPriceEl.textContent = `${product.price.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'}`;
    if (productDescriptionEl) productDescriptionEl.textContent = product.description;
    if (productOriginEl) productOriginEl.textContent = `Origin: ${product.country}`;
    
    // Rating
    renderProductRating(product.rate);
    
    // Update button price
    updateAddToCartButtonPrice();
    
    // Check if product is already in cart
    updateAddToCartButtonState();
}

function renderProductRating(rate) {
    const ratingStarsEl = document.getElementById('ratingStars');
    const ratingValueEl = document.getElementById('ratingValue');
    
    if (ratingStarsEl && ratingValueEl && rate) {
        const fullStars = Math.floor(rate);
        const hasHalfStar = rate % 1 >= 0.5;
        
        let starsHTML = '';
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '⭐';
        }
        if (hasHalfStar) {
            starsHTML += '✨';
        }
        
        ratingStarsEl.innerHTML = starsHTML;
        ratingValueEl.textContent = rate.toFixed(1);
    }
}

function initQuantityControls() {
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantitySelect');
    
    if (!decreaseBtn || !increaseBtn || !quantityInput) return;
    
    decreaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
            updateQuantityButtons();
            updateAddToCartButtonPrice();
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        const currentValue = parseInt(quantityInput.value);
        if (currentValue < 99) {
            quantityInput.value = currentValue + 1;
            updateQuantityButtons();
            updateAddToCartButtonPrice();
        }
    });
}

function updateQuantityButtons() {
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('quantitySelect');
    
    if (!decreaseBtn || !increaseBtn || !quantityInput) return;
    
    const value = parseInt(quantityInput.value);
    decreaseBtn.disabled = value <= 1;
    increaseBtn.disabled = value >= 99;
}

function updateAddToCartButtonPrice() {
    const btnPriceEl = document.getElementById('btnPrice');
    const quantityInput = document.getElementById('quantitySelect');
    
    if (!btnPriceEl || !quantityInput || !currentProduct) return;
    
    const quantity = parseInt(quantityInput.value);
    const totalPrice = currentProduct.price * quantity;
    btnPriceEl.textContent = `(${totalPrice.toFixed(2)} ${CONSTANTS.CURRENCY || 'JOD'})`;
}

function updateAddToCartButtonState() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const quantityInput = document.getElementById('quantitySelect');
    
    if (!addToCartBtn || !quantityInput || !currentProduct) return;
    
    const existingItem = cart.find(item => item.id === currentProduct.id);
    
    if (existingItem) {
        quantityInput.value = existingItem.quantity;
        addToCartBtn.innerHTML = `
            <span class="btn-text">Update Quantity</span>
            <span class="btn-price" id="btnPrice"></span>
        `;
    } else {
        quantityInput.value = 1;
        addToCartBtn.innerHTML = `
            <span class="btn-text" data-content="addToCartBtn">Add to Cart</span>
            <span class="btn-price" id="btnPrice"></span>
        `;
    }
    
    updateQuantityButtons();
    updateAddToCartButtonPrice();
}

function initAddToCartButton() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    
    if (!addToCartBtn || !currentProduct) return;
    
    addToCartBtn.addEventListener('click', () => {
        const quantityInput = document.getElementById('quantitySelect');
        const quantity = parseInt(quantityInput.value);
        
        const existingItem = cart.find(item => item.id === currentProduct.id);
        
        if (existingItem) {
            // Update existing item quantity
            updateCartQuantity(currentProduct.id, quantity);
        } else {
            // Add new item
            for (let i = 0; i < quantity; i++) {
                addToCart(currentProduct.id, currentProduct.name, currentProduct.price, currentProduct.img);
            }
        }
        
        // Update button state
        updateAddToCartButtonState();
    });
}

function showProductError() {
    const loadingEl = document.getElementById('productLoading');
    const containerEl = document.getElementById('productDetailsContainer');
    const errorEl = document.getElementById('productError');
    
    if (loadingEl) loadingEl.style.display = 'none';
    if (containerEl) containerEl.style.display = 'none';
    if (errorEl) errorEl.style.display = 'block';
}

function initCartModalHandlers() {
    const cartIconBtn = document.getElementById('cartIconBtn');
    const closeCartModal = document.getElementById('closeCartModal');
    const closeCartModalBtn = document.getElementById('closeCartModalBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', () => {
            renderCartItems();
            openModal('cartModal');
        });
    }

    if (closeCartModal) {
        closeCartModal.addEventListener('click', () => closeModal('cartModal'));
    }

    if (closeCartModalBtn) {
        closeCartModalBtn.addEventListener('click', () => closeModal('cartModal'));
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                closeModal('cartModal');
                openModal('checkoutModal');
            }
        });
    }

    // Checkout modal handlers
    const closeCheckoutModal = document.getElementById('closeCheckoutModal');
    const cancelCheckoutBtn = document.getElementById('cancelCheckoutBtn');

    if (closeCheckoutModal) {
        closeCheckoutModal.addEventListener('click', () => closeModal('checkoutModal'));
    }

    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', () => closeModal('checkoutModal'));
    }

    // Thank you modal handler
    const closeThankYouModal = document.getElementById('closeThankYouModal');
    if (closeThankYouModal) {
        closeThankYouModal.addEventListener('click', () => {
            closeModal('thankYouModal');
        });
    }
}

// Make functions globally available for onclick handlers
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.goToCarouselSlide = goToCarouselSlide;
