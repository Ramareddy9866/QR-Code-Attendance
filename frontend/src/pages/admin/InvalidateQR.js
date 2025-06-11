import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Container
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import axios from 'axios';
import { format } from 'date-fns';

const InvalidateQR = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSessions(response.data);
    } catch {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleInvalidate = async (sessionId) => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/admin/session/${sessionId}/invalidate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess('Session invalidated successfully');
      fetchSessions();
    } catch {
      setError('Failed to invalidate session');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4, fontSize: '2rem' }}>
        Invalidate QR Sessions
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: '1.2rem' }}>Subject</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>Date</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>Expires At</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>Status</TableCell>
                  <TableCell sx={{ fontSize: '1.2rem' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map(({ _id, subject, date, expiresAt, isActive }) => (
                  <TableRow key={_id}>
                    <TableCell sx={{ fontSize: '1.1rem' }}>{subject.name}</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      {format(new Date(date), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      {format(new Date(expiresAt), 'MMM dd, yyyy HH:mm')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      <Typography color={isActive ? 'success.main' : 'error.main'}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      {isActive && (
                        <Tooltip title="Invalidate Session">
                          <IconButton
                            color="error"
                            onClick={() => handleInvalidate(_id)}
                            sx={{ fontSize: '1.5rem' }}
                          >
                            <BlockIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')} sx={{ fontSize: '1.1rem' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={Boolean(success)} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ fontSize: '1.1rem' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InvalidateQR;
