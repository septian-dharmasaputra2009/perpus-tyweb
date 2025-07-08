import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';
import './BookList.css';
import { API_BASE_URL } from '../../config'

function BookList({ isHomePagePreview=false,  searchQuery = ''}) { // Menerima prop isHomePagePreview
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Bangun URL API. Tambahkan parameter 'q' jika searchQuery ada.
        let url = `${API_BASE_URL}/api/books/`;
        if (searchQuery) {
          url += `?q=${encodeURIComponent(searchQuery)}`; // Encode query untuk URL
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setBooks(data);
      } catch (e) {
        setError('Gagal memuat buku. Silakan coba lagi nanti.');
        console.error("Error fetching books:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="book-list-section">
        {isHomePagePreview && <p className="welcome-message">Selamat Datang di Tywebs!</p>}
        <p className="loading-message">Memuat daftar buku...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-list-section">
        {isHomePagePreview && <p className="welcome-message">Selamat Datang di Tywebs!</p>}
        <p className="error-message">{error}</p>
      </div>
    );
  }

  const booksToDisplay = isHomePagePreview ? books.slice(0, 6) : books; // Tampilkan 6 buku untuk preview, semua untuk full list

  return (
    <div className="book-list-section">
      {isHomePagePreview && <p className="welcome-message">Selamat Datang di Tywebs!</p>} {/* Pesan Selamat Datang di Homepage Preview */}
      <h2 className="book-list-title">Daftar Buku</h2>
      {booksToDisplay.length === 0 ? (
        <p className="no-books-message">Belum ada buku yang tersedia.</p>
      ) : (
        <div className="book-cards-container">
          {booksToDisplay.map(book => (
            <BookCard 
              key={book.id} 
              book={{
                id: book.id,
                title: book.title,
                author: book.author,
                coverUrl: book.cover_link 
              }} 
            />
          ))}
        </div>
      )}

      {isHomePagePreview && (
        <Link to="/books" className="see-more-button">
          Lihat Selengkapnya
        </Link>
      )}
    </div>
  );
}

export default BookList;