import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { api } from '../lib/api.js';
import { Spinner, ErrorBanner } from '../components/shared/UI.jsx';

const DEMO_LEARNER = 'learner-01';

const MECHANIC_EMOJI = {
  'Drag to Build': '🧩', 'Blend Builder': '🔤', 'Find the Mistake': '🔍',
  'Read and Record': '🎙️', 'Tap the Sound': '👆', 'Listen and Choose': '👂',
  'Sort It': '📦', 'Count and Group': '🔢', 'Math Mission': '🚀', 'Trace and Say': '✏️',
};

export function LearnerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pathway, setPathway] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/ey/learners/${DEMO_LEARNER}/pathway`)
      .then(setPathway).catch(e => setError(e.message));
  }, []);

  if (error) return <div className="learner-shell"><div className="main"><ErrorBanner message={error} /></div></div>;
  if (!pathway) return <div className="learner-shell"><Spinner /></div>;

  const totalStars = (pathway.recent_rewards || []).reduce((s, r) => s + Number(r.points || 0), 0);

  return (
    <div className="learner-shell">
      <div className="learner-header">
        <div className="learner-greeting">Hi {pathway.display_name?.split(' ')[0] || 'friend'}! 👋</div>
        <div className="row">
          <span className="star-badge">⭐ {totalStars} stars</span>
          <button className="btn-ghost" onClick={() => navigate('/learner/cefr')}>My English course</button>
          <button className="btn-ghost" onClick={() => { logout(); navigate('/login'); }}>Exit</button>
        </div>
      </div>

      <div className="main" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h2 className="mb-3" style={{ color: 'var(--brand)' }}>Pick a game to play</h2>

        {pathway.next_activities.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <h3>🎉 All caught up!</h3>
            <p className="muted mt-1">You've finished everything for now. Brilliant work!</p>
          </div>
        ) : (
          <div className="card-grid grid-2">
            {pathway.next_activities.map(a => (
              <div key={a.id} className="game-tile" onClick={() => navigate(`/learner/play/${a.id}`)}>
                <div style={{ fontSize: '2.5rem' }}>{MECHANIC_EMOJI[a.mechanic] || '🎮'}</div>
                <div className="mechanic-badge">{a.mechanic}</div>
                <h3>{a.title.split(' - ')[0]}</h3>
                <p className="muted" style={{ fontSize: '0.85rem' }}>{a.subject}</p>
                <button className="btn-accent mt-2" style={{ width: '100%' }}>Play ▶</button>
              </div>
            ))}
          </div>
        )}

        {pathway.mastery_summary && pathway.mastery_summary.length > 0 && (
          <div className="mt-3">
            <h3 className="mb-2" style={{ color: 'var(--brand)' }}>My progress map</h3>
            <div className="card">
              <div className="row" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                {pathway.mastery_summary.map((m, i) => (
                  <span key={i} className={`heat-cell heat-${m.status}`} title={`${m.skill_name}: ${m.status}`} style={{ width: 44, height: 44 }}>
                    {m.status === 'mastered' ? '⭐' : m.status === 'needs_support' ? '💪' : '•'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
