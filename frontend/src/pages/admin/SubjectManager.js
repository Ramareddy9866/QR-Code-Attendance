import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', courseCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSubjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(data);
    } catch {
      setError('Failed to fetch subjects');
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSubject = async () => {
    if (!formData.name.trim() || !formData.courseCode.trim()) {
      setError('Both name and course code are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/subject', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Subject created successfully');
      setFormData({ name: '', courseCode: '' });
      setOpen(false);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/subject/${subjectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Subject deleted successfully');
      fetchSubjects();
    } catch {
      setError('Failed to delete subject');
    }
  };

  return (
    <Box sx={{ width: '80%', maxWidth: 800, mx: 'auto', py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Subject Management
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ paddingX: 4, fontSize: '1.2rem', borderRadius: 2 }}
        >
          Add New Subject
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        sx={{
          boxShadow: 2,
          borderRadius: 2,
          width: '100%',
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.2rem' }}>Course Code</TableCell>
              <TableCell sx={{ fontSize: '1.2rem' }}>Subject Name</TableCell>
              <TableCell align="right" sx={{ fontSize: '1.2rem' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subjects.map(({ _id, courseCode, name }) => (
              <TableRow key={_id}>
                <TableCell sx={{ fontSize: '1rem', py: 1 }}>{courseCode}</TableCell>
                <TableCell sx={{ fontSize: '1rem', py: 1 }}>{name}</TableCell>
                <TableCell align="right">
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteSubject(_id)}
                    sx={{ fontSize: '1.3rem' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem' }}>Add New Subject</DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Course Code"
            name="courseCode"
            fullWidth
            value={formData.courseCode}
            onChange={handleChange}
            sx={{ mb: 2, fontSize: '1.1rem' }}
          />
          <TextField
            margin="dense"
            label="Subject Name"
            name="name"
            fullWidth
            value={formData.name}
            onChange={handleChange}
            sx={{ fontSize: '1.1rem' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} sx={{ fontSize: '1.1rem' }}>
            Cancel
          </Button>
          <Button onClick={handleCreateSubject} variant="contained" sx={{ fontSize: '1.1rem' }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')} sx={{ fontSize: '1.1rem' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ fontSize: '1.1rem' }}>
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubjectManager;
