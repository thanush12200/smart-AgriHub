import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#065f4622_0%,#0b1023_50%,#050816_100%)] px-5 py-10">
    <div className="mx-auto mt-20 max-w-md card p-6 text-center">
      <h2 className="font-display text-2xl font-bold text-slate-900">404 - Page not found</h2>
      <p className="mt-2 text-sm text-slate-600">The page you requested does not exist.</p>
      <Link className="btn-primary mt-4" to="/">Go Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
