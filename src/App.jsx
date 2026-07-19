import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SearchTutorsPage from './pages/SearchTutorsPage';
import RequestTutoringPage from './pages/RequestTutoringPage';
import RatingPage from './pages/RatingPage';
import ClassRequestsPage from './pages/ClassRequestsPage';
import ClassRequestDetailPage from './pages/ClassRequestDetailPage';
import TutorVerificationPage from './pages/TutorVerificationPage';
import { AuthProvider, useAuth } from './context/AuthContext';

const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.25, ease: 'easeIn' } },
};

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <div className="spin" style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>sync</span>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    if (currentUser.role === 'student') {
      return <Navigate to="/search" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--color-background)' }}>
        <div className="spin" style={{ color: 'var(--color-primary)', display: 'inline-flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48 }}>sync</span>
        </div>
      </div>
    );
  }

  if (currentUser) {
    if (currentUser.role === 'student') {
      return <Navigate to="/search" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PublicRoute>
              <motion.div className="page-wrapper" {...pageTransition}>
                <LoginPage />
              </motion.div>
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <motion.div className="page-wrapper" {...pageTransition}>
                <RegisterPage />
              </motion.div>
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'tutor', 'student']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <DashboardPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <SearchTutorsPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/class/:classId"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <RequestTutoringPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rate/:sessionId"
          element={
            <ProtectedRoute allowedRoles={['student', 'admin']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <RatingPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        {/* ── Class Requests ── */}
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={['student', 'tutor', 'admin']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <ClassRequestsPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/:requestId"
          element={
            <ProtectedRoute allowedRoles={['student', 'tutor', 'admin']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <ClassRequestDetailPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        {/* ── Tutor Verification ── */}
        <Route
          path="/tutor-verification"
          element={
            <ProtectedRoute allowedRoles={['tutor']}>
              <motion.div className="page-wrapper" {...pageTransition}>
                <TutorVerificationPage />
              </motion.div>
            </ProtectedRoute>
          }
        />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRoutes />
    </AuthProvider>
  );
}
