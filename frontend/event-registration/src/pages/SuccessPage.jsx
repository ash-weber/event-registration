import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import SuccessCard from '../components/SuccessCard';
import api from '../api/axios';

export default function SuccessPage() {
  const { registrationId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [data, setData] = useState(location.state?.data || null);
  const [loading, setLoading] = useState(!location.state?.data);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state?.data) return; // already have it, skip fetch
    let cancelled = false;
    setLoading(true);
    api
      .get(`/registrations/${registrationId}`)
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      })
      .catch(() => {
        if (!cancelled) setError('Registration not found.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [registrationId, location.state]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Loading your registration...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-slate-500">
        <p>{error || 'Registration not found.'}</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm font-semibold text-blue-900 hover:underline"
        >
          Back to registration
        </button>
      </div>
    );
  }

  return (
    <SuccessCard
      data={data}
      onViewQr={() => navigate(`/pass/${registrationId}`, { state: { data } })}
      onReset={() => navigate('/')}
    />
  );
}