import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('HU-10 - Access control and listing (ROJO)', () => {
  it('1) frontend lists users according to authenticated user role', async () => {
    // simulate JWT claims for role
    vi.mock('../utils/jwtUtils', () => ({
      getToken: () => 'stub-token',
      isExpired: () => false,
      parseClaims: () => ({ roles: ['Administrador'], permissions: ['users.read'] })
    }))

    // attempt to import UserTable (should not exist yet — test will fail)
    const mod = await import('../components/UserTable')
    const UserTable = mod.default || mod.UserTable

    render(React.createElement(UserTable, { role: 'Administrador' }))
    // expectation: rows rendered for admin (will fail until implemented)
    expect(screen.queryByRole('table')).not.toBeNull()
  })

  it('2) only authorized users can access Seguridad module', async () => {
    vi.mock('../hooks/useAuthorization', () => ({
      useAuthorization: () => ({ canRender: (p: string) => p === 'security.access' })
    }))

    const mod = await import('../components/ProtectedRoute')
    const Protected = mod.default || mod.ProtectedRoute

    render(React.createElement(Protected, { permission: 'security.access' }, React.createElement('div', { 'data-testid': 'inside' }, 'Inside')))
    expect(screen.getByTestId('inside')).toBeDefined()
  })

  it('3) users without permissions receive HTTP 403', async () => {
    vi.mock('../hooks/useAuthorization', () => ({
      useAuthorization: () => ({ canRender: () => false })
    }))

    const mod = await import('../components/ProtectedRoute')
    const Protected = mod.default || mod.ProtectedRoute

    render(React.createElement(Protected, { permission: 'security.access' }, React.createElement('div', { 'data-testid': 'inside' }, 'Inside')))

    // Expect secret NOT to be visible and 403 UI to appear (will fail until component implemented)
    expect(screen.queryByTestId('inside')).toBeNull()
    expect(screen.getByText(/403|Forbidden|Acceso denegado|No autorizado/i)).toBeDefined()
  })
})
