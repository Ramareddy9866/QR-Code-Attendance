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
  CircularProgress,
  Container
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { enGB } from 'date-fns/locale';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const QRCodeGenerator = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date());
  const [expiresAt, setExpiresAt] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);

  useEffect(() => {
    // Get subjects and sessions when page loads
    const fetchSubjects = async () => {
      try {
        const response = await api.get('/admin/subjects');
        setSubjects(response.data);
      } catch {
        setError('Failed to fetch subjects');
      }
    };
    fetchSubjects();
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await api.get('/admin/sessions');
      setSessions(response.data.filter(s => s.status === 'active' || s.status === 'upcoming'));
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const getCurrentLocation = () => {
    // Get user's current location
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
    // Validate form before sending
    if (!selectedSubject || !date || !expiresAt) {
      setError('Subject, date, and expiry time are required');
      return;
    }

    const roundToMinute = (d) => {
      // Remove seconds and ms
      const newDate = new Date(d);
      newDate.setSeconds(0, 0);
      return newDate;
    };
    const start = roundToMinute(date);
    const end = roundToMinute(expiresAt);
    const now = roundToMinute(new Date());

    if (start < now) {
      setError('Start time must be now or in the future.');
      return;
    }
    if (start >= end) {
      setError('Start time must be before end time.');
      return;
    }
    const diffMinutes = (end - start) / (1000 * 60);
    if (diffMinutes < 30) {
      setError('The session must be at least 30 minutes long.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Get location and send request to backend
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);

      const response = await api.post(
        '/admin/session',
        {
          subjectId: selectedSubject,
          date: start.toISOString(),
          expiresAt: end.toISOString(),
          lat: currentLocation.lat,
          lng: currentLocation.lng
        }
      );

      setSuccess('QR Code generated successfully');
      fetchSessions(); // Refresh sessions after generating
    } catch (err) {
      setError(err.response?.data?.msg || err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  GENERATE QR-CODE
</Typography>

        {/* Show QR generator and active QR code */}
        <Grid container spacing={3} sx={{ mb: 4 }} alignItems="center">
          <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            {/* QR Code Generator Form */}
        <Paper
          sx={{
            p: { xs: 2, md: 4 },
                width: '100%',
            maxWidth: '100%',
            mx: 'auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
          >
              <Box display="flex" flexDirection="column" gap={2} flex={1}>
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

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                  <DateTimePicker
                    label="Session Date"
                    value={date}
                    onChange={setDate}
                    inputFormat="dd/MM/yyyy"
                    renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={enGB}>
                  <DateTimePicker
                    label="Expires At"
                    value={expiresAt}
                    onChange={setExpiresAt}
                    inputFormat="dd/MM/yyyy"
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
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Active QR Code */}
            <Paper sx={{
              p: 3,
              maxWidth: 400,
              mx: { xs: 'auto', md: 0 },
              height: '100%',
              minHeight: 200,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'center',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-6px)',
                boxShadow: 6,
              },
              borderLeft: '6px solid #2e7d32',
            }}>
              <Typography variant="h6" sx={{ mb: 1, mt: -1, fontWeight: 'bold', textAlign: 'center', width: '100%' }}>
                Active QR Code
              </Typography>
              {loadingSessions ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2, width: '100%' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : sessions.filter(s => s.status === 'active').length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                  <Typography color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>No active session.</Typography>
                </Box>
              ) : (
                (() => {
                  const session = sessions.find(s => s.status === 'active');
                  return (
                    <>
                      {session.encryptedId && (
                        <Box sx={{ mb: 2, mt: 2, textAlign: 'center' }}>
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?data=${session.encryptedId}&size=150x150`}
                            alt="QR Code"
                            style={{ width: 150, height: 150, maxWidth: '100%' }}
                          />
                        </Box>
                      )}
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, textAlign: 'center', width: '100%' }}>{session.subject?.name || 'Subject'}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {`From: ${new Date(session.date).toLocaleString()}`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {`To: ${new Date(session.expiresAt).toLocaleString()}`}
                        </Typography>
                      </Box>
                    </>
                  );
                })()
              )}
            </Paper>
          </Grid>
            </Grid>

        {/* Upcoming QR Codes Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
            Upcoming QR Codes
          </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  QR codes for upcoming sessions will appear when the session starts.
          </Typography>
          {loadingSessions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : sessions.filter(s => s.status === 'upcoming').length === 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 120, width: '100%' }}>
              <Typography color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>No upcoming sessions.</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {sessions.filter(s => s.status === 'upcoming').map((session) => (
                <Grid item xs={12} md={6} key={session._id}>
                  <Paper sx={{
                    p: 2,
                    mb: 2,
                    borderLeft: '6px solid #1976d2',
                    boxShadow: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: 6,
                    },
                  }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{session.subject?.name || 'Subject'}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`From: ${new Date(session.date).toLocaleString()}`}
                  </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {`To: ${new Date(session.expiresAt).toLocaleString()}`}
                  </Typography>
                </Paper>
                </Grid>
              ))}
              </Grid>
            )}
        </Paper>

        <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
        <CustomSnackbar open={!!success} onClose={() => setSuccess('')} message={success} severity="success" autoHideDuration={3000} />
      </Box>
    </Container>
  );
};

export default QRCodeGenerator;
