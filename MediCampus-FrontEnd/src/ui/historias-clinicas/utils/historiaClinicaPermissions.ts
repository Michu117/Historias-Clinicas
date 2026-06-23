export type UserRole = 'MEDICO' | 'PACIENTE' | 'ADMINISTRADOR' | 'TRABAJADOR_SOCIAL';

export interface HistoriaClinicaPermissions {
  canAccessHistorias: boolean;
  canViewAllHistorias: boolean;
  canViewOwnHistoria: boolean;
  canCreateHistoria: boolean;
  canEditHistoria: boolean;
  canManageAntecedentes: boolean;
  canManageCasos: boolean;
  canGenerateDocuments: boolean;
  canViewDocuments: boolean;
  isReadOnly: boolean;
  isAdminBlocked: boolean;
}

const PERMISSIONS_BY_ROLE: Record<UserRole, HistoriaClinicaPermissions> = {
  MEDICO: {
    canAccessHistorias: true,
    canViewAllHistorias: true,
    canViewOwnHistoria: false,
    canCreateHistoria: false,
    canEditHistoria: true,
    canManageAntecedentes: true,
    canManageCasos: true,
    canGenerateDocuments: true,
    canViewDocuments: true,
    isReadOnly: false,
    isAdminBlocked: false,
  },
  PACIENTE: {
    canAccessHistorias: true,
    canViewAllHistorias: false,
    canViewOwnHistoria: true,
    canCreateHistoria: false,
    canEditHistoria: false,
    canManageAntecedentes: false,
    canManageCasos: false,
    canGenerateDocuments: false,
    canViewDocuments: true,
    isReadOnly: true,
    isAdminBlocked: false,
  },
  ADMINISTRADOR: {
    canAccessHistorias: false,
    canViewAllHistorias: false,
    canViewOwnHistoria: false,
    canCreateHistoria: false,
    canEditHistoria: false,
    canManageAntecedentes: false,
    canManageCasos: false,
    canGenerateDocuments: false,
    canViewDocuments: false,
    isReadOnly: true,
    isAdminBlocked: true,
  },
  TRABAJADOR_SOCIAL: {
    canAccessHistorias: true,
    canViewAllHistorias: true,
    canViewOwnHistoria: false,
    canCreateHistoria: false,
    canEditHistoria: false,
    canManageAntecedentes: false,
    canManageCasos: false,
    canGenerateDocuments: true,
    canViewDocuments: true,
    isReadOnly: false,
    isAdminBlocked: false,
  },
};

const ROLE_ALIASES: Record<string, UserRole> = {
  medico: 'MEDICO',
  médiсo: 'MEDICO',
  psicologo: 'MEDICO',
  psicólogo: 'MEDICO',
  odontologo: 'MEDICO',
  odontólogo: 'MEDICO',
  paciente: 'PACIENTE',
  administrador: 'ADMINISTRADOR',
  admin: 'ADMINISTRADOR',
  trabajador_social: 'TRABAJADOR_SOCIAL',
  'trabajador social': 'TRABAJADOR_SOCIAL',
  trabajadorsocial: 'TRABAJADOR_SOCIAL',
  'trabajo social': 'TRABAJADOR_SOCIAL',
  trabajo_social: 'TRABAJADOR_SOCIAL',
};

export function normalizeRole(raw: string): UserRole | null {
  if (!raw) return null;
  const cleaned = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  return ROLE_ALIASES[cleaned] ?? null;
}

export function getStoredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getStoredUserRole(): UserRole | null {
  const user = getStoredUser();
  if (!user) return null;
  const rol = user.rol as Record<string, unknown> | null;
  const rawRole = (rol?.nombre as string) ?? '';
  return normalizeRole(rawRole);
}

export function getPermissionsForRole(role: UserRole | null): HistoriaClinicaPermissions | null {
  if (!role) return null;
  return PERMISSIONS_BY_ROLE[role] ?? null;
}

export function getCurrentUserPermissions(): HistoriaClinicaPermissions | null {
  const role = getStoredUserRole();
  return getPermissionsForRole(role);
}
