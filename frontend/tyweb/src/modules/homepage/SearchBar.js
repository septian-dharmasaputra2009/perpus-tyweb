import React, { useState } from 'react';
import './SearchBar.css';

// SearchBar sekarang akan menerima prop onSearchSubmit
function SearchBar({ onSearchSubmit }) { 
  const [searchTerm, setSearchTerm] = useState(''); // State untuk menyimpan nilai input

  // Handler saat input berubah
  const handleChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handler saat form pencarian disubmit
  const handleSubmit = (e) => {
    e.preventDefault(); // Mencegah refresh halaman
    if (onSearchSubmit) {
      onSearchSubmit(searchTerm.trim()); // Kirim query pencarian ke parent
    }
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form"> {/* Bungkus dengan form */}
        <button type="submit" className="search-button">
          &#128269; {/* Ikon kaca pembesar unicode */}
        </button>
        <input
          type="text"
          placeholder="Cari Judul Buku atau Penulis" // Placeholder yang lebih informatif
          className="search-input"
          value={searchTerm} // Ikat nilai input ke state
          onChange={handleChange} // Handler saat input berubah
        />
      </form>
    </div>
  );
}

export default SearchBar;