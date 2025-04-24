import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductCreation = () => {
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState('');
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const [cabinClass, setCabinClass] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/flights`);
        setFlights(response.data);
      } catch (error) {
        console.error('获取航班列表失败', error);
      }
    };
    fetchFlights();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/create-product', {
        flightId: selectedFlight,
        departureAirport,
        arrivalAirport,
        cabinClass,
        price,
        discount
      });
      alert('产品制定成功');
    } catch (error) {
      console.error('产品制定失败', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <select
        value={selectedFlight}
        onChange={(e) => setSelectedFlight(e.target.value)}
      >
        {flights.map((flight) => (
          <option key={flight.id} value={flight.id}>
            {flight.flightNumber}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="出发机场"
        value={departureAirport}
        onChange={(e) => setDepartureAirport(e.target.value)}
      />
      <input
        type="text"
        placeholder="到达机场"
        value={arrivalAirport}
        onChange={(e) => setArrivalAirport(e.target.value)}
      />
      <input
        type="text"
        placeholder="舱位"
        value={cabinClass}
        onChange={(e) => setCabinClass(e.target.value)}
      />
      <input
        type="number"
        placeholder="价格"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <input
        type="number"
        placeholder="折扣"
        value={discount}
        onChange={(e) => setDiscount(e.target.value)}
      />
      <button type="submit">制定产品</button>
    </form>
  );
};

export default ProductCreation;    