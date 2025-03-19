import React, { useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

const AlertComponent = ({ open, message, severity, onClose }) => {
  useEffect(() => {
    let timer;
    if (open) {
      timer = setTimeout(() => {
        onClose(); // Close the alert after 3 seconds
      }, 3000); // 3 seconds
    }
    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, [open, onClose]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={3000} // Still set in case of manual close
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
};

export default AlertComponent;
