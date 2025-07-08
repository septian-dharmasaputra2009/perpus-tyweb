import React, { createContext, useState, useEffect, useContext } from 'react';

// Buat Context
export const ThemeContext = createContext();

// Buat Provider untuk Context
export const ThemeProvider = ({ children }) => {
  // Ambil tema dari localStorage, default ke 'light'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('tywebs-theme');
    return savedTheme || 'light';
  });

  // Efek samping: Update class di body dan simpan ke localStorage setiap kali tema berubah
  useEffect(() => {
    document.body.className = theme; // Mengatur class pada <body>
    localStorage.setItem('tywebs-theme', theme); // Simpan preferensi tema
  }, [theme]);

  // Fungsi untuk mengubah tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};