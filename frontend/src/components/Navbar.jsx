import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

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
    { to: '/weather-prediction', label: 'Weather AI' },
    { to: '/crop-prediction', label: 'Crop AI' },
    { to: '/fertilizer', label: 'Fertilizer AI' },
    { to: '/chatbot', label: 'Chatbot' },
    { to: '/marketplace', label: `Marketplace${itemCount ? ` (${itemCount})` : ''}` },
    { to: '/govt-schemes', label: 'Govt Schemes' }
  ];

  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' });

  return (
    <nav className="mb-5 rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="min-w-0">
          <h1 className="truncate font-display text-xl font-bold tracking-tight text-white">Smart Agri Hub</h1>
          <p className="text-[11px] text-emerald-100/80">Command-ready agriculture intelligence</p>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white/10 text-slate-100 hover:bg-white/20'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button className="rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-100 hover:bg-red-400/20" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            className="rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            Menu
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="mt-3 grid gap-2 md:hidden">
          {links.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-semibold ${
                  isActive
                    ? 'bg-emerald-400 text-slate-950'
                    : 'bg-white/10 text-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <button className="rounded-xl border border-red-300/40 bg-red-400/10 px-3 py-2 text-sm font-semibold text-red-100" onClick={handleLogout} type="button">
            Logout
          </button>
        </div>
      ) : null}
    </nav>
  );
};

export default Navbar;
