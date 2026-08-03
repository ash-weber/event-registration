import { useState } from 'react';
import { UserRound, Mail, Phone, Building2, IdCard, MapPinned, Loader2, Leaf, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const initialForm = {
  fullName: '',
  email: '',
  mobileNumber: '',
  company: '',
  designation: '',
  city: '',
};

const fields = [
  { name: 'fullName', label: 'Full Name', icon: UserRound, placeholder: 'Enter your full name', required: true },
  { name: 'email', label: 'Email Address', icon: Mail, placeholder: 'Enter your email address', required: true, type: 'email' },
  { name: 'mobileNumber', label: 'Mobile Number', icon: Phone, placeholder: 'Enter your mobile number', required: true, type: 'tel' },
  { name: 'company', label: 'Company / Organization', icon: Building2, placeholder: 'Enter your company or organization' },
  { name: 'designation', label: 'Designation', icon: IdCard, placeholder: 'Enter your designation' },
  { name: 'city', label: 'City', icon: MapPinned, placeholder: 'Enter your city' },
];

function validate(form) {
  const errors = {};
  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  else if (form.fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
  else if (!/^[a-zA-Z\s.'-]+$/.test(form.fullName.trim())) errors.fullName = 'Full name contains invalid characters';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';

  if (!form.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
  else if (!/^[0-9+\-\s]{7,20}$/.test(form.mobileNumber.trim())) errors.mobileNumber = 'Enter a valid mobile number';

  return errors;
}

export default function RegistrationForm({ onSuccess }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [hovered, setHovered] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/registrations', form);
      toast.success('Registration successful!');
      onSuccess(res.data.data);
    } catch (err) {
      const res = err.response;
      if (res?.status === 422 && Array.isArray(res.data?.errors)) {
        const fieldErrors = {};
        res.data.errors.forEach((e) => {
          fieldErrors[e.field] = e.message;
        });
        setErrors(fieldErrors);
        toast.error('Please check the highlighted fields.');
      } else if (res?.status === 409) {
        toast.error(res.data?.message || 'This email is already registered.');
      } else {
        toast.error(res?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative w-full max-w-md rounded-2xl p-[2px] bg-[length:300%_300%] bg-gradient-to-r from-brand-navy via-sky-400 via-brand-lime via-sky-400 to-brand-navy shadow-xl transition-all duration-500 ease-out"
      style={{
        animation: `border-spin ${hovered ? '1.8s' : '5s'} linear infinite`,
        boxShadow: hovered
          ? '0 0 28px 2px rgba(56,189,248,0.45)'
          : '0 10px 25px -8px rgba(15,23,42,0.25)',
      }}
    >
      <style>{`
        @keyframes border-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div className="w-full rounded-[calc(1rem-2px)] bg-white p-5 sm:p-6 transition-transform duration-500 ease-out">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-navy text-white transition-transform duration-500 ease-out">
            <UserRound size={20} />
          </span>
          <div>
            <h2 className="text-xl font-bold leading-tight text-brand-navy">Event Registration</h2>
            <p className="text-xs text-slate-500">Fill  your details to register</p>
          </div>
        </div>

        <div className="my-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-200" />
          <Leaf size={12} className="text-brand-lime" />
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          {fields.map(({ name, label, icon: Icon, placeholder, required, type }) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                  <Icon size={16} />
                </span>
                <input
                  id={name}
                  name={name}
                  type={type || 'text'}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[name])}
                  aria-describedby={errors[name] ? `${name}-error` : undefined}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                    errors[name] ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                  }`}
                />
              </div>
              {errors[name] && (
                <p id={`${name}-error`} className="mt-1 text-xs text-red-500">
                  {errors[name]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-navy via-sky-500 to-brand-lime py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Registering...
              </>
            ) : (
              <>Register Now &rarr;</>
            )}
          </button>

          <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
            <ShieldCheck size={12} className="text-brand-lime" />
            Your registration is secure. We&apos;ll never share your information.
          </p>
        </form>
      </div>
    </div>
  );
}