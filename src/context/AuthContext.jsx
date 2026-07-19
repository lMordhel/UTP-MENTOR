import { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../data/db';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session recovery
    const savedUser = localStorage.getItem('utp_currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Simulating API call latency
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = db.getUsers();
        // Case-insensitive email match
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user || user.password !== password) {
          resolve({ success: false, error: 'Correo institucional o contraseña incorrectos.' });
          return;
        }

        // If they are a tutor, check if they got approved
        if (user.role === 'tutor') {
          // Check if they are still pending approval
          const pending = db.getPendingTutors();
          const isPending = pending.some(p => p.id === user.id);
          
          const loggedInUser = { ...user, isPending };
          setCurrentUser(loggedInUser);
          localStorage.setItem('utp_currentUser', JSON.stringify(loggedInUser));
          resolve({ success: true, user: loggedInUser });
          return;
        }

        setCurrentUser(user);
        localStorage.setItem('utp_currentUser', JSON.stringify(user));
        resolve({ success: true, user });
      }, 800);
    });
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('utp_currentUser');
  };

  const registerUser = async (userData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = db.getUsers();
        const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase());
        
        if (exists) {
          resolve({ success: false, error: 'El correo institucional ya se encuentra registrado.' });
          return;
        }

        const newUser = {
          id: `usr-${Date.now()}`,
          ...userData,
        };

        db.saveUser(newUser);

        // If it's a student, log in automatically
        if (newUser.role === 'student') {
          setCurrentUser(newUser);
          localStorage.setItem('utp_currentUser', JSON.stringify(newUser));
        }

        resolve({ success: true, user: newUser });
      }, 1000);
    });
  };

  const refreshSession = () => {
    if (!currentUser) return;
    const users = db.getUsers();
    const updated = users.find(u => u.id === currentUser.id);
    if (updated) {
      // Re-verify if still pending if they are a tutor
      let isPending = false;
      if (updated.role === 'tutor') {
        const pending = db.getPendingTutors();
        isPending = pending.some(p => p.id === updated.id);
      }
      const refreshed = { ...updated, isPending };
      setCurrentUser(refreshed);
      localStorage.setItem('utp_currentUser', JSON.stringify(refreshed));
    }
  };

  const value = {
    currentUser,
    loading,
    login,
    logout,
    registerUser,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
