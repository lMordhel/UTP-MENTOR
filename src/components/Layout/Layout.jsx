import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../data/db';
import { motion, AnimatePresence } from 'framer-motion';
import './layout.css';

// ─── Notification Bell ─────────────────────────────────────────────────────────
export function NotificationBell() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const load = () => {
    if (!currentUser) return;
    const notifs = db.getNotifications(currentUser.id);
    setNotifications(notifs.slice(0, 12));
    setUnread(notifs.filter(n => !n.read).length);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [currentUser]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = () => {
    setOpen(v => !v);
  };

  const handleMarkAll = () => {
    if (!currentUser) return;
    db.markAllNotificationsRead(currentUser.id);
    load();
  };

  const handleClick = (notif) => {
    db.markNotificationRead(notif.id);
    setOpen(false);
    if (notif.relatedId) {
      if (notif.type === 'request_ready' || notif.type === 'request_accepted' ||
          notif.type === 'request_rejected' || notif.type === 'voting_open') {
        navigate(`/requests/${notif.relatedId}`);
      } else if (notif.type === 'class_created' || notif.type === 'verification') {
        navigate('/dashboard');
      }
    }
    load();
  };

  const typeIcon = {
    request_ready: 'groups',
    request_accepted: 'check_circle',
    request_rejected: 'cancel',
    voting_open: 'how_to_vote',
    class_created: 'event',
    verification: 'verified_user',
  };

  const typeColor = {
    request_ready: 'var(--color-secondary)',
    request_accepted: 'var(--color-success)',
    request_rejected: 'var(--color-primary)',
    voting_open: 'var(--color-warning)',
    class_created: 'var(--color-success)',
    verification: 'var(--color-secondary)',
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={handleOpen}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-on-surface-variant)',
          transition: 'background 0.2s',
        }}
        aria-label="Notificaciones"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 24 }}>notifications</span>
        {unread > 0 && (
          <span style={{
            position: 'absolute',
            top: 2,
            right: 2,
            background: 'var(--color-primary)',
            color: 'white',
            borderRadius: '50%',
            minWidth: 18,
            height: 18,
            fontSize: 11,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: '0 4px',
          }}>
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              right: 0,
              top: 'calc(100% + 8px)',
              width: 340,
              maxHeight: 480,
              background: 'var(--color-surface)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 2000,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--color-outline-variant)',
            }}>
              <p className="text-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>
                Notificaciones {unread > 0 && <span style={{ color: 'var(--color-primary)' }}>({unread})</span>}
              </p>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)', fontSize: 12, fontWeight: 600 }}
                >
                  Marcar todo como leído
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 40, opacity: 0.4, display: 'block', marginBottom: 8 }}>notifications_none</span>
                  <p className="text-body-sm">No tienes notificaciones</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderBottom: '1px solid var(--color-outline-variant)',
                      background: n.read ? 'transparent' : 'rgba(var(--color-primary-rgb, 61,92,162), 0.04)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-container)'}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(61,92,162, 0.04)'}
                  >
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${typeColor[n.type] || 'var(--color-secondary)'}18`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: typeColor[n.type] || 'var(--color-secondary)' }}>
                        {typeIcon[n.type] || 'info'}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-label-sm" style={{ color: 'var(--color-on-surface)', fontWeight: n.read ? 500 : 700, marginBottom: 2, lineHeight: 1.3 }}>
                        {n.title}
                      </p>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: 12, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {n.message}
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--color-outline)', marginTop: 4 }}>
                        {new Date(n.createdAt).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    {!n.read && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', flexShrink: 0, marginTop: 4 }} />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Top App Bar ────────────────────────────────────────────────────────────────
export function TopAppBar({ showBack = false }) {
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropRef = useRef(null);

  const logoRedirectPath = currentUser
    ? (currentUser.role === 'student' ? '/search' : '/dashboard')
    : '/';

  useEffect(() => {
    function handleClick(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setIsDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="topbar">
      <div className="topbar__left">
        {showBack ? (
          <Link to={-1} className="topbar__back">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        ) : (
          <Link to={logoRedirectPath} className="topbar__logo-link">
            <div className="topbar__logo">
              <span className="material-symbols-outlined" style={{ color: 'white', fontSize: 20, fontVariationSettings: "'FILL' 1" }}>
                school
              </span>
            </div>
          </Link>
        )}
        <Link to={logoRedirectPath} className="topbar__brand text-headline-md">UTP Mentors</Link>
      </div>
      <div className="topbar__right">
        {currentUser && <NotificationBell />}

        {/* Profile Avatar with Dropdown */}
        <div ref={dropRef} style={{ position: 'relative' }}>
          <div
            className="topbar__avatar"
            style={{ cursor: 'pointer', overflow: 'hidden', border: '1px solid var(--color-outline-variant)' }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-secondary-container)' }}>
                person
              </span>
            )}
          </div>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 'var(--space-md)',
                  width: 240,
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-sm)'
                }}
              >
                <div>
                  <p className="text-label-md" style={{ color: 'var(--color-on-surface)', marginBottom: 2 }}>{currentUser?.name}</p>
                  <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.8, fontSize: 11, wordBreak: 'break-all', marginBottom: 6 }}>{currentUser?.email}</p>
                  <div style={{
                    display: 'inline-block',
                    background: 'var(--color-primary-container)',
                    color: 'var(--color-on-primary-container)',
                    fontSize: 10,
                    fontWeight: 'bold',
                    padding: '2px 8px',
                    borderRadius: 4,
                    textTransform: 'uppercase'
                  }}>
                    {currentUser?.role === 'admin' ? 'Administrador' : currentUser?.role === 'tutor' ? 'Tutor' : 'Estudiante'}
                  </div>
                </div>
                <div style={{ height: 1, background: 'rgba(229, 189, 187, 0.3)' }} />
                <button
                  onClick={() => { logout(); window.location.href = '/'; }}
                  style={{
                    background: 'none', border: 'none', display: 'flex', alignItems: 'center',
                    gap: 8, width: '100%', textAlign: 'left', padding: 'var(--space-sm) 0',
                    color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600
                  }}
                  className="text-label-md"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>logout</span>
                  Cerrar Sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

// ─── Bottom Nav Bar ─────────────────────────────────────────────────────────────
export function BottomNavBar() {
  const location = useLocation();
  const path = location.pathname;
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  let navItems = [];
  if (currentUser.role === 'student') {
    navItems = [
      { icon: 'search', label: 'Buscar', path: '/search' },
      { icon: 'campaign', label: 'Solicitudes', path: '/requests' },
      { icon: 'event_note', label: 'Mis Tutorías', path: '/dashboard' },
    ];
  } else if (currentUser.role === 'tutor') {
    navItems = [
      { icon: 'event_note', label: 'Mis Clases', path: '/dashboard' },
      { icon: 'campaign', label: 'Solicitudes', path: '/requests' },
    ];
  } else {
    navItems = [
      { icon: 'analytics', label: 'Estadísticas', path: '/dashboard' },
      { icon: 'campaign', label: 'Solicitudes', path: '/requests' },
      { icon: 'search', label: 'Buscar', path: '/search' },
    ];
  }

  return (
    <nav className="bottomnav">
      {navItems.map((item) => {
        const isActive = path === item.path;
        return (
          <Link key={item.path} to={item.path} className={`bottomnav__item ${isActive ? 'bottomnav__item--active' : ''}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
              {item.icon}
            </span>
            <span className="text-label-md">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

