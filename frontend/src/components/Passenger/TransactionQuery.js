import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionQuery = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/passenger-transactions');
        setTransactions(response.data);
      } catch (error) {
        console.error('获取交易记录失败', error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>交易时间</th>
          <th>乘客信息</th>
          <th>购买产品详情</th>
          <th>交易状态</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction) => (
          <tr key={transaction.id}>
            <td>{transaction.transactionTime}</td>
            <td>{transaction.passengerInfo}</td>
            <td>{transaction.productDetails}</td>
            <td>{transaction.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TransactionQuery;    