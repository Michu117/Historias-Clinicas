import React, { useState } from 'react';
import reportService from '../service/reportService';
import AuditInfo from './AuditInfo';

type Props = {
  hasPermission?: boolean;
  filters?: any;
};

const ExportButtonGroup: React.FC<Props> = ({ hasPermission = true, filters = {} }) => {
  const [state, setState] = useState<'idle' | 'queued' | 'error' | 'done'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleExport = async () => {
    if (!hasPermission) return;
    setState('idle');
    setErrorMsg(null);
    const payload = {
      filters,
      format: 'csv',
      audit: {
        userId: (typeof localStorage !== 'undefined' && localStorage.getItem('userId')) || 'anon',
        timestamp: new Date().toISOString()
      }
    };
    try {
      const res = await reportService.downloadExport(payload as any);
      if (!res.success) {
        setState('error');
        setErrorMsg(res.message || 'Error en export');
        return;
      }
      setState('done');
    } catch (e: any) {
      setState('error');
      setErrorMsg(e?.message || 'Error desconocido');
    }
  };

  return (
    <div>
      <div className="inline-flex items-center gap-2">
        <button aria-label="Exportar" onClick={handleExport} disabled={!hasPermission} className="btn btn-sm">
          Exportar
        </button>
      </div>

      {state === 'queued' && <div role="status">En cola (queued)</div>}
      {state === 'error' && <div role="alert">Error: {errorMsg}</div>}

      <div style={{ display: 'none' }}>
        <AuditInfo timestamp={new Date().toISOString()} userId={ (typeof localStorage !== 'undefined' && localStorage.getItem('userId')) || undefined } />
      </div>
    </div>
  );
};

export default ExportButtonGroup;

