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
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";

const DeleteOrderHistory = ({ order, onClose, onSave }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleDeleteOrder = async () => {
    if (!order?.id) return;
  
    try {
      await deleteDoc(doc(firestore, "orders", order.id));
      console.log("Order deleted successfully!");
      setSnackbar({ open: true, message: "Бүтээгдэхүүн амжилттай устгагдлаа!", severity: "success" });
  
      // Delay dialog close to allow Snackbar to show
      setTimeout(() => {
        onClose();
        onSave();
      }, 1000); // Adjust the timeout duration if needed
    } catch (error) {
      console.error("Error deleting order:", error);
      setSnackbar({ open: true, message: "Устгах явцад алдаа гарлаа!", severity: "error" });
      setTimeout(() => {
        onClose();
      }, 1000); // Delay closing on error as well
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  if (!order) return null;

  return (
    <>
      <Dialog open={Boolean(order)} onClose={onClose} aria-labelledby="delete-dialog-title">
        <Box sx={{ padding: "20px", borderRadius: "10px", background: "#f9f9f9" }}>
          <DialogTitle
            id="delete-dialog-title"
            sx={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: "bold", color: "#d32f2f" }}
          >
            <DeleteOutlineIcon fontSize="large" sx={{ color: "#d32f2f" }} />
            Устгахыг баталгаажуулна уу
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ fontSize: "1rem", color: "#333", marginBottom: "20px" }}>
              Та энэ бүтээгдэхүүнийг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", padding: "10px 20px" }}>
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
              onClick={handleDeleteOrder}
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
      {/* Snackbar for Success or Error */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default DeleteOrderHistory;
