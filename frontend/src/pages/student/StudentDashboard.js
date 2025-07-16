import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent
} from '@mui/material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import HistoryIcon from '@mui/icons-material/History';
import BookIcon from '@mui/icons-material/Book';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', pt: 1, pb: 2 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12}>
        <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  STUDENT DASHBOARD
</Typography>
        </Grid>

        <Grid item xs={12} md={8} sx={{ mt: -2 }}>
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography
                variant="h5"
                sx={{ mb: 2, fontSize: '1.5rem' }}
              >
                Hello, {user?.name || 'Student'}!
              </Typography>
              <Typography
                variant="body1"
                sx={{ mb: 3, fontSize: '1.25rem' }}
              >
                Here you can mark your attendance by scanning the QR code or view your attendance history.
              </Typography>
              
              {/* Action buttons for student */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<QrCodeScannerIcon fontSize="large" />}
                  onClick={() => navigate('/student/scan')}
                  size="large"
                  sx={{ width: '100%' }}
                >
                  Scan QR Code
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<BookIcon fontSize="large" />}
                  onClick={() => navigate('/student/subjects')}
                  size="large"
                  sx={{ width: '100%' }}
                >
                  My Subjects
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<HistoryIcon fontSize="large" />}
                  onClick={() => navigate('/student/history')}
                  size="large"
                  sx={{ width: '100%' }}
                >
                  View History
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
