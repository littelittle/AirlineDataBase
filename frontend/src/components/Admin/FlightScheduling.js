import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlightScheduling = () => {
    // 航班状态
    const [flights, setFlights] = useState([]);
    const [selectedFlight, setSelectedFlight] = useState(null);

    // 经停机场状态
    const [stops, setStops] = useState([]);
    const [sortedStops, setSortedStops] = useState([]);

    // 产品状态
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [departureAirport, setDepartureAirport] = useState('');
    const [arrivalAirport, setArrivalAirport] = useState('');
    const [cabinClass, setCabinClass] = useState('');
    const [price, setPrice] = useState('');
    const [discount, setDiscount] = useState('');
    const [adjacentAirports, setAdjacentAirports] = useState([]);

    // 获取所有航班数据
    const fetchFlights = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/flights`);
            setFlights(response.data);
        } catch (error) {
            console.error('获取航班数据失败:', error);
        }
    };

    // 获取指定航班的经停机场数据
    const fetchStops = async (flightId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/flights/${flightId}/airports`);
            const sorted = response.data.sort((a, b) => a.StopOrder - b.StopOrder);
            setStops(sorted);
            setSortedStops(sorted);
            generateAdjacentRoutes(sorted);
        } catch (error) {
            console.error('获取经停机场数据失败:', error);
        }
    };

    // 获取指定航班的产品数据
    const fetchProducts = async (flightId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/products/${flightId}`);
            setProducts(response.data);
        } catch (error) {
            console.error('获取产品数据失败:', error);
        }
    };

    // 生成相邻机场航线
    const generateAdjacentRoutes = (stops) => {
        const routes = [];
        for (let i = 0; i < stops.length - 1; i++) {
            routes.push({
                departure: stops[i].AirportCode,
                arrival: stops[i + 1].AirportCode
            });
        }
        setAdjacentAirports(routes);
    };

    // 处理编辑航班操作
    const handleEditFlight = (flight) => {
        setSelectedFlight(flight);
        Promise.all([
            fetchStops(flight.FlightID),
            fetchProducts(flight.FlightID)
        ]);
    };

    // 处理添加产品操作
    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!validateProduct()) return;

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/create-product`, {
                flightID: selectedFlight.FlightID,
                departureAirport,
                arrivalAirport,
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

    // 处理编辑产品操作
    const handleEditProduct = (product) => {
        console.log(product)
        setSelectedProduct(product);
        setDepartureAirport(product.DepartureAirportID);
        setArrivalAirport(product.ArrivalAirportID);
        setCabinClass(product.CabinLevel);
        setPrice(product.Price.toString());
        setDiscount(product.DiscountRate.toString());
    };

    // 处理更新产品操作
    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        if (!validateProduct()) return;

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/update-product/${selectedProduct.PricingID}`, {
                flightID:selectedFlight.FlightID,
                departureAirport,
                arrivalAirport,
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

    // 处理删除产品操作
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

    // 验证产品信息
    const validateProduct = () => {
        if (!selectedFlight) {
            alert('请先选择航班');
            return false;
        }
        if (!departureAirport || !arrivalAirport) {
            alert('请选择合法航线');
            return false;
        }
        if (!cabinClass || isNaN(parseFloat(price)) || isNaN(parseFloat(discount))) {
            alert('请填写有效参数');
            return false;
        }
        return true;
    };

    // 重置产品表单
    const resetProductForm = () => {
        setDepartureAirport('');
        setArrivalAirport('');
        setCabinClass('');
        setPrice('');
        setDiscount('');
    };

    useEffect(() => {
        fetchFlights();
    }, []);

    return (
        <div style={{ padding: '20px' }}>
            <h1>航班与产品管理系统</h1>

            {/* 航班列表 */}
            <div style={{ marginBottom: '20px' }}>
                <h2>航班列表</h2>
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th>航班号</th>
                            <th>机型</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flights.map((flight) => (
                            <tr key={flight.FlightID}>
                                <td>{flight.FlightID}</td>
                                <td>{flight.AircraftType}</td>
                                <td>
                                    <button onClick={() => handleEditFlight(flight)}>编辑</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* 选中航班的管理模块 */}
            {selectedFlight && (
                <div>
                    <h2>航班：{selectedFlight.FlightID}</h2>

                    {/* 经停机场 */}
                    <div style={{ marginBottom: '20px' }}>
                        <h3>经停机场 ({sortedStops.length} 个)</h3>
                        <p>顺序：{sortedStops.map(stop => stop.AirportCode).join(' → ')}</p>
                    </div>

                    {/* 产品管理 */}
                    <div>
                        <h3>航线产品管理</h3>
                        <form onSubmit={selectedProduct ? handleUpdateProduct : handleAddProduct}>
                            <div style={{ marginBottom: '10px' }}>
                                <label>选择航线：</label>
                                <select
                                    value={`${departureAirport},${arrivalAirport}`}
                                    onChange={(e) => {
                                        const [dep, arr] = e.target.value.split(',');
                                        setDepartureAirport(dep);
                                        setArrivalAirport(arr);
                                    }}
                                >
                                    <option value="">请选择合法航线</option>
                                    {adjacentAirports.map((route, index) => (
                                        <option key={index} value={`${route.departure},${route.arrival}`}>
                                            {route.departure} → {route.arrival}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div style={{ marginBottom: '10px' }}>
                                <input
                                    type="text"
                                    placeholder="舱位"
                                    value={cabinClass}
                                    onChange={(e) => setCabinClass(e.target.value)}
                                    style={{ marginRight: '10px' }}
                                />
                                <input
                                    type="number"
                                    placeholder="价格（元）"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    style={{ marginRight: '10px' }}
                                />
                                <input
                                    type="number"
                                    placeholder="折扣（如8.5）"
                                    value={discount}
                                    onChange={(e) => setDiscount(e.target.value)}
                                />
                            </div>

                            <button type="submit">
                                {selectedProduct ? '更新产品' : '添加产品'}
                            </button>
                            {selectedProduct && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedProduct(null)}
                                    style={{ marginLeft: '10px' }}
                                >
                                    取消编辑
                                </button>
                            )}
                        </form>

                        {/* 产品列表 */}
                        <h4>现有产品 ({products.length} 个)</h4>
                        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th>航线</th>
                                    <th>舱位</th>
                                    <th>价格</th>
                                    <th>折扣</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.PricingID}>
                                        <td>{product.DepartureAirportID} → {product.ArrivalAirportID}</td>
                                        <td>{product.CabinLevel}</td>
                                        <td>¥{product.Price}</td>
                                        <td>{product.DiscountRate} 折</td>
                                        <td>
                                            <button
                                                onClick={() => handleEditProduct(product)}
                                                style={{ marginRight: '5px', backgroundColor: '#4CAF50', color: 'white' }}
                                            >
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.PricingID)}
                                                style={{ color: 'red', backgroundColor: 'transparent', border: 'none' }}
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlightScheduling;