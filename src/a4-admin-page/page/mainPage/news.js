/* eslint-disable jsx-a11y/img-redundant-alt */
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import {
  ref as dbRef,
  set,
  update,
  remove,
  onValue,
  child,
  push,
} from "firebase/database";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "refrence/realConfig"; // Assuming Firebase is initialized
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubjectIcon from "@mui/icons-material/Subject";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import SmartDisplayIcon from "@mui/icons-material/SmartDisplay";
import CampaignIcon from "@mui/icons-material/Campaign";
import dayjs from "dayjs";

const newsType = ["post", "annoucement", "image", "video"];

const News = () => {
  const [news, setNews] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editOrg, setEditOrg] = useState(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    description: "",
    imageURL: "",
    children: [],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);

  const resetAll = () => {
    setEditOrg(null);
    setFormData({
      type: "",
      title: "",
      description: "",
      imageURL: "",
      children: [],
    });
    setSelectedFiles([]);
    setImageFile(null);
    setUploading(false);
    setImagePreview(null);
    setImagePreviews([]);
    setDeleteDialogOpen(false);
    setOrgToDelete(null);
    setDialogOpen(false);
  };

  const fetchOrganizations = () => {
    const newsRef = dbRef(db, "news");
    onValue(newsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newsList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setNews(newsList.reverse());
      } else {
        setNews([]);
      }
    });
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type" && value === "video") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else if (name === "type" && value === "image") {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleEditClick = (org) => {
    setEditOrg(org);
    setFormData(org);
    setDialogOpen(true);
    setImagePreview(org.logo);
    setImagePreviews(org.images || []);
  };

  const uploadImages = async (files) => {
    if (!files.length) return [];

    const uploadPromises = files.map(async (file) => {
      try {
        const imageRef = storageRef(storage, `news/${file.name}`);
        await uploadBytes(imageRef, file);
        return await getDownloadURL(imageRef);
      } catch (error) {
        console.error("Image upload failed:", error);
        return null; // Return null if upload fails
      }
    });

    return await Promise.all(uploadPromises);
  };

  const handleSave = async () => {
    setUploading(true);

    let logoUrl = formData.logo;
    if (imageFile) {
      try {
        const newsRef = storageRef(storage, `news/${imageFile.name}${dayjs().valueOf()}`);
        await uploadBytes(newsRef, imageFile);
        logoUrl = await getDownloadURL(newsRef);
      } catch (error) {
        console.error("News upload failed:", error);
        setUploading(false);
        return; // Exit if logo upload fails
      }
    }

    let imageUrls = formData.children;
    if (selectedFiles.length) {
      const uploadedImageUrls = await uploadImages(selectedFiles);
      const failedUploads = uploadedImageUrls.filter((url) => url === null);

      if (failedUploads.length > 0) {
        // Inform the user about failed uploads
        console.warn(`${failedUploads.length} image(s) failed to upload.`);
      }

      imageUrls = uploadedImageUrls.filter((url) => url !== null); // Filter out failed uploads
    }

    const orgData = {
      ...formData,
      imageURL: formData.type === "video" ? formData.imageURL : logoUrl,
      children: ["post", "image"].includes(formData.type)
        ? [...imageUrls]
        : [logoUrl],
      timeStamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };
    console.log("orgData", orgData);
    try {
      if (editOrg) {
        await update(dbRef(db, `news/${editOrg.id}`), orgData);
      } else {
        const newPostKey = push(child(dbRef(db), "posts")).key;
        await set(dbRef(db, `news/${newPostKey}`), orgData);
      }
    } catch (error) {
      console.error("Failed to save organization data:", error);
    } finally {
      resetAll();
      fetchOrganizations();
    }
  };

  const handleDelete = async (id, imagePreviews) => {
    const deletePromises = imagePreviews.map(async (filePath) => {
      try {
        const fileRef = storageRef(storage, filePath);
        await deleteObject(fileRef);
        console.log(`File ${filePath} deleted successfully`);
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);
    await remove(dbRef(db, `news/${id}`));
    setDeleteDialogOpen(false);
  };

  const openDeleteDialog = (id) => {
    setOrgToDelete(id);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ padding: 4, minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        Мэдээ
      </Typography>
      <Button
        variant="contained"
        onClick={() => setDialogOpen(true)}
        sx={{ mb: 2 }}
      >
        Мэдээ нэмэх
      </Button>
      <Grid container spacing={2}>
        {news.length > 0 ? (
          news.map((org) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={org.id}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                {["image", "annoucement", "post"].includes(org.type) && (
                  <CardMedia
                    component="img"
                    height="200"
                    image={org.imageURL}
                    alt={`${org.name} Logo`}
                    sx={{ objectFit: "contain", padding: 1 }}
                  />
                )}
                <Box sx={{ padding: 2 }}>
                  {org.type === "annoucement" ? (
                    <CampaignIcon />
                  ) : org.type === "video" ? (
                    <SmartDisplayIcon />
                  ) : org.type === "image" ? (
                    <InsertPhotoIcon />
                  ) : (
                    <SubjectIcon />
                  )}

                  <Typography variant="h6">{org.title}</Typography>
                  <Typography variant="body1">{org.description}</Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 2,
                    }}
                  >
                    <IconButton
                      color="primary"
                      onClick={() => handleEditClick(org)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => openDeleteDialog(org.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">Мэдээлэл байхгүй байна</Typography>
        )}
      </Grid>
      <Dialog open={dialogOpen} onClose={resetAll} fullWidth maxWidth="sm">
        <DialogTitle>{editOrg ? "Засах" : "Мэдээ нэмэх"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Мэдээний төрөл"
            name="type"
            select
            fullWidth
            margin="dense"
            value={formData.type}
            onChange={handleChange}
          >
            {newsType.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Гарчиг"
            name="title"
            fullWidth
            margin="dense"
            value={formData.title}
            onChange={handleChange}
          />
          <TextField
            label="Тайлбар"
            name="description"
            fullWidth
            margin="dense"
            value={formData.description}
            onChange={handleChange}
          />
          {formData.type === "video" ? (
            <TextField
              label="Youtube Link"
              name="imageURL"
              fullWidth
              margin="dense"
              value={formData.imageURL}
              onChange={handleChange}
            />
          ) : (
            <>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="contained"
                    component="span"
                    color="primary"
                    sx={{ mb: 2 }}
                  >
                    Үндсэн зураг оруулах
                  </Button>
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Logo Preview"
                    style={{ width: "100%", height: "auto", marginTop: "8px" }}
                  />
                )}
              </Box>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  id="image-upload"
                />
                <label htmlFor="image-upload">
                  <Button
                    disabled={formData.type === "annoucement"}
                    variant="contained"
                    component="span"
                    color="primary"      
                  >
                    Бусад зураг оруулах
                  </Button>
                </label>
                <Box sx={{ display: "flex", flexWrap: "wrap", marginTop: 2 }}>
                  {imagePreviews.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Image Preview ${index}`}
                      style={{
                        width: "100px",
                        height: "100px",
                        margin: "4px",
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={resetAll} color="secondary">
            Буцах
          </Button>
          <Button onClick={handleSave} color="primary" disabled={uploading}>
            {uploading ? <CircularProgress size={24} /> : "Хадгалах"}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Мэдээ устгах</DialogTitle>
        <DialogContent>
          <Typography>Энэ мэдээг устгахдаа итгэлтэй байна уу?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="secondary">
            Буцах
          </Button>
          <Button
            onClick={() => handleDelete(orgToDelete, imagePreviews)}
            color="primary"
          >
            Устгах
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default News;
