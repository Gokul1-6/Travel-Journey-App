import React from "react";
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  LayoutDashboard,
  Route as RouteIcon,
  Ticket,
  Bookmark,
  User,
  BarChart3,
  Bell,
  Search,
  Moon,
  Sun,
  MapPin,
  CalendarDays,
  Clock3,
  Users,
  IndianRupee,
  Navigation,
  Trash2,
  Save,
  Download,
  CheckCircle2,
  Bus,
  Train,
  CarTaxiFront,
  Footprints,
  Bike,
  Menu,
  X,
} from "lucide-react";
import {
  cityOptions,
  dashboardStats,
  defaultRoutes,
  monthlyStats,
  transportModes,
} from "./data";
import "./App.css";

const STORAGE_KEYS = {
  tickets: "smartJourneyTickets",
  savedTrips: "smartJourneySavedTrips",
  profile: "smartJourneyProfile",
  theme: "smartJourneyTheme",
};

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = React.useState(() => readStorage(key, fallback));

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function formatDate(dateValue) {
  if (!dateValue) return "Not selected";
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function buildTime(hour, minute, period) {
  if (!hour || minute === "" || !period) return "Not selected";
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
}

function Breadcrumb() {
  const location = useLocation();
  const routeNames = {
    "/": "Dashboard",
    "/planner": "Journey Planner",
    "/saved": "Saved Trips",
    "/tickets": "Tickets",
    "/analytics": "Analytics",
    "/profile": "Profile",
  };

  return (
    <div className="breadcrumb">
      <span>travel-app</span>
      <span>/</span>
      <strong>{routeNames[location.pathname] || "Dashboard"}</strong>
    </div>
  );
}

function CityInput({ value, onChange, placeholder, id }) {
  const [focused, setFocused] = React.useState(false);
  const filtered = cityOptions
    .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
    .slice(0, 6);

  return (
    <div className="autocomplete">
      <MapPin size={17} className="field-icon" />
      <input
        id={id}
        value={value}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="off"
      />
      {focused && value && filtered.length > 0 && (
        <div className="suggestions">
          {filtered.map((city) => (
            <button
              type="button"
              key={city}
              onMouseDown={() => onChange(city)}
            >
              <MapPin size={15} />
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Dashboard({ tickets, savedTrips }) {
  const totalSpent = tickets.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const completed = tickets.filter((item) => item.status === "Confirmed").length;

  const cards = [
    ...dashboardStats,
    { title: "Saved Trips", value: savedTrips.length, note: "Ready to book again" },
    { title: "Booked Tickets", value: completed, note: "Confirmed journeys" },
    { title: "Total Spend", value: `₹${totalSpent}`, note: "Across all tickets" },
  ];

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
          <p>Plan, book and monitor all your journeys from one place.</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((item) => (
          <article className="card stat-card" key={item.title}>
            <p>{item.title}</p>
            <h2>{item.value}</h2>
            <span>{item.note}</span>
          </article>
        ))}
      </div>

      <div className="dashboard-grid">
        <article className="card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Quick guide</p>
              <h2>How Smart Journey works</h2>
            </div>
          </div>
          <div className="steps">
            {["Enter locations", "Compare routes", "Save or book", "Get your ticket"].map(
              (step, index) => (
                <div className="step" key={step}>
                  <span>{index + 1}</span>
                  <strong>{step}</strong>
                </div>
              )
            )}
          </div>
        </article>

        <article className="card accent-card">
          <p className="eyebrow">AI suggestion</p>
          <h2>Travel smarter today</h2>
          <p>
            Search during off-peak hours to reduce cost, traffic and travel time.
          </p>
        </article>
      </div>
    </section>
  );
}

function JourneyPlanner({ onSaveTrip, onBookTicket }) {
  const [source, setSource] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [date, setDate] = React.useState("");
  const [hour, setHour] = React.useState("");
  const [minute, setMinute] = React.useState("");
  const [period, setPeriod] = React.useState("");
  const [passengers, setPassengers] = React.useState(1);
  const [selectedModes, setSelectedModes] = React.useState(["Bus", "Metro"]);
  const [results, setResults] = React.useState([]);
  const [selectedRoute, setSelectedRoute] = React.useState(null);
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();

  const toggleMode = (mode) => {
    setSelectedModes((current) =>
      current.includes(mode)
        ? current.filter((item) => item !== mode)
        : [...current, mode]
    );
  };

  const searchRoutes = () => {
    if (!source.trim() || !destination.trim() || !date || !hour || minute === "" || !period) {
      setMessage("Please enter source, destination, journey date and departure time.");
      return;
    }
    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      setMessage("Source and destination must be different.");
      return;
    }

    const selected = selectedModes.length ? selectedModes : transportModes;
    const generated = defaultRoutes
      .filter((route) => selected.some((mode) => route.modes.includes(mode)))
      .map((route, index) => ({
        ...route,
        id: `${Date.now()}-${index}`,
        source,
        destination,
        date,
        departure: buildTime(hour, minute, period),
        passengers,
      }));

    setResults(generated.length ? generated : defaultRoutes.slice(0, 3));
    setSelectedRoute(null);
    setMessage(`${generated.length || 3} route options generated successfully.`);
  };

  const saveTrip = () => {
    if (!selectedRoute) {
      setMessage("Select a route before saving the trip.");
      return;
    }
    onSaveTrip(selectedRoute);
    setMessage("Trip saved successfully.");
  };

  const bookTicket = () => {
    if (!selectedRoute) {
      setMessage("Select a route before booking.");
      return;
    }

    onBookTicket({
      ...selectedRoute,
      ticketId: `SJ${Date.now().toString().slice(-8)}`,
      bookedAt: new Date().toISOString(),
      status: "Confirmed",
      seat: `A${Math.floor(Math.random() * 20) + 1}`,
      price: selectedRoute.price * passengers,
    });
    navigate("/tickets");
  };

  return (
    <section className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Route finder</p>
          <h1>Smart Journey Planner</h1>
          <p>Enter your trip details and compare time, cost and transport options.</p>
        </div>
      </div>

      <article className="card planner-card">
        <div className="planner-grid">
          <CityInput
            id="source"
            value={source}
            onChange={setSource}
            placeholder="Source location"
          />
          <CityInput
            id="destination"
            value={destination}
            onChange={setDestination}
            placeholder="Destination"
          />

          <div className="input-with-icon">
            <CalendarDays size={17} className="field-icon" />
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </div>

          <div className="time-selector">
            <Clock3 size={17} />
            <select value={hour} onChange={(event) => setHour(event.target.value)}>
              <option value="">Hour</option>
              {Array.from({ length: 12 }, (_, index) => index + 1).map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
            <span>:</span>
            <select value={minute} onChange={(event) => setMinute(event.target.value)}>
              <option value="">Min</option>
              {["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"].map(
                (item) => <option key={item} value={item}>{item}</option>
              )}
            </select>
            <select value={period} onChange={(event) => setPeriod(event.target.value)}>
              <option value="">AM/PM</option>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>

          <div className="input-with-icon passenger-field">
            <Users size={17} className="field-icon" />
            <button type="button" onClick={() => setPassengers(Math.max(1, passengers - 1))}>−</button>
            <span>{passengers} passenger{passengers > 1 ? "s" : ""}</span>
            <button type="button" onClick={() => setPassengers(Math.min(8, passengers + 1))}>+</button>
          </div>

          <button className="primary-btn" type="button" onClick={searchRoutes}>
            <Search size={18} /> Search Journey
          </button>
        </div>

        <div className="transport-container">
          {transportModes.map((mode) => (
            <button
              type="button"
              key={mode}
              onClick={() => toggleMode(mode)}
              className={selectedModes.includes(mode) ? "transport active" : "transport"}
            >
              {mode}
            </button>
          ))}
        </div>
        {message && <p className="form-message">{message}</p>}
      </article>

      <div className="planner-content-grid">
        <article className="card map-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Live preview</p>
              <h2>Interactive Route Map</h2>
            </div>
          </div>
          <div className="map-canvas">
            <div className="map-point start"><MapPin size={18} />{source || "Start"}</div>
            <div className="map-route-line" />
            <div className="map-point end"><Navigation size={18} />{destination || "Destination"}</div>
            <div className="map-chip metro-chip">Metro</div>
            <div className="map-chip bus-chip">Bus</div>
            <div className="map-chip traffic-chip">Traffic</div>
          </div>
          <div className="route-summary-strip">
            <span><MapPin size={16} /> {source || "Source"}</span>
            <span>→</span>
            <span><Navigation size={16} /> {destination || "Destination"}</span>
          </div>
        </article>

        <article className="card live-card">
          <div className="section-title">
            <div>
              <p className="eyebrow">Current status</p>
              <h2>Live Vehicles</h2>
            </div>
          </div>
          {[
            { name: "Metro Blue Line", status: "On time", eta: "4 min" },
            { name: "City Bus 21A", status: "Moderate traffic", eta: "9 min" },
            { name: "Express Train", status: "Platform 2", eta: "18 min" },
          ].map((vehicle) => (
            <div className="vehicle-row" key={vehicle.name}>
              <div><strong>{vehicle.name}</strong><span>{vehicle.status}</span></div>
              <b>{vehicle.eta}</b>
            </div>
          ))}
        </article>
      </div>

      <div className="routes-section">
        <div className="section-title">
          <div>
            <p className="eyebrow">Recommended options</p>
            <h2>Available Routes</h2>
          </div>
          {results.length > 0 && <span>{results.length} results</span>}
        </div>

        {results.length === 0 ? (
          <article className="card empty-state">
            <RouteIcon size={38} />
            <h3>No routes generated yet</h3>
            <p>Fill the planner form and select Search Journey.</p>
          </article>
        ) : (
          <div className="route-grid">
            {results.map((route) => (
              <article
                className={selectedRoute?.id === route.id ? "card route-card selected" : "card route-card"}
                key={route.id}
              >
                <div className="route-card-head">
                  <div>
                    <span className="route-label">{route.label}</span>
                    <h3>{route.title}</h3>
                  </div>
                  <strong>₹{route.price}</strong>
                </div>
                <div className="route-path"><span>{route.source}</span><b>→</b><span>{route.destination}</span></div>
                <div className="route-meta">
                  <span><Clock3 size={15} /> {route.duration}</span>
                  <span><Navigation size={15} /> {route.distance}</span>
                  <span><Users size={15} /> {route.passengers}</span>
                </div>
                <div className="mode-list">{route.modes.map((mode) => <span key={mode}>{mode}</span>)}</div>
                <button className="secondary-btn" type="button" onClick={() => setSelectedRoute(route)}>
                  {selectedRoute?.id === route.id ? <><CheckCircle2 size={17} /> Selected</> : "Select Route"}
                </button>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedRoute && (
        <article className="card booking-bar">
          <div>
            <p className="eyebrow">Selected journey</p>
            <h3>{selectedRoute.source} → {selectedRoute.destination}</h3>
            <span>{formatDate(selectedRoute.date)} · {selectedRoute.departure} · ₹{selectedRoute.price * passengers}</span>
          </div>
          <div className="booking-actions">
            <button className="secondary-btn" type="button" onClick={saveTrip}><Save size={17} /> Save Trip</button>
            <button className="primary-btn" type="button" onClick={bookTicket}><Ticket size={17} /> Book Ticket</button>
          </div>
        </article>
      )}
    </section>
  );
}

function SavedTrips({ trips, onDelete, onBook }) {
  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">Your favourites</p><h1>Saved Trips</h1><p>Quickly reopen and book journeys you use regularly.</p></div>
      </div>

      {trips.length === 0 ? (
        <article className="card empty-state"><Bookmark size={40} /><h3>No saved trips</h3><p>Select a route in Journey Planner and click Save Trip.</p></article>
      ) : (
        <div className="list-grid">
          {trips.map((trip) => (
            <article className="card saved-card" key={trip.savedId}>
              <div className="saved-route"><div className="pin-circle"><MapPin size={18} /></div><div><h3>{trip.source} → {trip.destination}</h3><p>{formatDate(trip.date)} · {trip.departure}</p></div></div>
              <div className="saved-details"><span>{trip.title}</span><span>{trip.duration}</span><strong>₹{trip.price}</strong></div>
              <div className="card-actions"><button className="primary-btn" onClick={() => onBook(trip)}><Ticket size={16} /> Book</button><button className="icon-btn danger" onClick={() => onDelete(trip.savedId)}><Trash2 size={17} /></button></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function TicketsPage({ tickets, onDelete }) {
  return (
    <section className="page">
      <div className="page-heading">
        <div><p className="eyebrow">Booking history</p><h1>Tickets</h1><p>All booked journeys, prices, seats and travel details are saved here.</p></div>
      </div>

      {tickets.length === 0 ? (
        <article className="card empty-state"><Ticket size={40} /><h3>No tickets booked</h3><p>Book a selected route from Journey Planner.</p></article>
      ) : (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <article className="card ticket-item" key={ticket.ticketId}>
              <div className="ticket-main">
                <div className="ticket-icon"><Ticket size={24} /></div>
                <div>
                  <span className="status-badge">{ticket.status}</span>
                  <h3>{ticket.source} → {ticket.destination}</h3>
                  <p>{formatDate(ticket.date)} · {ticket.departure} · Seat {ticket.seat}</p>
                </div>
              </div>
              <div className="ticket-info">
                <div><span>Ticket ID</span><strong>{ticket.ticketId}</strong></div>
                <div><span>Transport</span><strong>{ticket.modes.join(" + ")}</strong></div>
                <div><span>Passengers</span><strong>{ticket.passengers}</strong></div>
                <div><span>Amount</span><strong>₹{ticket.price}</strong></div>
              </div>
              <div className="ticket-actions"><button className="secondary-btn" onClick={() => window.print()}><Download size={16} /> Print Ticket</button><button className="icon-btn danger" onClick={() => onDelete(ticket.ticketId)}><Trash2 size={17} /></button></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Analytics({ tickets, savedTrips }) {
  const totalSpent = tickets.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const totalPassengers = tickets.reduce((sum, item) => sum + Number(item.passengers || 0), 0);
  const favouriteMode = tickets.length
    ? Object.entries(
        tickets.flatMap((item) => item.modes).reduce((acc, mode) => ({ ...acc, [mode]: (acc[mode] || 0) + 1 }), {})
      ).sort((a, b) => b[1] - a[1])[0]?.[0]
    : "No data";

  const maxValue = Math.max(...monthlyStats.map((item) => item.value));

  return (
    <section className="page">
      <div className="page-heading"><div><p className="eyebrow">Travel intelligence</p><h1>Analytics</h1><p>Understand your travel cost, bookings and preferred transport.</p></div></div>

      <div className="stats-grid analytics-stats">
        {[
          { title: "Total bookings", value: tickets.length, icon: Ticket },
          { title: "Total spending", value: `₹${totalSpent}`, icon: IndianRupee },
          { title: "Passengers", value: totalPassengers, icon: Users },
          { title: "Favourite mode", value: favouriteMode, icon: Bus },
          { title: "Saved trips", value: savedTrips.length, icon: Bookmark },
        ].map((item) => {
          const Icon = item.icon;
          return <article className="card analytics-stat" key={item.title}><Icon size={21} /><p>{item.title}</p><h2>{item.value}</h2></article>;
        })}
      </div>

      <div className="analytics-layout">
        <article className="card chart-card">
          <div className="section-title"><div><p className="eyebrow">Monthly activity</p><h2>Journey Trends</h2></div></div>
          <div className="bar-chart">
            {monthlyStats.map((item) => (
              <div className="bar-column" key={item.month}>
                <span>{item.value}</span>
                <div className="bar-track"><div className="bar-fill" style={{ height: `${(item.value / maxValue) * 100}%` }} /></div>
                <strong>{item.month}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="card insight-list">
          <div className="section-title"><div><p className="eyebrow">AI insights</p><h2>Your Travel Summary</h2></div></div>
          <div className="insight-row"><Train size={20} /><div><strong>Best value</strong><span>Metro and train routes usually save more money.</span></div></div>
          <div className="insight-row"><Clock3 size={20} /><div><strong>Time saver</strong><span>Travelling before 8 AM can reduce delays.</span></div></div>
          <div className="insight-row"><Footprints size={20} /><div><strong>Eco score</strong><span>Public transport choices improve your carbon score.</span></div></div>
        </article>
      </div>
    </section>
  );
}

function Profile({ profile, setProfile }) {
  const [draft, setDraft] = React.useState(profile);
  const [saved, setSaved] = React.useState(false);

  const updateField = (field, value) => setDraft((current) => ({ ...current, [field]: value }));
  const saveProfile = (event) => {
    event.preventDefault();
    setProfile(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="page">
      <div className="page-heading"><div><p className="eyebrow">Account settings</p><h1>Profile</h1><p>Manage your identity, contact details and travel preferences.</p></div></div>

      <div className="profile-layout">
        <article className="card profile-summary">
          <div className="avatar-large">{draft.name?.charAt(0)?.toUpperCase() || "G"}</div>
          <h2>{draft.name || "Traveller"}</h2>
          <p>{draft.email}</p>
          <span>Smart Journey Member</span>
        </article>

        <form className="card profile-form" onSubmit={saveProfile}>
          <div className="form-grid">
            <label>Full name<input value={draft.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Email address<input type="email" value={draft.email} onChange={(event) => updateField("email", event.target.value)} /></label>
            <label>Phone number<input value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
            <label>Home city<input value={draft.city} onChange={(event) => updateField("city", event.target.value)} /></label>
            <label>Preferred mode<select value={draft.preferredMode} onChange={(event) => updateField("preferredMode", event.target.value)}>{transportModes.map((mode) => <option key={mode}>{mode}</option>)}</select></label>
            <label>Emergency contact<input value={draft.emergencyContact} onChange={(event) => updateField("emergencyContact", event.target.value)} /></label>
          </div>
          <button className="primary-btn" type="submit"><Save size={17} /> Save Profile</button>
          {saved && <p className="success-message">Profile updated successfully.</p>}
        </form>
      </div>
    </section>
  );
}

function Sidebar({ open, setOpen }) {
  const menus = [
    { icon: LayoutDashboard, text: "Dashboard", path: "/" },
    { icon: RouteIcon, text: "Journey Planner", path: "/planner" },
    { icon: Bookmark, text: "Saved Trips", path: "/saved" },
    { icon: Ticket, text: "Tickets", path: "/tickets" },
    { icon: BarChart3, text: "Analytics", path: "/analytics" },
    { icon: User, text: "Profile", path: "/profile" },
  ];

  return (
    <>
      {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Close menu" />}
      <aside className={open ? "sidebar open" : "sidebar"}>
        <div className="logo-row"><div className="logo-mark">SJ</div><div><strong>Smart Journey AI</strong><span>Travel planner</span></div><button className="mobile-close" onClick={() => setOpen(false)}><X size={20} /></button></div>
        <nav>
          {menus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.text}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) => (isActive ? "menu active" : "menu")}
                onClick={() => setOpen(false)}
              >
                <Icon size={19} />
                <span>{item.text}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="sidebar-footer"><p>Project folder</p><strong>travel-app / src</strong></div>
      </aside>
    </>
  );
}

function Topbar({ darkMode, setDarkMode, onMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" onClick={onMenu}><Menu size={21} /></button>
        <Breadcrumb />
      </div>
      <div className="top-search"><Search size={18} /><input placeholder="Search pages..." /></div>
      <div className="top-actions">
        <button className="icon-btn"><Bell size={19} /></button>
        <button className="icon-btn" onClick={() => setDarkMode((current) => !current)}>{darkMode ? <Sun size={19} /> : <Moon size={19} />}</button>
        <div className="avatar">G</div>
      </div>
    </header>
  );
}

function AppShell() {
  const [tickets, setTickets] = useStoredState(STORAGE_KEYS.tickets, []);
  const [savedTrips, setSavedTrips] = useStoredState(STORAGE_KEYS.savedTrips, []);
  const [profile, setProfile] = useStoredState(STORAGE_KEYS.profile, {
    name: "Gokul A",
    email: "gokulabg123@gmail.com",
    phone: "",
    city: "Coimbatore",
    preferredMode: "Metro",
    emergencyContact: "",
  });
  const [darkMode, setDarkMode] = useStoredState(STORAGE_KEYS.theme, false);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const saveTrip = (trip) => {
    setSavedTrips((current) => [
      { ...trip, savedId: `${Date.now()}`, savedAt: new Date().toISOString() },
      ...current,
    ]);
  };

  const bookTicket = (ticket) => setTickets((current) => [ticket, ...current]);
  const bookSavedTrip = (trip) => {
    bookTicket({
      ...trip,
      ticketId: `SJ${Date.now().toString().slice(-8)}`,
      status: "Confirmed",
      seat: `A${Math.floor(Math.random() * 20) + 1}`,
      bookedAt: new Date().toISOString(),
      price: trip.price * (trip.passengers || 1),
    });
  };

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="main-shell">
        <Topbar darkMode={darkMode} setDarkMode={setDarkMode} onMenu={() => setSidebarOpen(true)} />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard tickets={tickets} savedTrips={savedTrips} />} />
            <Route path="/planner" element={<JourneyPlanner onSaveTrip={saveTrip} onBookTicket={bookTicket} />} />
            <Route path="/saved" element={<SavedTrips trips={savedTrips} onDelete={(id) => setSavedTrips((current) => current.filter((item) => item.savedId !== id))} onBook={bookSavedTrip} />} />
            <Route path="/tickets" element={<TicketsPage tickets={tickets} onDelete={(id) => setTickets((current) => current.filter((item) => item.ticketId !== id))} />} />
            <Route path="/analytics" element={<Analytics tickets={tickets} savedTrips={savedTrips} />} />
            <Route path="/profile" element={<Profile profile={profile} setProfile={setProfile} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
