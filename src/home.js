import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig'; // Assuming you have a firebase.js file for Firebase config
import { useNavigate } from 'react-router-dom';
import Header from './pages/home/header'; // Make sure the Header component path is correct

const Home = () => {
  const navigate = useNavigate();



  return (

      <Header />
      
  
  );
};

export default Home;
