import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute roles={['super_admin']} />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute roles={['driver']} />}>
            <Route path="/driver/dashboard" element={<DriverDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
