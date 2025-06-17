import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AdvancedTransaction = () => {
    const { weeklyFlightDays: encodedWeeklyFlightDays } = useParams();
    // const [idNumber, setIdNumber] = useState('');
    // const [passengerName, setPassengerName] = useState('');
    const {state}  = useLocation();
    const [flightDate, setFlightDate] = useState(state?.flightDate || '');
    // const [remainingTickets, setRemainingTickets] = useState(0);
    const totalprice = state?.totalprice || 0;
    const productId = state?.productIds || [];
    const prices = state?.prices || [];
    const [error, setError] = useState(null);
    const { auth } = useAuth();
    const navigate = useNavigate();

    const weeklyFlightDays = decodeURIComponent(encodedWeeklyFlightDays || '').split(',').map(day => day.trim());

    // useEffect(() => {
    //     const fetchRemainingTickets = async () => {
            
    //     }
    //     fetchRemainingTickets();
    // }, [flightDate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!flightDate) {
            setError('请填写日期！');
            return;
        }
        // if (!weeklyFlightDays.includes(getDayOfWeekString(flightDate))) {
        //     setError('所选日期不在航班运行日内！');
        //     return;
        // }
        if (!totalprice || totalprice <= 0) {
            setError('价格无效，请检查产品信息！');
            return;
        }
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/passenger/advancedtransaction`, {
                idNumber:auth.idNumber,
                cabinPricingID: productId,
                flightDate,
                prices,
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
            <Typography variant="h6" gutterBottom>预订航班 (产品 ID组合: {productId.join(', ' )})</Typography>
            <Typography variant="h6" gutterBottom>航班飞行日: | {weeklyFlightDays.join(' | ')} |</Typography>
            {/* <Typography variant="h6" gutterBottom>剩余票数: {remainingTickets}</Typography> */}
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
                    总金额: ¥{parseFloat(totalprice).toFixed(2)}
                </Typography>
                <Box
                    sx={{
                    display: 'flex',
                    flexDirection: 'column', // 让按钮垂直堆叠
                    gap: 2, // 在按钮之间增加间距
                    mt: 2, // 确保按钮组与上方元素有适当间距
                    maxWidth: '100px'
                    }}
                >
                    <Button type="submit" variant="contained" color="primary">
                    确认购买
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                    返回
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default AdvancedTransaction;