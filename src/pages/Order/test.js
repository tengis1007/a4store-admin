import React, { useEffect, useState } from "react";
import { firestore } from "../../firebase/firebaseConfig"; // Import firestore
import { collection, getDocs } from "firebase/firestore";

const OrderHistory = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetching all user data from Firestore
    const fetchUsers = async () => {
      const usersCollection = collection(firestore, "users"); // Referring to the 'users' collection in Firestore
      const snapshot = await getDocs(usersCollection); // Fetch documents in the 'users' collection
      const usersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const outputData = [];

      usersList.forEach((user) => {
        if(user.wallet.transactionHistory){
        user.wallet.transactionHistory.forEach((transaction) => {
          outputData.push({
            ...transaction,
            id: user.id,
            lastName: user.lastName,
            photoURL: user.photoURL,
            phone: user.phone,
            isMember: user.isMember,
            email: user.email,
            firstName: user.firstName,
          });
        });
    }
      });
      setUsers(outputData); // Set users data to state
    };

    fetchUsers();
  }, []);
console.log(users);
  return (
    <div>
    <h1>Order History</h1>
    {users.length > 0 ? (
      <pre>{JSON.stringify(users, null, 2)}</pre> // Display users as pretty-printed JSON
    ) : (
      <p>No users found</p>
    )}
  </div>
  );
};

export default OrderHistory;