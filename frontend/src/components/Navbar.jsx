import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500">
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8c0 5.5-4.5 10-10 10Z" />
    <path d="M2 21c0-3 1.9-5.5 4.5-6.3" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/weather-prediction', label: 'Weather' },
    { to: '/crop-prediction', label: 'Crops' },
    { to: '/fertilizer', label: 'Fertilizer' },
    { to: '/chatbot', label: 'Assistant' },
    { to: '/marketplace', label: `Market${itemCount ? ` (${itemCount})` : ''}` },
    { to: '/govt-schemes', label: 'Schemes' },
  ];

  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' });

  return (
    <nav className="rounded-card border border-surface-200 bg-white px-4 py-3 shadow-card">
      <div className="flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 min-w-0">
          <LeafIcon />
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg text-slate-900">Smart Agri Hub</h1>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative px-3 py-2 text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-600 after:absolute after:bottom-0 after:left-3 after:right-3 after:h-[2px] after:rounded-full after:bg-brand-500'
                    : 'text-slate-500 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        {/* Right side: user + logout */}
        <div className="hidden items-center gap-3 lg:flex">
          {user?.name ? (
            <span className="text-xs text-slate-400">{user.name}</span>
          ) : null}
          <button
            className="btn-danger text-xs py-1.5 px-3"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-slate-500 hover:bg-surface-100 lg:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          type="button"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen ? (
        <div className="mt-3 grid gap-1 border-t border-surface-200 pt-3 lg:hidden">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium ${
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-surface-50'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button
            className="mt-1 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-left text-sm font-medium text-red-600"
            onClick={handleLogout}
            type="button"
          >
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
