import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { db } from "refrence/realConfig";
import { ref, set, push } from "firebase/database";
const AddProductDialog = ({ open, onClose }) => {
  // Ensure component name starts with uppercase "A"
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [count, setCount] = useState("");

  // Function to handle image change and convert to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result); // Store base64 encoded image
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  // Function to handle product addition
  const handleAddProduct = async () => {
    const newProductRef = ref(db, "products"); // Reference to the 'products' node

    // Use push() to generate a new key (auto key)
    const newProductKey = push(newProductRef).key; // This generates the key automatically, like '-ODKFNXJYNzDbEp19aOK'

    console.log("Generated Key:", newProductKey); // Log the generated key to the console for debugging

    const productData = {
      title,
      imageUrl: image,
      imageUrl2: image,
      count,
      buttonText: "Худалдан авах",
      navigateTo: "/buy",
      isPromotional: false,
      amount: 1500000,
    };

    try {
      // Store the product data under the generated key
      await set(ref(db, `products/${newProductKey}`), productData);
      alert("Product added successfully");
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("Error adding product. Please try again.");
    }
  };
  // Reset form after submission
  const resetForm = () => {
    setTitle("");
    setImage(null);
    setCount("");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Product</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          margin="normal"
        />
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {image && (
          <img
            src={image}
            alt="Product"
            style={{ width: "100px", marginTop: "10px" }}
          />
        )}
        <TextField
          label="Count"
          fullWidth
          type="number"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            resetForm();
          }}
          color="primary"
        >
          Cancel
        </Button>

        <Button onClick={handleAddProduct} color="primary">
          Add Product
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProductDialog;
