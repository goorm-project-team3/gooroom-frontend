import { Navigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { api } from '@/api/instance';
import { Spinner } from '@vapor-ui/core';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'unauth'>('loading');

  useEffect(() => {
    api
      .get('auth/me')
      .then(() => setStatus('ok'))
      .catch(() => setStatus('unauth'));
  }, []);

  if (status === 'loading')
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  if (status === 'unauth') return <Navigate to="/login" replace />;
  return <>{children}</>;
}
