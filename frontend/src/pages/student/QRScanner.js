import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => reject(new Error('Unable to retrieve your location')),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });

  useEffect(() => {
    let scanner = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 10 });
      scanner.render(onScanSuccess, onScanFailure);
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      setLoading(true);
      setError('');

      const location = await getCurrentLocation();
      if (
        !location ||
        typeof location.lat !== 'number' ||
        typeof location.lng !== 'number' ||
        location.lat < -90 ||
        location.lat > 90 ||
        location.lng < -180 ||
        location.lng > 180
      ) {
        throw new Error('Invalid location data received');
      }

      const token = localStorage.getItem('token');
      const requestData = {
        encryptedId: decodedText,
        lat: Number(location.lat),
        lng: Number(location.lng)
      };

      await axios.post('/api/student/mark-attendance', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setSuccess('Attendance marked successfully');
      setTimeout(() => navigate('/student'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to mark attendance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onScanFailure = () => {};

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: 'center', fontSize: '2rem' }}>
        Scan QR Code
      </Typography>

      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        {!scanning ? (
          <Button
            variant="contained"
            onClick={() => setScanning(true)}
            size="large"
            disabled={loading}
            sx={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Processing...
              </>
            ) : (
              'Start Scanning'
            )}
          </Button>
        ) : (
          <Box>
            <div id="reader" style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}></div>
            <Button variant="outlined" onClick={() => setScanning(false)} sx={{ mt: 2 }} disabled={loading} fullWidth>
              Stop Scanning
            </Button>
          </Box>
        )}
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} sx={{ bottom: '70px' }}>
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} sx={{ bottom: '60px' }}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default QRScanner;
