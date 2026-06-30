import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function LMSAdmin() {
  const [catalogue, setCatalogue] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/lms/catalogue')
      .then(data => setCatalogue(data.courses || []))
      .catch(err => setError(err.message));
  }, []);

  return (
    <main className="page">
      <section className="panel">
        <h1>LEA LMS Delivery</h1>
        <p>Published courses, module mapping, lessons, resources, video assets and SCORM launch packages.</p>
        {error && <p className="error">{error}</p>}
        <div className="grid">
          {catalogue.map(course => (
            <article key={course.course_key} className="card">
              <h2>{course.title}</h2>
              <p><strong>Level:</strong> {course.cefr_level}</p>
              <p>{course.description}</p>
              <p><strong>Modules:</strong> {(course.modules || []).length}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
