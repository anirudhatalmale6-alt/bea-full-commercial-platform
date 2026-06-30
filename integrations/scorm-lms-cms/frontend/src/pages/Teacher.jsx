import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner, StatusPill, StatCard, EmptyState, ErrorBanner } from '../components/shared/UI.jsx';

const DEMO_CLASS = 'class-01';
const DEMO_TEACHER = 'user-teacher-01';

// ── Class Overview ─────────────────────────────────────────────────────────
export function TeacherOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/ey/classes/${DEMO_CLASS}/learners`)
      .then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;

  const totalMastered = data.learners.reduce((s, l) => s + Number(l.mastered_skills || 0), 0);
  const totalSupport = data.learners.reduce((s, l) => s + Number(l.needs_support_skills || 0), 0);

  return (
    <div>
      <div className="page-header">
        <h1>Class Overview</h1>
        <p>Reception A — early-years adaptive progress at a glance.</p>
      </div>
      <div className="card-grid grid-4 mb-3">
        <StatCard value={data.learners.length} label="Learners" />
        <StatCard value={totalMastered} label="Skills Mastered" />
        <StatCard value={totalSupport} label="Need Support" />
        <StatCard value={data.learners.reduce((s,l)=>s+Number(l.total_stars||0),0)} label="Total Stars" />
      </div>
      <div className="card">
        <h3 className="mb-2">Learners</h3>
        {data.learners.length === 0
          ? <EmptyState title="No learners enrolled yet." />
          : (
          <table>
            <thead>
              <tr><th>Learner</th><th>Grade</th><th>Mastered</th><th>Needs Support</th><th>Stars</th></tr>
            </thead>
            <tbody>
              {data.learners.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.display_name}</strong></td>
                  <td>{l.grade_band}</td>
                  <td>{l.mastered_skills || 0}</td>
                  <td>{l.needs_support_skills || 0}</td>
                  <td>⭐ {l.total_stars || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Skill Heatmap ──────────────────────────────────────────────────────────
export function TeacherHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/ey/classes/${DEMO_CLASS}/skills`)
      .then(setData).catch(e => setError(e.message));
  }, []);

  if (error) return <ErrorBanner message={error} />;
  if (!data) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Skill Heatmap</h1>
        <p>Mastery status per skill across the class. Green = mastered, gold = practising, berry = needs support.</p>
      </div>
      {data.skills.length === 0
        ? <EmptyState title="No skill evidence yet." hint="Heatmap populates once learners complete sessions." />
        : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Skill</th><th>Subject</th>
                {data.skills[0]?.learners.map(l => (
                  <th key={l.learner_id} style={{ writingMode: 'vertical-rl', height: 90 }}>{l.display_name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.skills.map(skill => (
                <tr key={skill.skill_code}>
                  <td><strong>{skill.skill_name}</strong><br /><span className="muted" style={{fontSize:'0.78rem'}}>{skill.skill_code}</span></td>
                  <td>{skill.subject}</td>
                  {skill.learners.map(l => (
                    <td key={l.learner_id} style={{ textAlign: 'center' }}>
                      <span className={`heat-cell heat-${l.status}`} title={`${l.status} (${Math.round((l.rolling_accuracy||0)*100)}%)`}>
                        {Math.round((l.rolling_accuracy || 0) * 100)}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Groups & Assignments ───────────────────────────────────────────────────
export function TeacherGroups() {
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', purpose: 'intervention' });
  const [msg, setMsg] = useState('');

  function load() {
    api.get(`/ey/teachers/${DEMO_TEACHER}/assignments`)
      .then(d => setAssignments(d.assignments)).catch(e => setError(e.message));
  }
  useEffect(load, []);

  async function createGroup(e) {
    e.preventDefault();
    setMsg('');
    try {
      await api.post(`/ey/teachers/${DEMO_TEACHER}/groups`, {
        name: form.name, purpose: form.purpose, class_id: DEMO_CLASS,
      });
      setMsg(`Group "${form.name}" created.`);
      setForm({ name: '', purpose: 'intervention' });
    } catch (err) { setMsg(err.message); }
  }

  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div className="page-header">
        <h1>Groups &amp; Assignments</h1>
        <p>Build intervention and extension groups, then track assignment queues.</p>
      </div>
      <div className="card-grid grid-2">
        <div className="card">
          <h3 className="mb-2">Create a group</h3>
          {msg && <div className="login-error" style={{ background: 'var(--leaf-soft)', color: 'var(--leaf)' }}>{msg}</div>}
          <form onSubmit={createGroup}>
            <div className="mb-2">
              <label>Group name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Phonics boosters" />
            </div>
            <div className="mb-2">
              <label>Purpose</label>
              <select value={form.purpose} onChange={e => setForm({ ...form, purpose: e.target.value })}>
                <option value="intervention">Intervention</option>
                <option value="extension">Extension</option>
                <option value="practice">Practice</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>
            <button className="btn-primary">Create group</button>
          </form>
        </div>
        <div className="card">
          <h3 className="mb-2">Assignment queue</h3>
          {!assignments ? <Spinner /> : assignments.length === 0
            ? <EmptyState title="No assignments yet." />
            : (
            <table>
              <thead><tr><th>Type</th><th>Target</th><th>Due</th></tr></thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id}>
                    <td>{a.assignment_type}</td>
                    <td>{a.target_type}</td>
                    <td>{a.due_date || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
