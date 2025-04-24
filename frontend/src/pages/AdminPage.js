import React from 'react';
import CityManaging from '../components/Admin/CityManaging';
import AirportManaging from '../components/Admin/AirportManaging';
import FlightScheduling from '../components/Admin/FlightScheduling';
import ProductCreation from '../components/Admin/ProductCreation';
import TransactionRecord from '../components/Admin/TransactionRecord';

const AdminPage = () => {
  return (
    <div>
      <h1>航空管理者页面</h1>
      <CityManaging />
      <AirportManaging/>
      <FlightScheduling />
      <TransactionRecord />
    </div>
  );
};

export default AdminPage;