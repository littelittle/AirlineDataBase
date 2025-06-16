import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button, Alert } from '@mui/material';

const ProductQuery = () => {
    const [searchParams] = useSearchParams();
    const departure = searchParams.get('departure');
    const arrival = searchParams.get('arrival');
    const flightDate = searchParams.get('flightDate')
    const [products, setProducts] = useState([]);
    // const [error, setError] = useState(null);
    const [validday, setvalidday] = useState(false);
    const navigate = useNavigate();

    const getDayOfWeekString = (dateString) => {
        const date = new Date(dateString);
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    };
    useEffect(() => {
        const weekday = getDayOfWeekString(flightDate);        
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passenger/products`, {
                    params: { departureAirportID: departure, arrivalAirportID: arrival, weekday}
                });
                console.error(response.data)
                setProducts(response.data || []);
                // setError(null);
                if (response.status===200 && response.data.length > 0) {
                    setvalidday(true);
                }
            } catch (error) {
                console.error('获取产品列表失败', error);
                // setError('无法加载产品数据：' + (error.response?.data?.error || error.message));
            }
        };
        if (departure && arrival) {
            fetchProducts();
        }
    }, [departure, arrival]);

    const handleSelectProduct = (productId, WeeklyFlightDays, price) => {
        if (!validday) {
            navigate(`/passenger/transaction/${productId}/${WeeklyFlightDays}`,{
                state: { price, } // Pass flightDate to the transaction page
            });
        }
        else {
            navigate(`/passenger/transaction/${productId}/${WeeklyFlightDays}`, {
                state: { flightDate,  price,} // Pass flightDate to the transaction page
            });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            {/* {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>} */}
            {products.length === 0 ? (
                <>
                    <Typography variant="h5" gutterBottom>暂无可用产品</Typography>
                    <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(-1)} // Navigate back one step
                    >
                        返回
                    </Button>
                </>
            ) : (
                <>
                {validday ? (
                    <Typography variant="h5" gutterBottom>航班日期: {flightDate} ({getDayOfWeekString(flightDate)})</Typography>
                ) : (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        所选日期均不在航班运行日内，请选择其他日期，以下为其他时段航班信息：
                    </Alert>
                )}
                {products.map((product) => (
                <Box>
                    <Card key={product.PricingID} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {product.FlightID}: {product.DepartureAirportName} → {product.ArrivalAirportName}
                            </Typography>
                            <Typography color="text.secondary">
                                舱位: {product.CabinLevel}
                            </Typography>
                            <Typography color="text.secondary">
                                价格: ¥{product.Price*(1-0.01*product.DiscountRate)} (原价:¥{product.Price}, 折扣:{product.DiscountRate}%)
                            </Typography>
                            <Typography color="text.secondary">
                                飞行日: {product.WeeklyFlightDays}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSelectProduct(product.PricingID, product.WeeklyFlightDays, product.Price*(1-0.01*product.DiscountRate))}
                            >
                                选择
                            </Button>
                        </CardActions>
                    </Card>
                </Box>
                ))}
                </>
            )}
        </Box>
    );
};

export default ProductQuery;