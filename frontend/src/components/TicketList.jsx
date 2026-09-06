function TicketList({ tickets, onEdit, onDelete }) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>My Tickets</h2>
      </div>

      {tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-title">No tickets found</div>
          <p>Try changing your search or filters.</p>
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

                  {ticket.description && (
                    <div className="ticket-description">
                      {ticket.description}
                    </div>
                  )}

                  <div className="ticket-id">#{ticket.id.slice(0, 8)}</div>
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
                  <div className="ticket-actions">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => onEdit(ticket)}
                    >
                      Edit
                    </button>

                    <button
                      className="button button-danger"
                      type="button"
                      onClick={() => onDelete(ticket.id)}
                    >
                      Delete
                    </button>
                  </div>
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
