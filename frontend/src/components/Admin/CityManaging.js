import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Alert } from '@mui/material';

const CityManaging = () => {
    const [cityName, setCityName] = useState('');
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [error, setError] = useState(null);

    const getToken = () => localStorage.getItem('token');

    const fetchCities = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/cities`, {
                headers: { Authorization: getToken() }
            });
            const mappedCities = (response.data || []).map(city => ({
                CityID: city.CityID,
                Cityname: city.CityName
            }));
            setCities(mappedCities);
            setError(null);
        } catch (error) {
            console.error('获取城市信息失败', error);
            setError('无法加载城市数据，请检查网络或稍后重试');
        }
    };

    useEffect(() => {
        fetchCities();
    }, []);

    const handleAddCity = async (e) => {
        e.preventDefault();
        if (!cityName.trim()) {
            setError('请输入城市名称');
            return;
        }
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/admin/manage-city`,
                { Cityname: cityName },
                { headers: { Authorization: getToken() } }
            );
            alert('城市添加成功');
            fetchCities();
            setCityName('');
            setError(null);
        } catch (error) {
            console.error('城市添加失败', error);
            setError('城市添加失败：' + (error.response?.data?.error || error.message));
        }
    };

    const handleDeleteCity = async (cityId) => {
        if (window.confirm('确定要删除这个城市吗？')) {
            try {
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/admin/manage-city/${cityId}`,
                    { headers: { Authorization: getToken() } }
                );
                alert('城市删除成功');
                fetchCities();
                setError(null);
            } catch (error) {
                console.error('城市删除失败', error);
                setError('城市删除失败：' + (error.response?.data?.error || error.message));
            }
        }
    };

    const handleEditCity = (city) => {
        setSelectedCity(city);
        setCityName(city.Cityname);
    };

    const handleUpdateCity = async (e) => {
        e.preventDefault();
        if (!cityName.trim()) {
            setError('请输入城市名称');
            return;
        }
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/admin/manage-city/${selectedCity.CityID}`,
                { Cityname: cityName },
                { headers: { Authorization: getToken() } }
            );
            alert('城市信息更新成功');
            fetchCities();
            setSelectedCity(null);
            setCityName('');
            setError(null);
        } catch (error) {
            console.error('城市信息更新失败', error);
            setError('城市更新失败：' + (error.response?.data?.error || error.message));
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>城市管理</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <Box component="form" onSubmit={selectedCity ? handleUpdateCity : handleAddCity} sx={{ mb: 3 }}>
                <TextField
                    label="城市名称"
                    value={cityName}
                    onChange={(e) => setCityName(e.target.value)}
                    margin="normal"
                    fullWidth
                    error={!!error && !cityName.trim()}
                />
                <Box sx={{ mt: 2 }}>
                    <Button type="submit" variant="contained" color="primary">
                        {selectedCity ? '更新城市' : '添加城市'}
                    </Button>
                    {selectedCity && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => {
                                setSelectedCity(null);
                                setCityName('');
                                setError(null);
                            }}
                            sx={{ ml: 2 }}
                        >
                            取消编辑
                        </Button>
                    )}
                </Box>
            </Box>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>城市 ID</TableCell>
                            <TableCell>城市名称</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cities.length > 0 ? (
                            cities.map((city) => (
                                <TableRow key={city.CityID}>
                                    <TableCell>{city.CityID}</TableCell>
                                    <TableCell>{city.Cityname}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditCity(city)} color="primary">编辑</Button>
                                        <Button onClick={() => handleDeleteCity(city.CityID)} color="secondary">删除</Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    <Typography>暂无城市数据</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default CityManaging;