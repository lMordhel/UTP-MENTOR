import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar, Sidebar, BottomNavBar } from '../components/Layout/Layout';
import { StatCard } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Icon } from '../components/UI/Icon';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/db';
import { Modal } from '../components/UI/Modal';
import { Input, Select, Textarea } from '../components/UI/Input';
import './DashboardPage.css';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function DashboardPage() {
  const { currentUser, refreshSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'analytics';

  // State for user directory search
  const [usersSearch, setUsersSearch] = useState('');

  // Trigger state update on actions
  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  // Class creation/editing states
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('');
  const [formEndTime, setFormEndTime] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formPlatform, setFormPlatform] = useState('Google Meet');
  const [formMeetingLink, setFormMeetingLink] = useState('');
  const [formMaterials, setFormMaterials] = useState('');
  const [formStatus, setFormStatus] = useState('Programada');
  const [formCapacity, setFormCapacity] = useState(10);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setFormTitle('');
    setFormDescription('');
    setFormDate('');
    setFormStartTime('');
    setFormEndTime('');
    setFormSubject('');
    setFormPlatform('Google Meet');
    setFormMeetingLink('');
    setFormMaterials('');
    setFormStatus('Programada');
    setFormCapacity(10);
    setShowClassModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingClass(c);
    setFormTitle(c.title);
    setFormDescription(c.description);
    setFormDate(c.date);
    setFormStartTime(c.startTime);
    setFormEndTime(c.endTime);
    setFormSubject(c.subject);
    setFormPlatform(c.platform || 'Google Meet');
    setFormMeetingLink(c.meetingLink || '');
    setFormMaterials(c.materials || '');
    setFormStatus(c.status || 'Programada');
    setFormCapacity(c.capacity || 10);
    setShowClassModal(true);
  };

  const handleSaveClass = (e) => {
    e.preventDefault();
    if (!formTitle || !formDescription || !formDate || !formStartTime || !formEndTime || !formSubject || !formMeetingLink) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    const classData = {
      title: formTitle,
      description: formDescription,
      date: formDate,
      startTime: formStartTime,
      endTime: formEndTime,
      subject: formSubject,
      platform: formPlatform,
      meetingLink: formMeetingLink,
      materials: formMaterials,
      capacity: Number(formCapacity),
      status: formStatus,
    };

    if (editingClass) {
      db.updateClass(editingClass.id, classData);
    } else {
      db.createClass({
        ...classData,
        tutorId: currentUser.role === 'admin' ? 1 : currentUser.tutorId,
        tutorName: currentUser.role === 'admin' ? 'Ricardo Alarcón' : currentUser.name,
        tutorAvatar: currentUser.role === 'admin' 
          ? 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi4MYHROughn1gYtmaHBoVRqc0c36V6CC-yzOI_Xe3XXBJgztnNGqLh3dvnnO-ensA4DodAbAQI6FNoBAGS-wFA8v00CYEzwSApY9va2prtKuzybdrL_hf9u8dAqN5J7IS20Qiamy3eUgt-gw_SFdtO-YQ9-o7460N_Z3GhLSp7eJiRyIwixYEVoS85VXvL9DRYr55dktWkYS9fnjDbglmCbqfnGiV6qEE6MdvWZas9DN2i8DLUi2ggn4p4zrUwKWk04a_feUXg6g' 
          : (currentUser.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi4MYHROughn1gYtmaHBoVRqc0c36V6CC-yzOI_Xe3XXBJgztnNGqLh3dvnnO-ensA4DodAbAQI6FNoBAGS-wFA8v00CYEzwSApY9va2prtKuzybdrL_hf9u8dAqN5J7IS20Qiamy3eUgt-gw_SFdtO-YQ9-o7460N_Z3GhLSp7eJiRyIwixYEVoS85VXvL9DRYr55dktWkYS9fnjDbglmCbqfnGiV6qEE6MdvWZas9DN2i8DLUi2ggn4p4zrUwKWk04a_feUXg6g'),
      });
    }
    setShowClassModal(false);
    forceUpdate();
  };

  const handleDeleteClass = (classId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta clase?')) {
      db.deleteClass(classId);
      forceUpdate();
    }
  };

  if (!currentUser) return null;

  // --- ADMIN DASHBOARD ---
  if (currentUser.role === 'admin') {
    const allUsers = db.getUsers();
    const activeTutors = db.getTutors();
    const pendingTutors = db.getPendingTutors();
    const allClasses = db.getClasses();

    const totalStudents = allUsers.filter(u => u.role === 'student').length + 5420;
    const totalSessions = allClasses.length + 3110;

    const [expandedTutor, setExpandedTutor] = useState(null);
    const [adminNote, setAdminNote] = useState('');
    const [observeDocId, setObserveDocId] = useState('');
    const [observeNote, setObserveNote] = useState('');

    const handleApproveTutor = (pendingId) => {
      if (db.approveTutor(pendingId, currentUser.id, currentUser.name)) {
        forceUpdate();
        refreshSession();
      }
    };

    const handleRejectTutor = (pendingId, reason) => {
      if (db.rejectTutor(pendingId, currentUser.id, currentUser.name, reason || adminNote)) {
        forceUpdate();
      }
    };

    const handleSetStatus = (pendingId, status) => {
      db.setVerificationStatus(pendingId, status, adminNote, currentUser.id, currentUser.name);
      setAdminNote('');
      forceUpdate();
    };

    const handleObserveDoc = (pendingId) => {
      if (!observeDocId || !observeNote) { alert('Selecciona un documento e ingresa la observación.'); return; }
      db.observeDocument(pendingId, observeDocId, observeNote);
      setObserveDocId(''); setObserveNote('');
      forceUpdate();
    };

    const filteredUsers = allUsers.filter(u => 
      u.name.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(usersSearch.toLowerCase()) ||
      u.role.toLowerCase().includes(usersSearch.toLowerCase()) ||
      (u.career && u.career.toLowerCase().includes(usersSearch.toLowerCase()))
    );

    return (
      <>
        <TopAppBar />
        <Sidebar />
        <main className="dashboard app-shell app-shell--with-sidebar app-shell--with-bottomnav">
          <div className="dashboard__inner">
            
            {/* 1. ANALYTICS TAB */}
            {tab === 'analytics' && (
              <motion.div variants={stagger} initial="hidden" animate="visible">
                <div className="dashboard__header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <h2 className="text-headline-lg">Panel de Control Administrativo</h2>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Monitoreo de rendimiento en tiempo real y aprobación de mentores.
                    </p>
                  </div>
                  <div className="dashboard__header-actions" style={{ display: 'flex', gap: 8 }}>
                    <Button variant="ghost" icon="download" onClick={() => alert('Generando reporte general...')}>Exportar</Button>
                    <Button variant="primary" icon="add" onClick={handleOpenCreate}>Crear Clase</Button>
                  </div>
                </div>

                <div className="dashboard__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
                  <StatCard
                    icon="school"
                    iconColor="var(--color-primary)"
                    label="Total Estudiantes"
                    value={totalStudents.toLocaleString()}
                    trend="trending_up"
                    trendLabel="+4.2% del mes pasado"
                    trendColor="var(--color-success)"
                  />
                  <StatCard
                    icon="person_check"
                    iconColor="var(--color-secondary)"
                    label="Tutores Activos"
                    value={activeTutors.length.toString()}
                    trend="check_circle"
                    trendLabel="92% Tasa de Participación"
                    trendColor="var(--color-success)"
                  />
                  <StatCard
                    icon="co_present"
                    iconColor="var(--color-primary-container)"
                    label="Clases Totales"
                    value={allClasses.length.toString()}
                    trend="calendar_month"
                    trendLabel="Control global"
                    trendColor="var(--color-primary)"
                  />
                </div>

                <div className="dashboard__main-grid">
                  <section className="dashboard__pending" style={{ height: 'fit-content' }}>
                    <div className="dashboard__pending-header">
                      <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Aprobaciones Pendientes</h4>
                      <Link to="/dashboard?tab=approvals" className="text-label-sm" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>Ver todo</Link>
                    </div>
                    <div className="dashboard__pending-list">
                      {pendingTutors.length > 0 ? (
                        pendingTutors.slice(0, 3).map((tutor) => (
                          <div key={tutor.id} className="dashboard__pending-item">
                            <div className="dashboard__pending-avatar" style={{ overflow: 'hidden' }}>
                              <img src={tutor.avatar} alt={tutor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div className="dashboard__pending-info">
                              <p className="text-label-md">{tutor.name}</p>
                              <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                                {tutor.career} • Ciclo {tutor.year * 2}
                              </p>
                            </div>
                            <div className="dashboard__pending-actions">
                              <button className="dashboard__action-btn dashboard__action-btn--reject" onClick={() => handleRejectTutor(tutor.id)}>
                                <Icon name="close" size={20} />
                              </button>
                              <button className="dashboard__action-btn dashboard__action-btn--approve" onClick={() => handleApproveTutor(tutor.id)}>
                                <Icon name="check" size={20} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: 'var(--space-lg)', color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 36, marginBottom: 4 }}>done_all</span>
                          <p className="text-label-md">No hay solicitudes pendientes</p>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="dashboard__activity">
                    <div className="dashboard__activity-header">
                      <Icon name="history" size={22} style={{ color: 'var(--color-secondary)' }} />
                      <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Actividad Reciente</h4>
                    </div>
                    <div className="dashboard__timeline">
                      {[
                        { id: '1', icon: 'person_add', bg: 'var(--color-primary-container)', title: 'Nuevo Estudiante', desc: 'Juan Pérez se unió a la comunidad.', time: 'Hace 5 min' },
                        { id: '2', icon: 'verified', bg: 'var(--color-success)', title: 'Mentor Aprobado', desc: 'Elena Vizcarra fue activada como mentora.', time: 'Hace 1 hora' },
                        { id: '3', icon: 'co_present', bg: 'var(--color-secondary-container)', title: 'Tutoría Agendada', desc: 'Reserva de clase de Algoritmos registrada.', time: 'Hace 3 horas' },
                      ].map((item) => (
                        <div key={item.id} className="dashboard__timeline-item">
                          <div className="dashboard__timeline-dot" style={{ background: item.bg, color: 'white' }}>
                            <Icon name={item.icon} size={14} />
                          </div>
                          <div>
                            <p className="text-label-md">{item.title}</p>
                            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 2 }}>{item.desc}</p>
                            <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>{item.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {/* 2. APPROVALS TAB - Enhanced with document review */}
            {tab === 'approvals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="dashboard__header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <h2 className="text-headline-lg">Verificación de Profesores</h2>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Revisa la documentación académica y gestiona el estado de verificación de cada profesor.
                    </p>
                  </div>
                </div>

                <div className="dashboard__pending" style={{ padding: 'var(--space-lg)' }}>
                  <div className="dashboard__pending-header" style={{ marginBottom: 'var(--space-md)' }}>
                    <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Solicitudes de Admisión</h4>
                    <span className="dashboard__pending-badge text-label-sm">{pendingTutors.length} pendientes</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {pendingTutors.length > 0 ? pendingTutors.map((tutor) => {
                      const vs = tutor.verificationStatus || 'pending_review';
                      const vsColors = {
                        pending_review: { c: 'var(--color-on-surface-variant)', b: 'var(--color-surface-container)', l: 'Pendiente de Revisión' },
                        in_review: { c: '#b45309', b: 'rgba(180,83,9,0.1)', l: 'En Revisión' },
                        needs_correction: { c: 'var(--color-primary)', b: 'rgba(158,0,31,0.08)', l: 'Requiere Correcciones' },
                        approved: { c: 'var(--color-success)', b: 'rgba(46,125,50,0.1)', l: 'Aprobado' },
                        rejected: { c: 'var(--color-primary)', b: 'rgba(158,0,31,0.1)', l: 'Rechazado' },
                      };
                      const vsc = vsColors[vs] || vsColors['pending_review'];
                      const isExpanded = expandedTutor === tutor.id;
                      const docs = tutor.documents || [];
                      const observations = tutor.adminObservations || [];

                      return (
                        <div key={tutor.id} style={{
                          background: 'var(--color-surface-container-lowest)',
                          border: '1px solid var(--color-outline-variant)',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-sm)',
                          overflow: 'hidden',
                        }}>
                          {/* Summary row */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-md)', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                              <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-variant)', flexShrink: 0 }}>
                                <img src={tutor.avatar} alt={tutor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                              <div>
                                <p className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{tutor.name}</p>
                                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                                  {tutor.career} • {tutor.email || 'Sin email'}
                                </p>
                                <span style={{ display: 'inline-block', fontSize: 10, background: vsc.b, color: vsc.c, padding: '2px 8px', borderRadius: 4, marginTop: 4, fontWeight: 'bold', textTransform: 'uppercase' }}>
                                  {vsc.l}
                                </span>
                                <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--color-outline)' }}>{docs.length} doc(s) subidos</span>
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <Button variant="ghost" size="small" icon={isExpanded ? 'expand_less' : 'expand_more'}
                                onClick={() => setExpandedTutor(isExpanded ? null : tutor.id)}>
                                {isExpanded ? 'Ocultar' : 'Revisar'}
                              </Button>
                              {vs !== 'approved' && (
                                <Button variant="primary" size="small" icon="check" onClick={() => handleApproveTutor(tutor.id)}>Aprobar</Button>
                              )}
                            </div>
                          </div>

                          {/* Expanded panel */}
                          {isExpanded && (
                            <div style={{ borderTop: '1px solid var(--color-outline-variant)', padding: 'var(--space-md)', background: 'var(--color-surface)' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>

                                {/* Documents */}
                                <div>
                                  <h5 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>Documentos Subidos ({docs.length})</h5>
                                  {docs.length === 0 ? (
                                    <p className="text-body-sm" style={{ color: 'var(--color-outline)', opacity: 0.7 }}>Aún no ha subido documentos.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {docs.map((doc) => (
                                        <div key={doc.id} style={{
                                          display: 'flex', alignItems: 'center', gap: 10,
                                          padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                                          border: `1px solid ${doc.isObserved ? 'var(--color-primary)' : 'var(--color-outline-variant)'}`,
                                          background: doc.isObserved ? 'rgba(158,0,31,0.04)' : 'var(--color-surface-container-lowest)',
                                        }}>
                                          <span className="material-symbols-outlined" style={{ fontSize: 22, color: doc.isObserved ? 'var(--color-primary)' : 'var(--color-secondary)', fontVariationSettings: "'FILL' 1" }}>
                                            {doc.fileType === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                                          </span>
                                          <div style={{ flex: 1, minWidth: 0 }}>
                                            <p className="text-label-sm" style={{ fontWeight: 700, color: 'var(--color-on-surface)' }}>{doc.label}</p>
                                            <p style={{ fontSize: 11, color: 'var(--color-outline)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</p>
                                            {doc.isObserved && (
                                              <p style={{ fontSize: 11, color: 'var(--color-primary)', marginTop: 2 }}>⚠ {doc.observationNote}</p>
                                            )}
                                          </div>
                                          {doc.fileData && (
                                            <a href={doc.fileData} download={doc.fileName} target="_blank" rel="noopener noreferrer">
                                              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-secondary)' }} title="Descargar">
                                                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>download</span>
                                              </button>
                                            </a>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Observe a document */}
                                  {docs.length > 0 && (
                                    <div style={{ marginTop: 'var(--space-sm)', padding: 'var(--space-sm)', background: 'var(--color-surface-container)', borderRadius: 'var(--radius-sm)' }}>
                                      <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>Observar documento:</p>
                                      <select value={observeDocId} onChange={(e) => setObserveDocId(e.target.value)}
                                        style={{ width: '100%', padding: '6px', marginBottom: 6, border: '1px solid var(--color-outline)', borderRadius: 4, background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: 13 }}>
                                        <option value="">Selecciona un doc...</option>
                                        {docs.map(d => <option key={d.id} value={d.id}>{d.label}</option>)}
                                      </select>
                                      <input
                                        placeholder="Descripción de la observación..."
                                        value={observeNote}
                                        onChange={(e) => setObserveNote(e.target.value)}
                                        style={{ width: '100%', padding: '6px', marginBottom: 6, border: '1px solid var(--color-outline)', borderRadius: 4, background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: 13, boxSizing: 'border-box' }}
                                      />
                                      <Button variant="outline" size="small" onClick={() => handleObserveDoc(tutor.id)}>Marcar Observado</Button>
                                    </div>
                                  )}
                                </div>

                                {/* Status Management & History */}
                                <div>
                                  <h5 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-sm)' }}>Gestionar Estado</h5>
                                  <textarea
                                    placeholder="Comentario u observación (opcional para cambios de estado)..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                    rows={3}
                                    style={{ width: '100%', padding: '8px', marginBottom: 8, border: '1px solid var(--color-outline)', borderRadius: 4, background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' }}
                                  />
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <Button variant="outline" size="small" fullWidth onClick={() => handleSetStatus(tutor.id, 'in_review')}>Marcar En Revisión</Button>
                                    <Button variant="outline" size="small" fullWidth onClick={() => handleSetStatus(tutor.id, 'needs_correction')}>Solicitar Correcciones</Button>
                                    <Button variant="primary" size="small" fullWidth onClick={() => handleApproveTutor(tutor.id)} icon="verified">Aprobar Profesor</Button>
                                    <Button variant="outline" size="small" fullWidth onClick={() => { const r = adminNote || prompt('Motivo del rechazo:'); if(r) handleRejectTutor(tutor.id, r); }} style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
                                      Rechazar
                                    </Button>
                                  </div>

                                  <h5 className="text-label-md" style={{ color: 'var(--color-primary)', marginTop: 'var(--space-md)', marginBottom: 'var(--space-sm)' }}>Historial de Revisión</h5>
                                  {(tutor.adminObservations || []).length === 0 ? (
                                    <p className="text-body-sm" style={{ color: 'var(--color-outline)', opacity: 0.7 }}>Sin actividad registrada.</p>
                                  ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                      {(tutor.adminObservations || []).slice().reverse().map((obs, i) => {
                                        const obsColors = { in_review: '#b45309', needs_correction: 'var(--color-primary)', approved: 'var(--color-success)', rejected: 'var(--color-primary)' };
                                        return (
                                          <div key={i} style={{ padding: '8px 10px', borderRadius: 4, background: 'var(--color-surface-container)', borderLeft: `3px solid ${obsColors[obs.action] || 'var(--color-outline)'}` }}>
                                            <p className="text-label-sm" style={{ color: obsColors[obs.action] || 'var(--color-on-surface-variant)', fontWeight: 700 }}>{obs.action?.replace(/_/g, ' ').toUpperCase()}</p>
                                            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>{obs.note || '—'}</p>
                                            <p style={{ fontSize: 10, color: 'var(--color-outline)' }}>{new Date(obs.date).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--color-on-surface-variant)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 8, opacity: 0.5 }}>done_all</span>
                        <p className="text-body-lg" style={{ fontWeight: 600 }}>¡Todo al día!</p>
                        <p className="text-body-sm">No existen más solicitudes de profesores en cola de revisión.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. USERS TAB */}
            {tab === 'users' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="dashboard__header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <h2 className="text-headline-lg">Directorio de Usuarios</h2>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Listado general de alumnos y mentores registrados en la plataforma.
                    </p>
                  </div>
                </div>

                <div className="dashboard__pending" style={{ padding: 'var(--space-lg)' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--color-surface-container)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 'var(--radius-default)',
                    padding: 'var(--space-xs) var(--space-sm)',
                    marginBottom: 'var(--space-lg)',
                    maxWidth: 400
                  }}>
                    <span className="material-symbols-outlined" style={{ marginRight: 8, color: 'var(--color-on-surface-variant)' }}>search</span>
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, email o rol..."
                      value={usersSearch}
                      onChange={(e) => setUsersSearch(e.target.value)}
                      style={{ background: 'none', border: 'none', outline: 'none', width: '100%', fontSize: 14, color: 'var(--color-on-surface)' }}
                    />
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-outline-variant)', color: 'var(--color-on-surface-variant)', fontSize: 13 }}>
                          <th style={{ padding: '12px 8px' }}>Usuario</th>
                          <th style={{ padding: '12px 8px' }}>Email</th>
                          <th style={{ padding: '12px 8px' }}>Rol</th>
                          <th style={{ padding: '12px 8px' }}>Carrera / Especialidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => {
                            const isStudent = user.role === 'student';
                            const isTutor = user.role === 'tutor';
                            return (
                              <tr key={user.id} style={{ borderBottom: '1px solid rgba(229, 189, 187, 0.2)', fontSize: 14 }}>
                                <td style={{ padding: '16px 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
                                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {user.avatar ? (
                                      <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-on-surface-variant)' }}>
                                        {isStudent ? 'school' : (isTutor ? 'psychology' : 'shield')}
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontWeight: 600, color: 'var(--color-on-surface)' }}>{user.name}</span>
                                </td>
                                <td style={{ padding: '16px 8px', color: 'var(--color-on-surface-variant)' }}>{user.email}</td>
                                <td style={{ padding: '16px 8px' }}>
                                  <span style={{
                                    fontSize: 10,
                                    fontWeight: 'bold',
                                    padding: '2px 8px',
                                    borderRadius: 4,
                                    textTransform: 'uppercase',
                                    background: isStudent ? 'rgba(61, 92, 162, 0.12)' : (isTutor ? 'rgba(249, 168, 37, 0.12)' : 'rgba(158, 0, 31, 0.12)'),
                                    color: isStudent ? 'var(--color-secondary)' : (isTutor ? 'var(--color-warning)' : 'var(--color-primary)')
                                  }}>
                                    {user.role}
                                  </span>
                                </td>
                                <td style={{ padding: '16px 8px', color: 'var(--color-on-surface-variant)' }}>{user.career || 'N/A'}</td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-on-surface-variant)' }}>No se encontraron usuarios coincidentes.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 4. REPORTS TAB */}
            {tab === 'reports' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="dashboard__header" style={{ marginBottom: 'var(--space-lg)' }}>
                  <div>
                    <h2 className="text-headline-lg">Historial y Control de Clases</h2>
                    <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                      Revisión y gestión de todas las clases creadas por profesores en la plataforma.
                    </p>
                  </div>
                </div>

                <div className="dashboard__pending" style={{ padding: 'var(--space-lg)' }}>
                  <div className="dashboard__pending-header" style={{ marginBottom: 'var(--space-lg)' }}>
                    <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Log de Clases Activas</h4>
                    <span className="dashboard__pending-badge text-label-sm">{allClasses.length} Clases</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                    {allClasses.length > 0 ? (
                      allClasses.map((c) => {
                        const isCompleted = c.status === 'Finalizada';
                        const isCancelled = c.status === 'Cancelada';
                        const isProgrammed = c.status === 'Programada';
                        return (
                          <div key={c.id} style={{
                            background: 'var(--color-surface-container-lowest)',
                            border: '1px solid var(--color-outline-variant)',
                            borderRadius: 'var(--radius-md)',
                            padding: 'var(--space-md)',
                            boxShadow: 'var(--shadow-sm)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                              <div>
                                <p className="text-label-md" style={{ color: 'var(--color-on-surface)', fontSize: 16 }}>
                                  <strong>{c.title}</strong> <span style={{ fontWeight: 'normal', fontSize: 12, color: 'var(--color-secondary)' }}>({c.subject})</span>
                                </p>
                                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                                  Mentor: <strong>{c.tutorName}</strong> • {c.studentIds.length} / {c.capacity || '∞'} Alumnos
                                </p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <span style={{
                                  padding: '2px 10px',
                                  borderRadius: 'var(--radius-full)',
                                  fontSize: 10,
                                  fontWeight: 'bold',
                                  textTransform: 'uppercase',
                                  background: isCompleted ? 'rgba(46, 125, 50, 0.12)' : (isCancelled ? 'rgba(158, 0, 31, 0.12)' : 'rgba(61, 92, 162, 0.12)'),
                                  color: isCompleted ? 'var(--color-success)' : (isCancelled ? 'var(--color-primary)' : 'var(--color-secondary)')
                                }}>
                                  {c.status}
                                </span>
                                <Button variant="ghost" size="small" icon="edit" onClick={() => handleOpenEdit(c)} />
                                <Button variant="ghost" size="small" icon="delete" onClick={() => handleDeleteClass(c.id)} />
                              </div>
                            </div>

                            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
                              {c.description}
                            </p>

                            <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: 12, color: 'var(--color-outline)' }}>
                              <span><strong>Fecha:</strong> {c.date}</span>
                              <span><strong>Horario:</strong> {c.startTime} - {c.endTime}</span>
                              <span><strong>Plataforma:</strong> {c.platform}</span>
                            </div>
                            
                            {c.studentNames && c.studentNames.length > 0 && (
                              <div style={{ marginTop: 8 }}>
                                <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Inscritos: </span>
                                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{c.studentNames.join(', ')}</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: 'var(--space-xl) 0', color: 'var(--color-on-surface-variant)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 36, opacity: 0.5, marginBottom: 4 }}>receipt_long</span>
                        <p className="text-label-md">No hay reportes de tutorías</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        </main>
        
        {/* Render Class editing/creation modal for Admin */}
        <Modal open={showClassModal} onClose={() => setShowClassModal(false)}>
          <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: 500 }}>
            <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
              {editingClass ? 'Editar Clase (Admin)' : 'Crear Nueva Clase (Admin)'}
            </h3>
            
            <Input label="Título de la Clase *" id="class-title" required value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            <Input label="Materia *" id="class-subject" required value={formSubject} onChange={(e) => setFormSubject(e.target.value)} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Input label="Fecha *" type="date" id="class-date" required value={formDate} onChange={(e) => setFormDate(e.target.value)} />
              <Input label="Capacidad *" type="number" id="class-capacity" required min={1} value={formCapacity} onChange={(e) => setFormCapacity(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Input label="Hora Inicio *" type="time" id="class-start" required value={formStartTime} onChange={(e) => setFormStartTime(e.target.value)} />
              <Input label="Hora Fin *" type="time" id="class-end" required value={formEndTime} onChange={(e) => setFormEndTime(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Select label="Plataforma *" id="class-platform" value={formPlatform} onChange={(e) => setFormPlatform(e.target.value)}>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Otro">Otro</option>
              </Select>

              {editingClass && (
                <Select label="Estado *" id="class-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                  <option value="Programada">Programada</option>
                  <option value="En curso">En curso</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Cancelada">Cancelada</option>
                </Select>
              )}
            </div>

            <Input label="Enlace de la Reunión *" type="url" id="class-link" placeholder="https://..." required value={formMeetingLink} onChange={(e) => setFormMeetingLink(e.target.value)} />
            <Input label="Materiales de Apoyo (Opcional)" value={formMaterials} onChange={(e) => setFormMaterials(e.target.value)} />
            <Textarea label="Descripción *" id="class-desc" required maxLength={300} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="button" variant="outline" onClick={() => setShowClassModal(false)}>Cancelar</Button>
              <Button type="submit" variant="primary">Guardar Clase</Button>
            </div>
          </form>
        </Modal>

        <BottomNavBar />
      </>
    );
  }

  // --- STUDENT DASHBOARD ---
  if (currentUser.role === 'student') {
    const studentClasses = db.getClasses().filter(c => c.studentIds && c.studentIds.includes(currentUser.id));
    const activeSessions = studentClasses.filter(c => c.status === 'Programada' || c.status === 'En curso');
    const completedSessions = studentClasses.filter(c => c.status === 'Finalizada');

    return (
      <>
        <TopAppBar />
        <Sidebar />
        <main className="dashboard app-shell app-shell--with-sidebar app-shell--with-bottomnav">
          <div className="dashboard__inner">
            {/* Header */}
            <motion.div
              className="dashboard__header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div>
                <h2 className="text-headline-lg">Mis Tutorías Inscritas</h2>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Visualiza tus clases matriculadas, accede a los enlaces de videollamada y califica a tus mentores.
                </p>
              </div>
              <div className="dashboard__header-actions">
                <Button variant="primary" icon="search" onClick={() => navigate('/search')}>Ver Clases Disponibles</Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="dashboard__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <StatCard
                icon="schedule"
                iconColor="var(--color-secondary)"
                label="Clases Programadas"
                value={activeSessions.length.toString()}
              />
              <StatCard
                icon="check_circle"
                iconColor="var(--color-success)"
                label="Clases Completadas"
                value={completedSessions.length.toString()}
              />
              <StatCard
                icon="person"
                iconColor="var(--color-primary)"
                label="Mi Código UTP"
                value={currentUser.code || 'N/A'}
              />
            </div>

            {/* Classes List */}
            <section className="dashboard__pending" style={{ padding: 'var(--space-lg)', minHeight: 280 }}>
              <div className="dashboard__pending-header" style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Historial Académico de Clases</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {studentClasses.length > 0 ? (
                  studentClasses.map((c) => {
                    const isCompleted = c.status === 'Finalizada';
                    const isCancelled = c.status === 'Cancelada';
                    const isInProgress = c.status === 'En curso';
                    
                    return (
                      <div key={c.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--color-surface-container-lowest)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        boxShadow: 'var(--shadow-sm)',
                        gap: 'var(--space-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', overflow: 'hidden', background: 'var(--color-surface-variant)' }}>
                              <img src={c.tutorAvatar} alt={c.tutorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div>
                              <p className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{c.title}</p>
                              <p className="text-body-sm" style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Tutor: {c.tutorName} • {c.subject}</p>
                            </div>
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: 11,
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            background: isCompleted ? 'rgba(46, 125, 50, 0.12)' : (isCancelled ? 'rgba(158, 0, 31, 0.12)' : 'rgba(61, 92, 162, 0.12)'),
                            color: isCompleted ? 'var(--color-success)' : (isCancelled ? 'var(--color-primary)' : 'var(--color-secondary)'),
                            border: `1px solid ${isCompleted ? 'var(--color-success)' : (isCancelled ? 'var(--color-primary)' : 'var(--color-secondary)')}`
                          }}>
                            {c.status}
                          </span>
                        </div>
                        
                        <div style={{ height: 1, background: 'rgba(229, 189, 187, 0.2)' }} />
                        
                        <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                          {c.description}
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                            <span>{c.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
                            <span>{c.startTime} - {c.endTime}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>videocam</span>
                            <span>{c.platform}</span>
                          </div>
                        </div>

                        {/* Support materials & Meeting Link */}
                        {!isCancelled && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--color-surface-container)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>link</span>
                              <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: 13, textDecoration: 'underline' }}>
                                Entrar a la Videollamada ({c.platform})
                              </a>
                            </div>
                            {c.materials && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>folder</span>
                                <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                                  <strong>Material de apoyo:</strong> {c.materials.startsWith('http') ? (
                                    <a href={c.materials} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', textDecoration: 'underline' }}>Abrir Material</a>
                                  ) : c.materials}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                          {!isCompleted && !isCancelled && (
                            <Button variant="outline" size="small" onClick={() => {
                              if (window.confirm('¿Seguro que quieres cancelar tu inscripción en esta clase?')) {
                                db.cancelEnrollment(c.id, currentUser.id);
                                forceUpdate();
                              }
                            }}>
                              Cancelar Inscripción
                            </Button>
                          )}
                          
                          {isCompleted && (
                            <div style={{ alignSelf: 'center' }}>
                              {c.rating ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Tu Calificación:</span>
                                  {[...Array(5)].map((_, idx) => (
                                    <span key={idx} className="material-symbols-outlined" style={{
                                      fontSize: 16,
                                      fontVariationSettings: idx < c.rating ? "'FILL' 1" : "'FILL' 0",
                                      color: idx < c.rating ? '#fbbf24' : '#b2bec3'
                                    }}>star</span>
                                  ))}
                                </div>
                              ) : (
                                <Button variant="primary" size="small" onClick={() => navigate(`/rate/${c.id}`)}>
                                  Calificar Mentor
                                </Button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--color-on-surface-variant)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 8, opacity: 0.5 }}>event_busy</span>
                    <p className="text-body-lg" style={{ fontWeight: 600 }}>No tienes tutorías inscritas</p>
                    <p className="text-body-sm" style={{ marginBottom: 'var(--space-md)' }}>Explora la lista de clases creadas por nuestros mentores e inscríbete.</p>
                    <Button variant="primary" onClick={() => navigate('/search')}>Buscar Clases Disponibles</Button>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>
        <BottomNavBar />
      </>
    );
  }

  // --- TUTOR DASHBOARD ---
  if (currentUser.role === 'tutor') {
    if (currentUser.isPending) {
      return (
        <>
          <TopAppBar />
          <main className="dashboard app-shell app-shell--with-bottomnav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - var(--topbar-height))' }}>
            <div style={{
              maxWidth: 500,
              width: '90%',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-outline-variant)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-md)'
            }}>
              <div style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'rgba(249, 168, 37, 0.12)',
                color: 'var(--color-warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 40 }}>hourglass_empty</span>
              </div>
              <h2 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Registro en Proceso</h2>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.5 }}>
                Hola, <strong>{currentUser.name}</strong>. Tu perfil como tutor de la UTP ha sido registrado correctamente y se encuentra pendiente de aprobación.
              </p>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.8 }}>
                Nuestro administrador revisará tu historial académico en breve. Te notificaremos una vez tu acceso esté activo.
              </p>
              <div style={{ height: 1, width: '100%', background: 'rgba(229, 189, 187, 0.3)', margin: '8px 0' }} />
              <Button variant="outline" fullWidth onClick={() => {
                navigate('/');
                window.location.reload();
              }}>Volver a la Página Principal</Button>
            </div>
          </main>
          <BottomNavBar />
        </>
      );
    }

    // Approved Tutor Panel
    const tutorClasses = db.getClasses().filter(c => c.tutorId === currentUser.tutorId);
    const activeClasses = tutorClasses.filter(c => c.status === 'Programada' || c.status === 'En curso');
    
    // Count total unique enrolled students
    const totalEnrolled = tutorClasses.reduce((sum, c) => sum + (c.studentIds ? c.studentIds.length : 0), 0);

    const activeTutors = db.getTutors();
    const selfTutor = activeTutors.find(t => t.id === currentUser.tutorId);
    const ratingVal = selfTutor ? selfTutor.rating : 5.0;
    const reviewsVal = selfTutor ? selfTutor.reviews : 0;

    const handleCompleteClass = (classId) => {
      db.updateClass(classId, { status: 'Finalizada' });
      forceUpdate();
    };

    return (
      <>
        <TopAppBar />
        <Sidebar />
        <main className="dashboard app-shell app-shell--with-sidebar app-shell--with-bottomnav">
          <div className="dashboard__inner">
            {/* Header */}
            <motion.div
              className="dashboard__header"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{ marginBottom: 'var(--space-lg)' }}
            >
              <div>
                <h2 className="text-headline-lg">Mi Panel de Mentoría</h2>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Imparte tus materias académicas, gestiona tus clases y registra nuevas sesiones.
                </p>
              </div>
              <div className="dashboard__header-actions">
                <Button variant="primary" icon="add" onClick={handleOpenCreate}>Crear Nueva Clase</Button>
              </div>
            </motion.div>

            {/* Stats */}
            <div className="dashboard__stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
              <StatCard
                icon="co_present"
                iconColor="var(--color-primary)"
                label="Clases Activas"
                value={activeClasses.length.toString()}
              />
              <StatCard
                icon="group"
                iconColor="var(--color-secondary)"
                label="Alumnos Inscritos"
                value={totalEnrolled.toString()}
              />
              <StatCard
                icon="star"
                iconColor="var(--color-warning)"
                label="Calificación Promedio"
                value={`${ratingVal} ★ (${reviewsVal} reseñas)`}
              />
            </div>

            {/* Tutor Classes */}
            <section className="dashboard__pending" style={{ padding: 'var(--space-lg)', minHeight: 280 }}>
              <div className="dashboard__pending-header" style={{ marginBottom: 'var(--space-lg)' }}>
                <h4 className="text-body-lg" style={{ fontWeight: 700 }}>Clases Creadas por Mí</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {tutorClasses.length > 0 ? (
                  tutorClasses.map((c) => {
                    const isCompleted = c.status === 'Finalizada';
                    const isCancelled = c.status === 'Cancelada';
                    const isInProgress = c.status === 'En curso';

                    return (
                      <div key={c.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'var(--color-surface-container-lowest)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-md)',
                        boxShadow: 'var(--shadow-sm)',
                        gap: 'var(--space-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                          <div>
                            <p className="text-label-md" style={{ color: 'var(--color-on-surface)', fontSize: 16 }}><strong>{c.title}</strong></p>
                            <p className="text-body-sm" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Materia: {c.subject}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: 11,
                              fontWeight: 'bold',
                              textTransform: 'uppercase',
                              background: isCompleted ? 'rgba(46, 125, 50, 0.12)' : (isCancelled ? 'rgba(158, 0, 31, 0.12)' : 'rgba(61, 92, 162, 0.12)'),
                              color: isCompleted ? 'var(--color-success)' : (isCancelled ? 'var(--color-primary)' : 'var(--color-secondary)'),
                              border: `1px solid ${isCompleted ? 'var(--color-success)' : (isCancelled ? 'var(--color-primary)' : 'var(--color-secondary)')}`
                            }}>
                              {c.status}
                            </span>
                            <Button variant="ghost" size="small" icon="edit" onClick={() => handleOpenEdit(c)} />
                            <Button variant="ghost" size="small" icon="delete" onClick={() => handleDeleteClass(c.id)} />
                          </div>
                        </div>

                        <div style={{ height: 1, background: 'rgba(229, 189, 187, 0.2)' }} />

                        <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                          {c.description}
                        </p>

                        <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>calendar_today</span>
                            <span>{c.date}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>schedule</span>
                            <span>{c.startTime} - {c.endTime}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>location_on</span>
                            <span>{c.platform}</span>
                          </div>
                        </div>

                        {/* Meeting Link & Materials detail */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, background: 'var(--color-surface-container)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-primary)' }}>videocam</span>
                            <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                              <strong>Enlace de reunión: </strong> 
                              <a href={c.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>{c.meetingLink}</a>
                            </span>
                          </div>
                          {c.materials && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--color-secondary)' }}>folder</span>
                              <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                                <strong>Materiales: </strong> {c.materials}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Enrolled Students Listing inside class card */}
                        <div style={{ marginTop: 'var(--space-sm)' }}>
                          <p className="text-label-sm" style={{ color: 'var(--color-outline)', fontWeight: 600 }}>
                            Alumnos Inscritos ({c.studentIds ? c.studentIds.length : 0} / {c.capacity || '∞'}):
                          </p>
                          {c.studentNames && c.studentNames.length > 0 ? (
                            <ul style={{ paddingLeft: 'var(--space-md)', fontSize: 13, color: 'var(--color-on-surface-variant)', listStyleType: 'disc', marginTop: 4 }}>
                              {c.studentNames.map((name, idx) => (
                                <li key={idx} style={{ marginBottom: 2 }}>{name}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-body-sm" style={{ fontStyle: 'italic', color: 'var(--color-on-surface-variant)', opacity: 0.7, marginTop: 4 }}>Sin alumnos inscritos todavía</p>
                          )}
                        </div>

                        {/* Status completion button */}
                        {!isCompleted && !isCancelled && (
                          <div style={{ display: 'flex', gap: 8, alignSelf: 'flex-end', marginTop: 8 }}>
                            {c.status === 'Programada' && (
                              <Button variant="outline" size="small" onClick={() => {
                                db.updateClass(c.id, { status: 'En curso' });
                                forceUpdate();
                              }}>
                                Iniciar Clase
                              </Button>
                            )}
                            <Button variant="primary" size="small" onClick={() => handleCompleteClass(c.id)}>
                              Finalizar Clase
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: 'center', padding: 'var(--space-2xl) 0', color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 8 }}>co_present</span>
                    <p className="text-body-lg" style={{ fontWeight: 600 }}>Aún no tienes clases creadas</p>
                    <p className="text-body-sm">Crea tu primera clase de mentoría usando el botón superior.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </main>

        {/* Modal for creating/editing classes */}
        <Modal open={showClassModal} onClose={() => setShowClassModal(false)}>
          <form onSubmit={handleSaveClass} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', width: '100%', maxWidth: 500 }}>
            <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>
              {editingClass ? 'Editar Clase' : 'Crear Nueva Clase'}
            </h3>
            
            <Input
              label="Título de la Clase *"
              id="class-title"
              placeholder="Ej. Taller de Punteros en C++"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />

            <Input
              label="Materia o Contenido *"
              id="class-subject"
              placeholder="Ej. Algoritmos, Física I"
              required
              value={formSubject}
              onChange={(e) => setFormSubject(e.target.value)}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Input
                label="Fecha *"
                type="date"
                id="class-date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
              <Input
                label="Capacidad Máxima *"
                type="number"
                id="class-capacity"
                required
                min={1}
                value={formCapacity}
                onChange={(e) => setFormCapacity(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Input
                label="Hora Inicio *"
                type="time"
                id="class-start"
                required
                value={formStartTime}
                onChange={(e) => setFormStartTime(e.target.value)}
              />
              <Input
                label="Hora Fin *"
                type="time"
                id="class-end"
                required
                value={formEndTime}
                onChange={(e) => setFormEndTime(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
              <Select
                label="Plataforma *"
                id="class-platform"
                value={formPlatform}
                onChange={(e) => setFormPlatform(e.target.value)}
              >
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Zoom">Zoom</option>
                <option value="Google Meet">Google Meet</option>
                <option value="Otro">Otro</option>
              </Select>

              {editingClass && (
                <Select
                  label="Estado *"
                  id="class-status"
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                >
                  <option value="Programada">Programada</option>
                  <option value="En curso">En curso</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Cancelada">Cancelada</option>
                </Select>
              )}
            </div>

            <Input
              label="Enlace de la Reunión *"
              type="url"
              id="class-link"
              placeholder="https://..."
              required
              value={formMeetingLink}
              onChange={(e) => setFormMeetingLink(e.target.value)}
            />

            <Input
              label="Materiales de Apoyo (Opcional)"
              placeholder="Ej. Enlaces a diapositivas, carpetas Drive..."
              value={formMaterials}
              onChange={(e) => setFormMaterials(e.target.value)}
            />

            <Textarea
              label="Descripción o Resumen *"
              id="class-desc"
              placeholder="Describe brevemente lo que se desarrollará en la sesión..."
              required
              maxLength={300}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />

            <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button type="button" variant="outline" onClick={() => setShowClassModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="primary">
                Guardar Clase
              </Button>
            </div>
          </form>
        </Modal>

        <BottomNavBar />
      </>
    );
  }

  return null;
}

