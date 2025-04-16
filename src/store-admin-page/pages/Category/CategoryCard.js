import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid,
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

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState(category.title);
  const [newImage, setNewImage] = useState(null); // Preview image for new selection
  const [categoryImg, setCategoryImg] = useState(category.img); // Store the selected image file

  const handleEdit = useCallback(() => {
    setOpenDialog(true);
  }, []);

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Handle title change
  const handleTitleChange = (event) => {
    setCategoryTitle(event.target.value);
  };

  // Handle image change (preview & file)
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file)); // Preview new image
      setCategoryImg(file); // Update the image file for uploading
    }
  };

  // Save the edited category
  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({
        ...category,
        title: categoryTitle,
        img: categoryImg, // Use the file for upload
      });
    }
    handleCloseDialog();
  };

  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(category);
    }
  };

  const timestampDate = category.timestamp
    ? new Date(category.timestamp.seconds * 1000 + category.timestamp.nanoseconds / 1e6)
    : null;

  return (
    <>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <Card
          sx={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
            borderRadius: "12px",
            transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)",
            },
            "&:active": {
              transform: "scale(1)",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            },
          }}
        >
          <CardMedia
            component="img"
            image={newImage || category.img} // Show new image if available, otherwise default to current
            alt={category.title}
            sx={{
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <CardContent sx={{ flexGrow: 1, p: 1, justifyContent: "center", alignItems: "center", backgroundColor: "background.paper" }}>
            <Typography variant="h6" component="h2" noWrap sx={{ fontSize: { xs: "0.9rem", sm: "1.1rem" }, fontWeight: "bold", textAlign: "center" }}>
              {category.title}
            </Typography>
            <Typography variant="body2" component="p" noWrap sx={{ fontSize: { xs: "0.7rem", sm: "0.9rem" }, textAlign: "center" }}>
              {timestampDate ? dayjs(timestampDate).format("YYYY-MM-DD HH:mm") : "No timestamp"}
            </Typography>
          </CardContent>

          <CardActions sx={{ justifyContent: "center", padding: 1, backgroundColor: "background.default" }}>
            <IconButton size="medium" color="primary" onClick={handleEdit} sx={{ "&:hover": { backgroundColor: "rgba(25, 118, 210, 0.15)" } }}>
              <EditIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>
            <IconButton size="medium" color="error" onClick={handleDelete} sx={{ "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.15)" } }}>
              <DeleteIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <TextField label="Category Title" value={categoryTitle} onChange={handleTitleChange} fullWidth variant="outlined" sx={{ marginBottom: 2 }} />

          <input type="file" accept="image/*" onChange={handleImageChange} style={{ marginBottom: 10 }} />
          <CardMedia component="img" image={newImage || category.img} alt="Category Image" sx={{ marginBottom: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="secondary">Cancel</Button>
          <Button onClick={handleSaveEdit} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoryCard;
