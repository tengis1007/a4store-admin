import React, { useState, useEffect } from "react";
import { firestore, storage } from "../../firebase/firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  Button,
  Box,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { CloudUpload as CloudUploadIcon } from "@mui/icons-material"; // for icon
import ClearIcon from "@mui/icons-material/Clear";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
const AddProduct = () => {
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    title: "",
    price: "",
    category: "",
    moreDetails: "",
    ingredients: "",
    instructions: "",
    reviews: 1,
    discountedPrice: "",
    previews: [],
    thumbnails: [],
  });

  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(firestore, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => doc.data().title);
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProduct({
      ...product,
      [name]: value,
    });
  };

  const handleChangeMnt = (e) => {
    let newValue = e.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

    if (newValue && newValue !== "0") {
      // Format as currency without decimals for display
      const formattedValue = new Intl.NumberFormat("mn-MN", {
        style: "currency",
        currency: "MNT",
        minimumFractionDigits: 0, // No decimals
      }).format(newValue);

      // Set the product state with the formatted value for display
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: newValue, // Formatted value for display
      }));
    } else {
      // If input is empty or invalid, clear the value
      setProduct((prevProduct) => ({
        ...prevProduct,
        price: "", // Clear formatted value
      }));
    }
  };

  const handleChangeMntDiscounted = (e) => {
    let newValue = e.target.value.replace(/[^\d]/g, ""); // Remove non-numeric characters

    if (newValue && newValue !== "0") {
      // Format as currency without decimals for display
      const formattedValue = new Intl.NumberFormat("mn-MN", {
        style: "currency",
        currency: "MNT",
        minimumFractionDigits: 0, // No decimals
      }).format(newValue);

      // Set the product state with the formatted value for display
      setProduct((prevProduct) => ({
        ...prevProduct,
        discountedPrice: newValue, // Formatted value for display
      }));
    } else {
      // If input is empty or invalid, clear the value
      setProduct((prevProduct) => ({
        ...prevProduct,
        discountedPrice: "", // Clear formatted value
      }));
    }
  };

  const handleImageChange = (e, type) => {
    const files = Array.from(e.target.files);

    // Create object URLs and assign unique IDs to each file
    const filePreviews = files.map((file) => ({
      id: crypto.randomUUID(), // Generate a unique ID
      file: file,
      url: URL.createObjectURL(file),
    }));

    setProduct((prevProduct) => ({
      ...prevProduct,
      [type]: [
        ...(prevProduct[type] || []),
        ...filePreviews.map((item) => item.file),
      ],
      [`${type}Urls`]: [
        ...(prevProduct[`${type}Urls`] || []),
        ...filePreviews.map((item) => item.url),
      ],
    }));
  };
  const handlePreviewImage = (url) => {
    setPreviewImage(url);
    setOpenPreviewDialog(true);
  };

  const handleClosePreviewDialog = () => {
    setOpenPreviewDialog(false);
    setPreviewImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!product.title || !product.price || !product.category) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const uploadImages = async (files, folder) => {
        const uploadedUrls = [];
        for (let file of files) {
          const fileRef = ref(storage, `products/${folder}/${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);
          await uploadTask;
          const downloadURL = await getDownloadURL(fileRef);
          uploadedUrls.push(downloadURL);
        }
        return uploadedUrls;
      };

      const previewUrls = await uploadImages(product.previews, "previews");
      const thumbnailUrls = await uploadImages(
        product.thumbnails,
        "thumbnails"
      );

      const productData = {
        title: product.title,
        price: Number(product.price),
        category: product.category,
        moreDetails: product.moreDetails,
        ingredients: product.ingredients,
        instructions: product.instructions,
        discountedPrice: Number(product.discountedPrice),
        reviews: product.reviews,
        timestamp: new Date(),
        status:"in Stock",
        imgs: {
          previews: previewUrls,
          thumbnails: thumbnailUrls,
        },
      };

      const productRef = await addDoc(collection(firestore, "products"),productData);
      console.log("Product added with ID:", productRef.id);
      setLoading(false);
      setProduct({
        title: "",
        price: "",
        category: "",
        moreDetails: "",
        ingredients: "",
        instructions: "",
        reviews: 1,
        discountedPrice: "",
        previews: [],
        thumbnails: [],
      });
      setOpen(true);
    } catch (error) {
      console.error("Error adding product: ", error.message);
      alert("Error adding product");
    }
  };
  const handleRemoveImage = (index) => {
    const updatedPreviews = product.previews.filter((_, i) => i !== index);
    setProduct({ ...product, previews: updatedPreviews });
  };
  const handleRemoveImageThumbnails = (index) => {
    const updatedPreviews = product.thumbnails.filter((_, i) => i !== index);
    setProduct({ ...product, thumbnails: updatedPreviews });
  };
  useEffect(() => {
    return () => {
      product.previews.forEach((file) => URL.revokeObjectURL(file));
      product.thumbnails.forEach((file) => URL.revokeObjectURL(file));
    };
  }, []);
  const styles = {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
    },
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  return (
    <div>
      {loading ? (
        <div style={styles.container}>
          <CircularProgress size={70} color="primary" thickness={5} />
        </div>
      ) : (
        <Box
          p={4}
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Typography
            variant="h4"
            gutterBottom
            style={{
              fontWeight: "bold",
              fontFamily: "'Poppins', sans-serif",
              textAlign: "center",
              letterSpacing: "2px",
              background: " #2196F3", // Blue to white gradient
              WebkitBackgroundClip: "text", // Clip the background to the text
              color: "transparent", // Make the text color transparent to show gradient
              textShadow: "3px 3px 5px rgba(0, 0, 0, 0.2)", // Subtle shadow for depth
              textTransform: "uppercase",
              padding: "10px 0",
              transition: "transform 0.3s ease-in-out", // Smooth hover animation
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")} // Hover effect to scale up
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          >
            Бүтээгдэхүүн оруулах
          </Typography>

          <form
            onSubmit={handleSubmit}
            style={{ width: "100%", maxWidth: "700px" }}
          >
            <Grid container spacing={2}>
              {/* Left Section - Text Fields */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Нэр"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="title"
                  value={product.title}
                  onChange={handleChange}
                  required
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <TextField
                  label="Үнэ"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="price"
                  value={
                    product.price
                      ? new Intl.NumberFormat("mn-MN").format(product.price)
                      : "" // If there's no value, display an empty string
                  }
                  onChange={handleChangeMnt}
                  required
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <TextField
                  label="Хямдралтай үнэ"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="discountedPrice"
                  value={
                    product.discountedPrice
                      ? new Intl.NumberFormat("mn-MN").format(
                          product.discountedPrice
                        )
                      : "" // If there's no value, display an empty string
                  }
                  onChange={handleChangeMntDiscounted}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <FormControl
                  fullWidth
                  margin="normal"
                  required
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                >
                  <InputLabel>Төрөл</InputLabel>
                  <Select
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    label="Category"
                    style={{ borderRadius: "8px" }}
                  >
                    <MenuItem value="">Select a Category</MenuItem>
                    {categories.map((category, index) => (
                      <MenuItem key={index} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl
                  fullWidth
                  margin="normal"
                  style={{ borderRadius: "8px" }}
                >
                  <InputLabel>Reviews</InputLabel>
                  <Select
                    name="reviews"
                    value={product.reviews}
                    onChange={handleChange}
                    label="Reviews"
                    style={{ borderRadius: "8px" }}
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Box my={2}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, "previews")}
                    style={{ display: "none" }}
                    id="preview-image-input"
                  />
                  <label htmlFor="preview-image-input">
                    <Button
                      variant="contained"
                      component="span"
                      fullWidth
                      style={{
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                      }}
                      startIcon={<CloudUploadIcon />}
                    >
                      Нүүр зураг оруулах
                    </Button>
                  </label>
                  <Box mt={2} display="flex" flexWrap="wrap">
                    {product.previews.map((file, index) => (
                      <Box
                        key={index}
                        position="relative"
                        width="150px"
                        height="150px"
                        margin={1}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            handlePreviewImage(URL.createObjectURL(file))
                          }
                        />
                        <IconButton
                          size="small"
                          style={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            cursor: "pointer", // Ensures the pointer cursor
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <ClearIcon color="error" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>

                {/* Thumbnail Images */}
                <Box my={2}>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, "thumbnails")}
                    style={{ display: "none" }}
                    id="thumbnail-image-input"
                  />
                  <label htmlFor="thumbnail-image-input">
                    <Button
                      variant="contained"
                      component="span"
                      fullWidth
                      style={{
                        backgroundColor: "#2196F3",
                        color: "#fff",
                        borderRadius: "8px",
                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                      }}
                      startIcon={<CloudUploadIcon />}
                    >
                      Дэлгэрэнгүй зураг оруулах
                    </Button>
                  </label>
                  <Box mt={2} display="flex" flexWrap="wrap">
                    {product.thumbnails.map((file, index) => (
                      <Box
                        key={index}
                        position="relative"
                        width="60px"
                        height="60px"
                        margin={1}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Thumbnail ${index}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "8px",
                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                          }}
                          onClick={() =>
                            handlePreviewImage(URL.createObjectURL(file))
                          }
                        />
                        <IconButton
                          size="small"
                          style={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                          }}
                          onClick={() => handleRemoveImageThumbnails(index)}
                        >
                          <ClearIcon color="error" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Grid>

              {/* Right Section - Image Upload */}
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Дэлгэрэнгүй"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="moreDetails"
                  value={product.moreDetails}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <TextField
                  label="Найрлага"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="ingredients"
                  value={product.ingredients}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <TextField
                  label="Заавар"
                  variant="outlined"
                  fullWidth
                  margin="normal"
                  name="instructions"
                  value={product.instructions}
                  onChange={handleChange}
                  required
                  multiline
                  rows={4}
                  style={{
                    borderRadius: "8px",
                    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                  }}
                />
                {/* Preview Images */}
              </Grid>
            </Grid>

            <Button
              variant="contained"
              endIcon={<SaveAltIcon />}
              type="submit"
              fullWidth
              style={{
                backgroundColor: "#2196F3",
                color: "#fff",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              }}
            >
              Хадгалах
            </Button>
          </form>

          {/* Preview Image Dialog */}
          <Dialog open={openPreviewDialog} onClose={handleClosePreviewDialog}>
            <DialogContent>
              <img src={previewImage} alt="Preview" width="100%" />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClosePreviewDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={open}
            autoHideDuration={4000}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleClose}
              severity="success"
              variant="filled"
              sx={{ width: "100%" }}
            >
              Амжилттай хадгалагдлаа
            </Alert>
          </Snackbar>
        </Box>
      )}
    </div>
  );
};

export default AddProduct;
