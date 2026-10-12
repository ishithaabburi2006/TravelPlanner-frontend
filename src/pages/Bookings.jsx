import { useEffect, useState } from 'react';
import api from '../services/api';
import { CalendarCheck, Hotel, Plane, Plus, Ticket, Train, BusFront, Activity, Trash2 } from 'lucide-react';

const icons = { HOTEL: Hotel, FLIGHT: Plane, TRAIN: Train, BUS: BusFront, ACTIVITY: Activity };
const emptyForm = { serviceType: 'HOTEL', provider: '', bookingReference: '', details: '', bookingDate: '', amount: '', travelers: 1, itineraryId: '' };

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [trips, setTrips] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [bookings, itineraries] = await Promise.all([api.get('/bookings'), api.get('/itineraries')]);
      setItems(bookings.data);
      setTrips(itineraries.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Could not load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function save(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await api.post('/bookings', { ...form, amount: Number(form.amount), travelers: Number(form.travelers), itineraryId: form.itineraryId ? Number(form.itineraryId) : null });
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not save this booking record.');
    } finally {
      setSaving(false);
    }
  }

  async function cancel(id) {
    if (!confirm('Mark this booking record as cancelled?')) return;
    setError('');
    try {
      await api.delete(`/bookings/${id}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Could not cancel this booking record.');
    }
  }

  return <section className="page">
    <div className="page-head"><div><span className="eyebrow">TRAVEL SERVICES</span><h2>Bookings & reservations</h2><p>Keep locally recorded travel arrangements connected to your trips.</p></div><button className="btn" onClick={() => setOpen(!open)}><Plus size={18}/> Add booking record</button></div>
    {error && <div className="error" role="alert">{error}</div>}
    {open && <form className="form-card booking-form" onSubmit={save}>
      <div className="helper-banner"><Ticket/><div><b>Personal record only</b><span>Saving details here does not book or confirm a reservation with a provider.</span></div></div>
      <div className="two"><label>Service type<select value={form.serviceType} onChange={e => setForm({ ...form, serviceType: e.target.value })}><option>HOTEL</option><option>FLIGHT</option><option>TRAIN</option><option>BUS</option><option>ACTIVITY</option></select></label><label>Provider<input required maxLength="180" value={form.provider} onChange={e => setForm({ ...form, provider: e.target.value })} placeholder="Provider or hotel name"/></label></div>
      <div className="two"><label>Booking reference<input maxLength="100" value={form.bookingReference} onChange={e => setForm({ ...form, bookingReference: e.target.value })} placeholder="PNR / confirmation number"/></label><label>Linked trip<select value={form.itineraryId} onChange={e => setForm({ ...form, itineraryId: e.target.value })}><option value="">No linked trip</option>{trips.map(t => <option value={t.id} key={t.id}>{t.title}</option>)}</select></label></div>
      <label>Details<input maxLength="1500" value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Seat, room, pickup, timing, inclusions..."/></label>
      <div className="three"><label>Date<input type="date" required value={form.bookingDate} onChange={e => setForm({ ...form, bookingDate: e.target.value })}/></label><label>Travellers<input type="number" min="1" max="30" required value={form.travelers} onChange={e => setForm({ ...form, travelers: e.target.value })}/></label><label>Amount (₹)<input type="number" min="0" step="0.01" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}/></label></div>
      <button className="btn" disabled={saving}>{saving ? 'Saving…' : 'Save booking record'}</button>
    </form>}
    {loading ? <div className="empty"><CalendarCheck/><p>Loading booking records…</p></div> : <div className="booking-list">{items.map(booking => { const Icon = icons[booking.serviceType] || Ticket; return <article className="booking-card-row" key={booking.id}><div className="booking-icon"><Icon/></div><div className="booking-main"><div className="booking-line"><span className="tag">{booking.status}</span><span>{booking.serviceType} · {booking.travelers || 1} traveller(s)</span></div><h3>{booking.provider}</h3><p>{booking.details || 'No details added.'}</p><small>{booking.bookingDate}{booking.bookingReference ? ` · Ref ${booking.bookingReference}` : ''}{booking.itineraryTitle ? ` · ${booking.itineraryTitle}` : ''}</small></div><strong>₹{Number(booking.amount).toLocaleString()}</strong>{!['CANCELLED', 'COMPLETED'].includes(booking.status) && <button className="icon-btn" onClick={() => cancel(booking.id)} title="Mark booking record cancelled"><Trash2 size={16}/></button>}</article>; })}</div>}
    {!loading && !items.length && !open && <div className="empty"><CalendarCheck/><h3>No booking records yet</h3><p>Add your reservation details for personal trip tracking.</p></div>}
    <div className="helper-banner"><Ticket/><div><b>Provider reservations are not integrated</b><span>These records do not represent provider-confirmed bookings or payments.</span></div></div>
  </section>;
}
