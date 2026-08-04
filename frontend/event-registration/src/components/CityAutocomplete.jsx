import { useState, useRef, useEffect } from 'react';
import { MapPinned } from 'lucide-react';
import { SOUTH_INDIAN_CITIES } from '../constants/cities';

export default function CityAutocomplete({ id, name, value, onChange }) {
  const [query, setQuery] = useState(value || '');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const filtered =
    query.trim() === ''
      ? []
      : SOUTH_INDIAN_CITIES.filter((c) =>
          c.toLowerCase().includes(query.trim().toLowerCase())
        ).slice(0, 8);

  function selectCity(city) {
    setQuery(city);
    onChange(city);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleInputChange(e) {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    setOpen(v.trim() !== '');
    setActiveIndex(-1);
  }

  function handleKeyDown(e) {
    if (!open || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectCity(filtered[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
        <MapPinned size={16} />
      </span>
      <input
        id={id}
        name={name}
        type="text"
        autoComplete="off"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter your city"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-base text-slate-800 placeholder:text-slate-400 transition-colors duration-300 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40 sm:text-sm"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg sm:max-h-48">
          {filtered.map((c, i) => (
            <li
              key={c}
              onMouseDown={() => selectCity(c)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`cursor-pointer px-3 py-3 text-sm sm:py-2 ${
                i === activeIndex ? 'bg-brand-teal/10 text-brand-navy' : 'hover:bg-slate-50'
              }`}
            >
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}