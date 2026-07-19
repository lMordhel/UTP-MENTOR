import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar, BottomNavBar, Sidebar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { db } from '../data/db';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/UI/Modal';
import { Input, Textarea } from '../components/UI/Input';
import { Select } from '../components/UI/Input';
import './ClassRequestsPage.css';

const STATUS_META = {
  'Esperando interesados': { color: 'var(--color-on-surface-variant)', bg: 'var(--color-surface-container)', icon: 'group_add' },
  'Lista para revisión': { color: '#b45309', bg: 'rgba(180,83,9,0.1)', icon: 'rate_review' },
  'En revisión': { color: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: 'manage_search' },
  'Aceptada': { color: 'var(--color-success)', bg: 'rgba(46,125,50,0.1)', icon: 'thumb_up' },
  'Votación abierta': { color: 'var(--color-secondary)', bg: 'rgba(61,92,162,0.1)', icon: 'how_to_vote' },
  'Votación cerrada': { color: 'var(--color-secondary)', bg: 'rgba(61,92,162,0.08)', icon: 'done_all' },
  'Rechazada': { color: 'var(--color-primary)', bg: 'rgba(158,0,31,0.08)', icon: 'cancel' },
  'Clase creada': { color: 'var(--color-success)', bg: 'rgba(46,125,50,0.12)', icon: 'event_available' },
};

