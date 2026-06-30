import React from 'react';

export default function SCORMLauncher({ launchUrl, title = 'SCORM Lesson' }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <iframe title={title} src={launchUrl} className="scorm-frame" allow="fullscreen" />
    </section>
  );
}
