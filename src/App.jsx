import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BuildingsPage from './pages/BuildingsPage';
import BuildingFormPage from './pages/BuildingFormPage';
import UsersPage from './pages/UsersPage';
import CampusConfigPage from './pages/CampusConfigPage';
import ChatbotPage from './pages/ChatbotPage';
import SettingsPage from './pages/SettingsPage';
import PathsPage from './pages/PathsPage';
import PathFormPage from './pages/PathFormPage';

function UnauthorizedPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Unauthorized</h1>
      <p>You do not have permission to access this page.</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="buildings" element={<BuildingsPage />} />
          <Route path="buildings/new" element={<BuildingFormPage />} />
          <Route path="buildings/edit/:id" element={<BuildingFormPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="campus-config" element={<CampusConfigPage />} />
          <Route path="paths" element={<PathsPage />} />
          <Route path="paths/new" element={<PathFormPage />} />
          <Route path="paths/edit/:id" element={<PathFormPage />} />
          <Route path="chatbot" element={<ChatbotPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

