/* eslint-disable react/jsx-pascal-case */
import { useMemo, useState } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  TextField,
  useTheme,
  ThemeProvider,
  createTheme,
  Typography,
  Stack,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { RiFileExcel2Fill } from "react-icons/ri";
import dayjs from "dayjs";
import { doc, deleteDoc } from "firebase/firestore";
import { firestore } from "../../../../refrence/storeConfig";
import { getDocs, collection } from "firebase/firestore";
import TugrikFormatter from "components/TugrikFormatter";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
const csvConfig = mkConfig({
  filename: `Төлбөрийн-түүх-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "phone",
      displayLabel: "Утас",
    },
    {
      key: "inviterPhone",
      displayLabel: "Урсан хүний утас",
    },
    {
      key: "timestamp",
      displayLabel: "Огноо",
    },
  ],
});

// Export CSV data
const exportToExcel = (data) => {
  const columnsToRemove = ["id"];
  // Function to exclude specific columns from the data
  const excludeColumns = (data, columnsToRemove) => {
    return data.map((item) => {
      const newItem = { ...item }; // Create a copy of the item
      columnsToRemove.forEach((column) => delete newItem[column]); // Delete unwanted columns
      return newItem;
    });
  };
  const removedId = excludeColumns(data, columnsToRemove);

  const csv = generateCsv(csvConfig)(removedId);
  download(csvConfig)(csv);
};

const Example = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [searchTerm, setSearchTerm] = useState(""); // User input for search
  const [fetchAll, setFetchAll] = useState(false); // Flag to control data fetching
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers(fetchAll);
  const columns = useMemo(() => [
    { accessorKey: "id", header: "id", size: 80 },
    {
      accessorKey: "phone",
      filterVariant: "autocomplete",
      header: "Утас",
      size: 80,
      enableClickToCopy: true,
    },
    {
      accessorKey: "inviterPhone",
      filterVariant: "autocomplete",
      header: "Урьсан хүний утас",
      size: 80,
      enableClickToCopy: true,
    },

    {
      accessorKey: "timestamp",
      id: "timestamp",
      header: "Огноо",
      filterVariant: "date",
      size: 250,
      sortingFn: "datetime",
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return value
          ? dayjs(value).format("YYYY-MM-DD HH:mm:ss")
          : "Огноо байхгүй";
      },
      filterFn: (row, columnId, filterValue) => {
        const rowValue = dayjs(row.getValue(columnId)).format("YYYY-MM-DD");
        const filterDate = dayjs(filterValue, "MM/DD/YYYY").format(
          "YYYY-MM-DD"
        );
        return rowValue === filterDate;
      },
    },
  ]);
  const {
    mutateAsync: deleteUser, //isPending: isDeletingUser// } =
  } = useDeleteUser();
  //READ hook (get users from api)
  function useGetUsers(fetchAll = true) {
    return useQuery({
      queryKey: ["Members", fetchAll], // Unique key for caching
      queryFn: async () => {
        try {
          if (!fetchAll) return []; // Return empty array if fetchAll is false

          // Reference to the Firestore "statements" collection
          const usersRef = collection(firestore, "inviteFriend");

          // Fetch all documents in the collection
          const querySnapshot = await getDocs(usersRef);

          // Transform the fetched data
          const data = querySnapshot.docs.map((doc) => {
            const timestamp = doc.data().timestamp?.toDate() || null;
            const docData = doc.data();
            return {
              ...docData,
              id: doc.id, // Include the document ID
              timestamp: timestamp ? timestamp.toISOString() : null,
            };
          });

          // Sort the data by tranPostedDate, ensuring proper Date comparison
          data.sort((a, b) => {
            const dateA = a.timestamp ? new Date(a.timestamp) : null;
            const dateB = b.timestamp ? new Date(b.timestamp) : null;
            return dateB - dateA; // Ascending order
          });

          return data; // Return the transformed and sorted data
        } catch (error) {
          console.error("Error fetching users:", error); // Log any errors
          throw new Error("Failed to fetch users"); // Throw an error to propagate failure
        }
      },
      enabled: fetchAll, // Only run the query if fetchAll is true
      refetchOnWindowFocus: true, // Refetch data when the window regains focus
    });
  }
  function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id) => {
        const userRef = doc(firestore, "inviteFriend", id); // Firestore document reference
        await deleteDoc(userRef); // Delete Firestore document
      },
      onMutate: (id) => {
        queryClient.setQueryData(["inviteFriend"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== id)
        );
      },
      onSettled: () => queryClient.invalidateQueries(["inviteFriend"]), // Fix query key
    });
  }

  const openDeleteConfirmModal = async (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(row.original.id); // Await the delete operation
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const renderValidationErrors = (errors) => {
    return Object.entries(errors).map(([key, message]) =>
      message ? (
        <Typography color="error" key={key}>
          {message}
        </Typography>
      ) : null
    );
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: "modal",
    editDisplayMode: "modal",
    enableEditing: true,
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
    getRowId: (row) => row.id,
    muiToolbarAlertBannerProps: isError
      ? { color: "error", children: "Error loading data" }
      : undefined,
    muiTableContainerProps: { sx: { minHeight: "500px" } },
    onCreatingRowCancel: () => setValidationErrors({}),
    onEditingRowCancel: () => setValidationErrors({}),
    renderCreateRowDialogContent: ({ table, row }) => (
      <>
        <DialogTitle variant="h3">Худалдан авалт нэмэх</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {renderValidationErrors(validationErrors)}
          <TextField
            label="ID"
            variant="outlined"
            fullWidth
            value={row.original?.id || ""}
            onChange={(e) =>
              row.table.setRowEditing({ ...row.original, id: e.target.value })
            }
            inputProps={{
              maxLength: 8,
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
          />
          {/* Add more fields here as needed */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">Edit User</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents}
          {renderValidationErrors(validationErrors)}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="text" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip title="Edit">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Button
          variant="contained"
          startIcon={<RiFileExcel2Fill />}
          onClick={() => exportToExcel(fetchedUsers)}
          sx={{ fontSize: "0.8rem" }} // Correct way to set text size
          disabled={!fetchedUsers || fetchedUsers.length === 0}
        >
          Татаж авах
        </Button>
      </Box>
    ),
    initialState: {
      density: "compact",
      columnVisibility: {
        id: false, // Hide the unixTime column by default
      },
    },

    state: {
      isLoading: isLoading,
      showAlertBanner: isError,
    },
  });

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <TextField
          label="ID оруулах"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setFetchAll(false);
            queryClient.invalidateQueries(["promotion"]);
          }}
          variant="filled"
          size="small"
        />
        <Button
          onClick={() => {
            setFetchAll(true); // Fetch all data
            setSearchTerm(""); // Clear search term
            queryClient.invalidateQueries(["Members"]); // Refetch data
          }}
        >
          Бүгд
        </Button>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
};

const queryClient = new QueryClient();

const MemberRegistration = () => {
  const globalTheme = useTheme(); //(optional) if you already have a theme defined in your app root, you can import here
  const tableTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: globalTheme.palette.mode, //let's use the same dark/light mode as the global theme
          primary: globalTheme.palette.secondary, //swap in the secondary color as the primary for the table
          info: {
            main: "rgb(255,122,0)", //add in a custom color for the toolbar alert background stuff
          },
          background: {
            default:
              globalTheme.palette.mode === "light"
                ? "rgb(254,255,244)" //random light yellow color for the background in light mode
                : "#000", //pure black table in dark mode for fun
          },
        },
        typography: {
          button: {
            textTransform: "none", //customize typography styles for all buttons in table by default
            fontSize: "1.2rem",
          },
        },
        components: {
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                fontSize: "1.1rem", //override to make tooltip font size larger
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              thumb: {
                color: "pink", //change the color of the switch thumb in the columns show/hide menu to pink
              },
            },
          },
        },
      }),
    [globalTheme]
  );
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <QueryClientProvider client={queryClient}>
        <Typography color="inherit" variant="h4" align="center">
          Төлбөрийн түүх
        </Typography>
        <Box marginLeft={"2rem"}>
          <ThemeProvider theme={tableTheme}>
            <Example />
          </ThemeProvider>
        </Box>
      </QueryClientProvider>
    </LocalizationProvider>
  );
};

export default MemberRegistration;
