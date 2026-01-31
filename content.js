// Content.js - All static text content for the website



const CONTENT = {

    // Hero Section

    heroTitle: "Delicious Food, Delivered Fresh",

    heroSubtitle: "Experience the finest flavors in town",

    orderNowBtn: "Add to cart",

    

    // Navigation

    homeNav: "Home",

    menuNav: "Menu",

    aboutNav: "About",

    contactNav: "Contact",

    

    // Special Offers (using actual products with images and discounts)

    specialOffers: [

        {

            id: "the-gramercy-tavern-burger-4-pack",

            name: "Gramercy Tavern Burger - 25% OFF",

            originalPrice: 15.99,

            price: 11.99,

            discount: "25% OFF",

            img: "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/79492/mesquite-smoked-brisket-burger-patties-hot-links-dry-rub.41cbe9a5d29f1a4ef3491ab6eb8713a5.jpg?ixlib=react-9.0.2&auto=format&ar=1:1",

            description: "Premium Gramercy Tavern Burger - Limited time offer!"

        },

        {

            id: "hatch-green-chile-cheeseburger-kit-6-pack",

            name: "Sparky's Green Chile Burgers - 20% OFF",

            originalPrice: 109,

            price: 87.20,

            discount: "20% OFF",

            img: "https://goldbelly.imgix.net/uploads/product_image/image/25753/green-chile-cheeseburger-6-pack.f3b980b43c8661e8fac3634b082668a5.jpg?ixlib=react-9.0.2&auto=format&ar=1:1",

            description: "Hatch Green Chile Cheeseburger Kit - Spicy and delicious!"

        },

        {

            id: "juicy-lucy-burger-kit-10-pack",

            name: "Whitmans Juicy Lucy - 30% OFF",

            originalPrice: 129,

            price: 90.30,

            discount: "30% OFF",

            img: "https://goldbelly.imgix.net/uploads/showcase_media_asset/image/105731/juicy-lucy-burger-kit-10-pack.41d77903b061d6c6b080f990b4ad2fb7.jpg?ixlib=react-9.0.2&auto=format&ar=1:1",

            description: "Famous Juicy Lucy Burger Kit - Best deal in town!"

        }

    ],

    

    // Benefits Section

    benefitsTitle: "Why Choose Us",

    benefits: [

        {

            title: "Fast Delivery",

            description: "Fresh food delivered to your door in 30 minutes or less"

        },

        {

            title: "Quality Guaranteed",

            description: "Only the finest ingredients prepared with care"

        },

        {

            title: "Secure Payment",

            description: "Safe and secure payment options available"

        },

        {

            title: "Easy Returns",

            description: "100% satisfaction guarantee or your money back"

        }

    ],

    

    // Ready to Order Section (Home)

    readyTitle: "Ready to Order?",

    readySubtitle: "Check out our full menu and place your order now",

    viewMenuBtn: "View Menu",



    // Menu Page

    menuTitle: "Our Menu",

    menuSubtitle: "Browse our delicious burgers and choose your favorites",

    categoryFilterLabel: "Filter by brand:",

    categoryFilterAll: "All",

    showMoreCategories: "Show more",

    showLessCategories: "Show less",

    sortDefault: "Sort by price",

    sortLowHigh: "Price: Low to High",

    sortHighLow: "Price: High to Low",

    menuLoadingMessage: "Loading menu...",

    menuEmptyMessage: "No products to display",

    

    // Cart Modal

    cartTitle: "Your Cart",

    cartEmptyMessage: "Your cart is empty. Start adding items!",

    subtotalLabel: "Subtotal",

    deliveryFeeLabel: "Delivery Fee",

    taxLabel: "Tax (16%)",

    totalLabel: "Total",

    continueShopping: "Continue Shopping",

    checkoutBtn: "Checkout",

    

    // Checkout Form

    checkoutTitle: "Checkout",

    nameLabel: "Name",

    phoneLabel: "Phone",

    phoneHint: "Jordanian phone number (9 digits, starts with 7)",

    addressLabel: "Address",

    cityLabel: "City",

    streetLabel: "Street",

    buildingLabel: "Building Number",

    buildingHint: "Numbers only",

    notesLabel: "Additional Notes",

    paymentMethodLabel: "Payment Method",

    cashOnDelivery: "Cash on Delivery",

    onlinePayment: "Online Payment",

    cancelBtn: "Cancel",

    completeOrderBtn: "Complete Order",

    processingOrderBtn: "Processing...",

    

    // Thank You Modal

    thankYouTitle: "Thank You!",

    thankYouMessage: "Your order has been received successfully. We will process it shortly.",

    trackOrderNote: "Track your order. To track your order progress, please check your WhatsApp at",

    closeBtn: "Close",

    

    // Confirmation Messages

    removeItemConfirm: "Minimum quantity is 1. Do you want to remove this item from cart?",

    confirmTitle: "Confirm Action",

    confirmCancelBtn: "Cancel",

    confirmYesBtn: "Yes, Remove",

    

    // Toast Messages

    itemAdded: "Item added to cart",

    itemRemoved: "Item removed from cart",

    quantityUpdated: "Quantity updated",

    formError: "Please fill in all required fields correctly",

    

    // Footer

    policiesTitle: "Policies",

    privacyPolicy: "Privacy Policy",

    termsOfService: "Terms of Service",

    refundPolicy: "Refund Policy",

    contactTitle: "Contact & Support",

    phone: "Phone: +962 7 1234 5678",

    email: "Email: info@restaurant.com",

    location: "Amman, Jordan",

    followUsTitle: "Follow Us",

    hoursTitle: "Hours",

    hoursWeekday: "Mon - Fri: 10:00 AM - 10:00 PM",

    hoursWeekend: "Sat - Sun: 11:00 AM - 11:00 PM",

    copyright: "© 2026 Restaurant. All rights reserved."

};



// Constants

const CONSTANTS = {

    DELIVERY_FEE: 2.5,

    TAX_RATE: 0.16,

    CAROUSEL_AUTO_PLAY_INTERVAL: 2500, // 2.5 seconds

    CURRENCY: "JOD"

};

