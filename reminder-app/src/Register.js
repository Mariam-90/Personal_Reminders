import React, { useState } from 'react';
import axios from 'axios';
import './FormStyles.css'; // ייבוא ה-CSS המשותף

const Register = ({ setUser, toggleView }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/api/users/register', { username, password });
      setUser(response.data);
    } catch (err) {
      setError('Registration failed. Please check your credentials.');
    }
  };

  return (
    <div className="form-container">
      <h2>Register</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleRegister}>
        <label>
          Username: 
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          Password: 
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button type="submit">Register</button>
      </form>
      <p>Already have an account? <button onClick={toggleView}>Login</button></p>
    </div>
  );
};

export default Register;
