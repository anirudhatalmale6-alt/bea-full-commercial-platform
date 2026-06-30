import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { ErrorBanner } from '../components/shared/UI.jsx';

const ROLE_HOME = {
  learner: '/learner',
  teacher: '/teacher',
  parent: '/parent',
  admin: '/admin',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || '/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>London English Academy</h1>
        <p className="sub">Adaptive learning — Early Years &amp; CEFR A1–C2</p>
        <ErrorBanner message={error} />
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email}
            onChange={e => setEmail(e.target.value)} required autoComplete="username" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <button className="btn-primary" type="submit" disabled={busy}>
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <div className="login-demo">
          <strong>Demo accounts</strong> (password <code>Demo1234!</code>):<br />
          <code>teacher@lea.example</code> · <code>parent@lea.example</code><br />
          <code>sam@lea.example</code> · <code>admin@lea.example</code>
        </div>
      </form>
    </div>
  );
}
