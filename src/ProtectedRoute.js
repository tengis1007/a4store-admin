import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom"; // Use Navigate to redirect in React Router v6
import { auth } from "./refrence/storeConfig"; // Import Firebase auth
import { doc, getDoc } from "firebase/firestore"; // Ensure you're importing firestore methods
import { firestore } from "refrence/storeConfig"; // Assuming firestore is initialized in a firebase.js file

const ProtectedRoute = ({ children, redirectTo }) => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [errors, setErrors] = useState(null);
  const user = auth.currentUser; // Check if the user is logged in
  const token = new URLSearchParams(window.location.search).get("token");

  const fetchUserData = async (uid) => {
    try {
      const userRef = doc(firestore, "users", uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        setErrors("Та бүртгэлгүй байна.");
        setLoading(false);
        return null;
      }
      const userData = userSnap.data();
      delete userData.password;

      const docRef = doc(firestore, "users", uid, "point", "balance");
      const docSnap = await getDoc(docRef);
      let pointBalance = 0;
      if (docSnap.exists()) {
        pointBalance = docSnap.data().balance; // Assuming the balance field exists
      } else {
        console.log("No such document!");
      }

      return { ...userData, id: uid, point: pointBalance };
    } catch (error) {
      console.error("Error fetching user data: ", error);
      setErrors("Error fetching user data.");
      setLoading(false);
      return null;
    }
  };
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");

    if (storedUserData && token) {
      setUserData(JSON.parse(storedUserData));
      setLoading(false);
    } else if (user) {
      fetchUserData(user.uid).then((fetchedData) => {
        if (fetchedData) {
          setUserData(fetchedData);
          localStorage.setItem("user", JSON.stringify(fetchedData));
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-t-transparent border-[#1976d2] dark:border-[#1976d2] rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-t-transparent border-[#1976d2]/80 dark:border-[#1976d2]/80 rounded-full animate-spin-slow" />
        <div className="absolute inset-4 border-4 border-t-transparent border-[#1976d2]/60 dark:border-[#1976d2]/60 rounded-full animate-spin-slower" />
      </div>
    </div>

    <style jsx>{`
      @keyframes spin-slow {
        to {
          transform: rotate(360deg);
        }
      }
      @keyframes spin-slower {
        to {
          transform: rotate(-360deg);
        }
      }
      @keyframes morph {
        0% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; }
        50% { border-radius: 30% 60% 70% 40%/50% 60% 30% 60%; }
        100% { border-radius: 60% 40% 30% 70%/60% 30% 70% 40%; }
      }
      .animate-spin-slow {
        animation: spin-slow 3s linear infinite;
      }
      .animate-spin-slower {
        animation: spin-slower 4s linear infinite;
      }
      .animate-morph {
        animation: morph 8s ease-in-out infinite;
      }
      .delay-100 {
        animation-delay: 100ms;
      }
      .delay-200 {
        animation-delay: 200ms;
      }
    `}</style>
  </div> // Optionally show a loading state while data is being fetched
  }

  if (errors) {
    return <div>{errors}</div>; // Display any errors
  }

  if (!user || !userData) {
    return <Navigate to={redirectTo} />; // Redirect to the provided path if not authenticated
  }

  return children; // If authenticated, render the protected component (Buy)
};

export default ProtectedRoute;
