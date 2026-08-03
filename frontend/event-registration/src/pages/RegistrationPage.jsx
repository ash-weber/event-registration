import { useNavigate } from 'react-router-dom';
import HeroPanel from '../components/HeroPanel';
import RegistrationForm from '../components/RegistrationForm';

export default function RegistrationPage() {
  const navigate = useNavigate();

  function handleSuccess(data) {
   
    navigate(`/success/${data.registrationId}`, { state: { data } });
  }

  return (
    <HeroPanel>
      <RegistrationForm onSuccess={handleSuccess} />
    </HeroPanel>
  );
}