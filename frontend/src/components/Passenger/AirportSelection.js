import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AirportSelection = () => {
  const [departureAirport, setDepartureAirport] = useState('');
  const [arrivalAirport, setArrivalAirport] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/passenger/products?departure=${departureAirport}&arrival=${arrivalAirport}`);
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">查询产品</button>
    </form>
  );
};

export default AirportSelection;    