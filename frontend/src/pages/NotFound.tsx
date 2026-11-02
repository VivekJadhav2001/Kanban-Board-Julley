import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4">
          <AlertCircle className="h-8 w-8 text-accent" />
        </div>
        <h1 className="text-3xl font-bold text-text-h mb-2">Page not found</h1>
        <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          <Home className="h-4 w-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
