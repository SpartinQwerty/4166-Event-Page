import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export function useAdmin() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if the user is an admin when the session changes
    if (status === 'authenticated' && session?.user) {
      // Check if isAdmin property exists on the user object
      if ('isAdmin' in session.user) {
        setIsAdmin(!!session.user.isAdmin);
      } else {
        // Fallback: check if the user is admin@gmail.com
        setIsAdmin(session.user.email === 'admin@gmail.com');
      }
    } else {
      setIsAdmin(false);
    }
  }, [session, status]);

  return {
    isAdmin,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated'
  };
}
