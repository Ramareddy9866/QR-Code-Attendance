import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Container
} from '@mui/material';
import {
  Subject as SubjectIcon,
  QrCode as QrCodeIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const dashboardItems = [
  {
    title: 'Manage Subjects',
    description: 'Create, view, and manage subjects',
    icon: <SubjectIcon sx={{ fontSize: 40 }} />,
    path: '/admin/subjects',
    color: '#ff9800' // orange
  },
  {
    title: 'Enroll Students',
    description: 'Add and manage student enrollments',
    icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
    path: '/admin/enroll',
    color: '#9c27b0'
  },
  {
    title: 'Generate QR Code',
    description: 'Create new attendance sessions with QR codes',
    icon: <QrCodeIcon sx={{ fontSize: 40 }} />,
    path: '/admin/generate',
    color: '#2e7d32'
  },
  {
    title: 'Attendance Logs',
    description: 'View and analyze attendance records',
    icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
    path: '/admin/logs',
    color: '#00bcd4' // cyan
  },
  {
    title: 'Invalidate QR',
    description: 'End active attendance sessions',
    icon: <BlockIcon sx={{ fontSize: 40 }} />,
    path: '/admin/invalidate',
    color: '#f44336'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  ADMIN DASHBOARD
</Typography>

      {/* Show dashboard cards */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 3 }}>
          {dashboardItems.slice(0, 3).map((item, idx) => (
            <Card
              key={idx}
              sx={{
                boxShadow: 3,
                borderLeft: `8px solid ${item.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                height: 200,
                width: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.04)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{
                p: 2,
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                ...(item.title === 'Generate QR Code' ? { mt: 2 } : {})
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
        {/* Second row of cards */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 3 }}>
          <Box sx={{ width: 140 }} />
          {dashboardItems.slice(3, 5).map((item, idx) => (
            <Card
              key={idx + 3}
              sx={{
                boxShadow: 3,
                borderLeft: `8px solid ${item.color}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
                height: 200,
                width: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'stretch',
                alignItems: 'center',
                '&:hover': {
                  transform: 'translateY(-8px) scale(1.04)',
                  boxShadow: 6
                }
              }}
              onClick={() => navigate(item.path)}
            >
              <CardContent sx={{
                p: 2,
                textAlign: 'center',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                  {item.icon}
                </Box>
                <Typography variant="h6" sx={{ mt: 1, mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {item.description}
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
              </CardContent>
            </Card>
          ))}
          <Box sx={{ width: 140 }} />
        </Box>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
