import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, Job, Bid } from '../../lib/supabase';
import { Briefcase, User, MessageSquare, LogOut, Star } from 'lucide-react';
import FreelancerJobs from './FreelancerJobs';
import FreelancerProfile from './FreelancerProfile';
import FreelancerBids from './FreelancerBids';

type View = 'jobs' | 'bids' | 'profile' | 'messages';

export default function FreelancerDashboard() {
  const { signOut, profile } = useAuth();
  const [activeView, setActiveView] = useState<View>('jobs');
  const [stats, setStats] = useState({ totalBids: 0, activeJobs: 0, earnings: 0 });

  useEffect(() => {
    fetchStats();
  }, [profile]);

  const fetchStats = async () => {
    if (!profile) return;

    const { data: bidsData } = await supabase
      .from('bids')
      .select('*')
      .eq('freelancer_id', profile.id);

    const { data: jobsData } = await supabase
      .from('jobs')
      .select('*')
      .eq('hired_freelancer_id', profile.id)
      .eq('status', 'in_progress');

    const { data: completedJobs } = await supabase
      .from('jobs')
      .select('budget')
      .eq('hired_freelancer_id', profile.id)
      .eq('status', 'completed');

    const earnings = completedJobs?.reduce((sum, job) => sum + Number(job.budget), 0) || 0;

    setStats({
      totalBids: bidsData?.length || 0,
      activeJobs: jobsData?.length || 0,
      earnings: earnings * 0.9,
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
          Browse Jobs
        </a>
        <a
          href="#"
          className={`sidebar-link ${activeView === 'bids' ? 'active' : ''}`}
          onClick={() => setActiveView('bids')}
        >
          <Star size={20} />
          My Bids
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
            <p style={{ color: 'var(--text-light)' }}>Ready to take on new challenges?</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.totalBids}</div>
            <div className="stat-label">Total Bids</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.activeJobs}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₹{stats.earnings.toLocaleString()}</div>
            <div className="stat-label">Total Earnings</div>
          </div>
        </div>

        {activeView === 'jobs' && <FreelancerJobs />}
        {activeView === 'bids' && <FreelancerBids />}
        {activeView === 'profile' && <FreelancerProfile />}
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
