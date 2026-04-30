# How AI Was Used in BalanceBite

## Tool Used
Claude (claude.ai / Claude Code) — Anthropic's AI assistant.

## What Claude Helped Build

This entire project was scaffolded and coded with assistance from Claude. Below is a breakdown of what was generated and what decisions were made.

### Project Planning
Claude helped plan the full architecture: which pages to include, how to structure the Firestore schema, which npm packages to use, and how to organize the folder structure for a beginner-friendly codebase.

### Code Generated

| File | Claude's role |
|---|---|
| `src/firebase/config.js` | Generated Firebase initialization code using environment variables |
| `src/firebase/firestore.js` | Generated all Firestore CRUD helper functions for every collection |
| `src/context/AuthContext.jsx` | Generated Firebase Auth context with login, signUp, logout, and session restoration |
| `src/components/ProtectedRoute.jsx` | Generated redirect logic for unauthenticated users |
| `src/components/Navbar.jsx` | Generated responsive navigation with active link styling |
| `src/pages/Login.jsx` | Generated login form with Firebase error code mapping |
| `src/pages/SignUp.jsx` | Generated sign-up form with client-side validation |
| `src/pages/Dashboard.jsx` | Generated summary cards, progress bars, and today's data aggregation |
| `src/pages/FoodLog.jsx` | Generated tabbed food/water/exercise logging with inline edit/delete |
| `src/pages/Goals.jsx` | Generated goals form with validation and reference guide |
| `src/pages/Progress.jsx` | Generated Recharts bar/line charts and weight log CRUD |
| `src/pages/AICoach.jsx` | Generated all rule-based coaching logic (no external AI API) |
| `src/pages/Profile.jsx` | Generated dashboard card toggle UI backed by Firestore |
| `src/styles/global.css` | Generated the full stylesheet (color palette, layout, responsive breakpoints) |
| `src/App.jsx` | Generated route definitions with protected route wrappers |
| `tests/aicoach.test.js` | Generated unit tests for coaching logic |
| `tests/auth.test.jsx` | Generated component tests for Login and SignUp |
| `README.md` | Generated step-by-step setup and deployment guide |
| `architecture.md` | Generated architecture documentation |
| `security.md` | Generated security notes and Firestore rule recommendations |

### AI Coach Design Decision
The project requirements specified a "rule-based AI Coach" with no real AI API. Claude designed a set of rules that compare the user's logged data against their goals:
- Calorie overage / approaching limit
- Low protein warning (< 50% of goal)
- Low water warning (< 50% of goal)
- Water goal celebration
- Weight trend analysis (trending down vs. stall)
- Exercise streak detection (no activity in 3+ days)

All logic runs in the browser in `generateSuggestions()` — no data is sent to any AI service.

### What Was Not AI-Generated
- Firebase project setup (done manually in Firebase Console)
- Environment variable values (from the Firebase Console)
- Cloudflare Pages configuration (done in the Cloudflare dashboard)
- Any real user data logged during testing

## Academic Integrity Note
This project was built as a college class project. The code was generated with AI assistance to demonstrate how modern development tools work, and the student reviewed and understood the code before submission. All design decisions, testing, and deployment were performed by the student.
