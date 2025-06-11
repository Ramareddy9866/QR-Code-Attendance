import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Box
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Subject as SubjectIcon,
  QrCode as QrCodeIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const adminMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
    { text: 'Manage Subjects', icon: <SubjectIcon />, path: '/admin/subjects' },
    { text: 'Enroll Students', icon: <PersonAddIcon />, path: '/admin/enroll' },
    { text: 'Generate QR', icon: <QrCodeIcon />, path: '/admin/generate' },
    { text: 'Attendance Logs', icon: <AssessmentIcon />, path: '/admin/logs' },
    { text: 'Invalidate QR', icon: <BlockIcon />, path: '/admin/invalidate' }
  ];

  const studentMenu = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/student' },
    { text: 'My Subjects', icon: <SchoolIcon />, path: '/student/subjects' },
    { text: 'Scan QR', icon: <QrCodeIcon />, path: '/student/scan' },
    { text: 'Attendance History', icon: <AssessmentIcon />, path: '/student/history' }
  ];

  const menu = user?.role === 'admin' ? adminMenu : studentMenu;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px'
        }
      }}
    >
      <Box sx={{ overflow: 'auto', mt: 2 }}>
        <List>
          {menu.map(({ text, icon, path }) => (
            <ListItem key={text} disablePadding>
              <ListItemButton
                selected={location.pathname === path}
                onClick={() => navigate(path)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'primary.light',
                    '&:hover': { backgroundColor: 'primary.light' },
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                    '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 'bold' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
                <ListItemText primary={text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
