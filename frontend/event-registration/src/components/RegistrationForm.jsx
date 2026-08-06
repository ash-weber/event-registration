import { useState } from 'react';
import { UserRound, Mail, Phone, Building2, IdCard, Users, Loader2, Leaf, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import logoImg from '../assets/logo.png';
import CityAutocomplete from './CityAutocomplete';

const initialForm = {
  fullName: '',
  email: '',
  mobileNumber: '',
  company: '',
  designation: '',
  city: '',
  numberOfAttendees: '',
};

const textFields = [
  { name: 'fullName', label: 'Full Name', icon: UserRound, placeholder: 'Enter your full name', required: true },
  { name: 'email', label: 'Email Address', icon: Mail, placeholder: 'Enter your email address', required: true, type: 'email' },
  { name: 'company', label: 'Company / Organization', icon: Building2, placeholder: 'Company or organization' },
  { name: 'designation', label: 'Designation', icon: IdCard, placeholder: 'Enter your designation' },
];

const MOBILE_REGEX = /^[6-9]\d{9}$/;

function validate(form) {
  const errors = {};

  if (!form.fullName.trim()) errors.fullName = 'Full name is required';
  else if (form.fullName.trim().length < 2) errors.fullName = 'Full name must be at least 2 characters';
  else if (form.fullName.trim().length > 120) errors.fullName = 'Full name is too long';
  else if (!/^[a-zA-Z\s.'-]+$/.test(form.fullName.trim())) errors.fullName = 'Full name contains invalid characters';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Enter a valid email address';
  else if (form.email.trim().length > 160) errors.email = 'Email is too long';

  if (!form.mobileNumber.trim()) errors.mobileNumber = 'Mobile number is required';
  else if (!MOBILE_REGEX.test(form.mobileNumber.trim())) {
    errors.mobileNumber = 'Enter a valid 10-digit mobile number';
  }

  if (form.company && form.company.trim().length > 160) errors.company = 'Company name is too long';
  if (form.designation && form.designation.trim().length > 120) errors.designation = 'Designation is too long';
  if (form.city && form.city.trim().length > 100) errors.city = 'City name is too long';

  if (form.numberOfAttendees) {
    if (!/^\d+$/.test(form.numberOfAttendees) || Number(form.numberOfAttendees) < 1) {
      errors.numberOfAttendees = 'Enter a valid number of attendees';
    } else if (Number(form.numberOfAttendees) > 50) {
      errors.numberOfAttendees = 'Maximum 50 attendees allowed';
    }
  }

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

  function handleMobileChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setForm((f) => ({ ...f, mobileNumber: digitsOnly }));
    if (errors.mobileNumber) setErrors((er) => ({ ...er, mobileNumber: undefined }));
  }

  function handleAttendeesChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 2);
    setForm((f) => ({ ...f, numberOfAttendees: digitsOnly }));
    if (errors.numberOfAttendees) setErrors((er) => ({ ...er, numberOfAttendees: undefined }));
  }

  function handleCityChange(val) {
    setForm((f) => ({ ...f, city: val }));
    if (errors.city) setErrors((er) => ({ ...er, city: undefined }));
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
      const payload = {
        ...form,
        numberOfAttendees: form.numberOfAttendees ? Number(form.numberOfAttendees) : undefined,
      };
      const res = await api.post('/registrations', payload);
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
        const message = res.data?.message || 'This mobile number or email is already registered.';
        const errArray = Array.isArray(res.data?.errors) ? res.data.errors : [];
        if (errArray.length > 0) {
          const fieldErrors = {};
          errArray.forEach((e) => {
            fieldErrors[e.field] = e.message;
          });
          setErrors(fieldErrors);
        } else {
          const field = message.toLowerCase().includes('mobile') ? 'mobileNumber' : 'email';
          setErrors((er) => ({ ...er, [field]: message }));
        }
        toast.error(message);
      } else if (!res) {
        toast.error('Network error. Please check your connection and try again.');
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
      className="relative w-full max-w-md mx-auto rounded-2xl p-[2px] bg-[length:300%_300%] bg-gradient-to-r from-brand-navy via-sky-400 via-brand-lime via-sky-400 to-brand-navy shadow-xl transition-all duration-500 ease-out"
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

      <div className="w-full rounded-[calc(1rem-2px)] bg-white p-4 sm:p-6 transition-transform duration-500 ease-out">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <span className="flex h-14 sm:h-20 flex-shrink-0 items-center justify-center transition-transform duration-500 ease-out">
            <img
              src={logoImg}
              alt="Interio & Exterio Expo Logo"
              className="h-full w-auto object-contain"
            />
          </span>
          <div className="min-w-0 text-center">
            <h2 className="text-lg sm:text-2xl font-extrabold leading-tight text-brand-navy break-words">
              INTERIO & EXTERIO EXPO 2026
            </h2>
            <p className="text-[11px] sm:text-sm text-slate-500 mt-0.5">
              Fill your details to register
            </p>
          </div>
        </div>

        <div className="my-4 flex items-center gap-2">
          <span className="h-px flex-1 bg-slate-200" />
          <Leaf size={12} className="text-brand-lime" />
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-3">
          <div>
            <label htmlFor="fullName" className="mb-1 block text-xs font-medium text-slate-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-600">
                <UserRound size={16} />
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                aria-invalid={Boolean(errors.fullName)}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                  errors.fullName ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                }`}
              />
            </div>
            {errors.fullName && (
              <p id="fullName-error" className="mt-1 text-xs text-red-500">
                {errors.fullName}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-medium text-slate-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-600">
                <Mail size={16} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                  errors.email ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                }`}
              />
            </div>
            {errors.email && (
              <p id="email-error" className="mt-1 text-xs text-red-500">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="mobileNumber" className="mb-1 block text-xs font-medium text-slate-700">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-600">
                <Phone size={16} />
              </span>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={10}
                value={form.mobileNumber}
                onChange={handleMobileChange}
                placeholder="10-digit mobile number"
                aria-invalid={Boolean(errors.mobileNumber)}
                aria-describedby={errors.mobileNumber ? 'mobileNumber-error' : undefined}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                  errors.mobileNumber ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                }`}
              />
            </div>
            {errors.mobileNumber && (
              <p id="mobileNumber-error" className="mt-1 text-xs text-red-500">
                {errors.mobileNumber}
              </p>
            )}
          </div>

          {textFields.slice(2).map(({ name, label, icon: Icon, placeholder }) => (
            <div key={name}>
              <label htmlFor={name} className="mb-1 block text-xs font-medium text-slate-700">
                {label}
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-600">
                  <Icon size={16} />
                </span>
                <input
                  id={name}
                  name={name}
                  type="text"
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  aria-invalid={Boolean(errors[name])}
                  className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 placeholder:text-[13px] sm:placeholder:text-sm placeholder:truncate transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                    errors[name] ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                  }`}
                />
              </div>
              {errors[name] && (
                <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
              )}
            </div>
          ))}

          <div>
            <label htmlFor="city" className="mb-1 block text-xs font-medium text-slate-700">
              City
            </label>
            <CityAutocomplete
              id="city"
              name="city"
              value={form.city}
              onChange={handleCityChange}
            />
            {errors.city && (
              <p id="city-error" className="mt-1 text-xs text-red-500">
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="numberOfAttendees" className="mb-1 block text-xs font-medium text-slate-700">
              No. of People Attending <span className="text-slate-400">(optional)</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-blue-600">
                <Users size={16} />
              </span>
              <input
                id="numberOfAttendees"
                name="numberOfAttendees"
                type="number"
                inputMode="numeric"
                min="1"
                max="50"
                value={form.numberOfAttendees}
                onChange={handleAttendeesChange}
                placeholder="e.g. 2"
                aria-invalid={Boolean(errors.numberOfAttendees)}
                aria-describedby={errors.numberOfAttendees ? 'numberOfAttendees-error' : undefined}
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-base sm:text-sm text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 ${
                  errors.numberOfAttendees ? 'border-red-400' : 'border-slate-200 focus:border-brand-teal'
                }`}
              />
            </div>
            {errors.numberOfAttendees && (
              <p id="numberOfAttendees-error" className="mt-1 text-xs text-red-500">
                {errors.numberOfAttendees}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-brand-navy via-sky-500 to-brand-lime py-3.5 sm:py-3 text-sm font-semibold text-white transition-all duration-300 hover:opacity-90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Registering...
              </>
            ) : (
              <>Register Now &rarr;</>
            )}
          </button>

          <p className="flex items-start justify-center gap-1.5 text-[11px] text-slate-400 px-4">
            <ShieldCheck size={12} className="mt-0.5 flex-shrink-0 text-brand-lime" />
            <span className="text-left leading-snug">
              Your registration is secure. We&apos;ll never share your information.
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}