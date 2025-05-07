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
        // Fallback: check if the user's email is in the list of admin emails
        const adminEmails = [
          'admin@gmail.com',
          'admin@example.com',
          'test@test.com',
          'test@example.com',
          'user@example.com',
          'john@example.com',
          'jane@example.com'
        ];
        
        // Only grant admin access to specific email addresses
        const userEmail = session.user.email || '';
        setIsAdmin(adminEmails.includes(userEmail));
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
