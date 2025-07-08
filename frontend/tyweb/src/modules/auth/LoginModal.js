import React, { useState } from 'react';
import './LoginModal.css';
import { useAuth } from '../../contexts/AuthContext';

const LoginModal = ({ onClose }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password); // Panggil fungsi login dari AuthContext
      onClose(); // Tutup modal setelah login berhasil
      setUsername(''); // Bersihkan input
      setPassword('');
    } catch (err) {
      // Tangani error dari fungsi login
      setError('HAHAHAHA!!! Login gagal.');
      console.error("Error saat submit login:", err);
    }
  };

  // Mencegah klik di dalam form modal dari menutup modal
  const handleModalContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop overlay, klik di sini akan menutup modal
    <div className="modal-backdrop" onClick={onClose}>
      {/* Kontainer modal itu sendiri */}
      <div className="login-modal-content" onClick={handleModalContentClick}>
        <button className="close-modal-button" onClick={onClose}>
          &times; {/* Tombol 'X' untuk menutup modal */}
        </button>
        <h2 className="login-modal-title">Login ke Tywebs</h2>
        <form className="login-form" onSubmit={handleSubmit}>
          {error && <p className="login-error">{error}</p>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="btn btn-primary">Login</button>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;