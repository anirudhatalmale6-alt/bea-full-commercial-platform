import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { Spinner, EmptyState, ErrorBanner } from '../components/shared/UI.jsx';

export function CefrCatalogue() {
  const [courses, setCourses] = useState(null);
  const [selected, setSelected] = useState(null);
  const [modules, setModules] = useState(null);
  const [moduleDetail, setModuleDetail] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/ey/cefr/courses')
      .then(d => setCourses(d.courses)).catch(e => setError(e.message));
  }, []);

  function openCourse(course) {
    setSelected(course);
    setModules(null);
    setModuleDetail(null);
    api.get(`/ey/cefr/courses/${course.id}/modules`)
      .then(d => setModules(d.modules)).catch(e => setError(e.message));
  }

  function openModule(code) {
    setModuleDetail(null);
    api.get(`/ey/cefr/modules/${code}`)
      .then(setModuleDetail).catch(e => setError(e.message));
  }

  if (error) return <ErrorBanner message={error} />;
  if (!courses) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1>CEFR A1–C2 Catalogue</h1>
        <p>Six levels, sixty modules, ten downloadable resources per module.</p>
      </div>

      <div className="card-grid grid-3 mb-3">
        {courses.map(c => (
          <div key={c.id}
            className="card"
            style={{ cursor: 'pointer', borderColor: selected?.id === c.id ? 'var(--brand)' : undefined, borderWidth: selected?.id === c.id ? 2 : 1 }}
            onClick={() => openCourse(c)}>
            <div className="row-between">
              <span className="pill" style={{ background: 'var(--brand)', color: '#fff' }}>{c.cefr_level}</span>
              <span className="muted">{c.module_count} modules</span>
            </div>
            <h3 className="mt-2">{c.course_name}</h3>
          </div>
        ))}
      </div>

      {selected && (
        <div className="card mb-3">
          <h3 className="mb-2">{selected.cefr_level} — {selected.course_name} modules</h3>
          {!modules ? <Spinner /> : (
            <table>
              <thead><tr><th>Code</th><th>Title</th><th>Grammar</th><th>Function</th></tr></thead>
              <tbody>
                {modules.map(m => (
                  <tr key={m.module_code} style={{ cursor: 'pointer' }} onClick={() => openModule(m.module_code)}>
                    <td><strong>{m.module_code}</strong></td>
                    <td>{m.module_title}</td>
                    <td className="muted">{m.grammar}</td>
                    <td className="muted">{m.function_focus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {moduleDetail && (
        <div className="card">
          <div className="row-between mb-2">
            <h3>{moduleDetail.module_code}: {moduleDetail.module_title}</h3>
            <span className="pill pill-introduced">{moduleDetail.resources.length} resources</span>
          </div>
          <p className="muted mb-2">{moduleDetail.theme_summary}</p>
          <div className="row mb-2" style={{ flexWrap: 'wrap' }}>
            <span className="tag">Grammar: {moduleDetail.grammar}</span>
            <span className="tag">Function: {moduleDetail.function_focus}</span>
          </div>
          <p className="mb-2"><strong>Vocabulary:</strong> <span className="muted">{moduleDetail.vocabulary}</span></p>
          <p className="mb-2"><strong>Lesson path:</strong> <span className="muted">{moduleDetail.lesson_path}</span></p>
          <p className="mb-2"><strong>Assessment:</strong> <span className="muted">{moduleDetail.assessment}</span></p>
          <h4 className="mt-3 mb-2">Downloadable resources</h4>
          <div className="row" style={{ flexWrap: 'wrap' }}>
            {moduleDetail.resources.map(r => (
              <span key={r.id} className="tag" title={r.adaptive_use}>{r.resource_type}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
