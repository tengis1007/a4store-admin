import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import { auth } from "./refrence/storeConfig"; // Use the pre-configured Firebase auth instance
import { onAuthStateChanged } from "firebase/auth";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./user-page/pages/home";
import Signin from "./user-page/auth/signin";
import Signup from "./user-page/auth/Signup";
import CircularProgress from "@mui/material/CircularProgress";
import AdminStore from "./store-admin-page/StoreAdmin";
import { ThemeProvider, createTheme, Box } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";
import { PrimeReactProvider } from "primereact"; // Adjust the import path as needed
import BottomTab from "./user-page/components/BottomTab";
import Header from "./user-page/components/HeaderTab";
import Wallet from "./user-page/pages/wallet/wallet";
import MyAccount from "./user-page/pages/myAccount/myAccount";
import Organizations from "./user-page/pages/organizations/organizations";
import Settings from "./user-page/pages/settings/settings";
import A4Header from "./a4-admin-page/header";
import OrgChart from "./user-page/pages/OrgChart/OrgChart";
import "./index.css";
const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Use navigate hook here
  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate("/signin");
        setUser(null);
        console.log("No user is signed in.");
      }
      setLoading(false); // Stop showing loading state once auth state is determined
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [navigate]); // Add navigate to dependencies so it's updated properly
  const theme = createTheme({
    cssVariables: true,
    palette: {
      // mode: darkMode ? "dark" : "light",
    },
  });
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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PrimeReactProvider>
        <Box sx={{ position: "relative", zIndex: 3, overflow: "auto" }}>
          <Routes>
            {/* Public routes */}
            <Route path="/signin" element={<Signin />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
            {/* Protected routes */}
            <Route
              path="/myaccount"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <MyAccount />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wallet"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Organizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orgchart"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <OrgChart />
                </ProtectedRoute>
              }
            />
            {/*  STORE Admin routes */}
            <Route
              path="/admin/store"
              element={
                <ProtectedRouteAdmin redirectTo="/home">
                  <AdminStore />
                </ProtectedRouteAdmin>
              }
            />
            <Route path="/admin/a4" element={<A4Header />} />
            {/*  A4 Admin routes */}

            {/* Error route */}
            <Route
              path="*"
              element={
                <ProtectedRoute redirectTo="/signin">
                  <Header />
                  <BottomTab />
                  <Wallet />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Box>
      </PrimeReactProvider>
    </ThemeProvider>
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
