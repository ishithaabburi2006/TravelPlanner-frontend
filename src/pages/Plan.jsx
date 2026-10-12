import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Users,
} from 'lucide-react';
import api from '../services/api';

const initial = {
  title: '',
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  travelers: 1,
  travelMode: 'Train',
  accommodation: 'Hotel',
  foodPreference: 'Local cuisine',
  activities: '',
  dayPlan: '',
  notes: '',
};

export default function Plan() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const editId = params.get('edit');

  const [f, setF] = useState({
    ...initial,
    destination: params.get('destination') || '',
  });
  const [dest, setDest] = useState(null);
  const [err, setErr] = useState('');
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(Boolean(editId));

  useEffect(() => {
    if (!editId) return undefined;
    let active = true;
    api.get(`/itineraries/${editId}/summary`)
      .then(({ data }) => {
        if (!active) return;
        const trip = data.itinerary;
        setF({
          title: trip.title || '',
          destination: trip.destination || '',
          startDate: trip.startDate || '',
          endDate: trip.endDate || '',
          budget: String(trip.budget ?? ''),
          travelers: String(trip.travelers ?? 1),
          travelMode: trip.travelMode || initial.travelMode,
          accommodation: trip.accommodation || initial.accommodation,
          foodPreference: trip.foodPreference || initial.foodPreference,
          activities: trip.activities || '',
          dayPlan: trip.dayPlan || '',
          notes: trip.notes || '',
        });
      })
      .catch((error) => {
        if (active) setLoadError(error.response?.data?.message || 'Could not load this trip for editing.');
      })
      .finally(() => { if (active) setLoadingTrip(false); });
    return () => { active = false; };
  }, [editId]);

  useEffect(() => {
    let active = true;
    const name = f.destination.trim();

    if (!name) {
      setDest(null);
      return () => {
        active = false;
      };
    }

    const timer = setTimeout(() => {
      api
        .get('/destinations', { params: { q: name } })
        .then((response) => {
          if (!active) return;

          const match = response.data.find(
            (destination) =>
              destination.name.trim().toLowerCase() === name.toLowerCase(),
          );

          setDest(match || null);
        })
        .catch(() => {
          if (active) setDest(null);
        });
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [f.destination]);

  const days = useMemo(() => {
    if (!f.startDate || !f.endDate) return 0;

    const start = new Date(f.startDate);
    const end = new Date(f.endDate);

    return Math.max(0, Math.round((end - start) / 86400000) + 1);
  }, [f.startDate, f.endDate]);

  function set(field, value) {
    setF((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setErr('');
    setSaving(true);

    try {
      const payload = {
        ...f,
        destination: f.destination.trim(),
        budget: Number(f.budget),
        travelers: Number(f.travelers),
      };
      if (editId) await api.put(`/itineraries/${editId}`, payload);
      else await api.post('/itineraries', payload);

      nav('/dashboard');
    } catch (error) {
      setErr(
        typeof error.response?.data === 'string'
          ? error.response.data
          : error.response?.data?.message || 'Could not save itinerary',
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page narrow planner-page">
      <button
        className="back-link button-link"
        onClick={() => nav(-1)}
        type="button"
      >
        <ArrowLeft size={17} /> Back
      </button>

      <div className="planner-header">
        <div>
          <span className="eyebrow">SMART TRIP BUILDER</span>
          <h2>{editId ? 'Edit your trip' : 'Design your complete journey'}</h2>
          <p>
            Capture the details you normally keep across notes, bookings and
            messages—in one organized trip.
          </p>
        </div>

        {dest && (
          <div className="planner-destination">
            <img
              src={dest.imageUrl}
              alt={dest.name}
              onError={(event) => {
                event.currentTarget.src = '/destination-fallback.svg';
              }}
            />
            <div>
              <b>{dest.name}</b>
              <span>
                {dest.recommendedDays} days recommended · ₹
                {Number(dest.averageBudget).toLocaleString()} avg.
              </span>
            </div>
          </div>
        )}
      </div>

      {loadingTrip && <div className="empty">Loading trip details…</div>}
      {loadError && <div className="error" role="alert">{loadError} <button className="text-link" type="button" onClick={() => nav('/dashboard')}>Back to trips</button></div>}

      {!loadingTrip && !loadError && <form className="form-card planner-form" onSubmit={submit}>
        {err && <div className="error">{err}</div>}

        <div className="section-title">
          <span>01</span>
          <div>
            <b>Trip basics</b>
            <small>Name your trip and choose the destination.</small>
          </div>
        </div>

        <div className="two">
          <label>
            Trip title
            <input
              required
              value={f.title}
              onChange={(event) => set('title', event.target.value)}
              placeholder="Kerala Weekend Escape"
            />
          </label>

          <label>
            Destination
            <input
              required
              value={f.destination}
              onChange={(event) => set('destination', event.target.value)}
              placeholder="Munnar"
            />
          </label>
        </div>

        <div className="section-title">
          <span>02</span>
          <div>
            <b>Dates & travellers</b>
            <small>We'll calculate your trip duration automatically.</small>
          </div>
        </div>

        <div className="three">
          <label>
            Start date
            <input
              type="date"
              required
              value={f.startDate}
              onChange={(event) => set('startDate', event.target.value)}
            />
          </label>

          <label>
            End date
            <input
              type="date"
              required
              value={f.endDate}
              onChange={(event) => set('endDate', event.target.value)}
            />
          </label>

          <label>
            Travellers
            <input
              type="number"
              min="1"
              max="30"
              required
              value={f.travelers}
              onChange={(event) => set('travelers', event.target.value)}
            />
          </label>
        </div>

        {days > 0 && (
          <div className="trip-summary">
            <span>
              <CalendarDays /> {days} day{days > 1 ? 's' : ''}
            </span>
            <span>
              <Users /> {f.travelers} traveller
              {Number(f.travelers) > 1 ? 's' : ''}
            </span>
            <span>
              <IndianRupee />{' '}
              {f.budget ? Number(f.budget).toLocaleString() : '—'} total budget
            </span>
          </div>
        )}

        <div className="section-title">
          <span>03</span>
          <div>
            <b>Travel style</b>
            <small>Choose how you want to move and stay.</small>
          </div>
        </div>

        <div className="three">
          <label>
            Travel mode
            <select
              value={f.travelMode}
              onChange={(event) => set('travelMode', event.target.value)}
            >
              <option>Flight</option>
              <option>Train</option>
              <option>Bus</option>
              <option>Car</option>
              <option>Bike</option>
            </select>
          </label>

          <label>
            Accommodation
            <select
              value={f.accommodation}
              onChange={(event) => set('accommodation', event.target.value)}
            >
              <option>Hotel</option>
              <option>Resort</option>
              <option>Hostel</option>
              <option>Homestay</option>
              <option>Villa</option>
              <option>Camping</option>
            </select>
          </label>

          <label>
            Food preference
            <select
              value={f.foodPreference}
              onChange={(event) => set('foodPreference', event.target.value)}
            >
              <option>Local cuisine</option>
              <option>Vegetarian</option>
              <option>Vegan</option>
              <option>Mixed</option>
              <option>Not decided</option>
            </select>
          </label>
        </div>

        <div className="section-title">
          <span>04</span>
          <div>
            <b>Budget & experiences</b>
            <small>Tell Travel Planner what you want to include.</small>
          </div>
        </div>

        <label>
          Total budget (₹)
          <input
            type="number"
            min="0"
            required
            value={f.budget}
            onChange={(event) => set('budget', event.target.value)}
            placeholder="25000"
          />
        </label>

        <div className="helper-banner">
          <IndianRupee />
          <div>
            <b>Every trip request is reviewed by an admin.</b>
            <span>
              Approval is required for all budgets. You can track the request
              status in your dashboard.
            </span>
          </div>
        </div>

        <label>
          Activities & must-do experiences
          <textarea
            rows="4"
            value={f.activities}
            onChange={(event) => set('activities', event.target.value)}
            placeholder="Beach day, local food tour, museum, trekking, shopping..."
          />
        </label>

        <label>
          Day-by-day plan
          <textarea
            rows="6"
            value={f.dayPlan}
            onChange={(event) => set('dayPlan', event.target.value)}
            placeholder={
              'Day 1: Arrival + check-in\nDay 2: Main sightseeing\nDay 3: Local experiences + departure'
            }
          />
        </label>

        <label>
          Additional notes
          <textarea
            rows="4"
            value={f.notes}
            onChange={(event) => set('notes', event.target.value)}
            placeholder="Hotel preferences, accessibility, pickup details, emergency notes..."
          />
        </label>

        <button className="btn full" disabled={saving}>
          {saving ? (
            editId ? 'Saving changes…' : 'Submitting…'
          ) : (
            <>
              <CheckCircle2 size={18} />
              {editId ? 'Resubmit for admin approval' : 'Request admin approval'}
            </>
          )}
        </button>
      </form>}
    </section>
  );
}
