# StreamWise iOS shell — Option A + Option C (sibling Expo repo + WebView)

This matches your chosen approach:

- **Option A:** a **separate git repo** next to `streamwise` (not inside the Next.js tree).
- **Option C:** the native app is mostly a **`WebView` loading your deployed site**, so web releases do not require an App Store review for every copy change.

## Prerequisites (one-time)

- Apple Developer Program enrollment (paid).
- Xcode installed (from the Mac App Store).
- Node.js 20+ recommended.
- Expo account (free tier is enough to start); use **EAS** when you are ready for TestFlight builds without fighting Xcode signing manually.

## How to run the commands below (read this first)

These fenced blocks that start with `bash` are meant for a **terminal**, not for the Markdown editor.

1. Open a terminal:
   - **Cursor:** menu **Terminal → New Terminal** (or the `` Ctrl+` `` / `` Cmd+` `` shortcut), **or**
   - **macOS:** open **Terminal.app** from Spotlight.
2. You should see a prompt like `... %` at the bottom. That is where you paste commands.
3. Run **one command at a time**. Press **Enter** after each paste.
4. Wait for each command to finish before running the next one.
5. If a command asks questions in the terminal, read them and answer (usually defaults are fine).

## 1) Create the sibling repo folder

You will create a **new folder** named `streamwise-ios` **next to** your existing `streamwise` folder (not inside it).

First, go to the folder that **contains** `streamwise`. On your machine the web repo lives at:

`/Users/chrisanderson/streamwise`

So its parent folder is:

`/Users/chrisanderson`

Use the terminal to move there. Either of these works:

```bash
cd /Users/chrisanderson
```

```bash
cd /Users/chrisanderson/streamwise && cd ..
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

## 3) Point the WebView at production (Option C)

Do this **inside the `streamwise-ios` project** (the sibling folder you created), not inside `streamwise`.

### 3a) Open the mobile project in Cursor (recommended)

1. Cursor menu: **File → Open Folder…**
2. Pick the folder: `/Users/chrisanderson/streamwise-ios`
3. Click **Open**

You should now see `App.tsx` in the left file tree.

### 3b) Install WebView (terminal, inside `streamwise-ios`)

```bash
cd /Users/chrisanderson/streamwise-ios
```

```bash
npx expo install react-native-webview
```

### 3c) Create the `.env` file (terminal)

This file tells Expo which website URL to load. It is **not** a secret (it is a public URL), but it is still good practice to keep `.env` out of git if your repo is public.

```bash
cd /Users/chrisanderson/streamwise-ios
```

```bash
printf '%s\n' 'EXPO_PUBLIC_STREAMWISE_WEB_URL=https://streamwise-xi.vercel.app' > .env
```

Confirm it exists:

```bash
cat .env
```

If `.env` is not ignored yet, add this line to `streamwise-ios/.gitignore` (create the file if needed):

```gitignore
.env
```

### 3d) Replace `App.tsx` (editor)

1. In Cursor’s left sidebar, click **`App.tsx`**
2. Select **all** text in that file and delete it
3. Paste the entire block below
4. Save the file (`Cmd+S`)

```tsx
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { WebView } from "react-native-webview";

const DEFAULT_WEB_URL = "https://streamwise-xi.vercel.app";

export default function App() {
  const webUrl = useMemo(() => {
    const fromEnv = process.env.EXPO_PUBLIC_STREAMWISE_WEB_URL?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_WEB_URL;
  }, []);

  const [hasError, setHasError] = useState(false);

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      {hasError ? (
        <View style={styles.centered}>
          <Text style={styles.title}>Could not load StreamWise</Text>
          <Text style={styles.body}>
            Check your internet connection, then fully close and reopen the app.
          </Text>
        </View>
      ) : (
        <WebView
          source={{ uri: webUrl }}
          style={styles.webview}
          startInLoadingState
          onError={() => setHasError(true)}
          onHttpError={() => setHasError(true)}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator size="large" />
              <Text style={styles.loadingText}>Loading StreamWise…</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  webview: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8,
  },
  loading: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: "#0f172a", textAlign: "center" },
  body: { fontSize: 14, color: "#475569", textAlign: "center" },
  loadingText: { fontSize: 14, color: "#64748b" },
});
```

### 3e) Run the app locally (terminal)

Stop any running dev server first (`Ctrl+C`), then:

```bash
cd /Users/chrisanderson/streamwise-ios
```

```bash
npx expo start
```

Then press **`i`** in that same terminal window to open the iOS simulator (requires Xcode).

You should see your live site load inside the app shell.

**If you change `.env` later:** stop Expo (`Ctrl+C`) and run `npx expo start` again so the new URL is picked up.

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
