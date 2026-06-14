/**
 * auditService.ts
 * Service para registrar y trackear consultas (RNF-06 - Trazabilidad)
 */

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  filters: any;
  resultCount: number;
  duration: number;
  userId?: string;
  userRole?: string;
}

class AuditService {
  private entries: AuditEntry[] = [];
  private pendingEntry: Partial<AuditEntry> | null = null;
  private startTime: number | null = null;

  /**
   * Inicia el registro de una consulta
   */
  startQuery(action: string, filters: any): string {
    this.startTime = performance.now();
    const id = `${action}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.pendingEntry = {
      id,
      action,
      filters,
      timestamp: new Date().toISOString()
    };

    return id;
  }

  /**
   * Completa el registro de una consulta
   */
  completeQuery(queryId: string, resultCount: number) {
    if (!this.pendingEntry || this.startTime === null) {
      console.warn('No pending query to complete');
      return;
    }

    const duration = performance.now() - this.startTime;
    const entry: AuditEntry = {
      id: queryId,
      timestamp: this.pendingEntry.timestamp || new Date().toISOString(),
      action: this.pendingEntry.action || 'unknown',
      filters: this.pendingEntry.filters || {},
      resultCount,
      duration,
      userId: this.getUserId(),
      userRole: this.getUserRole()
    };

    this.entries.push(entry);
    this.persistEntry(entry);
    this.pendingEntry = null;
    this.startTime = null;

    return entry;
  }

  /**
   * Registra un error en la consulta
   */
  logError(queryId: string, error: string) {
    console.log(`[AUDIT] Query ${queryId} failed: ${error}`);
    this.pendingEntry = null;
    this.startTime = null;
  }

  /**
   * Obtiene el historial de auditoría
   */
  getAuditLog(): AuditEntry[] {
    return [...this.entries];
  }

  /**
   * Limpia el historial de auditoría
   */
  clearAuditLog() {
    this.entries = [];
    localStorage.removeItem('audit_log');
  }

  /**
   * Persiste una entrada en localStorage
   */
  private persistEntry(entry: AuditEntry) {
    try {
      const log = JSON.parse(localStorage.getItem('audit_log') || '[]');
      log.push(entry);
      // Mantener solo últimas 100 entradas
      const trimmed = log.slice(-100);
      localStorage.setItem('audit_log', JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to persist audit entry', e);
    }
  }

  /**
   * Obtiene userId del token si existe
   */
  private getUserId(): string | undefined {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub || payload.user_id;
      }
    } catch {
      // Ignore decode errors
    }
    return undefined;
  }

  /**
   * Obtiene userRole del token si existe
   */
  private getUserRole(): string | undefined {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.user_role;
      }
    } catch {
      // Ignore decode errors
    }
    return undefined;
  }
}

const auditService = new AuditService();
export default auditService;
export { AuditService };

