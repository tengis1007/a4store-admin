export const getUserData = () => {
    try {
      const users = localStorage.getItem("user"); // Get the stored data
      if (users) {
        return JSON.parse(users); // Parse the JSON string into an object
      }
      return null; // Return null if no data exists
    } catch (error) {
      console.error("Error parsing localStorage.users:", error.message);
      return null; // Handle errors gracefully
    }
  };