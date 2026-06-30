import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { Spinner, StatusPill, EmptyState, ErrorBanner } from '../components/shared/UI.jsx';

export function CefrProgress() {
  const { user } = useAuth();
  const userId = user?.id;

  const [progress, setProgress] = useState(null);
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  // Module submission state
  const [moduleCode, setModuleCode] = useState('');
  const [quiz, setQuiz] = useState('');
  const [speaking, setSpeaking] = useState('');
  const [writing, setWriting] = useState('');
  const [decision, setDecision] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadProgress() {
    api.get(`/ey/cefr/learners/${userId}/progress`)
      .then(setProgress).catch(e => setError(e.message));
  }

  useEffect(() => {
    if (!userId) return;
    loadProgress();
    api.get('/ey/cefr/courses').then(d => setCourses(d.courses)).catch(() => {});
  }, [userId]);

  async function submitModule(e) {
    e.preventDefault();
    setDecision(null);
    setSubmitting(true);
    try {
      const body = { user_id: userId };
      if (quiz !== '') body.quiz_score = Number(quiz);
      if (speaking !== '') body.speaking_rubric_score = Number(speaking);
      if (writing !== '') body.writing_rubric_score = Number(writing);
      const result = await api.post(`/ey/cefr/modules/${moduleCode}/submit`, body);
      setDecision(result);
      loadProgress();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (error) return <ErrorBanner message={error} />;
  if (!progress) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>My CEFR Progress</h1>
        <p>Track module mastery across your enrolled English courses.</p>
      </div>

      <div className="card mb-3">
        <h3 className="mb-2">Enrolled courses</h3>
        {progress.enrolments.length === 0
          ? <p className="muted">No course enrolments yet. Ask your teacher to enrol you.</p>
          : (
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {progress.enrolments.map(c => (
              <span key={c.id} className="pill" style={{ background: 'var(--brand)', color: '#fff' }}>
                {c.cefr_level} — {c.course_name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="card-grid grid-2">
        <div className="card">
          <h3 className="mb-2">Module progress</h3>
          {progress.progress.length === 0
            ? <EmptyState title="No module results yet." hint="Submit a module assessment to see routing." />
            : (
            <table>
              <thead><tr><th>Module</th><th>Status</th><th>Quiz</th><th>Speak</th><th>Write</th></tr></thead>
              <tbody>
                {progress.progress.map(p => (
                  <tr key={p.module_code}>
                    <td><strong>{p.module_code}</strong><br /><span className="muted" style={{ fontSize: '0.78rem' }}>{p.module_title}</span></td>
                    <td><StatusPill status={p.status} /></td>
                    <td>{p.quiz_score ?? '—'}</td>
                    <td>{p.speaking_rubric_score ?? '—'}</td>
                    <td>{p.writing_rubric_score ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3 className="mb-2">Submit a module assessment</h3>
          <form onSubmit={submitModule}>
            <div className="mb-2">
              <label>Module code</label>
              <input value={moduleCode} onChange={e => setModuleCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1-M01" required />
            </div>
            <div className="row mb-2">
              <div style={{ flex: 1 }}>
                <label>Quiz %</label>
                <input type="number" min="0" max="100" value={quiz} onChange={e => setQuiz(e.target.value)} placeholder="0–100" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Speaking %</label>
                <input type="number" min="0" max="100" value={speaking} onChange={e => setSpeaking(e.target.value)} placeholder="rubric" />
              </div>
              <div style={{ flex: 1 }}>
                <label>Writing %</label>
                <input type="number" min="0" max="100" value={writing} onChange={e => setWriting(e.target.value)} placeholder="rubric" />
              </div>
            </div>
            <button className="btn-primary" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit & route'}
            </button>
          </form>

          {decision && (
            <div className="card mt-3" style={{ background: 'var(--paper)' }}>
              <div className="row-between mb-1">
                <strong>Routing decision</strong>
                <StatusPill status={decision.status} />
              </div>
              <p className="muted" style={{ fontSize: '0.88rem' }}>
                Effective score: <strong>{decision.effective_score}</strong> · Rule: <code>{decision.rule_id}</code>
              </p>
              <p className="mt-1">{decision.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
