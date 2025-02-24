import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { auth } from "./firebase/firebaseConfig"; // Use the pre-configured Firebase auth instance
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./home";
import Signin from "./pages/auth/signin";
import Signup from "./pages/auth/Signup";
import CircularProgress from '@mui/material/CircularProgress';
const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate hook here
  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log("User is signed in:", user);
        // If user is signed in, navigate to home page (only once)
        if (window.location.pathname !== "/home") {
          navigate("/home");
        }
      } else {
        setUser(null);
        console.log("No user is signed in.");
      }
      setLoading(false); // Stop showing loading state once auth state is determined
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]); // Add navigate to dependencies so it's updated properly

  // Show loading indicator while auth state is being determined
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh", // Full viewport height
          width: "100vw", // Full viewport width
          backgroundColor: "#f4f4f4", // Optional background color
        }}
      >
        <CircularProgress 
          disableShrink 
          size={80} // Larger spinner
          thickness={4.5} // Optional: Adjust thickness
        />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />

      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute redirectTo="/">
            <Home />
          </ProtectedRoute>
        }
      />
      {/* Error route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
};
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};
export default App;
