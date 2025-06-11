import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Snackbar,
  Container,
  Grid,
  Divider,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

const EnrollStudents = () => {
  const [subjects, setSubjects] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    selectedSubjects: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');
      const response = await axios.get('/api/admin/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubjects(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subjectId) => {
    setFormData(prev => {
      const isSelected = prev.selectedSubjects.includes(subjectId);
      return {
        ...prev,
        selectedSubjects: isSelected
          ? prev.selectedSubjects.filter(id => id !== subjectId)
          : [...prev.selectedSubjects, subjectId]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEnrollmentDetails(null);

    if (!formData.name || !formData.rollNumber || formData.selectedSubjects.length === 0) {
      setError('Please fill all fields and select at least one subject');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User not authenticated');

      const response = await axios.post(
        '/api/admin/enroll-student',
        {
          name: formData.name,
          rollNumber: formData.rollNumber,
          subjectIds: formData.selectedSubjects
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        setSuccess(response.data.msg);
        setEnrollmentDetails({
          newEnrollments: response.data.newEnrollments,
          existingEnrollments: response.data.existingEnrollments
        });
        setFormData({
          name: '',
          rollNumber: '',
          selectedSubjects: []
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to enroll student';
      setError(errorMessage);
      if (err.response?.data?.existingEnrollments) {
        setEnrollmentDetails({
          existingEnrollments: err.response.data.existingEnrollments
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: 'center' }}>
        Enroll Student
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Student Information
              </Typography>
              <TextField
                fullWidth
                label="Student Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                margin="normal"
                size="small"
                required
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Roll Number"
                name="rollNumber"
                value={formData.rollNumber}
                onChange={handleChange}
                margin="normal"
                size="small"
                required
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Select Subjects
              </Typography>
              <Paper sx={{ maxHeight: 200, overflowY: 'auto', p: 2 }}>
                {loadingSubjects ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormGroup>
                      {subjects.length > 0 ? (
                        subjects.map(subject => (
                          <FormControlLabel
                            key={subject._id}
                            control={
                              <Checkbox
                                checked={formData.selectedSubjects.includes(subject._id)}
                                onChange={() => handleSubjectChange(subject._id)}
                                size="small"
                                disabled={submitting}
                                inputProps={{ 'aria-label': `${subject.name} (${subject.courseCode})` }}
                              />
                            }
                            label={`${subject.name} (${subject.courseCode})`}
                          />
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ textAlign: 'center', mt: 1 }}
                        >
                          No subjects available.
                        </Typography>
                      )}
                    </FormGroup>
                  </FormControl>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ mb: 2 }} />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={submitting || loadingSubjects}
              >
                {submitting ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {enrollmentDetails && (
        <Paper sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Enrollment Details
          </Typography>

          {enrollmentDetails.existingEnrollments?.length > 0 && (
            <>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Already Enrolled Subjects:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {enrollmentDetails.existingEnrollments.map((enrollment, i) => (
                  <li key={i}>
                    {enrollment.subjectName} ({enrollment.courseCode})
                  </li>
                ))}
              </ul>
            </>
          )}

          {enrollmentDetails.newEnrollments > 0 && (
            <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 2 }}>
              Newly Enrolled Subjects: {enrollmentDetails.newEnrollments}
            </Typography>
          )}
        </Paper>
      )}

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EnrollStudents;
