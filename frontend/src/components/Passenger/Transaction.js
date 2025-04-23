import React, { useState } from 'react';
import axios from 'axios';

const Transaction = ({ product }) => {
  const [passengerInfo, setPassengerInfo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/transaction', {
        passengerInfo,
        productId: product.id
      });
      alert('交易成功');
    } catch (error) {
      console.error('交易失败', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="乘客信息"
        value={passengerInfo}
        onChange={(e) => setPassengerInfo(e.target.value)}
      />
      <button type="submit">确认购买</button>
    </form>
  );
};

export default Transaction;    