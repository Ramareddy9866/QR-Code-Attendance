import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton
} from '@mui/material';
import { AccountCircle, Logout } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage =
    location.pathname === '/login' ||
    location.pathname === '/register' ||
    location.pathname === '/forgot-password' ||
    location.pathname === '/reset-password';

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, cursor: 'pointer', fontWeight: 'bold', ml: 4 }}
          onClick={() => {
            if (!user) {
              navigate('/login');
            } else if (user.role === 'admin') {
              navigate('/admin');
            } else {
              navigate('/student');
            }
          }}
          aria-label="Go to dashboard"
        >
          QRCodeAttendance
        </Typography>
        {!isAuthPage && user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title={user.email} arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'default' }}>
                <AccountCircle sx={{ mr: 1 }} />
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, display: { xs: 'none', sm: 'block' } }}
                >
                  {user.name}
                </Typography>
              </Box>
            </Tooltip>
            <Tooltip title="Logout" arrow>
              <IconButton color="inherit" onClick={logout} aria-label="Logout">
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
