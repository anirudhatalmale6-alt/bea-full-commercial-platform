import React, { useState } from 'react';
import { api } from '../lib/api';

export default function CMSAdmin() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ content_key: '', content_type: 'page', title: '', draft_body: { sections: [] } });

  async function load() {
    const data = await api.get('/api/cms/content');
    setRecords(data.records || []);
  }

  async function createDraft(e) {
    e.preventDefault();
    await api.post('/api/cms/content', form);
    setForm({ content_key: '', content_type: 'page', title: '', draft_body: { sections: [] } });
    await load();
  }

  async function submit(id) { await api.post(`/api/cms/content/${id}/submit-review`, {}); await load(); }
  async function publish(id) { await api.post(`/api/cms/content/${id}/publish`, {}); await load(); }

  return (
    <main className="page">
      <section className="panel">
        <h1>LEA CMS Editor</h1>
        <p>Create, review and publish course, module, lesson, page, resource, banner and navigation content.</p>
        <form onSubmit={createDraft} className="stack">
          <input placeholder="Content key" value={form.content_key} onChange={e => setForm({ ...form, content_key: e.target.value })} />
          <select value={form.content_type} onChange={e => setForm({ ...form, content_type: e.target.value })}>
            <option>page</option><option>course</option><option>module</option><option>lesson</option><option>resource</option><option>banner</option><option>navigation</option><option>legal</option>
          </select>
          <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
          <button>Create draft</button>
        </form>
        <button onClick={load}>Refresh CMS records</button>
        <div className="grid">
          {records.map(r => (
            <article key={r.id} className="card">
              <h2>{r.title}</h2>
              <p>{r.content_type} · {r.status} · v{r.version}</p>
              <button onClick={() => submit(r.id)}>Submit review</button>
              <button onClick={() => publish(r.id)}>Publish</button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
