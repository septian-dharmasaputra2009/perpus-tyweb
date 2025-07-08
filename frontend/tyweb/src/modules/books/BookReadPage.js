import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './BookReadPage.css'; // Pastikan file CSS ini ada dan sesuai
// Import komponen dari react-pdf
import { Document, Page, pdfjs } from 'react-pdf';
import { API_BASE_URL } from '../../config'

// PENTING: Konfigurasi sumber worker untuk react-pdf
// Ini adalah cara PALING ANDAL dengan menentukan versi pdfjs-dist yang stabil dari unpkg.com
// Pastikan ini barisnya persis seperti ini.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const BookReadPage = () => {
  // Ambil bookId dan pageNumStart dari URL
  // pageNumStart di URL akan menjadi Halaman Awal Segmen saat ini (misal 1, 11, 21)
  const { bookId, pageNumStart: startPageNumberStr } = useParams(); // <-- Pastikan ini pageNumStart!
  const startPageNumber = parseInt(startPageNumberStr); // Konversi ke integer

  const navigate = useNavigate();

  const [book, setBook] = useState(null); // Menyimpan data buku lengkap
  const [currentPdfUrl, setCurrentPdfUrl] = useState(null); // URL PDF untuk segmen 10 halaman saat ini
  const [numPages, setNumPages] = useState(null); // Jumlah halaman dalam PDF yang sedang dimuat
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookAndPdfUrl = async () => {
      setLoading(true);
      setError(null); // Reset error
      try {
        // Debugging yang lebih dalam
        console.log("DEBUG ReadPage: URL params (dari useParams):", { bookId, pageNumStart: startPageNumberStr });
        console.log("DEBUG ReadPage: Parsed startPageNumber:", startPageNumber);

        // Validasi nomor halaman awal
        if (isNaN(startPageNumber)) {
          console.error("DEBUG ERROR: startPageNumber is NaN. Value from URL (sebelum parseInt):", startPageNumberStr);
          throw new Error("Nomor halaman awal di URL tidak dapat diurai sebagai angka.");
        }

        const response = await fetch(`${API_BASE_URL}/api/books/${bookId}/`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Buku tidak ditemukan.");
          }
          throw new Error(`Gagal memuat buku: ${response.statusText}`);
        }
        const data = await response.json();
        setBook(data);

        const currentSegment = data.page_links.find(link =>
          parseInt(link.page_number_start) === startPageNumber
        );

        if (currentSegment) {
          setCurrentPdfUrl(currentSegment.file_url);
        } else {
          console.error("DEBUG ERROR: Segmen tidak ditemukan di page_links. startPageNumber:", startPageNumber, "Available page_links:", data.page_links);
          throw new Error(`Segmen halaman dimulai dari ${startPageNumber} tidak ditemukan di database untuk buku ini. Pastikan data di admin benar.`);
        }

      } catch (err) {
        console.error("Error in fetchBookAndPdfUrl:", err);
        setError(err.message || "Terjadi kesalahan saat memuat halaman buku.");
        setCurrentPdfUrl(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndPdfUrl();
  },[bookId, startPageNumber, startPageNumberStr]);


  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const navigateSegment = (direction) => {
    if (!book || !book.page_links || book.page_links.length === 0) return;

    const sortedPageLinks = [...book.page_links].sort((a, b) => parseInt(a.page_number_start) - parseInt(b.page_number_start));

    const currentIndex = sortedPageLinks.findIndex(link =>
      parseInt(link.page_number_start) === startPageNumber
    );

    let nextSegment = null;
    if (direction === 'prev' && currentIndex > 0) {
      nextSegment = sortedPageLinks[currentIndex - 1];
    } else if (direction === 'next' && currentIndex < sortedPageLinks.length - 1) {
      nextSegment = sortedPageLinks[currentIndex + 1];
    }

    if (nextSegment) {
      navigate(`/read/${bookId}/${nextSegment.page_number_start}`);
    }
  };

  const hasPrev = book && book.page_links && book.page_links.findIndex(link =>
    parseInt(link.page_number_start) === startPageNumber
  ) > 0;

  const hasNext = book && book.page_links && book.page_links.findIndex(link =>
    parseInt(link.page_number_start) === startPageNumber
  ) < book.page_links.length - 1;


  if (loading) {
    return (
      <div className="book-read-page-container">
        <p className="loading-message">Memuat halaman buku...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-read-page-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(`/book/${bookId}`)} className="btn btn-primary" style={{marginTop: '20px'}}>Kembali ke Detail Buku</button>
      </div>
    );
  }

  if (!book || !currentPdfUrl) {
    return (
      <div className="book-read-page-container">
        <p className="no-content-message">Konten halaman tidak tersedia atau URL PDF tidak valid.</p>
      </div>
    );
  }

  return (
    <div className="book-read-page-container">
      <h1 className="book-read-title">{book.title}</h1>
      {/* Keterangan halaman segmen dihapus sesuai permintaan */}

      <div className="pdf-viewer-container"> {/* Container untuk PDF viewer */}
        <Document
          file={currentPdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={(err) => {
            console.error("Error loading PDF document:", err);
            setError("Gagal memuat dokumen PDF. Pastikan URL valid dan CORS diizinkan.");
          }}
          className="pdf-document-style"
        >
          {Array.from(new Array(numPages), (el, index) => (
            <div key={`page_${index + 1}`} className="pdf-page-wrapper">
              <Page
                pageNumber={index + 1} // Render halaman dari 1 hingga numPages
                width={Math.min(900, window.innerWidth * 0.9)} // Sesuaikan lebar agar responsif
                renderTextLayer={false} // Biasanya tidak perlu untuk komik
                renderAnnotationLayer={false} // Biasanya tidak perlu untuk komik
              />
            </div>
          ))}
        </Document>
        {numPages === null && !error && !loading && <p className="loading-message">Memuat PDF...</p>}
      </div>

      <div className="book-navigation-controls">
        <button
          onClick={() => navigateSegment('prev')}
          disabled={!hasPrev}
          className="btn btn-secondary nav-button"
        >
          &larr; Segmen Sebelumnya
        </button>
        <span className="current-page-info">
          Segmen {book.page_links ? (book.page_links.findIndex(link => parseInt(link.page_number_start) === startPageNumber) + 1) : 'N/A'} dari {book.page_links ? book.page_links.length : 'N/A'}
        </span>
        <button
          onClick={() => navigateSegment('next')}
          disabled={!hasNext}
          className="btn btn-secondary nav-button"
        >
          Selanjutnya &rarr;
        </button>
      </div>
    </div>
  );
};

export default BookReadPage;