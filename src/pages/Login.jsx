import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);

    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      navigate(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (requestError) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="form-card" onSubmit={submit}>
        <span className="eyebrow">WELCOME BACK</span>
        <h2>Login to Travel Planner</h2>
        {error && <div className="error" role="alert">{error}</div>}
        <label>
          Email
          <input
            type="email"
            autoComplete="email"
            maxLength="254"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="btn full" disabled={busy}>
          {busy ? 'Signing in…' : 'Login'}
        </button>
        <p>New traveler? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
