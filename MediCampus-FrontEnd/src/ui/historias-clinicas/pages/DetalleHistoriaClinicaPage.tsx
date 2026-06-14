import { HistoriasClinicasDashboardLayout } from '../components/HistoriasClinicasDashboardLayout';
import { HistoriasClinicasHeader } from '../components/HistoriasClinicasHeader';
import { DetailBlock } from '../components/DetailBlock';

export const DetalleHistoriaClinicaPage = () => {
  return (
    <HistoriasClinicasDashboardLayout>
      <HistoriasClinicasHeader
        title="Detalle de Historia Clínica"
        subtitle="Página base preparada para la siguiente fase de conexión con el backend."
        backTo="/historias"
      />

      <section className="grid min-h-0 flex-1 gap-4 md:grid-cols-2">
        <DetailBlock title="Datos generales">
          Placeholder: aquí se mostrará el paciente, identificaciones, estado y responsable.
        </DetailBlock>

        <DetailBlock title="Antecedentes clínicos">
          Placeholder: listado de antecedentes asociados a la historia seleccionada.
        </DetailBlock>

        <DetailBlock title="Casos clínicos" className="md:col-span-2">
          Placeholder: sección para casos clínicos relacionados.
        </DetailBlock>
      </section>
    </HistoriasClinicasDashboardLayout>
  );
};


