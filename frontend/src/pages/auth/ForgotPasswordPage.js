import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('If the user exists, a reset link has been sent.');
    } catch (err) {
      setError('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 400 }}>
      <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
  Forgot Password
</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={loading}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button variant="text" onClick={() => window.location.href = '/login'}>Back to Login</Button>
        </Box>
        <CustomSnackbar open={!!message} onClose={() => setMessage('')} message={message} severity="success" autoHideDuration={3000} />
        <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
      </Paper>
    </Box>
  );
};

export default ForgotPasswordPage; 