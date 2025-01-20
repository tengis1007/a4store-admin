import React, { useState, useEffect } from "react";
import { Grid2, CircularProgress, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { firestore, storage } from "../../firebase/firebaseConfig"; // Adjust based on your Firebase config
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ProductCard from "./ProdcutCard";

const CategoryList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryImage, setCategoryImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const productCollection = collection(firestore, "products");
        const productSnapshot = await getDocs(productCollection);
        const productlist = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(productlist);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (categoryTitle && categoryImage) {
      try {
        setUploading(true);
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `categoryImages/${categoryImage.name}`);
        await uploadBytes(imageRef, categoryImage);
        const imageUrl = await getDownloadURL(imageRef);

        // Save category title and image URL to Firestore
        await addDoc(collection(firestore, "categories"), {
          title: categoryTitle,
          img:imageUrl,
          timestamp: new Date()
        });

        // Close dialog and reset fields
        setCategoryTitle("");
        setCategoryImage(null);
        setOpenDialog(false);
      } catch (error) {
        console.error("Error saving category: ", error);
      } finally {
        setUploading(false);
      }
    } else {
      console.log("Title and image are required!");
    }
  };

  const handleDialogOpen = () => {
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(file);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <CircularProgress />
      </div>
    );
  }
  const handleDeleteProduct = (productToDelete) => {
    // Logic to delete the product from the state or database

    console.log("Product deleted:", productToDelete);
  };
  return (
    <>
      <Button onClick={handleDialogOpen}>Add Category</Button>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Category Title"
            fullWidth
            value={categoryTitle}
            onChange={(e) => setCategoryTitle(e.target.value)}
          />
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            style={{ marginTop: "10px" }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">Cancel</Button>
          <Button onClick={handleSubmit} color="primary" disabled={uploading}>
            {uploading ? "Uploading..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ display: "flex", width: "100%" }}>
        <Grid2
          sx={{
            margin: "2vh",
          }}
          container
          spacing={1.2}
        >
          {data.map((product) => (
            <ProductCard key={product.id} product={product} onDelete={handleDeleteProduct}/>
          ))}
        </Grid2>
      </div>
    </>
  );
};

export default CategoryList;
