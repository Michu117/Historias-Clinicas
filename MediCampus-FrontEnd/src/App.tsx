import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SecurityLayout from './ui/seguridad/components/SecurityLayout'
import LoginPage from './ui/seguridad/views/LoginPage'
import RegisterPage from './ui/seguridad/views/RegisterPage'
import SecurityDashboard from './ui/seguridad/views/SecurityDashboard'
import AuditDashboardPage from './ui/seguridad/views/AuditDashboardPage'
import UserManagementPage from './ui/seguridad/views/UserManagementPage'
import PermissionAssignmentPage from './ui/seguridad/views/PermissionAssignmentPage'
import CriticalAlertsPage from './ui/seguridad/views/CriticalAlertsPage'
import AuditLogDetailPage from './ui/seguridad/views/AuditLogDetailPage'
import ForbiddenPage from './ui/seguridad/views/ForbiddenPage'
import LandingPage from './ui/global/LandingPage'
import HomePage from './ui/global/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/seguridad/login" element={<LoginPage />} />
        <Route path="/seguridad/register" element={<RegisterPage />} />
        <Route path="/seguridad/403" element={<ForbiddenPage />} />
        <Route path="/seguridad" element={<SecurityLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SecurityDashboard />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="permissions" element={<PermissionAssignmentPage />} />
          <Route path="audit" element={<AuditDashboardPage />} />
          <Route path="audit/:logId" element={<AuditLogDetailPage />} />
          <Route path="alerts" element={<CriticalAlertsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
