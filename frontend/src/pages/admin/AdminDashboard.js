import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Container
} from '@mui/material';
import {
  Subject as SubjectIcon,
  QrCode as QrCodeIcon,
  Assessment as AssessmentIcon,
  Block as BlockIcon,
  PersonAdd as PersonAddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const dashboardItems = [
  {
    title: 'Manage Subjects',
    description: 'Create, view, and manage subjects',
    icon: <SubjectIcon sx={{ fontSize: 40 }} />,
    path: '/admin/subjects',
    color: '#1976d2'
  },
  {
    title: 'Enroll Students',
    description: 'Add and manage student enrollments',
    icon: <PersonAddIcon sx={{ fontSize: 40 }} />,
    path: '/admin/students',
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
    color: '#ed6c02'
  },
  {
    title: 'Invalidate QR',
    description: 'End active attendance sessions',
    icon: <BlockIcon sx={{ fontSize: 40 }} />,
    path: '/admin/invalidate',
    color: '#d32f2f'
  }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSubjects: 0, activeSessions: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const [subjectsRes, sessionsRes] = await Promise.all([
        axios.get('/api/admin/subjects', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/admin/sessions', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const activeSessions = sessionsRes.data.filter(session => session.isActive);

      setStats({
        totalSubjects: subjectsRes.data.length,
        activeSessions: activeSessions.length
      });
    } catch {
      setError('Failed to fetch dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 1 }}>
      <Box sx={{ py: 1 }}>
        <Typography variant="h4" align="center" sx={{ mb: 2, fontWeight: 'bold' }}>
          ADMIN DASHBOARD
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={fetchStats}
            disabled={loading}
            variant="outlined"
          >
            Refresh
          </Button>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                Total Subjects
              </Typography>
              <Typography variant="h4">{stats.totalSubjects}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="primary" sx={{ mb: 1 }}>
                Active Sessions
              </Typography>
              <Typography variant="h4">{stats.activeSessions}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          {dashboardItems.map(({ title, description, icon, path, color }) => (
            <Grid item xs={12} sm={6} md={2.4} key={title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                    '& .MuiCardContent-root': {
                      backgroundColor: `${color}10`
                    }
                  }
                }}
              >
                <CardContent
                  sx={{ flexGrow: 1, textAlign: 'center', transition: 'background-color 0.3s ease' }}
                >
                  <Box sx={{ color, mb: 1.5 }}>{icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ minHeight: '40px' }}>
                    {description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => navigate(path)}
                    aria-label={`Access ${title}`}
                    sx={{
                      bgcolor: color,
                      height: '40px',
                      '&:hover': {
                        bgcolor: color,
                        opacity: 0.9
                      }
                    }}
                  >
                    Access
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
