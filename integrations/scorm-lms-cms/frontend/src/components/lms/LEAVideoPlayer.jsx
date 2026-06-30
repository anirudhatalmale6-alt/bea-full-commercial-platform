import React, { useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';

export default function LEAVideoPlayer({ videoId }) {
  const videoRef = useRef(null);
  const [video, setVideo] = useState(null);
  const [percent, setPercent] = useState(0);
  const [status, setStatus] = useState('not_started');

  useEffect(() => {
    api.get(`/api/videos/${videoId}`).then(setVideo).catch(console.error);
  }, [videoId]);

  async function onTimeUpdate() {
    const el = videoRef.current;
    if (!el || !el.duration) return;
    const nextPercent = Math.round((el.currentTime / el.duration) * 100);
    if (nextPercent > percent) {
      setPercent(nextPercent);
      if (nextPercent % 10 === 0 || nextPercent >= (video?.completion_threshold_percent || 90)) {
        const result = await api.post(`/api/videos/${videoId}/progress`, {
          percent_watched: nextPercent,
          seconds_watched: Math.round(el.currentTime),
        });
        setStatus(result.completion?.status || status);
      }
    }
  }

  if (!video) return <p>Loading video...</p>;

  return (
    <section className="panel">
      <h2>{video.title}</h2>
      <video ref={videoRef} controls poster={video.thumbnail_url} onTimeUpdate={onTimeUpdate}>
        <source src={video.video_url} type="video/mp4" />
        {video.caption_url && <track kind="captions" src={video.caption_url} srcLang="en" label="English" default />}
      </video>
      <p>Watched: {percent}% · Status: {status}</p>
      {video.transcript_url && <a href={video.transcript_url}>Open transcript</a>}
    </section>
  );
}
