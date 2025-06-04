import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // 导入 Link as RouterLink
import { useAuth } from '../context/AuthContext';
import { Button, Container, Card, CardContent, Typography, Stack, TextField, Alert, CircularProgress, Link } from '@mui/material'; // 导入 MUI Link
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate(); // 虽然这里主要用 Link, navigate 仍可保留
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(username, password);

      if (response.success) {
        // 登录成功后的导航逻辑通常由更高层组件或路由守卫处理
        // 这里可以简单提示，实际导航应更健壮
        // 例如，可以 navigate('/') 或特定角色页面，但这取决于 AuthContext 更新后的状态何时生效
        // 为了简单，这里假设AuthContext更新后，App.js中的路由会处理跳转
        setError('登录成功，正在跳转...');
        if (response.role === 'admin') {
          navigate('/admin'); // 管理员登录后跳转到管理面板
        } else {
          navigate('/passenger'); // 乘客登录后跳转到乘客面板
        }
      } else {
        setError('用户名或密码不正确，或登录失败');
      }
    } catch (err) {
      setError(err.message || '登录时发生错误，请稍后再试');
    } finally {
      setIsLoading(false);
    }
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
            请输入您的账户信息登录
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                margin="normal"
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
                margin="normal"
                fullWidth
                variant="outlined"
                required
                disabled={isLoading}
              />
              {error && <Alert severity="error" sx={{ textAlign: 'left' }}>{error}</Alert>}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null} // 不显示图标，或者换个登录图标
                fullWidth // 让登录按钮也占据全部宽度
              >
                {isLoading ? '登录中...' : '登录'}
              </Button>
              <Typography variant="body2" sx={{ mt: 2 }}>
                还没有账户?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                  立即注册
                </Link>
              </Typography>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

export default LoginPage;