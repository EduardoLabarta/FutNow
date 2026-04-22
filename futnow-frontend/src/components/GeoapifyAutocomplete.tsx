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
    address_line1?: string;
    address_line2?: string;
    result_type?: string;
    lat: number;
    lon: number;
    category?: string;
    categories?: string[];
  };
}

const API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY as string | undefined;

// Sport-related categories for the Places API (only concrete venues)
const SPORT_CATEGORIES = [
  'sport.pitch',
  'sport.sports_centre',
  'sport.stadium',
  'activity.sport_club',
  'building.sport',
].join(',');

// Result types that are too generic — we discard these from fallback results
const GENERIC_RESULT_TYPES = new Set([
  'city',
  'county',
  'state',
  'country',
  'postcode',
  'region',
  'municipality',
]);

export default function GeoapifyAutocomplete({
  onPlaceSelect,
  onManualInput,
  placeholder = 'Buscar instalación deportiva...',
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
      // 1) Try the Places API filtered by concrete sport categories
      const placesUrl = `https://api.geoapify.com/v2/places?categories=${SPORT_CATEGORIES}&name=${encodeURIComponent(text)}&bias=countrycode:es&limit=5&apiKey=${API_KEY}`;
      const placesRes = await fetch(placesUrl);

      let features: GeoapifyFeature[] = [];

      if (placesRes.ok) {
        const placesData = await placesRes.json();
        features = placesData.features || [];
      }

      // 2) If not enough sport results, fall back to general autocomplete
      //    but filter out overly generic results (cities, regions, etc.)
      if (features.length < 3) {
        const autocompleteUrl = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(text)}&limit=10&apiKey=${API_KEY}`;
        const autocompleteRes = await fetch(autocompleteUrl);

        if (autocompleteRes.ok) {
          const autocompleteData = await autocompleteRes.json();
          const rawResults: GeoapifyFeature[] = autocompleteData.features || [];

          // Only keep concrete results (streets, amenities, buildings, etc.)
          const concreteResults = rawResults.filter(f => {
            const rt = f.properties.result_type;
            if (!rt) return true; // if no result_type, keep it
            return !GENERIC_RESULT_TYPES.has(rt);
          });

          // Merge: sport results first, then concrete fallback (no duplicates by coordinates)
          const existingCoords = new Set(features.map(f => `${f.properties.lat},${f.properties.lon}`));
          for (const r of concreteResults) {
            const key = `${r.properties.lat},${r.properties.lon}`;
            if (!existingCoords.has(key)) {
              features.push(r);
              existingCoords.add(key);
            }
            if (features.length >= 5) break;
          }
        }
      }

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

    // Debounce API calls (350ms)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchSuggestions(text);
    }, 350);
  };

  const handleSelect = (feature: GeoapifyFeature) => {
    const props = feature.properties;
    const result: PlaceResult = {
      name: props.name || props.address_line1 || '',
      address: props.formatted || props.address_line2 || '',
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
          maxHeight: '260px',
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
              <div style={{ fontWeight: 500 }}>{feat.properties.name || feat.properties.address_line1 || 'Sin nombre'}</div>
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
          Sugerencias de ubicación no disponibles. Puedes escribir la dirección manualmente.
        </p>
      )}
    </div>
  );
}
