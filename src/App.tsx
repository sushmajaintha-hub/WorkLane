import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './components/LandingPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import FreelancerDashboard from './components/Dashboard/FreelancerDashboard';
import ClientDashboard from './components/Dashboard/ClientDashboard';

type Page = 'landing' | 'login' | 'register';

function App() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (user && profile) {
    if (profile.role === 'freelancer') {
      return <FreelancerDashboard />;
    } else {
      return <ClientDashboard />;
    }
  }

  if (currentPage === 'login') {
    return <Login onNavigate={setCurrentPage} />;
  }

  if (currentPage === 'register') {
    return <Register onNavigate={setCurrentPage} />;
  }

  return <LandingPage onNavigate={setCurrentPage} />;
}

export default App;
