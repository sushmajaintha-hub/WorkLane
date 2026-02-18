import { Briefcase, Users, MessageSquare, Shield, TrendingUp, Award } from 'lucide-react';

export default function LandingPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  return (
    <div>
      <nav className="navbar">
        <div className="navbar-content">
          <a href="#" className="logo">Worklane</a>
          <div className="nav-links">
            <a href="#how-it-works">How it Works</a>
            <a href="#features">Features</a>
            <button className="btn btn-outline" onClick={() => onNavigate('login')}>Login</button>
            <button className="btn btn-primary" onClick={() => onNavigate('register')}>Get Started</button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <h1>Your Lane to Limitless Work</h1>
          <p>Connect with top tech talent and AI experts across India. Find projects, grow your skills, and build your career on Worklane.</p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={() => onNavigate('register')}>Start as Freelancer</button>
            <button className="btn btn-secondary" onClick={() => onNavigate('register')}>Hire Talent</button>
          </div>
        </div>
      </section>

      <section id="features" className="section" style={{ background: 'var(--bg-gray)' }}>
        <div className="container">
          <h2 className="section-title">Why Choose Worklane?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <Briefcase />
              </div>
              <h3>Quality Projects</h3>
              <p>Access a curated selection of tech and AI projects from verified clients across India.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Users />
              </div>
              <h3>Verified Talent</h3>
              <p>Work with pre-screened freelancers who are students and professionals in tech and AI.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield />
              </div>
              <h3>Secure Payments</h3>
              <p>Protected transactions through Razorpay with transparent fee structure.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MessageSquare />
              </div>
              <h3>Real-time Chat</h3>
              <p>Communicate directly with clients or freelancers through our built-in messaging system.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp />
              </div>
              <h3>Grow Your Career</h3>
              <p>Build your portfolio, gain experience, and establish your reputation in the industry.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Award />
              </div>
              <h3>Rating System</h3>
              <p>Build trust through our transparent review and rating system.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>1</div>
              <h3>Create Your Profile</h3>
              <p>Sign up as a client or freelancer and set up your professional profile.</p>
            </div>
            <div className="feature-card">
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>2</div>
              <h3>Post or Browse Jobs</h3>
              <p>Clients post projects, freelancers browse and submit proposals.</p>
            </div>
            <div className="feature-card">
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '16px' }}>3</div>
              <h3>Collaborate & Deliver</h3>
              <p>Work together using our platform tools and deliver quality results.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="logo" style={{ marginBottom: '16px' }}>Worklane</div>
          <p>Connecting tech talent with opportunities across India</p>
          <p>&copy; 2024 Worklane. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
