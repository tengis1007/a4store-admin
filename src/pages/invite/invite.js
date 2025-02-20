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
import * as XLSX from "xlsx";
import { AccountCircle, Send } from "@mui/icons-material";
// Firestore Imports
import { collection, getDocs, query, where, doc } from "firebase/firestore";
import { firestore } from "../../firebase/firebaseConfig"; // Adjust the path to your Firestore config
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
      const inviteRef = collection(firestore, "inviteFriend");
      const querySnapshot = await getDocs(inviteRef);

      const combinedData = querySnapshot.docs.map((doc) => {
        const data = doc.data();

        // Convert Firestore timestamps to ISO strings
        Object.keys(data).forEach((key) => {
          if (data[key] instanceof Object && data[key].toDate) {
            data[key] = data[key].toDate().toISOString();
          }
        });

        return { id: doc.id, ...data };
      });

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
        const usersCollection = collection(firestore, "inviteFriend");
        const q = query(usersCollection, where("phone", "==", e));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setIsLoading(false);
          return null;
        }

        const combinedData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTableData(combinedData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  // Dynamic columns for wallet and point data

  const columns = useMemo(
    () => [
      {
        accessorKey: "inviterPhone", //access nested data with dot notation
        header: "Уригчийн утас",
        size: 150,
        Cell: ({ cell }) => cell.getValue() || "",
      },
      {
        accessorKey: "phone",
        header: "Уригдагчийн утас",
        size: 150,
      },
      {
        accessorKey: "timestamp", //normal accessorKey
        header: "Огноо",
        size: 200,
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value
            ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
            : "Огноо байхгүй";
        },
      },
    ],
    []
  );

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
    const data = tableData.map((value) => ({
      id: value.id,
      "Уригчийн утас": value.inviterPhone || "", // Ensure empty values for undefined
      "Уригдагчийн утас": value.phone || "",
      Огноо: value.timestamp ? new Date(value.timestamp).toLocaleString() : "", // Convert Firestore Timestamp to Date
    }));

    // Convert the data to a worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Ensure the date column is recognized as a date by Excel
    const dateCol = XLSX.utils.decode_col("C"); // Assuming "Огноо" is the 3rd column
    worksheet["!cols"] = [{ wch: 15 }, { wch: 15 }, { wch: 20 }]; // Adjust column width

    // Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Export the workbook as an Excel file
    XLSX.writeFile(workbook, "Урилтын мэдээлэл.xlsx");
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
