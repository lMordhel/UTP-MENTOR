import { motion } from 'framer-motion';
import './ui.css';

export function Chip({ label, active = false, onClick, className = '' }) {
  return (
    <motion.button
      className={`chip ${active ? 'chip--active' : ''} ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      layout
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {label}
    </motion.button>
  );
}

export function Tag({ label, className = '' }) {
  return (
    <span className={`tag ${className}`}>
      {label}
    </span>
  );
}
