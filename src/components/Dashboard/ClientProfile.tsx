import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function ClientProfile() {
  const { profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name);
      setBio(profile.bio);
      setLocation(profile.location);
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    setError('');
    setSuccess('');

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio,
        location,
      })
      .eq('id', profile.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Profile updated successfully!');
      await refreshProfile();
      setEditing(false);
    }

    setSaving(false);
  };

  if (!profile) return null;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">My Profile</h2>
        {!editing && (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <div>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell freelancers about your company or projects..."
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Mumbai, India"
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button className="btn btn-outline" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ marginBottom: '8px' }}>{profile.full_name}</h3>
            <p style={{ color: 'var(--text-light)' }}>{profile.bio || 'No bio yet'}</p>
          </div>
          {profile.location && (
            <div style={{ marginBottom: '16px' }}>
              <strong>Location:</strong> {profile.location}
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <strong>Account Type:</strong> Client
          </div>
        </div>
      )}
    </div>
  );
}
