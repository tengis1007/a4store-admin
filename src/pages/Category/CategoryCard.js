import React, { useState, useCallback } from "react";
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

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const [openDialog, setOpenDialog] = useState(false);
  const [categoryTitle, setCategoryTitle] = useState(category.title);
  const [categoryImg, setCategoryImg] = useState(category.img);
  const [newImage, setNewImage] = useState(null); // To store new image selected by the user

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

  // Handle image change
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewImage(URL.createObjectURL(file)); // Preview new image
      setCategoryImg(file); // Update category image for uploading
    }
  };

  // Save the edited category
  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit({
        ...category,
        title: categoryTitle,
        img: newImage || category.img, // Use new image if available
      }); // Send updated category to parent
    }
    handleCloseDialog();
  };

  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(category); // Pass category to delete handler
    }
  };

  const timestampDate = category.timestamp
  ? new Date(category.timestamp.seconds * 1000 + category.timestamp.nanoseconds / 1e6)
  : null; // Set timestampDate to null or a default value if timestamp is undefined


  return (
    <>
      <Grid2 size={{ xs: 4, sm: 4, md: 4, lg:2 }}>
        <Card
          sx={{
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)", // Soft, elegant shadow
            borderRadius: "12px", // Slightly larger radius for a softer look
            transition:
              "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease", // Smooth animations
            "&:hover": {
              transform: "scale(1.05)", // Smooth zoom-in effect
              boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.15)", // Subtle deepening shadow
            },
            "&:active": {
              transform: "scale(1)", // Return to original size on click
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Slightly deeper shadow on active
            },
          }}
        >
          <CardMedia
            component="img"
            width="10%"
            image={category.img}
            alt={category.title}
            sx={{
              objectFit: "cover",
              borderTopLeftRadius: "10px",
              borderTopRightRadius: "10px",
            }}
          />
          <CardContent
            sx={{
              flexGrow: 1,
              p: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              variant="h6"
              component="h2"
              noWrap
              sx={{
                fontSize: { xs: "0.9rem", sm: "1.1rem", textAlign: "center" },
                fontWeight: "bold",
                color: "text.primary",
              }}
            >
              {category.title}
            </Typography>
            <Typography
              variant="body2"
              component="p"
              noWrap
              sx={{
                fontSize: { xs: "0.7rem", sm: "0.9rem", textAlign: "center" },
                color: "text.primary",
              }}
            >
              {timestampDate
                ? dayjs(timestampDate).format("YYYY-MM-DD HH:mm")
                : "No timestamp"}
            </Typography>
          </CardContent>

          <CardActions
            sx={{
              justifyContent: "center",
              padding: 1,
              backgroundColor: "background.default",
            }}
          >
            <IconButton
              size="medium"
              color="primary"
              onClick={handleEdit}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(25, 118, 210, 0.15)", // Slight hover effect
                },
              }}
            >
              <EditIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>
            <IconButton
              size="medium"
              color="error"
              onClick={handleDelete}
              sx={{
                "&:hover": {
                  backgroundColor: "rgba(211, 47, 47, 0.15)", // Slight hover effect
                },
              }}
            >
              <DeleteIcon sx={{ fontSize: "1.5rem" }} />
            </IconButton>
          </CardActions>
        </Card>
      </Grid2>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {/* Category Title */}
          <TextField
            label="Category Title"
            value={categoryTitle}
            onChange={handleTitleChange}
            fullWidth
            variant="outlined"
            sx={{ marginBottom: 2 }}
          />

          {/* Image Upload/Preview */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ marginBottom: 10 }}
          />
          <CardMedia
            component="img"
            image={newImage || category.img} // Show new image or default to existing
            alt="Category Image"
            sx={{ marginBottom: 2 }}
          />
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

export default CategoryCard;
