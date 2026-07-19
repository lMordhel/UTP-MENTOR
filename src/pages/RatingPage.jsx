import { useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TopAppBar, BottomNavBar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Icon } from '../components/UI/Icon';
import { StarRating } from '../components/UI/StarRating';
import { Textarea } from '../components/UI/Input';
import { Chip } from '../components/UI/Chip';
import { db } from '../data/db';
import './RatingPage.css';

const QUICK_TAGS = ['Explicaciones claras', 'Puntual', 'Material útil', 'Paciente', 'Domina el tema', 'Recomendado'];

function Confetti({ active }) {
  if (!active) return null;
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 500 - 250,
    y: Math.random() * -300 - 100,
    rotate: Math.random() * 720 - 360,
    scale: Math.random() * 0.5 + 0.5,
    delay: Math.random() * 0.4,
    color: ['#9e001f', '#3d5ca2', '#fbbf24', '#2e7d32', '#e0e9f2'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="confetti-container">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="confetti-particle"
          style={{ background: p.color }}
          initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: p.scale }}
          animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rotate }}
          transition={{ duration: 1.6, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

export default function RatingPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  // Load session from DB
  const classes = db.getClasses();
  const session = classes.find((c) => c.id === sessionId) || classes[0];

  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleTag = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;

    setShowConfetti(true);

    // 1. Update session status, rating, and feedback
    db.updateClass(session.id, {
      status: 'completed',
      rating: rating,
      tags: selectedTags,
      comment: commentText,
    });

    // 2. Recalculate and update tutor rating in dynamic DB
    const tutorsList = db.getTutors();
    const tutorIndex = tutorsList.findIndex((t) => t.id === session.tutorId);
    if (tutorIndex !== -1) {
      const tutor = tutorsList[tutorIndex];
      const prevReviews = tutor.reviews || 0;
      const prevRating = tutor.rating || 0;
      const newReviews = prevReviews + 1;
      // Formula: ((PrevRating * PrevReviews) + NewRating) / NewReviews
      const newRating = parseFloat(
        ((prevRating * prevReviews + rating) / newReviews).toFixed(1)
      );

      tutorsList[tutorIndex] = {
        ...tutor,
        reviews: newReviews,
        rating: newRating,
      };
      localStorage.setItem('utp_tutors', JSON.stringify(tutorsList));
    }

    setTimeout(() => setSubmitted(true), 600);
    setTimeout(() => setShowConfetti(false), 2200);
  };

  return (
    <>
      <TopAppBar showBack />
      <main className="rating-page app-shell app-shell--with-bottomnav">
        <div className="rating-page__inner">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ duration: 0.4 }}
              >
                {/* Session Summary */}
                {session && (
                  <div className="rating-session-card glass">
                    <div className="rating-session__header">
                      <div className="rating-session__avatar" style={{ overflow: 'hidden' }}>
                        <img src={session.tutorAvatar} alt={session.tutorName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <h3 className="text-label-md">{session.tutorName}</h3>
                        <p className="text-body-sm" style={{ color: 'var(--color-secondary)' }}>{session.subject}</p>
                      </div>
                    </div>
                    <div className="rating-session__details">
                      <div className="rating-session__detail">
                        <Icon name="calendar_today" size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
                        <span className="text-body-sm">{session.date}</span>
                      </div>
                      <div className="rating-session__detail">
                        <Icon name="schedule" size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
                        <span className="text-body-sm">{session.time}</span>
                      </div>
                      <div className="rating-session__detail">
                        <Icon name="location_on" size={16} style={{ color: 'var(--color-on-surface-variant)' }} />
                        <span className="text-body-sm">{session.location}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rating Form */}
                <form className="rating-form" onSubmit={handleSubmit}>
                  <section className="rating-form__card">
                    <div className="rating-form__card-header">
                      <Icon name="star" filled size={22} style={{ color: 'var(--color-primary)' }} />
                      <h3 className="text-headline-md">Califica tu Experiencia</h3>
                    </div>
                    <StarRating value={rating} onChange={setRating} size={42} />
                  </section>

                  <section className="rating-form__card">
                    <h4 className="text-label-md" style={{ marginBottom: 12 }}>
                      ¿Qué fue lo que más te gustó?
                    </h4>
                    <div className="rating-form__quick-tags">
                      {QUICK_TAGS.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          active={selectedTags.includes(tag)}
                          onClick={() => toggleTag(tag)}
                        />
                      ))}
                    </div>
                  </section>

                  <section className="rating-form__card">
                    <Textarea
                      label="Comentarios (opcional)"
                      id="rating-comment"
                      placeholder="Escribe aquí tu experiencia con la sesión de tutoría..."
                      rows={4}
                      maxLength={500}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                  </section>

                  <div className="rating-form__actions">
                    <button type="button" className="rating-skip text-label-md" onClick={() => navigate('/dashboard')}>
                      Omitir
                    </button>
                    <Button
                      type="submit"
                      variant="primary"
                      icon="send"
                      iconPosition="right"
                      disabled={rating === 0}
                    >
                      Enviar Calificación
                    </Button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                className="rating-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="rating-success__icon">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
                  >
                    <Icon name="check_circle" filled size={64} style={{ color: 'var(--color-success)' }} />
                  </motion.div>
                </div>
                <h2 className="text-headline-lg">¡Gracias por tu opinión!</h2>
                <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', maxWidth: 400, margin: '0 auto', marginBottom: 32 }}>
                  Tu calificación ha sido registrada y ayudará a mejorar la experiencia de mentoría para todos.
                </p>
                <div className="rating-success__stars" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 32 }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <motion.span
                      key={s}
                      className="material-symbols-outlined"
                      style={{
                        fontSize: 32,
                        fontVariationSettings: s <= rating ? "'FILL' 1" : "'FILL' 0",
                        color: s <= rating ? '#fbbf24' : '#94a3b8',
                      }}
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + s * 0.1, type: 'spring', stiffness: 400 }}
                    >
                      star
                    </motion.span>
                  ))}
                </div>
                <Button variant="primary" icon="arrow_forward" iconPosition="right" onClick={() => navigate('/dashboard')}>
                  Volver al Inicio
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <Confetti active={showConfetti} />
        </div>
      </main>
      <BottomNavBar />
    </>
  );
}

