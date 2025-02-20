import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid2,
  CardActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const ProductCard = ({ product, onEdit, onDelete }) => {
  // Handle delete action
  const handleDelete = () => {
    if (onDelete) {
      onDelete(product); // Pass product to delete handler
    }
  };
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  console.log(product);
  return (
<Grid2 size={{ xs: 12, sm: 4, md: 5, lg: 2 }}>
      <Card
        sx={{
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
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
            height: "200px",
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
            width: "100%",
            padding: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              whiteSpace: "nowrap", // Prevent wrapping
              overflow: "hidden", // Hide overflowed text
              textOverflow: "ellipsis", // Add ellipsis when text is too long
              display: "block", // Ensure the element behaves like a block-level element
              width: "100%", // Ensure it has a width to work with
              textAlign: "center",
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
  );
};

export default ProductCard;
