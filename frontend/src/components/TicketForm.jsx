function TicketForm({
  title,
  description,
  priority,
  isEditing,
  isCreating,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>{isEditing ? "Edit Ticket" : "Create Ticket"}</h2>
      </div>

      <form className="form" onSubmit={onSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="ticket-title">
            Title
          </label>

          <input
            id="ticket-title"
            className="form-input"
            type="text"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Ticket title"
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ticket-description">
            Description
          </label>

          <textarea
            id="ticket-description"
            className="form-textarea"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Describe the problem"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="ticket-priority">
            Priority
          </label>

          <select
            id="ticket-priority"
            className="form-select"
            value={priority}
            onChange={(event) => onPriorityChange(event.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <button
          className="button button-primary"
          type="submit"
          disabled={isCreating}
        >
          {isCreating
            ? "Saving..."
            : isEditing
              ? "Save Changes"
              : "Create Ticket"}
        </button>

        {isEditing && (
          <button
            className="button button-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </form>
    </section>
  );
}

export default TicketForm;