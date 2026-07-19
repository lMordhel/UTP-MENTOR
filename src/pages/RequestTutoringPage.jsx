import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar, BottomNavBar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Icon } from '../components/UI/Icon';
import { Modal } from '../components/UI/Modal';
import { useAuth } from '../context/AuthContext';
import { db } from '../data/db';
import './RequestTutoringPage.css';

export default function RequestTutoringPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Find correct class from DB
  const allClasses = db.getClasses();
  const classObj = allClasses.find(c => c.id === classId) || allClasses[0];

  // Find tutor corresponding to the class
  const activeTutors = db.getTutors();
  const tutor = activeTutors.find(t => t.id === classObj?.tutorId) || {
    name: classObj?.tutorName || 'Mentor UTP',
    avatar: classObj?.tutorAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDi4MYHROughn1gYtmaHBoVRqc0c36V6CC-yzOI_Xe3XXBJgztnNGqLh3dvnnO-ensA4DodAbAQI6FNoBAGS-wFA8v00CYEzwSApY9va2prtKuzybdrL_hf9u8dAqN5J7IS20Qiamy3eUgt-gw_SFdtO-YQ9-o7460N_Z3GhLSp7eJiRyIwixYEVoS85VXvL9DRYr55dktWkYS9fnjDbglmCbqfnGiV6qEE6MdvWZas9DN2i8DLUi2ggn4p4zrUwKWk04a_feUXg6g',
    career: 'Ingeniería',
    rating: 5.0,
    reviews: 0,
    bio: 'Mentor experto comprometido con el desarrollo académico de los estudiantes de la UTP.'
  };

  const [showModal, setShowModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!classObj) {
    return (
      <>
        <TopAppBar showBack />
        <main className="request-page app-shell app-shell--with-bottomnav" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
          <h2 className="text-headline-md">Clase no encontrada</h2>
          <Button variant="primary" onClick={() => navigate('/search')}>Volver al Buscador</Button>
        </main>
        <BottomNavBar />
      </>
    );
  }

  const isEnrolled = classObj.studentIds && classObj.studentIds.includes(currentUser?.id);
  const isFull = classObj.studentIds && classObj.capacity && classObj.studentIds.length >= classObj.capacity;
  const capacityText = `${classObj.studentIds ? classObj.studentIds.length : 0} / ${classObj.capacity || '∞'} alumnos`;

  const handleEnroll = () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para inscribirte.');
      return;
    }

    if (currentUser.role !== 'student') {
      alert('Solo los estudiantes pueden inscribirse en las clases.');
      return;
    }

    const res = db.enrollStudent(classObj.id, currentUser.id, currentUser.name);
    if (res.success) {
      setSuccessMessage(`Te has inscrito exitosamente en la clase: "${classObj.title}"`);
      setShowModal(true);
    } else {
      alert(res.error || 'Ocurrió un error al inscribirse.');
    }
  };

  const handleCancelEnrollment = () => {
    if (window.confirm('¿Seguro que quieres cancelar tu inscripción en esta clase?')) {
      const res = db.cancelEnrollment(classObj.id, currentUser.id);
      if (res.success) {
        alert('Inscripción cancelada.');
        navigate('/dashboard');
      }
    }
  };

  return (
    <>
      <TopAppBar showBack />
      <main className="request-page app-shell app-shell--with-bottomnav">
        <div className="request-page__inner">
          
          {/* Breadcrumb */}
          <nav className="request-breadcrumb text-label-sm">
            <Link to="/search" style={{ textDecoration: 'none', color: 'inherit' }}>Clases</Link>
            <Icon name="chevron_right" size={16} />
            <span style={{ color: 'var(--color-primary)', fontWeight: 700 }}>Detalle de Clase</span>
          </nav>

          <div className="request-grid">
            
            {/* Left Column - Class Info */}
            <motion.section
              className="request-form-section"
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="request-card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{
                      fontSize: 11,
                      background: 'rgba(61, 92, 162, 0.12)',
                      color: 'var(--color-secondary)',
                      padding: '4px 10px',
                      borderRadius: 4,
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>{classObj.subject}</span>
                    <h2 className="text-headline-lg" style={{ marginTop: 8, color: 'var(--color-on-surface)' }}>{classObj.title}</h2>
                  </div>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 11,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    background: classObj.status === 'Finalizada' ? 'rgba(46, 125, 50, 0.12)' : 'rgba(61, 92, 162, 0.12)',
                    color: classObj.status === 'Finalizada' ? 'var(--color-success)' : 'var(--color-secondary)'
                  }}>{classObj.status}</span>
                </div>

                <div style={{ height: 1, background: 'rgba(229, 189, 187, 0.2)' }} />

                <div>
                  <h3 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>Descripción de la Clase</h3>
                  <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                    {classObj.description}
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', background: 'var(--color-surface-container)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="text-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>Capacidad de Alumnos:</span>
                    <span className="text-body-md" style={{ fontWeight: 600, color: isFull ? 'var(--color-primary)' : 'var(--color-success)' }}>{capacityText}</span>
                  </div>
                  {classObj.studentNames && classObj.studentNames.length > 0 && (
                    <div style={{ marginTop: 4 }}>
                      <span className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Alumnos Inscritos:</span>
                      <ul style={{ paddingLeft: 'var(--space-md)', fontSize: 13, color: 'var(--color-on-surface-variant)', marginTop: 4, listStyleType: 'disc' }}>
                        {classObj.studentNames.map((name, i) => (
                          <li key={i}>{name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'var(--space-md)', display: 'flex', gap: 12 }}>
                  {isEnrolled ? (
                    <>
                      <Button variant="outline" icon="close" onClick={handleCancelEnrollment}>Cancelar Inscripción</Button>
                      <Button variant="primary" disabled icon="done">Inscrito Exitosamente</Button>
                    </>
                  ) : isFull ? (
                    <Button variant="outline" disabled fullWidth>Clase Llena (Capacidad Alcanzada)</Button>
                  ) : classObj.status === 'Finalizada' || classObj.status === 'Cancelada' ? (
                    <Button variant="outline" disabled fullWidth>Esta clase ya no está disponible</Button>
                  ) : (
                    <Button variant="primary" icon="assignment_turned_in" fullWidth onClick={handleEnroll}>Inscribirme en esta Clase</Button>
                  )}
                </div>
              </div>
            </motion.section>

            {/* Right Column - Tutor Info & Class Schedule */}
            <motion.aside
              className="request-tutor"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Tutor Card */}
              <div className="request-tutor__card">
                <div className="request-tutor__avatar-wrap">
                  <img src={tutor.avatar} alt={tutor.name} className="request-tutor__avatar-img" />
                  <div className="request-tutor__badge text-label-sm">
                    <Icon name="verified" size={14} />
                    Mentor UTP
                  </div>
                </div>
                <div className="request-tutor__info">
                  <h2 className="text-headline-md">{tutor.name}</h2>
                  <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 13 }}>{tutor.career}</p>
                  <div className="request-tutor__rating">
                    <span className="request-tutor__rating-badge text-label-sm">
                      {tutor.rating} ★
                    </span>
                    <span className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                      ({tutor.reviews} reseñas)
                    </span>
                  </div>
                </div>
                <div className="request-tutor__bio">
                  <h3 className="text-label-md" style={{ color: 'var(--color-primary)', marginBottom: 8 }}>Sobre el Mentor</h3>
                  <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>
                    {tutor.bio}
                  </p>
                </div>
              </div>

              {/* Class Schedule Card */}
              <div className="request-tutor__card" style={{ marginTop: 'var(--space-md)' }}>
                <h3 className="text-headline-md" style={{ marginBottom: 'var(--space-md)', color: 'var(--color-primary)' }}>Horario y Enlaces</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-secondary)' }}>calendar_today</span>
                    <div>
                      <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Fecha</p>
                      <p className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{classObj.date}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-secondary)' }}>schedule</span>
                    <div>
                      <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Horario</p>
                      <p className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{classObj.startTime} - {classObj.endTime}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-secondary)' }}>videocam</span>
                    <div>
                      <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Plataforma</p>
                      <p className="text-body-md" style={{ color: 'var(--color-on-surface)', fontWeight: 600 }}>{classObj.platform}</p>
                    </div>
                  </div>

                  <div style={{ height: 1, background: 'rgba(229, 189, 187, 0.2)' }} />

                  {/* Conditional Material & Video Link */}
                  {isEnrolled ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-primary)' }}>link</span>
                        <div>
                          <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Acceso a Videollamada</p>
                          <a href={classObj.meetingLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'underline', fontSize: 14 }}>
                            Unirse a la Reunión
                          </a>
                        </div>
                      </div>
                      
                      {classObj.materials && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                          <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--color-secondary)' }}>folder</span>
                          <div>
                            <p className="text-label-sm" style={{ color: 'var(--color-outline)' }}>Material de Apoyo</p>
                            {classObj.materials.startsWith('http') ? (
                              <a href={classObj.materials} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-secondary)', fontWeight: 600, textDecoration: 'underline', fontSize: 14 }}>
                                Descargar Materiales
                              </a>
                            ) : (
                              <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{classObj.materials}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', 
                      gap: 8, 
                      alignItems: 'center', 
                      background: 'rgba(61, 92, 162, 0.06)', 
                      padding: 'var(--space-sm)', 
                      borderRadius: 6
                    }}>
                      <span className="material-symbols-outlined" style={{ color: 'var(--color-secondary)', fontSize: 20 }}>lock</span>
                      <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', fontSize: 12 }}>
                        Inscríbete en la clase para visualizar el enlace de videollamada y los materiales de apoyo.
                      </p>
                    </div>
                  )}

                </div>
              </div>
            </motion.aside>

          </div>
        </div>
      </main>

      {/* Success Modal */}
      <Modal open={showModal} onClose={() => {
        setShowModal(false);
        navigate('/dashboard');
      }}>
        <div style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 56, color: 'var(--color-success)', marginBottom: 'var(--space-md)' }}>check_circle</span>
          <h2 className="text-headline-md" style={{ marginBottom: 'var(--space-sm)' }}>¡Inscripción Confirmada!</h2>
          <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-lg)' }}>
            {successMessage}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Button variant="primary" fullWidth onClick={() => {
              setShowModal(false);
              navigate('/dashboard');
            }}>
              Ir a Mis Tutorías
            </Button>
            <Button variant="outline" fullWidth onClick={() => {
              setShowModal(false);
            }}>
              Entendido
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNavBar />
    </>
  );
}
