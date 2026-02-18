import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Briefcase, User, MessageSquare, LogOut, Plus } from 'lucide-react';
import ClientJobs from './ClientJobs';
import ClientProfile from './ClientProfile';

type View = 'jobs' | 'profile' | 'messages';

export default function ClientDashboard() {
  const { signOut, profile } = useAuth();
  const [activeView, setActiveView] = useState<View>('jobs');
  const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, completedJobs: 0 });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    const { data: allJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', profile.id);

    const activeJobs = allJobs?.filter(job => job.status === 'in_progress').length || 0;
    const completedJobs = allJobs?.filter(job => job.status === 'completed').length || 0;

    setStats({
      totalJobs: allJobs?.length || 0,
      activeJobs,
      completedJobs,
    });
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="logo" style={{ marginBottom: '32px' }}>Worklane</div>
        <a
          href="#"
          className={`sidebar-link ${activeView === 'jobs' ? 'active' : ''}`}
          onClick={() => setActiveView('jobs')}
        >
          <Briefcase size={20} />
          My Jobs
        </a>
        <a
          href="#"
          className={`sidebar-link ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <User size={20} />
          Profile
        </a>
        <a
          href="#"
          className={`sidebar-link ${activeView === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveView('messages')}
        >
          <MessageSquare size={20} />
          Messages
        </a>
        <a href="#" className="sidebar-link" onClick={handleSignOut}>
          <LogOut size={20} />
          Sign Out
        </a>
      </div>
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div>
            <h1>Welcome back, {profile?.full_name}</h1>
            <p style={{ color: 'var(--text-light)' }}>Manage your projects and find great talent</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalJobs}</div>
            <div className="stat-label">Total Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeJobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.completedJobs}</div>
            <div className="stat-label">Completed Jobs</div>
          </div>
        </div>

        {activeView === 'jobs' && <ClientJobs onStatsUpdate={fetchStats} />}
        {activeView === 'profile' && <ClientProfile />}
        {activeView === 'messages' && (
          <div className="card">
            <h2>Messages</h2>
            <p style={{ color: 'var(--text-light)' }}>Messaging feature coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
