import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Sesuaikan path jika AuthContext.js pindah

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth(); // Ambil status otentikasi

  if (loading) {
    return <div>Memuat...</div>; // Atau spinner loading yang lebih baik
  }

  // Jika tidak terotentikasi, alihkan ke halaman login
  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Arahkan ke rute /login
  }

  // Jika terotentikasi, tampilkan komponen anak (halaman yang dilindungi)
  return children;
};

export default PrivateRoute;