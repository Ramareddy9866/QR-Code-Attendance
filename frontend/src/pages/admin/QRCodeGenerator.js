import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Container
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import axios from 'axios';

const QRCodeGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date());
  const [expiresAt, setExpiresAt] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [qrCode, setQrCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/admin/subjects', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSubjects(response.data);
      } catch {
        setError('Failed to fetch subjects');
      }
    };
    fetchSubjects();
  }, []);

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
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
        () => {
          reject(new Error('Unable to retrieve your location'));
        }
      );
    });
  };

  const handleGenerateQR = async () => {
    if (!selectedSubject || !date || !expiresAt) {
      setError('Subject, date, and expiry time are required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        '/api/admin/session',
        {
          subjectId: selectedSubject,
          date: date.toISOString(),
          expiresAt: expiresAt.toISOString(),
          lat: currentLocation.lat,
          lng: currentLocation.lng
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setQrCode(response.data.qrCode);
      setSuccess('QR Code generated successfully');
    } catch (err) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
        <Typography variant="h4" align="center" sx={{ mb: 4 }}>
          Generate QR Code
        </Typography>

        <Paper sx={{ p: { xs: 2, md: 4 } }}>
          <Grid container spacing={3} direction={{ xs: 'column', md: 'row' }}>
            <Grid item xs={12} md={6}>
              <Box display="flex" flexDirection="column" gap={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Subject</InputLabel>
                  <Select
                    value={selectedSubject}
                    label="Select Subject"
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    {subjects.map(({ _id, name }) => (
                      <MenuItem key={_id} value={_id}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Session Date"
                    value={date}
                    onChange={setDate}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DateTimePicker
                    label="Expires At"
                    value={expiresAt}
                    onChange={setExpiresAt}
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>

                <Button
                  variant="contained"
                  onClick={handleGenerateQR}
                  fullWidth
                  size="medium"
                  disabled={loading}
                  sx={{ mt: 1 }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      Getting Location...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </Box>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
            >
              {location && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Typography>
              )}

              {qrCode && (
                <Paper elevation={3} sx={{ p: 2, textAlign: 'center', width: '100%', maxWidth: 320 }}>
                  <Typography variant="h6" gutterBottom>
                    Generated QR Code
                  </Typography>
                  <img src={qrCode} alt="Session QR Code" style={{ width: '100%', maxWidth: 250 }} />
                </Paper>
              )}
            </Grid>
          </Grid>
        </Paper>

        <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => setSuccess('')}>
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default QRCodeGenerator;
