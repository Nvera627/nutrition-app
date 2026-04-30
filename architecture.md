# BalanceBite — Architecture Overview

## High-Level Architecture

```
Browser
  └── React SPA (Vite)
        ├── React Router v6     (client-side routing)
        ├── AuthContext         (global auth state via Firebase Auth)
        └── Pages
              ├── Login / SignUp         → Firebase Auth
              ├── Dashboard              → Firestore reads
              ├── Food Log               → Firestore CRUD
              ├── Goals                  → Firestore CRUD
              ├── Progress               → Firestore reads + Recharts
              ├── AI Coach               → local rule engine (no external API)
              └── Profile                → Firestore reads + Auth info

Firebase (Google Cloud)
  ├── Authentication  — email/password sessions
  └── Firestore       — NoSQL document database
```

---

## File Structure

```
nutrition-app/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          Top navigation bar
│   │   ├── ProtectedRoute.jsx  Redirects unauthenticated users
│   │   ├── LoadingSpinner.jsx  Centered spinner shown while fetching
│   │   └── ErrorMessage.jsx    Red error banner
│   ├── context/
│   │   └── AuthContext.jsx     Provides currentUser, login, signUp, logout
│   ├── firebase/
│   │   ├── config.js           Firebase app init (reads env vars)
│   │   └── firestore.js        All Firestore helper functions
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── SignUp.jsx
│   │   ├── Dashboard.jsx
│   │   ├── FoodLog.jsx
│   │   ├── Goals.jsx
│   │   ├── Progress.jsx
│   │   ├── AICoach.jsx
│   │   └── Profile.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx                 Route definitions
│   └── main.jsx                React DOM entry point
├── tests/
│   ├── setup.js
│   ├── aicoach.test.js
│   └── auth.test.jsx
├── index.html
├── package.json
├── vite.config.js
└── .env                        (not committed — contains Firebase keys)
```

---

## Data Flow

### Authentication
1. User fills in SignUp / Login form
2. Form calls `signUp()` or `login()` from `AuthContext`
3. AuthContext calls Firebase Auth SDK
4. On success, Firebase sets a persistent session (localStorage)
5. `onAuthStateChanged` listener updates `currentUser` in context
6. React Router's `ProtectedRoute` reads `currentUser` to allow/deny access

### Firestore Data
1. Each page imports helper functions from `src/firebase/firestore.js`
2. Helpers use the Firestore SDK (`addDoc`, `getDocs`, `updateDoc`, `deleteDoc`)
3. Data is scoped to `users/{uid}/...` so each user only sees their own data
4. Pages use `useEffect` to fetch data on mount and `useState` to store it

### AI Coach
- Purely client-side — no external API
- Fetches all user data from Firestore
- Runs `generateSuggestions()` which applies a set of rules
- Returns an array of suggestion objects `{ id, type, title, message }`
- No user data leaves the browser for AI processing

---

## Firestore Schema

```
users/{userId}
  username      string
  email         string
  createdAt     timestamp

users/{userId}/foodEntries/{entryId}
  date          string    "YYYY-MM-DD"
  mealType      string    "breakfast" | "lunch" | "dinner" | "snack"
  foodName      string
  calories      number
  protein       number    grams
  carbs         number    grams
  fat           number    grams
  createdAt     timestamp

users/{userId}/waterLogs/{logId}
  date          string
  ounces        number
  createdAt     timestamp

users/{userId}/weightLogs/{logId}
  date          string
  weight        number    lbs
  createdAt     timestamp

users/{userId}/exerciseLogs/{logId}
  date          string
  activity      string
  minutes       number
  caloriesBurned number
  createdAt     timestamp

users/{userId}/goals/current
  calorieGoal   number
  proteinGoal   number
  carbGoal      number
  fatGoal       number
  waterGoal     number
  weightGoal    number | null

users/{userId}/settings/dashboard
  showCalories  boolean
  showMacros    boolean
  showWater     boolean
  showWeight    boolean
  showExercise  boolean
```

---

## Routing Table

| Path | Component | Protected |
|---|---|---|
| `/login` | Login | No |
| `/signup` | SignUp | No |
| `/dashboard` | Dashboard | Yes |
| `/food-log` | FoodLog | Yes |
| `/goals` | Goals | Yes |
| `/progress` | Progress | Yes |
| `/ai-coach` | AICoach | Yes |
| `/profile` | Profile | Yes |
| `/` | → `/dashboard` | Yes |

---

## Deployment

Cloudflare Pages serves the `dist/` folder produced by `vite build`.
Firebase environment variables are set in Cloudflare Pages' environment variable UI
and are embedded into the bundle at build time by Vite (`import.meta.env.*`).
