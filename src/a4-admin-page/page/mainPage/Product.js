import React, { useState } from "react";
import AddProductDialog from "./AddProductDialog"; // Adjust the path as necessary
import { Button } from "@mui/material";

const Product = () => {  // Rename "product" to "Product"
  const [dialogOpen, setDialogOpen] = useState(false);

  // Function to open the dialog
  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  // Function to close the dialog
  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <div>
      {/* Button to trigger the Add Product dialog */}
      <Button variant="contained" color="primary" onClick={handleDialogOpen}>
        Add Product
      </Button>

      {/* AddProductDialog component that receives open and onClose as props */}
      <AddProductDialog open={dialogOpen} onClose={handleDialogClose} />
    </div>
  );
};

export default Product;
