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
  console.log("user",user);
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
  if (user) {
    user.getIdToken().then((idToken) => {
      // ID токенээ localStorage-д хадгалах
      console.log("idToken",idToken);
      localStorage.setItem('firebase_token', idToken);
    }).catch((error) => {
      console.error("ID токен авахад алдаа гарлаа:", error);
    });
  } else {
    console.log("Хэрэглэгч нэвтрээгүй байна.");
  }
  useEffect(() => {
    const storedUserData = localStorage.getItem("user");

    if (storedUserData) {
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
    return <div>Loading...</div>; // Optionally show a loading state while data is being fetched
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
