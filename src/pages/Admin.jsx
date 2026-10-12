import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Edit3,
  Map,
  Plus,
  RefreshCw,
  Ticket,
  Trash2,
  Users,
  X,
} from 'lucide-react';

const empty = {
  name: '',
  location: '',
  state: '',
  type: 'City',
  interests: '',
  averageBudget: '',
  recommendedDays: 2,
  bestTime: '',
  travelFromHyderabad: '',
  idealFor: '',
  highlights: '',
  description: '',
  imageUrl: '',
};

function bookingStatusOptions(status) {
  if (status === 'RECORDED' || status === 'PENDING') {
    return [status, 'CONFIRMED', 'CANCELLED'];
  }
  if (status === 'CONFIRMED') {
    return ['CONFIRMED', 'CANCELLED', 'COMPLETED'];
  }
  return [status];
}

export default function Admin() {
  const { user: signedInUser } = useAuth();
  const [s, setS] = useState(null);
  const [users, setUsers] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [trips, setTrips] = useState([]);
  const [tab, setTab] = useState('overview');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [userEditorOpen, setUserEditorOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'USER', password: '' });

  async function load() {
    setBusy(true);
    setError('');

    try {
      const [statsResponse, usersResponse, destinationsResponse, bookingsResponse, tripsResponse] =
        await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/destinations'),
          api.get('/admin/bookings'),
          api.get('/admin/itineraries'),
        ]);

      setS(statsResponse.data);
      setUsers(usersResponse.data);
      setDestinations(destinationsResponse.data);
      setBookings(bookingsResponse.data);
      setTrips(tripsResponse.data);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not load admin data. Check that the backend is running and try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();

    const refreshTimer = window.setInterval(load, 15000);
    return () => window.clearInterval(refreshTimer);
  }, []);

  function startNew() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
    setTab('destinations');
  }

  function startEdit(destination) {
    setEditing(destination.id);
    setForm({
      ...destination,
      averageBudget: String(destination.averageBudget),
    });
    setOpen(true);
    setTab('destinations');
  }

  async function saveDestination(event) {
    event.preventDefault();

    const payload = {
      ...form,
      averageBudget: Number(form.averageBudget),
      recommendedDays: Number(form.recommendedDays),
    };

    try {
      if (editing) {
        await api.put(`/admin/destinations/${editing}`, payload);
      } else {
        await api.post('/admin/destinations', payload);
      }

      setOpen(false);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not save the destination.',
      );
    }
  }

  async function deleteDestination(id) {
    if (!window.confirm('Delete this destination?')) return;

    try {
      await api.delete(`/admin/destinations/${id}`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not delete the destination.',
      );
    }
  }

  async function updateBookingStatus(id, status) {
    try {
      await api.patch(`/admin/bookings/${id}/status`, null, {
        params: { status },
      });
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not update the booking.',
      );
    }
  }

  async function updateItineraryStatus(id, status) {
    try {
      await api.patch(`/admin/itineraries/${id}/status`, null, {
        params: { status },
      });
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          'Could not update the trip request. Check that the backend approval endpoint is available.',
      );
    }
  }

  async function deleteTrip(id) {
    if (!window.confirm('Delete this itinerary from the system?')) return;

    try {
      await api.delete(`/admin/itineraries/${id}`);
      await load();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || 'Could not delete the itinerary.',
      );
    }
  }

  function startNewUser() {
    setEditingUser(null);
    setUserForm({ name: '', email: '', role: 'USER', password: '' });
    setUserEditorOpen(true);
  }

  function startEditUser(account) {
    setEditingUser(account.id);
    setUserForm({ name: account.name, email: account.email, role: account.role, password: '' });
    setUserEditorOpen(true);
  }

  async function saveUser(event) {
    event.preventDefault();
    setError('');
    const payload = { ...userForm, password: userForm.password || null };
    try {
      if (editingUser) await api.put(`/admin/users/${editingUser}`, payload);
      else await api.post('/admin/users', payload);
      setUserEditorOpen(false);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not save this user account.');
    }
  }

  async function deleteUser(account) {
    if (!window.confirm(`Delete ${account.name}'s account? This is only allowed when the account has no trips or booking records.`)) return;
    setError('');
    try {
      await api.delete(`/admin/users/${account.id}`);
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete this user account.');
    }
  }

  const pendingTrips = trips.filter((trip) => trip.status === 'PENDING').length;

  if (!s) {
    return (
      <section className="page">
        <div className="empty">
          <RefreshCw className="spin" />
          <p>{error || 'Loading control center...'}</p>
          {error && (
            <button className="btn" onClick={load} disabled={busy}>
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="page admin-page">
      <div className="admin-title">
        <div>
          <span className="eyebrow">ADMIN CONTROL CENTER</span>
          <h2>Operate Travel Planner</h2>
          <p>
            Manage destinations, travellers, itineraries and booking operations
            from one workspace.
          </p>
        </div>

        <button className="icon-text-btn" onClick={load} disabled={busy}>
          <RefreshCw size={16} className={busy ? 'spin' : ''} />
          Refresh
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="stats">
        <div>
          <Users />
          <b>{s.users}</b>
          <span>Registered users</span>
        </div>
        <div>
          <Map />
          <b>{s.destinations}</b>
          <span>Destinations</span>
        </div>
        <div>
          <CalendarDays />
          <b>{s.itineraries}</b>
          <span>Itineraries</span>
        </div>
        <div>
          <Ticket />
          <b>{s.bookings}</b>
          <span>Bookings</span>
        </div>
      </div>

      <div className="admin-tabs">
        {[
          ['overview', 'Overview'],
          ['destinations', 'Destinations'],
          ['bookings', 'Bookings'],
          ['itineraries', 'Trip requests'],
          ['users', 'Users'],
        ].map(([value, label]) => (
          <button
            className={tab === value ? 'active' : ''}
            onClick={() => setTab(value)}
            key={value}
          >
            {label}
            {value === 'itineraries' && pendingTrips > 0
              ? ` (${pendingTrips})`
              : ''}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="admin-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Operations snapshot</h3>
                <p>Quick view of current platform activity.</p>
              </div>
              <BarChart3 />
            </div>

            <div className="ops-list">
              <div>
                <span>Users registered</span>
                <b>{s.users}</b>
              </div>
              <div>
                <span>Destination catalog</span>
                <b>{s.destinations}</b>
              </div>
              <div>
                <span>Trips planned</span>
                <b>{s.itineraries}</b>
              </div>
              <div>
                <span>Reservations</span>
                <b>{s.bookings}</b>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Admin capabilities</h3>
                <p>Use the tabs to perform management actions.</p>
              </div>
            </div>

            <div className="capability-list">
              <span>✓ Add and edit destination guides</span>
              <span>✓ Remove outdated destinations</span>
              <span>✓ Review and approve trip requests</span>
              <span>✓ Update booking status</span>
              <span>✓ Review registered users</span>
            </div>
          </div>
        </div>
      )}

      {tab === 'destinations' && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Destination catalog</h3>
              <p>{destinations.length} destinations available to travellers.</p>
            </div>
            <button className="btn small" onClick={startNew}>
              <Plus size={15} /> Add destination
            </button>
          </div>

          {open && (
            <form className="admin-form" onSubmit={saveDestination}>
              <div className="form-top">
                <div>
                  <b>{editing ? 'Edit destination' : 'Add destination'}</b>
                  <span>
                    These details appear in the public destination guide.
                  </span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => setOpen(false)}
                  aria-label="Close destination form"
                >
                  <X />
                </button>
              </div>

              <div className="three">
                <label>
                  Name
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                  />
                </label>
                <label>
                  State
                  <input
                    required
                    value={form.state}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        state: event.target.value,
                        location: `${event.target.value}, India`,
                      })
                    }
                  />
                </label>
                <label>
                  Type
                  <input
                    required
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="three">
                <label>
                  Average budget
                  <input
                    type="number"
                    min="0"
                    required
                    value={form.averageBudget}
                    onChange={(event) =>
                      setForm({ ...form, averageBudget: event.target.value })
                    }
                  />
                </label>
                <label>
                  Recommended days
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.recommendedDays}
                    onChange={(event) =>
                      setForm({ ...form, recommendedDays: event.target.value })
                    }
                  />
                </label>
                <label>
                  Best time
                  <input
                    required
                    value={form.bestTime}
                    onChange={(event) =>
                      setForm({ ...form, bestTime: event.target.value })
                    }
                  />
                </label>
              </div>

              <div className="two">
                <label>
                  Interests
                  <input
                    value={form.interests}
                    onChange={(event) =>
                      setForm({ ...form, interests: event.target.value })
                    }
                  />
                </label>
                <label>
                  Ideal for
                  <input
                    value={form.idealFor}
                    onChange={(event) =>
                      setForm({ ...form, idealFor: event.target.value })
                    }
                  />
                </label>
              </div>

              <label>
                Travel from Hyderabad
                <input
                  value={form.travelFromHyderabad}
                  onChange={(event) =>
                    setForm({ ...form, travelFromHyderabad: event.target.value })
                  }
                />
              </label>

              <label>
                Top highlights
                <input
                  value={form.highlights}
                  onChange={(event) =>
                    setForm({ ...form, highlights: event.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  rows="3"
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                />
              </label>

              <label>
                Image URL
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm({ ...form, imageUrl: event.target.value })
                  }
                />
              </label>

              <button className="btn">
                <CheckCircle2 size={17} />
                {editing ? 'Update destination' : 'Publish destination'}
              </button>
            </form>
          )}

          <div className="admin-destination-list">
            {destinations.map((destination) => (
              <div className="admin-dest-row" key={destination.id}>
                <img
                  src={destination.imageUrl}
                  alt={destination.name}
                  onError={(event) => {
                    event.currentTarget.src = '/destination-fallback.svg';
                  }}
                />
                <div>
                  <b>{destination.name}</b>
                  <span>
                    {destination.location} · {destination.type} ·{' '}
                    {destination.recommendedDays} days · ₹
                    {Number(destination.averageBudget).toLocaleString()}
                  </span>
                </div>
                <button
                  className="icon-text-btn"
                  onClick={() => startEdit(destination)}
                >
                  <Edit3 size={15} /> Edit
                </button>
                <button
                  className="icon-btn"
                  onClick={() => deleteDestination(destination.id)}
                  aria-label={`Delete ${destination.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'bookings' && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Booking operations</h3>
              <p>Review reservations and update their status.</p>
            </div>
          </div>

          <div className="admin-table">
            {bookings.map((booking) => (
              <div className="admin-row" key={booking.id}>
                <div>
                  <b>{booking.provider}</b>
                  <span>
                    {booking.serviceType} · {booking.bookingDate} · ₹
                    {Number(booking.amount).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="tag">{booking.status}</span>
                  <select
                    value={booking.status}
                    onChange={(event) =>
                      updateBookingStatus(booking.id, event.target.value)
                    }
                    aria-label={`Update status for ${booking.provider}`}
                  >
                    {bookingStatusOptions(booking.status).map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            {bookings.length === 0 && <p>No bookings yet.</p>}
          </div>
        </div>
      )}

      {tab === 'itineraries' && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>Trip requests & itineraries</h3>
              <p>
                All new and edited trips require admin approval, regardless of
                budget. The list refreshes automatically every 15 seconds.
              </p>
            </div>
          </div>

          <div className="admin-table">
            {trips.map((trip) => (
              <div className="admin-row" key={trip.id}>
                <div>
                  <b>{trip.title}</b>
                  <span>
                    {trip.destination} · {trip.startDate} → {trip.endDate} ·{' '}
                    {trip.travelers} travellers
                  </span>
                  {trip.userName && (
                    <span>
                      Requested by {trip.userName} ({trip.userEmail})
                    </span>
                  )}
                  <span className="tag">{trip.status || 'PLANNED'}</span>
                </div>

                <div>
                  <b>₹{Number(trip.budget).toLocaleString()}</b>
                  {trip.status === 'PENDING' && (
                    <>
                      <button
                        className="icon-text-btn"
                        onClick={() =>
                          updateItineraryStatus(trip.id, 'APPROVED')
                        }
                      >
                        Approve
                      </button>
                      <button
                        className="icon-text-btn"
                        onClick={() =>
                          updateItineraryStatus(trip.id, 'REJECTED')
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    className="icon-btn"
                    onClick={() => deleteTrip(trip.id)}
                    title="Delete itinerary"
                    aria-label={`Delete ${trip.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            {trips.length === 0 && <p>No itineraries or requests yet.</p>}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="panel">
          <div className="panel-heading">
            <div>
              <h3>User account management</h3>
              <p>Create, edit, and remove accounts. Passwords are hashed before storage.</p>
            </div>
            <button className="btn small" onClick={startNewUser}><Plus size={15} /> Add user</button>
          </div>

          {userEditorOpen && <form className="admin-form" onSubmit={saveUser}>
            <div className="form-top"><div><b>{editingUser ? 'Edit user account' : 'Create user account'}</b><span>{editingUser ? 'Leave password blank to keep the current password.' : 'New passwords must contain at least 12 characters.'}</span></div><button type="button" className="icon-btn" onClick={() => setUserEditorOpen(false)} aria-label="Close user form"><X size={17} /></button></div>
            <div className="three">
              <label>Name<input required maxLength="100" value={userForm.name} onChange={event => setUserForm({ ...userForm, name: event.target.value })} /></label>
              <label>Email<input required type="email" maxLength="254" value={userForm.email} onChange={event => setUserForm({ ...userForm, email: event.target.value })} disabled={editingUser === signedInUser?.id} /></label>
              <label>Role<select value={userForm.role} onChange={event => setUserForm({ ...userForm, role: event.target.value })} disabled={editingUser === signedInUser?.id}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></select></label>
            </div>
            <label>{editingUser ? 'New password (optional)' : 'Temporary password'}<input type="password" autoComplete="new-password" minLength={editingUser && !userForm.password ? undefined : 12} maxLength="72" required={!editingUser} value={userForm.password} onChange={event => setUserForm({ ...userForm, password: event.target.value })} /></label>
            <button className="btn">{editingUser ? 'Save user changes' : 'Create user'}</button>
          </form>}

          <div className="admin-table">
            {users.map((user) => (
              <div className="admin-row" key={user.id}>
                <div>
                  <b>{user.name}</b>
                  <span>{user.email}</span>
                </div>
                <div className="user-admin-actions">
                  <span className="tag">{user.role}</span>
                  <button className="icon-text-btn" onClick={() => startEditUser(user)}><Edit3 size={14} /> Edit</button>
                  {user.id !== signedInUser?.id && <button className="icon-btn" onClick={() => deleteUser(user)} title={`Delete ${user.name}`} aria-label={`Delete ${user.name}`}><Trash2 size={16} /></button>}
                </div>
              </div>
            ))}
            {users.length === 0 && <p>No user accounts found.</p>}
          </div>
        </div>
      )}
    </section>
  );
}
