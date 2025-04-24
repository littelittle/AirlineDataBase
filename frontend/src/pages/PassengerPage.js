import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AirportSelection from '../components/Passenger/AirportSelection';
import ProductQuery from '../components/Passenger/ProductQuery';
import Transaction from '../components/Passenger/Transaction';
import TransactionQuery from '../components/Passenger/TransactionQuery';

const PassengerPage = () => {
  return (
    <div>
      <h1>乘客页面</h1>
      <Routes>
        <Route path="/" element={<AirportSelection />} />
        <Route path="/products" element={<ProductQuery />} />
        <Route path="/transaction/:productId" element={<Transaction />} />
        <Route path="/transaction-query" element={<TransactionQuery />} />
      </Routes>
    </div>
  );
};

export default PassengerPage;