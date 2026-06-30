import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Spinner, ErrorBanner } from '../components/shared/UI.jsx';

const DEMO_LEARNER = 'learner-01';
const ITEMS_PER_SESSION = 4;

// Simple deterministic demo items per mechanic (the production engine pulls
// these from the items table; here we generate child-appropriate placeholders
// so the full telemetry loop — session → attempts → complete — is exercisable).
function buildDemoItems(activity) {
  const sets = {
    'Listen and Choose': [
      { prompt: 'Which one says "cat"?', options: ['cat', 'dog', 'sun', 'hat'], answer: 'cat' },
      { prompt: 'Tap the number five.', options: ['3', '5', '8', '2'], answer: '5' },
      { prompt: 'Which animal is big?', options: ['ant', 'mouse', 'elephant', 'bee'], answer: 'elephant' },
      { prompt: 'Which one is a circle?', options: ['▲', '■', '●', '★'], answer: '●' },
    ],
    'Tap the Sound': [
      { prompt: 'Tap the first sound in "sun".', options: ['s', 'u', 'n', 'm'], answer: 's' },
      { prompt: 'Tap the first sound in "map".', options: ['p', 'm', 'a', 't'], answer: 'm' },
      { prompt: 'Tap the last sound in "dog".', options: ['d', 'o', 'g', 'b'], answer: 'g' },
      { prompt: 'Tap the first sound in "fish".', options: ['f', 'i', 's', 'h'], answer: 'f' },
    ],
  };
  const fallback = [
    { prompt: 'Choose the matching picture.', options: ['A', 'B', 'C', 'D'], answer: 'A' },
    { prompt: 'Which one is correct?', options: ['One', 'Two', 'Three', 'Four'], answer: 'Two' },
    { prompt: 'Find the right answer.', options: ['Red', 'Blue', 'Green', 'Yellow'], answer: 'Green' },
    { prompt: 'Pick the best choice.', options: ['Up', 'Down', 'Left', 'Right'], answer: 'Right' },
  ];
  return sets[activity.mechanic] || fallback;
}

export function GamePlayer() {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState(null);
  const [session, setSession] = useState(null);
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const itemStart = useRef(Date.now());

  // Load activity + start session
  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        const act = await api.get(`/ey/activities/${activityId}`);
        if (cancelled) return;
        setActivity(act);
        setItems(buildDemoItems(act));

        const ses = await api.post(`/ey/learners/${DEMO_LEARNER}/sessions`, {
          activity_id: activityId,
          activity_version: '1.2.0',
          device: 'web',
          locale: 'en-GB',
        });
        if (cancelled) return;
        setSession(ses);
        itemStart.current = Date.now();
      } catch (e) {
        if (!cancelled) setError(e.message);
      }
    }
    init();
    return () => { cancelled = true; };
  }, [activityId]);

  async function choose(option) {
    if (feedback) return;
    const item = items[index];
    const correct = option === item.answer;
    const responseTime = (Date.now() - itemStart.current) / 1000;
    setSelected(option);
    setFeedback(correct ? 'correct' : 'wrong');

    const accuracy = correct ? 1 : 0;
    const result = { correct, responseTime };

    try {
      await api.post(`/ey/learners/${DEMO_LEARNER}/sessions/${session.session_id}/attempts`, {
        activity_id: activityId,
        activity_version: '1.2.0',
        item_id: `${activityId}-item-${index + 1}`,
        accuracy,
        prompt_level: 0,
        response_time_seconds: Number(responseTime.toFixed(2)),
        baseline_average_response_time_seconds: 6,
        attempt_count: 1,
        consecutive_same_error_count: correct ? 0 : 1,
        hint_count: 0,
        audio_replay_count: 0,
        error_type: correct ? null : 'listening_comprehension',
      });
    } catch (e) {
      setError(e.message);
    }

    const newResults = [...results, result];
    setResults(newResults);

    setTimeout(() => advance(newResults), 1100);
  }

  async function advance(currentResults) {
    setFeedback(null);
    setSelected(null);
    if (index + 1 < items.length) {
      setIndex(index + 1);
      itemStart.current = Date.now();
    } else {
      // Complete the session
      const correctCount = currentResults.filter(r => r.correct).length;
      const sessionAccuracy = correctCount / currentResults.length;
      try {
        const completion = await api.post(
          `/ey/learners/${DEMO_LEARNER}/sessions/${session.session_id}/complete`, {
            activity_id: activityId,
            accuracy: Number(sessionAccuracy.toFixed(3)),
            prompt_level: 0,
            session_spacing_days: 1,
            consecutive_same_error_count: 0,
            learner_exit_count: 0,
          });
        setDone({ accuracy: sessionAccuracy, ...completion });
      } catch (e) {
        setError(e.message);
      }
    }
  }

  if (error) return <div className="learner-shell"><div className="main"><ErrorBanner message={error} /><button className="btn-primary mt-2" onClick={() => navigate('/learner')}>Back</button></div></div>;
  if (!activity || !session) return <div className="learner-shell"><Spinner /></div>;

  if (done) {
    const pct = Math.round(done.accuracy * 100);
    return (
      <div className="learner-shell">
        <div className="game-stage">
          <div style={{ fontSize: '4rem' }}>{pct >= 85 ? '🌟' : pct >= 70 ? '👍' : '💪'}</div>
          <h2>{pct >= 85 ? 'Brilliant!' : pct >= 70 ? 'Well done!' : 'Good try!'}</h2>
          <p className="game-prompt">You scored {pct}%</p>
          <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
            <span className="star-badge">⭐ +{done.reward?.points || 0} stars</span>
            <span className={`pill pill-${done.mastery_status}`}>{(done.mastery_status || '').replace(/_/g, ' ')}</span>
          </div>
          <div className="mt-3">
            <button className="btn-accent" onClick={() => navigate('/learner')}>Back to games</button>
          </div>
        </div>
      </div>
    );
  }

  const item = items[index];
  return (
    <div className="learner-shell">
      <div className="game-stage">
        <div className="mechanic-badge" style={{ color: 'var(--accent)', fontWeight: 800 }}>{activity.mechanic}</div>
        <div className="progress-dots">
          {items.map((_, i) => (
            <span key={i} className={`dot ${i < index ? 'done' : i === index ? 'current' : ''}`} />
          ))}
        </div>
        <div className="game-prompt">{item.prompt}</div>
        <div className="game-options">
          {item.options.map(opt => (
            <button key={opt}
              className={`game-option ${selected === opt ? feedback : ''} ${feedback && opt === item.answer ? 'correct' : ''}`}
              onClick={() => choose(opt)}
              disabled={!!feedback}>
              {opt}
            </button>
          ))}
        </div>
        {feedback === 'correct' && <p style={{ color: 'var(--leaf)', fontWeight: 700 }}>Great work! You found it. 🎉</p>}
        {feedback === 'wrong' && <p style={{ color: 'var(--berry)', fontWeight: 700 }}>Good try! The answer is highlighted.</p>}
      </div>
    </div>
  );
}
