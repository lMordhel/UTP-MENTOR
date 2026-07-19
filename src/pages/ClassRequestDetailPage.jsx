import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar, BottomNavBar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Modal } from '../components/UI/Modal';
import { db } from '../data/db';
import { useAuth } from '../context/AuthContext';
import './ClassRequestDetailPage.css';

const STATUS_META = {
  'Esperando interesados': { color: 'var(--color-on-surface-variant)', bg: 'var(--color-surface-container)', icon: 'group_add', step: 1 },
  'Lista para revisión': { color: '#b45309', bg: 'rgba(180,83,9,0.1)', icon: 'rate_review', step: 2 },
  'En revisión': { color: '#b45309', bg: 'rgba(180,83,9,0.08)', icon: 'manage_search', step: 2 },
  'Aceptada': { color: 'var(--color-success)', bg: 'rgba(46,125,50,0.1)', icon: 'thumb_up', step: 3 },
  'Votación abierta': { color: 'var(--color-secondary)', bg: 'rgba(61,92,162,0.1)', icon: 'how_to_vote', step: 4 },
  'Votación cerrada': { color: 'var(--color-secondary)', bg: 'rgba(61,92,162,0.08)', icon: 'done_all', step: 5 },
  'Rechazada': { color: 'var(--color-primary)', bg: 'rgba(158,0,31,0.08)', icon: 'cancel', step: -1 },
  'Clase creada': { color: 'var(--color-success)', bg: 'rgba(46,125,50,0.12)', icon: 'event_available', step: 6 },
};

const STEPS = [
  { n: 1, label: 'Solicitud', icon: 'campaign' },
  { n: 2, label: 'Revisión', icon: 'rate_review' },
  { n: 3, label: 'Aceptada', icon: 'thumb_up' },
  { n: 4, label: 'Votación', icon: 'how_to_vote' },
  { n: 5, label: 'Horario elegido', icon: 'event' },
  { n: 6, label: 'Clase creada', icon: 'school' },
];

