import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const Transaction = () => {
    const { productId, weeklyFlightDays: encodedWeeklyFlightDays } = useParams();
    // const [idNumber, setIdNumber] = useState('');
    // const [passengerName, setPassengerName] = useState('');
    const {state}  = useLocation();
    const [flightDate, setFlightDate] = useState(state?.flightDate || '');
    const price = state?.price || 0;
    const [error, setError] = useState(null);
    const { auth } = useAuth();
    const navigate = useNavigate();

    const weeklyFlightDays = decodeURIComponent(encodedWeeklyFlightDays || '').split(',').map(day => day.trim());

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!flightDate) {
            setError('请填写日期！');
            return;
        }
        if (!weeklyFlightDays.includes(getDayOfWeekString(flightDate))) {
            setError('所选日期不在航班运行日内！');
            return;
        }
        if (!price || price <= 0) {
            setError('价格无效，请检查产品信息！');
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/passenger/transaction`, {
                idNumber:auth.idNumber,
                cabinPricingID: productId,
                flightDate,
                price,
            });
            alert('交易成功');
            navigate('/passenger/tickets');
        } catch (error) {
            console.error('交易失败', error);
            setError('交易失败：' + (error.response?.data?.error || error.message));
        }
    };
    
    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const getDayOfWeekString = (dateString) => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>预订航班 (产品 ID: {productId})</Typography>
            <Typography variant="h6" gutterBottom>航班飞行日: | {weeklyFlightDays.join(' | ')} |</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    label="航班日期"
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    margin="normal"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={!!error && !flightDate}
                    inputProps={{min:getMinDate(),}}
                />
                <Typography variant="h6" sx={{ mt: 2 }}>
                    总金额: ¥{price.toFixed(2)}
                </Typography>
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    确认购买
                </Button>
            </Box>
        </Box>
    );
};

export default Transaction;