import React from 'react'

type Props = {
  historiaClinicaId: string
}

const DocumentoClinicoForm: React.FC<Props> = ({ historiaClinicaId }) => {
  return (
    <form>
      <label htmlFor="fecha">Fecha del documento</label>
      <input id="fecha" type="date" required />

      <label htmlFor="encabezado">Encabezado</label>
      <input id="encabezado" required />

      <label htmlFor="cuerpo">Cuerpo</label>
      <textarea id="cuerpo" required />

      <label htmlFor="tipo">Tipo de documento</label>
      <select id="tipo" required>
        <option value="">Seleccione</option>
        <option value="resultado-consulta">Resultado de Consulta</option>
        <option value="formulario">Formulario</option>
        <option value="consentimiento">Consentimiento</option>
        <option value="certificado">Certificado</option>
      </select>

      <button type="submit">Adjuntar</button>
    </form>
  )
}

export default DocumentoClinicoForm
