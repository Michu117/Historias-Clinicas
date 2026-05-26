import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

describe('HU-11 - Audit logs listing (ROJO)', () => {
  it('frontend lists audit logs with user, date, IP, operation and risk level', async () => {
    // The component and API do not exist yet; this test should fail (ROJO)
    const mod = await import('../components/AuditLogTable')
    const AuditLogTable = mod.default || mod.AuditLogTable

    render(React.createElement(AuditLogTable, {}))

    // Expect a table to be rendered
    expect(screen.queryByRole('table')).not.toBeNull()

    // Expect column headers for required fields
    expect(screen.getByText(/usuario|user/i)).toBeDefined()
    expect(screen.getByText(/fecha|date|timestamp/i)).toBeDefined()
    expect(screen.getByText(/ip/i)).toBeDefined()
    expect(screen.getByText(/operaci[oó]n|operation/i)).toBeDefined()
    expect(screen.getByText(/riesgo|risk|level/i)).toBeDefined()
  })
})
