import { useState } from 'react';
import { fetchApiRoot, getApiRootUrl } from './api';

export default function App() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleCheckBackend = async () => {
    setStatus('loading');
    setMessage('');

    try {
      const data = await fetchApiRoot();
      setStatus('ready');
      setMessage(data.message);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <main className="shell">
      <section className="card hero">
        <p className="eyebrow">MediCampus FrontEnd</p>
        <h1>Frontend React para consumir el backend Django</h1>
        <p className="copy">
          Esta base apunta al backend en <strong>{getApiRootUrl()}</strong> y trae una prueba simple para validar que la API responde.
        </p>

        <div className="actions">
          <button type="button" onClick={handleCheckBackend} disabled={status === 'loading'}>
            {status === 'loading' ? 'Verificando...' : 'Probar backend'}
          </button>
          <span className={`badge badge-${status}`}>{status === 'idle' ? 'listo' : status}</span>
        </div>

        {message ? <p className="result">{message}</p> : null}
      </section>

      <section className="card endpoints">
        <h2>Prueba inicial</h2>
        <p>
          El botón consulta la raíz del backend Django. Si responde, el frontend ya está listo para conectarse a los endpoints de autenticación,
          historias, agendas y reportes.
        </p>
        <ul>
          <li>/api/v1/auth/</li>
          <li>/api/v1/historias/</li>
          <li>/api/v1/agendas/</li>
          <li>/api/v1/reportes/</li>
        </ul>
      </section>
    </main>
  );
}