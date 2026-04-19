import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  GripVertical, Plus, Trash2, ChevronDown, ChevronUp,
  MapPin, Clock, TrendingUp, Home, Utensils, Save,
  Printer, Mountain, Calendar, Users, Edit3, Check, X
} from 'lucide-react';
import { trekApi } from '../services/api';
import '../styles/ItineraryPlanner.css';

const STORAGE_KEY = 'ecotrek_itinerary';

const DEFAULT_DAY = (num, trekName = '') => ({
  id: `day-${Date.now()}-${num}`,
  dayNum: num,
  title: trekName ? `Day ${num} – ${trekName}` : `Day ${num}`,
  description: '',
  distance: '',
  elevationGain: '',
  elevationLoss: '',
  maxAltitude: '',
  camp: '',
  meals: { breakfast: true, lunch: false, dinner: true },
  activities: [],
  notes: '',
  expanded: true,
});

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' };

// ── Day Card Component ──────────────────────────────────────────────────────
const DayCard = ({ day, index, onUpdate, onDelete, startDate }) => {
  const [activityInput, setActivityInput] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(day.title);

  const dayDate = startDate
    ? new Date(new Date(startDate).getTime() + index * 86400000)
        .toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
    : null;

  const update = (field, value) => onUpdate(day.id, { ...day, [field]: value });

  const addActivity = () => {
    if (!activityInput.trim()) return;
    update('activities', [...day.activities, activityInput.trim()]);
    setActivityInput('');
  };

  const removeActivity = (i) =>
    update('activities', day.activities.filter((_, idx) => idx !== i));

  const saveTitle = () => {
    update('title', titleDraft);
    setEditingTitle(false);
  };

  return (
    <div className={`ip-day ${day.expanded ? 'ip-day--expanded' : ''}`}>
      {/* Day Header */}
      <div className="ip-day__header">
        <div className="ip-day__drag-handle">
          <GripVertical size={18} />
        </div>
        <div className="ip-day__num">Day {day.dayNum}</div>

        {editingTitle ? (
          <div className="ip-day__title-edit">
            <input
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
              className="ip-day__title-input"
              autoFocus
            />
            <button onClick={saveTitle} className="ip-btn-icon ip-btn-icon--green"><Check size={14} /></button>
            <button onClick={() => setEditingTitle(false)} className="ip-btn-icon"><X size={14} /></button>
          </div>
        ) : (
          <div className="ip-day__title-row">
            <h3 className="ip-day__title">{day.title}</h3>
            <button onClick={() => { setTitleDraft(day.title); setEditingTitle(true); }} className="ip-btn-icon ip-btn-icon--ghost">
              <Edit3 size={13} />
            </button>
          </div>
        )}

        {dayDate && <span className="ip-day__date">{dayDate}</span>}

        <div className="ip-day__header-actions">
          <button onClick={() => update('expanded', !day.expanded)} className="ip-btn-icon ip-btn-icon--ghost">
            {day.expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button onClick={() => onDelete(day.id)} className="ip-btn-icon ip-btn-icon--danger">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Day Body */}
      {day.expanded && (
        <div className="ip-day__body">
          {/* Description */}
          <textarea
            className="ip-input ip-textarea"
            placeholder="Describe this day's journey…"
            value={day.description}
            onChange={e => update('description', e.target.value)}
            rows={2}
          />

          {/* Stats Row */}
          <div className="ip-day__stats">
            <div className="ip-stat">
              <MapPin size={14} className="ip-stat__icon" />
              <input
                type="number"
                className="ip-input ip-input--sm"
                placeholder="Distance (km)"
                value={day.distance}
                onChange={e => update('distance', e.target.value)}
              />
            </div>
            <div className="ip-stat">
              <TrendingUp size={14} className="ip-stat__icon" />
              <input
                type="number"
                className="ip-input ip-input--sm"
                placeholder="Gain (m)"
                value={day.elevationGain}
                onChange={e => update('elevationGain', e.target.value)}
              />
            </div>
            <div className="ip-stat">
              <TrendingUp size={14} className="ip-stat__icon ip-stat__icon--down" />
              <input
                type="number"
                className="ip-input ip-input--sm"
                placeholder="Loss (m)"
                value={day.elevationLoss}
                onChange={e => update('elevationLoss', e.target.value)}
              />
            </div>
            <div className="ip-stat">
              <Mountain size={14} className="ip-stat__icon" />
              <input
                type="number"
                className="ip-input ip-input--sm"
                placeholder="Max alt (m)"
                value={day.maxAltitude}
                onChange={e => update('maxAltitude', e.target.value)}
              />
            </div>
          </div>

          {/* Camp & Meals */}
          <div className="ip-day__camp-meals">
            <div className="ip-camp">
              <Home size={14} className="ip-stat__icon" />
              <input
                className="ip-input ip-input--sm"
                placeholder="Camp / Accommodation"
                value={day.camp}
                onChange={e => update('camp', e.target.value)}
              />
            </div>
            <div className="ip-meals">
              <Utensils size={14} className="ip-stat__icon" />
              {Object.entries(MEAL_LABELS).map(([key, label]) => (
                <label key={key} className="ip-meal-check">
                  <input
                    type="checkbox"
                    checked={day.meals[key]}
                    onChange={e => update('meals', { ...day.meals, [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div className="ip-activities">
            <p className="ip-label">Activities / Highlights</p>
            <div className="ip-activity-input">
              <input
                className="ip-input"
                placeholder="e.g. River crossing, Forest walk…"
                value={activityInput}
                onChange={e => setActivityInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addActivity(); }}
              />
              <button onClick={addActivity} className="ip-btn-sm">Add</button>
            </div>
            {day.activities.length > 0 && (
              <div className="ip-activity-tags">
                {day.activities.map((a, i) => (
                  <span key={i} className="ip-activity-tag">
                    {a}
                    <button onClick={() => removeActivity(i)} className="ip-activity-remove">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <textarea
            className="ip-input ip-textarea ip-textarea--notes"
            placeholder="Personal notes, tips, warnings…"
            value={day.notes}
            onChange={e => update('notes', e.target.value)}
            rows={2}
          />
        </div>
      )}
    </div>
  );
};

// ── Main Planner Component ──────────────────────────────────────────────────
const ItineraryPlanner = () => {
  const [treks,      setTreks]      = useState([]);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [days,       setDays]       = useState([]);
  const [planName,   setPlanName]   = useState('My Trek Plan');
  const [startDate,  setStartDate]  = useState('');
  const [trekkers,   setTrekkers]   = useState(1);
  const [saved,      setSaved]      = useState(false);

  // Load treks from DB
  useEffect(() => {
    trekApi.getAll().then(res => setTreks(res.data)).catch(() => {});
  }, []);

  // Load saved plan from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const plan = JSON.parse(raw);
      setPlanName(plan.planName || 'My Trek Plan');
      setStartDate(plan.startDate || '');
      setTrekkers(plan.trekkers || 1);
      setDays(plan.days || []);
      if (plan.trekId) {
        trekApi.getById(plan.trekId)
          .then(res => setSelectedTrek(res.data))
          .catch(() => {});
      }
    } catch {}
  }, []);

  // When a trek is selected, generate day cards from its duration
  const handleTrekSelect = (trekId) => {
    const trek = treks.find(t => t._id === trekId);
    if (!trek) { setSelectedTrek(null); setDays([]); return; }
    setSelectedTrek(trek);
    setPlanName(`${trek.name} Itinerary`);
    const generated = Array.from({ length: trek.duration }, (_, i) =>
      DEFAULT_DAY(i + 1, trek.name)
    );
    setDays(generated);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(days);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setDays(reordered.map((d, i) => ({ ...d, dayNum: i + 1 })));
  };

  const updateDay = useCallback((id, updated) => {
    setDays(prev => prev.map(d => d.id === id ? updated : d));
  }, []);

  const deleteDay = useCallback((id) => {
    setDays(prev => prev.filter(d => d.id !== id).map((d, i) => ({ ...d, dayNum: i + 1 })));
  }, []);

  const addDay = () => {
    setDays(prev => [...prev, DEFAULT_DAY(prev.length + 1, selectedTrek?.name)]);
  };

  const savePlan = () => {
    const plan = { planName, startDate, trekkers, days, trekId: selectedTrek?._id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const printPlan = () => window.print();

  const totalDistance = days.reduce((s, d) => s + (parseFloat(d.distance) || 0), 0);
  const totalGain     = days.reduce((s, d) => s + (parseFloat(d.elevationGain) || 0), 0);

  return (
    <div className="ip-page">
      <div className="ip-container">

        {/* ── Sidebar ── */}
        <aside className="ip-sidebar ip-print-hide">
          <div className="ip-sidebar__section">
            <h2 className="ip-sidebar__heading">
              <Mountain size={16} /> Trip Setup
            </h2>

            <label className="ip-label">Plan Name</label>
            <input
              className="ip-input"
              value={planName}
              onChange={e => setPlanName(e.target.value)}
            />

            <label className="ip-label">Select Trek</label>
            <select
              className="ip-input"
              value={selectedTrek?._id || ''}
              onChange={e => handleTrekSelect(e.target.value)}
            >
              <option value="">-- Choose a trek --</option>
              {treks.map(t => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.duration} days)
                </option>
              ))}
            </select>

            <label className="ip-label">Start Date</label>
            <input
              type="date"
              className="ip-input"
              value={startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setStartDate(e.target.value)}
            />

            <label className="ip-label">Number of Trekkers</label>
            <input
              type="number"
              className="ip-input"
              value={trekkers}
              min={1}
              max={50}
              onChange={e => setTrekkers(Number(e.target.value))}
            />
          </div>

          {selectedTrek && (
            <div className="ip-sidebar__section ip-trek-info">
              <img
                src={selectedTrek.image || `https://picsum.photos/seed/${selectedTrek._id}/400/200`}
                alt={selectedTrek.name}
                className="ip-trek-info__img"
                onError={e => { e.target.onerror = null; e.target.src = `https://picsum.photos/seed/${selectedTrek._id}/400/200`; }}
              />
              <h3 className="ip-trek-info__name">{selectedTrek.name}</h3>
              <div className="ip-trek-info__meta">
                <span><MapPin size={12} /> {selectedTrek.location}</span>
                <span><Clock size={12} /> {selectedTrek.duration} days</span>
                <span><Users size={12} /> Max {selectedTrek.maxGroupSize}</span>
              </div>
            </div>
          )}

          {days.length > 0 && (
            <div className="ip-sidebar__section">
              <h2 className="ip-sidebar__heading">Summary</h2>
              <div className="ip-summary">
                <div className="ip-summary__row"><span>Days</span><strong>{days.length}</strong></div>
                <div className="ip-summary__row"><span>Trekkers</span><strong>{trekkers}</strong></div>
                {totalDistance > 0 && <div className="ip-summary__row"><span>Total Distance</span><strong>{totalDistance} km</strong></div>}
                {totalGain > 0 && <div className="ip-summary__row"><span>Total Gain</span><strong>{totalGain} m</strong></div>}
                {startDate && (
                  <div className="ip-summary__row">
                    <span>End Date</span>
                    <strong>
                      {new Date(new Date(startDate).getTime() + (days.length - 1) * 86400000)
                        .toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </strong>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="ip-sidebar__actions">
            <button className="ip-btn ip-btn--primary" onClick={savePlan}>
              <Save size={15} /> {saved ? 'Saved ✓' : 'Save Plan'}
            </button>
            <button className="ip-btn ip-btn--outline" onClick={printPlan}>
              <Printer size={15} /> Print
            </button>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="ip-main">
          <div className="ip-main__header ip-print-hide">
            <div>
              <h1 className="ip-page-title">{planName}</h1>
              {selectedTrek && (
                <p className="ip-page-subtitle">
                  <Calendar size={13} /> {startDate || 'No date set'} &nbsp;·&nbsp;
                  <Users size={13} /> {trekkers} trekker{trekkers !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            <button className="ip-btn ip-btn--add" onClick={addDay}>
              <Plus size={15} /> Add Day
            </button>
          </div>

          {/* Print Header */}
          <div className="ip-print-only ip-print-header">
            <h1>{planName}</h1>
            {selectedTrek && <p>{selectedTrek.name} · {selectedTrek.location} · {days.length} days · {trekkers} trekker{trekkers !== 1 ? 's' : ''}</p>}
            {startDate && <p>Starting {new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          </div>

          {days.length === 0 ? (
            <div className="ip-empty">
              <Mountain size={48} className="ip-empty__icon" />
              <h3>Start Planning Your Trek</h3>
              <p>Select a trek from the sidebar to auto-generate your itinerary, or add days manually.</p>
              <button className="ip-btn ip-btn--primary" onClick={addDay}>
                <Plus size={15} /> Add First Day
              </button>
            </div>
          ) : (
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="itinerary">
                {(provided) => (
                  <div
                    className="ip-days-list"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {days.map((day, index) => (
                      <Draggable key={day.id} draggableId={day.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'ip-dragging' : ''}
                          >
                            <DayCard
                              day={day}
                              index={index}
                              onUpdate={updateDay}
                              onDelete={deleteDay}
                              startDate={startDate}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </main>
      </div>
    </div>
  );
};

export default ItineraryPlanner;