// ─── Sidebar ────────────────────────────────────────────────────────────────────
export function Sidebar() {
  const location = useLocation();
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  let navItems = [];
  let title = 'UTP Mentors';
  let subtitle = 'Comunidad Académica';

  if (currentUser.role === 'admin') {
    title = 'Admin Central';
    subtitle = 'UTP Administración';
    navItems = [
      { icon: 'analytics', label: 'Estadísticas', path: '/dashboard' },
      { icon: 'verified_user', label: 'Aprobaciones', path: '/dashboard?tab=approvals' },
      { icon: 'group', label: 'Usuarios', path: '/dashboard?tab=users' },
      { icon: 'description', label: 'Reportes', path: '/dashboard?tab=reports' },
      { icon: 'campaign', label: 'Solicitudes', path: '/requests' },
    ];
  } else if (currentUser.role === 'tutor') {
    title = `Mentor ${currentUser.name.split(' ')[0]}`;
    subtitle = currentUser.career;
    navItems = [
      { icon: 'event_note', label: 'Mis Clases', path: '/dashboard' },
      { icon: 'campaign', label: 'Solicitudes', path: '/requests' },
      { icon: 'star', label: 'Calificaciones', path: '#' },
    ];
    if (currentUser.isPending) {
      navItems.unshift({ icon: 'upload_file', label: 'Verificación', path: '/tutor-verification', highlight: true });
    }
  } else {
    title = currentUser.name;
    subtitle = currentUser.career;
    navItems = [
      { icon: 'search', label: 'Buscar Clases', path: '/search' },
      { icon: 'campaign', label: 'Solicitar Clase', path: '/requests' },
      { icon: 'event_note', label: 'Mis Tutorías', path: '/dashboard' },
    ];
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__header-icon">
          <span className="material-symbols-outlined" style={{ color: 'var(--color-primary)', fontSize: 24 }}>
            {currentUser.role === 'admin' ? 'shield' : (currentUser.role === 'tutor' ? 'psychology' : 'school')}
          </span>
        </div>
        <div>
          <p className="text-body-md" style={{ fontWeight: 700, color: 'var(--color-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>{title}</p>
          <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{subtitle}</p>
        </div>
      </div>
      <span className="text-label-sm sidebar__version">v2.0.0</span>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const currentPathWithSearch = location.pathname + location.search;
          const isActive = currentPathWithSearch === item.path ||
            (item.path === '/dashboard' && location.pathname === '/dashboard' && !location.search);
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              style={item.highlight ? { color: 'var(--color-warning)', background: 'rgba(249, 168, 37, 0.08)' } : {}}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-body-md">{item.label}</span>
              {item.highlight && (
                <span style={{
                  marginLeft: 'auto',
                  fontSize: 10,
                  background: 'var(--color-warning)',
                  color: 'white',
                  padding: '1px 6px',
                  borderRadius: 4,
                  fontWeight: 'bold',
                }}>PENDIENTE</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
