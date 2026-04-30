import React, { useEffect, useMemo, useState } from 'react';
import { Leaf } from 'lucide-react';
import '../styles/EcoQuoteTicker.css';

const EcoQuoteTicker = ({ intervalMs = 4000 }) => {
  const items = useMemo(
    () => [
      { type: 'quote', text: '“Take only memories, leave only footprints.”' },
      { type: 'responsibility', text: 'Carry a reusable bottle and avoid single-use plastic while travelling.' },
      { type: 'quote', text: '“Travel lightly on the Earth.”' },
      { type: 'responsibility', text: 'Stay on marked trails to protect fragile alpine plants and soil.' },
      { type: 'quote', text: '“Nature is not a place to visit. It is home.”' },
      { type: 'responsibility', text: 'Respect local culture: ask before photos and support local guides and homestays.' },
      { type: 'responsibility', text: 'Pack out all waste (including snack wrappers and tissues) and sort recyclables.' },
      { type: 'responsibility', text: 'Keep noise low and never feed wildlife—observe from a distance.' },
      { type: 'responsibility', text: 'Save water and electricity: short showers, switch off lights, reuse towels.' }
    ],
    []
  );

  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!items.length) return undefined;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);
    return () => clearInterval(id);
  }, [items.length, intervalMs]);

  if (!items.length) return null;
  const current = items[index];

  return (
    <div className="eco-ticker" aria-live="polite">
      <Leaf className="eco-ticker-icon" aria-hidden="true" />
      <div className="eco-ticker-track">
        <span key={index} className={`eco-ticker-text eco-ticker-${current.type}`}>
          {current.text}
        </span>
      </div>
    </div>
  );
};

export default EcoQuoteTicker;

