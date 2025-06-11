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
  Card,
  CardContent
} from '@mui/material';
import axios from 'axios';

const EnrolledSubjects = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  const fetchEnrollments = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('/api/student/enrollments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEnrollments(data);
    } catch {
      setError('Failed to fetch enrolled subjects');
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', p: 2 }}>
      <Typography
        variant="h4"
        sx={{ mb: 3, textAlign: 'center', fontSize: '2rem' }}
      >
        My Enrolled Subjects
      </Typography>

      <Card sx={{ boxShadow: 3, maxWidth: 800, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <TableContainer component={Paper} sx={{ maxWidth: 700, mx: 'auto' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Course Code</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Subject Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Instructor</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Enrolled On</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {enrollments.length ? (
                  enrollments.map(({ _id, subject, enrolledAt }) => (
                    <TableRow key={_id}>
                      <TableCell sx={{ fontSize: '1.125rem' }}>{subject?.courseCode}</TableCell>
                      <TableCell sx={{ fontSize: '1.125rem' }}>{subject?.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.125rem' }}>{subject?.admin?.name}</TableCell>
                      <TableCell sx={{ fontSize: '1.125rem' }}>
                        {new Date(enrolledAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={{ textAlign: 'center', fontSize: '1.125rem' }}>
                      No subjects enrolled
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%', fontSize: '1rem' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EnrolledSubjects;
