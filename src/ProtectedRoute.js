// ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';  // Use Navigate to redirect in React Router v6
import { auth } from './refrence/storeConfig';  // Import Firebase auth

const ProtectedRoute = ({ children, redirectTo }) => {
  const user = auth.currentUser;  // Check if the user is logged in

  if (!user) {
    // If the user is not authenticated, redirect to the provided path (e.g., /signin)
    return <Navigate to={redirectTo} />;
  }
  return children;  // If authenticated, render the protected component (Buy)
};

export default ProtectedRoute;
