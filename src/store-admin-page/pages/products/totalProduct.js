import React, { useState, useEffect, useCallback } from "react";
import {
  Grid2,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
  TextField,
  InputAdornment,
  Box
} from "@mui/material";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig";
import ProductCard from "./ProductCard";
import DeleteProduct from "./DeleteProduct";
import EditProduct from "./EditProduct";
import AddIcon from "@mui/icons-material/Add";
import AddProduct from "./AddProducts";
import SearchIcon from "@mui/icons-material/Search"; // Import SearchIcon
const ProductList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewProductDialog, setOpenNewProductDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState([]);
  useEffect(() => {
    const productCollection = collection(firestore, "products");
  
    // Subscribe to real-time updates using onSnapshot
    const unsubscribe = onSnapshot(
      productCollection,
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(productList); // Update state with new data
        setLoading(false); // Stop loading once data is fetched
      },
      (error) => {
        console.error("Error fetching products: ", error);
        setLoading(false); // Stop loading in case of an error
      }
    );
  
    // Cleanup subscription on component unmount
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productCollection = collection(firestore, "products");
        const productSnapshot = await getDocs(productCollection);
        const productList = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setData(productList);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  const handleSearchChange = (event) => {
    const value = event.target.value;
    const searchResult = data.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase())
    );
    setSearch(value);
    setSearchData(searchResult);
  };
  const handleOpenNewProductDialog = () => setOpenNewProductDialog(true);
  const handleCloseProductDialog = () => setOpenNewProductDialog(false);

  const handleOpenDeleteDialog = (product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = useCallback((productId) => {
    setData((prevData) =>
      prevData.filter((product) => product.id !== productId)
    );
    setSnackbarOpen(true);
  }, []);

  const handleSaveEditedProduct = useCallback((productId, updatedProduct) => {
    setData((prevData) =>
      prevData.map((product) =>
        product.id === productId ? { ...product, ...updatedProduct } : product
      )
    );
  }, []);

  const handleSaveNewProduct = (newProduct) => {
    setData((prevData) => [...prevData, newProduct]);
    setOpenNewProductDialog(false);
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <TextField
        label="Search"
        variant="outlined"
        value={search}
        onChange={handleSearchChange}
        sx={{ margin: "2vh", marginLeft: "4vh" }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <Button
        size="large"
        sx={{ margin: "2vh" }}
        onClick={handleOpenNewProductDialog}
        variant="contained"
        startIcon={<AddIcon />}
      >
        Бүтээгдэхүүн нэмэх
      </Button>
      <Grid2 sx={{ margin: "2vh" }} container spacing={2}>
      <Box sx={{ width: "100%" }}>
        <Grid2 sx={{ margin: "2vh" }} container spacing={2}>
          {/* Use nullish coalescing and optional chaining for concise logic */}
          {(searchData?.length ? searchData : data || []).map((product) => (
            <ProductCard
              key={product.id} // Ensure `id` is unique
              product={product}
              onDelete={() => handleOpenDeleteDialog(product)} // Pass product to delete handler
              onEdit={() => handleOpenEditDialog(product)} // Pass product to edit handler
            />
          ))}
        </Grid2>
        </Box>
      </Grid2>
      {/* Add Product Dialog */}
      {openNewProductDialog && (
        <AddProduct
          open={openNewProductDialog}
          onClose={handleCloseProductDialog}
          onSave={handleSaveNewProduct}
        />
      )}

      {/* Delete Product Dialog */}
      {deleteDialogOpen && (
        <DeleteProduct
          product={selectedProduct}
          onClose={handleCloseDeleteDialog}
          onDelete={handleDeleteProduct}
        />
      )}

      {/* Edit Product Dialog */}
      {editDialogOpen && (
        <EditProduct
          product={selectedProduct}
          onClose={handleCloseEditDialog}
          onSave={handleSaveEditedProduct}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Бүтээгдэхүүн амжилттай устгагдлаа!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ProductList;
