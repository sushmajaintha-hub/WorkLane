import { useState, useEffect } from 'react';
import { supabase, Job, Bid, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Calendar, DollarSign } from 'lucide-react';

export default function ClientJobs({ onStatsUpdate }: { onStatsUpdate: () => void }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPostJob, setShowPostJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bids, setBids] = useState<(Bid & { freelancer: Profile })[]>([]);
  const { profile } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [skills, setSkills] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [profile]);

  const fetchJobs = async () => {
    if (!profile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('client_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data);
    }
    setLoading(false);
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSubmitting(true);
    setError('');

    const { error: jobError } = await supabase
      .from('jobs')
      .insert({
        client_id: profile.id,
        title,
        description,
        budget: parseFloat(budget),
        deadline,
        required_skills: skills.split(',').map(s => s.trim()).filter(Boolean),
      });

    if (jobError) {
      setError(jobError.message);
    } else {
      setShowPostJob(false);
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      setSkills('');
      fetchJobs();
      onStatsUpdate();
    }

    setSubmitting(false);
  };

  const handleViewBids = async (job: Job) => {
    setSelectedJob(job);
    const { data, error } = await supabase
      .from('bids')
      .select('*, freelancer:profiles!bids_freelancer_id_fkey(*)')
      .eq('job_id', job.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBids(data as any);
    }
  };

  const handleHireFreelancer = async (bidId: string, freelancerId: string, jobId: string) => {
    const { error: updateError } = await supabase
      .from('jobs')
      .update({
        status: 'in_progress',
        hired_freelancer_id: freelancerId,
      })
      .eq('id', jobId);

    if (!updateError) {
      await supabase
        .from('bids')
        .update({ status: 'accepted' })
        .eq('id', bidId);

      await supabase
        .from('bids')
        .update({ status: 'rejected' })
        .eq('job_id', jobId)
        .neq('id', bidId);

      setSelectedJob(null);
      fetchJobs();
      onStatsUpdate();
      alert('Freelancer hired successfully!');
    }
  };

  const handleCompleteJob = async (jobId: string) => {
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId);

    if (!updateError) {
      fetchJobs();
      onStatsUpdate();
      alert('Job marked as completed!');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: '24px' }}>
        <h2 className="card-title">My Jobs</h2>
        <button className="btn btn-primary" onClick={() => setShowPostJob(true)}>
          <Plus size={16} style={{ marginRight: '8px' }} />
          Post New Job
        </button>
      </div>

      <div className="grid">
        {jobs.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-light)' }}>You haven't posted any jobs yet.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{job.title}</h3>
                <span className={`badge badge-${job.status}`}>{job.status}</span>
              </div>
              <p style={{ color: 'var(--text-light)', marginBottom: '16px' }}>{job.description}</p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px', color: 'var(--text-light)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={16} />
                  ₹{job.budget.toLocaleString()}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={16} />
                  {new Date(job.deadline).toLocaleDateString()}
                </span>
              </div>
              <div className="tags">
                {job.required_skills.map((skill, idx) => (
                  <span key={idx} className="tag">{skill}</span>
                ))}
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                {job.status === 'open' && (
                  <button className="btn btn-primary" onClick={() => handleViewBids(job)}>
                    View Bids
                  </button>
                )}
                {job.status === 'in_progress' && (
                  <button className="btn btn-primary" onClick={() => handleCompleteJob(job.id)}>
                    Mark as Completed
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showPostJob && (
        <div className="modal-overlay" onClick={() => setShowPostJob(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Post a New Job</h2>
              <button className="close-btn" onClick={() => setShowPostJob(false)}>&times;</button>
            </div>
            <form onSubmit={handlePostJob}>
              <div className="form-group">
                <label htmlFor="title">Job Title</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Describe the project in detail..."
                />
              </div>
              <div className="form-group">
                <label htmlFor="budget">Budget (₹)</label>
                <input
                  type="number"
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deadline">Deadline</label>
                <input
                  type="date"
                  id="deadline"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="skills">Required Skills (comma separated)</label>
                <input
                  type="text"
                  id="skills"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="React, Node.js, Python"
                  required
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Job'}
              </button>
            </form>
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Bids for {selectedJob.title}</h2>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>&times;</button>
            </div>
            {bids.length === 0 ? (
              <p style={{ color: 'var(--text-light)' }}>No bids yet.</p>
            ) : (
              <div className="grid">
                {bids.map((bid) => (
                  <div key={bid.id} className="card">
                    <div className="card-header">
                      <div>
                        <h3 className="card-title">{bid.freelancer.full_name}</h3>
                        <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                          {bid.freelancer.bio || 'No bio'}
                        </p>
                      </div>
                      <span className={`badge badge-${bid.status}`}>{bid.status}</span>
                    </div>
                    <div className="tags" style={{ marginBottom: '12px' }}>
                      {bid.freelancer.skills.map((skill, idx) => (
                        <span key={idx} className="tag">{skill}</span>
                      ))}
                    </div>
                    <p style={{ marginBottom: '12px' }}>{bid.proposal}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                      <span><strong>Bid:</strong> ₹{bid.amount.toLocaleString()}</span>
                      <span><strong>Delivery:</strong> {bid.delivery_time} days</span>
                    </div>
                    {bid.status === 'pending' && (
                      <button
                        className="btn btn-primary"
                        onClick={() => handleHireFreelancer(bid.id, bid.freelancer_id, selectedJob.id)}
                      >
                        Hire Freelancer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
