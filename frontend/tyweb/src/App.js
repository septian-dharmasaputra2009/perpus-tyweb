import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'; // Import global CSS kita
import { useNavigate } from 'react-router-dom';
// Import ThemeProvider dari context kita
import { ThemeProvider, useTheme } from './context/ThemeContext'; // <-- Perhatikan useTheme juga
// Import AuthProvider dari context kita
import { AuthProvider } from './contexts/AuthContext'; // <--- PASTIKAN INI DIIMPORT
import PrivateRoute from './modules/auth/PrivateRoute';
// Import komponen layout umum
import Header from './modules/layout/Header';
import Footer from './modules/layout/Footer';
import Sidebar from './modules/layout/Sidebar';
// Import komponen dari modul homepage
import SearchBar from './modules/homepage/SearchBar';
// Import komponen dari modul books
import BookList from './modules/books/BookList';
import BookDetailPage from './modules/books/BookDetailPage';
import AddBookPage from './modules/books/AddBookPage';
import EditBookPage from './modules/books/EditBookPage';
import BookReadPage from './modules/books/BookReadPage';
// Import komponen dari modul auth
import LoginModal from './modules/auth/LoginModal'; // Pastikan ini diimport dari modules/auth
// --- Komponen internal untuk mengelola tata letak dan routing ---
// Ini adalah komponen yang membungkus semua elemen UI inti dan <Routes>
const AppContent = () => {
  const navigate = useNavigate();
  const closeLoginModalFromRoute = () => { // <--- FUNGSI BARU INI
    closeLoginModal(); // Tutup modal seperti biasa
    navigate('/'); // Alihkan pengguna ke homepage
  };
  // Menggunakan useTheme dari contexts/ThemeContext
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  // useEffect untuk menerapkan tema ke body (penting untuk tema global)
  useEffect(() => {
    document.body.className = theme; 
  }, [theme]);

  // State untuk mengontrol sidebar dan modal login
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Fungsi-fungsi handler untuk membuka/menutup sidebar dan modal
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsSidebarOpen(false); // Tutup sidebar saat modal login dibuka
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleSearchSubmit = (query) => {
    setSearchQuery(query); // Set state searchQuery
    navigate('/books'); // Arahkan ke halaman /books untuk menampilkan hasil lengkap
  };

  return (
    <div className="app-container"> {/* Pastikan ini class "app-container" */}
      {/* Overlay untuk sidebar saat terbuka */}
      {isSidebarOpen && <div className="overlay open" onClick={toggleSidebar}></div>}

      {/* Modal Login */}
      {isLoginModalOpen && (
        <LoginModal onClose={closeLoginModal} />
      )}

      {/* Header akan selalu tampil */}
      <Header onMenuClick={toggleSidebar} /> {/* Pastikan prop onMenuClick diteruskan */}

      {/* Konten utama di mana rute akan dirender */}
      <div className="main-content"> {/* Opsional, bisa juga langsung <Routes> */}
        <Routes> {/* <--- DI SINI LAH SEMUA ROUTE DIDEFINISIKAN */}
          {/* Rute Homepage */}
          <Route path="/" element={
            <>
              <SearchBar onSearchSubmit={handleSearchSubmit} /> 
              <BookList isHomePagePreview={true} searchQuery={searchQuery} /> 
            </>
          } />

          {/* Rute Halaman Daftar Buku Lengkap */}
          <Route path="/books" element={
          <>
            <SearchBar onSearchSubmit={handleSearchSubmit} /> 
            <BookList isHomePagePreview={false} searchQuery={searchQuery} />
          </>
          } />

          {/* Rute Halaman Detail Buku */}
          <Route path="/book/:id" element={<BookDetailPage />} />

          {/* Rute Halaman Tambah Buku */}
          <Route path="/add-book" element={<PrivateRoute><AddBookPage /></PrivateRoute>} />

          {/* Rute Halaman Edit Buku */}
          <Route path="/edit-book/:id" element={<PrivateRoute><EditBookPage /></PrivateRoute>} />

          {/* Rute Halaman Baca Buku */}
          <Route path="/read/:bookId/:pageNumStart" element={<BookReadPage />} />

          {/* Rute Halaman Login (Modal) - rute fallback jika diakses langsung, tidak perlu isOpen */}
          <Route path="/login" element={<LoginModal isOpen={true} onClose={closeLoginModalFromRoute} />} />

          {/* Rute Halaman Tentang Kami (placeholder) */}
          <Route path="/about" element={<div>Halaman Tentang Kami</div>} />
        </Routes>
      </div>

      {/* Footer akan selalu tampil */}
      <Footer />
      {/* Sidebar dan props-nya */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} openLoginModal={openLoginModal} />
    </div>
  );
};

// --- Komponen App utama yang membungkus dengan ThemeProvider dan AuthProvider ---
// Ini adalah komponen paling atas yang dirender oleh index.js
function App() {
  return (
    <Router> {/* BrowserRouter harus membungkus semua yang menggunakan rute */}
      <ThemeProvider> {/* ThemeProvider harus membungkus semua yang menggunakan tema */}
        <AuthProvider> {/* <--- AUTHPROVIDER ADA DI SINI, MEMBUNGKUS APPCONTENT */}
          <AppContent /> 
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
