import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { Spinner, StatCard, ErrorBanner } from '../components/shared/UI.jsx';

const DEMO_LEARNER = 'learner-01';

export function ParentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const parentId = user?.id || 'user-parent-01';
    api.get(`/ey/parents/${parentId}/learners/${DEMO_LEARNER}/summary`)
      .then(setData).catch(e => setError(e.message));
  }, [user]);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;

  const s = data.weekly_summary;
  return (
    <div>
      <div className="page-header">
        <h1>Your Child's Week</h1>
        <p>{data.celebration_message}</p>
      </div>

      <div className="card-grid grid-3 mb-3">
        <StatCard value={s.sessions_completed} label="Sessions This Week" />
        <StatCard value={`${Math.round(s.average_accuracy * 100)}`} suffix="%" label="Average Accuracy" />
        <StatCard value={s.stars_earned} label="Stars Earned" />
      </div>

      <div className="card-grid grid-2">
        <div className="card">
          <h3 className="mb-2">Recently mastered</h3>
          {data.recently_mastered.length === 0
            ? <p className="muted">Still building towards the first mastered skill — that's perfectly normal.</p>
            : (
            <ul style={{ listStyle: 'none' }}>
              {data.recently_mastered.map((m, i) => (
                <li key={i} className="mt-1" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--line)' }}>
                  ✅ {m}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card" style={{ background: 'var(--accent-soft)' }}>
          <h3 className="mb-2">This week at home</h3>
          {data.home_practice.map((p, i) => (
            <div key={i} className="card mt-1" style={{ padding: '0.8rem' }}>
              <strong>{p.title}</strong>
              <div className="muted" style={{ fontSize: '0.82rem' }}>{p.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
