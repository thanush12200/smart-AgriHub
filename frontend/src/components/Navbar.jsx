import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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

const BellIcon = ({ count }) => (
  <div className="relative" style={{ color: 'var(--text-secondary)' }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
    {count > 0 && (
      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
        {count > 9 ? '9+' : count}
      </span>
    )}
  </div>
);

const NotificationDropdown = ({ notifications, unreadCount, markAsRead, markAllAsRead, onClose }) => (
  <div
    className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 animate-fadeIn overflow-hidden flex flex-col max-h-[80vh]"
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-light)',
      backdropFilter: 'blur(24px)',
      boxShadow: '0 16px 48px var(--shadow-depth)',
    }}
  >
    <div className="flex items-center justify-between p-3.5 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</p>
      {unreadCount > 0 && (
        <button className="text-xs font-semibold transition-colors" style={{ color: 'var(--brand-500)' }} onClick={markAllAsRead}>
          Mark all read
        </button>
      )}
    </div>
    <div className="overflow-y-auto p-2 space-y-1">
      {notifications.length === 0 ? (
        <p className="text-center text-xs py-6" style={{ color: 'var(--text-muted)' }}>No notifications yet.</p>
      ) : notifications.map(notif => (
        <div
          key={notif._id}
          onClick={() => { markAsRead(notif._id); onClose(); }}
          className="rounded-xl p-3 cursor-pointer transition-all"
          style={{
            background: notif.isRead ? 'transparent' : 'rgba(26,122,76,0.06)',
            opacity: notif.isRead ? 0.72 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
          onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? 'transparent' : 'rgba(26,122,76,0.06)'}
        >
          <div className="flex justify-between items-start gap-2">
            <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{notif.title}</p>
            {!notif.isRead && <span className="h-2 w-2 rounded-full flex-shrink-0 mt-1" style={{ background: 'var(--brand-500)' }} />}
          </div>
          <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>{notif.body}</p>
          <p className="text-[10px] mt-2" style={{ color: 'var(--text-muted)' }}>{notif.date}</p>
        </div>
      ))}
    </div>
  </div>
);

export default function Navbar() {
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
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links = [
    { to: '/', label: 'Dashboard', icon: '⊞' },
    { to: '/weather-prediction', label: 'Weather', icon: '◎' },
    { to: '/crop-prediction', label: 'Crops', icon: '⬡' },
    { to: '/fertilizer', label: 'Fertilizer', icon: '◈' },
    { to: '/crop-calendar', label: 'Calendar', icon: '▦' },
    { to: '/govt-schemes', label: 'Schemes', icon: '◧' },
    { to: '/chatbot', label: 'Assistant', icon: '◉' },
    { to: '/marketplace', label: `Shop${itemCount ? ` (${itemCount})` : ''}`, icon: '◻' },
  ];

  if (user?.role === 'admin') links.push({ to: '/admin', label: 'Admin', icon: '⬡' });

  const activeStyle = {
    background: 'var(--bg-card)',
    color: 'var(--brand-500)',
    boxShadow: '0 2px 8px var(--shadow-depth), 0 0 0 1px var(--border-glow)',
  };

  const inactiveStyle = {
    color: 'var(--text-secondary)',
  };

  return (
    <nav
      className="sticky top-3 z-50 rounded-[26px] px-3 py-2.5"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-light)',
        borderTopColor: 'rgba(255,255,255,0.18)',
        backdropFilter: 'blur(28px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(28px) saturate(1.6)',
        boxShadow: '0 8px 32px var(--shadow-depth), 0 1px 0 rgba(255,255,255,0.12) inset',
      }}
    >
      <div className="flex items-center justify-between gap-3">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-[14px] text-white"
            style={{
              background: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))',
              boxShadow: '0 4px 14px var(--glow-brand)',
            }}
          >
            <LeafIcon />
          </div>
          <div className="hidden sm:block">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--brand-500)' }}>
              Agritech Suite
            </p>
            <p className="text-sm font-extrabold tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>
              Smart Agri Hub
            </p>
          </div>
        </Link>

        {/* Desktop nav pill group */}
        <div
          className="hidden items-center gap-0.5 rounded-2xl p-1 lg:flex"
          style={{ background: 'rgba(0,0,0,0.04)' }}
        >
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-all"
              style={({ isActive }) => isActive ? activeStyle : inactiveStyle}
              onMouseEnter={e => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'rgba(0,0,0,0.04)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = '';
                }
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex shrink-0">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            title="Toggle theme"
          >
            <span className="text-base">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>

          {/* Notifications */}
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                <BellIcon count={unreadCount} />
              </button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}

          {/* User profile dropdown */}
          {user?.name && (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-secondary)',
                }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    {user.role}
                  </p>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{user.name}</p>
                </div>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-xs font-extrabold text-white"
                  style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-600))' }}
                >
                  {user.name[0].toUpperCase()}
                </div>
              </button>

              {dropdownOpen && (
                <div
                  className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl p-1.5 animate-fadeIn"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-light)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 16px 48px var(--shadow-depth)',
                  }}
                >
                  {[
                    { to: '/profile', label: 'Profile Settings' },
                    { to: '/journal', label: 'Farm Journal' },
                    { to: '/orders', label: 'My Orders' },
                    { to: '/prediction-history', label: 'Prediction History' },
                  ].map(link => (
                    <Link
                      key={link.to}
                      to={link.to}
                      className="block rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setDropdownOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1.5" style={{ borderTop: '1px solid var(--border-light)' }} />
                  <button
                    className="w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all"
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.07)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile: notif + hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          {user && (
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}
              >
                <BellIcon count={unreadCount} />
              </button>
              {notifOpen && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  markAllAsRead={markAllAsRead}
                  onClose={() => setNotifOpen(false)}
                />
              )}
            </div>
          )}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
            }}
            onClick={() => setMobileOpen(p => !p)}
            type="button"
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="mt-3 pt-3 grid gap-1 lg:hidden animate-fadeIn"
          style={{ borderTop: '1px solid var(--border-light)' }}
        >
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all"
              style={({ isActive }) =>
                isActive
                  ? { background: 'rgba(26,122,76,0.1)', color: 'var(--brand-500)', border: '1px solid rgba(26,122,76,0.18)' }
                  : { color: 'var(--text-secondary)', border: '1px solid transparent' }
              }
            >
              {link.label}
            </NavLink>
          ))}

          <div className="my-2" style={{ borderTop: '1px solid var(--border-light)' }} />

          {[
            { to: '/profile', label: 'Profile Settings' },
            { to: '/journal', label: 'Farm Journal' },
            { to: '/orders', label: 'My Orders' },
            { to: '/prediction-history', label: 'Prediction History' },
          ].map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-2xl px-4 py-2.5 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex items-center justify-between px-4 py-2 mt-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
            </button>
            <button
              className="rounded-xl border px-3 py-2 text-sm font-semibold text-red-500"
              style={{ borderColor: 'rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)' }}
              onClick={handleLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
