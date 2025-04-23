import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import PassengerPage from './pages/PassengerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/passenger" element={<PassengerPage />} />
      </Routes>
    </Router>
  );
}

export default App;    