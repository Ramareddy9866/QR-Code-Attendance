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
  Container,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const EnrollStudents = () => {
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [proceed, setProceed] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [enrollResults, setEnrollResults] = useState([]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await api.get('/admin/students');
      setStudents(response.data);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError('');
    try {
      const response = await api.get('/admin/subjects');
      setSubjects(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    fetchStudents(); // Get students when page loads
    fetchSubjects(); // Get subjects when page loads
  }, []);

  const filteredStudents = students.filter(
    s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const handleSubjectChange = (subjectId) => {
    // Add or remove subject from selection
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleStudentToggle = (student) => {
    // Add or remove student from selection
    setSelectedStudents(prev => {
      const exists = prev.find(s => s._id === student._id);
      if (exists) {
        return prev.filter(s => s._id !== student._id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setEnrollmentDetails(null);

    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }
    if (selectedSubjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    setSubmitting(true);
    try {
      // Send enroll request to backend
      const response = await api.post(
        '/admin/enroll-students',
        {
          students: selectedStudents.map(s => ({ rollNumber: s.rollNumber, name: s.name })),
          subjectIds: selectedSubjects
        }
      );
      if (response.status === 201) {
        setEnrollResults(response.data.results); // Show results
        setResultDialogOpen(true);
        setSelectedSubjects([]);
        setSelectedStudents([]);
        setProceed(false);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.msg || err.message || 'Failed to enroll students';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  ENROLL STUDENTS
</Typography>
      <Paper sx={{ p: 3 }}>
        {!proceed ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Select Students
            </Typography>
            <TextField
              fullWidth
              placeholder="Search by name, roll, or email"
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            <Box sx={{ maxHeight: 350, overflowY: 'auto', mb: 2 }}>
              {loadingStudents ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map(student => {
                  const checked = selectedStudents.some(s => s._id === student._id);
                  return (
                    <Box
                      key={student._id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: checked ? 'action.selected' : 'transparent',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                      onClick={() => handleStudentToggle(student)}
                    >
                      <Checkbox
                        checked={checked}
                        color="primary"
                        sx={{ mr: 1 }}
                        tabIndex={-1}
                        inputProps={{ 'aria-label': `Select ${student.name}` }}
                        onChange={() => handleStudentToggle(student)}
                        onClick={e => e.stopPropagation()}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{student.name}</Typography>
                        <Typography variant="body2" color="text.secondary">Roll: {student.rollNumber}</Typography>
                        <Typography variant="body2" color="text.secondary">{student.email}</Typography>
                      </Box>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="body2" color="text.secondary">No students found.</Typography>
              )}
            </Box>
            {selectedStudents.length > 0 && (
              <Button variant="contained" fullWidth sx={{ mb: 2 }} onClick={() => setProceed(true)}>
                Proceed to Subject Selection
              </Button>
            )}
          </>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Selected Students:
                </Typography>
                {selectedStudents.map(s => (
                  <Typography key={s._id} variant="body2" color="text.secondary">
                    {s.name} (Roll: {s.rollNumber})
                  </Typography>
                ))}
              </Box>
              <Button variant="text" color="primary" onClick={() => setProceed(false)}>
                Back to Student Selection
              </Button>
            </Box>
            <form onSubmit={handleSubmit}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Select Subjects
              </Typography>
              <Paper sx={{ maxHeight: 200, overflowY: 'auto', p: 2, mb: 2 }}>
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
                                checked={selectedSubjects.includes(subject._id)}
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
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={submitting || loadingSubjects}
              >
                {submitting ? 'Enrolling...' : 'Enroll Students'}
              </Button>
            </form>
          </>
        )}
      </Paper>
      {/* Show error or success message */}
      <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
      <CustomSnackbar open={!!success} onClose={() => setSuccess('')} message={success} severity="success" autoHideDuration={3000} />
      <Dialog open={resultDialogOpen} onClose={() => setResultDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enrollment Results</DialogTitle>
        <DialogContent>
          {enrollResults.length === 0 ? (
            <Typography>No results to display.</Typography>
          ) : (
            <>
              {enrollResults.map((subjectResult, idx) => (
                <Box key={subjectResult.subject._id || idx} sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {subjectResult.subject.name} ({subjectResult.subject.courseCode})
                  </Typography>
                  {/* Enrolled students */}
                  {subjectResult.enrolled.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <span role="img" aria-label="enrolled" style={{ marginRight: 8 }}>✅</span> Enrolled
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {subjectResult.enrolled.map((student, i) => (
                          <li key={i}>{student.name} ({student.email})</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {/* Already enrolled students */}
                  {subjectResult.alreadyEnrolled.length > 0 && (
                    <>
                      <Typography variant="subtitle1" sx={{ color: 'warning.main', display: 'flex', alignItems: 'center', mb: 0.5, mt: 1 }}>
                        <span role="img" aria-label="already enrolled" style={{ marginRight: 8 }}>⚠️</span> Already Enrolled
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {subjectResult.alreadyEnrolled.map((student, i) => (
                          <li key={i}>{student.name} ({student.email})</li>
                        ))}
                      </ul>
                    </>
                  )}
                  {subjectResult.enrolled.length === 0 && subjectResult.alreadyEnrolled.length === 0 && (
                    <Typography color="text.secondary">No students processed for this subject.</Typography>
                  )}
                </Box>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDialogOpen(false)} variant="contained">Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EnrollStudents;
