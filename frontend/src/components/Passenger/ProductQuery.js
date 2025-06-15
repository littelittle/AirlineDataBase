import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Card, CardContent, CardActions, Button, Alert } from '@mui/material';

const ProductQuery = () => {
    const [searchParams] = useSearchParams();
    const departure = searchParams.get('departure');
    const arrival = searchParams.get('arrival');
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/passenger/products`, {
                    params: { departureAirportID: departure, arrivalAirportID: arrival }
                });
                console.error(response.data)
                setProducts(response.data || []);
                setError(null);
            } catch (error) {
                console.error('获取产品列表失败', error);
                setError('无法加载产品数据：' + (error.response?.data?.error || error.message));
            }
        };
        if (departure && arrival) {
            fetchProducts();
        }
    }, [departure, arrival]);

    const handleSelectProduct = (productId, WeeklyFlightDays) => {
        navigate(`/passenger/transaction/${productId}/${WeeklyFlightDays}`,);
    };

    return (
        <Box sx={{ p: 3 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {products.length === 0 && !error ? (
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
                products.map((product) => (
                    <Card key={product.PricingID} sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="h6">
                                {product.FlightID}: {product.DepartureAirportName} → {product.ArrivalAirportName}
                            </Typography>
                            <Typography color="text.secondary">
                                舱位: {product.CabinLevel}
                            </Typography>
                            <Typography color="text.secondary">
                                价格: ¥{product.Price} ({product.DiscountRate}% 折扣)
                            </Typography>
                            <Typography color="text.secondary">
                                飞行日: {product.WeeklyFlightDays}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleSelectProduct(product.PricingID, product.WeeklyFlightDays)}
                            >
                                选择
                            </Button>
                        </CardActions>
                    </Card>
                ))
            )}
        </Box>
    );
};

export default ProductQuery;