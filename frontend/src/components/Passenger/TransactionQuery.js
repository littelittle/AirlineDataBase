import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const TransactionQuery = () => {
    const [transactions, setTransactions] = useState([]);
    const { auth } = useAuth();

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!auth.idNumber) {
                console.error('未找到用户身份证号');
                return;
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passenger-transactions`, {
                    params: { idNumber: auth.idNumber }
                });
                setTransactions(response.data);
            } catch (error) {
                console.error('获取交易记录失败', error);
            }
        };
        fetchTransactions();
    }, [auth.idNumber]);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>我的订单</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f7fa' }}>
                            <TableCell>机票 ID</TableCell>
                            <TableCell>航班日期</TableCell>
                            <TableCell>乘客 ID</TableCell>
                            <TableCell>产品 ID</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow
                                key={transaction.TicketID}
                                sx={{
                                    '&:hover': { backgroundColor: '#f8f9fa' },
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <TableCell>{transaction.TicketSaleID}</TableCell>
                                <TableCell>{new Date(transaction.FlightDate).toLocaleDateString('zh-CN')}</TableCell>
                                <TableCell>{transaction.PassengerID}</TableCell>
                                <TableCell>{transaction.CabinPricingID}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default TransactionQuery;