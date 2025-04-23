import React, { useEffect, useState } from 'react';
import axios from 'axios';

const TransactionRecord = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/admin/transactions`
        );
        setTransactions(response.data);
      } catch (error) {
        console.error('获取交易记录失败', error);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div style={{ overflowX: 'auto', margin: '2rem' }}>
      <table 
        style={{
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          boxShadow: '0 2px 15px rgba(0,0,0,0.1)',
          fontSize: '0.9rem',
          backgroundColor: 'white'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f7fa' }}>
            <th 
              style={{
                padding: '12px',
                borderBottom: '2px solid #e0e0e0',
                textAlign: 'left',
                fontWeight: '600'
              }}
            >
              机票 ID
            </th>
            <th 
              style={{
                padding: '12px',
                borderBottom: '2px solid #e0e0e0',
                textAlign: 'left',
                fontWeight: '600'
              }}
            >
              航班日期
            </th>
            <th 
              style={{
                padding: '12px',
                borderBottom: '2px solid #e0e0e0',
                textAlign: 'left',
                fontWeight: '600'
              }}
            >
              乘客 ID
            </th>
            <th 
              style={{
                padding: '12px',
                borderBottom: '2px solid #e0e0e0',
                textAlign: 'left',
                fontWeight: '600'
              }}
            >
              产品 ID
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr 
              key={transaction.TicketID}
              style={{
                borderBottom: '1px solid #f0f0f0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                {transaction.TicketSaleID}
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                {new Date(transaction.FlightDate).toLocaleDateString('zh-CN')}
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                {transaction.PassengerID}
              </td>
              <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
                {transaction.CabinPricingID}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionRecord;