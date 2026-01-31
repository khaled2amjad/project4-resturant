# Google Sheets Apps Script Setup for Restaurant Order Management

This guide will help you set up Google Sheets with Apps Script to manage restaurant orders and store order data in a spreadsheet.

## 📋 Prerequisites

- A Google Account
- Basic understanding of Google Sheets

## 🚀 Step-by-Step Setup

### 1. Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Click "Create new spreadsheet"
3. Name it "Restaurant Orders Management"
4. Create the following sheets:

#### Sheet 1: "Orders"
Create these columns in order:
```
A: Order ID
B: Timestamp
C: Customer Name
D: Customer Phone
E: Customer Address
F: City
G: Street
H: Building Number
I: Payment Method
J: Order Status
K: Total Amount
L: Items (JSON)
M: Notes
N: Created Date
O: Updated Date
```

#### Sheet 2: "Settings"
Create these columns:
```
A: Setting Name
B: Setting Value
```

Add these settings:
```
Restaurant_Name, THE GRILLHOUSE
Currency, JOD
Delivery_Fee, 2.5
Tax_Rate, 0.16
```

### 2. Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. This will open the Apps Script editor
3. Delete any existing code in the `Code.gs` file

### 3. Add the Apps Script Code

Copy and paste the following code into the Apps Script editor:

```javascript
// Global constants
const SHEET_NAME_ORDERS = "Orders";
const SHEET_NAME_SETTINGS = "Settings";

/**
 * Main function to handle incoming order data
 * @param {Object} orderData - Order data from website
 * @returns {Object} Response with order ID and status
 */
function processOrder(orderData) {
  try {
    // Generate unique order ID
    const orderId = generateOrderId();
    
    // Get orders sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
    
    // Prepare order data for sheet
    const orderRow = [
      orderId,
      new Date(),
      orderData.customer.name,
      orderData.customer.phone,
      orderData.customer.address,
      orderData.customer.city,
      orderData.customer.street,
      orderData.customer.building,
      orderData.paymentMethod,
      "received", // Initial status
      orderData.totals.total,
      JSON.stringify(orderData.items),
      orderData.customer.notes || "",
      new Date(),
      new Date()
    ];
    
    // Add order to sheet
    sheet.appendRow(orderRow);
    
    // Return success response
    return {
      success: true,
      orderId: orderId,
      message: "Order processed successfully"
    };
    
  } catch (error) {
    Logger.log("Error processing order: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Generate unique order ID
 * @returns {string} Unique order ID
 */
function generateOrderId() {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return "ORD" + timestamp + random;
}

/**
 * Get settings from Settings sheet
 * @returns {Object} Settings object
 */
function getSettings() {
  const settings = {};
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_SETTINGS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }
  
  return settings;
}

/**
 * Update order status
 * @param {string} orderId - Order ID
 * @param {string} newStatus - New order status
 * @returns {Object} Response
 */
function updateOrderStatus(orderId, newStatus) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === orderId) {
        // Update status
        sheet.getRange(i + 1, 10, 1, 1).setValue(newStatus); // Column J (Order Status)
        sheet.getRange(i + 1, 15, 1, 1).setValue(new Date()); // Column O (Updated Date)
        
        return {
          success: true,
          message: "Order status updated successfully"
        };
      }
    }
    
    return {
      success: false,
      error: "Order not found"
    };
    
  } catch (error) {
    Logger.log("Error updating order status: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * Get all orders
 * @param {string} status - Optional status filter
 * @returns {Array} Array of orders
 */
function getOrders(status = null) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS);
    const data = sheet.getDataRange().getValues();
    const orders = [];
    
    for (let i = 1; i < data.length; i++) {
      const order = {
        orderId: data[i][0],
        timestamp: data[i][1],
        customerName: data[i][2],
        customerPhone: data[i][3],
        customerAddress: data[i][4],
        city: data[i][5],
        street: data[i][6],
        buildingNumber: data[i][7],
        paymentMethod: data[i][8],
        orderStatus: data[i][9],
        totalAmount: data[i][10],
        items: data[i][11],
        notes: data[i][12],
        createdDate: data[i][13],
        updatedDate: data[i][14]
      };
      
      if (!status || order.orderStatus === status) {
        orders.push(order);
      }
    }
    
    return orders;
    
  } catch (error) {
    Logger.log("Error getting orders: " + error.toString());
    return [];
  }
}

/**
 * Create menu for order management
 * @returns {string} HTML menu
 */
function createOrderMenu() {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <title>Order Management</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .order-card { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
        .status-received { background-color: #fff3cd; }
        .status-in_progress { background-color: #cce5ff; }
        .status-out_for_delivery { background-color: #d4edda; }
        .status-delivered { background-color: #f8d7da; }
        button { margin: 5px; padding: 8px 15px; cursor: pointer; }
        .btn-primary { background-color: #007bff; color: white; border: none; }
        .btn-success { background-color: #28a745; color: white; border: none; }
        .btn-warning { background-color: #ffc107; color: black; border: none; }
      </style>
    </head>
    <body>
      <h1>Restaurant Order Management</h1>
      <div id="orders"></div>
      
      <script>
        function loadOrders() {
          google.script.run.withSuccessHandler(function(orders) {
            const container = document.getElementById('orders');
            container.innerHTML = '';
            
            orders.forEach(function(order) {
              const orderDiv = document.createElement('div');
              orderDiv.className = 'order-card status-' + order.orderStatus;
              orderDiv.innerHTML = 
                '<h3>Order: ' + order.orderId + '</h3>' +
                '<p><strong>Customer:</strong> ' + order.customerName + '</p>' +
                '<p><strong>Phone:</strong> ' + order.customerPhone + '</p>' +
                '<p><strong>Status:</strong> ' + order.orderStatus + '</p>' +
                '<p><strong>Total:</strong> ' + order.totalAmount + ' JOD</p>' +
                '<div>' +
                  '<button class="btn-primary" onclick="updateStatus(\'' + order.orderId + '\', \'in_progress\')">In Progress</button>' +
                  '<button class="btn-warning" onclick="updateStatus(\'' + order.orderId + '\', \'out_for_delivery\')">Out for Delivery</button>' +
                  '<button class="btn-success" onclick="updateStatus(\'' + order.orderId + '\', \'delivered\')">Delivered</button>' +
                '</div>';
              container.appendChild(orderDiv);
            });
          }).getOrders();
        }
        
        function updateStatus(orderId, newStatus) {
          google.script.run.withSuccessHandler(function(response) {
            if (response.success) {
              alert('Order status updated successfully!');
              loadOrders();
            } else {
              alert('Error: ' + response.error);
            }
          }).updateOrderStatus(orderId, newStatus);
        }
        
        // Load orders when page loads
        window.onload = loadOrders;
      </script>
    </body>
    </html>
  `).setTitle("Order Management");
}

