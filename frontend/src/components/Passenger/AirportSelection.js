import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Autocomplete, Alert } from '@mui/material';

const AirportSelection = () => {
    const [departureAirport, setDepartureAirport] = useState(null);
    const [arrivalAirport, setArrivalAirport] = useState(null);
    const [airports, setAirports] = useState([]);
    const [error, setError] = useState(null);
    const [flightDate, setFlightDate] = useState('');
    const navigate = useNavigate();

    const getMinDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_URL}/api/passenger/airports`)
            .then(response => {
                setAirports(response.data || []);
                setError(null);
            })
            .catch(error => {
                console.error('获取机场失败', error);
                setError('无法加载机场数据，请稍后重试');
            });
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!departureAirport || !arrivalAirport) {
            setError('请选择出发和到达机场');
            return;
        }
        if (!flightDate) {
            setError('请选择航班日期'); 
            return;
        }
        if (departureAirport.AirportCode === arrivalAirport.AirportCode) {
            setError('出发和到达机场不能相同');
            return;
        }
        navigate(`/passenger/products?departure=${departureAirport.AirportCode}&arrival=${arrivalAirport.AirportCode}&flightDate=${flightDate}`);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>出发日期</Typography>
            <TextField
                    label="航班日期"
                    type="date"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    margin="normal"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    // error={!!error && !flightDate}
                    inputProps={{min:getMinDate(),}}
            />
            <Typography variant="h5" gutterBottom>选择出发和到达机场</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {airports.length === 0 && !error && (
                <Typography sx={{ mb: 2 }}>暂无机场数据</Typography>
            )}
            <Box component="form" onSubmit={handleSubmit}>
                <Autocomplete
                    options={airports}
                    getOptionLabel={(option) => `${option.Name} (${option.AirportCode})`}
                    value={departureAirport}
                    onChange={(e, value) => setDepartureAirport(value)}
                    renderInput={(params) => <TextField {...params} label="出发机场" margin="normal" fullWidth />}
                />
                <Autocomplete
                    options={airports}
                    getOptionLabel={(option) => `${option.Name} (${option.AirportCode})`}
                    value={arrivalAirport}
                    onChange={(e, value) => setArrivalAirport(value)}
                    renderInput={(params) => <TextField {...params} label="到达机场" margin="normal" fullWidth />}
                />
                <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
                    查询航班
                </Button>
            </Box>
        </Box>
    );
};

export default AirportSelection;