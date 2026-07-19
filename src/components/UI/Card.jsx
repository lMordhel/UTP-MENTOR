import { motion } from 'framer-motion';
import './ui.css';

export function Card({ children, className = '', glass = false, hoverable = true, onClick, ...props }) {
  return (
    <motion.div
      className={`card ${glass ? 'card--glass' : ''} ${className}`}
      onClick={onClick}
      whileHover={hoverable ? { y: -2, boxShadow: '0px 8px 24px rgba(20, 29, 35, 0.12)' } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StatCard({ icon, iconColor, label, value, trend, trendLabel, trendColor }) {
  return (
    <Card glass className="stat-card">
      <div className="stat-card__content">
        <div className="stat-card__info">
          <p className="text-label-md stat-card__label">{label}</p>
          <h3 className="text-headline-xl stat-card__value" style={{ color: iconColor }}>
            {value}
          </h3>
          {trendLabel && (
            <div className="stat-card__trend" style={{ color: trendColor || 'var(--color-success)' }}>
              {trend && <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{trend}</span>}
              <span className="text-label-sm">{trendLabel}</span>
            </div>
          )}
        </div>
        <div className="stat-card__icon-box" style={{ color: iconColor }}>
          <span className="material-symbols-outlined" style={{ fontSize: 32 }}>{icon}</span>
        </div>
      </div>
      <div className="stat-card__bg-icon" style={{ color: iconColor }}>
        <span className="material-symbols-outlined" style={{ fontSize: 120 }}>{icon}</span>
      </div>
    </Card>
  );
}
