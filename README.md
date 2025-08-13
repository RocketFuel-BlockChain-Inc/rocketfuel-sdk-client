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
  // for more follow the documentation below

</script>
```
## Documentation
Click here for more detailed [Documentation](https://rocketfuel-gitbook.gitbook.io/rocketfuel-sdks/)

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

## 📦 NPM Commands Documentation
### 1. npm:login

Logs you into your npm account from the terminal.
You’ll be prompted for your npm username, password, and email.
```
npm run npm:login
```
Use this before your first publish or if you’re logged out.

### 2. npm:publish
Publishes the current package to npm with public access.
The package name and version must be unique on npm.
```
npm run npm:publish
```

### 3. npm:patch
Increments the patch version (last digit) in package.json by +1.
Used for bug fixes or small improvements.
```
npm run npm:patch
```
Example Version Change:
```
1.0.9   → 1.0.10
1.0.10  → 1.0.11
```
### 4. npm:minor
Increments the minor version (middle digit) by +1 and resets patch to 0.
Used for adding new features without breaking compatibility.
```
npm run npm:minor
```
Example Version Change:
```
1.0.5   → 1.1.0
1.2.7   → 1.3.0
```
### 5. npm:major
Increments the major version (first digit) by +1 and resets minor and patch to 0.
Used for breaking changes or major redesigns.
```
npm run npm:major
```
Example Version Change:
```
1.4.8   → 2.0.0
2.1.3   → 3.0.0
```
## 🚀 Recommended Workflow
### Login once:
```
npm run npm:login
```
Make changes to your code.

### Bump version:
```
npm run npm:patch
```
Minor:

```
npm run npm:minor
```
Major:
```
npm run npm:major
```

### Publish:
```
npm run npm:publish
```
## 📄 License
MIT License © RocketFuel Blockchain, Inc.