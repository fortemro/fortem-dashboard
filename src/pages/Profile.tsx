
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profilul Meu</h1>
          <p className="text-gray-600 mt-2">
            Gestionează informațiile din profilul tău personal
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
