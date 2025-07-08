import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import { ReactComponent as ReactLogo } from '../../logo.svg'; // Pastikan logo.svg ada di src/

function Header({ onMenuClick }) {
  // useNavigate tidak digunakan langsung di sini, tapi ada di Sidebar
  // const navigate = useNavigate(); 

  return (
    <header className="app-header">
      <div className="header-left">
        {/* Link ke homepage saat klik logo/nama aplikasi */}
        <Link to="/" className="logo-container">
          <ReactLogo className="react-logo" /> {/* LOGO REACT */}
          <h1 className="logo-text">Tywebs</h1>
        </Link>
      </div>
      <button className="menu-button" onClick={onMenuClick}>
        ☰
      </button>
      {/* Bagian kanan header bisa ditambahkan di sini jika ada (misal: tombol profil) */}
    </header>
  );
}

export default Header;