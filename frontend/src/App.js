import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { Box } from '@mui/material';
import SubjectManager from './pages/admin/SubjectManager';
import QRCodeGenerator from './pages/admin/QRCodeGenerator';
import AttendanceLogs from './pages/admin/AttendanceLogs';
import InvalidateQR from './pages/admin/InvalidateQR';
import EnrollStudents from './pages/admin/EnrollStudents';
import QRScanner from './pages/student/QRScanner';
import AttendanceHistory from './pages/student/AttendanceHistory';
import EnrolledSubjects from './pages/student/EnrolledSubjects';
import theme from './theme';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/forgot-password' || location.pathname === '/reset-password';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {!isAuthPage && <Sidebar />}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: !isAuthPage ? '64px' : 0,
            ...(isAuthPage && {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
            }),
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student"
              element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/subjects"
              element={
                <ProtectedRoute role="admin">
                  <SubjectManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/generate"
              element={
                <ProtectedRoute role="admin">
                  <QRCodeGenerator />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <ProtectedRoute role="admin">
                  <AttendanceLogs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/invalidate"
              element={
                <ProtectedRoute role="admin">
                  <InvalidateQR />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/enroll"
              element={
                <ProtectedRoute role="admin">
                  <EnrollStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/scan"
              element={
                <ProtectedRoute role="student">
                  <QRScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/history"
              element={
                <ProtectedRoute role="student">
                  <AttendanceHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/subjects"
              element={
                <ProtectedRoute role="student">
                  <EnrolledSubjects />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <AppContent />
  </ThemeProvider>
);

export default App;
