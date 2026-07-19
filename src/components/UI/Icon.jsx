export function Icon({ name, filled = false, size, className = '', style = {} }) {
  const iconStyle = {
    fontSize: size || 'inherit',
    fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0",
    ...style,
  };
  return (
    <span className={`material-symbols-outlined ${className}`} style={iconStyle}>
      {name}
    </span>
  );
}
