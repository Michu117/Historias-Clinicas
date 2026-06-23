/**
 * useRolePermissions.ts
 * Hook para verificar permisos de usuario basado en roles (RN-01)
 */

type UserRole = 'IsAdmin' | 'IsMedico' | 'IsPaciente' | 'IsEnfermera';

interface Permissions {
  canViewReports: boolean;
  canExportReports: boolean;
  canDeleteReports: boolean;
  canEditReports: boolean;
  canViewAllServicio: boolean;
}

export function useRolePermissions(userRole: UserRole | null): Permissions {
  if (!userRole) {
    return {
      canViewReports: false,
      canExportReports: false,
      canDeleteReports: false,
      canEditReports: false,
      canViewAllServicio: false
    };
  }

  const basePermissions: Record<UserRole, Permissions> = {
    IsAdmin: {
      canViewReports: true,
      canExportReports: true,
      canDeleteReports: true,
      canEditReports: true,
      canViewAllServicio: true
    },
    IsMedico: {
      canViewReports: true,
      canExportReports: true,
      canDeleteReports: false,
      canEditReports: false,
      canViewAllServicio: false
    },
    IsEnfermera: {
      canViewReports: false,
      canExportReports: false,
      canDeleteReports: false,
      canEditReports: false,
      canViewAllServicio: false
    },
    IsPaciente: {
      canViewReports: false,
      canExportReports: false,
      canDeleteReports: false,
      canEditReports: false,
      canViewAllServicio: false
    }
  };

  return basePermissions[userRole] || basePermissions.IsPaciente;
}

