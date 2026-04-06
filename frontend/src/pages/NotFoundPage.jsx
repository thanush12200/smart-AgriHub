import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(26,122,76,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(200,97,31,0.14),transparent_24%),linear-gradient(180deg,#f8f6f1_0%,#f3efe6_100%)] px-5 py-10">
    <div className="mx-auto mt-20 max-w-lg page-hero text-center">
      <p className="page-kicker">404</p>
      <h2 className="page-title">Page not found</h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600">The page you requested does not exist or may have moved to a different route.</p>
      <Link className="btn-primary mt-6" to="/">Go Home</Link>
    </div>
  </div>
);

export default NotFoundPage;
