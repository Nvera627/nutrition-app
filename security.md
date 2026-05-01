# BalanceBite — Security Notes

## Authentication

- Uses **Firebase Authentication** with email/password.
- Sessions are managed by Firebase and stored in the browser's localStorage automatically.
- Passwords are **never stored** in the app's code or Firestore. Firebase handles hashing.
- The `AuthContext` exposes a `currentUser` object (from Firebase SDK) — only safe, non-sensitive fields like `uid`, `email`, and `displayName` are used.

## Environment Variables

- All Firebase config keys are stored in a `.env` file that is **excluded from version control** via `.gitignore`.
- Vite embeds these values at build time using `import.meta.env.VITE_*`.
- When deploying to Cloudflare Pages, the variables are set in the Pages dashboard — they are never exposed in the repository.

> **Note:** Firebase API keys embedded in a web app are considered public by design — they identify the project, not grant admin access. Security is enforced by Firebase Security Rules and Authentication, not by keeping the API key secret.

## Firestore Security Rules

The database uses production-mode security rules enforced in `firestore.rules`. These rules are deployed to Firebase and are the active rules on the live database.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper: user must be signed in AND must own the data
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Top-level user profile document
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }

    // Food entries — type enforcement on numeric fields
    match /users/{userId}/foodEntries/{entryId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
        && request.resource.data.calories is number
        && request.resource.data.protein  is number
        && request.resource.data.carbs    is number
        && request.resource.data.fat      is number;
    }

    // Water logs
    match /users/{userId}/waterLogs/{logId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
        && request.resource.data.ounces is number;
    }

    // Weight logs
    match /users/{userId}/weightLogs/{logId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
        && request.resource.data.weight is number;
    }

    // Exercise logs
    match /users/{userId}/exerciseLogs/{logId} {
      allow read, delete: if isOwner(userId);
      allow create, update: if isOwner(userId)
        && request.resource.data.minutes is number;
    }

    // Goals (single document per user)
    match /users/{userId}/goals/current {
      allow read, write: if isOwner(userId);
    }

    // Dashboard settings
    match /users/{userId}/settings/dashboard {
      allow read, write: if isOwner(userId);
    }

    // Deny everything else explicitly
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

These rules ensure:
- A user must be **authenticated** (`request.auth != null`) via the `isOwner()` helper
- A user can **only access their own data** (`request.auth.uid == userId`)
- **Numeric fields are type-enforced** on write — calories, protein, carbs, fat, ounces, weight, and minutes must all be numbers, not strings or arbitrary values
- **Everything not explicitly matched is denied** by the catch-all rule at the bottom

## Input Validation

- Forms validate input on the client before submitting to Firebase.
- Number fields use `min` and `max` HTML attributes to reject out-of-range values.
- String fields are trimmed before saving.
- Firebase SDK validates data types on the server side.

## No Sensitive Data in AI Coach

- The AI Coach runs entirely in the browser using local rule logic.
- No user health data is sent to any external AI API.
- All coaching decisions are made from data already loaded from Firestore.

## XSS Protection

- React escapes all rendered user data by default — no `dangerouslySetInnerHTML` is used anywhere.
- User-entered text (food names, activity names) is displayed through standard JSX interpolation which is safe.

## Dependency Security

- Run `npm audit` to check for known vulnerabilities in dependencies.
- Keep dependencies up to date with `npm update`.
