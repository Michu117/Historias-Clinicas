import { Button } from '../../../ui/components/Button';
import { Card } from '../../../ui/components/Card';

export const DetalleHistoriaClinicaPage = () => {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-10">
      <header className="space-y-3">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Volver
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Detalle de Historia Clínica</h1>
          <p className="text-sm text-slate-600">Página base preparada para la siguiente fase de conexión con el backend.</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-medium text-slate-900">Datos generales</h2>
          <p className="mt-2 text-sm text-slate-500">Placeholder: aquí se mostrará el paciente, identificaciones, estado y responsable.</p>
        </Card>

        <Card>
          <h2 className="text-lg font-medium text-slate-900">Antecedentes clínicos</h2>
          <p className="mt-2 text-sm text-slate-500">Placeholder: listado de antecedentes asociados a la historia seleccionada.</p>
        </Card>

        <Card className="md:col-span-2">
          <h2 className="text-lg font-medium text-slate-900">Casos clínicos</h2>
          <p className="mt-2 text-sm text-slate-500">Placeholder: sección para casos clínicos relacionados.</p>
        </Card>
      </section>
    </main>
  );
};


