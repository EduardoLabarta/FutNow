import { useState, useRef, useEffect, useCallback } from 'react';

export interface PlaceResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
}

interface GeoapifyAutocompleteProps {
  onPlaceSelect: (place: PlaceResult) => void;
  onManualInput: (text: string) => void;
  placeholder?: string;
  required?: boolean;
  value?: string;
}

interface GeoapifyFeature {
  properties: {
    name?: string;
    formatted?: string;
    lat: number;
    lon: number;
  };
}

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

export default function GeoapifyAutocomplete({
  onPlaceSelect,
  onManualInput,
  placeholder = 'Buscar ubicación...',
  required = false,
  value = '',
}: GeoapifyAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<GeoapifyFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [apiFailed, setApiFailed] = useState(!API_KEY);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!API_KEY || text.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=5&apiKey=${API_KEY}`;
      const res = await fetch(url);

      if (!res.ok) {
        setApiFailed(true);
        setSuggestions([]);
        return;
      }

      const data = await res.json();
      const features: GeoapifyFeature[] = data.features || [];
      setSuggestions(features);
      setShowDropdown(features.length > 0);
    } catch {
      setApiFailed(true);
      setSuggestions([]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);
    onManualInput(text);

    // Debounce API calls (300ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(text);
    }, 300);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    const result: PlaceResult = {
      name: props.name || '',
      address: props.formatted || '',
      lat: props.lat,
      lng: props.lon,
    };
    setInputValue(result.name || result.address);
    setSuggestions([]);
    setShowDropdown(false);
    onPlaceSelect(result);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        className="form-control"
        type="text"
        placeholder={placeholder}
        required={required}
        value={inputValue}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
        autoComplete="off"
      />

      {/* Dropdown de sugerencias */}
      {showDropdown && suggestions.length > 0 && (
        <ul style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 100,
          margin: '4px 0 0 0',
          padding: 0,
          listStyle: 'none',
          backgroundColor: 'var(--card-bg, #18181b)',
          border: '1px solid var(--border-color, #27272a)',
          borderRadius: 'var(--radius-sm, 8px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          maxHeight: '220px',
          overflowY: 'auto',
        }}>
          {suggestions.map((feat, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(feat)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                color: 'var(--text-main, #fafafa)',
                borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-color, #27272a)' : 'none',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = 'var(--surface-hover, #27272a)'; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <div style={{ fontWeight: 500 }}>{feat.properties.name || 'Sin nombre'}</div>
              {feat.properties.formatted && (
                <div style={{ fontSize: '12px', color: 'var(--text-muted, #a1a1aa)', marginTop: '2px' }}>
                  {feat.properties.formatted}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {apiFailed && (
        <p style={{
          margin: '6px 0 0 0',
          fontSize: '12px',
          color: 'var(--warning, #f5a524)',
          fontWeight: 500,
        }}>
          ⚠ Sugerencias de ubicación no disponibles. Puedes escribir la dirección manualmente.
        </p>
      )}
    </div>
  );
}
