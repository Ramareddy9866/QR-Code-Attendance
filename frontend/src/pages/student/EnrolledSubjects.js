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
import api from '../../api';
import CustomSnackbar from '../../components/CustomSnackbar';

const EnrolledSubjects = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  const fetchEnrollments = async () => {
    try {
      const { data } = await api.get('/student/enrollments');
      setEnrollments(data);
    } catch {
      setError('Failed to fetch enrolled subjects');
    }
  };

  useEffect(() => {
    fetchEnrollments(); // Get enrolled subjects when page loads
  }, []);

  return (
    <Box sx={{ maxWidth: 'lg', margin: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}>
  MY ENROLLED SUBJECTS
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

      <CustomSnackbar open={!!error} onClose={() => setError('')} message={error} severity="error" autoHideDuration={3000} />
    </Box>
  );
};

export default EnrolledSubjects;
