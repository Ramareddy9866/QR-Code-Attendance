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
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', courseCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.get(`/admin/subjects`);
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
      await api.post(`/admin/subject`, formData);
      setSuccess('Subject created successfully');
      setFormData({ name: '', courseCode: '' });
      setOpen(false);
      fetchSubjects();
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to create subject');
    }
  };

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return;
    try {
      await api.delete(`/admin/subject/${subjectToDelete}`);
      setSuccess('Subject deleted successfully');
      fetchSubjects();
    } catch {
      setError('Failed to delete subject');
    } finally {
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Box sx={{ width: '95%', maxWidth: 700 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center', fontWeight: 'bold' }}>
          SUBJECT MANAGEMENT
        </Typography>

        {/* Dialog for adding new subject */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Subject Name"
              type="text"
              fullWidth
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              name="courseCode"
              label="Course Code"
              type="text"
              fullWidth
              value={formData.courseCode}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateSubject}>Add</Button>
          </DialogActions>
        </Dialog>

        {/* Show error or success message */}
        <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
        <CustomSnackbar open={!!success} onClose={() => setSuccess('')} message={success} severity="success" autoHideDuration={3000} />

        {/* Button to add subject */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, pr: 8 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setOpen(true)}
            sx={{ fontSize: '0.95rem', borderRadius: 2, px: 2, py: 0.5, boxShadow: 1 }}
          >
            Add Subject
          </Button>
        </Box>
        {/* Table of subjects */}
        <TableContainer
          component={Paper}
          sx={{
            mx: 'auto',
            width: '100%',
            maxWidth: 600,
            boxShadow: 3,
            borderRadius: 2,
            overflowX: 'auto',
            position: 'relative'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    pl: 4
                  }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    px: 2
                  }}
                >
                  Course Code
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '1.15rem',
                    fontWeight: 'bold',
                    textAlign: 'right',
                    pr: 4
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell sx={{ pl: 4, fontSize: '1.1rem' }}>{subject.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center', px: 2, fontSize: '1.1rem' }}>{subject.courseCode}</TableCell>
                  <TableCell sx={{ textAlign: 'right', pr: 4, fontSize: '1.1rem' }}>
                    <IconButton onClick={() => { setSubjectToDelete(subject._id); setDeleteDialogOpen(true); }}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Dialog to confirm delete */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this subject? This action cannot be undone.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteSubject} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default SubjectManager;
