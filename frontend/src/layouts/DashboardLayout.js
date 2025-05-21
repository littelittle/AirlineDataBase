import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box, Drawer, CssBaseline, AppBar, Toolbar, List, Typography,
  Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText
} from '@mui/material';
import {
  Menu, ChevronLeft, ChevronRight, Logout, 
  ManageAccounts, Flight, LocationCity, AttachMoney,
  Person, Search, ConfirmationNumber
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const adminMenuItems = [
  { text: '城市管理', path: '/admin/cities', icon: <LocationCity /> },
  { text: '机场管理', path: '/admin/airports', icon: <Flight /> },
  { text: '航班调度', path: '/admin/flights', icon: <ManageAccounts /> },
  { text: '交易记录', path: '/admin/transactions', icon: <AttachMoney /> }
];

const passengerMenuItems = [
  { text: '我的信息', path: '/passenger/profile', icon: <Person /> },
  { text: '查询航班', path: '/passenger/search', icon: <Search /> },
  { text: '我的订单', path: '/passenger/tickets', icon: <ConfirmationNumber /> }
];

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { auth, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = auth.role === 'admin' ? adminMenuItems : passengerMenuItems;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={open ? handleDrawerClose : handleDrawerOpen}
            edge="start"
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {auth.role === 'admin' ? '航空管理系统' : '乘客服务平台'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
            <Typography color="inherit" sx={{ ml: 1 }}>登出</Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', padding: theme.spacing(0, 1), ...theme.mixins.toolbar, justifyContent: 'flex-end' }}>
          <IconButton onClick={handleDrawerClose}>
            {theme.direction === 'ltr' ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              key={item.path} 
              disablePadding
              selected={location.pathname === item.path}
            >
              <ListItemButton onClick={() => navigate(item.path)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box sx={{ ...theme.mixins.toolbar }} />
        {children}
      </Box>
    </Box>
  );
}