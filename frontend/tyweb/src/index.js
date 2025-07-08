import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Import komponen App kita
import './App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);