# expo-plugin-ios-digital-signer

An [Expo](https://expo.dev) app demonstrating **digital signing** via a custom native module. Uses [Expo SDK 54](https://docs.expo.dev/versions/latest/) with React Native 0.81, [file-based routing](https://docs.expo.dev/router/introduction) via `expo-router`, and a local **Expo Module** (`digital-signer`) for RSA-based digital signing on iOS.

## Overview

This project showcases how to build and consume a **local Expo config plugin / native module** (`DigitalSigner`) that:

- Parses PKCS#8 PEM private keys
- Digitally signs files using RSA with SHA-256
- Returns a Base64-encoded signature

The native implementation lives in `DigitalSigner/ios/` (Swift), with a TypeScript API exposed to the app.

## Get Started

1. Install dependencies

   ```bash
   npm install
   # or: yarn / bun install
   ```

2. Start the app

   ```bash
   npm run ios
   ```

### Generating a Private Key

The app expects a **PKCS#8 PEM** private key. Generate one as follows:

**Mac / Linux** (OpenSSL is usually pre-installed):

```bash
openssl genpkey -algorithm RSA -out private_key -pkeyopt rsa_keygen_bits:2048
```

**Windows** (install [OpenSSL](https://slproweb.com/products/Win32OpenSSL.html) or use [Git Bash](https://git-scm.com/downloads) which includes OpenSSL):

```bash
openssl genpkey -algorithm RSA -out private_key -pkeyopt rsa_keygen_bits:2048
```

Save the key file as `private_key` in the project root, or pass its path to `digitalSignFileAsync`.

### Usage

```ts
import { digitalSignFileAsync } from 'digital-signer';

const signature = await digitalSignFileAsync(fileUri, keyUri);
// Returns Base64-encoded RSA-SHA256 signature
```

