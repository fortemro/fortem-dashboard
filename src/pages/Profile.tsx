
import { ProfileForm } from '@/components/ProfileForm';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Profilul Meu</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Gestionează informațiile din profilul tău personal
          </p>
        </div>
        <ProfileForm />
      </div>
    </div>
  );
}
