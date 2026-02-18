import { useState, useEffect } from 'react';
import { supabase, Job, Profile } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, DollarSign } from 'lucide-react';

export default function FreelancerJobs() {
  const [jobs, setJobs] = useState<(Job & { client: Profile })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [proposal, setProposal] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { profile } = useAuth();

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('jobs')
      .select('*, client:profiles!jobs_client_id_fkey(*)')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setJobs(data as any);
    }
    setLoading(false);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !profile) return;

    setSubmitting(true);
    setError('');

    const { error: bidError } = await supabase
      .from('bids')
      .insert({
        job_id: selectedJob.id,
        freelancer_id: profile.id,
        amount: parseFloat(bidAmount),
        proposal,
        delivery_time: parseInt(deliveryTime),
      });

    if (bidError) {
      setError(bidError.message);
    } else {
      setSelectedJob(null);
      setBidAmount('');
      setProposal('');
      setDeliveryTime('');
      alert('Bid submitted successfully!');
    }

    setSubmitting(false);
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
        <h2 className="card-title">Available Jobs</h2>
        <button className="btn btn-primary" onClick={fetchJobs}>Refresh</button>
      </div>

      <div className="grid">
        {jobs.map((job) => (
          <div key={job.id} className="card">
            <div className="card-header">
              <h3 className="card-title">{job.title}</h3>
              <span className="badge badge-open">{job.status}</span>
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
            <div style={{ marginTop: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
                Posted by: {job.client.full_name}
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '16px' }}
              onClick={() => setSelectedJob(job)}
            >
              Submit Bid
            </button>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Submit Bid</h2>
              <button className="close-btn" onClick={() => setSelectedJob(null)}>&times;</button>
            </div>
            <h3>{selectedJob.title}</h3>
            <p style={{ color: 'var(--text-light)', marginBottom: '24px' }}>Budget: ₹{selectedJob.budget.toLocaleString()}</p>
            <form onSubmit={handleSubmitBid}>
              <div className="form-group">
                <label htmlFor="bidAmount">Your Bid Amount (₹)</label>
                <input
                  type="number"
                  id="bidAmount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  required
                  min="0"
                />
              </div>
              <div className="form-group">
                <label htmlFor="deliveryTime">Delivery Time (days)</label>
                <input
                  type="number"
                  id="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  required
                  min="1"
                />
              </div>
              <div className="form-group">
                <label htmlFor="proposal">Proposal</label>
                <textarea
                  id="proposal"
                  value={proposal}
                  onChange={(e) => setProposal(e.target.value)}
                  required
                  placeholder="Explain why you're the best fit for this job..."
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Bid'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
