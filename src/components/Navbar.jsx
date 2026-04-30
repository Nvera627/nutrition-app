/**
 * Navbar.jsx
 * Top navigation bar shown on all authenticated pages.
 */

import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/food-log', label: 'Food Log' },
    { to: '/goals', label: 'Goals' },
    { to: '/progress', label: 'Progress' },
    { to: '/ai-coach', label: 'AI Coach' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <NavLink to="/dashboard" className="brand-link">
          🥗 BalanceBite
        </NavLink>
      </div>

      {/* Hamburger toggle for mobile */}
      <button
        className="navbar-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
        <li>
          <span className="nav-user">
            {currentUser?.displayName || currentUser?.email}
          </span>
        </li>
        <li>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            Log Out
          </button>
        </li>
      </ul>
    </nav>
  );
}
