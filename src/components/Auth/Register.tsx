import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Register({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'client' | 'freelancer'>('freelancer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, fullName, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <a href="#" className="logo" onClick={() => onNavigate('landing')}>Worklane</a>
        </div>
      </nav>
      <div className="form-container">
        <h2>Join Worklane</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="role">I want to</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'client' | 'freelancer')}
            >
              <option value="freelancer">Work as a Freelancer</option>
              <option value="client">Hire Freelancers</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-light)' }}>
          Already have an account?{' '}
          <a href="#" onClick={() => onNavigate('login')} style={{ color: 'var(--primary)', textDecoration: 'none' }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
