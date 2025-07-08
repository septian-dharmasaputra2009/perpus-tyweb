import React, { useContext } from 'react';
import { ThemeContext } from '../../context/ThemeContext'; // Import ThemeContext
import './ToggleSwitch.css'; // Untuk styling toggle

function ToggleSwitch() {
  const { theme, toggleTheme } = useContext(ThemeContext); // Ambil theme dan toggleTheme dari context

  return (
    <label className="toggle-switch">
      <input
        type="checkbox"
        checked={theme === 'dark'} // Centang jika tema gelap aktif
        onChange={toggleTheme} // Panggil toggleTheme saat switch diubah
      />
      <span className="slider round"></span>
      <span className="icon-light">&#9728;</span> {/* Ikon matahari (light mode) */}
      <span className="icon-dark">&#127769;</span> {/* Ikon bulan (dark mode) */}
    </label>
  );
}

export default ToggleSwitch;