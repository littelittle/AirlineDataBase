import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CityManaging from '../components/Admin/CityManaging';
import AirportManaging from '../components/Admin/AirportManaging';
import FlightScheduling from '../components/Admin/FlightScheduling';
import TransactionRecord from '../components/Admin/TransactionRecord';
import { Typography, Box } from '@mui/material';

const AdminPage = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        航空管理者仪表板
      </Typography>
      <Routes>
        <Route path="/" element={<Typography>欢迎使用管理者仪表板，请从左侧菜单选择功能</Typography>} />
        <Route path="cities" element={<CityManaging />} />
        <Route path="airports" element={<AirportManaging />} />
        <Route path="flights" element={<FlightScheduling />} />
        <Route path="transactions" element={<TransactionRecord />} />
      </Routes>
    </Box>
  );
};

export default AdminPage;