import { useNavigate } from 'react-router-dom';
import RegistrationForm from '../components/RegistrationForm';

export default function RegistrationPage() {
  const navigate = useNavigate();

  function handleSuccess(data) {
    navigate(`/pass/${data.registrationId}`, { state: { data } });
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-8">
      <RegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}