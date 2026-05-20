export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  loading = false,
  className = '',
  disabled = false,
  ...props
}) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${variants[variant] || variants.primary} inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      <span>{children}</span>
    </button>
  );
}
