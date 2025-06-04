import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AirportSelection from '../components/Passenger/AirportSelection';
import ProductQuery from '../components/Passenger/ProductQuery';
import Transaction from '../components/Passenger/Transaction';
import TransactionQuery from '../components/Passenger/TransactionQuery';
import ProfilePage from '../components/Passenger/Profile';

import { Typography, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';

const PassengerPage = () => {
  const {auth} = useAuth();
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hello! {auth.username}
      </Typography>
      <Routes>
        <Route path="/" element={<AirportSelection />} />
        <Route path="search" element={<AirportSelection />} />
        <Route path="products" element={<ProductQuery />} />
        <Route path="transaction/:productId" element={<Transaction />} />
        <Route path="tickets" element={<TransactionQuery />} />
        <Route path="profile" element={<ProfilePage />} />
      </Routes>
    </Box>
  );
};

export default PassengerPage;