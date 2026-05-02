# StreamWise iOS shell — Option A + Option C (sibling Expo repo + WebView)

This matches your chosen approach:

- **Option A:** a **separate git repo** next to `streamwise` (not inside the Next.js tree).
- **Option C:** the native app is mostly a **`WebView` loading your deployed site**, so web releases do not require an App Store review for every copy change.

## Prerequisites (one-time)

- Apple Developer Program enrollment (paid).
- Xcode installed (from the Mac App Store).
- Node.js 20+ recommended.
- Expo account (free tier is enough to start); use **EAS** when you are ready for TestFlight builds without fighting Xcode signing manually.

## 1) Create the sibling repo folder

From the **parent directory** that already contains `streamwise` (example: `~/Projects`):

```bash
cd ..
```

```bash
npx create-expo-app@latest streamwise-ios --template blank-typescript
```

```bash
cd streamwise-ios
```

```bash
git init
```

```bash
git add -A
```

```bash
git commit -m "Initial Expo app shell for StreamWise"
```

Create an empty repo on GitHub named `streamwise-ios` (or your preferred name), then:

```bash
git remote add origin https://github.com/YOUR_ORG/streamwise-ios.git
```

```bash
git branch -M main
```

```bash
git push -u origin main
```

## 2) Install WebView

Still inside `streamwise-ios`:

```bash
npx expo install react-native-webview
```

## 3) Point the WebView at production (Option C)

Edit `App.tsx` to render a full-screen `WebView` whose `source.uri` is your production URL, for example:

`https://streamwise-xi.vercel.app`

Recommended pattern:

- Use an env-driven URL (`EXPO_PUBLIC_STREAMWISE_WEB_URL`) so staging/production swaps do not require code edits later.

Example env file in the mobile repo (create `.env` locally; **do not commit secrets**):

```bash
EXPO_PUBLIC_STREAMWISE_WEB_URL=https://streamwise-xi.vercel.app
```

Expo reads `EXPO_PUBLIC_*` at build time.

## 4) iOS polish checklist (important for App Review comfort)

Even with a WebView shell, reviewers expect a “real app” feel:

- Safe area insets (notch / home indicator).
- Pull-to-refresh optional (nice, not required).
- A simple offline / “can’t reach StreamWise” screen if the web request fails.
- Universal links later (optional).

## 5) App Store Connect linkage

In App Store Connect, set:

- Support URL → your deployed `/support` route.
- Privacy policy URL → `/privacy`.

## 6) Build to TestFlight

When you are ready, initialize EAS in the mobile repo:

```bash
npm install -g eas-cli
```

```bash
eas login
```

```bash
eas build:configure
```

Then follow Expo’s iOS build + submit flow for TestFlight.

## Why this split is good

- Your **web product** stays in `streamwise` with your existing CI.
- Your **iOS shell** stays small, focused, and independently versioned.
- You ship web improvements instantly while the shell changes slowly.
