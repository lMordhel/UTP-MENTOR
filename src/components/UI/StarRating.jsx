import { useState } from 'react';
import { motion } from 'framer-motion';
import './ui.css';

const LABELS = ['Mala', 'Regular', 'Buena', 'Muy Buena', 'Excelente'];

export function StarRating({ value = 0, onChange, size = 36 }) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  return (
    <div className="star-rating">
      <div className="star-rating__stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            type="button"
            className="star-rating__btn"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange?.(star)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: size,
                fontVariationSettings: star <= displayValue ? "'FILL' 1" : "'FILL' 0",
                color: star <= displayValue ? '#fbbf24' : '#94a3b8',
                transition: 'color 0.15s ease',
              }}
            >
              star
            </span>
          </motion.button>
        ))}
      </div>
      <p className="star-rating__label text-body-sm" style={{ color: 'var(--color-secondary)' }}>
        {displayValue > 0 ? LABELS[displayValue - 1] : 'Selecciona una puntuación'}
      </p>
    </div>
  );
}
