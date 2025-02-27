import { useMemo, useState } from "react";
// MRT Imports
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
  CircularProgress,
  ListItemIcon,
  MenuItem,
  Typography,
  lighten,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { DataGrid } from "@mui/x-data-grid";
import * as XLSX from 'xlsx';
import { AccountCircle, Send } from "@mui/icons-material";
// Firestore Imports
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { firestore } from "../../../refrence/storeConfig"; // Adjust the path to your Firestore config
// Date Picker Imports
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import EditIcon from "@mui/icons-material/Edit";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { RiFileExcel2Fill } from "react-icons/ri";
const Example = () => {
  // State to hold the table data
  const [tableData, setTableData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to fetch all data
  const handleFetchAllData = async () => {
    try {
      setIsLoading(true); // Start loading
      setError(null); // Reset error state
      const newData = await fetchDataFromAPI();
      setTableData(newData);
      console.log("Data fetched successfully:", newData);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Simulated API call function
  const fetchDataFromAPI = async () => {
    try {
      // Reference to the "users" collection
      const usersCollection = collection(firestore, "users");
      const querySnapshot = await getDocs(usersCollection);

      // Extract data from the documents and store it in an array
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Document ID
        ...doc.data(), // Document data
      }));

      // Fetch wallet and point data concurrently for all users
      const combinedData = await Promise.all(
        usersData.map(async (user) => {
          const [walletSnapshot, pointSnapshot] = await Promise.all([
            getDocs(collection(firestore, `users/${user.id}/wallet`)),
            getDocs(collection(firestore, `users/${user.id}/point`)),
          ]);

          const walletsData = walletSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const pointsData = pointSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          return {
            ...user,
            wallets: walletsData ?? 0,
            points: pointsData ?? 0,
          };
        })
      );

      return combinedData;
    } catch (error) {
      console.error("Error fetching data from Firestore:", error);
      throw error; // Re-throw the error to handle it in the calling function
    }
  };
  const handleSearch = async (e) => {
    if (e.length === 8) {
      setIsLoading(true);

      try {
        const usersCollection = collection(firestore, "users");
        const q = query(usersCollection, where("phone", "==", e));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setIsLoading(false);
          return null;
        }

        const users = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Fetch wallets and points in parallel
        const combinedData = await Promise.all(
          users.map(async (user) => {
            const userRef = doc(firestore, "users", user.id); // ✅ Corrected this line

            const [walletSnapshot, pointSnapshot] = await Promise.all([
              getDocs(collection(userRef, "wallet")), // ✅ Now correctly referencing the subcollection
              getDocs(collection(userRef, "point")),
            ]);

            return {
              ...user,
              wallets: walletSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
              points: pointSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              })),
            };
          })
        );

        setTableData(combinedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Dynamic columns for wallet and point data

  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "1px solid rgba(51, 46, 46, 0.51)", // Subtle border for the grid
            borderRadius: "8px", // Rounded corners for a modern look
            overflow: "hidden", // Ensures no overflow issues
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Adds depth with a soft shadow
          },
          columnHeaders: {
            // Vibrant blue for headers
             textAlign: "center", // Center-align text
  justifyContent: "center", // Center content horizontally
            fontSize: "14px", // Slightly smaller font for balance
            fontWeight: "bold", // Bold text for emphasis
            borderBottom: "2px solid #1976d2", // Stronger border under headers
            "& .MuiDataGrid-columnHeaderTitle": {
              textTransform: "uppercase", // Uppercase titles for a clean look
              letterSpacing: "0.5px", // Adds spacing between letters
            },
          },
          cell: {
            fontSize: "14px", // Consistent font size
            padding: "12px", // Increased padding for better readability
            borderBottom: "1px solid rgba(224, 224, 224, 0.5)", // Subtle row divider
            "&:nth-of-type(odd)": {
              backgroundColor: "#fafafa", // Light gray for alternating rows
            },
            "&:hover": {
              backgroundColor: "#f0f8ff", // Light blue hover effect for interactivity
            },
          },
          row: {
            "&:hover": {
              backgroundColor: "#e3f2fd", // Soft blue background on row hover
            },
          },
          footerContainer: {
            borderTop: "1px solid rgba(224, 224, 224, 0.5)", // Divider above pagination
            backgroundColor: "#ffffff", // Clean white background for footer
          },
        },
      },
    },
  });

  const columns = useMemo(
    () => [
      {
        id: "employee",
        header: "Хэрэглэгч",
        columns: [
          {
            accessorFn: (row) =>
              `${row.lastName ?? ""} ${row.firstName ?? ""}`.trim(),
            id: "name",
            header: "Овог нэр",
            size: "auto",
            Cell: ({ renderedCellValue }) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{renderedCellValue}</span>
              </Box>
            ),
          },
          {
            accessorKey: "phone",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "Утас",
            size: "auto",
          },
          {
            accessorKey: "email",
            enableClickToCopy: true,
            filterVariant: "autocomplete",
            header: "И-мэйл",
            size: "auto",
          },
          {
            accessorFn: (row) => row.points?.[0]?.balance ?? 0,
            header: "Оноо",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue() ?? 0;
              const formatted = value
                .toFixed(0)
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              return (
                <Box
                  component="span"
                  sx={(theme) => ({
                    backgroundColor:
                      value < 1
                        ? theme.palette.success.dark // No background when value < 1
                        : value >= 200000
                          ? theme.palette.warning.dark // Orange for values >= 200,000
                          : theme.palette.success.dark, // Green for values > 1 and < 200,000
                    borderRadius: "0.25rem",
                    color: "#fff",
                    maxWidth: "9ch",
                    p: "0.25rem",
                  })}
                >
                  {formatted} P
                </Box>
              );
            },
          },
          {
            accessorFn: (row) => row.wallets?.[0]?.balance ?? 0,
            header: "Хэтэвч",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue() ?? 0;
              return (
                <Box
                  component="span"
                  sx={(theme) => ({
                    backgroundColor:
                      value < 1
                        ? theme.palette.success.dark // No background when value < 1
                        : value >= 200000
                          ? theme.palette.warning.dark // Orange for values >= 200,000
                          : theme.palette.success.dark, // Green for values > 1 and < 200,000
                    borderRadius: "0.25rem",
                    color: "#fff",
                    maxWidth: "9ch",
                    p: "0.25rem",
                  })}
                >
                  {value.toLocaleString("MN-mn", {
                    style: "currency",
                    currency: "MNT",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </Box>
              );
            },
          },
          {
            accessorFn: (row) => {
              if (!row.createdAt) return null;
              const { seconds, nanoseconds } = row.createdAt;
              return dayjs
                .unix(seconds)
                .add(nanoseconds / 1000000, "millisecond");
            },
            id: "createdAt",
            header: "Бүргүүлсэн огноо",
            filterVariant: "date",
            filterFn: "lessThan",
            size: "auto",
            sortingFn: "datetime",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value
                ? value.format("YYYY-MM-DD HH:mm:ss")
                : "Огноо байхгүй";
            },
          },
          {
            accessorKey: "isMember",
            filterVariant: "autocomplete",
            header: "Төрөл",
            size: "auto",
            Cell: ({ cell }) => {
              const value = cell.getValue();
              return value ? (
                <span style={{ color: "green" }}>Гишүүн</span>
              ) : (
                <span style={{ color: "orange" }}>Хэрэглэгч</span>
              );
            },
          },
        ],
      },
    ],
    []
  );
  const columnsTransaction = [
    {
      field: "tranAmount",
      headerName: "Мөнгөн дүн",
      width: 150,
      valueFormatter: (params) => {
        console.log("params", params);
        if (params == null) {
          return ""; // Display empty string for null or undefined values
        }
        return params.toLocaleString("mn-MN", {
          style: "currency",
          currency: "MNT",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        });
      },
    },
    {
      field: "type",
      headerName: "Төрөл",
      width: 150,
      renderCell: (params) => {
        const value = params.row.type;
        return (
          <span
            style={{
              color:
                value === "Debit"
                  ? "orange"
                  : value === "Credit"
                    ? "green"
                    : "black",
            }}
          >
            {value === "Debit" ? "Зарлага" : value === "Credit" ? "Орлого" : ""}
          </span>
        );
      },
    },
    {
      field: "date",
      headerName: "Огноо",
      width: "auto",
      valueGetter: (params) => {
        try {
          // Handle missing or invalid row
          if (!params) {
            console.error("Row data is missing or undefined");
            return "N/A";
          }

          // Handle missing or invalid date
          const dateField = params;
          if (!dateField) {
            console.error("Date field is missing or undefined");
            return "N/A";
          }

          console.log("Debugging params.row.date:", dateField); // Log the date field

          // Case 1: Firestore Timestamp
          if (
            dateField &&
            typeof dateField === "object" &&
            typeof dateField.seconds === "number"
          ) {
            const { seconds, nanoseconds } = dateField;
            return dayjs
              .unix(seconds)
              .add(nanoseconds / 1_000_000, "millisecond")
              .format("YYYY-MM-DD HH:mm:ss");
          }

          // Default fallback
          return "N/A";
        } catch (error) {
          console.error("Error processing date:", error);
          return "N/A";
        }
      },
    },
  ];

  const table = useMaterialReactTable({
    columns,
    data: tableData, // Use state-managed data
    enableColumnFilterModes: true,
    enableColumnOrdering: true,
    enableGrouping: true,
    enableColumnPinning: true,
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
    state: {
      isLoading,
      showProgressBars: isLoading,
    },
    renderDetailPanel: ({ row }) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ marginLeft: "90px", height: "auto", width: "28%" }}>
          <DataGrid
            rows={
              row.original.wallets?.[0]?.transactionHistory?.map(
                (transaction, index) => ({
                  ...transaction,
                  id: transaction.statementId || index, // Ensure there's a unique id for each row
                })
              ) || []
            }
            columns={columnsTransaction}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 5,
                },
              },
            }}
            pageSizeOptions={[5]}
          />
        </Box>
      </ThemeProvider>
    ),
    renderRowActionMenuItems: ({ closeMenu }) => [
      <MenuItem
        key={0}
        onClick={() => {
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <EditIcon style={{ color: "blue" }} />
        </ListItemIcon>
        Засах
      </MenuItem>,
      <MenuItem
        key={1}
        onClick={() => {
          closeMenu();
        }}
        sx={{ m: 0 }}
      >
        <ListItemIcon>
          <DeleteIcon style={{ color: "red" }} />
        </ListItemIcon>
        Устгах
      </MenuItem>,
    ],
    renderTopToolbarCustomActions: () => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          variant="outlined"
          placeholder="Хайх..."
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: "0.5rem" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFetchAllData}
            disabled={isLoading}
            sx={{
              // Default button styles
              backgroundColor: "primary.main",
              color: "white",
              "&:hover": {
                // Hover effect styles
                color: "primary.main",
                backgroundColor: "white", // Darker shade of primary color
                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)", // Add a subtle shadow
              },
              "&:disabled": {
                // Disabled state styles
                backgroundColor: "grey.400",
                color: "grey.700",
                cursor: "not-allowed",
              },
            }}
          >
            {isLoading ? <CircularProgress size={24} /> : "Бүгд"}
          </Button>
          <Button
            color="primary"
            disabled={tableData.length < 1}
            startIcon={<RiFileExcel2Fill />}
             onClick={handleExport}
            variant="outlined"
          >
            Татаж авах
          </Button>
        </Box>
      </Box>
    ),
    renderEmptyRowsFallback: () => (
      <Typography variant="body1" align="center">
        {error || (isLoading ? "Loading data..." : "No data available")}
      </Typography>
    ),
  });
  const handleExport = () => {
    // Convert tableData to an array of objects
    const data = tableData.map((user) => ({
      id: user.id,
      lastName: user.lastName,
      firstName:user.firstName,
      email: user.email,
      phone: user.phone,
      walletBalance: user.wallets?.[0]?.balance,
      Points: user.points?.[0]?.balance,
      createdAt: dayjs(
        new Date(user.createdAt.seconds * 1000 + user.createdAt.nanoseconds / 1000000)
      ).format('YYYY-MM-DD HH:mm'), // Convert Firestore Timestamp to Date and format
      isMember: user.isMember,
    }));
    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, 'data.xlsx');
  };
  return <MaterialReactTable table={table} />;
};

// Wrap the component with LocalizationProvider
const ExampleWithLocalizationProvider = () => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <Example />
  </LocalizationProvider>
);

export default ExampleWithLocalizationProvider;
