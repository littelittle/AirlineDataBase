import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, Alert, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext'; // 假设你的 AuthContext 在这里，路径可能需要调整

const ProfilePage = () => {
  // 从认证上下文中获取用户信息，我们假设 auth.username 包含了后端需要的 idNumber
  const { auth } = useAuth(); 
  
  const [profile, setProfile] = useState(null); // 存储用户个人信息
  const [loading, setLoading] = useState(true); // 加载状态
  const [error, setError] = useState(null);     // 错误信息

  useEffect(() => {
    const fetchProfile = async () => {
      // 检查 auth 对象和 username 是否存在，确保有 idNumber 进行查询
      if (!auth || !auth.idNumber) {
        setError("无法获取用户ID，请登录或检查用户信息。");
        setLoading(false);
        return;
      }

      // 将 auth.username 作为 idNumber 发送给后端
      const idNumber = auth.idNumber; 
      
      try {
        setLoading(true);
        setError(null); // 清除之前的错误信息

        // 构建请求 URL
        // 注意：后端路由是 @passenger_api.route('/profile'...)，所以前端请求路径是 /passenger_api/profile
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/passenger/profile?idNumber=${idNumber}`);
        
        // 检查响应是否成功
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        // 解析 JSON 数据
        const data = await response.json();
        setProfile(data[0]); // 设置个人信息数据
      } catch (e) {
        console.error("获取个人信息失败:", e);
        setError(e.message || "加载个人信息失败，请稍后再试。");
      } finally {
        setLoading(false); // 无论成功或失败，都结束加载状态
      }
    };

    fetchProfile();
  }, [auth]); // 当 auth 对象发生变化时，重新运行 useEffect

  // --- 渲染不同状态的 UI ---

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ height: '50vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>正在加载个人信息...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body1">未找到您的个人信息。</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        个人信息
      </Typography>
      <Paper elevation={2} sx={{ p: 3 }}> {/* 使用 Paper 组件美化显示 */}
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>用户名:</strong> {profile.PassengerName}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>创建时间:</strong> {new Date(profile.created_at).toLocaleString()} {/* 格式化日期 */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>更新时间:</strong> {new Date(profile.updated_at).toLocaleString()} {/* 格式化日期 */}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          <strong>是否活跃:</strong> {profile.is_active ? '是' : '否'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ProfilePage;