import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import NotAuthorizedPage from './pages/NotAuthorizedPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import AddStudentPage from './pages/admin/AddStudentPage';
import BulkImportPage from './pages/admin/BulkImportPage';
import StudentListPage from './pages/admin/StudentListPage';
import RegisterTeacherPage from './pages/admin/RegisterTeacherPage';
import TeacherListPage from './pages/admin/TeacherListPage';
import CreateCoursePage from './pages/admin/CreateCoursePage';
import CourseListPage from './pages/admin/CourseListPage';
import AssignTeacherPage from './pages/admin/AssignTeacherPage';
import AutoEnrollPage from './pages/admin/AutoEnrollPage';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';


/**
 * PublicRoute
 * If the user is already authenticated and lands on /login or /,
 * bounce them straight to their role-specific dashboard.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return null; // spinner is handled by ProtectedRoute on protected pages

  if (user) {
    const roleRoutes = {
      admin: '/admin/dashboard',
      teacher: '/teacher/dashboard',
      student: '/student/dashboard',
    };
    return <Navigate to={roleRoutes[user.role] ?? '/login'} replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Root */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Navigate to="/login" replace />
                </PublicRoute>
              }
            />

            {/* Login — redirect away if already authenticated */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            {/* 403 — wrong role */}
            <Route path="/403" element={<NotAuthorizedPage />} />

            {/* ── Role-specific protected dashboards ─────────────────────────
                allowedRoles enforces that only the correct role can enter.
                Wrong-role users are sent to /403; unauthenticated to /login.
            ──────────────────────────────────────────────────────────────── */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/add"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddStudentPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <StudentListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/students/import"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BulkImportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers/add"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <RegisterTeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TeacherListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/create"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CreateCoursePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CourseListPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/assign-teachers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AssignTeacherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/courses/auto-enroll"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AutoEnrollPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy placeholder */}
            <Route path="/dashboard" element={<Navigate to="/login" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
