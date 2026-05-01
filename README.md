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
  utils/            Pure logic utilities (coachRules.js — AI Coach rule engine)
  styles/           global.css
tests/              Vitest test files
```

---

## AI Models and Tools Used

This project was built using two AI tools with distinct, intentional roles:

| Tool | Role |
|---|---|
| **ChatGPT (OpenAI)** | Project planning, feature scoping, rubric alignment, and engineering structured prompts for debugging and code review |
| **Claude Code (Anthropic)** | Full codebase generation, security hardening, debugging, deployment fixes, and in-depth professional code review |

**Division of responsibilities:**
- ChatGPT was used _before and around_ coding — to plan the project, define the scope, and engineer prompts that were then executed in Claude Code
- Claude Code was used _during_ coding — to generate, debug, fix, and review all source files

Detailed interaction logs with verbatim prompts are in:
- [`Promts/claudechat.md`](Promts/claudechat.md) — Claude Code session log
- [`Promts/Chatgptchat.md`](Promts/Chatgptchat.md) — ChatGPT session log

---

## AI Engineering Analysis

### Strengths of AI Tools Used

- **Speed:** The complete initial codebase (8 pages, Firebase integration, tests, documentation) was generated from a single detailed prompt — work that would have taken days manually was done in one session
- **Structure:** Both tools produced well-organized, logical output when given specific constraints — folder structure, Firestore schema, security rules, and routing were all correctly designed on the first pass
- **Security depth:** Claude Code independently implemented field whitelisting on all Firestore write functions, type enforcement in security rules, and HTTP security headers (CSP, X-Frame-Options) without being explicitly asked for each one
- **Error catching:** Claude Code caught its own syntax error (apostrophe in a single-quoted string) during the test run and fixed it

### Limitations of AI Tools Used

- **Initial over-scoping:** ChatGPT's first planning response included far more features than were realistic for the time available — required multiple pushback prompts before the scope was right
- **Incorrect initial diagnosis:** When debugging the Cloudflare `_redirects` loop error, the ChatGPT-engineered prompt assumed the redirect rule content was wrong. Claude Code's investigation found the rule was correct — the problem was a stale empty file from a partial build
- **Missed production-only issues:** The CSP was missing `https://*.firebaseapp.com` in `connect-src` — this did not cause errors locally but broke Firebase Auth in production. The AI did not catch it until deployment failed
- **Documentation inconsistency introduced:** The original `security.md` described simplified Firestore rules that didn't match the actual deployed rules — an inconsistency Claude Code introduced and later caught during its own code review

### Tradeoffs Encountered

| Tradeoff | Decision Made |
|---|---|
| Real AI API vs. rule-based coach | Chose rule-based — no external API costs or complexity, all logic runs in the browser |
| Simplicity vs. completeness | Chose simplicity — fewer features done well over many features done partially |
| One AI tool vs. multiple | Used ChatGPT for planning and prompt engineering, Claude Code for implementation — clearer division of responsibilities |
| Speed of generation vs. review | Every AI output was reviewed and tested before acceptance — 18 unit tests enforced this |

### Prompting Strategies That Worked

- **Detailed upfront specs with explicit constraints:** The initial Claude Code prompt included the full tech stack, every page name, the Firestore schema, deployment target, and test framework — specificity eliminated guesswork
- **Plan-first, then execute:** For security hardening and UX improvements, Claude Code was asked to produce a plan for approval before writing any code — this prevented scope creep and gave full control over what was changed
- **Verbatim error output:** Pasting exact console errors and terminal output into prompts gave Claude Code enough context to identify root causes rather than guessing

### Prompting Strategies That Failed

- **Vague initial prompts to ChatGPT:** Asking to "plan everything" without constraints produced an over-scoped plan that required several correction rounds
- **Assuming the AI's diagnosis was correct:** The Cloudflare debugging prompt (engineered by ChatGPT) assumed the redirect rule content was wrong — accepting this framing would have led to modifying a rule that was already correct. Claude Code's own investigation found the actual cause

---

## Engineering Reflection

### What Would Have Been Different Without AI

- The project would have taken significantly longer to plan and structure — manually deciding on the Firestore schema, routing architecture, security rule design, and component breakdown would have required research across multiple sources
- The security implementation (field whitelisting, type enforcement in Firestore rules, CSP headers) would likely have been minimal or skipped entirely — these are not obvious beginner choices
- The codebase would have been less consistent — naming conventions, error handling patterns, and component structure would have drifted across files written at different times

### What AI Improved

- **Development speed** — a complete, deployable codebase was ready within a single session
- **Security posture** — the app has defense-in-depth security (Firestore rules, input whitelisting, HTTP headers) that goes beyond what a beginner would typically implement
- **Test coverage** — 18 tests across two files, structured correctly with Firebase mocking, were generated alongside the code rather than as an afterthought
- **Documentation** — `architecture.md`, `security.md`, and this `README.md` were all generated with a level of detail that would have taken hours to write manually

### What AI Degraded or Required Correction

- **Initial over-scoping** — ChatGPT's first plan required multiple rounds of pushback before the scope was realistic
- **Bugs introduced** — Claude Code introduced a syntax error (apostrophe in a string literal), a missing closing JSX tag, and an outdated storage bucket format in example files — all caught and fixed, but introduced by the AI in the first place
- **Documentation drift** — `security.md` was left describing old simplified rules after the actual rules were updated to a more detailed version — caught during the code review phase
- **Production blind spots** — the missing `firebaseapp.com` CSP domain only surfaced after deployment, not during local development

---

## Supporting Documentation

| File | Purpose |
|---|---|
| [`architecture.md`](architecture.md) | Full system architecture, Firestore schema, data flow, and routing table |
| [`security.md`](security.md) | Security implementation details, Firestore rules, CSP policy, and input validation |
| [`CLAUDE.md`](CLAUDE.md) | Complete breakdown of what Claude Code generated vs. what the student did |
| [`Promts/claudechat.md`](Promts/claudechat.md) | Verbatim Claude Code prompt log with mistakes, fixes, and reflections |
| [`Promts/Chatgptchat.md`](Promts/Chatgptchat.md) | Verbatim ChatGPT prompt log with planning and prompt engineering sessions |
| [`Promts/Ai Testing/ClaudeReview.md`](Promts/Ai%20Testing/ClaudeReview.md) | Professional code review performed by Claude Code acting as a senior engineer |
