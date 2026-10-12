import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);

    try {
      const response = await api.post('/auth/register', form);
      setMessage(response.data);
      window.setTimeout(() => navigate('/login'), 700);
    } catch (requestError) {
      setError(
        typeof requestError.response?.data === 'string'
          ? requestError.response.data
          : 'Registration failed. Check your details and try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <form className="form-card" onSubmit={submit}>
        <span className="eyebrow">START EXPLORING</span>
        <h2>Create your account</h2>
        {error && <div className="error" role="alert">{error}</div>}
        {message && <div className="success" role="status">{message}</div>}
        <label>
          Full name
          <input
            autoComplete="name"
            maxLength="100"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
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
          Password (12–72 characters)
          <input
            type="password"
            autoComplete="new-password"
            minLength="12"
            maxLength="72"
            required
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
          />
        </label>
        <button className="btn full" disabled={busy}>
          {busy ? 'Creating account…' : 'Register'}
        </button>
        <p>Already registered? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
}
