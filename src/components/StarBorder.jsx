export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#6C63FF',
  speed = '6s',
  children,
  ...rest
}) {
  return (
    <Component
      className={`star-border-container ${className}`}
      {...rest}
    >
      <div
        className="border-gradient-bottom"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="border-gradient-top"
        style={{
          background: `radial-gradient(circle, ${color}, transparent 10%)`,
          animationDuration: speed,
        }}
      />
      <div className="star-border-inner">
        {children}
      </div>
    </Component>
  );
}
