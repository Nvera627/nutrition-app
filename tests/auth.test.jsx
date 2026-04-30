/**
 * auth.test.jsx
 * Tests for Login and SignUp forms using React Testing Library.
 * Firebase is mocked so no real network calls are made.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ── Mock Firebase so tests don't need real credentials ────────────────────────
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => { cb(null); return () => {}; }),
  updateProfile: vi.fn(),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  doc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(),
}));

vi.mock('../src/firebase/config', () => ({
  auth: {},
  db: {},
}));

// Import AFTER mocks are set up
import Login from '../src/pages/Login';
import SignUp from '../src/pages/SignUp';
import { AuthProvider } from '../src/context/AuthContext';
import * as firebaseAuth from 'firebase/auth';

// Wrap components in the auth context + router
function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <AuthProvider>{ui}</AuthProvider>
    </MemoryRouter>
  );
}

// ── Login tests ───────────────────────────────────────────────────────────────
describe('Login page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: auth state returns null (not logged in)
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return () => {}; });
  });

  it('renders the sign-in form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows an error when login fails with wrong credentials', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/incorrect email or password/i);
    });
  });

  it('shows an error for too many failed attempts', async () => {
    firebaseAuth.signInWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/too-many-requests' });
    renderWithProviders(<Login />);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'pass' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/too many failed attempts/i);
    });
  });
});

// ── SignUp tests ──────────────────────────────────────────────────────────────
describe('SignUp page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return () => {}; });
  });

  it('renders the sign-up form', () => {
    renderWithProviders(<SignUp />);
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows an error when passwords do not match', async () => {
    renderWithProviders(<SignUp />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password2' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/passwords do not match/i);
    });
  });

  it('shows an error when username is too short', async () => {
    renderWithProviders(<SignUp />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'a' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/at least 2 characters/i);
    });
  });

  it('shows an error when email is already in use', async () => {
    firebaseAuth.createUserWithEmailAndPassword.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
    firebaseAuth.onAuthStateChanged.mockImplementation((auth, cb) => { cb(null); return () => {}; });
    renderWithProviders(<SignUp />);

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'existing@test.com' } });
    fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'password1' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password1' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/already exists/i);
    });
  });
});
