---
layout: slide
title: "Fix: expo-constants Metro Resolution Error"
---

## Problem

Metro fails to resolve `expo-constants` from `expo-asset` because a nested
`node_modules/expo-asset/node_modules/expo-constants/build/Constants.js`
does not exist.

## Cause

A version mismatch between `expo-asset` and `expo-constants` causes npm/yarn
to install a separate (incompatible) copy of `expo-constants` inside
`expo-asset`'s own `node_modules`. That nested copy has no `build/` output.

## Fix

**Option 1 — realign versions with Expo's resolver (recommended):**

```bash
npx expo install expo-constants expo-asset
```

This pins both packages to versions compatible with your Expo SDK.

**Option 2 — force a single copy via metro.config.js:**

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  'expo-constants': path.resolve(__dirname, 'node_modules/expo-constants'),
};

module.exports = config;
```

**Option 3 — clean reinstall:**

```bash
rm -rf node_modules
npm install   # or: yarn install
npx expo start --clear
```
