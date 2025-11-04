import React, { useState } from 'react';

const TempCreateShikshanMantri: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/temp-create-shikshan-mantri', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('Shikshan Mantri created successfully!');
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setMessage(data.message || 'Error creating Shikshan Mantri');
      }
    } catch (error) {
      setMessage('Error creating Shikshan Mantri');
    }
  };

  return (
    <div>
      <h2>Create Shikshan Mantri (Temporary)</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Create Shikshan Mantri</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default TempCreateShikshanMantri;
