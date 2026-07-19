import { motion } from 'framer-motion';
import './ui.css';

export function Button({
  children,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  type = 'button',
  disabled = false,
  fullWidth = false,
  size = 'medium',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size === 'small' && 'btn--small',
    fullWidth && 'btn--full',
    disabled && 'btn--disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      className={classes}
      type={type}
      disabled={disabled}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined btn__icon">{icon}</span>
      )}
      {children && <span className="btn__label">{children}</span>}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined btn__icon">{icon}</span>
      )}
    </motion.button>
  );
}

export function IconButton({ icon, filled = false, onClick, className = '', size = 40, badge, ...props }) {
  return (
    <motion.button
      className={`icon-btn ${className}`}
      onClick={onClick}
      style={{ width: size, height: size }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <span
        className="material-symbols-outlined"
        style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      {badge && <span className="icon-btn__badge">{badge}</span>}
    </motion.button>
  );
}
