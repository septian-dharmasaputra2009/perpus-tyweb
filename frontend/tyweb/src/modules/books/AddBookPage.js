import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate jika ingin redirect setelah tambah buku
import './AddBookPage.css'; // Pastikan file CSS ini ada di folder yang sama

const AddBookPage = () => {
  const navigate = useNavigate(); // Inisialisasi useNavigate

  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    coverLink: '', // Di Django ini menjadi cover_link
    description: '',
  });

  // State untuk menyimpan array dari link PDF per 10 halaman
  // Setiap elemen akan menjadi objek: { id: null, page_number_start, page_number_end, file_url }
  const [pageLink, setPageLinks] = useState([
    { id: null, page_number_start: 1, page_number_end: 10, file_url: '' }
  ]);

  // State untuk pesan feedback kepada pengguna (sukses atau error)
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Handler untuk memperbarui state bookData saat input form berubah
  const handleBookDataChange = (e) => {
    const { name, value } = e.target;
    setBookData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handler untuk memperbarui link halaman spesifik dalam array pageLinks
  const handlePageLinkChange = (index, e) => {
    const { name, value } = e.target;
    const newPageLink = [...pageLink];
    // Update properti yang sesuai (file_url, page_number_start, page_number_end)
    newPageLink[index] = { ...newPageLink[index], [name]: value };
    setPageLinks(newPageLink);
  };

  // Handler untuk menambahkan input link halaman baru ke formulir
  const handleAddPageLink = () => {
    const lastPageLink = pageLink[pageLink.length - 1];
    // Perkirakan halaman awal dan akhir untuk link baru
    const newStart = lastPageLink ? parseInt(lastPageLink.page_number_end) + 1 : 1;
    const newEnd = lastPageLink ? parseInt(lastPageLink.page_number_end) + 10 : 10;
    setPageLinks((prevLinks) => [
      ...prevLinks,
      { id: null, page_number_start: newStart, page_number_end: newEnd, file_url: '' }
    ]);
  };

  // Handler untuk menghapus input link halaman dari formulir
  const handleRemovePageLink = (indexToRemove) => {
    setPageLinks((prevLinks) => prevLinks.filter((_, index) => index !== indexToRemove));
  };

  // --- FUNGSI SUBMIT UNTUK MENAMBAH BUKU KE BACKEND ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFeedbackMessage('');
    setIsSuccess(false);

    if (!bookData.title || !bookData.author || !bookData.description) {
      setFeedbackMessage('Judul, Penulis, dan Deskripsi tidak boleh kosong.');
      return;
    }

    const filteredPageLinks = pageLink.filter(link => link.file_url.trim() !== '');

    // Gabungkan semua data buku dan link halaman
    // Pastikan formatnya sesuai dengan yang diharapkan serializer Django
    const dataToSubmit = {
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      cover_link: bookData.coverLink, // Sesuaikan dengan nama field di Django
      page_links: filteredPageLinks.map(link => ({
        page_number_start: parseInt(link.page_number_start),
        page_number_end: parseInt(link.page_number_end),
        file_url: link.file_url,
      })),
    };

    console.log('Data yang akan dikirim ke Django:', dataToSubmit);

    try {
      const response = await fetch('${API_BASE_URL}/api/books/', { // <-- URL API POST Buku
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`, // Jika ada token otentikasi
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        // Coba baca respons error dari server
        const responseText = await response.text();
        let errorMsg = `Gagal menambahkan buku: ${response.statusText}`;
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          errorMsg = `Gagal menambahkan buku: Server mengembalikan respons tidak valid (bukan JSON). ${responseText.substring(0, 100)}...`;
        }
        throw new Error(errorMsg);
      }

      const newBook = await response.json(); // Respons dari Django (buku baru yang dibuat)
      setFeedbackMessage('Buku berhasil ditambahkan!');
      setIsSuccess(true);

      // Reset formulir setelah sukses
      setBookData({ title: '', author: '', coverLink: '', description: '' });
      setPageLinks([{ id: null, page_number_start: 1, page_number_end: 10, file_url: '' }]);
      navigate(`/book/${newBook.id}`);

    } catch (err) {
      console.error("Error adding book:", err);
      setFeedbackMessage(`${err.message}`);
      setIsSuccess(false);
    }
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2 className="form-title">Tambah Buku Baru</h2>

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
            {pageLink.map((link, index) => (
              <div key={link.id || index} className="page-link-item">
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
                {pageLink.length > 1 && (
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
            Simpan Buku
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBookPage;