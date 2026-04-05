import { useState, useRef, useEffect } from 'react';
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

const UserIcon = () => (
  <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs ring-2 ring-transparent transition hover:ring-brand-200">
    U
  </div>
);

const BellIcon = ({ count }) => (
  <div className="relative p-1 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);

import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Dashboard' },
    { to: '/weather-prediction', label: 'Weather' },
    { to: '/crop-prediction', label: 'Crops' },
    { to: '/fertilizer', label: 'Fertilizer' },
    { to: '/crop-calendar', label: 'Calendar' },
    { to: '/mandi-prices', label: 'Markets' },
    { to: '/chatbot', label: 'Assistant' },
    { to: '/marketplace', label: `Shop${itemCount ? ` (${itemCount})` : ''}` },
  ];

  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin' });

  return (
    <nav className="rounded-card border border-surface-200 bg-white px-4 py-3 shadow-card relative z-50">
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
          
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="p-1.5 text-slate-500 hover:text-slate-900 transition-colors focus:outline-none rounded-md"
            title="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {user && (
            <div className="relative" ref={notifRef}>
              <button type="button" onClick={() => setNotifOpen(!notifOpen)} className="focus:outline-none">
                <BellIcon count={unreadCount} />
              </button>
              
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-fadeIn overflow-hidden flex flex-col max-h-[80vh]">
                  <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-100 flex-shrink-0">
                    <p className="font-semibold text-sm text-slate-900">Notifications</p>
                    {unreadCount > 0 && <button className="text-xs text-brand-600 hover:text-brand-700" onClick={markAllAsRead}>Mark all read</button>}
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => { markAsRead(notif._id); setNotifOpen(false); }}
                          className={`rounded-lg p-3 text-left cursor-pointer transition ${notif.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-brand-50/30 hover:bg-brand-50'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{notif.title}</p>
                            {!notif.isRead && <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{notif.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="relative ml-2" ref={dropdownRef}>
            {user?.name && (
              <button 
                className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-900 focus:outline-none"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="font-semibold">{user.name}</span>
                <div className="h-7 w-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs ring-2 ring-transparent transition hover:ring-brand-200">
                  {user.name[0].toUpperCase()}
                </div>
              </button>
            )}

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50 animate-fadeIn">
                <Link to="/profile" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setDropdownOpen(false)}>
                  Profile Settings
                </Link>
                <Link to="/journal" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setDropdownOpen(false)}>
                  Farm Journal
                </Link>
                <Link to="/orders" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setDropdownOpen(false)}>
                  My Orders
                </Link>
                <Link to="/prediction-history" className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => setDropdownOpen(false)}>
                  Prediction History
                </Link>
                <div className="my-1 border-t border-slate-100"></div>
                <button
                  className="w-full text-left block rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          {user && (
            <button type="button" onClick={() => setNotifOpen(!notifOpen)} className="focus:outline-none text-slate-500 relative">
              <BellIcon count={unreadCount} />
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-xl z-50 animate-fadeIn overflow-hidden flex flex-col max-h-[80vh] text-left">
                  <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-100 flex-shrink-0">
                    <p className="font-semibold text-sm text-slate-900">Notifications</p>
                    {unreadCount > 0 && <button className="text-xs text-brand-600 hover:text-brand-700" onClick={markAllAsRead}>Mark all read</button>}
                  </div>
                  <div className="overflow-y-auto p-2 space-y-1 bg-white">
                    {notifications.length === 0 ? (
                      <p className="text-center text-xs text-slate-500 py-4">No notifications yet.</p>
                    ) : (
                      notifications.map(notif => (
                        <div 
                          key={notif._id} 
                          onClick={() => { markAsRead(notif._id); setNotifOpen(false); }}
                          className={`rounded-lg p-3 text-left cursor-pointer transition ${notif.isRead ? 'opacity-70 hover:bg-slate-50' : 'bg-brand-50/30 hover:bg-brand-50'}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{notif.title}</p>
                            {!notif.isRead && <span className="h-2 w-2 rounded-full bg-brand-500 flex-shrink-0 mt-1"></span>}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.body}</p>
                          <p className="text-[10px] text-slate-400 mt-2">{notif.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </button>
          )}

          <button
            className="rounded-lg p-2 text-slate-500 hover:bg-surface-100"
            onClick={() => setMobileOpen((prev) => !prev)}
            type="button"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
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
          <div className="my-2 border-t border-slate-100"></div>
          <Link to="/profile" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Profile Settings</Link>
          <Link to="/journal" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Farm Journal</Link>
          <Link to="/orders" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>My Orders</Link>
          <Link to="/prediction-history" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50" onClick={() => setMobileOpen(false)}>Prediction History</Link>

          <button
            className="mt-2 rounded-lg border border-red-200 bg-red-50/60 px-3 py-2.5 text-left text-sm font-medium text-red-600"
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
