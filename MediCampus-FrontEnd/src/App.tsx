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
import GestionHistoriasClinicasPage from "./ui/historias-clinicas/pages/GestionHistoriasClinicasPage";
import NuevaHistoriaClinicaPage from "./ui/historias-clinicas/pages/NuevaHistoriaClinicaPage";
import {DetalleHistoriaClinicaPage} from "./ui/historias-clinicas/pages/DetalleHistoriaClinicaPage";
import EditarHistoriaClinicaPage from "./ui/historias-clinicas/pages/EditarHistoriaClinicaPage";
import MiHistoriaClinicaPage from "./ui/historias-clinicas/pages/MiHistoriaClinicaPage";

// Importaciones Globales y Reportes
import LandingPage from './ui/global/LandingPage';
import HomePage from './ui/global/HomePage';
import ReportesDashboardPage from './ui/reportes/ReportesDashboardPage';
import ReportesRangoPage from './ui/reportes/ReportesRangoPage';

// Importaciones de Agendas
import { AgendarCita } from './ui/agendas/component/pages/AgendarCita';
import { MiAgenda } from './ui/agendas/component/pages/MiAgenda';
import { MisCitas } from './ui/agendas/component/pages/MisCitas';
import { Derivaciones } from './ui/agendas/component/pages/Derivaciones';
import { Consulta } from './ui/agendas/component/pages/Consulta';
import { getToken } from './ui/agendas/services/storage/authStorage';
import { validateTokenRole } from './ui/agendas/utils/auth/jwtValidator';

function ProfessionalGuard({ children }: { children: React.ReactNode }) {
  const token = getToken();
  const isProfessional = token ? validateTokenRole(token, 'PROFESIONAL') : false;

  if (!isProfessional) {
    return <Navigate to="/seguridad/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-[#faf9ff] overflow-y-auto">
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

          <Route path="/historias" element={<GestionHistoriasClinicasPage />} />
          <Route path="/historias/mi-historia" element={<MiHistoriaClinicaPage />} />
          <Route path="/historias/nueva" element={<NuevaHistoriaClinicaPage/>} />
          <Route path="/historias/:id" element={<DetalleHistoriaClinicaPage />} />
          <Route path="/historias/:id/editar" element={<EditarHistoriaClinicaPage/>} />


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
        <Route path="/mis-citas" element={<MisCitas />} />
        <Route path="/agendas/mi-agenda" element={<ProfessionalGuard><MiAgenda /></ProfessionalGuard>} />
        <Route path="/agendas/consulta/:citaId?" element={<ProfessionalGuard><Consulta /></ProfessionalGuard>} />
        <Route path="/agendas/derivaciones" element={<ProfessionalGuard><Derivaciones /></ProfessionalGuard>} />

        {/* Fallback para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
