import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importaciones de Seguridad
import SecurityLayout from './ui/seguridad/components/SecurityLayout';
import LoginPage from './ui/seguridad/views/LoginPage';
import RegisterPage from './ui/seguridad/views/RegisterPage';
import SecurityDashboard from './ui/seguridad/views/SecurityDashboard';
import AuditDashboardPage from './ui/seguridad/views/AuditDashboardPage';
import UserManagementPage from './ui/seguridad/views/UserManagementPage';
import PermissionAssignmentPage from './ui/seguridad/views/PermissionAssignmentPage';
import CriticalAlertsPage from './ui/seguridad/views/CriticalAlertsPage';
import AuditLogDetailPage from './ui/seguridad/views/AuditLogDetailPage';
import ForbiddenPage from './ui/seguridad/views/ForbiddenPage';

// Importaciones Globales y Reportes
import LandingPage from './ui/global/LandingPage';
import HomePage from './ui/global/HomePage';
import ReportesDashboardPage from './ui/reportes/ReportesDashboardPage';
import ReportesRangoPage from './ui/reportes/ReportesRangoPage';

// Importaciones de Agendas
import { AgendarCita } from './ui/agendas/component/pages/AgendarCita';
import { MiAgenda } from './ui/agendas/component/pages/MiAgenda';
import { Derivaciones } from './ui/agendas/component/pages/Derivaciones';
import { getToken } from './ui/agendas/services/storage/authStorage';
import { validateTokenRole } from './ui/agendas/utils/auth/jwtValidator';

function ProfessionalGuard({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const isProfessional = token ? validateTokenRole(token, 'PROFESIONAL') : false;

  if (!isProfessional) {
    return (
      <main className="shell">
        <section className="card hero">
          <p className="eyebrow">Acceso restringido</p>
          <h1>Mi Agenda</h1>
          <p>Debes iniciar sesión como profesional para acceder a esta página.</p>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full h-screen min-h-screen bg-[#faf9ff] overflow-hidden">
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />

          {/* Rutas de Reportes */}
          <Route path="/reportes" element={<ReportesDashboardPage />} />
          <Route path="/reportes/rango" element={<ReportesRangoPage />} />

          {/* Redirecciones de rutas antiguas de reportes */}
          <Route path="/reportes/generales" element={<Navigate to="/reportes" replace />} />
          <Route path="/reportes/servicio/:servicioId" element={<Navigate to="/reportes" replace />} />
          <Route path="/reportes/genero" element={<Navigate to="/reportes" replace />} />

          {/* Rutas de Seguridad */}
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

          {/* Rutas de Agendas */}
          <Route path="/AgendarCita" element={<AgendarCita />} />
          <Route path="/agendas/mi-agenda" element={<ProfessionalGuard><MiAgenda /></ProfessionalGuard>} />
          <Route path="/agendas/derivaciones" element={<ProfessionalGuard><Derivaciones /></ProfessionalGuard>} />

          {/* Fallback para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
