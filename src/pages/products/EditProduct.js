import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Input,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../firebase/firebaseConfig";
import DeleteIcon from "@mui/icons-material/Delete";

const EditProductDialog = ({ product, onClose, onSave }) => {
  const [productName, setProductName] = useState(product.title);
  const [productDescription, setProductDescription] = useState(
    product.ingredients
  );
  const [productPrice, setProductPrice] = useState(product.price);
  const [discountedPrice, setDiscountedPrice] = useState(
    product.discountedPrice
  );
  const [moreDetails, setMoreDetails] = useState(product.moreDetails);
  const [instructions, setInstructions] = useState(product.instructions);
  const [images, setImages] = useState(product.imgs.thumbnails || []);
  const [deletedImages, setDeletedImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(product.category || ""); // Add category state
  const [status, setStatus] = useState(product.status);
  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesCollection = collection(firestore, "categories");
      const categorySnapshot = await getDocs(categoriesCollection);
      const categoryList = categorySnapshot.docs.map((doc) => doc.data().title);
      setCategories(categoryList);
    };
    fetchCategories();
  }, []);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    const newImageUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const imageRef = ref(storage, `products/thumbnails/${file.name}`);
      try {
        await uploadBytes(imageRef, file);
        const downloadURL = await getDownloadURL(imageRef);
        newImageUrls.push(downloadURL);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }

    setImages((prevImages) => [...prevImages, ...newImageUrls]);
    setUploadedImages((prevUploaded) => [...prevUploaded, ...newImageUrls]);
  };

  const handleImageDelete = async (imageUrl) => {
    try {
      const decodedImageUrl = decodeURIComponent(imageUrl);
      const fileName = decodedImageUrl.split("/").pop().split("?")[0];
      const imageRef = ref(storage, `products/thumbnails/${fileName}`);

      const imageExists = await checkImageExists(imageRef);
      if (imageExists) {
        await deleteObject(imageRef);
        setImages((prevImages) => prevImages.filter((img) => img !== imageUrl));
        setDeletedImages((prevDeleted) => [...prevDeleted, imageUrl]);
        console.log("Image deleted successfully from Firebase Storage.");
      } else {
        console.log(`Image not found, skipping deletion: ${imageUrl}`);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedProductData = {};

      if (product.title !== productName) updatedProductData.title = productName;
      if (product.ingredients !== productDescription)
        updatedProductData.ingredients = productDescription;
      if (product.price !== productPrice)
        updatedProductData.price = productPrice;
      if (product.discountedPrice !== discountedPrice)
        updatedProductData.discountedPrice = discountedPrice;
      if (product.moreDetails !== moreDetails)
        updatedProductData.moreDetails = moreDetails;
      if (product.instructions !== instructions)
        updatedProductData.instructions = instructions;
      if (product.category !== category) updatedProductData.category = category;

      if (
        product.imgs.thumbnails.length !== images.length ||
        !images.every((img, index) => img === product.imgs.thumbnails[index])
      ) {
        updatedProductData.imgs = { thumbnails: images };
      }

      if (Object.keys(updatedProductData).length > 0) {
        const productDocRef = doc(firestore, "products", product.id);
        await updateDoc(productDocRef, updatedProductData);
        console.log(`Product with ID: ${product.id} updated successfully.`);
      }

      for (const imageUrl of deletedImages) {
        let decodedImageUrl = decodeURIComponent(imageUrl);
        const fileName = decodedImageUrl.split("/").pop().split("?")[0];
        const imageRef = ref(storage, `products/thumbnails/${fileName}`);

        const imageExists = await checkImageExists(imageRef);
        if (imageExists) {
          await deleteObject(imageRef);
          console.log(`Deleted image from Firebase Storage: ${imageUrl}`);
        } else {
          console.log(`Image not found, skipping deletion: ${imageUrl}`);
        }
      }

      onSave(product.id, {
        title: productName,
        ingredients: productDescription,
        price: productPrice,
        discountedPrice,
        moreDetails,
        instructions,
        imgs: { thumbnails: images },
        category, // Include category in the updated data
      });

      onClose();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  const checkImageExists = async (imageRef) => {
    try {
      await getDownloadURL(imageRef);
      return true;
    } catch (error) {
      if (error.code === "storage/object-not-found") return false;
      throw error;
    }
  };

  return (
    <Dialog open={Boolean(product)} onClose={onClose}>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <TextField
          label="Product Name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Price"
          type="number"
          value={productPrice}
          onChange={(e) => setProductPrice(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Discounted Price"
          type="number"
          value={discountedPrice}
          onChange={(e) => setDiscountedPrice(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Product Description"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControl fullWidth margin="normal" required>
          <InputLabel>Category</InputLabel>
          <Select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            label="Category"
          >
            <MenuItem value="">Select a Category</MenuItem>
            {categories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Product Description"
          value={productDescription}
          onChange={(e) => setProductDescription(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="More Details"
          value={moreDetails}
          onChange={(e) => setMoreDetails(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Instructions"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          fullWidth
          margin="normal"
        />
        {images.length > 0 && (
          <div>
            <h4>Uploaded Images:</h4>
            {images.map((img, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center" }}
              >
                <img
                  src={img}
                  alt={`Product Thumbnail ${index}`}
                  width="100"
                  height="100"
                />
                <IconButton
                  onClick={() => handleImageDelete(img)}
                  color="error"
                  aria-label="delete"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="secondary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditProductDialog;
