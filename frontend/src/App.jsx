import { useState } from 'react';
import {
  useAuthenticationStatus,
  useNhostClient,
  useSignInEmailPassword,
} from '@nhost/react';

import useTickets from './hooks/useTickets';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');

  const [editingTicket, setEditingTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const {
    signInEmailPassword,
    isLoading: isSigningIn,
    error: signInError,
  } = useSignInEmailPassword();

  const nhost = useNhostClient();

  const {
    tickets,
    ticketsError,
    createError,
    isCreating,
    createTicket,
    updateTicket,
    deleteTicket,
  } = useTickets(nhost, isAuthenticated);

  const handleLogin = async (event) => {
    event.preventDefault();

    await signInEmailPassword(email, password);
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    const success = await createTicket({
      title,
      description,
      priority,
    });

    if (success) {
      setTitle('');
      setDescription('');
      setPriority('low');
    }
  };

  const handleUpdateTicket = async (event) => {
    event.preventDefault();

    const success = await updateTicket(editingTicket);

    if (success) {
      setEditingTicket(null);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this ticket?'
    );

    if (!confirmed) {
      return;
    }

    await deleteTicket(ticketId);
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setCurrentPage('tickets');
  };

  const handleCancelEdit = () => {
    setEditingTicket(null);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      ticket.title.toLowerCase().includes(search) ||
      (ticket.description || '').toLowerCase().includes(search);

    const matchesStatus =
      statusFilter === 'all' || ticket.status === statusFilter;

    const matchesPriority =
      priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="app-layout">
        <main className="main-content">
          <div className="page">
            <div className="page-heading">
              <h1>Service Desk</h1>
              <p>Sign in to manage your support tickets.</p>
            </div>

            <section className="section">
              <div className="section-header">
                <h2>Sign in</h2>
              </div>

              <form className="form" onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email
                  </label>

                  <input
                    id="email"
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="password">
                    Password
                  </label>

                  <input
                    id="password"
                    className="form-input"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    required
                  />
                </div>

                <button
                  className="button button-primary"
                  type="submit"
                  disabled={isSigningIn}
                >
                  {isSigningIn ? 'Signing in...' : 'Sign in'}
                </button>

                {signInError && <p>{signInError.message}</p>}
              </form>
            </section>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="main-content">
        <Header />

        {currentPage === 'dashboard' && (
          <div className="page">
            <div className="page-heading">
              <h1>Dashboard</h1>
              <p>Manage and track your support tickets.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Tickets</div>
                <div className="stat-value">{tickets.length}</div>
              </div>

              <div className="stat-card">
                <div className="stat-label">Open Tickets</div>
                <div className="stat-value">
                  {tickets.filter((ticket) => ticket.status === 'open').length}
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-label">High Priority</div>
                <div className="stat-value">
                  {
                    tickets.filter((ticket) => ticket.priority === 'high')
                      .length
                  }
                </div>
              </div>
            </div>

            <section className="section">
              <div className="section-header">
                <h2>Recent Tickets</h2>
              </div>

              <TicketList
                tickets={tickets.slice(0, 5)}
                onEdit={handleEditTicket}
                onDelete={handleDeleteTicket}
              />
            </section>
          </div>
        )}

        {currentPage === 'tickets' && (
          <div className="page">
            <div className="page-heading">
              <h1>Tickets</h1>
              <p>Create, update and manage your support tickets.</p>
            </div>

            <div className="ticket-filters">
              <input
                className="form-input"
                type="search"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                className="form-select"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>

              <select
                className="form-select"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <TicketForm
              title={editingTicket ? editingTicket.title : title}
              description={
                editingTicket ? editingTicket.description || '' : description
              }
              priority={editingTicket ? editingTicket.priority : priority}
              isEditing={Boolean(editingTicket)}
              isCreating={isCreating}
              onTitleChange={(value) =>
                editingTicket
                  ? setEditingTicket({
                      ...editingTicket,
                      title: value,
                    })
                  : setTitle(value)
              }
              onDescriptionChange={(value) =>
                editingTicket
                  ? setEditingTicket({
                      ...editingTicket,
                      description: value,
                    })
                  : setDescription(value)
              }
              onPriorityChange={(value) =>
                editingTicket
                  ? setEditingTicket({
                      ...editingTicket,
                      priority: value,
                    })
                  : setPriority(value)
              }
              onSubmit={editingTicket ? handleUpdateTicket : handleCreateTicket}
              onCancel={handleCancelEdit}
            />

            <br />

            {createError && <p>{createError}</p>}
            {ticketsError && <p>{ticketsError}</p>}

            <TicketList
              tickets={filteredTickets}
              onEdit={handleEditTicket}
              onDelete={handleDeleteTicket}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
