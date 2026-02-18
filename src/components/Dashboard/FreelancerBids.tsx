import { useState, useEffect } from 'react';
import { supabase, Bid, Job } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function FreelancerBids() {
  const [bids, setBids] = useState<(Bid & { job: Job })[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchBids();
  }, [profile]);

  const fetchBids = async () => {
    if (!profile) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('bids')
      .select('*, job:jobs(*)')
      .eq('freelancer_id', profile.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setBids(data as any);
    }
    setLoading(false);
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
        <h2 className="card-title">My Bids</h2>
      </div>

      <div className="grid">
        {bids.length === 0 ? (
          <div className="card">
            <p style={{ color: 'var(--text-light)' }}>You haven't submitted any bids yet.</p>
          </div>
        ) : (
          bids.map((bid) => (
            <div key={bid.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{bid.job.title}</h3>
                <span className={`badge badge-${bid.status}`}>{bid.status}</span>
              </div>
              <p style={{ color: 'var(--text-light)', marginBottom: '12px' }}>{bid.proposal}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '14px' }}>
                <span>Bid Amount: <strong>₹{bid.amount.toLocaleString()}</strong></span>
                <span>Delivery: <strong>{bid.delivery_time} days</strong></span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '12px' }}>
                Submitted on {new Date(bid.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
