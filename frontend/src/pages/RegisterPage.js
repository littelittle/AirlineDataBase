// src/components/RegisterPage.js (or your preferred path)
import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import { Button, Container, Card, CardContent, Typography, Stack, TextField, Alert, CircularProgress, Link } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd'; // Using a different icon

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('所有字段均为必填项');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    // Optional: Add more complex password validation here (length, characters, etc.)

    try {
      console.log(username, password)
      const result = await register({username, password});
      if (result.success) {
        setSuccessMessage(result.message + ' 3秒后将跳转到登录页面...');
        // Clear form
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
      // No 'else' here because register function throws an error on failure
    } catch (err) {
      setError(err.message || '注册过程中发生未知错误，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Card sx={{ p: 4, textAlign: 'center' }}>
        <CardContent>
          <PersonAddIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            创建新账户
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            欢迎加入航空订票系统
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                fullWidth
                variant="outlined"
                required
                disabled={isLoading}
              />
              <TextField
                label="密码"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                variant="outlined"
                required
                disabled={isLoading}
              />
              <TextField
                label="确认密码"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                variant="outlined"
                required
                disabled={isLoading}
              />
              {error && <Alert severity="error" sx={{ textAlign: 'left' }}>{error}</Alert>}
              {successMessage && <Alert severity="success" sx={{ textAlign: 'left' }}>{successMessage}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading || !!successMessage} // Disable if loading or success message is shown
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                fullWidth
              >
                {isLoading ? '注册中...' : '注册'}
              </Button>
              <Typography variant="body2" sx={{ mt: 2 }}>
                已经有账户了?{' '}
                <Link component={RouterLink} to="/login" underline="hover">
                  点此登录
                </Link>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default RegisterPage;