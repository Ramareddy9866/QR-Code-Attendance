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
  Snackbar,
  CircularProgress,
  Divider
} from '@mui/material';
import axios from 'axios';

const AttendanceHistory = () => {
  const [attendance, setAttendance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [attendanceRes, sessionsRes] = await Promise.all([
        axios.get('/api/student/attendance-history', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/student/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setAttendance(attendanceRes.data);
      setSessions(sessionsRes.data);
    } catch {
      setError('Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const groupedAttendance = sessions.reduce((acc, session) => {
    const subjectName = session.subject.name;
    if (!acc[subjectName]) acc[subjectName] = [];

    const attendanceRecord = attendance.find(a => a.session._id === session._id);

    let status = 'pending';
    if (attendanceRecord) status = 'present';
    else if (!session.isActive) status = 'absent';

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
      <Typography
        variant="h4"
        sx={{ mb: 3, fontSize: '2.25rem', textAlign: 'center' }}
      >
        Attendance History
      </Typography>

      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 3, maxWidth: 700, mx: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress size={50} />
          </Box>
        ) : Object.keys(groupedAttendance).length > 0 ? (
          Object.entries(groupedAttendance).map(([subject, records]) => (
            <Box key={subject} sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: 'bold', fontSize: '1.5rem', color: 'primary.main' }}
              >
                {subject}
              </Typography>
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
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))
        ) : (
          <Typography sx={{ textAlign: 'center', fontSize: '1.25rem', color: 'text.secondary' }}>
            No attendance records found
          </Typography>
        )}
      </Paper>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AttendanceHistory;
