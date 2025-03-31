import React, { useMemo, useEffect, useState } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
  MRT_GlobalFilterTextField as GlobalFilterTextField,
  MRT_ToggleFiltersButton as ToggleFiltersButton,
  MRT_ShowHideColumnsButton as ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton as ToggleDensePaddingButton,
  MRT_ToggleFullScreenButton as ToggleFullScreenButton,
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
  Stack,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/Inbox";
// Firebase Imports
import { firestore } from "../../../refrence/storeConfig";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import DeleteIcon from "@mui/icons-material/Delete";
// Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import DeleteOrderHistory from "./DeleteOrderHistory";
import ReceivedOrder from "./receivedOrder";
import TugrikFormatter from "components/TugrikFormatter";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { mkConfig, generateCsv } from "export-to-csv";
const Example = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteOrder, setDeleteOrder] = useState(null);
  const [receivedDialog, setReceivedDialog] = useState(false);
const [dataLength , setDataLenght] = useState(0);
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
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });
  const deleteOpenDialogHandler = (order) => {
    setDeleteOrder(order);
    setDeleteDialog(true);
  };

  const receivedDialogHandler = (order) => {
    setDeleteOrder(order);
    setReceivedDialog(true);
  };
  const TotalOrderPrice = useMemo(
    () =>
      data.reduce(
        (totalAmount, currentAmount) => totalAmount + currentAmount.totalAmount,
        0
      ),
    [data]
  );
  setDataLenght(data.length+1);
  const TotalPoint = useMemo(() => {
    const filteredRows = data.filter(
      (row) =>
        row.paidPoint !== "" && row.paidPoint !== 0 && row.paidMNT !== "" && row.paidMNT !== 0
    );
    const filterPoint = filteredRows.reduce(
      (paidPoint, currentAmount) => paidPoint + Number(currentAmount.paidPoint),
      0
    );
    console.log("filterPoint",filterPoint);
    console.log("filteredRows",filteredRows);
    const filteredData = data.filter((item) => item.paymentMethod === "point");
    return (
      filteredData.reduce(
        (totalAmount, currentAmount) =>
          totalAmount + Number(currentAmount.totalAmount),
        0
      ) + filterPoint
    );
  }, [data]);
  const TotalMNT = useMemo(() => {
    const filteredData = data.filter((item) => item.paymentMethod !== "point");
    return filteredData.reduce(
      (paidMNT, currentAmount) => paidMNT + Number(currentAmount.paidMNT),
      0
    );
  }, [data]);
  const TotaldeliveryCount = useMemo(
    () => {
      const filterData = data.filter((item) => item.received === false);
      const realData = filterData.filter((item) => item.delivery === true).length;
      return realData;
    },
    [data]
  );
  const TotalreceivedCount = useMemo(
    () => data.filter((item) => item.received === true).length,
    [data]
  );
  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Захиалгын түүх",
        columns: [
          {
            accessorKey: "id",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "ID",
            size: 150,
          },
          {
            accessorKey: "userId",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "userId",
            size: 150,
          },
          {
            accessorFn: (row) =>
              `${row.userDetails?.lastName ?? ""} ${
                row.userDetails?.firstName ?? ""
              }`.trim(),
            id: "name",
            header: "Овог нэр",
            size: 250,
            filterVariant: "autocomplete",
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
            Footer: () => (
              <Stack>
                Нийт Захиалга:
                <Box color="warning.main">
                  {TugrikFormatter(dataLength)}
                </Box>
              </Stack>
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
            size: 50,
            filterVariant: "range-slider",
            filterFn: "betweenInclusive",
            meta: {
              type: "number", // Хэрвээ танд type declaration хэрэгтэй бол
            },
            muiFilterSliderProps: {
              marks: true,
              max: 3000000, // Custom max value
              min: 20000, // Custom min value
              step: 20_000, // Step size
              valueLabelFormat: (value) => {
                const format = TugrikFormatter(value);
                return format;
              },
            },
            Cell: ({ cell }) => (
              <Box
                component="span"
                sx={(theme) => ({
                  backgroundColor:
                    cell.getValue() < 500000
                      ? theme.palette.success.dark
                      : cell.getValue() >= 500000 && cell.getValue() < 1500000
                        ? theme.palette.warning.dark
                        : theme.palette.error.dark,
                  borderRadius: "0.25rem",
                  color: "#fff",
                  maxWidth: "9ch",
                  p: "0.25rem",
                })}
              >
                <Box component="span">{TugrikFormatter(cell.getValue())}</Box>
              </Box>
            ),
            Footer: () => (
              <Stack>
                Нийт дүн:
                <Box color="warning.main">
                  {TugrikFormatter(Math.round(TotalOrderPrice))}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "paidPoint",
            header: "Оноо",
            filterVariant: "range-slider",
            filterFn: "betweenInclusive",
            muiFilterSliderProps: {
              marks: true,
              max: 3000000, // Custom max value
              min: 20000, // Custom min value
              step: 20_000, // Step size
              valueLabelFormat: (value) => {
                const format = `${TugrikFormatter(value)}P`;
                return format;
              },
            },
            size: 50,
            Cell: ({ cell }) => (
              <Box component="span">{TugrikFormatter(cell.getValue())}P</Box>
            ),
            meta: {
              type: "number", // Хэрвээ танд type declaration хэрэгтэй бол
            },
            Footer: () => (
              <Stack>
                Нийт оноо:
                <Box color="warning.main">
                  {TugrikFormatter(Math.round(TotalPoint))}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "paidMNT",
            header: "Мөнгөн дүн",
            filterVariant: "range-slider",
            filterFn: "betweenInclusive",
            muiFilterSliderProps: {
              marks: true,
              max: 3000000, // Custom max value
              min: 20000, // Custom min value
              step: 20_000, // Step size
              valueLabelFormat: (value) =>
                value.toLocaleString("mn-MN", {
                  // Use Mongolian locale
                  style: "currency",
                  currency: "MNT", // Mongolian Tugrik
                }),
            },
            size: 50,
            Cell: ({ cell }) => (
              <Box component="span">{TugrikFormatter(cell.getValue())}₮</Box>
            ),
            meta: {
              type: "number", // Хэрвээ танд type declaration хэрэгтэй бол
            },
            Footer: () => (
              <Stack>
                Нийт мөнгөн дүн:
                <Box color="warning.main">
                  {TugrikFormatter(Math.round(TotalMNT))}
                </Box>
              </Stack>
            ),
          },

          {
            accessorFn: (row) => {
              if (!row.orderDate) return null; // Check if orderDate is null or undefined

              const { seconds, nanoseconds } = row.orderDate;
              // Convert to a standard JavaScript Date object
              return new Date(seconds * 1000 + nanoseconds / 1000000);
            },
            id: "orderDate",
            header: "Захиалга хийсэн огноо",
            filterVariant: "date-range",
            size: 250,
            sortingFn: "datetime",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              // Format the Date object using dayjs for display
              return value
                ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
                : "Огноо байхгүй"; // If value is null, display this text
            },
          },
          {
            header: "Төлбөр",

            accessorFn: (row) => {
              if (row.paidPoint) return row.paidPoint;
              return "-";
            },
            filterVariant: "select",
            size: 50,
            Cell: ({ row }) => {
              const method = row.original.paymentMethod;
              let label = "";
              if (method === "wallet") {
                if (
                  row.original.paidPoint === "" ||
                  row.original.paidPoint === 0
                  
                ) {
                  label = "Мөнгө";
                } else if (
                  row.original.paidMNT === "" ||
                  row.original.paidMNT === 0
                ) {
                  label = "Оноо";
                } else {
                  label = "Хосолсон";
                }
              } else if (method === "point") {
                label = "Оноо";
              } else {
                label = "Алдаатай";
              }

              return <Box component="span">{label}</Box>;
            },
            // Add filter options and logic
            filterSelectOptions: ["Мөнгө", "Оноо", "Хосолсон", "Алдаатай"],
            filterFn: (row, columnId, filterValue) => {
              const method = row.original.paymentMethod;
              let label = "";

              if (method === "wallet") {
                if (
                  row.original.paidPoint === "" ||
                  row.original.paidPoint === 0
                ) {
                  label = "Мөнгө";
                } else if (
                  row.original.paidMNT === "" ||
                  row.original.paidMNT === 0
                ) {
                  label = "Оноо";
                } else {
                  label = "Хосолсон";
                }
              } else if (method === "point") {
                label = "Оноо";
              } else {
                label = "Алдаатай";
              }

              // Compare the computed label with the selected filter value
              return filterValue === undefined || label === filterValue;
            },
          },
          {
            accessorKey: "received",
            filterVariant: "select",
            header: "Хүлээн авсан",
            width: 10,
            filterSelectOptions: [
              { label: "Тийм", value: "true" },
              { label: "Үгүй", value: "false" },
            ],
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value ? (
                <span style={{ color: "green" }}>Тийм</span>
              ) : (
                <span style={{ color: "orange" }}>Үгүй</span>
              );
            },
            Footer: () => (
              <Stack>
                Бараа аваагүй нийт:
                <Box color="warning.main">
                  {TugrikFormatter(Math.round(TotalreceivedCount))}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "delivery",
            filterVariant: "select",
            filterSelectOptions: [
              { label: "Ирж авна", value: "false" },
              { label: "Хүргэлттэй", value: "true" },
            ],
            header: "Хүргэлт",
            size: 150,
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value ? (
                <span style={{ color: "red" }}>Хүргэлттэй</span>
              ) : (
                <span style={{ color: "green" }}>Ирж авна</span>
              );
            },
            Footer: () => (
              <Stack>
                Хүргэлт хийгдээгүй:
                <Box color="warning.main">
                  {TugrikFormatter(Math.round(TotaldeliveryCount))}
                </Box>
              </Stack>
            ),
          },
          {
            accessorKey: "deliveryCost",
            header: "Хүргэлтийн төлбөр",
            filterVariant: "range-slider",
            filterFn: "betweenInclusive",
            muiFilterSliderProps: {
              marks: true,
              max: 3000000, // Custom max value
              min: 20000, // Custom min value
              step: 20_000, // Step size
              valueLabelFormat: (value) => {
                const format = `${TugrikFormatter(value)}P`;
                return format;
              },
            },
          },
        ],
      },
    ],
    [TotalMNT,TotalOrderPrice,TotalPoint,TotaldeliveryCount,TotalreceivedCount,dataLength]
  );

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilterModes: false,
    enableColumnOrdering: false,
    enableGrouping: false,
    enableColumnPinning: false,
    enableFacetedValues: true,
    enableRowActions: true,
    enableRowSelection: false,
    initialState: {
      showColumnFilters: false,
      showGlobalFilter: false,
      columnPinning: {
        right: ["mrt-row-expand", "mrt-row-select"],
        left: ["mrt-row-actions"],
      },
      density: "compact",
      columnVisibility: {
        id: false,
        userId: false,
        deliveryCost: false,
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
      color: "primary",
      rowsPerPageOptions: [10, 50, 100, 200],
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
                    <Box
                      sx={{
                        height: "40%",
                        minHeight: "120px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "grey.200",
                        borderTopLeftRadius: 2,
                        borderTopRightRadius: 2,
                      }}
                    >
                      {thumbnails[0] ? (
                        <CardMedia
                          component="img"
                          image={thumbnails[0]}
                          alt={product.title}
                          sx={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No Image Available
                        </Typography>
                      )}
                    </Box>
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
                        <strong>Оноо:</strong>{" "}
                        {product.discountedPrice.toLocaleString()} P
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
      <MenuItem key={0} onClick={() => receivedDialogHandler(row.original)}>
        <ListItemIcon>
          <InboxIcon sx={{ color: "green" }} />
        </ListItemIcon>
        Хүлээн авсан
      </MenuItem>,
      <MenuItem key={1} onClick={() => deleteOpenDialogHandler(row.original)}>
        <ListItemIcon>
          <DeleteIcon sx={{ color: "red" }} />
        </ListItemIcon>
        Устгах
      </MenuItem>,
    ],
    renderTopToolbar: ({ table }) => {
      const formattedData = data.map((item) => ({
        "Овог нэр":
          `${item.userDetails?.lastName ?? ""} ${item.userDetails?.firstName ?? ""}`.trim(),
        Утас: item.userDetails?.phone ?? "",
        "Нийт дүн": item.totalAmount ?? 0,
        Оноо: item.paidPoint ?? 0,
        "Мөнгөн дүн": item.paidMNT ?? 0,
        "Захиалга хийсэн огноо": (() => {
          if (!item?.orderDate?.seconds) return "Огноо байхгүй";
          const milliseconds =
            item.orderDate.seconds * 1000 +
            Math.floor(item.orderDate.nanoseconds / 1e6);

          const date = dayjs(milliseconds);
          const values = date.isValid()
            ? date.format("YYYY-MM-DD HH:mm:ss")
            : "Invalid date";

          return values;
        })(),
        Хүргэлт: item.delivery ? "Хүргэлттэй" : "Ирж авна",
        "Хүлээн авсан": item.received ? "Тийм" : "Үгүй",
        paymentMethod: (() => {
          if (item.paymentMethod === "wallet") {
            if (!item.paidPoint || item.paidPoint === 0) return "Мөнгө";
            if (!item.paidMNT || item.paidMNT === 0) return "Оноо";
            return "Хосолсон";
          }
          return item.paymentMethod === "point" ? "Оноо" : "Алдаатай";
        })(),
      }));
      // Use formattedData for CSV export
      const handleExportData = () => {
        try {
          // Generate the CSV data
          const csv = generateCsv(csvConfig)(formattedData);

          // Get the current date in YYYY-MM-DD format
          const currentDate = new Date().toISOString().split("T")[0];

          // Create the filename with the current date
          const filename = `Захиалгын-түүх-${currentDate}.csv`;

          // Log the CSV and filename for debugging

          // Create a link element to trigger the download
          const link = document.createElement("a");
          link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
          link.target = "_blank";
          link.download = filename; // Dynamically set the filename

          // Trigger the download by simulating a click
          link.click();
        } catch (error) {
          // Log the error if something fails
          console.error("Error exporting data:", error);
        }
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
              <GlobalFilterTextField table={table} />
              <ToggleFiltersButton table={table} />
              <ShowHideColumnsButton table={table} />
              <ToggleDensePaddingButton table={table} />
              <ToggleFullScreenButton table={table} />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: "16px",
                padding: "8px",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                disabled={!formattedData || formattedData.length === 0}
              >
                Татаж авах
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
          {receivedDialog && (
            <ReceivedOrder
              order={deleteOrder}
              onClose={() => setReceivedDialog(false)}
              onSave={handleSave} // Pass the function reference directly, without parentheses
            />
          )}
        </>
      );
    },
  });
  return <MaterialReactTable table={table} />;
};

const ExampleWithLocalizationProvider = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Example />
  </LocalizationProvider>
);

export default ExampleWithLocalizationProvider;
