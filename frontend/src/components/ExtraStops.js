import React, { useState, useRef } from 'react';
import { MapPin, X } from 'lucide-react';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import { MAX_EXTRA_STOPS, emptyStop } from '@/utils/routeStops';

export const stopLabels = {
  en: { dest1: 'Destination 1', dest2: 'Destination 2 (optional)', dest3: 'Final destination (optional)', addStop: '+ Add stop', remove: 'Remove' },
  fr: { dest1: 'Destination 1', dest2: 'Destination 2 (optionnel)', dest3: 'Destination finale (optionnel)', addStop: '+ Ajouter un arrêt', remove: 'Supprimer' },
  ru: { dest1: 'Пункт назначения 1', dest2: 'Пункт назначения 2 (необязательно)', dest3: 'Конечный пункт (необязательно)', addStop: '+ Добавить остановку', remove: 'Удалить' },
  hy: { dest1: 'Ուղղություն 1', dest2: 'Ուղղություն 2 (ըստ ցանկության)', dest3: 'Վերջնական ուղղություն (ըստ ցանկության)', addStop: '+ Ավելացնել կանգառ', remove: 'Հեռացնել' },
  es: { dest1: 'Destino 1', dest2: 'Destino 2 (opcional)', dest3: 'Destino final (opcional)', addStop: '+ Añadir parada', remove: 'Eliminar' },
};

// State + immune safe refs for up to MAX_EXTRA_STOPS extra destinations
export const useExtraStops = () => {
  const [extraStops, setExtraStops] = useState([]);
  const extraStopRefs = useRef([]);

  const addExtraStop = () => {
    setExtraStops(prev => {
      if (prev.length >= MAX_EXTRA_STOPS) return prev;
      extraStopRefs.current[prev.length] = { latitude: null, longitude: null, placeId: null, address: '' };
      return [...prev, emptyStop()];
    });
  };

  const removeExtraStop = (index) => {
    setExtraStops(prev => prev.filter((_, i) => i !== index));
    extraStopRefs.current.splice(index, 1);
  };

  const handleExtraStopChange = (index, data) => {
    if (data.latitude != null) {
      extraStopRefs.current[index] = { latitude: data.latitude, longitude: data.longitude, placeId: data.placeId, address: data.address };
    } else if (data.placeId) {
      extraStopRefs.current[index] = { ...extraStopRefs.current[index], placeId: data.placeId, address: data.address };
    }
    setExtraStops(prev => prev.map((s, i) => (i === index ? data : s)));
  };

  return { extraStops, extraStopRefs, addExtraStop, removeExtraStop, handleExtraStopChange };
};

export const ExtraStops = ({ stops, onAdd, onRemove, onChange, language, idPrefix }) => {
  const L = stopLabels[language] || stopLabels.en;
  return (
    <>
      {stops.map((stop, i) => {
        const n = i + 2; // Destination 2, then Final destination
        const label = i === 0 ? L.dest2 : L.dest3;
        return (
          <div key={i} data-testid={`${idPrefix}-stop-${n}-row`}>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor={`${idPrefix}-stop-${n}`} className="block text-gray-700 font-medium text-sm">{label}</label>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                data-testid={`remove-stop-${n}`}
              >
                <X className="w-3 h-3" />{L.remove}
              </button>
            </div>
            <PlacesAutocomplete
              id={`${idPrefix}-stop-${n}`}
              value={stop}
              onChange={(data) => onChange(i, data)}
              placeholder={label}
              icon={<MapPin className="w-4 h-4 text-orange-400" aria-hidden="true" />}
              className="w-full pl-9 pr-3 py-3 bg-gray-50 text-gray-900 rounded-lg border border-gray-200 focus:border-[#2ecc71] focus:ring-1 focus:ring-[#2ecc71] text-sm"
              data-testid={`${idPrefix}-stop-${n}-input`}
            />
          </div>
        );
      })}
      {stops.length < MAX_EXTRA_STOPS && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full py-2.5 rounded-lg border-2 border-dashed border-[#2ecc71]/50 text-[#27ae60] text-sm font-semibold hover:bg-[#2ecc71]/5 hover:border-[#2ecc71] transition-colors"
          data-testid="add-stop-button"
        >
          {L.addStop}
        </button>
      )}
    </>
  );
};

export default ExtraStops;
