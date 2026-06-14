import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

const buildJwt = (payload: Record<string, unknown>): string => {
  const header = { alg: 'none', typ: 'JWT' };
  const encode = (value: Record<string, unknown>) => btoa(JSON.stringify(value)).replace(/=+$/, '');
  return `${encode(header)}.${encode(payload)}.signature`;
};

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('muestra un aviso de acceso restringido cuando no hay token profesional', () => {
    window.history.pushState({}, '', '/agendas/mi-agenda');

    render(<App />);

    expect(screen.getByText(/acceso restringido/i)).toBeInTheDocument();
    expect(screen.getByText(/debes iniciar sesión como profesional/i)).toBeInTheDocument();
  });

  it('renderiza MiAgenda cuando el token es de rol PROFESIONAL', () => {
    window.history.pushState({}, '', '/agendas/mi-agenda');
    const token = buildJwt({ user_id: 1, email: 'pro@hospital.com', rol: 'PROFESIONAL', exp: Math.floor(Date.now() / 1000) + 3600 });
    localStorage.setItem('access_token', token);

    render(<App />);

    expect(screen.getByText(/mi agenda/i)).toBeInTheDocument();
  });
});
