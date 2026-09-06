function Sidebar({ currentPage, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Service Desk</div>

      <nav className="sidebar-nav">
        <button
          className={`sidebar-link ${
            currentPage === 'dashboard' ? 'active' : ''
          }`}
          onClick={() => onNavigate('dashboard')}
        >
          Dashboard
        </button>

        <button
          className={`sidebar-link ${
            currentPage === 'tickets' ? 'active' : ''
          }`}
          onClick={() => onNavigate('tickets')}
        >
          Tickets
        </button>
      </nav>
    </aside>
  );
}

export default Sidebar;
