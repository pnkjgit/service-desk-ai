import { useEffect, useState } from 'react';
import {
  useAuthenticationStatus,
  useSignInEmailPassword,
  useNhostClient,
} from '@nhost/react';
import {
  GET_TICKETS,
  CREATE_TICKET,
  UPDATE_TICKET,
  DELETE_TICKET,
} from './graphql/tickets';

function App() {
  const [tickets, setTickets] = useState([]);
  const [editingTicket, setEditingTicket] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('low');
  const [isCreating, setIsCreating] = useState(false);

  const [ticketsError, setTicketsError] = useState('');
  const [createError, setCreateError] = useState('');

  const { isAuthenticated, isLoading } = useAuthenticationStatus();

  const {
    signInEmailPassword,
    isLoading: isSigningIn,
    error,
  } = useSignInEmailPassword();

  const nhost = useNhostClient();

useEffect(() => {
  if (!isAuthenticated) {
    return;
  }

  let cancelled = false;

  const loadTickets = async () => {
    try {
      const { data, error } = await nhost.graphql.request(GET_TICKETS);

      if (error) {
        throw error;
      }

      if (!cancelled) {
        setTickets(data.tickets);
        setTicketsError("");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);

      if (!cancelled) {
        setTicketsError("Unable to load tickets.");
      }
    }
  };

  loadTickets();

  return () => {
    cancelled = true;
  };
}, [isAuthenticated, nhost]);

  const handleLogin = async (event) => {
    event.preventDefault();

    await signInEmailPassword(email, password);
  };

  const handleCreateTicket = async (event) => {
    event.preventDefault();

    try {
      setIsCreating(true);
      setCreateError('');

      const { data, error } = await nhost.graphql.request(CREATE_TICKET, {
        title,
        description,
        priority,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) => [
        data.insert_tickets_one,
        ...currentTickets,
      ]);

      setTitle('');
      setDescription('');
      setPriority('low');
    } catch (error) {
      console.error('Error creating ticket:', error);
      setCreateError('Unable to create ticket.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTicket = async (event) => {
    event.preventDefault();

    try {
      const { data, error } = await nhost.graphql.request(UPDATE_TICKET, {
        id: editingTicket.id,
        title: editingTicket.title,
        description: editingTicket.description,
        status: editingTicket.status,
        priority: editingTicket.priority,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) =>
        currentTickets.map((ticket) =>
          ticket.id === data.update_tickets_by_pk.id
            ? data.update_tickets_by_pk
            : ticket
        )
      );

      setEditingTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this ticket?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const { data, error } = await nhost.graphql.request(DELETE_TICKET, {
        id: ticketId,
      });

      if (error) {
        throw error;
      }

      setTickets((currentTickets) =>
        currentTickets.filter(
          (ticket) => ticket.id !== data.delete_tickets_by_pk.id
        )
      );
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <h1>Service Desk</h1>

        <form onSubmit={handleLogin}>
          <div>
            <label>Email</label>
            <br />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <br />

          <div>
            <label>Password</label>
            <br />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <br />

          <button type="submit" disabled={isSigningIn}>
            {isSigningIn ? 'Signing in...' : 'Sign in'}
          </button>

          {error && <p>{error.message}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Service Desk</h1>
      <hr />

      <h2>Create Ticket</h2>

      <form onSubmit={handleCreateTicket}>
        <div>
          <label>Title</label>
          <br />
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ticket title"
            required
          />
        </div>

        <br />

        <div>
          <label>Description</label>
          <br />
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the problem"
            rows="4"
          />
        </div>

        <br />

        <div>
          <label>Priority</label>
          <br />
          <select
            value={priority}
            onChange={(event) => setPriority(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <br />

        <button type="submit" disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Ticket'}
        </button>

        {createError && <p>{createError}</p>}
      </form>

      <hr />

      {editingTicket && (
        <>
          <h2>Edit Ticket</h2>

          <form onSubmit={handleUpdateTicket}>
            <div>
              <label>Title</label>
              <br />
              <input
                type="text"
                value={editingTicket.title}
                onChange={(event) =>
                  setEditingTicket({
                    ...editingTicket,
                    title: event.target.value,
                  })
                }
                required
              />
            </div>

            <br />

            <div>
              <label>Description</label>
              <br />
              <textarea
                value={editingTicket.description || ''}
                onChange={(event) =>
                  setEditingTicket({
                    ...editingTicket,
                    description: event.target.value,
                  })
                }
                rows="4"
              />
            </div>

            <br />

            <div>
              <label>Status</label>
              <br />
              <select
                value={editingTicket.status}
                onChange={(event) =>
                  setEditingTicket({
                    ...editingTicket,
                    status: event.target.value,
                  })
                }
              >
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <br />

            <div>
              <label>Priority</label>
              <br />
              <select
                value={editingTicket.priority}
                onChange={(event) =>
                  setEditingTicket({
                    ...editingTicket,
                    priority: event.target.value,
                  })
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <br />

            <button type="submit">Save Changes</button>

            <button type="button" onClick={() => setEditingTicket(null)}>
              Cancel
            </button>
          </form>

          <hr />
        </>
      )}

      <h2>My Tickets</h2>

      {ticketsError && <p>{ticketsError}</p>}

      {!ticketsError && tickets.length === 0 && <p>No tickets found.</p>}

      {tickets.map((ticket) => (
        <div key={ticket.id}>
          <h3>{ticket.title}</h3>

          <p>{ticket.description}</p>

          <p>
            Status: {ticket.status} | Priority: {ticket.priority}
          </p>

          <button onClick={() => setEditingTicket(ticket)}>Edit</button>

          <button onClick={() => handleDeleteTicket(ticket.id)}>Delete</button>

          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;
