import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/ApiContext';
import { useEffect } from 'react';
import './ProfileSelect.css';

function ProfileSelect() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    // If already authenticated, could auto-redirect or just show success
    // For now, we'll just show the success message
  }, [isAuthenticated]);

  return (
    <div className="profile-select">
      <div className="connect-container">
        {!isAuthenticated ? (
          <div className="connect-box">
            <h1>Connect Your Trakt Account</h1>
            <p>Link your Trakt account to get started tracking your shows and movies.</p>
            <button onClick={login} className="connect-button">
              Connect Trakt Account
            </button>
          </div>
        ) : (
          <div className="success-box">
            <div className="success-icon">✓</div>
            <h1>Account Connected Successfully!</h1>
            <p>Your Trakt account has been linked.</p>
            <button onClick={() => navigate('/dashboard')} className="dashboard-button">
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileSelect;
