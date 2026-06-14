import React from 'react'
import { CasoClinico } from "../types";

type Props = {
  historiaClinicaId: string
  casos?: CasoClinico[]
}

const CasosClinicosTable: React.FC<Props> = ({ historiaClinicaId, casos = [] }) => {
  return (
    <section>
      <h2>Casos Clínicos</h2>
      <p><strong>Historia Clínica:</strong> {historiaClinicaId}</p>

      <table>
        <thead>
          <tr>
            <th>Descripción</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {casos.length === 0 ? (
            <tr>
              <td colSpan={4}>No hay casos clínicos registrados.</td>
            </tr>
          ) : (
            casos.map((caso) => (
              <tr key={caso.id}>
                <td>{caso.descripcion || 'Sin descripción'}</td>
                <td>{caso.prioridad || 'Sin prioridad'}</td>
                <td>{caso.estado || 'Sin estado'}</td>
                <td>
                  <button type="button">Editar</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </section>
  )
}

export default CasosClinicosTable