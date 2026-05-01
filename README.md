# BalanceBite

A nutrition and health tracking web app built with React, Vite, Firebase, and Recharts. Users can log meals, water, weight, and exercise; set health goals; view progress charts; and receive rule-based coaching suggestions.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | React 18 + Vite |
| Routing | React Router v6 |
| Auth | Firebase Authentication (email/password) |
| Database | Firebase Firestore |
| Charts | Recharts |
| Tests | Vitest + React Testing Library |
| Deployment | Cloudflare Pages |

---

## Step 1 — Install Dependencies

Make sure you have **Node.js 18+** installed. Then run:

```bash
npm install
```

---

## Step 2 — Create a Firebase Project

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project** → give it a name like `balancebite` → Continue
3. Disable Google Analytics (optional) → **Create project**

---

## Step 3 — Enable Email/Password Authentication

1. In the Firebase Console, click **Authentication** in the left sidebar
2. Click **Get started**
3. Under **Sign-in providers**, click **Email/Password**
4. Toggle **Enable** → **Save**

---

## Step 4 — Create Firestore Database

1. In the Firebase Console, click **Firestore Database**
2. Click **Create database**
3. Choose **Start in production mode**
4. Select a region close to you → **Enable**
5. Once created, go to the **Rules** tab and paste in the full contents of `firestore.rules` from this project → click **Publish**

---

## Step 5 — Add Environment Variables

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps** → click `</>` Web to add a web app
3. Register the app → copy the `firebaseConfig` values
4. In this project folder, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

5. Open `.env` and paste in your values:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> **Important:** Never commit your `.env` file. It is already in `.gitignore`.

---

## Step 6 — Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Step 7 — Push to GitHub

1. Create a new repository on [github.com](https://github.com)
2. In this project folder:

```bash
git add .
git commit -m "Initial BalanceBite project"
git remote add origin https://github.com/YOUR_USERNAME/balancebite.git
git push -u origin main
```

---

## Step 8 — Deploy on Cloudflare Pages

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Pages** → **Create a project**
2. Connect your GitHub account → select your `balancebite` repository
3. Set build settings:
   - **Framework preset:** None
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Under **Environment variables**, add all 6 `VITE_FIREBASE_*` variables with their values
5. Click **Save and Deploy**

Your app will be live at `https://your-project.pages.dev` within a minute.

---

## Step 9 — Run Tests

```bash
npm test
```

Tests included:

| File | What it tests |
|---|---|
| `tests/aicoach.test.js` | Rule-based coaching logic (pure JS, no Firebase) |
| `tests/auth.test.jsx` | Login and SignUp form validation and error handling |

---

## Step 10 — Screenshots for Your Rubric

Take screenshots of the following screens and label them:

| Screen | What to show |
|---|---|
| **Sign Up** | Filled-in form with username, email, password |
| **Login** | Sign-in form |
| **Dashboard** | Summary cards with today's data |
| **Food Log** | Food table with at least 2–3 entries; Add food form |
| **Food Log — Water** | Water tab with a logged entry |
| **Food Log — Exercise** | Exercise tab with a logged entry |
| **Goals** | Goals form with values filled in |
| **Progress** | All 4 charts with data |
| **AI Coach** | Coaching suggestions (mix of warning, info, success) |
| **Profile** | Dashboard card toggles |
| **Mobile** | Any page on a narrow viewport (responsive layout) |
| **Firebase Console** | Firestore with real data visible |
| **Cloudflare Pages** | Successful deployment dashboard |

---

## Folder Structure

```
src/
  components/       Reusable UI components (Navbar, ProtectedRoute, etc.)
  context/          AuthContext — global auth state
  firebase/         Firebase config and Firestore helpers
  pages/            One file per page
  styles/           global.css
tests/              Vitest test files
```
