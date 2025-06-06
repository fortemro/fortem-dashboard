
import { ComandaForm } from '@/components/ComandaForm';

export default function Comanda() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Comandă Nouă</h1>
          <p className="text-gray-600 mt-2">
            Creează o comandă nouă cu calculări automate pentru cantități
          </p>
        </div>
        <ComandaForm />
      </div>
    </div>
  );
}
