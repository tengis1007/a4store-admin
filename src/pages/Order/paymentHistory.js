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
import { RestaurantMenu } from "@mui/icons-material";
import { getDocs, collection, query, where } from "firebase/firestore";

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
  const { data: fetchedUsers = [], isError, isLoading } = useGetUsers();

  const columns = useMemo(
    () => [
      { accessorKey: "id", header: "id", size: 80 },
      { accessorKey: "lastName", header: "Овог" },
      { accessorKey: "firstName", header: "Нэр" },
      {
        accessorKey: "phone",
        header: "Утас",
        size: 80,
        enableClickToCopy: true,
      },
      {
        accessorKey: "email",
        header: "И-Мэйл хаяг",
        enableClickToCopy: true,
      },
      {
        accessorKey: "isMember",
        header: "Гишүүн", // Use `header` instead of `displayLabel`.
        size: 80,
        Cell: ({ cell }) => {
          const type = cell.getValue();

          if (type) {
            return <span style={{ color: "green" }}>Тийм</span>; // Green for "Yes"
          }
          if (!type) {
            return <span style={{ color: "orange" }}>Үгүй</span>; // Orange for "No"
          }

          return <span style={{ color: "red" }}>Тодорхойгүй</span>; // Red for "Unknown"
        },
      },
      {
        accessorKey: "type",
        header: "Төлөв", // "Status" in Mongolian
        size: 80,
        Cell: ({ cell }) => {
          const type = cell.getValue(); // Get the value of 'Type' (e.g., 'pending', 'success', 'cancel')
          switch (type) {
            case "орлого":
              return <span style={{ color: "green" }}>{type}</span>;
            case "зарлага":
              return <span style={{ color: "orange" }}>{type}</span>;
            default:
              return <span style={{ color: "red" }}>Тодорхойгүй</span>;
          }
        },
      },
      {
        accessorFn: (row) => {
          if (!row.date) return null; // Check if orderDate is null or undefined

          const { seconds, nanoseconds } = row.date;
          return dayjs.unix(seconds).add(nanoseconds / 1000000, "millisecond");
        },
        id: "orderDate",
        header: "Захиалга хийсэн огноо",
        filterVariant: "date",
        filterFn: "lessThan",
        size: 300,
        sortingFn: "datetime",
        Cell: ({ cell }) => {
          const value = cell.getValue();
          return value ? value.format("YYYY-MM-DD HH:mm:ss") : "Огноо байхгүй"; // If value is null, display this text
        },
      },
      { accessorKey: "transactionId", header: "Гүйлгээний дугаар" },

      { accessorKey: "description", header: "Гүйлгээний утга" },
    ],
    []
  );

  console.log("asfd", fetchedUsers);

  //READ hook (get users from api)

  function useGetUsers(searchTerm, fetchAll = true) {
    return useQuery({
      queryKey: ["Members", searchTerm, fetchAll],
      queryFn: async () => {
        try {
          // Fetch all users from Firestore
          if (fetchAll) {
            const usersCollection = collection(firestore, "users"); // Referring to the 'users' collection in Firestore
            const snapshot = await getDocs(usersCollection);
            const usersList = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log("userlist", usersList);
            let outputData = [];
            // Process each user to extract their transaction history
            usersList.forEach((user) => {
              if (user.wallet && user.wallet.transactionHistory) {
                user.wallet.transactionHistory.forEach((transaction) => {
                  outputData.push({
                    ...transaction,
                    id: user.id,
                    lastName: user.lastName,
                    photoURL: user.photoURL,
                    phone: user.phone,
                    isMember: user.isMember,
                    email: user.email,
                    firstName: user.firstName,
                  });
                });
              }
            });
            const sortedData = outputData.sort((a, b) => {
              // Compare based on seconds first
              if (a.date.seconds !== b.date.seconds) {
                return a.date.seconds - b.date.seconds;
              }
              // If seconds are equal, compare nanoseconds
              return a.date.nanoseconds - b.date.nanoseconds;
            });
            return sortedData.reverse(); // Return the processed list of transactions along with user details
          } else if (searchTerm.length === 8) {
            // If search term is a valid phone number, search for users by phone
            const snapshot = await getDocs(
              query(
                collection(firestore, "Members"),
                where("phoneNumber", "==", searchTerm)
              )
            );
            return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          } else {
            return [];
          }
        } catch (error) {
          console.error("Error fetching users:", error);
          throw new Error("Failed to fetch users");
        }
      },
      enabled: fetchAll || Boolean(searchTerm),
      refetchOnWindowFocus: true,
    });
  }

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
          <IconButton>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton>
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
        transactionId: false,
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
          variant="outlined"
          onClick={() => {
            setFetchAll(true); // Fetch all data
            setSearchTerm(""); // Clear search term
            queryClient.invalidateQueries(["promotion"]);
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
      <ThemeProvider theme={tableTheme} >
        <Example />
      </ThemeProvider>
      </Box>
    </QueryClientProvider>

  );
};

export default MemberRegistration;
