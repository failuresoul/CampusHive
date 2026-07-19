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
import StudentCoursesPage from './pages/student/StudentCoursesPage';
import PostStudySessionPage from './pages/student/PostStudySessionPage';
import BrowseStudySessionsPage from './pages/student/BrowseStudySessionsPage';
import StudySessionDetailPage from './pages/student/StudySessionDetailPage';
import LabReportUploadPage from './pages/student/LabReportUploadPage';
import SubmissionHistoryPage from './pages/student/SubmissionHistoryPage';
import SubmissionDetailPage from './pages/student/SubmissionDetailPage';
import QuizTakingPage from './pages/student/QuizTakingPage';
import TeacherSubmissionQueuePage from './pages/teacher/TeacherSubmissionQueuePage';
import GradeSubmissionPage from './pages/teacher/GradeSubmissionPage';
import QuizCreatePage from './pages/teacher/QuizCreatePage';
import QuizLaunchPage from './pages/teacher/QuizLaunchPage';
import StudentQuizResultsPage from './pages/student/StudentQuizResultsPage';
import TeacherQuizAnalyticsPage from './pages/teacher/TeacherQuizAnalyticsPage';
import PostLostFoundItemPage from './pages/shared/PostLostFoundItemPage';
import BrowseLostFoundPage from './pages/shared/BrowseLostFoundPage';
import LostFoundDetailPage from './pages/shared/LostFoundDetailPage';
// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';

// Global Components
import QuizLiveBanner from './components/student/QuizLiveBanner';


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
          <QuizLiveBanner />
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
              path="/teacher/submissions"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherSubmissionQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/submissions/:submissionId/grade"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <GradeSubmissionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:courseId/quizzes/create"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <QuizCreatePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:courseId/quizzes/:quizId/launch"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <QuizLaunchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/courses/:courseId/quizzes/:quizId/results"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherQuizAnalyticsPage />
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
            <Route
              path="/student/courses"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentCoursesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/study-sessions/create"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <PostStudySessionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/study-sessions"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <BrowseStudySessionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/study-sessions/:id"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudySessionDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/labtrack"
              element={<Navigate to="history" replace />}
            />
            <Route
              path="/student/courses/:courseId/labtrack/history"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SubmissionHistoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/labtrack/upload"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <LabReportUploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/labtrack/submissions/:submissionId"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <SubmissionDetailPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/quizzes/:quizId/take"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <QuizTakingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/courses/:courseId/quizzes/:quizId/results"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentQuizResultsPage />
                </ProtectedRoute>
              }
            />

            {/* Lost & Found */}
            <Route
              path="/lost-found/post"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <PostLostFoundItemPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lost-found"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <BrowseLostFoundPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lost-found/:id"
              element={
                <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
                  <LostFoundDetailPage />
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
