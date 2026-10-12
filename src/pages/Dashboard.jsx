import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  Users,
  Wallet,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    api.get('/itineraries')
      .then(({ data }) => { if (active) setItems(data); })
      .catch(() => { if (active) setError('Could not load your trips. Check your connection and retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function del(id) {
    if (!window.confirm('Delete this itinerary?')) return;
    setError('');
    try {
      await api.delete(`/itineraries/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this trip. Cancel or unlink its booking records first.');
    }
  }

  const upcoming = useMemo(
    () => items.filter((item) => new Date(item.endDate) >= new Date()).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)),
    [items],
  );

  return (
    <section className="page">
      <div className="dashboard-hero">
        <div>
          <span className="eyebrow">YOUR TRAVEL HUB</span>
          <h2>Welcome back, {user.name.split(' ')[0]}.</h2>
          <p>Everything for your journeys—plans, budgets, bookings and trip notes.</p>
        </div>
        <Link className="btn" to="/plan"><Plus size={18} /> Build a trip</Link>
      </div>

      {error && <div className="error" role="alert">{error}{!items.length && !loading && <button className="text-link" onClick={() => window.location.reload()}>Retry</button>}</div>}

      <div className="personal-stats">
        <div><CalendarDays /><b>{items.length}</b><span>Total trips</span></div>
        <div><Clock3 /><b>{upcoming.length}</b><span>Upcoming</span></div>
        <div><Wallet /><b>₹{items.reduce((sum, item) => sum + Number(item.budget || 0), 0).toLocaleString()}</b><span>Planned budget</span></div>
      </div>

      {loading ? <div className="skeleton-list"><div /><div /></div> : items.length === 0 ? (
        <div className="empty"><MapPin size={38} /><h3>Your travel story starts here</h3><p>Explore India and build your first complete itinerary.</p><Link className="btn" to="/destinations">Explore destinations</Link></div>
      ) : (
        <div className="trip-list">
          {items.map((item) => (
            <article className="trip-card" key={item.id}>
              <div className="trip-card-top">
                <div><span className="tag">{item.status || 'PLANNED'}</span><h3>{item.title}</h3><p><MapPin size={15} /> {item.destination}</p></div>
                <div className="trip-card-actions">
                  <Link className="icon-btn edit-trip-btn" to={`/plan?edit=${item.id}`} aria-label={`Edit ${item.title}`} title="Edit trip"><Pencil size={17} /></Link>
                  <button className="icon-btn" onClick={() => del(item.id)} title="Delete trip" aria-label={`Delete ${item.title}`}><Trash2 size={17} /></button>
                </div>
              </div>
              <div className="trip-info"><span><CalendarDays /> {item.startDate} → {item.endDate}</span><span><Users /> {item.travelers} traveller{item.travelers > 1 ? 's' : ''}</span><span><Wallet /> ₹{Number(item.budget).toLocaleString()}</span></div>
              <div className="trip-details"><div><b>Travel</b><span>{item.travelMode} · {item.accommodation}</span></div><div><b>Food</b><span>{item.foodPreference || 'Not specified'}</span></div><div><b>Experiences</b><span>{item.activities || 'Not specified'}</span></div></div>
              <div className="trip-footer"><span>{item.notes || 'No additional notes.'}</span><Link to={`/plan?destination=${encodeURIComponent(item.destination)}`} className="text-link">Plan another <ChevronRight size={15} /></Link></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
