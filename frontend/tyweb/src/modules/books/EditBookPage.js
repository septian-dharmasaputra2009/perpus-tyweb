import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EditBookPage.css'; // Pastikan file CSS ini ada di folder yang sama

const EditBookPage = () => {
  const { id } = useParams(); // Mengambil ID buku dari URL
  const navigate = useNavigate();

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    coverLink: '',
    description: '',
  });

  const [pageLinks, setPageLinks] = useState([]); // Array untuk page_links
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // --- Efek untuk memuat data buku yang akan diedit ---
  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      setFeedbackMessage(''); // Reset feedback message on new fetch
      try {
        const response = await fetch(`${API_BASE_URL}/api/books/${id}/`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Buku tidak ditemukan.");
          }
          throw new Error(`Gagal memuat detail buku: ${response.statusText}`);
        }
        const data = await response.json();

        // --- DEBUGGING: CEK DATA API LANGSUNG DI SINI ---
        console.log("DEBUG EditPage: Raw API 'data' object:", data);
        console.log("DEBUG EditPage: Raw 'data.page_links' array:", data.page_links);
        // --- AKHIR DEBUGGING ---

        setBookData({
          title: data.title,
          author: data.author,
          coverLink: data.cover_link || '', // Pastikan ada fallback jika null
          description: data.description,
        });

        // Pastikan page_links memiliki id dari backend untuk update
        setPageLinks(data.page_links.map(link => ({
          id: link.id, // Penting: simpan ID page_link dari backend
          page_number_start: link.page_number_start,
          page_number_end: link.page_number_end,
          file_url: link.file_url
        })));
      } catch (err) {
        console.error("Error fetching book details for edit:", err);
        setError(err.message || "Terjadi kesalahan saat memuat detail buku untuk diedit.");
      } finally {
        setLoading(false);
      }
    };

    if (id) { // Pastikan ID ada sebelum fetch
      fetchBookDetails();
    }
  }, [id]); // Dependensi pada ID buku

  // Handler perubahan input buku
  const handleBookDataChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler perubahan input page link
  const handlePageLinkChange = (index, e) => {
    const { name, value } = e.target;
    const newPageLinks = [...pageLinks];
    // Update properti yang sesuai (file_url, page_number_start, page_number_end)
    newPageLinks[index] = { ...newPageLinks[index], [name]: value };
    setPageLinks(newPageLinks);
  };

  // Handler tambah page link baru
  const handleAddPageLink = () => {
    const lastPageLink = pageLinks[pageLinks.length - 1];
    const newStart = lastPageLink ? parseInt(lastPageLink.page_number_end) + 1 : 1;
    const newEnd = lastPageLink ? parseInt(lastPageLink.page_number_end) + 10 : 10;
    setPageLinks((prevLinks) => [
      ...prevLinks,
      { id: null, page_number_start: newStart, page_number_end: newEnd, file_url: '' } // ID null untuk yang baru
    ]);
  };

  // Handler hapus page link
  const handleRemovePageLink = (indexToRemove) => {
    setPageLinks((prevLinks) => prevLinks.filter((_, index) => index !== indexToRemove));
  };

  // --- FUNGSI SUBMIT UNTUK MEMPERBARUI BUKU KE BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedbackMessage('');
    setIsSuccess(false);

    if (!bookData.title || !bookData.author || !bookData.description) {
      setFeedbackMessage('Judul, Penulis, dan Deskripsi tidak boleh kosong.');
      return;
    }

    // Filter page_links yang kosong dan siapkan format untuk backend
    const pageLinksToSubmit = pageLinks
      .filter(link => link.file_url.trim() !== '') // Hanya kirim yang ada URL-nya
      .map(link => ({
        id: link.id, // Sertakan ID jika ada (untuk update), null jika baru
        page_number_start: parseInt(link.page_number_start),
        page_number_end: parseInt(link.page_number_end),
        file_url: link.file_url,
      }));

    const dataToSubmit = {
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      cover_link: bookData.coverLink,
      page_links: pageLinksToSubmit,
    };

    console.log('DEBUG EditPage: Data yang akan dikirim untuk update:', dataToSubmit); // Debugging data kirim

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${id}/`, { // <-- URL API PUT/PATCH Buku
        method: 'PUT', // Atau 'PATCH' jika hanya ingin mengirim perubahan parsial
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Jika ada token otentikasi
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMsg = `Gagal memperbarui buku: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          errorMsg = `Gagal memperbarui buku: Server mengembalikan respons tidak valid (bukan JSON). ${responseText.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      setFeedbackMessage('Buku berhasil diperbarui!');
      setIsSuccess(true);
      // Opsional: Redirect kembali ke halaman detail buku setelah update
      // navigate(`/book/${id}`);

    } catch (err) {
      console.error("Error updating book:", err);
      setFeedbackMessage(`${err.message}`);
      setIsSuccess(false);
    }
  };

  // --- FUNGSI HAPUS BUKU ---
  const handleDeleteBook = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.')) {
      return;
    }

    setFeedbackMessage('');
    setIsSuccess(false);

    try {
      const response = await fetch(`${API_BASE_URL}/api/books/${id}/`, {
        method: 'DELETE',
        // headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const responseText = await response.text();
        let errorMsg = `Gagal menghapus buku: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          errorMsg = `Gagal menghapus buku: Server mengembalikan respons tidak valid (bukan JSON). ${responseText.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      setFeedbackMessage('Buku berhasil dihapus!');
      setIsSuccess(true);
      // Redirect ke homepage atau daftar buku setelah penghapusan
      navigate('/');

    } catch (err) {
      console.error("Error deleting book:", err);
      setFeedbackMessage(`${err.message}`);
      setIsSuccess(false);
    }
  };

  // --- Render berdasarkan Loading/Error/Data ---
  if (loading) {
    return (
      <div className="edit-book-container">
        <div className="form-card">
          <p className="loading-message">Memuat data buku untuk diedit...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="edit-book-container">
        <div className="form-card">
          <p className="error-message">{error}</p>
          <button onClick={() => navigate(`/book/${id}`)} className="btn btn-secondary" style={{marginTop: '20px'}}>Kembali ke Detail Buku</button>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-book-container">
      <div className="form-card">
        <h2 className="form-title">Edit Buku</h2>

        {feedbackMessage && (
          <div className={`feedback-message ${isSuccess ? 'success' : 'error'}`}>
            {feedbackMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-spacing">
          {/* Input Judul Buku */}
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Judul Buku
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={bookData.title}
              onChange={handleBookDataChange}
              className="input-field"
              placeholder="Masukkan judul buku"
              required
            />
          </div>

          {/* Input Penulis */}
          <div className="form-group">
            <label htmlFor="author" className="form-label">
              Penulis
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={bookData.author}
              onChange={handleBookDataChange}
              className="input-field"
              placeholder="Masukkan nama penulis"
              required
            />
          </div>

          {/* Input Link Cover */}
          <div className="form-group">
            <label htmlFor="coverLink" className="form-label">
              Link Cover (URL)
            </label>
            <input
              type="url"
              id="coverLink"
              name="coverLink"
              value={bookData.coverLink}
              onChange={handleBookDataChange}
              className="input-field"
              placeholder="https://example.com/cover.jpg"
            />
          </div>

          {/* Input Deskripsi */}
          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Deskripsi
            </label>
            <textarea
              id="description"
              name="description"
              value={bookData.description}
              onChange={handleBookDataChange}
              rows="4"
              className="input-field textarea-field"
              placeholder="Tulis deskripsi singkat tentang buku ini..."
              required
            ></textarea>
          </div>

          {/* Bagian Dinamis untuk Link Halaman Buku */}
          <div className="page-links-section">
            <h3 className="section-title">Link Halaman Buku (per 10 halaman)</h3>
            {pageLinks.map((link, index) => (
              <div key={link.id || `new-${index}`} className="page-link-item"> {/* Gunakan link.id jika ada, fallback ke index */}
                <label htmlFor={`file_url-${index}`} className="form-label page-link-label">
                  Halaman
                  <input
                    type="number"
                    name="page_number_start"
                    value={link.page_number_start || ''}
                    onChange={(e) => handlePageLinkChange(index, e)}
                    className="input-field page-link-input-small"
                    placeholder="Mulai"
                    style={{width: '60px', marginRight: '5px'}}
                    required
                  />
                  -
                  <input
                    type="number"
                    name="page_number_end"
                    value={link.page_number_end || ''}
                    onChange={(e) => handlePageLinkChange(index, e)}
                    className="input-field page-link-input-small"
                    placeholder="Akhir"
                    style={{width: '60px', marginLeft: '5px'}}
                    required
                  />
                  :
                </label>
                <input
                  type="url"
                  id={`file_url-${index}`}
                  name="file_url"
                  value={link.file_url}
                  onChange={(e) => handlePageLinkChange(index, e)}
                  className="input-field page-link-input"
                  placeholder={`URL PDF halaman ${link.page_number_start}-${link.page_number_end}`}
                />
                {pageLinks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemovePageLink(index)}
                    className="btn btn-remove"
                    title="Hapus Link Halaman Ini"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddPageLink}
              className="btn btn-secondary"
            >
              + Tambahkan Halaman Buku
            </button>
          </div>

          {/* Tombol Submit Formulir */}
          <button type="submit" className="btn btn-primary">
            Perbarui Buku
          </button>
        </form>

        <button
          type="button"
          onClick={handleDeleteBook}
          className="btn btn-remove delete-button"
        >
          Hapus Buku Ini
        </button>
      </div>
    </div>
  );
};

export default EditBookPage;