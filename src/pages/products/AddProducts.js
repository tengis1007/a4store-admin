import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField } from '@mui/material';

function AddProduct({ open, onClose, onSave }) {
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productDescription, setProductDescription] = useState('');

  const handleSave = () => {
    // Assuming onSave is passed down to handle saving the new product
    const newProduct = {
      productName,
      productQuantity,
      productDescription,
    };
    onSave(newProduct);
    handleClose();
  };

  const handleClose = () => {
    setProductName('');
    setProductQuantity('');
    setProductDescription('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Product</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Product Name"
          fullWidth
          variant="outlined"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Quantity"
          fullWidth
          variant="outlined"
          type="number"
          value={productQuantity}
          onChange={(e) => setProductQuantity(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddProduct;
