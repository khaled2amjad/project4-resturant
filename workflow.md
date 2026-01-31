i want to build a resturant online ordering system
consist of 3 pages:
1. home page(landing page)
2. menu page
3. product details page

***home page will have:
1-header :
a-logo (when clicked it takes to home page)
b-"order now" CTA when click it takes to menu page
c-color mode toggle (light and dark mode)
d-cart icon:
when clicked it will open a modal containing:
-the cart items
-total price will be calculated automatically
-delivery fee will be added automatically(2.5 jod)
-tax will be added automatically(16%)
checkout button:
when clicked it will open a modal containing:
(checkout form)
form details:
-name
-phone(accept jordanian phone number only,start with 7,9 digits)
-address(i cane use google maps or any maps api to get the address)
-city
-street
-building number(accept numers only)
-additional notes
-payment method:
*cash on delivery
*online payment

-complete order cta:
when clicked it will open a modal containing:
-thank you message"Thank You!
Your order has been received successfully. We will process it shortly."
-track order note"Track your order
To track your order progress, please check your WhatsApp at" the number entered in the phone field automatically started with 962

*when clicking on complete order (integration with google sheets will occur to save the data of the order)
*the sheet should work as management system for the orders, and send notifications to the customer whatsapp when the order status is updated:
-in progress "مرحبا, طلبك قيد التنفيذ سيتم ابلاغك عندما يخرج للتوصيل, استعد لوجبتك اللذيذة!"
-out for delivary "مرحبا, الطلب في طريقه اليك"
-delivered "لقد وصلك الطلب. صحتين! أخبرنا كيف كانت الوجبة؟ ننتظر طلبك القادم بحماس!"

*after clicking complete order button and during the process of integration with google sheets, the cta will show "Processing..." instead of "Complete Order"

*pop up confermation message "Minimum quantity is 1. Do you want to remove this item from cart?" will appear when customer want to remove the item from the cart or reduse the quantity less than 1 (everywhere in the system)
*i can remove items, update quantity, and checkout
*when clicking home navlink move to home page
*when clicking menu navlink move to our menu page


2-footer:
Policies
Privacy Policy
Terms of Service
Refund Policy
Contact & Support
Phone: +962 7 1234 5678
Email: info@restaurant.com
Amman, Jordan
Follow Us
📘
📷
🐦
Hours
Mon - Fri: 10:00 AM - 10:00 PM
Sat - Sun: 11:00 AM - 11:00 PM
© 2026 Restaurant. All rights reserved.



3-main section:
a-hero section:
-restaurant image
-title"Delicious Food, Delivered Fresh"
-subtitle"Experience the finest flavors in town"
-CTA"Order Now" when click it takes to menu page

b-navigation (it will be under the hero not in the header):
-home
-menu
-about
-contact
*when clicking home navlink move to home page
*when clicking menu navlink move to our menu page
*when clicking about navlink move to about (in the footer)
*when clicking contact navlink move to contact (in the footer)

c-special offers carousel-slider:
-3 special offers, when click on any special offer it add the product to the cart
*it should be auto-playing


d-benefits section(Why Choose Us):
-4 cards of benefits:
-1st card:Fast Delivery "Fresh food delivered to your door in 30 minutes or less"
-2nd card:Quality Guaranteed "Only the finest ingredients prepared with care"
-3rd card:Secure Payment "Safe and secure payment options available"
-4th card:Easy Returns "100% satisfaction guarantee or your money back"

e-ready to order section:
-title"Ready to Order?"
-subtitle"Check out our full menu and place your order now"
-CTA"view menu" when click it takes to menu page

***menu page will have:
-buttons for category sorting
-sorting by price 
-cards containing products details (image, name, price, description(50 characters max,three dots if more than 50 characters),add to cart button)
*when open menu page and during loading the data from the api show a loading spinner
*when clicking add to cart button it will add the product to the cart and turn the "add to cart" button to update the quantity ,if the customer want to reduce the quantity less than 1 after confirmation it will remove the item from the cart and turn the button to "add to cart"
*cards size should be equal and constant for all cards, and the distances between the card components should also be constant.

-pagination:
-12 (4*3 grid) items per page
-page numbers buttons with current page highlighted
-previous and next buttons when clicked it will go to the top of previous or the top of next page

*when clicking on the product it will open a product details page

***product details page has:
-product image
-product name
-product price
-product ingredients
-product clories(optional)
-rating(optional)
-add to cart section:
-quantity selector
-add to cart button:
-if the product is already in the cart it will update the quantity
-when clicking add to cart button it will add the product to the cart and turn the button to update the quantity ,if the customer want to reduce the quantity less than 1 after confirmation it will remove the item from the cart and turn the button to add to cart

*all alert/confirmation/error messages in the website should be toast messages
*we will use api to get the menu items and categories
*we will use stripe to handle the payment(optionally)
*we will use google sheets to save the data of the order