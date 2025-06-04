import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import AdminPage from './pages/AdminPage';
import PassengerPage from './pages/PassengerPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RoleRoute from './pages/RoleRoute';
import { Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin/*" element={
          <RoleRoute role="admin">
            <DashboardLayout>
              <AdminPage />
            </DashboardLayout>
          </RoleRoute>
        } />
        <Route path="/passenger/*" element={
          <RoleRoute role="passenger">
            <DashboardLayout>
              <PassengerPage />
            </DashboardLayout>
          </RoleRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App; 