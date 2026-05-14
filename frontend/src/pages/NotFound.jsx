import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card p-12 text-center">
      <div className="text-5xl font-bold text-slate-300">404</div>
      <h1 className="mt-2 text-xl font-semibold">Page not found</h1>
      <p className="text-slate-500 mt-1">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-4 w-fit mx-auto">Go home</Link>
    </div>
  );
}
