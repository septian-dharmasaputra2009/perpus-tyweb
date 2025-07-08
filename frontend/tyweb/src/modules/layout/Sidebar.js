import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';
import ToggleSwitch from './ToggleSwitch'; // Import ToggleSwitch

function Sidebar({ isOpen, toggleSidebar, openLoginModal }) {
  const navigate = useNavigate();
  const { isAuthenticated, logout} = useAuth();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout(); // Jika sudah login, lakukan logout
    } else {
      openLoginModal(); // Jika belum login, buka modal login
    }
    toggleSidebar(); // Tutup sidebar setelah aksi
  };

  // Fungsi navigasi yang akan dipanggil dari onClick
  const navigateTo = (path) => {
    navigate(path); // Arahkan ke jalur yang diberikan
    toggleSidebar();      // Tutup sidebar setelah navigasi
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <button className="close-sidebar-button" onClick={toggleSidebar}>
        &times; {/* Ikon 'X' untuk menutup sidebar */}
      </button>
      <nav className="sidebar-nav">
        <ul>
          <li className="toggle-container">
            <span>Mode Terang/Gelap</span>
            <ToggleSwitch />
          </li>
          {/* Item navigasi ke Homepage */}
          <li>
            <button className="sidebar-link-button" onClick={() => navigateTo('/')}>
              Homepage
            </button>
          </li>
          {/* Item navigasi ke Halaman Daftar Buku Lengkap */}
          <li>
            <button className="sidebar-link-button" onClick={() => navigateTo('/books')}>
              Semua Buku
            </button>
          </li>
          {isAuthenticated && (
            <li><button className="sidebar-link-button" onClick={() => navigateTo('/add-book')}>Tambah Buku</button></li>
          )}
          
          {/* Link untuk login/logout */}
          <li>
            <button onClick={handleAuthClick} className="sidebar-link-button">
              {isAuthenticated ? `Logout` : 'Login'} {/* Teks dinamis */}
            </button>
          </li>
          {/* Item navigasi ke Halaman Tentang Kami */}
          <li>
            <button className="sidebar-link-button" onClick={() => navigateTo('/about')}>
              Tentang Kami
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;