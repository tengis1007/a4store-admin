import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  DialogContentText,
  Box,
  Snackbar,
  Alert,
} from "@mui/material";
import { ref, deleteObject } from "firebase/storage";
import { doc, deleteDoc } from "firebase/firestore";
import { firestore, storage } from "../../../refrence/storeConfig";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const DeleteProduct = ({ product, onClose, onDelete }) => {
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleDeleteProduct = async () => {
    if (!product || !product.id) {
      console.error("Invalid product data");
      return;
    }

    try {
      // Delete product document from Firestore
      const productDocRef = doc(firestore, "products", product.id);
      await deleteDoc(productDocRef);
      console.log(`Product with ID: ${product.id} deleted from Firestore.`);

      // Delete product thumbnails from Firebase Storage
      const deleteThumbnails = async (thumbnails) => {
        for (let thumbnailUrl of thumbnails) {
          const pathRegex = /o%2F(.*)\?alt=media/;
          const match = thumbnailUrl.match(pathRegex);

          if (match && match[1]) {
            const thumbnailPath = decodeURIComponent(match[1]);
            const thumbnailRef = ref(storage, thumbnailPath);

            try {
              await deleteObject(thumbnailRef);
              console.log(`Thumbnail deleted successfully: ${thumbnailPath}`);
            } catch (error) {
              console.error(
                `Error deleting thumbnail ${thumbnailPath}:`,
                error
              );
            }
          } else {
            console.error(
              `Failed to match thumbnail URL pattern: ${thumbnailUrl}`
            );
          }
        }
      };

      if (product.thumbnails && product.thumbnails.length > 0) {
        await deleteThumbnails(product.thumbnails);
      }

      console.log("Product and thumbnails successfully deleted.");

      // Show success snackbar
      setSnackbarOpen(true);
      // Call the onDelete callback function to update the product list
      onDelete(product.id);
    } catch (error) {
      console.error("Error deleting product and thumbnails:", error);
    } finally {
      onClose();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Dialog
        open={Boolean(product)}
        onClose={onClose}
        aria-labelledby="delete-dialog-title"
      >
        <Box
          sx={{ padding: "20px", borderRadius: "10px", background: "#f9f9f9" }}
        >
          <DialogTitle
            id="delete-dialog-title"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontWeight: "bold",
              color: "#d32f2f",
            }}
          >
            <DeleteOutlineIcon fontSize="large" sx={{ color: "#d32f2f" }} />
            Устгахыг баталгаажуулна уу
          </DialogTitle>
          <DialogContent>
            <DialogContentText
              sx={{ fontSize: "1rem", color: "#333", marginBottom: "20px" }}
            >
              Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг
              буцаах боломжгүй.
            </DialogContentText>
          </DialogContent>
          <DialogActions
            sx={{ justifyContent: "space-between", padding: "10px 20px" }}
          >
            <Button
              onClick={onClose}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{
                color: "#555",
                borderColor: "#aaa",
                "&:hover": { borderColor: "#555", backgroundColor: "#f0f0f0" },
              }}
            >
              Гарах
            </Button>
            <Button
              onClick={handleDeleteProduct}
              variant="contained"
              startIcon={<DeleteOutlineIcon />}
              sx={{
                backgroundColor: "#d32f2f",
                color: "#fff",
                "&:hover": { backgroundColor: "#b71c1c" },
              }}
            >
              Устгах
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: "100%" }}
        >
          Бүтээгдэхүүн амжилттай устгагдлаа!
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteProduct;
