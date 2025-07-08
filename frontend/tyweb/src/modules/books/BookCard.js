import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
// import './BookList.css'; // Gaya dari BookList.css akan diterapkan secara global atau diimport dari BookList.js

function BookCard({ book }) {
  if (!book) return null;

  return (
    // Bungkus seluruh kartu dengan Link
    <Link to={`/book/${book.id}`} className="book-card-link">
      <div className="book-card">
        <img src={book.coverUrl} alt={book.title} className="book-cover" />
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
      </div>
    </Link>
  );
}

export default BookCard;