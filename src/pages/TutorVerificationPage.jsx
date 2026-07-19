import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar, BottomNavBar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/db';
import './TutorVerificationPage.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE_BYTES = 500 * 1024; // 500 KB
const MAX_DOCS = 5;

const STATUS_META = {
  pending_review: { label: 'Pendiente de Revisión', color: 'var(--color-on-surface-variant)', bg: 'var(--color-surface-container)', icon: 'hourglass_empty' },
  in_review: { label: 'En Revisión', color: '#b45309', bg: 'rgba(180,83,9,0.1)', icon: 'manage_search' },
  needs_correction: { label: 'Requiere Correcciones', color: 'var(--color-primary)', bg: 'rgba(158,0,31,0.08)', icon: 'error_outline' },
  approved: { label: 'Aprobado', color: 'var(--color-success)', bg: 'rgba(46,125,50,0.1)', icon: 'verified' },
  rejected: { label: 'Rechazado', color: 'var(--color-primary)', bg: 'rgba(158,0,31,0.1)', icon: 'cancel' },
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function TutorVerificationPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const getPendingData = () => db.getPendingTutorById(currentUser?.id);
  const [pendingData, setPendingData] = useState(getPendingData);
  const [uploadLabel, setUploadLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingFile, setPendingFile] = useState(null);

  const refresh = () => setPendingData(getPendingData());

  if (!currentUser || currentUser.role !== 'tutor') {
    return (
      <>
        <TopAppBar />
        <main style={{ padding: '4rem', textAlign: 'center' }}>
          <p>No tienes acceso a esta página.</p>
        </main>
        <BottomNavBar />
      </>
    );
  }

  if (!currentUser.isPending) {
    return (
      <>
        <TopAppBar />
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '2rem' }}>
          <div style={{ textAlign: 'center', maxWidth: 420 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--color-success)', display: 'block', marginBottom: 16, fontVariationSettings: "'FILL' 1" }}>verified</span>
            <h2 className="text-headline-md" style={{ color: 'var(--color-success)', marginBottom: 8 }}>¡Cuenta Verificada!</h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 24 }}>
              Tu cuenta de profesor ha sido aprobada. Ya puedes crear y publicar clases en la plataforma.
            </p>
            <Button variant="primary" fullWidth onClick={() => navigate('/dashboard')}>Ir a mi Panel</Button>
          </div>
        </main>
        <BottomNavBar />
      </>
    );
  }

  const docs = pendingData?.documents || [];
  const observations = pendingData?.adminObservations || [];
  const status = pendingData?.verificationStatus || 'pending_review';
  const statusMeta = STATUS_META[status] || STATUS_META['pending_review'];

  const validateFile = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Solo se aceptan archivos JPG, PNG y PDF.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `El archivo supera el tamaño máximo de 500 KB (tamaño actual: ${(file.size / 1024).toFixed(0)} KB).`;
    }
    return null;
  };

  const handleFilePick = (files) => {
    const file = files[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) { setUploadError(err); return; }
    setUploadError('');
    setPendingFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) { setUploadError('Selecciona un archivo primero.'); return; }
    if (!uploadLabel.trim()) { setUploadError('Ingresa una etiqueta para el documento (ej. Ciclo 1).'); return; }
    if (docs.length >= MAX_DOCS) { setUploadError(`Solo puedes subir hasta ${MAX_DOCS} documentos.`); return; }

    setUploading(true);
    setUploadError('');
    try {
      const base64 = await fileToBase64(pendingFile);
      db.addDocument(currentUser.id, {
        id: `doc-${Date.now()}`,
        label: uploadLabel.trim(),
        fileName: pendingFile.name,
        fileType: pendingFile.type,
        fileData: base64,
      });
      setSuccessMsg(`Documento "${uploadLabel}" subido correctamente.`);
      setUploadLabel('');
      setPendingFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      refresh();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setUploadError('Error al procesar el archivo. Intenta de nuevo.');
    }
    setUploading(false);
  };

  const handleRemoveDoc = (docId) => {
    if (window.confirm('¿Eliminar este documento?')) {
      db.removeDocument(currentUser.id, docId);
      refresh();
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFilePick(e.dataTransfer.files);
  }, []);

  return (
    <>
      <TopAppBar />
      <main className="verif-page app-shell app-shell--with-bottomnav">
        <div className="verif-page__inner">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={{ marginBottom: 'var(--space-xl)' }}>
              <h2 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>Verificación de Cuenta</h2>
              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                Sube tu documentación académica para que el administrador pueda verificar tu perfil de profesor.
              </p>
            </div>

            {/* Status Banner */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: statusMeta.bg,
              border: `1px solid ${statusMeta.color}30`,
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-xl)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: statusMeta.color, fontVariationSettings: "'FILL' 1" }}>{statusMeta.icon}</span>
              <div>
                <p className="text-label-md" style={{ color: statusMeta.color, fontWeight: 700 }}>Estado: {statusMeta.label}</p>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>
                  {status === 'pending_review' && 'Tu solicitud está en cola de revisión. Sube tus documentos para agilizar el proceso.'}
                  {status === 'in_review' && 'Un administrador está revisando tu documentación actualmente.'}
                  {status === 'needs_correction' && 'Revisa las observaciones del administrador y reemplaza los documentos observados.'}
                  {status === 'approved' && 'Tu cuenta fue aprobada exitosamente.'}
                  {status === 'rejected' && 'Tu solicitud fue rechazada. Revisa las observaciones para más información.'}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="verif-grid">

            {/* Left: Document Upload */}
            <div>
              <div className="verif-card">
                <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
                  Cargar Documentación Académica
                </h3>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-md)' }}>
                  Sube fotos o PDF de tus notas y certificados por ciclo. Formatos: JPG, PNG, PDF. Máx: 500 KB por archivo. Máx: {MAX_DOCS} documentos.
                </p>

                {/* Drop Zone */}
                <div
                  className={`verif-dropzone ${dragOver ? 'verif-dropzone--active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--color-secondary)', marginBottom: 8 }}>cloud_upload</span>
                  {pendingFile ? (
                    <div style={{ textAlign: 'center' }}>
                      <p className="text-label-md" style={{ color: 'var(--color-on-surface)' }}>{pendingFile.name}</p>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{(pendingFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>Arrastra aquí o haz clic para seleccionar</p>
                      <p className="text-label-sm" style={{ color: 'var(--color-outline)', marginTop: 4 }}>JPG · PNG · PDF — Máx 500 KB</p>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    style={{ display: 'none' }}
                    onChange={(e) => handleFilePick(e.target.files)}
                  />
                </div>

                {/* Label */}
                <div style={{ marginTop: 'var(--space-md)' }}>
                  <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)', display: 'block', marginBottom: 6 }}>
                    Etiqueta del documento *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Ciclo 1, Ciclo 2, Certificado Python..."
                    value={uploadLabel}
                    onChange={(e) => setUploadLabel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--color-outline)',
                      background: 'var(--color-surface)',
                      color: 'var(--color-on-surface)',
                      fontSize: 14,
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <AnimatePresence>
                  {uploadError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-body-sm" style={{ color: 'var(--color-primary)', marginTop: 8, fontWeight: 600 }}>
                      ⚠ {uploadError}
                    </motion.p>
                  )}
                  {successMsg && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="text-body-sm" style={{ color: 'var(--color-success)', marginTop: 8, fontWeight: 600 }}>
                      ✓ {successMsg}
                    </motion.p>
                  )}
                </AnimatePresence>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleUpload}
                  disabled={uploading || !pendingFile}
                  style={{ marginTop: 'var(--space-md)' }}
                >
                  {uploading ? 'Subiendo...' : 'Subir Documento'}
                </Button>
              </div>

              {/* Uploaded Documents */}
              <div className="verif-card" style={{ marginTop: 'var(--space-md)' }}>
                <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
                  Documentos Subidos ({docs.length} / {MAX_DOCS})
                </h3>
                {docs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>folder_open</span>
                    <p className="text-body-sm">Aún no has subido ningún documento</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {docs.map((doc) => (
                      <div key={doc.id} className={`verif-doc ${doc.isObserved ? 'verif-doc--observed' : ''}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 24, color: doc.isObserved ? 'var(--color-primary)' : 'var(--color-secondary)', fontVariationSettings: "'FILL' 1" }}>
                            {doc.fileType === 'application/pdf' ? 'picture_as_pdf' : 'image'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="text-label-sm" style={{ color: 'var(--color-on-surface)', fontWeight: 700 }}>{doc.label}</p>
                            <p style={{ fontSize: 11, color: 'var(--color-outline)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.fileName}</p>
                            {doc.isObserved && (
                              <p className="text-body-sm" style={{ color: 'var(--color-primary)', fontSize: 11, marginTop: 2 }}>
                                ⚠ Observación: {doc.observationNote}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveDoc(doc.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-outline)', padding: 4 }}
                          title="Eliminar documento"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Admin Observations History */}
            <div>
              <div className="verif-card">
                <h3 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-md)' }}>
                  Historial de Revisión
                </h3>
                {observations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--color-on-surface-variant)', opacity: 0.6 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>history</span>
                    <p className="text-body-sm">Sin historial de revisión todavía</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {observations.slice().reverse().map((obs, i) => {
                      const meta = STATUS_META[obs.action] || STATUS_META['pending_review'];
                      return (
                        <div key={i} style={{
                          display: 'flex',
                          gap: 12,
                          padding: 'var(--space-md)',
                          background: meta.bg,
                          borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${meta.color}25`,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 20, color: meta.color, flexShrink: 0, fontVariationSettings: "'FILL' 1" }}>{meta.icon}</span>
                          <div>
                            <p className="text-label-sm" style={{ color: meta.color, fontWeight: 700 }}>{meta.label}</p>
                            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{obs.note || 'Sin comentarios adicionales.'}</p>
                            <p style={{ fontSize: 11, color: 'var(--color-outline)', marginTop: 4 }}>
                              Por {obs.byName} — {new Date(obs.date).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Tips card */}
              <div className="verif-card" style={{ marginTop: 'var(--space-md)', background: 'rgba(61,92,162,0.05)', border: '1px solid rgba(61,92,162,0.15)' }}>
                <h4 className="text-label-md" style={{ color: 'var(--color-secondary)', marginBottom: 'var(--space-sm)' }}>
                  💡 Consejos para una aprobación rápida
                </h4>
                <ul style={{ paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[
                    'Sube documentos legibles y en buenas condiciones.',
                    'Incluye todos los ciclos académicos cursados.',
                    'Usa etiquetas descriptivas: "Ciclo 1", "Ciclo 2", etc.',
                    'Los archivos PDF tienen mejor calidad visual.',
                    'Responde rápidamente a las correcciones solicitadas.',
                  ].map((tip, i) => (
                    <li key={i} className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}
