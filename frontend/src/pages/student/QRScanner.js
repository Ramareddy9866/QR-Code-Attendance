import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import { Html5QrcodeScanner } from 'html5-qrcode';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import CustomSnackbar from '../../components/CustomSnackbar';

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
    }); // Get user's current location

  useEffect(() => {
    let scanner = null;

    if (scanning) {
      scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 10 });
      scanner.render(onScanSuccess, () => {}); // Start QR scanner
    }

    return () => {
      if (scanner) {
        scanner.clear(); // Clean up scanner
      }
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText) => {
    try {
      setLoading(true);
      setError('');

      const location = await getCurrentLocation(); // Get location for attendance
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

      const requestData = {
        encryptedId: decodedText,
        lat: Number(location.lat),
        lng: Number(location.lng)
      };

      await api.post('/student/mark-attendance', requestData); // Send attendance to backend

      setSuccess('Attendance marked successfully');
      setTimeout(() => navigate('/student'), 2000); // Go to dashboard after success
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to mark attendance';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  SCAN QR-CODE
</Typography>

      {!scanning ? (
        <Button
          variant="contained"
          onClick={() => setScanning(true)}
          size="large"
          disabled={loading}
          sx={{ width: '100%', maxWidth: '300px', margin: '0 auto', display: 'block' }}
        >
          Start Scanning
        </Button>
      ) : (
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
          <Box>
            <div id="reader" style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}></div>
            {loading && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress size={24} sx={{ mr: 1 }} />
                <Typography variant="body2">Processing...</Typography>
              </Box>
            )}
            <Button variant="outlined" onClick={() => setScanning(false)} sx={{ mt: 2 }} disabled={loading} fullWidth>
              Stop Scanning
            </Button>
          </Box>
        </Paper>
      )}

      <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
      <CustomSnackbar open={!!success} onClose={() => setSuccess('')} message={success} severity="success" autoHideDuration={3000} />
    </Box>
  );
};

export default QRScanner;
