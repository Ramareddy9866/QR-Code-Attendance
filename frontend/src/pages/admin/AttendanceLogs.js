import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  LinearProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const AttendanceLogs = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendanceData, setAttendanceData] = useState(null);
  const [error, setError] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  const fetchSubjects = async () => {
    setLoadingSubjects(true);
    setError('');
    try {
      const { data } = await api.get('/admin/subjects');
      setSubjects(data);
    } catch {
      setError('Failed to fetch subjects');
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const fetchAttendance = async (subjectId) => {
    setLoadingAttendance(true);
    setError('');
    try {
      const { data } = await api.get(`/admin/subject/${subjectId}/attendance`);
      setAttendanceData(data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch attendance logs');
      setAttendanceData(null);
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    fetchSubjects(); // Get subjects when page loads
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchAttendance(selectedSubject); // Get attendance when subject changes
    } else {
      setAttendanceData(null);
    }
  }, [selectedSubject]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleString(); // Format date for display

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  ATTENDANCE LOGS
</Typography>

        <Box sx={{ maxWidth: 400, mx: 'auto', mb: 4, position: 'relative' }}>
          <FormControl fullWidth size="small" disabled={loadingSubjects}>
            <InputLabel sx={{ fontSize: '1.1rem' }}>Select Subject</InputLabel>
            <Select
              value={selectedSubject}
              label="Select Subject"
              onChange={(e) => setSelectedSubject(e.target.value)}
              sx={{ fontSize: '1.1rem' }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {subjects.map(({ _id, name, courseCode }) => (
                <MenuItem key={_id} value={_id} sx={{ fontSize: '1.1rem' }}>
                  {name} ({courseCode})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {loadingSubjects && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: 12,
                transform: 'translateY(-50%)'
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
          {!loadingSubjects && subjects.length === 0 && (
            <Typography
              color="text.secondary"
              sx={{ mt: 1, fontSize: '0.9rem', textAlign: 'center' }}
            >
              No subjects found.
            </Typography>
          )}
        </Box>

        {loadingAttendance ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
            <CircularProgress />
          </Box>
        ) : attendanceData ? (
          <>
            <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4 }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.2rem' }}>
                Total Classes: {attendanceData.totalClasses}
              </Typography>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Roll Number</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Student Name</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Email</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Classes Attended</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Attendance %</TableCell>
                      <TableCell sx={{ fontSize: '1.1rem' }}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attendanceData.studentStats.map(({ student, attendedClasses, totalClasses, attendancePercentage }) => (
                      <TableRow key={student._id}>
                        <TableCell sx={{ fontSize: '1rem' }}>{student.rollNumber}</TableCell>
                        <TableCell sx={{ fontSize: '1rem' }}>{student.name}</TableCell>
                        <TableCell sx={{ fontSize: '1rem' }}>{student.email}</TableCell>
                        <TableCell sx={{ fontSize: '1rem' }}>
                          {attendedClasses} / {totalClasses}
                        </TableCell>
                        <TableCell sx={{ fontSize: '1rem' }}>
                          {attendancePercentage}%
                        </TableCell>
                        <TableCell sx={{ width: '180px' }}>
                          <LinearProgress
                            variant="determinate"
                            value={attendancePercentage}
                            sx={{
                              height: 10,
                              borderRadius: 5,
                              '& .MuiLinearProgress-bar': {
                                backgroundColor:
                                  attendancePercentage >= 75
                                    ? '#4caf50'
                                    : attendancePercentage >= 50
                                    ? '#ff9800'
                                    : '#f44336'
                              }
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            <Paper sx={{ p: { xs: 2, md: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.2rem' }}>
                Session Details
              </Typography>

              {attendanceData.sessionDetails.map(({ _id, date, expiresAt, status }) => (
                <Accordion key={_id} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      <Typography sx={{ flexGrow: 1, fontSize: '1.05rem' }}>
                        Session on {formatDate(date)}
                      </Typography>
                      <Chip
                        icon={
                          status === 'active' ? <CheckCircleIcon /> :
                          status === 'upcoming' ? <CheckCircleIcon /> :
                          <CancelIcon />
                        }
                        label={
                          status === 'active' ? 'Active' :
                          status === 'upcoming' ? 'Upcoming' :
                          'Expired'
                        }
                        color={
                          status === 'active' ? 'success' :
                          status === 'upcoming' ? 'info' :
                          'error'
                        }
                        size="small"
                        sx={{ fontSize: '0.85rem' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1rem' }}>
                      Expires at: {formatDate(expiresAt)}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Paper>
          </>
        ) : selectedSubject ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography sx={{ fontSize: '1.1rem' }}>
              No attendance records found for this subject.
            </Typography>
          </Paper>
        ) : null}

        <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
      </Box>
    </Container>
  );
};

export default AttendanceLogs;
