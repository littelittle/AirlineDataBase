import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AirportSelection from '../components/Passenger/AirportSelection';
import ProductQuery from '../components/Passenger/ProductQuery';
import Transaction from '../components/Passenger/Transaction';
import TransactionQuery from '../components/Passenger/TransactionQuery';
import { Typography, Box } from '@mui/material';

const PassengerPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        乘客服务平台
      </Typography>
      <Routes>
        <Route path="/" element={<AirportSelection />} />
        <Route path="search" element={<AirportSelection />} />
        <Route path="products" element={<ProductQuery />} />
        <Route path="transaction/:productId" element={<Transaction />} />
        <Route path="tickets" element={<TransactionQuery />} />
      </Routes>
    </Box>
  );
};

export default PassengerPage;