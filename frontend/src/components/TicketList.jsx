function TicketList({ tickets, onEdit, onDelete }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>My Tickets</h2>
      </div>

      {tickets.length === 0 ? (
        <div className="form">
          <p>No tickets found.</p>
        </div>
      ) : (
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>
                  <div className="ticket-title">{ticket.title}</div>
                  <div>{ticket.description}</div>
                </td>

                <td>
                  <span className={`badge badge-${ticket.status}`}>
                    {ticket.status}
                  </span>
                </td>

                <td>
                  <span className={`badge badge-${ticket.priority}`}>
                    {ticket.priority}
                  </span>
                </td>

                <td>{new Date(ticket.created_at).toLocaleDateString()}</td>

                <td>
                  <button
                    className="button button-secondary"
                    onClick={() => onEdit(ticket)}
                  >
                    Edit
                  </button>{' '}
                  <button
                    className="button button-danger"
                    onClick={() => onDelete(ticket.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default TicketList;
