export function Spinner() {
  return <div className="spinner" aria-label="Loading" role="status" />;
}

export function StatusPill({ status }) {
  const label = (status || 'not_started').replace(/_/g, ' ');
  return <span className={`pill pill-${status || 'not_started'}`}>{label}</span>;
}

export function StatCard({ value, label, suffix = '' }) {
  return (
    <div className="card stat-card">
      <div className="value">{value}{suffix}</div>
      <div className="label">{label}</div>
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return <div className="login-error" role="alert">{message}</div>;
}

export function EmptyState({ title, hint }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
      <h3 className="muted">{title}</h3>
      {hint && <p className="muted mt-1">{hint}</p>}
    </div>
  );
}
