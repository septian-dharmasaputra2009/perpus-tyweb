import React, { createContext, useState, useEffect, useContext } from 'react';

import axios from 'axios';
import { API_BASE_URL } from '../../config'

// Buat Context
export const AuthContext = createContext();


// Base URL API Django Anda

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null); // Menyimpan token akses dan refresh
  const [user, setUser] = useState(null); // Menyimpan informasi pengguna (misal username)
  const [loading, setLoading] = useState(true); // Untuk menandakan sedang memuat status otentikasi

  // Fungsi untuk melakukan login
  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, {
        username,
        password,
      });
      const { access, refresh } = response.data;
      
      // Simpan token di localStorage
      localStorage.setItem('authToken', JSON.stringify({ access, refresh }));
      setAuthToken({ access, refresh });
      
      // Decode token untuk mendapatkan info user (opsional, bisa juga dari endpoint user profile)
      const decodedUser = JSON.parse(atob(access.split('.')[1])); // Decode JWT payload
      setUser({ username: decodedUser.username || decodedUser.user_id }); // Ambil username atau user_id

      console.log("Login berhasil!");
      return true; // Berhasil login
    } catch (error) {
      console.error("Login gagal:", error.response?.data || error.message);
      // Hapus token jika ada error
      localStorage.removeItem('authToken');
      setAuthToken(null);
      setUser(null);
      throw error; // Lempar error agar bisa ditangani di komponen login
    }
  };

  // Fungsi untuk melakukan logout
  const logout = () => {
    localStorage.removeItem('authToken');
    setAuthToken(null);
    setUser(null);
    console.log("Logout berhasil!");
  };

  // Efek untuk memuat token dari localStorage saat aplikasi dimuat
  useEffect(() => {
    const loadAuthToken = () => {
      try {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
          const parsedToken = JSON.parse(storedToken);
          setAuthToken(parsedToken);
          // Coba decode token untuk mendapatkan info user
          const decodedUser = JSON.parse(atob(parsedToken.access.split('.')[1]));
          setUser({ username: decodedUser.username || decodedUser.user_id });
        }
      } catch (e) {
        console.error("Gagal memuat token dari localStorage:", e);
        localStorage.removeItem('authToken'); // Hapus token rusak
      } finally {
        setLoading(false);
      }
    };

    loadAuthToken();
  }, []);

  // Fungsi untuk me-refresh token (akan kita gunakan nanti dengan Axios interceptor)
  const refreshAccessToken = async () => {
    if (!authToken || !authToken.refresh) {
      console.log("Tidak ada refresh token untuk di-refresh.");
      logout(); // Jika tidak ada refresh token, anggap perlu login ulang
      return null;
    }
    try {
      const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
        refresh: authToken.refresh,
      });
      const { access } = response.data;
      const newAuthToken = { ...authToken, access };
      localStorage.setItem('authToken', JSON.stringify(newAuthToken));
      setAuthToken(newAuthToken);
      console.log("Token akses berhasil di-refresh.");
      return access;
    } catch (error) {
      console.error("Gagal me-refresh token:", error.response?.data || error.message);
      logout(); // Jika refresh token gagal, paksa logout
      throw error;
    }
  };

  // Menyediakan nilai context ke komponen anak
  const contextValue = {
    authToken,
    user,
    loading,
    login,
    logout,
    refreshAccessToken,
    isAuthenticated: !!authToken, // Cek apakah ada token
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children} {/* Render children setelah loading selesai */}
    </AuthContext.Provider>
  );
};

// Custom hook untuk memudahkan penggunaan AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};