import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

const AirportManaging = () => {
  const [airportCode, setAirportCode] = useState('');
  const [cityID, setCityID] = useState('');
  const [airportName, setAirportName] = useState('');
  const [airports, setAirports] = useState([]);
  const [selectedAirport, setSelectedAirport] = useState(null);

  const fetchAirports = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/airports`);
      setAirports(response.data);
    } catch (error) {
      console.error('获取机场信息失败', error);
    }
  };

  useEffect(() => {
    fetchAirports();
  }, []);

  const handleAddAirport = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport`, {
        AirportCode: airportCode,
        CityID: cityID,
        Name: airportName
      });
      alert('机场添加成功');
      fetchAirports();
      setAirportCode('');
      setCityID('');
      setAirportName('');
    } catch (error) {
      console.error('机场添加失败', error);
    }
  };

  const handleDeleteAirport = async (AirportCode) => {
    if (window.confirm('确定要删除这个机场吗？')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport/${AirportCode}`);
        alert('机场删除成功');
        fetchAirports();
      } catch (error) {
        console.error('机场删除失败', error);
      }
    }
  };

  const handleEditAirport = (airport) => {
    setSelectedAirport(airport);
    setAirportCode(airport.AirportCode);
    setCityID(airport.CityID);
    setAirportName(airport.Name);
  };

  const handleUpdateAirport = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/admin/manage-airport/${selectedAirport.AirportCode}`, {
        CityID: cityID,
        Name: airportName
      });
      alert('机场信息更新成功');
      fetchAirports();
      setSelectedAirport(null);
      setAirportCode('');
      setCityID('');
      setAirportName('');
    } catch (error) {
      console.error('机场信息更新失败', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>机场管理</Typography>
      <Box component="form" onSubmit={selectedAirport ? handleUpdateAirport : handleAddAirport} sx={{ mb: 3 }}>
        <TextField
          label="机场代码"
          value={airportCode}
          onChange={(e) => setAirportCode(e.target.value)}
          margin="normal"
          fullWidth
        />
        <TextField
          label="城市 ID"
          value={cityID}
          onChange={(e) => setCityID(e.target.value)}
          margin="normal"
          fullWidth
        />
        <TextField
          label="机场名称"
          value={airportName}
          onChange={(e) => setAirportName(e.target.value)}
          margin="normal"
          fullWidth
        />
        <Box sx={{ mt: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            {selectedAirport ? '更新机场' : '添加机场'}
          </Button>
          {selectedAirport && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setSelectedAirport(null)}
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
              <TableCell>机场代码</TableCell>
              <TableCell>城市 ID</TableCell>
              <TableCell>机场名称</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {airports.map((airport) => (
              <TableRow key={airport.id}>
                <TableCell>{airport.AirportCode}</TableCell>
                <TableCell>{airport.CityID}</TableCell>
                <TableCell>{airport.Name}</TableCell>
                <TableCell>
                  <Button onClick={() => handleEditAirport(airport)} color="primary">编辑</Button>
                  <Button onClick={() => handleDeleteAirport(airport.AirportCode)} color="secondary">删除</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AirportManaging;