const CATEGORIES = ['Todos', 'Programación', 'Matemática', 'Física', 'Comunicación', 'Algoritmos', 'General'];
const FILTER_STATUSES = ['Todos', 'Esperando interesados', 'Lista para revisión', 'Aceptada', 'Votación abierta', 'Rechazada', 'Clase creada'];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function ClassRequestsPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterCategory, setFilterCategory] = useState('Todos');
  const [showModal, setShowModal] = useState(false);

  // New request form
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('General');
  const [formReason, setFormReason] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const requests = db.getClassRequests();

  const filtered = requests.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q || r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'Todos' || r.status === filterStatus;
    const matchCategory = filterCategory === 'Todos' || r.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const handleInterest = (req) => {
    if (!currentUser || currentUser.role !== 'student') {
      alert('Solo los estudiantes pueden unirse a solicitudes.');
      return;
    }
    const res = db.addInterest(req.id, currentUser.id, currentUser.name);
    if (!res.success) { alert(res.error); return; }
    forceUpdate();
  };

  const handleRemoveInterest = (req) => {
    const res = db.removeInterest(req.id, currentUser.id);
    if (!res.success) { alert(res.error); return; }
    forceUpdate();
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle.trim()) { setFormError('El título es obligatorio.'); return; }
    if (!formDesc.trim()) { setFormError('La descripción es obligatoria.'); return; }
    if (!formReason.trim()) { setFormError('El motivo es obligatorio.'); return; }

    setSubmitting(true);
    setTimeout(() => {
      db.createClassRequest({
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        reason: formReason.trim(),
        createdBy: currentUser.id,
        createdByName: currentUser.name,
      });
      setFormTitle(''); setFormDesc(''); setFormCategory('General'); setFormReason('');
      setShowModal(false);
      setSubmitting(false);
      forceUpdate();
    }, 600);
  };

  const canCreateRequest = currentUser?.role === 'student';
  const config = db.getConfig();
  const threshold = config.minInterestThreshold || 3;

  const getProgressPct = (req) => Math.min(100, (req.interestedIds.length / threshold) * 100);

  return (
    <>
      <TopAppBar />
      <Sidebar />
      <main className="req-page app-shell app-shell--with-sidebar app-shell--with-bottomnav">
        <div className="req-page__inner">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="req-page__header">
            <div>
              <h2 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>Solicitudes de Clases</h2>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                Propón nuevas clases, únete a solicitudes activas y vota el horario que prefieras.
              </p>
            </div>
            {canCreateRequest && (
              <Button variant="primary" icon="add" onClick={() => setShowModal(true)}>
                Nueva Solicitud
              </Button>
            )}
          </motion.div>

          {/* Stats row */}
          <div className="req-stats">
            {[
              { label: 'Total Solicitudes', value: requests.length, icon: 'campaign', color: 'var(--color-primary)' },
              { label: 'Listas para revisión', value: requests.filter(r => r.status === 'Lista para revisión').length, icon: 'rate_review', color: '#b45309' },
              { label: 'Votación Abierta', value: requests.filter(r => r.status === 'Votación abierta').length, icon: 'how_to_vote', color: 'var(--color-secondary)' },
              { label: 'Clases Generadas', value: requests.filter(r => r.status === 'Clase creada').length, icon: 'event_available', color: 'var(--color-success)' },
            ].map((s) => (
              <div key={s.label} className="req-stat-card">
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: s.color, fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                <div>
                  <p className="text-headline-md" style={{ color: 'var(--color-on-surface)', lineHeight: 1 }}>{s.value}</p>
                  <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="req-filters">
            <div style={{ position: 'relative', flex: '2 1 220px' }}>
              <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline)', fontSize: 20 }}>search</span>
              <input
                type="text"
                placeholder="Buscar solicitud..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 36px', border: '1px solid var(--color-outline)',
                  borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)',
                  color: 'var(--color-on-surface)', fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="req-select">
              {FILTER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="req-select">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Request Cards Grid */}
          <div className="req-grid">
            <AnimatePresence>
              {filtered.length > 0 ? filtered.map((req, i) => {
                const meta = STATUS_META[req.status] || STATUS_META['Esperando interesados'];
                const isInterested = req.interestedIds.includes(currentUser?.id);
                const isCreator = req.createdBy === currentUser?.id;
                const pct = getProgressPct(req);
                const reached = req.interestedIds.length >= threshold;

                return (
                  <motion.div key={req.id} custom={i} variants={cardVariants} initial="hidden" animate="visible"
                    className="req-card"
                    whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(20,29,35,0.12)' }}
                    transition={{ type: 'spring', stiffness: 280 }}
                  >
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
                          background: 'rgba(61,92,162,0.1)', color: 'var(--color-secondary)',
                          padding: '2px 8px', borderRadius: 3, display: 'inline-block', marginBottom: 6,
                        }}>{req.category}</span>
                        <h3 className="text-label-md" style={{ color: 'var(--color-on-surface)', fontWeight: 700, lineHeight: 1.3 }}>
                          {req.title}
                        </h3>
                      </div>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase',
                        background: meta.bg, color: meta.color,
                        padding: '3px 8px', borderRadius: 4, whiteSpace: 'nowrap', flexShrink: 0,
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                        {req.status}
                      </span>
                    </div>

                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.5, marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {req.description}
                    </p>

                    {/* Interest progress */}
                    {(req.status === 'Esperando interesados' || req.status === 'Lista para revisión') && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                            {req.interestedIds.length} / {threshold} interesados requeridos
                          </span>
                          {reached && (
                            <span className="text-label-sm" style={{ color: '#b45309', fontWeight: 700 }}>¡Listo!</span>
                          )}
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--color-surface-container-highest)', overflow: 'hidden' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            style={{ height: '100%', background: reached ? 'var(--color-success)' : 'var(--color-secondary)', borderRadius: 3 }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--color-outline-variant)', gap: 8 }}>
                      <div>
                        <p style={{ fontSize: 11, color: 'var(--color-outline)' }}>
                          Por <strong>{req.createdByName}</strong>
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--color-outline)' }}>
                          {new Date(req.createdAt).toLocaleDateString('es-PE')}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Link to={`/requests/${req.id}`}>
                          <Button variant="outline" size="small">Ver Detalle</Button>
                        </Link>
                        {currentUser?.role === 'student' && !isCreator && (
                          req.status === 'Esperando interesados' || req.status === 'Lista para revisión'
                        ) ? (
                          isInterested ? (
                            <Button variant="outline" size="small" onClick={() => handleRemoveInterest(req)}>Retirarme</Button>
                          ) : (
                            <Button variant="primary" size="small" onClick={() => handleInterest(req)}>Unirme</Button>
                          )
                        ) : null}
                        {isCreator && (
                          <span className="text-label-sm" style={{ color: 'var(--color-secondary)', alignSelf: 'center', fontWeight: 600 }}>Tu solicitud</span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              }) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--color-on-surface-variant)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 56, opacity: 0.35, display: 'block', marginBottom: 12 }}>search_off</span>
                  <p className="text-body-lg" style={{ fontWeight: 600 }}>No se encontraron solicitudes</p>
                  <p className="text-body-sm" style={{ marginBottom: 'var(--space-md)' }}>Ajusta los filtros o crea la primera solicitud.</p>
                  {canCreateRequest && (
                    <Button variant="primary" icon="add" onClick={() => setShowModal(true)}>Nueva Solicitud</Button>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Create Request Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmitRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: 520 }}>
          <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 4 }}>Nueva Solicitud de Clase</h3>
          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
            Completa la información para que otros alumnos se unan a tu solicitud y un profesor pueda revisarla.
          </p>

          <Input
            label="Título de la clase *"
            id="req-title"
            required
            placeholder="Ej: Introducción a Machine Learning con Python"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />

          <div>
            <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 6 }}>Categoría</label>
            <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="req-select" style={{ width: '100%' }}>
              {['Programación', 'Matemática', 'Física', 'Comunicación', 'Algoritmos', 'General'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <Textarea
            label="Descripción del tema *"
            id="req-desc"
            required
            placeholder="Describe brevemente el contenido que te gustaría aprender..."
            maxLength={500}
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
          />

          <Textarea
            label="¿Qué esperas aprender? *"
            id="req-reason"
            required
            placeholder="Explica el motivo de tu solicitud y qué habilidades quieres adquirir..."
            maxLength={400}
            value={formReason}
            onChange={(e) => setFormReason(e.target.value)}
          />

          {formError && (
            <p className="text-body-sm" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⚠ {formError}</p>
          )}

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Crear Solicitud'}
            </Button>
          </div>
        </form>
      </Modal>

      <BottomNavBar />
    </>
  );
}
