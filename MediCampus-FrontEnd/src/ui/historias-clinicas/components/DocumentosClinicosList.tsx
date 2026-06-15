import React from 'react'

interface DocumentosClinicosListProps {
  historiaClinicaId: string
}

const DocumentosClinicosList: React.FC<DocumentosClinicosListProps> = ({
  historiaClinicaId,
}) => {
  return (
    <div>
      <h3>Documentos Clínicos</h3>
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Encabezado</th>
            <th>Tipo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={4}>
              <span>{historiaClinicaId}</span> - No hay documentos adjuntos
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default DocumentosClinicosList

