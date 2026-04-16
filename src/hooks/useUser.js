import { useState, useEffect } from 'react';

export function useUser() {
  // Initialize state from localStorage synchronously
  const [user, setUser] = useState(() => {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (e) {
      console.error('Error reading user from localStorage:', e);
      return null;
    }
  });

  useEffect(() => {
    // Listen untuk perubahan localStorage dari tab/window lain
    const handleStorageChange = () => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error parsing user from storage:', e);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event untuk perubahan user di tab yang sama
    const handleUserChange = (event) => {
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error('Error parsing user from custom event:', e);
      }
    };

    window.addEventListener('userChanged', handleUserChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userChanged', handleUserChange);
    };
  }, []);

  return user;
}
