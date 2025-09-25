import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'text-primary-600' : 'text-gray-600 hover:text-gray-900';
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-brand-charcoal">Solhem Digital Archive</h1>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className={isActive('/')}>Dashboard</Link>
            <Link to="/properties" className={isActive('/properties')}>Properties</Link>
            <Link to="/events" className={isActive('/events')}>Event Parties</Link>
            <Link to="/media" className={isActive('/media')}>Media</Link>
            <a href="#" className="text-gray-600 hover:text-gray-900">Reports</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}