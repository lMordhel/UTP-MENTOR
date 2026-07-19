import { useState } from 'react';
import './ui.css';

export function Input({
  label,
  icon,
  type = 'text',
  id,
  placeholder,
  required = false,
  value,
  onChange,
  className = '',
  rightAction,
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-group__label text-label-md" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={`input-group__wrapper ${focused ? 'input-group__wrapper--focused' : ''}`}>
        {icon && (
          <span
            className="material-symbols-outlined input-group__icon"
            style={{ color: focused ? 'var(--color-primary)' : 'var(--color-outline)' }}
          >
            {icon}
          </span>
        )}
        <input
          className="input-group__field"
          type={type}
          id={id}
          name={id}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightAction && <div className="input-group__right">{rightAction}</div>}
      </div>
    </div>
  );
}

export function Select({ label, icon, id, children, className = '', ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-group__label text-label-sm" htmlFor={id}>
          {label}
        </label>
      )}
      <div className={`input-group__wrapper ${focused ? 'input-group__wrapper--focused' : ''}`}>
        {icon && (
          <span
            className="material-symbols-outlined input-group__icon"
            style={{ color: focused ? 'var(--color-primary)' : 'var(--color-outline)' }}
          >
            {icon}
          </span>
        )}
        <select
          className="input-group__field input-group__select"
          id={id}
          name={id}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        >
          {children}
        </select>
        <span className="material-symbols-outlined input-group__chevron">expand_more</span>
      </div>
    </div>
  );
}

export function Textarea({ label, id, placeholder, rows = 4, maxLength, className = '', value, onChange, ...props }) {
  const [count, setCount] = useState(value ? String(value).length : 0);

  const handleChange = (e) => {
    setCount(e.target.value.length);
    if (onChange) onChange(e);
  };

  return (
    <div className={`input-group ${className}`}>
      {label && (
        <label className="input-group__label text-label-md" htmlFor={id}>
          {label}
        </label>
      )}
      <div className="input-group__textarea-wrapper">
        <textarea
          className="input-group__textarea"
          id={id}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {maxLength && (
          <span
            className="input-group__counter text-label-sm"
            style={{ color: count > maxLength * 0.9 ? 'var(--color-primary)' : undefined }}
          >
            {count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}
