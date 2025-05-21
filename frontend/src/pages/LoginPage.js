import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Container, Card, CardContent, Typography, Stack, TextField } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState('');

  const handleAdminLogin = () => {
    if (!idNumber.trim()) {
      alert('请输入身份证号');
      return;
    }
    login('admin', idNumber);
    navigate('/admin');
  };

  const handlePassengerLogin = () => {
    if (!idNumber.trim()) {
      alert('请输入身份证号');
      return;
    }
    login('passenger', idNumber);
    navigate('/passenger');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CardContent>
          <FlightTakeoffIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            航空订票系统
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            请输入您的证件号并选择角色以登录
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="证件号"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              margin="normal"
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleAdminLogin}
              startIcon={<FlightTakeoffIcon />}
            >
              管理员登录
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={handlePassengerLogin}
              startIcon={<FlightTakeoffIcon />}
            >
              乘客登录
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LoginPage;