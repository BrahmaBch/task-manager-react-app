import React, { useState } from 'react';
import '../customecss/HomePage.css';

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track login state

  const handleLogin = () => {
    // Implement your login logic here
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Implement your logout logic here
    setIsLoggedIn(false);
  };

  return (
    <div className="homepage-container">
      <header className="header">
        <div className="menu-bar">
          <div className="menu-item">Home</div>
          <div className="menu-item">Task Manager</div>
          <div className="auth-buttons">
            {isLoggedIn ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <button onClick={handleLogin}>Login</button>
            )}
          </div>
        </div>
      </header>
      {/* Rest of your homepage content */}
    </div>
  );
}

export default HomePage;
