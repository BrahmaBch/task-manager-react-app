import React, { useState } from 'react';
import Modal from 'react-modal';
import '../customecss/HomePage.css'; // Import the CSS file for styling
import UserTasksDashboard from './UserTasksDashboard';

Modal.setAppElement('#root');

const HomePage = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [signupDetails, setSignupDetails] = useState({
    username: '',
    email: '',
    roles: [],
    password: ''
  });

  const roleOptions = ['admin', 'mod'];

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openSignUpModal = () => setIsSignUpModalOpen(true);
  const closeSignUpModal = () => setIsSignUpModalOpen(false);

  // Function to handle login
  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:8011/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.accessToken && data.username) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('username', data.username);
          setIsLoggedIn(true);
          closeLoginModal();
        } else {
          setError('Invalid email or password.');
        }
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  // Function to handle sign up
  const handleSignUp = async () => {
    try {
      const response = await fetch('http://localhost:8011/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupDetails),
      });

      if (response.ok) {
        setError('Sign up successful. You can now log in.');
        closeSignUpModal();
      } else {
        setError('Sign up failed. Please try again.');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  // Handle multi-select changes
  const handleRoleChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSignupDetails({ ...signupDetails, roles: selectedOptions });
  };

  if (isLoggedIn) {
    return <UserTasksDashboard />;
  }

  return (
    <div className="home-page">
      <h1>TASK MANAGER</h1>
      <button onClick={openLoginModal}>Login</button>
      <button onClick={openSignUpModal}>Sign Up</button>

      {/* Login Modal */}
      <Modal 
        isOpen={isLoginModalOpen} 
        onRequestClose={closeLoginModal} 
        style={{ 
          content: { 
            top: '50%', left: '50%', right: 'auto', bottom: 'auto', 
            transform: 'translate(-50%, -50%)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          } 
        }}
      >
        <h2>Login</h2>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /><br />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        /><br />
        {error && <p className="error">{error}</p>}
        <button onClick={handleLogin} style={{ marginTop: '10px' }}>Login</button>
        <button onClick={closeLoginModal} style={{ marginTop: '10px' }}>Close</button>
      </Modal>

      {/* Sign Up Modal */}
      <Modal 
        isOpen={isSignUpModalOpen} 
        onRequestClose={closeSignUpModal} 
        style={{ 
          content: { 
            top: '50%', left: '50%', right: 'auto', bottom: 'auto', 
            transform: 'translate(-50%, -50%)', 
            padding: '20px', 
            borderRadius: '8px', 
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
          } 
        }}
      >
        <h2>Sign Up</h2>
        <input 
          type="text" 
          placeholder="Username" 
          value={signupDetails.username}
          onChange={(e) => setSignupDetails({ ...signupDetails, username: e.target.value })}
        /><br />
        <input 
          type="email" 
          placeholder="Email" 
          value={signupDetails.email}
          onChange={(e) => setSignupDetails({ ...signupDetails, email: e.target.value })}
        /><br />
        <input 
          type="password" 
          placeholder="Password" 
          value={signupDetails.password}
          onChange={(e) => setSignupDetails({ ...signupDetails, password: e.target.value })}
        /><br />
        <select
          multiple
          value={signupDetails.roles}
          onChange={handleRoleChange}
          size={3} // Adjust size based on the number of options
        >
          {roleOptions.map(role => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select><br />
        {error && <p className="error">{error}</p>}
        <button onClick={handleSignUp} style={{ marginTop: '10px' }}>Sign Up</button>
        <button onClick={closeSignUpModal} style={{ marginTop: '10px' }}>Close</button>
      </Modal>
    </div>
  );
}

export default HomePage;
