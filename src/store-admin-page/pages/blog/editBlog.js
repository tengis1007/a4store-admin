import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig";
import { ref, deleteObject, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { storage } from "../../../refrence/storeConfig"; // import storage for Firebase Storage
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
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // You can track progress here if you want
      },
      (error) => {
        console.error("Error uploading image:", error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setFormData({
          ...formData,
          imageUrl: downloadURL,
        });
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
                objectFit: "cover", // Use cover to ensure the image fills the box without distorting
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

        {/* Image Upload Button */}
        <Button variant="outlined" component="label" fullWidth margin="dense">
          Зураг оруулах
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageUpload}
          />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Болих
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Хадгалах
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditBlog;
