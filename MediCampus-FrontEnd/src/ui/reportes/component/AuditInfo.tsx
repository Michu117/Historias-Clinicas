import React from 'react';

interface AuditInfoProps {
  timestamp: string | null;
  queryDuration?: number;
  resultCount?: number;
  userId?: string;
  userRole?: string;
}

export default function AuditInfo({
  timestamp,
  queryDuration,
  resultCount,
  userId,
  userRole
}: AuditInfoProps): JSX.Element {
  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleString('es-AR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex gap-3">
        <div className="flex-shrink-0 pt-0.5">
          <svg
            className="h-5 w-5 text-blue-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-blue-900">Trazabilidad (RNF-06)</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-800">
            {timestamp && (
              <p>
                <span className="font-medium">Consulta realizada:</span> {formatDate(timestamp)}
              </p>
            )}
            {queryDuration !== undefined && (
              <p>
                <span className="font-medium">Duración:</span> {queryDuration.toFixed(2)}ms
              </p>
            )}
            {resultCount !== undefined && (
              <p>
                <span className="font-medium">Registros:</span> {resultCount}
              </p>
            )}
            {userId && (
              <p>
                <span className="font-medium">Usuario:</span> {userId}
              </p>
            )}
            {userRole && (
              <p>
                <span className="font-medium">Rol:</span> {userRole}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
