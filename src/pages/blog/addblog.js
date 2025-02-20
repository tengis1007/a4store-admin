import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
} from "@mui/material";
import { storage, firestore } from "../../firebase/firebaseConfig";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc } from "firebase/firestore";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import TextEditor from "./TextEditor";

const Addblog = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleSave = async () => {
    // Convert editor content to HTML
    const description = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    console.log("description", description); // Log to check the description content

    // Check if the title and description are valid
    if (title && description.trim() !== "" && description.trim() !== "<p></p>") {
      try {
        setUploading(true);
        let imageUrl = "";

        // If an image is selected, upload it
        if (image) {
          const storageRef = ref(storage, `blog/${image.name}`);
          const uploadTask = uploadBytesResumable(storageRef, image);

          // Use the correct syntax to access the file reference
          uploadTask.on(
            "state_changed",
            null,
            (error) => {
              console.error("Image upload error:", error);
              setUploading(false);
            },
            async () => {
              // Ensure we wait until the upload is finished
              await getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                imageUrl = url;
                // Now save the blog
                saveBlog(title, description, imageUrl);
              });
            }
          );
        } else {
          await saveBlog(title, description); // Save without image if none
        }
      } catch (error) {
        console.error("Error saving blog:", error);
        setUploading(false);
      }
    } else {
      alert("Please fill in the title and description.");
    }
  };


  const saveBlog = async (title, description, imageUrl = "") => {
    await addDoc(collection(firestore, "blog"), {
      title,
      description,
      imageUrl,
      timestamp: new Date(),
    });
    onSave({ title, description, imageUrl });
    setUploading(false);
    onClose();
  };

  return (
    <Dialog
  open={open}
  onClose={onClose}
  PaperProps={{
    sx: {
      maxWidth: '1000px', // Custom max-width   // Make the width 100% of the parent container
      height: '1000px',    // Set height to 100%
    },
  }}
>
      <DialogTitle>Мэдээ оруулах</DialogTitle>
      <DialogContent>
        <TextField
          label="Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ marginBottom: "1vh" }}
        />
        {/* Pass editorState and setEditorState to TextEditor */}
        <TextEditor editorState={editorState} setEditorState={setEditorState} />

        <Button variant="contained" component="label" sx={{  marginTop:"1vh" }}>
          Upload Image
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Button>
        {image && <p>{image.name}</p>}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" disabled={uploading}>
          {uploading ? "Uploading..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Addblog;
