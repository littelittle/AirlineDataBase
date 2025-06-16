import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Autocomplete, TextField, Chip } from '@mui/material';

const FlightScheduling = () => {
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);
    const [stops, setStops] = useState([]);
    const [sortedStops, setSortedStops] = useState([]);
    const [airports, setAirports] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [departureAirport, setDepartureAirport] = useState(null);
    const [arrivalAirport, setArrivalAirport] = useState(null);
    const [newAirport, setNewAirport] = useState(null);
    const [newStopId, setNewStopId] = useState(null);
    const [cabinClass, setCabinClass] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [adjacentAirports, setAdjacentAirports] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('token');

    const fetchFlights = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/flights`, {
                headers: { Authorization: getToken() }
            });
            setFlights(response.data);
        } catch (error) {
            setError('获取航班信息失败');
        }
    };

    const fetchStops = async (flightId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/flights/${flightId}/airports`);
            const sorted = response.data.sort((a, b) => a.StopOrder - b.StopOrder);
            setStops(sorted);
            setSortedStops(sorted.map(item => item.AirportCode));
            console.log('Sorted Stops:', sortedStops);
            generateAdjacentRoutes(sorted);
        } catch (error) {
            console.error('获取经停机场数据失败:', error);
        }
    };

    const fetchProducts = async (flightId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products/${flightId}`);
            setProducts(response.data);
        } catch (error) {
            console.error('获取产品数据失败:', error);
        }
    };

    const fetchAirports = async () =>{
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/airports`);
            setAirports(response.data);
        } catch (error) {
            console.error('获取机场数据失败', error);
        }
    }

    const generateAdjacentRoutes = (stops) => {
        const routes = [];
        for (let i = 0; i < stops.length - 1; i++) {
            routes.push({
                departure: stops[i],
                arrival: stops[i + 1]
            });
        }
        setAdjacentAirports(routes);
    };

    const handleEditFlight = (flight) => {
        setSelectedFlight(flight);
        Promise.all([
            fetchStops(flight.FlightID),
            fetchProducts(flight.FlightID),
            fetchAirports()
        ]);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!validateProduct()) return;

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/create-product`, {
                flightID: selectedFlight.FlightID,
                departureAirport: departureAirport.AirportCode,
                arrivalAirport: arrivalAirport.AirportCode,
                cabinClass,
                price: parseFloat(price),
                discount: parseFloat(discount)
            });
            alert('产品添加成功');
            fetchProducts(selectedFlight.FlightID);
            resetProductForm();
        } catch (error) {
            console.error('添加产品失败:', error);
            alert('添加产品失败，请稍后重试');
        }
    };

    const handleAddAirport = async (e) => {
        e.preventDefault();
        if (!validateFlightRoute()) return;

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/flights/${selectedFlight.FlightID}/airports`, {
                // FlightID: selectedFlight.FlightID,
                // AirportCode: newAirport,
                // StopOrder: newStopId
                OriginalStops: stops.map(stop => stop.AirportCode),
                ModifiedStops: sortedStops
            });
            alert('经停机场修改成功！'); 
            fetchStops(selectedFlight.FlightID);
            resetFlightRouteForm();
        } catch (error){
            alert(`添加经停机场失败！${error.response?.data?.error || error.message}`);
            setSortedStops(stops.map(stop => stop.AirportCode)); // Reset to original stops
        }
    }

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setDepartureAirport(stops.find(stop => stop.AirportCode === product.DepartureAirportID));
        setArrivalAirport(stops.find(stop => stop.AirportCode === product.ArrivalAirportID));
        setCabinClass(product.CabinLevel);
        setPrice(product.Price.toString());
        setDiscount(product.DiscountRate.toString());
    };

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!validateProduct()) return;

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/update-product/${selectedProduct.PricingID}`, {
                flightID: selectedFlight.FlightID,
                departureAirport: departureAirport.AirportCode,
                arrivalAirport: arrivalAirport.AirportCode,
                cabinClass,
                price: parseFloat(price),
                discount: parseFloat(discount)
            });
            alert('产品更新成功');
            fetchProducts(selectedFlight.FlightID);
            setSelectedProduct(null);
            resetProductForm();
        } catch (error) {
            console.error('更新产品失败:', error);
            alert('更新产品失败，请稍后重试');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('确认删除此产品？')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/delete-product/${productId}`);
                alert('产品删除成功');
                fetchProducts(selectedFlight.FlightID);
            } catch (error) {
                console.error('删除产品失败:', error);
                alert('删除产品失败，请稍后重试');
            }
        }
    };

    const handleDeleteFlight = async (flightId) => {
        if (!window.confirm('确定要删除该航班吗？')) return;
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/admin/flights/${flightId}`,
                { headers: { Authorization: getToken() } }
            );
            fetchFlights();
        } catch (error) {
            setError('删除航班失败');
        }
    };

    const validateProduct = () => {
        if (!selectedFlight) {
            alert('请先选择航班');
            return false;
        }
        if (!departureAirport || !arrivalAirport) {
            alert('请选择合法航线');
            return false;
        }
        if (!cabinClass || isNaN(parseFloat(price)) || isNaN(parseFloat(discount)) || parseFloat(discount) < 0 || parseFloat(discount) > 100) {
            alert('请填写有效参数（折扣需在 0-100 之间）');
            return false;
        }
        return true;
    };

    const validateFlightRoute = () => {
        if (!selectedFlight) {
            alert('请先选择航班');
            return false;
        }
        return true;
    }

    const resetProductForm = () => {
        setDepartureAirport(null);
        setArrivalAirport(null);
        setCabinClass('');
        setPrice('');
        setDiscount('');
    };

    const resetFlightRouteForm = () => {
        setNewAirport(null);
        setNewStopId(null);
    }

    useEffect(() => {
        fetchFlights();
    }, []);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>航班与产品管理</Typography>

            {/* 航班列表 */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>航班列表</Typography>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>航班号</TableCell>
                                <TableCell>机型</TableCell>
                                <TableCell>操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {flights.map((flight) => (
                                <TableRow key={flight.FlightID}>
                                    <TableCell>{flight.FlightID}</TableCell>
                                    <TableCell>{flight.AircraftType}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditFlight(flight)} color="primary">编辑</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box sx={{ mt: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin/flights/new',)}
                    sx={{ mb: 2 }}
                >
                    新增航班
                </Button>
            </Box>

            {/* 选中航班的航线管理模块*/}
            {selectedFlight && (
                <Box>
                    <Typography variant="h6" gutterBottom>航班：{selectedFlight.FlightID}</Typography>
                    {/* 插入经停机场 */}
                    <Box sx={{ mb: 3 }}>
                        <Box>
                        <Typography variant="subtitle1">插入经停机场</Typography>
                        <Typography>当前顺序：{sortedStops.join(' → ')}</Typography>
                        </Box>
                        <Box component="form" onSubmit={handleAddAirport} sx={{ mb: 3 }}>
                           <Autocomplete
                                multiple
                                options={airports.map(airport => airport.AirportCode)}
                                getOptionLabel={(option) => `${option}(${airports.find(airport => airport.AirportCode === option).Name})`}
                                value={sortedStops}
                                onChange={(e, newValue) => {
                                    // setNewAirport(value.AirportCode);
                                    // setNewStopId(sortedStops.length+1);
                                    console.log('Selected airport:', newValue);
                                    setSortedStops(newValue);
                                }}
                                renderTags={(tagValue, getTagProps) =>
                                    tagValue.map((option, index) => (
                                        <Chip
                                            label={option} // Display only AirportCode here
                                            {...getTagProps({ index })}
                                        />
                                    ))
                                }
                                renderInput={(params) => <TextField {...params} label="选择机场" margin="normal" fullWidth />}
                            /> 
                            <Button type="submit" variant="contained" color="primary">
                                    {'插入经停机场'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* 选中航班的产品管理模块 */}
            {selectedFlight && (
                <Box>
                    {/* <Typography variant="h6" gutterBottom>航班：{selectedFlight.FlightID}</Typography> */}

                    {/* 经停机场 */}
                    {/* <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1">经停机场 ({sortedStops.length} 个)</Typography>
                        <Typography>顺序：{sortedStops.map(stop => stop.AirportCode).join(' → ')}</Typography>
                    </Box> */}

                    {/* 产品管理 */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>航线产品管理</Typography>
                        <Box component="form" onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct} sx={{ mb: 3 }}>
                            <Autocomplete
                                options={adjacentAirports}
                                getOptionLabel={(option) => `${option.departure.AirportCode} → ${option.arrival.AirportCode}`}
                                value={departureAirport && arrivalAirport ? { departure: departureAirport, arrival: arrivalAirport } : null}
                                onChange={(e, value) => {
                                    if (value) {
                                        setDepartureAirport(value.departure);
                                        setArrivalAirport(value.arrival);
                                    } else {
                                        setDepartureAirport(null);
                                        setArrivalAirport(null);
                                    }
                                }}
                                renderInput={(params) => <TextField {...params} label="选择航线" margin="normal" fullWidth />}
                            />
                            <Autocomplete
                                options={['Economy', 'Firstclass']}
                                value={cabinClass}
                                onChange={(event, newValue) => {
                                    setCabinClass(newValue);
                                }}
                                renderInput={(params) => (
                                    <TextField
                                    {...params}
                                    label="舱位"
                                    margin="normal"
                                    fullWidth
                                    />
                                )}
                            />
                            <TextField
                                label="价格（元）"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                margin="normal"
                                fullWidth
                            />
                            <TextField
                                label="折扣（%）"
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(e.target.value)}
                                margin="normal"
                                fullWidth
                            />
                            <Box sx={{ mt: 2 }}>
                                <Button type="submit" variant="contained" color="primary">
                                    {selectedProduct ? '更新产品' : '添加产品'}
                                </Button>
                                {selectedProduct && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => { setSelectedProduct(null); resetProductForm(); }}
                                        sx={{ ml: 2 }}
                                    >
                                        取消编辑
                                    </Button>
                                )}
                            </Box>
                        </Box>

                        {/* 产品列表 */}
                        <Typography variant="subtitle1">现有产品 ({products.length} 个)</Typography>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>航线</TableCell>
                                        <TableCell>舱位</TableCell>
                                        <TableCell>价格</TableCell>
                                        <TableCell>折扣</TableCell>
                                        <TableCell>操作</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.PricingID}>
                                            <TableCell>{product.DepartureAirportID} → {product.ArrivalAirportID}</TableCell>
                                            <TableCell>{product.CabinLevel}</TableCell>
                                            <TableCell>¥{product.Price}</TableCell>
                                            <TableCell>{product.DiscountRate}%</TableCell>
                                            <TableCell>
                                                <Button onClick={() => handleEditProduct(product)} color="primary">编辑</Button>
                                                <Button onClick={() => handleDeleteProduct(product.PricingID)} color="secondary">删除</Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default FlightScheduling;