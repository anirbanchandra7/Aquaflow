import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import SuperAdminLayout from './components/SuperAdminLayout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/super-admin/Dashboard.jsx';
import Distributors from './pages/super-admin/Distributors.jsx';
import DistributorDetail from './pages/super-admin/DistributorDetail.jsx';
import SupportTickets from './pages/super-admin/SupportTickets.jsx';
import Settings from './pages/super-admin/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DriverDashboard from './pages/DriverDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute roles={['super_admin']} />}>
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="distributors" element={<Distributors />} />
              <Route path="distributors/:id" element={<DistributorDetail />} />
              <Route path="support-tickets" element={<SupportTickets />} />
              <Route path="settings" element={<Settings />} />
            </Route>
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
