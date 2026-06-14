import React from 'react'
import type { AntecedenteClinico } from '../types/antecedenteClinico.types'

interface AntecedentesClinicosListProps {
  historiaClinicaId: string
  antecedentes?: AntecedenteClinico[]
}

/**
 * Lista de antecedentes clínicos. En fase verde debe recibir datos reales.
 */
const AntecedentesClinicosList: React.FC<AntecedentesClinicosListProps> = ({ historiaClinicaId, antecedentes = [] }) => {
  const items = antecedentes.filter(a => String(a.historiaClinicaId) === String(historiaClinicaId));

  return (
    <div>
      <h3>Antecedentes Clínicos</h3>
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <span>{historiaClinicaId}</span> - No hay antecedentes registrados
              </td>
            </tr>
          ) : (
            items.map((a) => (
              <tr key={a.id}>
                <td>{a.tipo}</td>
                <td>{a.descripcion}</td>
                <td>{a.fecha}</td>
                <td>
                  <button>Editar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AntecedentesClinicosList

