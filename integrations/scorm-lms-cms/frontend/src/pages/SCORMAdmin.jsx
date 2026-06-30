import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function SCORMAdmin() {
  const [packages, setPackages] = useState([]);
  const [manifest, setManifest] = useState('');

  async function load() {
    const data = await api.get('/api/scorm/packages');
    setPackages(data.packages || []);
  }

  async function build() {
    const data = await api.post('/api/scorm/packages/build', {
      module_code: 'A1-M01', title: 'A1-M01 Identity, goals and learner profile', scorm_version: '1.2', mastery_score: 80
    });
    setManifest(data.manifest_xml || '');
  }

  useEffect(() => { load(); }, []);

  return (
    <main className="page">
      <section className="panel">
        <h1>SCORM Package Centre</h1>
        <p>Build and manage SCORM 1.2 and SCORM 2004 module exports.</p>
        <button onClick={load}>List packages</button>
        <button onClick={build}>Generate manifest preview</button>
        <div className="grid">
          {packages.map(pkg => <article className="card" key={pkg.name}><h2>{pkg.name}</h2><p>{pkg.path}</p></article>)}
        </div>
        {manifest && <pre className="codeblock">{manifest}</pre>}
      </section>
    </main>
  );
}
