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
  CircularProgress,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import { Block as BlockIcon } from '@mui/icons-material';
import api from '../../api';
import { format } from 'date-fns';
import CustomSnackbar from '../../components/CustomSnackbar';

const InvalidateQR = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [sessionToInvalidate, setSessionToInvalidate] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/sessions');
      setSessions(response.data);
    } catch {
      setError('Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(); // Get sessions when page loads
  }, []);

  const handleInvalidateClick = (sessionId) => {
    setSessionToInvalidate(sessionId); // Store session to invalidate
    setConfirmDialogOpen(true); // Open confirm dialog
  };

  const handleConfirmInvalidate = async () => {
    if (!sessionToInvalidate) return;
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/session/${sessionToInvalidate}/invalidate`, {}); // Invalidate session in backend
      setSuccess('Session invalidated and deleted');
      setSessions(prev => prev.filter(s => s._id !== sessionToInvalidate)); // Remove from list
    } catch {
      setError('Failed to invalidate session');
    } finally {
      setConfirmDialogOpen(false);
      setSessionToInvalidate(null);
    }
  };

  const handleCancelInvalidate = () => {
    setConfirmDialogOpen(false); // Close dialog
    setSessionToInvalidate(null); // Clear selected session
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  INVALIDATE QR SESSIONS
</Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          {sessions.filter(({ status }) => status === 'active' || status === 'upcoming').length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary" sx={{ fontSize: '1.15rem' }}>
                There are no QR codes to invalidate at this time.
              </Typography>
            </Box>
          ) : (
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
                  {sessions
                    .filter(({ status }) => status === 'active' || status === 'upcoming')
                    .map(({ _id, subject, date, expiresAt, isActive, status }) => (
                    <TableRow key={_id}>
                      <TableCell sx={{ fontSize: '1.1rem' }}>{subject.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {format(new Date(date), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {format(new Date(expiresAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {status === 'upcoming' && (
                          <Typography color="primary.main">Upcoming</Typography>
                        )}
                        {status === 'active' && (
                          <Typography color="success.main">Active</Typography>
                        )}
                        {status === 'expired' && (
                          <Typography color="error.main">Expired</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>
                        {(status === 'active' || status === 'upcoming') && (
                          <Tooltip title="Invalidate Session">
                            <IconButton
                              color="error"
                              onClick={() => handleInvalidateClick(_id)}
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
          )}
        </Paper>
      )}

      {/* Dialog to confirm session invalidation */}
      <Dialog open={confirmDialogOpen} onClose={handleCancelInvalidate}>
        <DialogTitle>Confirm Invalidate Session</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to invalidate (delete) this session? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelInvalidate}>Cancel</Button>
          <Button onClick={handleConfirmInvalidate} color="error" variant="contained">Invalidate</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
      <CustomSnackbar open={!!success} onClose={() => setSuccess('')} message={success} severity="success" autoHideDuration={3000} />
    </Container>
  );
};

export default InvalidateQR;
