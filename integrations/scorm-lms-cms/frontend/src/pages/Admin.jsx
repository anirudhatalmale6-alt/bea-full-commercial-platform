import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner, StatCard, EmptyState, ErrorBanner } from '../components/shared/UI.jsx';

const DEMO_TENANT = 'tenant-lea-01';

export function AdminCoverage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/ey/admin/tenants/${DEMO_TENANT}/content/coverage`)
      .then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;

  const t = data.totals;
  return (
    <div>
      <div className="page-header">
        <h1>Content Coverage</h1>
        <p>Platform-wide content inventory across both curricula.</p>
      </div>
      <div className="card-grid grid-4 mb-3">
        <StatCard value={t.ey_activities} label="EY Activities" />
        <StatCard value={t.cefr_modules} label="CEFR Modules" />
        <StatCard value={t.cefr_resources} label="CEFR Resources" />
        <StatCard value={t.scope_weeks} label="Scope Weeks" />
      </div>

      <div className="card-grid grid-2">
        <div className="card">
          <h3 className="mb-2">Early-years coverage</h3>
          <table>
            <thead><tr><th>Subject</th><th>Grade</th><th>Activities</th><th>Skills</th></tr></thead>
            <tbody>
              {data.early_years_coverage.map((r, i) => (
                <tr key={i}>
                  <td>{r.subject}</td><td>{r.grade_band}</td>
                  <td>{r.activity_count}</td><td>{r.skill_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 className="mb-2">CEFR coverage</h3>
          <table>
            <thead><tr><th>Level</th><th>Course</th><th>Modules</th><th>Resources</th></tr></thead>
            <tbody>
              {data.cefr_coverage.map((r, i) => (
                <tr key={i}>
                  <td><span className="pill" style={{ background: 'var(--brand)', color: '#fff' }}>{r.cefr_level}</span></td>
                  <td>{r.course_name}</td>
                  <td>{r.module_count}</td><td>{r.resource_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminAudit() {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/ey/admin/tenants/${DEMO_TENANT}/audit`)
      .then(d => setEvents(d.events)).catch(e => setError(e.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!events) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Audit Log</h1>
        <p>Safeguarding and platform event trail.</p>
      </div>
      {events.length === 0
        ? <EmptyState title="No events recorded yet." hint="Events appear as learners use the platform." />
        : (
        <div className="card">
          <table>
            <thead><tr><th>Event</th><th>Learner</th><th>Actor</th><th>When</th></tr></thead>
            <tbody>
              {events.map(e => (
                <tr key={e.id}>
                  <td><strong>{e.event_type}</strong></td>
                  <td className="muted">{e.learner_id || '—'}</td>
                  <td className="muted">{e.actor_user_id || 'system'}</td>
                  <td className="muted">{new Date(e.created_at).toLocaleString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
