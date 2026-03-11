import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { motion } from 'motion/react';

/**
 * Wraps protected routes. Redirects to /login if not authenticated.
 * Shows a spinner while auth state is still loading from localStorage.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="size-10 border-[3px] border-primary/20 border-t-primary rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
