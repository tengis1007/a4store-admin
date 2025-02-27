import { signOut } from 'firebase/auth';
import { auth } from 'refrence/storeConfig';

// Reusable logout function
export const logout = (navigate) => {
  return async () => {
    try {
      await signOut(auth); // Sign out using Firebase Authentication
      localStorage.removeItem('user'); // Clear persisted user data
      navigate('/signin'); // Redirect to login page
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };
};
