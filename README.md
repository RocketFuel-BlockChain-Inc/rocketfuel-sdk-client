# 🚀 RocketFuel SDK Integration Guide

## 🔧 Initialization

To initialize the SDK, create a new instance of `RkflPlugin` with your configuration.

### ✅ Configuration Options

| Option        | Type     | Description                                                  |
|---------------|----------|--------------------------------------------------------------|
| `clientId`    | `string` | Your RocketFuel Client ID                                    |
| `clientSecret`| `string` | Your RocketFuel Client Secret                                |
| `merchantId`  | `string` | Your RocketFuel Merchant ID                                  |
| `containerId` | `string` | The ID of the DOM element where the buttons will be shown    |
| `buttons`     | `string[]` | Features to enable: `'payin'`, `'age_verification'`        |
| `redirect`    | `boolean`| Whether to redirect to `redirectUrl` after payment success   |

---

## installation
Inport CDN
```
```
or
install via npm 
```
import { RKFLPlugin } from '@rocketfuel/client';
```
## 🚀 Usage

```html
<!-- Container for SDK buttons -->
<div id="sdk-buttons-container"></div>

<script>
  const sdk = new RkflPlugin({
    clientId: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    merchantId: 'YOUR_MERCHANT_ID',
    buttons: ['payin', 'age_verification'],
    containerId: 'sdk-buttons-container',
    redirect: true
  });

  // Initialize buttons
  sdk.init();

  // Prepare cart data when user clicks "Buy Now" or after checkout is confirmed
  sdk.prepareOrder({
    amount: "1099",
    currency: "USD",
    cart: [
      {
        id: "iphone_14_pro_max",
        name: "iPhone 14 Pro Max",
        price: "1099",
        quantity: 1
      }
    ],
    customerInfo: {
      name: "John Doe",
      email: "john@example.com"
    },
    customParameter: {
      returnMethod: "GET",
      params: [{ name: "submerchant", value: "mobilesale" }]
    },
    merchant_id: "YOUR_MERCHANT_ID",
    redirectUrl: "https://example.com/thank-you"
  });
</script>
```


## 🚀 Supported Button Types

| Feature Key        | Description                  |
|--------------------|-----------------------------|
| `payin`            | Shows the "Pay Now" button  |
| `age_verification` | Shows the "Verify Age" button|

---
## 🛠️ Development
If you are building the SDK locally:

```
npm install
npm run build
```
The bundled file will be available at:
```
./dist/sdk.min.js
```
## 📄 License
MIT License © RocketFuel Blockchain, Inc.