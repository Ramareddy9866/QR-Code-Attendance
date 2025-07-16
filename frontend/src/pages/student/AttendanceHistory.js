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
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const [attendanceRes, sessionsRes] = await Promise.all([
        api.get('/student/attendance-history'),
        api.get('/student/sessions')
      ]);
      setAttendance(attendanceRes.data);
      setSessions(sessionsRes.data);
    } catch {
      setError('Failed to fetch attendance records'); // Show error if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(); // Get attendance data when page loads
  }, []);

  const groupedAttendance = sessions
    .filter(session => session.status === 'active' || session.status === 'expired')
    .reduce((acc, session) => {
      // Skip sessions with no subject
      if (!session.subject || !session.subject.name) return acc;
      const subjectName = session.subject.name;
      if (!acc[subjectName]) acc[subjectName] = [];

      const attendanceRecord = attendance.find(a => a.session && a.session._id === session._id);

      let status = 'absent';
      if (attendanceRecord) status = 'present';
      else if (session.status === 'active') status = 'pending'; // Only for active sessions
      // For expired sessions, status is 'present' if attended, else 'absent'

      acc[subjectName].push({
        _id: session._id,
        date: session.date,
        status,
        scannedAt: attendanceRecord?.scannedAt
      });

      return acc;
    }, {});

  const renderStatus = (status) => {
    const fontSize = '1rem';
    if (status === 'present') return <Alert severity="success" sx={{ py: 0, fontSize }}>Present</Alert>;
    if (status === 'pending') return <Alert severity="info" sx={{ py: 0, fontSize }}>Pending</Alert>;
    if (status === 'absent') return <Alert severity="error" sx={{ py: 0, fontSize }}>Absent</Alert>;
    return null;
  };

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  ATTENDANCE HISTORY
</Typography>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, maxWidth: 700, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={50} />
          </Box>
        ) : Object.keys(groupedAttendance).length > 0 ? (
          Object.entries(groupedAttendance).map(([subject, records]) => (
            <Accordion key={subject} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'primary.main' }}
                >
                  {subject}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer component={Paper} sx={{ mb: 2, maxWidth: 800, mx: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {records.map(({ _id, date, status, scannedAt }) => (
                        <TableRow key={_id}>
                          <TableCell sx={{ fontSize: '1.125rem' }}>
                            {new Date(date).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontSize: '1.125rem' }}>
                            {scannedAt ? new Date(scannedAt).toLocaleTimeString() : new Date(date).toLocaleTimeString()}
                          </TableCell>
                          <TableCell>{renderStatus(status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Typography sx={{ textAlign: 'center', fontSize: '1.25rem', color: 'text.secondary' }}>
            No attendance records found
          </Typography>
        )}
      </Paper>

      <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
    </Box>
  );
};

export default AttendanceHistory;
