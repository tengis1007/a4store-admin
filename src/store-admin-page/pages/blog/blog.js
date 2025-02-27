import React, { useState } from "react"; 
import { Button } from "@mui/material"; 
import AddIcon from "@mui/icons-material/Add"; 
import Addblog from "./addblog";

const Blog = () => {
  const [openNewProductDialog, setOpenblog] = useState(false);

  const BloghandleBlog = () => {
    setOpenblog(true);
  };

  const BloghandleClose = () => {
    setOpenblog(false);
  };

  const BloghandleSave = (newBlogData) => {
    // Add logic to save new blog data (e.g., upload to Firestore or Firebase Storage)
    console.log("New blog data:", newBlogData);
    setOpenblog(false); // Close dialog after save
  };

  return (
    <>
      <Button
        size="large"
        sx={{ margin: "2vh" }}
        onClick={BloghandleBlog}
        variant="contained"
        startIcon={<AddIcon />}
      >
        Мэдээ нэмэх
      </Button>
      {openNewProductDialog && (
        <Addblog
          open={openNewProductDialog}
          onClose={BloghandleClose}
          onSave={BloghandleSave}
        />
      )}
    </>
  );
};

export default Blog;
