import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, DollarSign, TrendingUp, Users, Calendar,
  Mountain, Save, RefreshCw, ChevronDown
} from 'lucide-react';
import { trekApi, guideApi } from '../services/api';
import '../styles/BudgetTracker.css';

const STORAGE_KEY = 'ecotrek_budget';

const CATEGORIES = [
  { id: 'trek_fee',      label: 'Trek Fee',         color: '#10b981', icon: '🏔️' },
  { id: 'guide',         label: 'Guide',            color: '#3b82f6', icon: '👤' },
  { id: 'transport',     label: 'Transport',        color: '#f59e0b', icon: '🚌' },
  { id: 'accommodation', label: 'Accommodation',    color: '#8b5cf6', icon: '🏕️' },
  { id: 'food',          label: 'Food & Water',     color: '#ec4899', icon: '🍱' },
  { id: 'equipment',     label: 'Equipment',        color: '#06b6d4', icon: '🎒' },
  { id: 'permits',       label: 'Permits / Fees',   color: '#ef4444', icon: '📋' },
  { id: 'medical',       label: 'Medical / Insurance', color: '#84cc16', icon: '🏥' },
  { id: 'misc',          label: 'Miscellaneous',    color: '#94a3b8', icon: '📦' },
];

const catById = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));

const uid = () => `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const DEFAULT_EXPENSES = () => [];

const BudgetTracker = () => {
  const [treks,        setTreks]        = useState([]);
  const [guides,       setGuides]       = useState([]);
  const [selectedTrek, setSelectedTrek] = useState(null);
  const [selectedGuide,setSelectedGuide]= useState(null);
  const [groupSize,    setGroupSize]    = useState(1);
  const [duration,     setDuration]     = useState(1);
  const [totalBudget,  setTotalBudget]  = useState('');
  const [expenses,     setExpenses]     = useState(DEFAULT_EXPENSES());
  const [form,         setForm]         = useState({ category: 'misc', description: '', amount: '', perPerson: false });
  const [saved,        setSaved]        = useState(false);
  const [perPerson,    setPerPerson]    = useState(false); // display toggle

  // Load data
  useEffect(() => {
    trekApi.getAll().then(r => setTreks(r.data)).catch(() => {});
    guideApi.getAll().then(r => setGuides(r.data)).catch(() => {});
  }, []);

  // Load saved budget
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const b = JSON.parse(raw);
      setGroupSize(b.groupSize || 1);
      setDuration(b.duration || 1);
      setTotalBudget(b.totalBudget || '');
      setExpenses(b.expenses || []);
      if (b.trekId) trekApi.getById(b.trekId).then(r => setSelectedTrek(r.data)).catch(() => {});
      if (b.guideId) guideApi.getById(b.guideId).then(r => setSelectedGuide(r.data)).catch(() => {});
    } catch {}
  }, []);

  // Auto-populate trek fee when trek is selected
  const handleTrekSelect = (trekId) => {
    const trek = treks.find(t => t._id === trekId);
    setSelectedTrek(trek || null);
    if (trek) {
      setDuration(trek.duration);
      // Upsert trek fee expense
      setExpenses(prev => {
        const without = prev.filter(e => e.autoId !== 'trek_fee');
        return [
          { id: uid(), autoId: 'trek_fee', category: 'trek_fee', description: trek.name + ' trek fee', amount: trek.price, perPerson: true },
          ...without,
        ];
      });
    }
  };

  const handleGuideSelect = (guideId) => {
    const guide = guides.find(g => g._id === guideId);
    setSelectedGuide(guide || null);
    if (guide) {
      setExpenses(prev => {
        const without = prev.filter(e => e.autoId !== 'guide');
        return [
          ...without,
          { id: uid(), autoId: 'guide', category: 'guide', description: guide.name + ' – guide fee', amount: guide.pricePerDay * (selectedTrek?.duration || duration), perPerson: false },
        ];
      });
    }
  };

  const addExpense = (e) => {
    e.preventDefault();
    if (!form.description.trim() || !form.amount) return;
    setExpenses(prev => [...prev, { ...form, id: uid(), amount: parseFloat(form.amount) }]);
    setForm(f => ({ ...f, description: '', amount: '' }));
  };

  const removeExpense = (id) =>
    setExpenses(prev => prev.filter(e => e.id !== id));

  const updateExpenseAmount = (id, val) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, amount: parseFloat(val) || 0 } : e));

  const saveBudget = () => {
    const b = { groupSize, duration, totalBudget, expenses, trekId: selectedTrek?._id, guideId: selectedGuide?._id };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(b));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const reset = () => {
    if (!window.confirm('Clear all expenses?')) return;
    setExpenses([]);
    setSelectedTrek(null);
    setSelectedGuide(null);
    setGroupSize(1);
    setDuration(1);
    setTotalBudget('');
    localStorage.removeItem(STORAGE_KEY);
  };

  // ── Calculations ──
  const effectiveGroup = Math.max(1, groupSize);

  const totalSpent = expenses.reduce((sum, exp) => {
    const base = parseFloat(exp.amount) || 0;
    return sum + (exp.perPerson ? base * effectiveGroup : base);
  }, 0);

  const displayTotal = perPerson ? totalSpent / effectiveGroup : totalSpent;
  const displayBudget = totalBudget
    ? (perPerson ? parseFloat(totalBudget) / effectiveGroup : parseFloat(totalBudget))
    : null;
  const remaining = displayBudget != null ? displayBudget - displayTotal : null;
  const budgetPct = displayBudget ? Math.min((displayTotal / displayBudget) * 100, 100) : 0;

  // Category totals for breakdown
  const catTotals = CATEGORIES.map(cat => {
    const total = expenses
      .filter(e => e.category === cat.id)
      .reduce((s, e) => s + ((parseFloat(e.amount) || 0) * (e.perPerson ? effectiveGroup : 1)), 0);
    return { ...cat, total };
  }).filter(c => c.total > 0);

  const maxCatTotal = Math.max(...catTotals.map(c => c.total), 1);

  return (
    <div className="bt-page">
      <div className="bt-container">

        {/* ── Left Panel ── */}
        <aside className="bt-sidebar">

          {/* Trip Setup */}
          <div className="bt-card">
            <h2 className="bt-card__heading"><Mountain size={15}/> Trip Setup</h2>

            <label className="bt-label">Trek</label>
            <select className="bt-input" value={selectedTrek?._id || ''} onChange={e => handleTrekSelect(e.target.value)}>
              <option value="">-- Select Trek --</option>
              {treks.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <label className="bt-label">Guide (optional)</label>
            <select className="bt-input" value={selectedGuide?._id || ''} onChange={e => handleGuideSelect(e.target.value)}>
              <option value="">-- No guide --</option>
              {guides.map(g => <option key={g._id} value={g._id}>{g.name} (₹{g.pricePerDay?.toLocaleString()}/day)</option>)}
            </select>

            <div className="bt-row">
              <div className="bt-field">
                <label className="bt-label"><Users size={12}/> Group Size</label>
                <input type="number" className="bt-input" value={groupSize} min={1} max={50}
                  onChange={e => setGroupSize(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
              <div className="bt-field">
                <label className="bt-label"><Calendar size={12}/> Days</label>
                <input type="number" className="bt-input" value={duration} min={1}
                  onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))} />
              </div>
            </div>

            <label className="bt-label">Total Budget (₹)</label>
            <input type="number" className="bt-input" placeholder="e.g. 100000"
              value={totalBudget} onChange={e => setTotalBudget(e.target.value)} />
          </div>

          {/* Add Expense */}
          <div className="bt-card">
            <h2 className="bt-card__heading"><Plus size={15}/> Add Expense</h2>
            <form onSubmit={addExpense} className="bt-form">
              <select className="bt-input" value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
              </select>
              <input className="bt-input" placeholder="Description" value={form.description}
                onChange={e => setForm(f => ({...f, description: e.target.value}))} required />
              <div className="bt-row">
                <input type="number" className="bt-input" placeholder="Amount (₹)" value={form.amount}
                  onChange={e => setForm(f => ({...f, amount: e.target.value}))} required />
                <label className="bt-per-person">
                  <input type="checkbox" checked={form.perPerson}
                    onChange={e => setForm(f => ({...f, perPerson: e.target.checked}))} />
                  per person
                </label>
              </div>
              <button type="submit" className="bt-btn bt-btn--primary">
                <Plus size={14}/> Add
              </button>
            </form>
          </div>

          <div className="bt-actions">
            <button className="bt-btn bt-btn--primary" onClick={saveBudget}>
              <Save size={14}/> {saved ? 'Saved ✓' : 'Save'}
            </button>
            <button className="bt-btn bt-btn--danger" onClick={reset}>
              <RefreshCw size={14}/> Reset
            </button>
          </div>
        </aside>

        {/* ── Right Panel ── */}
        <main className="bt-main">

          {/* Summary Cards */}
          <div className="bt-summary-grid">
            <div className="bt-summary-card bt-summary-card--spent">
              <p className="bt-summary-card__label">Total Spent</p>
              <p className="bt-summary-card__value">₹{displayTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              {perPerson && <p className="bt-summary-card__sub">per person</p>}
            </div>
            {displayBudget != null && (
              <>
                <div className={`bt-summary-card ${remaining >= 0 ? 'bt-summary-card--ok' : 'bt-summary-card--over'}`}>
                  <p className="bt-summary-card__label">{remaining >= 0 ? 'Remaining' : 'Over Budget'}</p>
                  <p className="bt-summary-card__value">₹{Math.abs(remaining).toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
                  {perPerson && <p className="bt-summary-card__sub">per person</p>}
                </div>
                <div className="bt-summary-card">
                  <p className="bt-summary-card__label">Budget Used</p>
                  <p className="bt-summary-card__value">{budgetPct.toFixed(1)}%</p>
                  <div className="bt-mini-bar">
                    <div className="bt-mini-bar__fill" style={{
                      width: `${budgetPct}%`,
                      background: budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981'
                    }} />
                  </div>
                </div>
              </>
            )}
            <div className="bt-summary-card">
              <p className="bt-summary-card__label">Group Cost</p>
              <p className="bt-summary-card__value">₹{totalSpent.toLocaleString('en-IN', {maximumFractionDigits: 0})}</p>
              <p className="bt-summary-card__sub">{groupSize} trekker{groupSize !== 1 ? 's' : ''}</p>
            </div>
          </div>

          {/* Per-person toggle */}
          <div className="bt-view-toggle">
            <button className={`bt-toggle-btn ${!perPerson ? 'active' : ''}`} onClick={() => setPerPerson(false)}>
              Group Total
            </button>
            <button className={`bt-toggle-btn ${perPerson ? 'active' : ''}`} onClick={() => setPerPerson(true)}>
              Per Person
            </button>
          </div>

          {/* Budget Bar */}
          {displayBudget != null && (
            <div className="bt-budget-bar-wrap">
              <div className="bt-budget-bar-labels">
                <span>₹0</span>
                <span>Budget: ₹{displayBudget.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
              </div>
              <div className="bt-budget-bar">
                <div className="bt-budget-bar__fill" style={{
                  width: `${budgetPct}%`,
                  background: budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#10b981'
                }}>
                  {budgetPct > 15 && (
                    <span className="bt-budget-bar__label">
                      {budgetPct.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Expense List */}
          <div className="bt-card">
            <h2 className="bt-card__heading"><DollarSign size={15}/> Expenses ({expenses.length})</h2>
            {expenses.length === 0 ? (
              <p className="bt-empty">No expenses yet. Add your first expense from the sidebar.</p>
            ) : (
              <div className="bt-expense-list">
                {expenses.map(exp => {
                  const cat = catById[exp.category] || catById.misc;
                  const lineTotal = (parseFloat(exp.amount) || 0) * (exp.perPerson ? effectiveGroup : 1);
                  return (
                    <div key={exp.id} className="bt-expense-row">
                      <span className="bt-expense-cat-dot" style={{ background: cat.color }}>{cat.icon}</span>
                      <div className="bt-expense-info">
                        <p className="bt-expense-desc">{exp.description}</p>
                        <p className="bt-expense-meta">
                          {cat.label}
                          {exp.perPerson && ` · ₹${(parseFloat(exp.amount)||0).toLocaleString()} × ${groupSize} persons`}
                        </p>
                      </div>
                      <div className="bt-expense-amount-wrap">
                        <span className="bt-expense-total">₹{lineTotal.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                        <input
                          type="number"
                          className="bt-expense-input"
                          value={exp.amount}
                          onChange={e => updateExpenseAmount(exp.id, e.target.value)}
                        />
                      </div>
                      <button onClick={() => removeExpense(exp.id)} className="bt-remove-btn">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          {catTotals.length > 0 && (
            <div className="bt-card">
              <h2 className="bt-card__heading"><TrendingUp size={15}/> Breakdown by Category</h2>
              <div className="bt-breakdown">
                {catTotals.map(cat => {
                  const display = perPerson ? cat.total / effectiveGroup : cat.total;
                  const pct = (cat.total / maxCatTotal) * 100;
                  const sharePct = totalSpent > 0 ? (cat.total / totalSpent * 100).toFixed(1) : 0;
                  return (
                    <div key={cat.id} className="bt-breakdown-row">
                      <div className="bt-breakdown-label">
                        <span>{cat.icon} {cat.label}</span>
                        <span className="bt-breakdown-share">{sharePct}%</span>
                      </div>
                      <div className="bt-breakdown-bar-wrap">
                        <div className="bt-breakdown-bar">
                          <div className="bt-breakdown-bar__fill" style={{ width: `${pct}%`, background: cat.color }} />
                        </div>
                        <span className="bt-breakdown-amount">
                          ₹{display.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BudgetTracker;
