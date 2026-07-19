import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar, BottomNavBar } from '../components/Layout/Layout';
import { Chip } from '../components/UI/Chip';
import { Tag } from '../components/UI/Chip';
import { Button } from '../components/UI/Button';
import { Icon } from '../components/UI/Icon';
import { db } from '../data/db';
import { useAuth } from '../context/AuthContext';
import { filterCategories } from '../data/mockData';
import './SearchTutorsPage.css';

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' },
  }),
};

export default function SearchTutorsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('Todo');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Trigger state update on actions
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  // Load all programmed or active classes
  const classesList = db.getClasses().filter(c => c.status === 'Programada' || c.status === 'En curso');

  // Filter logic
  const filteredClasses = classesList.filter((classItem) => {
    // 1. Filter by Category Chip
    const matchesCategory =
      activeFilter === 'Todo' ||
      classItem.subject.toLowerCase() === activeFilter.toLowerCase();

    // 2. Filter by Search Box Query
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === '' ||
      classItem.title.toLowerCase().includes(query) ||
      classItem.description.toLowerCase().includes(query) ||
      classItem.tutorName.toLowerCase().includes(query) ||
      classItem.subject.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  const handleEnroll = (classItem) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para inscribirte.');
      return;
    }

    if (currentUser.role !== 'student') {
      alert('Solo los estudiantes pueden inscribirse en las clases.');
      return;
    }

    const res = db.enrollStudent(classItem.id, currentUser.id, currentUser.name);
    if (res.success) {
      setSuccessMessage(`Te has inscrito exitosamente en la clase: "${classItem.title}"`);
      setShowSuccessModal(true);
      forceUpdate();
    } else {
      alert(res.error || 'Ocurrió un error al inscribirse.');
    }
  };

  return (
    <>
      <TopAppBar />
      <main className="search-page app-shell app-shell--with-bottomnav">
        <div className="search-page__inner">
          
          {/* Header Description */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h2 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Clases Disponibles</h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Explora e inscríbete en las tutorías y talleres programados por los mentores de la UTP.
            </p>
          </div>

          {/* Search Bar */}
          <section className="search-bar-section">
            <motion.div
              className={`search-bar ${searchFocused ? 'search-bar--focused' : ''}`}
              animate={{ scale: searchFocused ? 1.01 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <Icon name="search" size={24} style={{ color: 'var(--color-on-surface-variant)' }} />
              <input
                className="search-bar__input"
                type="text"
                placeholder="Buscar por materia, tema, título o mentor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </motion.div>
          </section>

          {/* Filter Chips */}
          <section className="search-filters hide-scrollbar">
            {filterCategories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                active={activeFilter === cat}
                onClick={() => setActiveFilter(cat)}
              />
            ))}
          </section>

          {/* Class Grid */}
          <section className="search-grid">
            {filteredClasses.length > 0 ? (
              filteredClasses.map((c, i) => {
                const isEnrolled = c.studentIds && c.studentIds.includes(currentUser?.id);
                const isFull = c.studentIds && c.capacity && c.studentIds.length >= c.capacity;
                const capacityText = `${c.studentIds ? c.studentIds.length : 0} / ${c.capacity || '∞'} alumnos`;

                return (
                  <motion.div
                    key={c.id}
                    className="tutor-card"
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(20,29,35,0.12)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <div className="tutor-card__top">
                      <div className="tutor-card__profile">
                        <div className="tutor-card__avatar">
                          <img src={c.tutorAvatar} alt={c.tutorName} />
                        </div>
                        <div>
                          <h3 className="text-label-md tutor-card__name" style={{ fontSize: 15, fontWeight: 700 }}>{c.title}</h3>
                          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                            Mentor: <strong>{c.tutorName}</strong>
                          </p>
                        </div>
                      </div>
                      <div className="tutor-card__rating">
                        <span style={{
                          fontSize: 10,
                          background: 'rgba(61, 92, 162, 0.12)',
                          color: 'var(--color-secondary)',
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>{c.subject}</span>
                      </div>
                    </div>

                    <div style={{ margin: 'var(--space-xs) 0 var(--space-sm) 0' }}>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: 40, lineHeight: 1.4 }}>
                        {c.description}
                      </p>
                    </div>

                    <div className="tutor-card__tags" style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginBottom: 'var(--space-sm)', fontSize: 12, color: 'var(--color-outline)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                        <span>{c.date}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                        <span>{c.startTime} - {c.endTime}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>videocam</span>
                        <span style={{ fontWeight: 600 }}>{c.platform}</span>
                      </div>
                    </div>

                    <div className="tutor-card__footer" style={{ borderTop: '1px solid rgba(229, 189, 187, 0.2)', paddingTop: 'var(--space-sm)' }}>
                      <div className="tutor-card__availability">
                        <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Capacidad</span>
                        <span className="text-body-sm" style={{ fontWeight: 600, color: isFull && !isEnrolled ? 'var(--color-primary)' : 'var(--color-success)' }}>{capacityText}</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/class/${c.id}`}>
                          <Button variant="outline" size="small">Detalle</Button>
                        </Link>
                        {isEnrolled ? (
                          <Button variant="primary" disabled size="small" icon="done">Inscrito</Button>
                        ) : isFull ? (
                          <Button variant="outline" disabled size="small">Lleno</Button>
                        ) : (
                          <Button variant="primary" size="small" onClick={() => handleEnroll(c)}>Inscribirse</Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: 'var(--space-2xl) var(--space-md)',
                color: 'var(--color-on-surface-variant)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>search_off</span>
                <p className="text-body-lg" style={{ fontWeight: 600 }}>No se encontraron clases disponibles</p>
                <p className="text-body-sm">Prueba ajustando los filtros o la barra de búsqueda.</p>
              </div>
            )}
          </section>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="modal-overlay">
            <div className="modal-backdrop" onClick={() => setShowSuccessModal(false)} />
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ textAlign: 'center', maxWidth: 400, padding: 'var(--space-xl)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-success)', marginBottom: 'var(--space-md)' }}>check_circle</span>
              <h3 className="text-headline-md" style={{ marginBottom: 'var(--space-sm)' }}>¡Inscripción Exitosa!</h3>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>{successMessage}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>Ir a Mis Tutorías</Button>
                <Button variant="outline" fullWidth onClick={() => setShowSuccessModal(false)}>Seguir Buscando</Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* FAB */}
        <Link to="/dashboard">
          <motion.button
            className="search-fab"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Mis Tutorías"
          >
            <Icon name="event_note" size={24} style={{ color: 'white' }} />
          </motion.button>
        </Link>
      </main>
      <BottomNavBar />
    </>
  );
}