export default function ClassRequestDetailPage() {
  const { requestId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [, setTick] = useState(0);
  const forceUpdate = () => setTick(t => t + 1);

  // Tutor review panel state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectComment, setRejectComment] = useState('');

  // Tutor schedule proposal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [propDate, setPropDate] = useState('');
  const [propStart, setPropStart] = useState('');
  const [propDuration, setPropDuration] = useState('90');
  const [propPlatform, setPropPlatform] = useState('Google Meet');
  const [schedError, setSchedError] = useState('');

  // Tie-break manual selection
  const [manualScheduleId, setManualScheduleId] = useState('');

  const req = db.getClassRequestById(requestId);
  const config = db.getConfig();
  const threshold = config.minInterestThreshold || 3;

  if (!req) {
    return (
      <>
        <TopAppBar showBack />
        <main style={{ padding: '4rem', textAlign: 'center' }}>
          <h2 className="text-headline-md">Solicitud no encontrada</h2>
          <Button variant="primary" onClick={() => navigate('/requests')} style={{ marginTop: 16 }}>Volver</Button>
        </main>
        <BottomNavBar />
      </>
    );
  }

  const meta = STATUS_META[req.status] || STATUS_META['Esperando interesados'];
  const currentStep = meta.step;
  const isStudent = currentUser?.role === 'student';
  const isTutor = currentUser?.role === 'tutor';
  const isAdmin = currentUser?.role === 'admin';
  const isInterested = req.interestedIds.includes(currentUser?.id);
  const isCreator = req.createdBy === currentUser?.id;
  const pct = Math.min(100, (req.interestedIds.length / threshold) * 100);
  const reached = req.interestedIds.length >= threshold;

  const handleJoin = () => {
    const res = db.addInterest(req.id, currentUser.id, currentUser.name);
    if (!res.success) { alert(res.error); return; }
    forceUpdate();
  };

  const handleLeave = () => {
    const res = db.removeInterest(req.id, currentUser.id);
    if (!res.success) { alert(res.error); return; }
    forceUpdate();
  };

  const handleAccept = () => {
    db.acceptRequest(req.id, currentUser.id, currentUser.name);
    forceUpdate();
  };

  const handleReject = () => {
    if (!rejectComment.trim()) { alert('Escribe un motivo.'); return; }
    db.rejectRequest(req.id, currentUser.id, currentUser.name, rejectComment);
    setShowRejectModal(false);
    forceUpdate();
  };

  const handleAddSchedule = (e) => {
    e.preventDefault();
    setSchedError('');
    if (!propDate || !propStart) { setSchedError('Fecha y hora de inicio son obligatorias.'); return; }
    db.addScheduleProposal(req.id, { date: propDate, startTime: propStart, duration: propDuration + ' min', platform: propPlatform });
    setPropDate(''); setPropStart(''); setPropDuration('90'); setPropPlatform('Google Meet');
    setShowScheduleModal(false);
    forceUpdate();
  };

  const handleOpenVoting = () => {
    if (req.scheduleProposals.length === 0) { alert('Agrega al menos una propuesta de horario antes de abrir la votación.'); return; }
    db.openVoting(req.id);
    forceUpdate();
  };

  const handleCloseVoting = () => {
    db.closeVoting(req.id);
    forceUpdate();
  };

  const handleVote = (schedId) => {
    const res = db.voteSchedule(req.id, schedId, currentUser.id);
    if (!res.success) { alert(res.error); return; }
    forceUpdate();
  };

  const handleSelectManual = () => {
    if (!manualScheduleId) { alert('Selecciona un horario.'); return; }
    db.selectSchedule(req.id, manualScheduleId);
    forceUpdate();
  };

  const handleCreateDraft = () => {
    const tutorUser = db.getUsers().find(u => u.id === currentUser.id);
    const tutorData = db.getTutors().find(t => t.id === tutorUser?.tutorId);
    const draft = db.createDraftClass(req.id, currentUser.id, currentUser.name, tutorData?.avatar || '');
    if (!draft) { alert('No se pudo crear el borrador. Asegúrate de haber seleccionado un horario.'); return; }
    forceUpdate();
    navigate('/dashboard');
  };

  // Figure out winning schedule
  const sortedProposals = [...req.scheduleProposals].sort((a, b) => b.votes.length - a.votes.length);
  const topVotes = sortedProposals[0]?.votes.length || 0;
  const tied = sortedProposals.filter(p => p.votes.length === topVotes && topVotes > 0);
  const hasTie = tied.length > 1;
  const winner = !hasTie && tied.length === 1 ? tied[0] : null;

  const myVote = req.scheduleProposals.find(p => p.votes.includes(currentUser?.id))?.id;

  return (
    <>
      <TopAppBar showBack />
      <main className="reqd-page app-shell app-shell--with-bottomnav">
        <div className="reqd-page__inner">

          {/* Breadcrumb */}
          <nav className="text-label-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-lg)', color: 'var(--color-on-surface-variant)' }}>
            <Link to="/requests" style={{ textDecoration: 'none', color: 'inherit' }}>Solicitudes</Link>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>chevron_right</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Detalle</span>
          </nav>

          {/* Stepper */}
          {currentStep > 0 && (
            <div className="reqd-stepper">
              {STEPS.map((s, i) => {
                const done = currentStep > s.n;
                const active = currentStep === s.n;
                return (
                  <div key={s.n} className="reqd-step">
                    <div className={`reqd-step__circle ${done ? 'done' : active ? 'active' : ''}`}>
                      {done ? (
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>
                      ) : (
                        <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{s.icon}</span>
                      )}
                    </div>
                    <span className={`reqd-step__label text-label-sm ${active ? 'active' : ''}`}>{s.label}</span>
                    {i < STEPS.length - 1 && <div className={`reqd-step__line ${done ? 'done' : ''}`} />}
                  </div>
                );
              })}
            </div>
          )}

          <div className="reqd-grid">
            {/* Left: Main Content */}
            <div className="reqd-main">

              {/* Title & Status */}
              <div className="reqd-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
                  <div>
                    <span style={{
                      fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase',
                      background: 'rgba(61,92,162,0.1)', color: 'var(--color-secondary)',
                      padding: '2px 8px', borderRadius: 3, display: 'inline-block', marginBottom: 8,
                    }}>{req.category}</span>
                    <h2 className="text-headline-lg" style={{ color: 'var(--color-on-surface)' }}>{req.title}</h2>
                    <p style={{ fontSize: 12, color: 'var(--color-outline)', marginTop: 4 }}>
                      Creado por <strong>{req.createdByName}</strong> — {new Date(req.createdAt).toLocaleDateString('es-PE', { dateStyle: 'long' })}
                    </p>
                  </div>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: meta.bg, color: meta.color,
                    padding: '6px 12px', borderRadius: 'var(--radius-full)',
                    fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', flexShrink: 0,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                    {req.status}
                  </span>
                </div>

                <div style={{ height: 1, background: 'var(--color-outline-variant)', marginBottom: 12 }} />

                <h4 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 6 }}>Descripción</h4>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6, marginBottom: 16 }}>{req.description}</p>

                <h4 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 6 }}>¿Qué esperan aprender?</h4>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>{req.reason}</p>
              </div>

              {/* Schedule Proposals + Voting */}
              {(req.status === 'Aceptada' || req.status === 'Votación abierta' || req.status === 'Votación cerrada' || req.status === 'Clase creada') && (
                <div className="reqd-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)', flexWrap: 'wrap', gap: 8 }}>
                    <h3 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>
                      {req.status === 'Aceptada' ? 'Propuestas de Horario' : 'Votación de Horario'}
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {isTutor && req.status === 'Aceptada' && (
                        <>
                          <Button variant="outline" size="small" icon="add" onClick={() => setShowScheduleModal(true)}>Agregar Horario</Button>
                          {req.scheduleProposals.length > 0 && (
                            <Button variant="primary" size="small" icon="how_to_vote" onClick={handleOpenVoting}>Abrir Votación</Button>
                          )}
                        </>
                      )}
                      {(isTutor || isAdmin) && req.status === 'Votación abierta' && (
                        <Button variant="outline" size="small" onClick={handleCloseVoting}>Cerrar Votación</Button>
                      )}
                    </div>
                  </div>

                  {req.scheduleProposals.length === 0 ? (
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
                      El profesor aún no ha propuesto horarios.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {sortedProposals.map((proposal) => {
                        const totalVotes = req.interestedIds.length;
                        const votesPct = totalVotes > 0 ? (proposal.votes.length / totalVotes) * 100 : 0;
                        const isSelected = req.selectedScheduleId === proposal.id;
                        const isWinner = winner?.id === proposal.id;
                        const hasMyVote = proposal.votes.includes(currentUser?.id);

                        return (
                          <div key={proposal.id} className={`reqd-schedule-card ${isSelected ? 'selected' : ''} ${isWinner ? 'winner' : ''}`}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-on-surface)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>calendar_today</span>
                                  <strong>{proposal.date}</strong>
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-on-surface)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>schedule</span>
                                  {proposal.startTime}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-on-surface)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>timer</span>
                                  {proposal.duration}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-on-surface)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>videocam</span>
                                  {proposal.platform}
                                </span>
                              </div>
                              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {isSelected && (
                                  <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', background: 'rgba(46,125,50,0.15)', color: 'var(--color-success)', padding: '3px 8px', borderRadius: 4 }}>
                                    ✓ Seleccionado
                                  </span>
                                )}
                                {isStudent && isInterested && req.status === 'Votación abierta' && (
                                  <Button
                                    variant={hasMyVote ? 'primary' : 'outline'}
                                    size="small"
                                    onClick={() => handleVote(proposal.id)}
                                  >
                                    {hasMyVote ? '✓ Mi voto' : 'Votar'}
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Vote bar */}
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                                <span>{proposal.votes.length} votos</span>
                                <span>{votesPct.toFixed(0)}%</span>
                              </div>
                              <div style={{ height: 8, borderRadius: 4, background: 'var(--color-surface-container-highest)', overflow: 'hidden' }}>
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${votesPct}%` }}
                                  transition={{ duration: 0.5 }}
                                  style={{ height: '100%', background: isSelected ? 'var(--color-success)' : 'var(--color-secondary)', borderRadius: 4 }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Tie resolution for tutor */}
                  {(isTutor || isAdmin) && req.status === 'Votación cerrada' && hasTie && !req.selectedScheduleId && (
                    <div style={{ marginTop: 'var(--space-md)', background: 'rgba(180,83,9,0.08)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(180,83,9,0.2)' }}>
                      <p className="text-label-md" style={{ color: '#b45309', marginBottom: 8 }}>⚖ Empate detectado — Selección manual requerida</p>
                      <select value={manualScheduleId} onChange={(e) => setManualScheduleId(e.target.value)} className="req-select" style={{ marginBottom: 8, width: '100%' }}>
                        <option value="">Selecciona un horario...</option>
                        {tied.map(p => (
                          <option key={p.id} value={p.id}>{p.date} — {p.startTime} ({p.platform})</option>
                        ))}
                      </select>
                      <Button variant="primary" size="small" onClick={handleSelectManual}>Confirmar Selección</Button>
                    </div>
                  )}

                  {/* Create draft button */}
                  {isTutor && req.status === 'Votación cerrada' && req.selectedScheduleId && !req.draftClassId && (
                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(46,125,50,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(46,125,50,0.2)' }}>
                      <p className="text-label-md" style={{ color: 'var(--color-success)', marginBottom: 8 }}>¡Horario seleccionado! Crea el borrador de la clase para revisarlo y publicarlo.</p>
                      <Button variant="primary" icon="add_circle" onClick={handleCreateDraft}>
                        Crear Borrador de Clase
                      </Button>
                    </div>
                  )}

                  {req.draftClassId && (
                    <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-md)', background: 'rgba(46,125,50,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(46,125,50,0.25)' }}>
                      <p className="text-label-md" style={{ color: 'var(--color-success)' }}>
                        ✓ Clase generada exitosamente. El profesor puede completar y publicar la clase desde su panel.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Rejection banner */}
              {req.status === 'Rechazada' && (
                <div className="reqd-card" style={{ border: '1px solid rgba(158,0,31,0.3)', background: 'rgba(158,0,31,0.04)' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--color-primary)', fontVariationSettings: "'FILL' 1" }}>cancel</span>
                    <div>
                      <p className="text-label-md" style={{ color: 'var(--color-primary)', fontWeight: 700, marginBottom: 4 }}>Solicitud Rechazada</p>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                        <strong>Motivo:</strong> {req.reviewComment || 'Sin comentarios.'}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--color-outline)', marginTop: 4 }}>
                        Por {req.reviewedByName} — {req.reviewedAt ? new Date(req.reviewedAt).toLocaleDateString('es-PE') : ''}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Sidebar Actions */}
            <div className="reqd-sidebar">

              {/* Interest Progress */}
              {(req.status === 'Esperando interesados' || req.status === 'Lista para revisión') && (
                <div className="reqd-card">
                  <h4 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 10 }}>Progreso de Interesados</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-on-surface-variant)' }}>{req.interestedIds.length} interesados</span>
                    <span style={{ color: reached ? 'var(--color-success)' : 'var(--color-on-surface-variant)', fontWeight: reached ? 700 : 400 }}>
                      Mínimo: {threshold}
                    </span>
                  </div>
                  <div style={{ height: 10, borderRadius: 5, background: 'var(--color-surface-container-highest)', overflow: 'hidden', marginBottom: 12 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      style={{ height: '100%', background: reached ? 'var(--color-success)' : 'var(--color-secondary)', borderRadius: 5 }}
                    />
                  </div>
                  {isStudent && !isCreator && (
                    isInterested ? (
                      <Button variant="outline" fullWidth onClick={handleLeave} icon="person_remove">Retirarme</Button>
                    ) : (
                      <Button variant="primary" fullWidth onClick={handleJoin} icon="person_add">Unirme a esta solicitud</Button>
                    )
                  )}
                  {isCreator && (
                    <p className="text-body-sm" style={{ color: 'var(--color-secondary)', textAlign: 'center', fontWeight: 600 }}>Eres el creador de esta solicitud</p>
                  )}
                </div>
              )}

              {/* Tutor Review Actions */}
              {isTutor && (req.status === 'Lista para revisión') && (
                <div className="reqd-card">
                  <h4 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 10 }}>Revisión del Profesor</h4>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 12 }}>
                    Esta solicitud tiene {req.interestedIds.length} estudiantes interesados y está lista para tu revisión.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Button variant="primary" fullWidth icon="thumb_up" onClick={handleAccept}>Aceptar Solicitud</Button>
                    <Button variant="outline" fullWidth icon="thumb_down" onClick={() => setShowRejectModal(true)}>Rechazar</Button>
                  </div>
                </div>
              )}

              {/* Interested Students List */}
              <div className="reqd-card">
                <h4 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 10 }}>
                  Alumnos Interesados ({req.interestedIds.length})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {req.interestedNames.map((name, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: `hsl(${(i * 47) % 360}, 55%, 55%)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 13, fontWeight: 700, flexShrink: 0,
                      }}>
                        {name[0]}
                      </div>
                      <span className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>{name}</span>
                      {req.createdBy === req.interestedIds[i] && (
                        <span style={{ fontSize: 10, color: 'var(--color-secondary)', fontWeight: 700 }}>CREADOR</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reject Modal */}
      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: 420 }}>
          <h3 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Rechazar Solicitud</h3>
          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Los alumnos interesados serán notificados con el motivo que indiques.
          </p>
          <div>
            <label className="text-label-sm" style={{ display: 'block', marginBottom: 6 }}>Motivo del rechazo *</label>
            <textarea
              placeholder="Explica brevemente por qué no puedes impartir esta clase..."
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-outline)', background: 'var(--color-surface)',
                color: 'var(--color-on-surface)', fontSize: 14, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Cancelar</Button>
            <Button variant="primary" onClick={handleReject}>Confirmar Rechazo</Button>
          </div>
        </div>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal open={showScheduleModal} onClose={() => setShowScheduleModal(false)}>
        <form onSubmit={handleAddSchedule} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', maxWidth: 440 }}>
          <h3 className="text-headline-md" style={{ color: 'var(--color-primary)' }}>Proponer Horario</h3>
          <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            Los alumnos podrán votar por el horario que prefieran.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <Input label="Fecha *" type="date" id="prop-date" required value={propDate} onChange={(e) => setPropDate(e.target.value)} />
            <Input label="Hora de Inicio *" type="time" id="prop-start" required value={propStart} onChange={(e) => setPropStart(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div>
              <label className="text-label-sm" style={{ display: 'block', marginBottom: 6, color: 'var(--color-on-surface-variant)' }}>Duración *</label>
              <select value={propDuration} onChange={(e) => setPropDuration(e.target.value)} style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--color-outline)',
                borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: 14,
              }}>
                {['60', '90', '120', '150'].map(d => <option key={d} value={d}>{d} minutos</option>)}
              </select>
            </div>
            <div>
              <label className="text-label-sm" style={{ display: 'block', marginBottom: 6, color: 'var(--color-on-surface-variant)' }}>Plataforma *</label>
              <select value={propPlatform} onChange={(e) => setPropPlatform(e.target.value)} style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--color-outline)',
                borderRadius: 'var(--radius-sm)', background: 'var(--color-surface)', color: 'var(--color-on-surface)', fontSize: 14,
              }}>
                {['Google Meet', 'Zoom', 'Microsoft Teams', 'Otra'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {schedError && <p className="text-body-sm" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>⚠ {schedError}</p>}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Agregar Propuesta</Button>
          </div>
        </form>
      </Modal>

      <BottomNavBar />
    </>
  );
}
