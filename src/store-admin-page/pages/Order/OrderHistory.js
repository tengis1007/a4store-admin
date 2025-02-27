import React, { useMemo, useEffect, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
} from "material-react-table";

// Material UI Imports
import {
  Box,
  Button,
  ListItemIcon,
  MenuItem,
  Typography,
  lighten,
  Card,
  CardContent,
  Grid2,
  CardMedia,
  Paper,
} from "@mui/material";
import { AccountCircle, Send } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
// Firebase Imports
import { firestore } from "../../../refrence/storeConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
// Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import DeleteOrderHistory from "./DeleteOrderHistory";
const Example = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);

  useEffect(() => {
    fetchOrdersWithUserDetails();
  }, [isFetching]);
  const fetchOrdersWithUserDetails = async () => {
    try {
      const ordersCollection = collection(firestore, "orders");
      const snapshot = await getDocs(ordersCollection);

      const ordersList = await Promise.all(
        snapshot.docs.map(async (orderDoc) => {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };

          if (orderData.userId) {
            const userRef = doc(firestore, "users", orderData.userId);
            const userSnap = await getDoc(userRef);
            orderData.userDetails = userSnap.exists()
              ? {
                  firstName: userSnap.data().firstName,
                  lastName: userSnap.data().lastName,
                  phone: userSnap.data().phone,
                  isMember: userSnap.data().isMember,
                  email: userSnap.data().email,
                }
              : null;
          }

          return orderData;
        })
      );

      const sortedData = ordersList.sort((a, b) => {
        // Compare based on seconds first
        if (a.deliveryDate.seconds !== b.deliveryDate.seconds) {
          return a.deliveryDate.seconds - b.deliveryDate.seconds;
        }
        // If seconds are equal, compare nanoseconds
        return a.deliveryDate.nanoseconds - b.deliveryDate.nanoseconds;
      });

      setData(sortedData.reverse());
    } catch (error) {
      console.error("Error fetching orders or user details:", error);
    } finally {
      setIsFetching(false); // Update isFetching to false after data is fetched
      setIsLoading(false); // Update isLoading to false after loading is complete
    }
  };
  const handleSave = () => {
    setIsFetching(true);
  };

  const deleteOpenDialogHandler = (order) => {
    setDeleteOrder(order);
    setDeleteDialog(true);
    console.log("Dialog Opened: ", order, deleteDialog);
  };
  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Захиалгын түүх",
        columns: [
          {
            accessorFn: (row) =>
              `${row.userDetails?.lastName ?? ""} ${
                row.userDetails?.firstName ?? ""
              }`.trim(),
            id: "name",
            header: "Овог нэр",
            size: 250,
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: "userDetails.phone",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Утас",
            size: 150,
          },
          {
            accessorKey: "totalAmount",
            header: "Нийт дүн",
            size: 200,
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor:
                    cell.getValue() < 100
                      ? theme.palette.error.dark
                      : cell.getValue() >= 500000 && cell.getValue() < 1500000
                        ? theme.palette.warning.dark
                        : theme.palette.success.dark,
                  borderRadius: "0.25rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                })}
              >
                {cell.getValue()?.toLocaleString("MN-mn", {
                  style: "currency",
                  currency: "MNT",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </Box>
            ),
          },
          {
            accessorFn: (row) => {
              if (!row.orderDate) return null; // Check if orderDate is null or undefined

              const { seconds, nanoseconds } = row.orderDate;
              return dayjs
                .unix(seconds)
                .add(nanoseconds / 1000000, "millisecond");
            },
            id: "orderDate",
            header: "Захиалга хийсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            size: 300,
            sortingFn: "datetime",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value
                ? value.format("YYYY-MM-DD HH:mm:ss")
                : "Огноо байхгүй"; // If value is null, display this text
            },
          },
          {
            accessorKey: "paymentMethod",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Төлбөрийн хэрэгсэл",
            size: 50,
          },
          {
            accessorKey: "status",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Хүргэлтийн төлөв",
            size: 100,
          },
        ],
      },
    ],
    [isFetching]
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: false,
    enableColumnOrdering: false,
    enableGrouping: false,
    enableColumnPinning: false,
    enableFacetedValues: false,
    enableRowActions: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,

      columnPinning: {
        right: ["mrt-row-expand", "mrt-row-select"],
        left: ["mrt-row-actions"],
      },
    },
    state: {
      isLoading,
      showProgressBars: isFetching,
    },
    paginationDisplayMode: "pages",
    positionToolbarAlertBanner: "bottom",
    muiSearchTextFieldProps: {
      size: "small",
      variant: "outlined",
    },
    muiPaginationProps: {
      color: "secondary",
      rowsPerPageOptions: [10, 20, 30],
      shape: "rounded",
      variant: "outlined",
    },
    renderDetailPanel: ({ row }) => {
      // Access the products array from the row's original data
      const products = row?.original?.products;

      // Check if products exist and are an array
      if (!Array.isArray(products) || products.length === 0) {
        return (
          <Typography variant="body2" color="textSecondary" align="center">
            No products available.
          </Typography>
        );
      }
      const rows = [row.original.shippingAddress];
      return (
        <>
          <Typography
            variant="h5"
            gutterBottom
            color="primary"
            marginLeft={12}
            fontWeight="bold"
          >
            Бүтээгдэхүүн
          </Typography>
          <Grid2 container spacing={35} sx={{ marginLeft: 12 }}>
            {products.map((product) => {
              const thumbnails = product.imgs?.thumbnails;

              // Ensure that product images exist
              if (!thumbnails || thumbnails.length === 0) {
                return null;
              }

              return (
                <Grid2 size={{ xs: 1, sm: 1, md: 1 }} key={product.id}>
                  {" "}
                  {/* Each product in a grid item */}
                  <Card
                    sx={{
                      width: 250,
                      boxShadow: 3,
                      borderRadius: 2,
                      height: "18rem",
                      transition: "transform 0.3s ease-in-out",
                      "&:hover": {
                        transform: "scale(1.05)",
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="40%"
                      image={thumbnails[0]} // Show first thumbnail
                      alt={product.title}
                      sx={{
                        objectFit: "cover",
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                      }}
                    />
                    <CardContent sx={{ paddingBottom: 2 }}>
                      <Typography
                        variant="body3"
                        fontWeight="bold"
                        color="text.primary"
                      >
                        {product.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginBottom: 1 }}
                      >
                        <strong>Үнэ:</strong> {product.price.toLocaleString()}{" "}
                        MNT
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ marginBottom: 1 }}
                      >
                        <strong>Хямдарсан үнэ:</strong>{" "}
                        {product.discountedPrice.toLocaleString()} MNT
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Тоо ширхэг:</strong> {product.quantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid2>
              );
            })}
          </Grid2>
          <Typography
            variant="h5"
            gutterBottom
            color="primary"
            marginLeft={12}
            marginTop={3}
            fontWeight="bold"
          >
            Хүргэлтийн мэдээлэл
          </Typography>
          <Grid2 container spacing={2} sx={{ marginLeft: 12 }}>
            {rows && rows.length > 0 ? (
              rows.map((row, index) => (
                <Grid2 item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ maxWidth: 345 }}>
                    <CardContent>
                      <Grid2 container spacing={2}>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Хот/Аймаг:</strong> {row.aimag}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Дүүрэг/Сум:</strong> {row.sum}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Баг/Хороо:</strong> {row.bag}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Гэрийн хаяг:</strong> {row.address}
                          </Typography>
                        </Grid2>

                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Дэлгэрэнгүй хаяг:</strong> {row.fullAddress}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Холбоо барих дугаар:</strong> {row.phone}
                          </Typography>
                        </Grid2>
                        <Grid2 item xs={12} sm={6}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>И-Мэйл хаяг:</strong> {row.email}
                          </Typography>
                        </Grid2>
                      </Grid2>
                    </CardContent>
                  </Card>
                </Grid2>
              ))
            ) : (
              <Grid2 item xs={12}>
                <Paper sx={{ padding: 2, textAlign: "center" }}>
                  <Typography variant="h6" color="text.secondary">
                    No data available
                  </Typography>
                </Paper>
              </Grid2>
            )}
          </Grid2>
        </>
      );
    },
    renderRowActionMenuItems: ({ row }) => [
      <MenuItem key={0}>
        <ListItemIcon>
          <AccountCircle />
        </ListItemIcon>
        Засах
      </MenuItem>,
      <MenuItem key={1} onClick={() => deleteOpenDialogHandler(row.original)}>
        <ListItemIcon>
          <DeleteIcon sx={{ color: "red" }} />
        </ListItemIcon>
        Устгах
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      const handleDeactivate = () => {
        table
          .getSelectedRowModel()
          .flatRows.forEach((row) =>
            alert("Deactivating " + row.getValue("name"))
          );
      };

      const handleActivate = () => {
        table
          .getSelectedRowModel()
          .flatRows.forEach((row) =>
            alert("Activating " + row.getValue("name"))
          );
      };

      const handleContact = () => {
        table
          .getSelectedRowModel()
          .flatRows.forEach((row) => alert("Contact " + row.getValue("name")));
      };

      return (
        <>
          <Box
            sx={(theme) => ({
              backgroundColor: lighten(theme.palette.background.default, 0.05),
              display: "flex",
              gap: "0.5rem",
              p: "8px",
              justifyContent: "space-between",
            })}
          >
            <Box sx={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <MRT_GlobalFilterTextField table={table} />
              <MRT_ToggleFiltersButton table={table} />
            </Box>
            <Box sx={{ display: "flex", gap: "0.5rem" }}>
              <Button
                color="error"
                disabled={!table.getIsSomeRowsSelected()}
                onClick={handleDeactivate}
                variant="contained"
              >
                Deactivate
              </Button>
              <Button
                color="success"
                disabled={!table.getIsSomeRowsSelected()}
                onClick={handleActivate}
                variant="contained"
              >
                Activate
              </Button>
              <Button
                color="info"
                disabled={!table.getIsSomeRowsSelected()}
                onClick={handleContact}
                variant="contained"
              >
                Contact
              </Button>
            </Box>
          </Box>
          {deleteDialog && (
            <DeleteOrderHistory
              order={deleteOrder}
              onClose={() => setDeleteDialog(false)}
              onSave={handleSave} // Pass the function reference directly, without parentheses
            />
          )}
          
        </>
      );
    },
  });
  console.log("deleteDialog", deleteDialog);
  return <MaterialReactTable table={table} />;
};

const ExampleWithLocalizationProvider = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Example />
  </LocalizationProvider>
);

export default ExampleWithLocalizationProvider;
