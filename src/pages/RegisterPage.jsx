import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopAppBar } from '../components/Layout/Layout';
import { Button } from '../components/UI/Button';
import { Input, Select } from '../components/UI/Input';
import { Icon } from '../components/UI/Icon';
import { useAuth } from '../context/AuthContext';
import { careers } from '../data/mockData';
import './RegisterPage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' },
  }),
};

export default function RegisterPage() {
  const [role, setRole] = useState('student');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [career, setCareer] = useState('');
  const [cycle, setCycle] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, ingresa tu nombre completo.');
      return;
    }
    if (!code.trim() || !/^U\d{8}$/i.test(code.trim())) {
      setError('El código universitario debe tener el formato UXXXXXXXX (ej. U21304561).');
      return;
    }
    if (!career) {
      setError('Por favor, selecciona tu carrera profesional.');
      return;
    }
    if (!email.toLowerCase().endsWith('@utp.edu.pe')) {
      setError('Debes registrarte con tu correo institucional (@utp.edu.pe).');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    
    // Get career label
    const selectedCareerObj = careers.find(c => c.value === career);
    const careerLabel = selectedCareerObj ? selectedCareerObj.label : career;

    try {
      const res = await registerUser({
        name,
        code: code.trim().toUpperCase(),
        career: careerLabel,
        cycle: parseInt(cycle),
        email,
        password,
        role,
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          if (role === 'student') {
            navigate('/search');
          } else {
            // Tutor requires approval, redirect to login
            navigate('/');
          }
        }, 2000);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al registrar la cuenta.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopAppBar />
      <main className="register-page app-shell">
        <div className="register-grid">
          {/* Left - Visual */}
          <motion.div
            className="register-visual"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="register-hero">
              <div className="register-hero__content">
                <h2 className="text-headline-lg" style={{ color: 'var(--color-on-primary-container)' }}>
                  Impulsa tu Futuro
                </h2>
                <p className="text-body-md" style={{ color: 'var(--color-on-primary-container)', opacity: 0.9 }}>
                  Únete a la red académica más grande de la UTP. Comparte conocimiento, crece juntos y domina tu carrera.
                </p>
              </div>
            </div>
            <div className="register-info-card">
              <div className="register-info-card__icon">
                <Icon name="verified_user" size={24} style={{ color: 'var(--color-on-secondary)' }} />
              </div>
              <div>
                <p className="text-label-md">Acceso Verificado</p>
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Exclusivo para miembros de la comunidad UTP.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            className="register-form-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="register-form__header">
              <h2 className="text-headline-md">Crear Cuenta</h2>
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                Completa tus datos académicos para empezar.
              </p>
            </div>

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
                marginBottom: 'var(--space-md)',
                border: '1px solid var(--color-error)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>warning</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div style={{
                color: 'var(--color-success)',
                background: 'rgba(46, 125, 50, 0.1)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--radius-default)',
                fontSize: 'var(--text-body-sm-size)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 'var(--space-md)',
                border: '1px solid var(--color-success)'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>check_circle</span>
                <span>
                  {role === 'student'
                    ? '¡Cuenta creada con éxito! Redirigiendo...'
                    : 'Registro exitoso. Tu cuenta de Tutor está pendiente de aprobación por el administrador.'}
                </span>
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit}>
              {/* Role Selection */}
              <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="register-role">
                <label className="text-label-md" style={{ color: 'var(--color-on-surface-variant)' }}>
                  Me registro como:
                </label>
                <div className="register-role__options">
                  {['student', 'tutor'].map((r) => (
                    <label key={r} className="register-role__option">
                      <input
                        type="radio"
                        name="role"
                        value={r}
                        checked={role === r}
                        onChange={() => setRole(r)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`register-role__card ${role === r ? 'register-role__card--active' : ''}`}>
                        <Icon name={r === 'student' ? 'person' : 'psychology'} size={24} />
                        <span className="text-label-md">{r === 'student' ? 'Estudiante' : 'Tutor'}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>

              <div className="register-form__grid">
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                  <Input
                    label="Nombre Completo"
                    icon="person"
                    id="reg-name"
                    placeholder="Ingresa tu nombre completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </motion.div>
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                  <Input
                    label="Código Universitario"
                    icon="badge"
                    id="reg-code"
                    placeholder="U21XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    disabled={loading}
                    required
                  />
                </motion.div>
              </div>

              <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                <Select
                  label="Carrera Profesional"
                  icon="workspace_premium"
                  id="reg-career"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  disabled={loading}
                  required
                >
                  {careers.map((c) => (
                    <option key={c.value} value={c.value} disabled={c.disabled}>{c.label}</option>
                  ))}
                </Select>
              </motion.div>

              <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible" className="register-cycles">
                <label className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>Ciclo Académico</label>
                <div className="register-cycles__row hide-scrollbar">
                  {[...Array(10)].map((_, i) => (
                    <motion.label
                      key={i + 1}
                      className="register-cycle"
                      whileHover={{ scale: loading ? 1 : 1.1 }}
                      whileTap={{ scale: loading ? 1 : 0.9 }}
                    >
                      <input
                        type="radio"
                        name="cycle"
                        value={i + 1}
                        checked={cycle === i + 1}
                        onChange={() => setCycle(i + 1)}
                        className="sr-only"
                        disabled={loading}
                      />
                      <div className={`register-cycle__circle text-label-md ${cycle === i + 1 ? 'register-cycle__circle--active' : ''}`}>
                        {i + 1}
                      </div>
                    </motion.label>
                  ))}
                </div>
              </motion.div>

              <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible">
                <Input
                  label="Correo Institucional"
                  icon="mail"
                  type="email"
                  id="reg-email"
                  placeholder="ejemplo@utp.edu.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </motion.div>

              <div className="register-form__grid">
                <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible">
                  <Input
                    label="Contraseña"
                    icon="lock"
                    type={showPw ? 'text' : 'password'}
                    id="reg-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    rightAction={
                      <button type="button" onClick={() => setShowPw(!showPw)} style={{ color: 'var(--color-on-surface-variant)', cursor: 'pointer', display: 'flex' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPw ? 'visibility' : 'visibility_off'}</span>
                      </button>
                    }
                  />
                </motion.div>
                <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible">
                  <Input
                    label="Confirmar Contraseña"
                    icon="lock"
                    type="password"
                    id="reg-confirm"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </motion.div>
              </div>

              <motion.div custom={8} variants={fadeUp} initial="hidden" animate="visible">
                <Button
                  type="submit"
                  variant={success ? 'success' : 'primary'}
                  fullWidth
                  disabled={loading || success}
                  icon={loading ? undefined : success ? 'check_circle' : 'arrow_forward'}
                  iconPosition="right"
                >
                  {loading ? (
                    <span className="spin" style={{ display: 'inline-flex' }}>
                      <Icon name="sync" size={20} />
                    </span>
                  ) : success ? '¡Bienvenido!' : 'Registrar Cuenta'}
                </Button>
              </motion.div>

              <div className="register-form__login-link">
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
                  ¿Ya tienes una cuenta? <Link to="/" className="register-form__link">Inicia sesión aquí</Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>

        <footer className="register-footer">
          <div className="register-footer__links">
            <a href="#" className="text-label-sm">Términos de Servicio</a>
            <a href="#" className="text-label-sm">Política de Privacidad</a>
            <a href="#" className="text-label-sm">Centro de Ayuda</a>
          </div>
          <p className="text-label-sm" style={{ color: 'var(--color-on-surface-variant)' }}>
            © 2024 UTP Mentors. Diseñado para la Excelencia.
          </p>
        </footer>
      </main>
    </>
  );
}

