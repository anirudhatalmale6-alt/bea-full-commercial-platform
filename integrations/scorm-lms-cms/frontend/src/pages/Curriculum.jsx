import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner, EmptyState, ErrorBanner } from '../components/shared/UI.jsx';

const GRADES = ['Pre-K', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3'];

export function CurriculumScope() {
  const [grade, setGrade] = useState('Pre-K');
  const [weeks, setWeeks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setWeeks(null);
    api.get(`/ey/curriculum/scope?grade_band=${encodeURIComponent(grade)}`)
      .then(d => setWeeks(d.weeks)).catch(e => setError(e.message));
  }, [grade]);

  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div className="page-header">
        <h1>Scope &amp; Sequence</h1>
        <p>36-week structured-literacy pacing for Pre-K through Grade 3.</p>
      </div>
      <div className="row mb-3" style={{ flexWrap: 'wrap' }}>
        {GRADES.map(g => (
          <button key={g}
            className={grade === g ? 'btn-primary' : 'btn-ghost'}
            onClick={() => setGrade(g)}>{g}</button>
        ))}
      </div>
      {!weeks ? <Spinner /> : weeks.length === 0
        ? <EmptyState title="No scope data for this grade." />
        : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>Week</th><th>Unit</th><th>Skill Focus</th><th>Core Routine</th><th>Assessment</th></tr></thead>
            <tbody>
              {weeks.map(w => (
                <tr key={`${w.grade_band}-${w.week}-${w.unit}`}>
                  <td><strong>{w.week}</strong></td>
                  <td>{w.unit}</td>
                  <td>{w.skill_focus}</td>
                  <td className="muted">{w.core_routine}</td>
                  <td className="muted">{w.assessment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CurriculumResources() {
  const [source, setSource] = useState('cefr');
  const [resources, setResources] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setResources(null);
    api.get(`/ey/curriculum/resources?source=${source}`)
      .then(d => setResources(d.resources)).catch(e => setError(e.message));
  }, [source]);

  if (error) return <ErrorBanner message={error} />;

  return (
    <div>
      <div className="page-header">
        <h1>Curriculum &amp; Resources</h1>
        <p>Editable downloadable resource library across both curricula.</p>
      </div>
      <div className="row mb-3">
        <button className={source === 'cefr' ? 'btn-primary' : 'btn-ghost'} onClick={() => setSource('cefr')}>CEFR resources</button>
        <button className={source === 'early_years' ? 'btn-primary' : 'btn-ghost'} onClick={() => setSource('early_years')}>Early Years resources</button>
      </div>
      {!resources ? <Spinner /> : resources.length === 0
        ? <EmptyState title="No resources found." />
        : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table>
            <thead><tr><th>{source === 'cefr' ? 'Module' : 'Grade'}</th><th>Type</th><th>Title</th><th>Format</th><th>Adaptive use</th></tr></thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.module_code || r.grade_band}</strong></td>
                  <td>{r.resource_type}</td>
                  <td>{r.title}</td>
                  <td><span className="tag">{r.format}</span></td>
                  <td className="muted" style={{ fontSize: '0.82rem' }}>{r.adaptive_use}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="muted mt-2" style={{ fontSize: '0.82rem' }}>Showing up to 200 resources. Use the API with module/grade filters for targeted retrieval.</p>
        </div>
      )}
    </div>
  );
}
