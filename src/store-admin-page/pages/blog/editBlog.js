import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig";
import { ref, deleteObject, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../refrence/storeConfig";
import TextEditor from "./TextEditor";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import { stateFromHTML } from "draft-js-import-html";
import DeleteIcon from "@mui/icons-material/Delete";

const EditBlog = ({ open, onClose, onSave, blog }) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false); // Loading state for image upload
  const [uploadProgress, setUploadProgress] = useState(0); // Track upload progress
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title || "",
        imageUrl: blog.imageUrl || "",
      });

      // Convert HTML to EditorState
      if (blog.description) {
        const contentState = stateFromHTML(blog.description);
        setEditorState(EditorState.createWithContent(contentState));
      } else {
        setEditorState(EditorState.createEmpty());
      }
    }
  }, [blog]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    if (!blog?.id) return;

    try {
      // Convert EditorState to raw content
      const contentState = editorState.getCurrentContent();
      const rawContent = convertToRaw(contentState);

      // Convert raw content to HTML
      const descriptionHtml = draftToHtml(rawContent);

      // Include the editor content in formData
      const updatedData = {
        ...formData,
        description: descriptionHtml, // Save HTML content
      };

      // Log updated data for debugging
      console.log("Updated Data:", updatedData);

      // Save to Firestore
      const blogRef = doc(firestore, "blog", blog.id);
      await updateDoc(blogRef, updatedData);
      onSave(updatedData);
      onClose();
    } catch (error) {
      console.error("Error updating blog:", error);
      setError("Failed to save blog. Please try again.");
    }
  };

  const handleImageDelete = async () => {
    if (!formData.imageUrl) return;

    try {
      const imageRef = ref(storage, formData.imageUrl);

      // Delete the image from Firebase Storage
      await deleteObject(imageRef);
      setFormData({
        ...formData,
        imageUrl: "",
      });

      console.log("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      setError("Failed to delete image. Please try again.");
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("File is not an image. Please upload a valid image file.");
      return;
    }

    // Validate file size (e.g., 5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File is too large. Maximum size is 5MB.");
      return;
    }

    // Proceed with upload
    setLoading(true);
    setUploadProgress(0);
    const storageRef = ref(storage, `blog/${file.name}${Date.now()}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Error uploading image:", error);
        setError("Failed to upload image. Please try again.");
        setLoading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Image uploaded successfully. Download URL:", downloadURL);
          setFormData({
            ...formData,
            imageUrl: downloadURL,
          });
        } catch (error) {
          console.error("Error getting download URL:", error);
          setError("Failed to get image URL. Please try again.");
        } finally {
          setLoading(false);
          setUploadProgress(0);
        }
      }
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Блог засах</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Гарчиг"
          name="title"
          value={formData.title}
          onChange={handleChange}
        />
        <TextEditor editorState={editorState} setEditorState={setEditorState} />

        {/* Display the current image if it exists */}
        {formData.imageUrl && (
          <div style={{ position: "relative", width: "100%", maxWidth: "200px", margin: "10px 0" }}>
            <img
              src={formData.imageUrl}
              alt="Blog"
              style={{
                width: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
            <IconButton
              onClick={handleImageDelete}
              color="secondary"
              style={{
                position: "absolute",
                top: 5,
                right: 5,
                padding: 4,
                backgroundColor: "rgba(255, 255, 255, 0.6)",
              }}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </div>
        )}

        {/* Image Upload Button with Loading State */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          margin="dense"
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? `Uploading... ${Math.round(uploadProgress)}%` : "Зураг оруулах"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
          />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Болих
        </Button>
        <Button onClick={handleSave} disabled={loading} variant="contained" color="primary">
          Хадгалах
        </Button>
      </DialogActions>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default EditBlog;