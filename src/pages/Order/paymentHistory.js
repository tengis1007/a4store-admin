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
import { firestore } from "../../firebase/firebaseConfig";
import { getDocs, collection, query, where } from "firebase/firestore";
import relativeTime from "dayjs/plugin/relativeTime";
const csvConfig = mkConfig({
  filename: `Гишүүд-${dayjs().format("YYYY-MM-DD HH:mm:ss")}`,
  fieldSeparator: ",",
  decimalSeparator: ".",
  columnHeaders: [
    {
      key: "lastName",
      displayLabel: "Овог",
    },
    {
      key: "firstName",
      displayLabel: "Нэр",
    },
    {
      key: "phoneNumber",
      displayLabel: "ID",
    },
    {
      key: "bankName",
      displayLabel: "Банкны нэр",
    },
    {
      key: "accountNumber",
      displayLabel: "Дансны дугаар",
    },
    {
      key: "registrationNumber",
      displayLabel: "Регистрийн дугаар",
    },
    {
      key: "province",
      displayLabel: "Оршин сугаа хаяг",
    },
    {
      key: "centerName",
      displayLabel: "Төвийн нэр",
    },
  ],
});

// Validation functions
const validateRequired = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validatePhone = (phone) => {
  const re = /^(\d{4})[- ]?(\d{4})$/;
  return re.test(phone);
};
function validateUser(user) {
  return {
    lastName: !validateRequired(user.lastName)
      ? "Овог нэр хоосон байж болохгүй"
      : "",
    firstName: !validateRequired(user.firstName)
      ? "Нэр хоосон байж болохгүй"
      : "",
    phoneNumber: !validatePhone(user.phoneNumber)
      ? "Утасны дугаар зөв форматтай байх ёстой"
      : "",
    bankName: !validateRequired(user.bankName)
      ? "Банк нэр хоосон байж болохгүй"
      : "",
    // accountNumber: !validateRequired(user.accountNumber) ? "Дансны дугаар хоосон байж болохгүй" : "",
    registrationNumber: !validateRequired(user.registrationNumber)
      ? "Регистрийн дугаар хоосон байж болохгүй"
      : "",
    province: !validateRequired(user.province)
      ? "Оршин сугаа хаяг хоосон байж болохгүй"
      : "",
    centerName: !validateRequired(user.centerName)
      ? "Center Name хоосон байж болохгүй"
      : "",
  };
}
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
  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", size: 80 },
      {
        accessorKey: "phone",
        header: "Утас",
        size: 80,
        enableClickToCopy: true,
      },
      {
        accessorKey: "tranAmount",
        header: "Мөнгөн дүн",
      },
      {
        accessorKey: "statementId",
        header: "Statement Id",
      },
      {
        accessorKey: "tranDesc",
        header: "Гүйлгээний утга",
      },
      {
        accessorKey: "tranDescEdit",
        header: "Зассан гүйлгээний утга",
      },
      {
        accessorKey: "type",
        header: "Төрөл", // Use `header` instead of `displayLabel`.
        size: 80,
        Cell: ({ cell }) => {
          const type = cell.getValue();

          if (type === "Credit") {
            return <span style={{ color: "green" }}>Орлого</span>; // Green for "Yes"
          }
          if (type === "Debit") {
            return <span style={{ color: "orange" }}>Зарлага</span>; // Orange for "No"
          }
          return <span style={{ color: "red" }}>Тодорхойгүй</span>; // Red for "Unknown"
        },
      },
      {
        id: "tranPostedDate",
        accessorKey: "tranPostedDate",
        header: "Огноо",
        filterVariant: "date",
        filterFn: "lessThan",
        size: 300,
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          const date = new Date(value);
          const formattedDate =
            date.toISOString().split("T")[0] +
            " " +
            date.toTimeString().slice(0, 5);
          return formattedDate;
        },
      },
    ],
    []
  );
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
  useDeleteUser();
  //READ hook (get users from api)
  function useGetUsers(fetchAll = true) {
    return useQuery({
      queryKey: ["Members", fetchAll], // Unique key for caching
      queryFn: async () => {
        try {
          if (!fetchAll) return []; // Return empty array if fetchAll is false

          // Reference to the Firestore "statements" collection
          const usersRef = collection(firestore, "statements");

          // Fetch all documents in the collection
          const querySnapshot = await getDocs(usersRef);

          // Transform the fetched data
          const data = querySnapshot.docs.map((doc) => {
            const timestamp = doc.data().tranPostedDate?.toDate() || null;
            const docData = doc.data();
            return {
              ...docData,
              id: doc.id, // Include the document ID
              tranPostedDate: timestamp ? timestamp.toISOString() : null,
            };
          });

          // Sort the data by tranPostedDate, ensuring proper Date comparison
          data.sort((a, b) => {
            const dateA = a.tranPostedDate ? new Date(a.tranPostedDate) : null;
            const dateB = b.tranPostedDate ? new Date(b.tranPostedDate) : null;
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
        const userRef = doc(firestore, "statements", id); // Firestore document reference
        await deleteDoc(userRef); // Delete Firestore document
      },
      onMutate: (id) => {
        queryClient.setQueryData(["statements"], (prevUsers) =>
          prevUsers?.filter((user) => user.id !== id)
        );
      },
      onSettled: () => queryClient.invalidateQueries(["statements"]), // Fix query key
    });
  }
  
  const openDeleteConfirmModal = async (row) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(row.original.id); // Await the delete operation
        console.log("User deleted successfully");
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
        >
          Татаж авах
        </Button>
      </Box>
    ),
    initialState: {
      columnVisibility: {
        id: false, // Hide the unixTime column by default
        statementId: false,
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
  );
};

export default MemberRegistration;