/**
 * Create custom menu in Google Sheets
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Restaurant Orders')
    .addItem('Manage Orders', 'createOrderMenu')
    .addItem('Refresh Orders', 'refreshOrders')
    .addToUi();
}

/**
 * Refresh orders data
 */
function refreshOrders() {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_ORDERS).getRange("A2:O").sort({column: 2, ascending: false});
  SpreadsheetApp.getUi().alert('Orders refreshed successfully!');
}
```

### 4. Save and Deploy the Script

1. Click **Save project** (floppy disk icon)
2. Name your project "Restaurant Order System"
3. Click **Deploy** → **New deployment**
4. Select **Web app** as the deployment type
5. Configure deployment settings:
   - Description: "Restaurant Order Management API"
   - Execute as: "Me (your email)"
   - Who has access: "Anyone"
6. Click **Deploy**
7. Authorize the script when prompted
8. Copy the **Web app URL** - this is your API endpoint

### 5. Update Website Integration

In your `logic.js` file, update the checkout form submission to integrate with Google Sheets:

Replace the TODO comment in the `initCheckoutForm` function:

```javascript
// TODO: Integrate with Google Sheets API here
// For now, simulate API call
setTimeout(() => {
    // Replace this with actual Google Sheets integration
    const scriptUrl = 'YOUR_WEB_APP_URL_HERE'; // Replace with your deployed web app URL
    
    fetch(scriptUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            functionName: 'processOrder',
            orderData: orderData
        })
    })
    .then(response => response.json())
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
}, 1500);
```

### 6. Test the Integration

1. Place a test order through your website
2. Check the Google Sheet for the new order
3. Verify the order data is correctly stored
4. Test order status updates:
   - Open the Google Sheet
   - Click **Restaurant Orders** → **Manage Orders**
   - Update order statuses

## 🔧 Configuration Options

### Custom Settings

Edit the Settings sheet to customize:
- Restaurant name
- Currency
- Delivery fees
- Tax rates

## 📊 Monitoring and Analytics

The Google Sheet provides built-in analytics:

1. **Order Volume**: Use `=COUNTA(A2:A)` to count total orders
2. **Revenue**: Use `=SUM(K2:K)` to calculate total revenue
3. **Status Distribution**: Create pivot tables for order status analysis
4. **Daily Orders**: Use `=COUNTIFS(A2:A, ">="&TODAY(), A2:A, "<="&TODAY())`

## 🛡️ Security Considerations

1. **API Security**: Consider adding authentication to your web app
2. **Data Validation**: Add input validation in the Apps Script
3. **Backup**: Regularly backup your Google Sheet data

## 🚨 Troubleshooting

### Common Issues

1. **Authorization Error**: Make sure you've authorized the script properly
2. **Order Not Saving**: Verify the sheet names and column structure
3. **Web App URL**: Ensure you're using the correct deployment URL

### Debug Mode

Add this function to your script for debugging:

```javascript
function testFunction() {
  const testOrder = {
    customer: {
      name: "Test Customer",
      phone: "+962712345678",
      address: "Test Address",
      city: "Amman",
      street: "Test Street",
      building: "123"
    },
    paymentMethod: "cash",
    items: [{id: "test", name: "Test Item", price: 10, quantity: 1}],
    totals: {total: "10.00"}
  };
  
  return processOrder(testOrder);
}
```

Run this function from the Apps Script editor to test the integration.

## 📞 Support

If you encounter issues:

1. Check the Apps Script execution logs: **Extensions** → **Apps Script** → **Executions**
2. Verify your Google Sheet structure matches the requirements
3. Ensure all required permissions are granted
4. Test with small amounts of data first

---

**🎉 Congratulations!** Your restaurant ordering system is now fully integrated with Google Sheets for order management.
