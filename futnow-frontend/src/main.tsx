import React from 'react';
import ReactDOM from 'react-dom/client';
import L from 'leaflet';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

type LeafletDefaultIconPrototype = L.Icon.Default & {
  _getIconUrl?: string;
};

// Solución para que los iconos de Leaflet carguen correctamente con Vite.
delete (L.Icon.Default.prototype as LeafletDefaultIconPrototype)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
