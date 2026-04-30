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

## Firestore Security Rules (Recommended)

The database was created in test mode for development. Before submitting or sharing the app, update the rules in **Firestore → Rules** to:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read and write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

This rule ensures:
- A user must be **authenticated** (`request.auth != null`)
- A user can **only access their own data** (`request.auth.uid == userId`)

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
