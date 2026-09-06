function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Service Desk</div>

      <nav className="sidebar-nav">
        <button className="sidebar-link active">Dashboard</button>
        <button className="sidebar-link">Tickets</button>
      </nav>
    </aside>
  );
}

export default Sidebar;