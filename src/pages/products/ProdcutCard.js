import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid2,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig"; // Adjust the path to your Firebase config file
import MenuItem from "@mui/material/MenuItem";

const ProductCard = ({ product, onEdit, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [productImg, setProductImg] = useState(product.img);
  const [productTitle, setProductTitle] = useState(product.title || "");
  const [category, setCategory] = useState(product.category || "");
  const [price, setPrice] = useState(product.price || 0);
  const [discountedPrice, setDiscountedPrice] = useState(
    product.discountedPrice || 0
  );
  const [ingredients, setIngredients] = useState(product.ingredients || "");
  const [instructions, setInstructions] = useState(product.instructions || "");
  const [moreDetails, setMoreDetails] = useState(product.moreDetails || "");
  const [newImage, setNewImage] = useState(null);
  const [categories, setCategories] = useState([]); // Categories fetched from API
  const [loading, setLoading] = useState(false);

  const handleEdit = useCallback(() => {
    setOpenDialog(true);
  }, []);
  const handleTitleChange = (e) => setProductTitle(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);
  const handlePriceChange = (e) => setPrice(e.target.value);
  const handleDiscountedPriceChange = (e) => setDiscountedPrice(e.target.value);
  const handleIngredientsChange = (e) => setIngredients(e.target.value);
  const handleInstructionsChange = (e) => setInstructions(e.target.value);
  const handleMoreDetailsChange = (e) => setMoreDetails(e.target.value);
  // Close dialog
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesCollection = collection(firestore, "categories");
        const categorySnapshot = await getDocs(categoriesCollection);
        const categoryList = categorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle title change

  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const totalImages = [
      ...(newImage ? [newImage] : []),
      ...product.imgs.thumbnails,
    ];
    if (file && totalImages.length < 6) {
      const reader = new FileReader();
      reader.onload = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    } else {
      alert("You can upload a maximum of 6 images.");
    }
  };
  // Save the edited product
  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({
        ...product,
        title: productTitle,
        img: newImage || product.img, // Use new image if available
      }); // Send updated product to parent
    }
    handleCloseDialog();
  };

  // Handle delete action
  const handleDelete = () => {
    const confirmation = window.confirm(
      `Are you sure you want to delete the product "${product.title}"?`
    );
    console.log("Confirmation response:", confirmation); // Log the confirmation result
    
    if (confirmation && onDelete) {
      onDelete(product);
      console.log("deleteData", product); // Log product being passed for deletion
    } else {
      console.log("Deletion canceled or onDelete not provided.");
    }
  };
  const timestampDate = product.timestamp
    ? new Date(
        product.timestamp.seconds * 1000 + product.timestamp.nanoseconds / 1e6
      )
    : null; // Set timestampDate to null or a default value if timestamp is undefined
  const handleDeleteImage = (index) => {
    const totalImages = [
      ...(newImage ? [newImage] : []),
      ...product.imgs.thumbnails,
    ];
    if (index === 0 && newImage) {
      // Remove the newly uploaded image
      setNewImage(null);
    } else {
      // Remove an image from the thumbnails
      const updatedThumbnails = totalImages.filter((_, i) => i !== index);
      setNewImage(null); // Reset the new image in case it was first
      product.imgs.thumbnails = updatedThumbnails.slice(1); // Update thumbnails
    }
  };

  return (
    <>
      <Grid2 size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
        <Card
          sx={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
            borderRadius: "12px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)",
            },
            "&:active": {
              transform: "scale(1)",
              boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <CardMedia
            component="img"
            image={product.imgs.thumbnails[0]}
            alt={product.title}
            sx={{
              height: 180,
              objectFit: "cover",
              borderTopLeftRadius: "12px",
              borderTopRightRadius: "12px",
            }}
          />
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              padding: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontSize: "1rem",
                fontWeight: "bold",
                color: "text.primary",
                textAlign: "center",
                lineHeight: 1.4,
              }}
            >
              {product.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "primary",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              Төрөл: {product.category}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              Үндсэн үнэ: {product.price}₮
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontSize: "0.9rem",
                textAlign: "center",
              }}
            >
              Гишүүний үнэ: {product.discountedPrice}₮
            </Typography>
          </CardContent>
          <CardActions
            sx={{
              justifyContent: "center",
              padding: 1,
              gap: 1,
            }}
          >
            <IconButton
              size="medium"
              color="primary"
              onClick={handleEdit}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.1)",
                },
              }}
            >
              <EditIcon sx={{ fontSize: "1.4rem" }} />
            </IconButton>
            <IconButton
              size="medium"
              color="error"
              onClick={handleDelete}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.1)",
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: "1.4rem" }} />
            </IconButton>
          </CardActions>
        </Card>
      </Grid2>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Бүтээгдэхүүн засах</DialogTitle>
        <DialogContent>
          {/* Product Title */}
          <TextField
            label="Product Title"
            value={productTitle}
            onChange={handleTitleChange}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2, marginTop: 2 }}
          />

          {/* Category Selection */}
          <TextField
            label="Category"
            select
            value={category}
            onChange={handleCategoryChange}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.title}>
                {cat.title}
              </MenuItem>
            ))}
          </TextField>

          {/* Price */}
          <TextField
            label="Price (₮)"
            type="number"
            value={price}
            onChange={handlePriceChange}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />

          {/* Discounted Price */}
          <TextField
            label="Discounted Price (₮)"
            type="number"
            value={discountedPrice}
            onChange={handleDiscountedPriceChange}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />

          {/* Ingredients */}
          <TextField
            label="Ingredients"
            value={ingredients}
            onChange={handleIngredientsChange}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            sx={{ marginBottom: 2 }}
          />

          {/* Instructions */}
          <TextField
            label="Instructions"
            value={instructions}
            onChange={handleInstructionsChange}
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            sx={{ marginBottom: 2 }}
          />

          {/* More Details */}
          <TextField
            label="More Details"
            value={moreDetails}
            onChange={handleMoreDetailsChange}
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            sx={{ marginBottom: 2 }}
          />

          <div>
            <input
              type="file"
              accept="image/*"
              id="upload-button"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="upload-button">
              <Button
                variant="outlined"
                component="span"
                color="primary"
                sx={{ marginBottom: 2 }}
                disabled={
                  (newImage ? 1 : 0) + product.imgs.thumbnails.length >= 6
                }
              >
                Upload Image
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary">
              {`Images: ${(newImage ? 1 : 0) + product.imgs.thumbnails.length} / 6`}
            </Typography>
          </div>

          {(newImage || product.imgs.thumbnails.length > 0) && (
            <div
              style={{
                display: "flex",
                gap: "10px",
                overflowX: "auto",
                marginBottom: "10px",
              }}
            >
              {[
                ...(newImage ? [newImage] : []),
                ...product.imgs.thumbnails,
              ].map((image, index) => (
                <div key={index} style={{ position: "relative" }}>
                  <CardMedia
                    component="img"
                    image={image}
                    alt={`Product Image ${index + 1}`}
                    sx={{
                      height: 150,
                      width: 150,
                      objectFit: "contain",
                      border: "1px solid #ccc",
                      borderRadius: "8px",
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteImage(index)}
                    sx={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      backgroundColor: "rgba(255, 255, 255, 0.7)",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 1)",
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveEdit} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default ProductCard;
