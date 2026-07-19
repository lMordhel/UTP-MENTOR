import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Icon } from '../components/UI/Icon';
import { useAuth } from '../context/AuthContext';
import { communityAvatars } from '../data/mockData';
import './LoginPage.css';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Quick email validation
    if (!email.toLowerCase().endsWith('@utp.edu.pe')) {
      setError('Debes ingresar un correo institucional válido (@utp.edu.pe).');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        // Redirect according to user role
        if (res.user.role === 'student') {
          navigate('/search');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al intentar iniciar sesión.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      {/* Left — Branding Panel */}
      <motion.section
        className="login-branding"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <div className="login-branding__inner">
          <motion.div variants={stagger} initial="hidden" animate="visible">
            <motion.div variants={fadeUp} className="login-branding__logo-box">
              <Icon name="school" filled size={36} style={{ color: 'white' }} />
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-headline-xl login-branding__title">
              Impulsa tu <span className="login-branding__accent">futuro académico</span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-body-lg login-branding__subtitle">
              Conecta con mentores expertos de la UTP y eleva tu potencial al siguiente nivel.
              Accede a recursos exclusivos, tutorías y una comunidad dedicada a tu éxito profesional.
            </motion.p>
          </motion.div>

          <motion.div
            className="login-branding__features"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} className="login-feature-card">
              <Icon name="verified" size={24} style={{ color: 'var(--color-secondary)' }} />
              <h3 className="text-label-md">Mentores Certificados</h3>
            </motion.div>
            <motion.div variants={fadeUp} className="login-feature-card">
              <Icon name="calendar_month" size={24} style={{ color: 'var(--color-secondary)' }} />
              <h3 className="text-label-md">Horarios Flexibles</h3>
            </motion.div>
          </motion.div>

          <motion.div
            className="login-branding__community"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <div className="login-avatars">
              {communityAvatars.map((src, i) => (
                <img key={i} className="login-avatars__img" src={src} alt="Estudiante UTP" />
              ))}
            </div>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
              Empieza hoy y forma parte de una <strong style={{ color: 'var(--color-on-surface)' }}>comunidad en crecimiento</strong>.
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Right — Login Form */}
      <motion.section
        className="login-form-section"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
      >
        <div className="login-form-wrapper">
          {/* Logo */}
          <div className="login-form__header">
            <div className="login-form__logo-row">
              <div className="login-form__logo-square">
                <span style={{ color: 'white', fontWeight: 800, fontSize: 24 }}>U</span>
              </div>
              <span className="text-headline-md login-branding__accent" style={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                UTP Mentors
              </span>
            </div>
            <h2 className="text-headline-lg-mobile login-form__greeting">¡Hola de nuevo!</h2>
            <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>
              Ingresa tus credenciales institucionales.
            </p>
          </div>

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div style={{
                color: 'var(--color-on-error-container)',
                background: 'var(--color-error-container)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-default)',
                fontSize: 'var(--text-body-sm-size)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--color-error)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Correo Institucional"
              icon="alternate_email"
              type="email"
              id="login-email"
              placeholder="C000000@utp.edu.pe"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <div>
              <div className="login-form__password-header">
                <label className="text-label-md" htmlFor="login-password">Contraseña</label>
                <a href="#" className="text-label-sm login-form__forgot">¿Olvidaste tu contraseña?</a>
              </div>
              <Input
                icon="lock"
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                rightAction={
                  <button
                    type="button"
                    className="login-form__eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                }
              />
            </div>

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? (
                <span className="spin" style={{ display: 'inline-flex' }}>
                  <Icon name="sync" size={20} />
                </span>
              ) : 'Iniciar Sesión'}
            </Button>

            <div className="login-form__divider">
              <div className="login-form__divider-line" />
              <span className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                ¿No tienes una cuenta?
              </span>
              <div className="login-form__divider-line" />
            </div>

            <Link to="/register" style={{ width: '100%' }}>
              <Button type="button" variant="outline" fullWidth disabled={loading}>
                Registrarse
              </Button>
            </Link>
          </form>

          {/* Footer */}
          <div className="login-form__footer">
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', opacity: 0.7 }}>
              Al continuar, aceptas nuestros{' '}
              <a href="#" className="login-form__link">Términos y Condiciones</a> y la{' '}
              <a href="#" className="login-form__link">Política de Privacidad</a> de la Universidad Tecnológica del Perú.
            </p>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

