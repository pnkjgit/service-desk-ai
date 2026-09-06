import { useSignOut } from '@nhost/react';

function Header() {
  const { signOut, isLoading } = useSignOut();

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="header">
      <h1 className="header-title">Service Desk</h1>

      <div className="header-user">
        <span>Admin User</span>

        <div className="user-avatar">AU</div>

        <button
          className="button button-secondary"
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? 'Signing out...' : 'Logout'}
        </button>
      </div>
    </header>
  );
}

export default Header;
