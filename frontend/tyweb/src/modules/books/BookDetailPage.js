import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './BookDetailPage.css';
import { API_BASE_URL } from '../../config'

const BookDetailPage = () => {
  const { id } = useParams(); // Mengambil ID buku dari URL
  const navigate = useNavigate(); // Untuk navigasi

  const [book, setBook] = useState(null); // State untuk menyimpan data buku
  const [loading, setLoading] = useState(true); // State loading
  const [error, setError] = useState(null); // State error

  // Efek untuk memuat data buku saat komponen dimuat atau ID berubah
  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        // Panggilan API ke Django untuk mengambil detail buku berdasarkan ID
        const response = await fetch(`${API_BASE_URL}/api/books/${id}/`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Buku tidak ditemukan.");
          }
          throw new Error(`Gagal memuat buku: ${response.statusText}`);
        }
        const data = await response.json();
        setBook(data); // Simpan data buku ke state
      } catch (err) {
        console.error("Error fetching book details:", err);
        setError(err.message || "Terjadi kesalahan saat memuat detail buku.");
      } finally {
        setLoading(false); // Selesai loading
      }
    };

    fetchBookDetails();
  }, [id]); // Jalankan ulang efek jika ID buku berubah

  // Fungsi untuk pergi ke halaman edit buku
  const handleEditClick = () => {
    navigate(`/edit-book/${id}`);
  };

  // Fungsi untuk mengelompokkan page_links per 10 halaman untuk tampilan Daftar Isi
  const getGroupedPageLinks = (pageLinks) => {
    if (!pageLinks || pageLinks.length === 0) return [];

    // Urutkan dulu semua page_links berdasarkan nomor halaman awal
    const sortedPageLinks = [...pageLinks].sort((a, b) => a.page_number_start - b.page_number_start);
    const grouped = [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const firstActualPage = sortedPageLinks[0].page_number_start; 
    const lastActualPage = sortedPageLinks[sortedPageLinks.length - 1].page_number_start; 

    // Iterasi melalui setiap 10 halaman konseptual
    let currentGroupStart = 1; // Mulai dari halaman konseptual 1

    while (currentGroupStart <= lastActualPage + 9) { 
        const currentGroupEnd = currentGroupStart + 9;

        const firstLinkInThisGroup = sortedPageLinks.find(link => 
            link.page_number_start >= currentGroupStart && link.page_number_start <= currentGroupEnd
        );

        if (firstLinkInThisGroup) {
            grouped.push({
                start: firstLinkInThisGroup.page_number_start, 
                end: currentGroupEnd, 
                label: `Halaman ${currentGroupStart}-${currentGroupEnd}`,
            });
        }
        currentGroupStart += 10;
    }
    return grouped;
  };

  const groupedToc = book ? getGroupedPageLinks(book.page_links) : [];

  // --- Render berdasarkan Loading/Error/Data ---
  if (loading) {
    return (
      <div className="book-detail-page">
        <p className="loading-message">Memuat detail buku...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-detail-page">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/')} className="btn btn-primary" style={{marginTop: '20px'}}>Kembali ke Homepage</button>
      </div>
    );
  }

  if (!book) { 
    return (
      <div className="book-detail-page">
        <p className="no-books-message">Buku tidak ditemukan.</p>
      </div>
    );
  }

  // Jika data buku berhasil dimuat
  return (
    <div className="book-detail-page">
      <div className="book-detail-header">
        <img src={book.cover_link} alt={book.title} className="detail-book-cover" />
        <div className="book-info">
          <h1 className="detail-book-title">{book.title}</h1>
          <h2 className="detail-book-author">by {book.author}</h2>
          <p className="detail-book-meta">
            Halaman: {book.page_links ? book.page_links.length * 10 : 'N/A'}
          </p>
          <button className="btn btn-secondary" onClick={handleEditClick} style={{ marginTop: '1rem' }}>
            Edit Buku
          </button>
        </div>
      </div>

      <div className="book-detail-content">
        <div className="book-description">
          <h3>Deskripsi</h3>
          <p>{book.description}</p>
        </div>

        <div className="book-toc">
          <h3>Daftar Isi</h3>
          {groupedToc.length > 0 ? (
            <ul className="toc-list">
              {/* eslint-disable-next-line no-loop-func */}
              {groupedToc.map((group, index) => (
                <li key={index}>
                  <Link to={`/read/${book.id}/${group.start}`}>
                    {group.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>Daftar isi belum tersedia.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;