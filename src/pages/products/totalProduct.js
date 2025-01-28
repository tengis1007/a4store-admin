import React, { useState, useEffect, useCallback } from "react";
import {
  Grid2,
  CircularProgress,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";
import ProductCard from "./ProductCard";
import DeleteProduct from "./DeleteProduct";
import EditProduct from "./EditProduct";
import AddIcon from "@mui/icons-material/Add";
import AddProduct from "./AddProducts";

const ProductList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNewProductDialog, setOpenNewProductDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

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
        {data.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onDelete={() => handleOpenDeleteDialog(product)}
            onEdit={() => handleOpenEditDialog(product)}
          />
        ))}
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
